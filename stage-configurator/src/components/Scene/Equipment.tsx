'use client';
import { useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import { PlacedObject } from '@/types';
import { LightBeam } from './LightBeam';
import { CoverageZone } from './CoverageZone';

interface EquipmentProps {
  obj: PlacedObject;
  selected: boolean;
  showBeams: boolean;
  showCoverage: boolean;
  hazeActive: boolean;
  onSelect: () => void;
  onMove: (pos: [number, number, number]) => void;
}

export function Equipment({ obj, selected, showBeams, showCoverage, hazeActive, onSelect }: EquipmentProps) {
  const meshRef = useRef<THREE.Group>(null);
  const item = EQUIPMENT.find(e => e.id === obj.itemId);
  if (!item) return null;

  return (
    <group
      ref={meshRef}
      position={obj.position}
      rotation={obj.rotation as [number, number, number]}
      scale={[obj.scale, obj.scale, obj.scale]}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Main body */}
      <mesh castShadow receiveShadow>
        {item.cat === 'light' ? (
          <cylinderGeometry args={[item.w * 0.4, item.w * 0.4, item.h, 12]} />
        ) : (
          <boxGeometry args={[item.w, item.h, item.d]} />
        )}
        <meshStandardMaterial
          color={selected ? '#C9A227' : item.color}
          emissive={selected ? '#C9A227' : '#000000'}
          emissiveIntensity={selected ? 0.15 : 0}
          metalness={item.cat === 'truss' ? 0.8 : 0.2}
          roughness={item.cat === 'truss' ? 0.2 : 0.8}
        />
      </mesh>

      {/* Selection box */}
      {selected && (
        <mesh>
          <boxGeometry args={[item.w + 0.05, item.h + 0.05, item.d + 0.05]} />
          <meshBasicMaterial color="#C9A227" wireframe transparent opacity={0.6} />
        </mesh>
      )}

      {/* Label */}
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

      {/* Light beam */}
      {showBeams && item.beamColor && item.beamAngle && (
        <LightBeam
          color={item.beamColor}
          angle={item.beamAngle}
          position={[0, 0, 0]}
          height={item.h}
          hazeActive={hazeActive}
        />
      )}

      {/* Audio coverage */}
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
