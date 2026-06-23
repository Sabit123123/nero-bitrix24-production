'use client';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface LightBeamProps {
  color: string;
  angle: number;
  position: [number, number, number];
  height: number;
  type?: 'beam' | 'wash' | 'strobe';
  hazeActive?: boolean;
}

export function LightBeam({ color, angle, position, height, type = 'beam', hazeActive = false }: LightBeamProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const opacity = hazeActive ? (type === 'wash' ? 0.12 : 0.22) : 0.06;
  const beamH = type === 'wash' ? 6 : 8;
  const r = beamH * angle;

  useFrame(({ clock }) => {
    if (type === 'strobe' && meshRef.current) {
      const t = clock.getElapsedTime();
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(t * 8) > 0.5 ? 0.3 : 0;
    }
  });

  return (
    <group position={[position[0], position[1] + height, position[2]]}>
      <mesh ref={meshRef} rotation={[Math.PI, 0, 0]} position={[0, -beamH / 2, 0]}>
        <coneGeometry args={[r, beamH, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Floor spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height - 0.01, 0]}>
        <circleGeometry args={[r * 1.1, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
