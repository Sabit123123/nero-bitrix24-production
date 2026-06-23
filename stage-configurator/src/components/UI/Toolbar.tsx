'use client';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';

interface ToolbarProps {
  onExportPNG: () => void;
  onExportPDF: () => void;
  onOpenTemplates: () => void;
  onImportModel: () => void;
  onSave: () => void;
  onNew: () => void;
  onOpen: () => void;
}

export function Toolbar({ onExportPNG, onExportPDF, onOpenTemplates, onImportModel, onSave, onNew, onOpen }: ToolbarProps) {
  const {
    project, setProjectMeta,
    roomW, roomD, wallH, setRoom,
    showGrid, showCoverage, showBeams, snapEnabled, cameraMode,
    toggleGrid, toggleCoverage, toggleBeams, toggleSnap, toggleCameraMode,
    undo, objects,
  } = useConfiguratorStore();

  const totalWeight = objects.reduce((sum, o) => {
    const item = EQUIPMENT.find(e => e.id === o.itemId);
    return sum + (item?.weight || 0) * o.scale;
  }, 0);

  return (
    <div className="h-12 flex-shrink-0 flex items-center gap-2 px-3 border-b border-white/8"
         style={{ background: 'rgba(5,5,7,0.92)', backdropFilter: 'blur(20px)' }}>

      {/* Logo */}
      <span className="text-yellow-500 font-black text-sm tracking-widest uppercase mr-1">ND</span>

      <div className="w-px h-5 bg-white/10" />

      {/* Project name */}
      <input
        value={project.name}
        onChange={e => setProjectMeta({ name: e.target.value })}
        className="bg-transparent text-white/80 text-xs font-semibold outline-none w-36 hover:text-white"
      />

      <div className="w-px h-5 bg-white/10" />

      {/* File actions */}
      <button onClick={onNew} className="btn-ghost">Новый</button>
      <button onClick={onSave} className="btn-ghost">Сохранить</button>
      <button onClick={onOpen} className="btn-ghost">Открыть</button>
      <button onClick={onOpenTemplates} className="btn-ghost">Шаблоны ▾</button>

      <div className="w-px h-5 bg-white/10" />

      {/* Import */}
      <button onClick={onImportModel} className="btn-ghost">Импорт GLB</button>

      <div className="w-px h-5 bg-white/10" />

      {/* Room size */}
      <span className="text-white/30 text-xs">Зал:</span>
      <input
        type="number" value={roomW} onChange={e => setRoom(+e.target.value, roomD, wallH)}
        className="w-12 bg-white/6 border border-white/10 rounded text-white text-xs text-center outline-none py-1"
      />
      <span className="text-white/30 text-xs">×</span>
      <input
        type="number" value={roomD} onChange={e => setRoom(roomW, +e.target.value, wallH)}
        className="w-12 bg-white/6 border border-white/10 rounded text-white text-xs text-center outline-none py-1"
      />
      <span className="text-white/30 text-xs">м</span>

      <div className="w-px h-5 bg-white/10" />

      {/* View toggles */}
      <button onClick={toggleGrid} className={`btn-ghost ${showGrid ? 'active' : ''}`}>Сетка</button>
      <button onClick={toggleBeams} className={`btn-ghost ${showBeams ? 'active' : ''}`}>Лучи</button>
      <button onClick={toggleCoverage} className={`btn-ghost ${showCoverage ? 'active' : ''}`}>Покрытие</button>
      <button onClick={toggleCameraMode} className="btn-ghost">
        {cameraMode === 'perspective' ? '3D' : '2D'}
      </button>
      <button onClick={toggleSnap} className={`btn-ghost ${snapEnabled ? 'active' : ''}`}>Сетка 📌</button>

      <div className="w-px h-5 bg-white/10" />

      {/* Undo */}
      <button onClick={undo} className="btn-ghost">↩ Отмена</button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-white/30 text-xs">{objects.length} объектов · {Math.round(totalWeight)} кг</span>
        <div className="w-px h-5 bg-white/10" />
        <button onClick={onExportPNG} className="btn-ghost">Экспорт PNG</button>
        <button onClick={onExportPDF} className="btn-gold">PDF ↓</button>
      </div>
    </div>
  );
}
