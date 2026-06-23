'use client';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const BEAM_COLORS = ['#ff0044', '#00ff88', '#0088ff', '#ffdd00', '#cc00ff'];
const ANGLES_DEG  = [-40, -20, 0, 20, 40];

interface LaserShowProps {
  height: number;      // device height (beam starts from top)
  hazeActive: boolean; // beams only visible in fog
}

export function LaserShow({ height, hazeActive }: LaserShowProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow oscillating sweep
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.5;
    }
  });

  const beamOpacity  = hazeActive ? 0.70 : 0.04;
  const dotOpacity   = hazeActive ? 0.15 : 0.65;
  const beamLen      = 10;

  return (
    <group ref={groupRef} position={[0, height, 0]}>
      {BEAM_COLORS.map((color, i) => {
        const angleDeg = ANGLES_DEG[i];
        const angleRad = (angleDeg * Math.PI) / 180;
        // Beams go UP and outward from the device
        const dx = Math.sin(angleRad) * beamLen;
        const dy = Math.cos(angleRad) * beamLen;   // positive = upward

        const mx = dx / 2;
        const my = dy / 2;

        return (
          <group key={i}>
            {/* Volumetric beam */}
            <mesh position={[mx, my, 0]} rotation={[0, 0, -angleRad]}>
              <cylinderGeometry args={[0.012, 0.004, beamLen, 6]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={beamOpacity}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Ceiling/wall dot */}
            <mesh position={[dx, dy, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={dotOpacity}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
