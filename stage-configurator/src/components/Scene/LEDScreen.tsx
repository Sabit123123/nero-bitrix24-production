'use client';
import { useMemo } from 'react';
import { LEDConfig } from '@/types';

interface LEDScreenProps {
  config: LEDConfig;
  position: [number, number, number];
  rotation: [number, number, number];
  selected: boolean;
  onClick: () => void;
}

export function LEDScreen({ config, position, rotation, selected, onClick }: LEDScreenProps) {
  const { cabinetW, cabinetH, countX, countY, shape, curvature } = config;
  const cW = cabinetW / 1000; // convert mm to m
  const cH = cabinetH / 1000;
  const totalW = cW * countX;
  const totalH = cH * countY;

  const cabinets = useMemo(() => {
    const items: { x: number; y: number; z: number; ry: number }[] = [];
    const radius = shape !== 'flat' && curvature > 0
      ? totalW / (2 * Math.sin((curvature * Math.PI / 180) / 2 * countX))
      : Infinity;

    for (let x = 0; x < countX; x++) {
      for (let y = 0; y < countY; y++) {
        const lx = (x - countX / 2 + 0.5) * cW;
        const ly = y * cH;
        let lz = 0;
        let ry = 0;

        if (shape !== 'flat' && isFinite(radius)) {
          const a = (x - countX / 2 + 0.5) * curvature * Math.PI / 180;
          ry = shape === 'concave' ? -a : a;
          lz = shape === 'concave' ? Math.sin(a) * 0.3 : -Math.sin(a) * 0.3;
        }

        items.push({ x: lx, y: ly, z: lz, ry });
      }
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      {cabinets.map((cab, i) => (
        <mesh key={i} position={[cab.x, cab.y, cab.z]} rotation={[0, cab.ry, 0]}>
          <boxGeometry args={[cW - 0.005, cH - 0.005, 0.08]} />
          <meshStandardMaterial
            color="#050510"
            emissive="#0a0a40"
            emissiveIntensity={0.8}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      ))}
      {/* Selection outline */}
      {selected && (
        <mesh position={[0, totalH / 2, 0]}>
          <boxGeometry args={[totalW + 0.05, totalH + 0.05, 0.12]} />
          <meshBasicMaterial color="#C9A227" wireframe />
        </mesh>
      )}
    </group>
  );
}
