'use client';
import { Suspense, useRef, useCallback, useEffect, type RefObject } from 'react';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import { Equipment } from './Equipment';
import { LEDScreen } from './LEDScreen';
import { FloorGrid } from './FloorGrid';
import { CustomModel } from './CustomModel';
import { TrussObject } from './TrussObject';

// ─── WASD camera pan ───────────────────────────────────────────────────────

function WASDControls({ orbitRef }: { orbitRef: RefObject<OrbitControlsImpl | null> }) {
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Don't capture WASD when user is typing in an input
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((state, delta) => {
    const ctrl = orbitRef.current;
    if (!ctrl) return;
    const k = keys.current;
    if (!k['KeyW'] && !k['KeyS'] && !k['KeyA'] && !k['KeyD']) return;

    const speed = 8 * delta;
    const cam = state.camera;
    const fwd = new THREE.Vector3();
    cam.getWorldDirection(fwd);
    fwd.y = 0;
    if (fwd.lengthSq() < 0.001) return;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));

    const pan = new THREE.Vector3();
    if (k['KeyW']) pan.addScaledVector(fwd, speed);
    if (k['KeyS']) pan.addScaledVector(fwd, -speed);
    if (k['KeyA']) pan.addScaledVector(right, -speed);
    if (k['KeyD']) pan.addScaledVector(right, speed);

    cam.position.add(pan);
    ctrl.target.add(pan);
    ctrl.update();
  });

  return null;
}

// ─── Room geometry ─────────────────────────────────────────────────────────

const FLOOR_PRESETS: Record<string, { color: string; roughness: number; metalness: number }> = {
  concrete: { color: '#2a2a2a', roughness: 0.85, metalness: 0.05 },
  parquet:  { color: '#5c3d1a', roughness: 0.75, metalness: 0.0  },
  carpet:   { color: '#3d1a1a', roughness: 1.0,  metalness: 0.0  },
  stage:    { color: '#111111', roughness: 0.3,  metalness: 0.15 },
  tile:     { color: '#c8c8c0', roughness: 0.4,  metalness: 0.05 },
  light:    { color: '#d4b896', roughness: 0.65, metalness: 0.0  },
};

function Room() {
  const { roomW, roomD, wallH, floorType } = useConfiguratorStore();
  const floor = FLOOR_PRESETS[floorType] ?? FLOOR_PRESETS.concrete;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color={floor.color} roughness={floor.roughness} metalness={floor.metalness} />
      </mesh>

      {/* Floor grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshBasicMaterial color="#444444" transparent opacity={0.5} wireframe />
      </mesh>

      {/* Walls */}
      {([
        { pos: [0, wallH / 2, -roomD / 2] as [number,number,number], rot: [0, 0, 0] as [number,number,number],            size: [roomW, wallH] as [number,number] },
        { pos: [0, wallH / 2,  roomD / 2] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number],      size: [roomW, wallH] as [number,number] },
        { pos: [-roomW/2, wallH/2, 0]     as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number],    size: [roomD, wallH] as [number,number] },
        { pos: [ roomW/2, wallH/2, 0]     as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number],   size: [roomD, wallH] as [number,number] },
      ] as const).map((w, i) => (
        <mesh key={i} position={w.pos} rotation={w.rot} receiveShadow>
          <planeGeometry args={w.size} />
          <meshStandardMaterial color="#222222" roughness={0.9} side={THREE.FrontSide} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallH, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>

      {/* Floor edge strip — golden accent */}
      {([
        { pos: [0, 0.01, -roomD / 2 + 0.025] as [number,number,number], size: [roomW, 0.05] as [number,number] },
        { pos: [0, 0.01,  roomD / 2 - 0.025] as [number,number,number], size: [roomW, 0.05] as [number,number] },
        { pos: [-roomW/2 + 0.025, 0.01, 0]   as [number,number,number], size: [0.05, roomD] as [number,number] },
        { pos: [ roomW/2 - 0.025, 0.01, 0]   as [number,number,number], size: [0.05, roomD] as [number,number] },
      ] as const).map((s, i) => (
        <mesh key={`strip-${i}`} position={s.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={s.size} />
          <meshBasicMaterial color="#C9A227" transparent opacity={0.35} />
        </mesh>
      ))}
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
    <div className="w-full h-full relative" onPointerUp={endDrag}>
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ background: '#0a0a0f' }}
      >
        {/* Lighting */}
        <ambientLight intensity={2.5} color="#ffffff" />
        <hemisphereLight args={['#aaccff', '#444444', 1.0]} />
        <directionalLight position={[10, 15, 10]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-10, 12, -10]} intensity={1.5} />
        <pointLight position={[0, 3.5, 0]} intensity={3.0} color="#ffffff" distance={30} decay={1} />
        <pointLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" distance={20} decay={1} />
        <pointLight position={[-5, 3, -5]} intensity={1.5} color="#ffffff" distance={20} decay={1} />

        {/* Fog when hazer active */}
        {hazeActive && <fog attach="fog" args={['#1a1a2e', 4, 18]} />}

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
        <WASDControls orbitRef={orbitRef} />

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
                  item={obj.customEquipment}
                  showBeams={showBeams}
                  showCoverage={showCoverage}
                  hazeActive={hazeActive}
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

      {/* Keyboard hints */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, pointerEvents: 'none', zIndex: 10,
      }}>
        {[
          ['WASD', 'Камера'],
          ['ЛКМ+перетащить', 'Переместить объект'],
          ['Del', 'Удалить'],
          ['Ctrl+Z', 'Отменить'],
          ['Ctrl+D', 'Дублировать'],
        ].map(([key, label]) => (
          <div key={key} style={{
            background: 'rgba(5,5,10,0.85)',
            border: '1px solid rgba(201,162,39,0.25)',
            borderRadius: 4,
            padding: '2px 7px',
            fontSize: 10,
            color: '#888',
            backdropFilter: 'blur(6px)',
          }}>
            <span style={{ color: '#C9A227', fontWeight: 600 }}>{key}</span>
            {' '}{label}
          </div>
        ))}
      </div>
    </div>
  );
}
