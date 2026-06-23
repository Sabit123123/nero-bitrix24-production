'use client';
import { Suspense, useRef, useCallback } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, ContactShadows, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import { Equipment } from './Equipment';
import { LEDScreen } from './LEDScreen';
import { FloorGrid } from './FloorGrid';
import { CustomModel } from './CustomModel';
import { TrussObject } from './TrussObject';

// ─── Room geometry ─────────────────────────────────────────────────────────

function Room() {
  const { roomW, roomD, wallH } = useConfiguratorStore();

  return (
    <group>
      {/* Checker floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#c4a882" roughness={0.9} />
      </mesh>

      {/* Walls */}
      {[
        { pos: [0, wallH / 2, -roomD / 2] as [number,number,number], rot: [0,0,0] as [number,number,number], size: [roomW, wallH] as [number,number] },
        { pos: [0, wallH / 2,  roomD / 2] as [number,number,number], rot: [0,Math.PI,0] as [number,number,number], size: [roomW, wallH] as [number,number] },
        { pos: [-roomW/2, wallH/2, 0]      as [number,number,number], rot: [0,Math.PI/2,0]  as [number,number,number], size: [roomD, wallH] as [number,number] },
        { pos: [ roomW/2, wallH/2, 0]      as [number,number,number], rot: [0,-Math.PI/2,0] as [number,number,number], size: [roomD, wallH] as [number,number] },
      ].map((w, i) => (
        <mesh key={i} position={w.pos} rotation={w.rot} receiveShadow>
          <planeGeometry args={w.size} />
          <meshStandardMaterial color="#909088" roughness={0.95} side={THREE.FrontSide} />
        </mesh>
      ))}

      {/* Ceiling — subtle */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallH, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#e0e0d8" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// ─── Main Scene ────────────────────────────────────────────────────────────

export function Scene3D() {
  const {
    objects, selectedId, selectObject, updateObject,
    showGrid, showBeams, showCoverage,
    cameraMode, snapEnabled,
  } = useConfiguratorStore();

  const hazeActive = objects.some(o => {
    const item = EQUIPMENT.find(e => e.id === o.itemId);
    return item?.fogMaker;
  });

  // ── Drag state ────────────────────────────────────────────────────────
  const dragRef = useRef<{ uuid: string; yOff: number } | null>(null);
  const orbitRef = useRef<OrbitControlsImpl>(null);

  const startDrag = useCallback((uuid: string, yOff: number) => {
    dragRef.current = { uuid, yOff };
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    if (orbitRef.current) orbitRef.current.enabled = true;
  }, []);

  const handleFloorMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    let x = e.point.x;
    let z = e.point.z;
    if (snapEnabled) {
      x = Math.round(x * 2) / 2; // snap to 0.5 m grid
      z = Math.round(z * 2) / 2;
    }
    updateObject(dragRef.current.uuid, { position: [x, dragRef.current.yOff, z] });
  }, [snapEnabled, updateObject]);

  const handleFloorClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectObject(null);
  }, [selectObject]);

  // Shared drag start handler for Equipment/CustomModel
  const makeDragStart = useCallback((uuid: string, yOff: number) => () => {
    startDrag(uuid, yOff);
  }, [startDrag]);

  return (
    <div className="w-full h-full" onPointerUp={endDrag}>
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ background: '#0a0a0f' }}
      >
        {/* Lighting */}
        <ambientLight intensity={1.5} color="#ffffff" />
        <hemisphereLight args={['#ffffff', '#e8e8e0', 0.6]} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />

        {/* Fog when hazer active */}
        {hazeActive && <fog attach="fog" args={['#1a1a2e', 15, 40]} />}

        {/* Camera */}
        {cameraMode === 'perspective' ? (
          <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={50} />
        ) : (
          <OrthographicCamera makeDefault position={[0, 20, 0]} zoom={30} />
        )}
        <OrbitControls
          ref={orbitRef}
          makeDefault
          enablePan
          enableZoom
          enableRotate={cameraMode === 'perspective'}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={3}
          maxDistance={60}
        />

        <Suspense fallback={null}>
          <Room />

          {showGrid && <FloorGrid />}

          {/* Invisible floor plane — receives drag pointer moves + deselect clicks */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, 0]}
            onClick={handleFloorClick}
            onPointerMove={handleFloorMove}
          >
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* ── Objects ── */}
          {objects.map(obj => {
            if (obj.isCustom && obj.customModelUrl) {
              return (
                <CustomModel
                  key={obj.uuid}
                  glbUrl={obj.customModelUrl}
                  position={obj.position}
                  rotation={obj.rotation as [number,number,number]}
                  scale={obj.scale}
                  selected={selectedId === obj.uuid}
                  label={obj.name}
                  onClick={() => selectObject(obj.uuid)}
                  onDragStart={makeDragStart(obj.uuid, obj.position[1])}
                />
              );
            }

            if (obj.isTruss && obj.trussConfig) {
              return (
                <TrussObject
                  key={obj.uuid}
                  obj={obj}
                  config={obj.trussConfig}
                  selected={selectedId === obj.uuid}
                  onSelect={() => selectObject(obj.uuid)}
                  onDragStart={startDrag}
                />
              );
            }

            if (obj.isLED && obj.ledConfig) {
              return (
                <LEDScreen
                  key={obj.uuid}
                  config={obj.ledConfig}
                  position={obj.position}
                  rotation={obj.rotation as [number,number,number]}
                  selected={selectedId === obj.uuid}
                  onClick={() => selectObject(obj.uuid)}
                />
              );
            }

            return (
              <Equipment
                key={obj.uuid}
                obj={obj}
                selected={selectedId === obj.uuid}
                showBeams={showBeams}
                showCoverage={showCoverage}
                hazeActive={hazeActive}
                onSelect={() => selectObject(obj.uuid)}
                onMove={(pos) => updateObject(obj.uuid, { position: pos })}
                onDragStart={makeDragStart(obj.uuid, obj.position[1])}
              />
            );
          })}

          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={50} blur={1.5} far={10} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
