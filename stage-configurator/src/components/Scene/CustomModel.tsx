'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { LightBeam } from './LightBeam';
import { CoverageZone } from './CoverageZone';
import { LaserShow } from './LaserShow';
import type { CustomEquipment } from '@/lib/equipment-storage';

const modelCache = new Map<string, THREE.Group>();

interface CustomModelProps {
  glbUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  selected: boolean;
  label: string;
  item?: CustomEquipment;
  showBeams?: boolean;
  showCoverage?: boolean;
  hazeActive?: boolean;
  onClick: () => void;
  onDragStart?: () => void;
}

export function CustomModel({
  glbUrl, position, rotation, scale, selected, label,
  item, showBeams, showCoverage, hazeActive,
  onClick, onDragStart,
}: CustomModelProps) {
  const modelGroupRef = useRef<THREE.Group>(null);
  const [modelH, setModelH] = useState(1.0);

  useEffect(() => {
    if (!modelGroupRef.current) return;
    const group = modelGroupRef.current;
    while (group.children.length) group.remove(group.children[0]);

    if (modelCache.has(glbUrl)) {
      const cached = modelCache.get(glbUrl)!.clone();
      group.add(cached);
      const box = new THREE.Box3().setFromObject(cached);
      setModelH(box.getSize(new THREE.Vector3()).y || 1);
      return;
    }

    let cancelled = false;

    import('three/addons/loaders/GLTFLoader.js')
      .then(({ GLTFLoader }) => {
        new GLTFLoader().load(
          glbUrl,
          (gltf) => {
            if (cancelled) return;
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 5) model.scale.setScalar(5 / maxDim);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.position.y += size.y / 2;

            const h = size.y || 1;
            setModelH(h);
            modelCache.set(glbUrl, model);
            if (modelGroupRef.current) modelGroupRef.current.add(model.clone());
          },
          undefined,
          (err) => console.warn('GLB load error:', err),
        );
      })
      .catch(err => console.warn('GLTFLoader import failed:', err));

    return () => { cancelled = true; };
  }, [glbUrl]);

  const emoji = item?.cat === 'audio' ? '🔊' : item?.cat === 'light' ? '💡' : item?.cat === 'led' ? '📺' : '📦';
  const h = item?.h ?? modelH;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerDown={(e) => { e.stopPropagation(); onDragStart?.(); }}
    >
      {/* Loaded model mesh */}
      <group ref={modelGroupRef} />

      {/* Selection outline */}
      {selected && (
        <mesh>
          <boxGeometry args={[(item?.w ?? 1) * 1.08, h * 1.08, (item?.d ?? 1) * 1.08]} />
          <meshBasicMaterial color="#C9A227" wireframe transparent opacity={0.5} />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, h / 2 + 0.3, 0]} center distanceFactor={8}>
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
          {emoji} {label}
        </div>
      </Html>

      {/* Light beam */}
      {showBeams && item?.beamColor && item?.beamAngle && !item?.laser && !item?.fogMaker && (
        <LightBeam
          color={item.beamColor}
          angle={item.beamAngle}
          position={[0, 0, 0]}
          height={h}
          hazeActive={hazeActive ?? false}
        />
      )}

      {/* Laser show */}
      {showBeams && item?.laser && (
        <LaserShow height={h} hazeActive={hazeActive ?? false} />
      )}

      {/* Audio coverage zone */}
      {showCoverage && item?.audioType && (
        <CoverageZone
          position={position}
          angle={item.coverageAngle ?? 90}
          radius={item.coverageRadius ?? 10}
          type={item.audioType}
          rotation={rotation[1]}
        />
      )}
    </group>
  );
}
