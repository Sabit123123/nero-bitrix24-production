'use client';
import { useMemo, ReactElement } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { PlacedObject, TrussConfig } from '@/types';

// ─── Low-level truss section (shared with Equipment.tsx TrussBody) ─────────

function Section({
  w, d, h, color,
}: { w: number; d: number; h: number; color: string }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.18 }),
    [color],
  );
  const r  = 0.018;
  const rD = r * 0.65;

  const isV = h > w + 0.05;
  const len = isV ? h : w;
  const cs  = isV ? Math.min(w, d) * 0.5 - r : Math.min(d, h) * 0.5 - r;
  const half = Math.max(cs, 0.06);

  const corners: [number, number][] = [
    [-half, -half], [half, -half], [half, half], [-half, half],
  ];
  const bays = Math.max(1, Math.round(len / 0.5));
  const step = len / bays;

  const tubes: ReactElement[] = [];
  corners.forEach(([a, b], i) => {
    if (isV) {
      tubes.push(
        <mesh key={`t${i}`} position={[a, 0, b]} material={mat}>
          <cylinderGeometry args={[r, r, len, 6]} />
        </mesh>,
      );
    } else {
      tubes.push(
        <mesh key={`t${i}`} position={[0, a, b]} rotation={[0, 0, Math.PI / 2]} material={mat}>
          <cylinderGeometry args={[r, r, len, 6]} />
        </mesh>,
      );
    }
  });

  for (let bay = 0; bay < bays; bay++) {
    const pos = -len / 2 + step * bay + step * 0.5;
    if (isV) {
      for (let e = 0; e < 4; e++) {
        const [ax, az] = corners[e], [bx, bz] = corners[(e + 1) % 4];
        const el = Math.hypot(bx - ax, bz - az);
        const ag = Math.atan2(bz - az, bx - ax);
        tubes.push(
          <mesh key={`ve${bay}-${e}`} position={[(ax + bx) / 2, pos, (az + bz) / 2]}
                rotation={[0, -ag, Math.PI / 2]} material={mat}>
            <cylinderGeometry args={[rD, rD, el, 6]} />
          </mesh>,
        );
      }
    } else {
      for (let e = 0; e < 4; e++) {
        const [ay, az] = corners[e], [by, bz] = corners[(e + 1) % 4];
        const el = Math.hypot(by - ay, bz - az);
        const ag = Math.atan2(bz - az, by - ay);
        tubes.push(
          <mesh key={`he${bay}-${e}`} position={[pos, (ay + by) / 2, (az + bz) / 2]}
                rotation={[ag, 0, Math.PI / 2]} material={mat}>
            <cylinderGeometry args={[rD, rD, el, 6]} />
          </mesh>,
        );
      }
    }
  }
  return <>{tubes}</>;
}

// ─── Shape builders ────────────────────────────────────────────────────────

interface ShapeProps { cfg: TrussConfig; ts: number; color: string }

function ShapeStraight({ cfg, ts, color }: ShapeProps) {
  const len = cfg.length ?? 4;
  return <Section w={len} d={ts} h={ts} color={color} />;
}

function ShapeTotem({ cfg, ts, color }: ShapeProps) {
  const height = cfg.height ?? 4;
  return <Section w={ts} d={ts} h={height} color={color} />;
}

function ShapePShape({ cfg, ts, color }: ShapeProps) {
  const len = cfg.length ?? 4;
  const h   = cfg.height ?? 3;
  return (
    <group>
      {/* Vertical leg on left */}
      <group position={[-len / 2, h / 2, 0]}>
        <Section w={ts} d={ts} h={h} color={color} />
      </group>
      {/* Horizontal top beam */}
      <group position={[0, h, 0]}>
        <Section w={len} d={ts} h={ts} color={color} />
      </group>
    </group>
  );
}

function ShapeSquare({ cfg, ts, color }: ShapeProps) {
  const w = cfg.width ?? 4;
  const h = cfg.height ?? 3;
  return (
    <group>
      {/* Left vertical */}
      <group position={[-w / 2, h / 2, 0]}>
        <Section w={ts} d={ts} h={h} color={color} />
      </group>
      {/* Right vertical */}
      <group position={[w / 2, h / 2, 0]}>
        <Section w={ts} d={ts} h={h} color={color} />
      </group>
      {/* Top beam */}
      <group position={[0, h, 0]}>
        <Section w={w} d={ts} h={ts} color={color} />
      </group>
      {/* Bottom beam */}
      <group position={[0, 0, 0]}>
        <Section w={w} d={ts} h={ts} color={color} />
      </group>
    </group>
  );
}

function ShapeRoof({ cfg, ts, color }: ShapeProps) {
  const w    = cfg.width ?? 6;
  const h    = cfg.height ?? 3;
  const peak = Math.hypot(w / 2, h);
  const ang  = Math.atan2(h, w / 2);
  return (
    <group>
      {/* Left rafter */}
      <group position={[-w / 4, h / 2, 0]} rotation={[0, 0, ang]}>
        <Section w={peak} d={ts} h={ts} color={color} />
      </group>
      {/* Right rafter */}
      <group position={[w / 4, h / 2, 0]} rotation={[0, 0, -ang]}>
        <Section w={peak} d={ts} h={ts} color={color} />
      </group>
      {/* Base beam */}
      <group position={[0, 0, 0]}>
        <Section w={w} d={ts} h={ts} color={color} />
      </group>
    </group>
  );
}

// ─── Public TrussObject component ─────────────────────────────────────────

interface TrussObjectProps {
  obj: PlacedObject;
  config: TrussConfig;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (uuid: string, yOff: number) => void;
}

export function TrussObject({ obj, config, selected, onSelect, onDragStart }: TrussObjectProps) {
  const ts    = config.type === '400' ? 0.4 : config.type === '300' ? 0.3 : 0.29;
  const color = selected ? '#C9A227' : '#aaaaaa';

  const ShapeComp =
    config.shape === 'totem'  ? ShapeTotem  :
    config.shape === 'p-shape' ? ShapePShape :
    config.shape === 'square'  ? ShapeSquare :
    config.shape === 'roof'    ? ShapeRoof   :
    ShapeStraight;

  const labelY = (config.height ?? config.length ?? 4) + 0.3;

  return (
    <group
      position={obj.position}
      rotation={obj.rotation as [number, number, number]}
      scale={[obj.scale, obj.scale, obj.scale]}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onDragStart(obj.uuid, obj.position[1]);
      }}
    >
      <ShapeComp cfg={config} ts={ts} color={color} />

      {selected && (
        <mesh>
          <boxGeometry args={[
            (config.width ?? config.length ?? 4) + 0.1,
            (config.height ?? config.length ?? 4) + 0.1,
            ts + 0.1,
          ]} />
          <meshBasicMaterial color="#C9A227" wireframe transparent opacity={0.4} />
        </mesh>
      )}

      <Html position={[0, labelY, 0]} center distanceFactor={8}>
        <div style={{
          background: 'rgba(5,5,7,0.9)',
          border: '1px solid rgba(201,162,39,0.5)',
          borderRadius: 4, padding: '2px 8px',
          fontSize: 11, color: '#F5F0E8', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          🔩 {obj.name}
        </div>
      </Html>
    </group>
  );
}
