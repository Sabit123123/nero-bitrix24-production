'use client';
import { useRef, useMemo, ReactElement } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import { PlacedObject } from '@/types';
import { LightBeam } from './LightBeam';
import { CoverageZone } from './CoverageZone';
import { LaserShow } from './LaserShow';

interface EquipmentProps {
  obj: PlacedObject;
  selected: boolean;
  showBeams: boolean;
  showCoverage: boolean;
  hazeActive: boolean;
  onSelect: () => void;
  onMove: (pos: [number, number, number]) => void;
}

// ─── Truss geometry ─────────────────────────────────────────────────────────
// Renders 4 corner tubes + diagonal cross-members for a realistic truss look
function TrussBody({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.18 }),
    [color],
  );
  const r  = 0.018;          // tube radius
  const rD = r * 0.65;       // diagonal tube radius

  // Determine long axis
  const isVertical = h > w + 0.1;
  const len        = isVertical ? h : w;
  const cs         = isVertical ? Math.min(w, d) * 0.5 - r : Math.min(d, h) * 0.5 - r;
  const half       = Math.max(cs, 0.05);

  // 4 corner positions in the cross-section (local 2D plane)
  const cx: [number, number][] = [
    [-half, -half], [half, -half], [half, half], [-half, half],
  ];

  // Number of cross bays
  const bays = Math.max(1, Math.round(len / 0.5));
  const step = len / bays;

  const tubes: ReactElement[] = [];

  cx.forEach(([a, b], i) => {
    // Main corner tube (full length)
    if (isVertical) {
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

  // Cross members per bay
  for (let bay = 0; bay < bays; bay++) {
    const pos = -len / 2 + step * bay + step * 0.5;

    if (isVertical) {
      // Horizontal rings
      for (let e = 0; e < 4; e++) {
        const [ax, az] = cx[e];
        const [bx, bz] = cx[(e + 1) % 4];
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        const edgeLen = Math.hypot(bx - ax, bz - az);
        const angle   = Math.atan2(bz - az, bx - ax);
        tubes.push(
          <mesh key={`ve${bay}-${e}`} position={[mx, pos, mz]} rotation={[0, -angle, Math.PI / 2]} material={mat}>
            <cylinderGeometry args={[rD, rD, edgeLen, 6]} />
          </mesh>,
        );
      }
      // One diagonal per face per bay
      const diagLen = Math.hypot(step, half * 2);
      const diagAng = Math.atan2(half * 2, step);
      tubes.push(
        <mesh key={`vd${bay}`} position={[0, pos - step * 0.25, 0]} rotation={[0, 0, Math.PI / 2 - diagAng]} material={mat}>
          <cylinderGeometry args={[rD, rD, diagLen, 6]} />
        </mesh>,
      );
    } else {
      // Cross rings
      for (let e = 0; e < 4; e++) {
        const [ay, az] = cx[e];
        const [by, bz] = cx[(e + 1) % 4];
        const my = (ay + by) / 2, mz = (az + bz) / 2;
        const edgeLen = Math.hypot(by - ay, bz - az);
        const angle   = Math.atan2(bz - az, by - ay);
        tubes.push(
          <mesh key={`he${bay}-${e}`} position={[pos, my, mz]} rotation={[angle, 0, Math.PI / 2]} material={mat}>
            <cylinderGeometry args={[rD, rD, edgeLen, 6]} />
          </mesh>,
        );
      }
      // One top diagonal per bay
      const diagLen = Math.hypot(step, half * 2);
      const diagAng = Math.atan2(half * 2, step);
      tubes.push(
        <mesh key={`hd${bay}`} position={[pos - step * 0.25, 0, 0]} rotation={[0, 0, diagAng]} material={mat}>
          <cylinderGeometry args={[rD, rD, diagLen, 6]} />
        </mesh>,
      );
    }
  }

  return <>{tubes}</>;
}

// ─── Main Equipment component ────────────────────────────────────────────────
export function Equipment({ obj, selected, showBeams, showCoverage, hazeActive, onSelect }: EquipmentProps) {
  const meshRef = useRef<THREE.Group>(null);
  const item = EQUIPMENT.find(e => e.id === obj.itemId);
  if (!item) return null;

  const isTruss = item.cat === 'truss' || item.cat === 'structure';
  const isLight = item.cat === 'light';

  return (
    <group
      ref={meshRef}
      position={obj.position}
      rotation={obj.rotation as [number, number, number]}
      scale={[obj.scale, obj.scale, obj.scale]}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }}
    >
      {/* ── Body ── */}
      {isTruss ? (
        <TrussBody w={item.w} d={item.d} h={item.h} color={selected ? '#C9A227' : item.color} />
      ) : (
        <mesh castShadow receiveShadow>
          {isLight ? (
            <cylinderGeometry args={[item.w * 0.4, item.w * 0.45, item.h, 12]} />
          ) : (
            <boxGeometry args={[item.w, item.h, item.d]} />
          )}
          <meshStandardMaterial
            color={selected ? '#C9A227' : item.color}
            emissive={selected ? '#C9A227' : '#000000'}
            emissiveIntensity={selected ? 0.15 : 0}
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      )}

      {/* ── Selection box ── */}
      {selected && (
        <mesh>
          <boxGeometry args={[item.w + 0.07, item.h + 0.07, item.d + 0.07]} />
          <meshBasicMaterial color="#C9A227" wireframe transparent opacity={0.55} />
        </mesh>
      )}

      {/* ── Label ── */}
      <Html position={[0, item.h / 2 + 0.3, 0]} center distanceFactor={8}>
        <div style={{
          background: 'rgba(5,5,7,0.9)',
          border: '1px solid rgba(201,162,39,0.5)',
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
          color: '#F5F0E8',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {item.emoji} {item.name}
        </div>
      </Html>

      {/* ── Light beam ── */}
      {showBeams && item.beamColor && item.beamAngle && !item.laser && (
        <LightBeam
          color={item.beamColor}
          angle={item.beamAngle}
          position={[0, 0, 0]}
          height={item.h}
          hazeActive={hazeActive}
        />
      )}

      {/* ── Laser show ── */}
      {showBeams && item.laser && (
        <LaserShow height={item.h} hazeActive={hazeActive} />
      )}

      {/* ── Audio coverage ── */}
      {showCoverage && item.audioType && (
        <CoverageZone
          position={obj.position}
          angle={item.coverageAngle || 90}
          radius={item.coverageRadius || 10}
          type={item.audioType}
          rotation={obj.rotation[1]}
        />
      )}
    </group>
  );
}
