/**
 * Client-side SketchUp (.skp) binary parser.
 * Reads the OLE2/CFB container, extracts the model stream, scans for face geometry,
 * builds a Three.js Group, and exports it as a GLB blob URL — no server required.
 *
 * Coordinate system: SKP stores X=East, Y=North, Z=Up in inches.
 * Three.js uses X=right, Y=up, Z=toward-camera.
 * Mapping: THREE_X = SKP_X * IN_TO_M, THREE_Y = SKP_Z * IN_TO_M, THREE_Z = -SKP_Y * IN_TO_M
 */

import * as THREE from 'three';

// ─── OLE2 / CFB constants ──────────────────────────────────────────────────

const OLE2_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ENDOFCHAIN = 0xfffffffe >>> 0;
const FREESECT   = 0xffffffff >>> 0;
const FATSECT    = 0xfffffffd >>> 0;
const IN_TO_M    = 0.0254; // inches → metres

export interface SKPResult {
  group: THREE.Group;
  faceCount: number;
  vertexCount: number;
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function parseSKPFile(file: File): Promise<SKPResult> {
  const buf = await file.arrayBuffer();
  return parseSKP(buf);
}

/** Parse SKP, convert geometry to GLB, return a blob: URL the CustomModel component can load. */
export async function skpFileToGLBUrl(file: File): Promise<string> {
  const { group } = await parseSKPFile(file);
  return groupToGLBUrl(group);
}

async function groupToGLBUrl(group: THREE.Group): Promise<string> {
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
  return new Promise<string>((resolve, reject) => {
    new GLTFExporter().parse(
      group,
      (glb) => {
        const blob = new Blob([glb as ArrayBuffer], { type: 'model/gltf-binary' });
        resolve(URL.createObjectURL(blob));
      },
      reject,
      { binary: true },
    );
  });
}

// ─── OLE2 / CFB container parsing ─────────────────────────────────────────

function parseSKP(buffer: ArrayBuffer): SKPResult {
  const u8 = new Uint8Array(buffer);
  const dv = new DataView(buffer);

  // Verify OLE2 magic bytes
  for (let i = 0; i < 8; i++) {
    if (u8[i] !== OLE2_MAGIC[i]) {
      throw new Error('Invalid SKP file: missing OLE2 signature');
    }
  }

  const ss    = 1 << dv.getUint16(30, true); // sector size: 512 or 4096
  const mss   = 1 << dv.getUint16(32, true); // mini-sector size: 64
  const nFAT  = dv.getUint32(44, true);       // FAT sector count
  const dSec  = dv.getUint32(48, true);       // first directory sector
  const mcut  = dv.getUint32(56, true);       // mini-stream cutoff (default 4096)
  const mfSec = dv.getUint32(60, true);       // first mini-FAT sector
  const nMFAT = dv.getUint32(64, true);       // mini-FAT sector count

  const fat     = buildFAT(dv, buffer, ss, nFAT);
  const dirs    = readDirs(u8, dv, fat, dSec, ss);
  if (!dirs.length) throw new Error('SKP file has empty directory');

  const root    = dirs[0];
  const miniFAT = buildMiniFAT(u8, dv, fat, mfSec, nMFAT, ss);
  const miniStr = chainBytes(u8, fat, root.start, ss, root.size);

  // Pick the largest stream as the model data stream
  let modelData: Uint8Array | null = null;
  let maxLen = 0;

  for (const d of dirs) {
    if (d.type !== 2 || d.start >= FREESECT) continue; // only stream entries
    try {
      const data = d.size < mcut && miniStr.length > 0
        ? miniBytes(miniStr, miniFAT, d.start, d.size, mss)
        : chainBytes(u8, fat, d.start, ss, d.size);
      if (data.length > maxLen) { maxLen = data.length; modelData = data; }
    } catch { /* skip corrupt streams */ }
  }

  if (!modelData || modelData.length < 32) {
    throw new Error('No geometry data found in SKP file');
  }

  return extractGeometry(modelData);
}

// Build FAT from the DIFAT array embedded in the 512-byte OLE2 header
function buildFAT(dv: DataView, buf: ArrayBuffer, ss: number, nFAT: number): Uint32Array {
  const out: number[] = [];
  let collected = 0;
  for (let i = 0; i < 109 && collected < nFAT; i++) {
    const sec = dv.getUint32(76 + i * 4, true);
    if (sec >= FATSECT) continue;
    const off = (sec + 1) * ss;
    for (let j = 0; j < ss / 4; j++) {
      if (off + j * 4 + 4 > buf.byteLength) break;
      out.push(dv.getUint32(off + j * 4, true));
    }
    collected++;
  }
  return new Uint32Array(out);
}

interface Dir { name: string; type: number; start: number; size: number; }

function readDirs(u8: Uint8Array, dv: DataView, fat: Uint32Array, firstSec: number, ss: number): Dir[] {
  const dirs: Dir[] = [];
  for (const sec of chain(fat, firstSec)) {
    const base = (sec + 1) * ss;
    for (let i = 0; i < ss / 128; i++) {
      const o = base + i * 128;
      if (o + 128 > u8.length) break;
      const nameLen = dv.getUint16(o + 64, true);
      let name = '';
      for (let j = 0; j < Math.min(nameLen - 2, 62); j += 2) {
        const c = dv.getUint16(o + j, true);
        if (c) name += String.fromCharCode(c);
      }
      dirs.push({
        name,
        type: u8[o + 66],
        start: dv.getUint32(o + 116, true),
        size: dv.getUint32(o + 120, true),
      });
    }
  }
  return dirs;
}

function chain(fat: Uint32Array, start: number): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  let s = start;
  while (s < ENDOFCHAIN && s < fat.length && !seen.has(s)) {
    seen.add(s); out.push(s); s = fat[s];
  }
  return out;
}

function chainBytes(u8: Uint8Array, fat: Uint32Array, start: number, ss: number, size?: number): Uint8Array {
  const c   = chain(fat, start);
  const cap = Math.min(size ?? c.length * ss, c.length * ss);
  const out = new Uint8Array(cap);
  let pos = 0;
  for (const sec of c) {
    const off = (sec + 1) * ss;
    const n   = Math.min(ss, out.length - pos);
    if (n <= 0) break;
    out.set(u8.subarray(off, off + n), pos);
    pos += n;
  }
  return out.subarray(0, pos);
}

function buildMiniFAT(u8: Uint8Array, dv: DataView, fat: Uint32Array, first: number, num: number, ss: number): Uint32Array {
  if (first >= FREESECT || num === 0) return new Uint32Array(0);
  const out: number[] = [];
  for (const sec of chain(fat, first)) {
    const off = (sec + 1) * ss;
    for (let i = 0; i < ss / 4; i++) out.push(dv.getUint32(off + i * 4, true));
  }
  return new Uint32Array(out);
}

function miniBytes(miniStr: Uint8Array, mfat: Uint32Array, start: number, size: number, mss: number): Uint8Array {
  const c   = chain(mfat, start);
  const out = new Uint8Array(Math.min(size, c.length * mss));
  let pos = 0;
  for (const ms of c) {
    const off = ms * mss;
    const n   = Math.min(mss, out.length - pos);
    if (n <= 0) break;
    out.set(miniStr.subarray(off, off + n), pos);
    pos += n;
  }
  return out.subarray(0, Math.min(pos, size));
}

// ─── SKP geometry scanner ──────────────────────────────────────────────────
// SKP model streams store face entities as: [count:u16|u32][vertex × 24 bytes]
// Each vertex is 3 × float64 (little-endian) in inches.
// This scanner tries both u16 and u32 count widths at every byte offset.

function extractGeometry(data: Uint8Array): SKPResult {
  const dv   = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const faces: number[][] = []; // each entry: flat vertex array [x,y,z, x,y,z, ...]

  let i = 0;
  while (i < data.length - 28) {
    let advanced = false;
    for (const [stride, count] of [
      [2, dv.getUint16(i, true)],
      [4, dv.getUint32(i, true)],
    ] as [number, number][]) {
      if (count < 3 || count > 256) continue;
      const vs = i + stride;
      const ve = vs + count * 24;
      if (ve > data.length) continue;

      const verts: number[] = [];
      let ok = true;

      for (let v = 0; v < count; v++) {
        const o = vs + v * 24;
        const x = dv.getFloat64(o,      true);
        const y = dv.getFloat64(o +  8, true);
        const z = dv.getFloat64(o + 16, true);

        // Reject NaN / Inf and out-of-range coordinates (> 100 000 inches = ~2 540 m)
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z) ||
            Math.abs(x) > 100000 || Math.abs(y) > 100000 || Math.abs(z) > 100000) {
          ok = false; break;
        }

        // SKP → Three.js coordinate mapping
        verts.push(x * IN_TO_M, z * IN_TO_M, -y * IN_TO_M);
      }

      if (!ok || verts.length < 9) continue;

      // Reject degenerate faces (all vertices identical)
      const dx = verts[3] - verts[0];
      const dy = verts[4] - verts[1];
      const dz = verts[5] - verts[2];
      if (dx * dx + dy * dy + dz * dz < 1e-14) continue;

      faces.push(verts);
      i = ve - 1;
      advanced = true;
      break;
    }
    if (!advanced) i++;
  }

  // Deduplicate by first-vertex + vertex-count fingerprint
  const seen = new Set<string>();
  const unique = faces.filter(f => {
    const k = `${f.length},${f[0].toFixed(5)},${f[1].toFixed(5)},${f[2].toFixed(5)}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  // Fan-triangulate each polygon and build BufferGeometry
  const pos: number[] = [];
  for (const f of unique) {
    const n = f.length / 3;
    for (let v = 1; v < n - 1; v++) {
      pos.push(f[0], f[1], f[2]);
      pos.push(f[v * 3], f[v * 3 + 1], f[v * 3 + 2]);
      pos.push(f[(v + 1) * 3], f[(v + 1) * 3 + 1], f[(v + 1) * 3 + 2]);
    }
  }

  const group = new THREE.Group();

  if (pos.length === 0) {
    // Fallback placeholder so the scene always has something
    group.add(new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x888888, wireframe: true }),
    ));
    return { group, faceCount: 0, vertexCount: 0 };
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();

  group.add(new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0xd4c8b0, side: THREE.DoubleSide, roughness: 0.85, metalness: 0 }),
  ));

  // Subtle edge lines for the SketchUp look
  group.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 20),
    new THREE.LineBasicMaterial({ color: 0x333333, opacity: 0.35, transparent: true }),
  ));

  return { group, faceCount: unique.length, vertexCount: pos.length / 3 };
}
