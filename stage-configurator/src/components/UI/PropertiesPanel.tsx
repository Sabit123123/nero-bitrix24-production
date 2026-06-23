'use client';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';

export function PropertiesPanel() {
  const { selectedId, objects, updateObject, removeObject, duplicateObject, roomW, roomD, wallH, setRoom } = useConfiguratorStore();

  const obj = objects.find(o => o.uuid === selectedId);
  const item = obj ? EQUIPMENT.find(e => e.id === obj.itemId) : null;

  if (!obj || !item) {
    return (
      <div className="w-56 flex-shrink-0 flex flex-col border-l border-white/8 p-3"
           style={{ background: 'rgba(5,5,7,0.88)' }}>
        <div className="panel-section">
          <div className="panel-label">Зал</div>
          <div className="space-y-2">
            {[
              { label: 'Ширина', val: roomW, key: 'w', unit: 'м' },
              { label: 'Глубина', val: roomD, key: 'd', unit: 'м' },
              { label: 'Высота', val: wallH, key: 'h', unit: 'м' },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <label className="text-xs text-white/40 w-14">{f.label}</label>
                <input
                  type="number"
                  value={f.val}
                  step={0.5}
                  onChange={e => {
                    const v = +e.target.value;
                    if (f.key === 'w') setRoom(v, roomD, wallH);
                    if (f.key === 'd') setRoom(roomW, v, wallH);
                    if (f.key === 'h') setRoom(roomW, roomD, v);
                  }}
                  className="flex-1 bg-white/6 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                />
                <span className="text-xs text-white/30">{f.unit}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center text-white/20 text-xs mt-8">
          Выберите объект<br/>на сцене
        </div>
      </div>
    );
  }

  return (
    <div className="w-56 flex-shrink-0 flex flex-col border-l border-white/8 overflow-y-auto"
         style={{ background: 'rgba(5,5,7,0.88)' }}>
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/8">
          <span className="text-xl">{item.emoji}</span>
          <div>
            <div className="text-sm font-bold text-white">{item.name}</div>
            <div className="text-xs text-white/30">{item.brand}</div>
          </div>
        </div>

        {/* Info */}
        <div className="panel-section">
          <div className="panel-label">Размеры</div>
          <div className="text-xs text-white/50 space-y-1">
            <div>{item.w} × {item.d} × {item.h} м</div>
            <div>{item.weight} кг</div>
          </div>
        </div>

        {/* Position */}
        <div className="panel-section">
          <div className="panel-label">Позиция</div>
          <div className="space-y-1.5">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis} className="flex items-center gap-2">
                <label className="text-xs text-white/40 w-4">{axis}</label>
                <input
                  type="number"
                  step={0.1}
                  value={Math.round(obj.position[i] * 100) / 100}
                  onChange={e => {
                    const pos = [...obj.position] as [number, number, number];
                    pos[i] = +e.target.value;
                    updateObject(obj.uuid, { position: pos });
                  }}
                  className="flex-1 bg-white/6 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="panel-section">
          <div className="panel-label">Поворот Y</div>
          <div className="flex items-center gap-2">
            <input
              type="range" min={0} max={360}
              value={Math.round(obj.rotation[1] * 180 / Math.PI)}
              onChange={e => {
                const rot = [...obj.rotation] as [number, number, number];
                rot[1] = +e.target.value * Math.PI / 180;
                updateObject(obj.uuid, { rotation: rot });
              }}
              className="flex-1"
            />
            <span className="text-xs text-yellow-500 w-8 text-right">
              {Math.round(obj.rotation[1] * 180 / Math.PI)}°
            </span>
          </div>
        </div>

        {/* Scale */}
        <div className="panel-section">
          <div className="panel-label">Масштаб</div>
          <div className="flex items-center gap-2">
            <input
              type="range" min={0.5} max={3} step={0.05}
              value={obj.scale}
              onChange={e => updateObject(obj.uuid, { scale: +e.target.value })}
              className="flex-1"
            />
            <span className="text-xs text-yellow-500 w-10 text-right">{obj.scale.toFixed(2)}×</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-1.5 mt-4">
          <button
            onClick={() => duplicateObject(obj.uuid)}
            className="w-full btn-ghost text-center"
          >
            Дублировать
          </button>
          <button
            onClick={() => removeObject(obj.uuid)}
            className="w-full py-1.5 rounded text-xs font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
