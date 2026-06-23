'use client';
import * as THREE from 'three';

interface CoverageZoneProps {
  position: [number, number, number];
  angle: number;   // degrees
  radius: number;  // meters
  type: string;
  rotation?: number; // Y rotation
}

export function CoverageZone({ position, angle, radius, type, rotation = 0 }: CoverageZoneProps) {
  const color = type === 'sub' ? '#2244ff' : '#ffaa00';
  const segments = 32;
  const halfAngle = (angle / 2) * (Math.PI / 180);

  // Build fan shape
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  if (angle >= 360) {
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  } else {
    shape.arc(0, 0, radius, -halfAngle, halfAngle, false);
    shape.lineTo(0, 0);
  }

  return (
    <group position={[position[0], 0.02, position[2]]} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape, segments]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
