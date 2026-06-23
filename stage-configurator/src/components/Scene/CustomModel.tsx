'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

// Cache to avoid re-loading same URLs
const modelCache = new Map<string, THREE.Group>();

interface CustomModelProps {
  glbUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  selected: boolean;
  label: string;
  onClick: () => void;
}

export function CustomModel({ glbUrl, position, rotation, scale, selected, label, onClick }: CustomModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    // Clear previous content
    while (group.children.length) group.remove(group.children[0]);

    if (modelCache.has(glbUrl)) {
      const cached = modelCache.get(glbUrl)!.clone();
      group.add(cached);
      return;
    }

    let cancelled = false;

    // Dynamic import of GLTFLoader (avoid SSR issues)
    import('three/addons/loaders/GLTFLoader.js')
      .then(({ GLTFLoader }) => {
        const loader = new GLTFLoader();
        loader.load(
          glbUrl,
          (gltf) => {
            if (cancelled) return;
            const model = gltf.scene;
            // Auto-scale to reasonable size
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 5) model.scale.setScalar(5 / maxDim);
            // Center on floor
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.position.y += size.y / 2;

            modelCache.set(glbUrl, model);
            if (groupRef.current) groupRef.current.add(model.clone());
          },
          undefined,
          (err) => console.warn('GLB load error:', err)
        );
      })
      .catch(err => console.warn('GLTFLoader import failed:', err));

    return () => { cancelled = true; };
  }, [glbUrl]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {selected && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial color="#C9A227" wireframe transparent opacity={0.5} />
        </mesh>
      )}
      <Html position={[0, 0.8, 0]} center distanceFactor={8}>
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
          📦 {label}
        </div>
      </Html>
    </group>
  );
}
