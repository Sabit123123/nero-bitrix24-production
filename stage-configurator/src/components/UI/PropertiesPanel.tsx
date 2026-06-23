'use client';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';

function NumInput({ label, value, step = 0.1, onChange }: {
  label: string; value: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-white/40 w-4">{label}</label>
      <input
        type="number"
        step={step}
        value={Math.round(value * 1000) / 1000}
        onChange={e => onChange(+e.target.value)}
        className="flex-1 bg-white/6 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-yellow-500/40"
      />
    </div>
  );
}

export function PropertiesPanel() {
  const {
    selectedId, objects, updateObject, removeObject, duplicateObject,
    roomW, roomD, wallH, setRoom,
  } = useConfiguratorStore();

  const obj = objects.find(o => o.uuid === selectedId);
  const item = obj ? EQUIPMENT.find(e => e.id === obj.itemId) : null;

  // ── Nothing selected — show room controls ──
  if (!obj) {
    return (
      <div className="w-56 flex-shrink-0 flex flex-col border-l border-white/8 p-3"
           style={{ background: 'rgba(5,5,7,0.88)' }}>
        <div className="panel-section">
          <div className="panel-label">Размеры зала</div>
          <div className="space-y-2">
            {([
              { label: 'Ш', val: roomW, key: 'w', unit: 'м' },
              { label: 'Г', val: roomD, key: 'd', unit: 'м' },
              { label: 'В', val: wallH, key: 'h', unit: 'м' },
            ] as const).map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <label className="text-xs text-white/40 w-4">{f.label}</label>
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
          Выберите объект<br />на сцене
        </div>
      </div>
    );
  }

  const pos = obj.position;
  const rot = obj.rotation;
  const setPos = (i: number, v: number) => {
    const p = [...pos] as [number, number, number]; p[i] = v;
    updateObject(obj.uuid, { position: p });
  };
  const setRot = (i: number, deg: number) => {
    const r = [...rot] as [number, number, number]; r[i] = deg * Math.PI / 180;
    updateObject(obj.uuid, { rotation: r });
  };

  // ── Object selected ──
  return (
    <div className="w-56 flex-shrink-0 flex flex-col border-l border-white/8 overflow-y-auto"
         style={{ background: 'rgba(5,5,7,0.88)' }}>
      <div className="p-3">

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/8">
          <span className="text-xl">{item?.emoji ?? '📦'}</span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{obj.name}</div>
            <div className="text-xs text-white/30">{item?.brand ?? (obj.isCustom ? '3D модель' : '')}</div>
          </div>
        </div>

        {/* Specs — only for catalog items */}
        {item && (
          <div className="panel-section">
            <div className="panel-label">Размеры</div>
            <div className="text-xs text-white/50 space-y-0.5">
              <div>{item.w} × {item.d} × {item.h} м</div>
              <div>{item.weight} кг</div>
            </div>
          </div>
        )}

        {/* Position */}
        <div className="panel-section">
          <div className="panel-label">Позиция</div>
          <div className="space-y-1.5">
            <NumInput label="X" value={pos[0]} onChange={v => setPos(0, v)} />
            <NumInput label="Y" value={pos[1]} onChange={v => setPos(1, v)} />
            <NumInput label="Z" value={pos[2]} onChange={v => setPos(2, v)} />
          </div>
        </div>

        {/* Rotation */}
        <div className="panel-section">
          <div className="panel-label">Поворот</div>
          <div className="space-y-2">
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <div key={axis} className="flex items-center gap-2">
                <label className="text-xs text-white/40 w-4">{axis}</label>
                <input
                  type="range" min={0} max={360}
                  value={Math.round(rot[i] * 180 / Math.PI)}
                  onChange={e => setRot(i, +e.target.value)}
                  className="flex-1"
                />
                <span className="text-xs text-yellow-500 w-8 text-right">
                  {Math.round(rot[i] * 180 / Math.PI)}°
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="panel-section">
          <div className="panel-label">Масштаб</div>
          <div className="flex items-center gap-2">
            <input
              type="range" min={0.1} max={5} step={0.05}
              value={obj.scale}
              onChange={e => updateObject(obj.uuid, { scale: +e.target.value })}
              className="flex-1"
            />
            <span className="text-xs text-yellow-500 w-10 text-right">{obj.scale.toFixed(2)}×</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="panel-section">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={obj.visible}
              onChange={e => updateObject(obj.uuid, { visible: e.target.checked })}
              className="accent-yellow-500"
            />
            <span className="text-xs text-white/60">Видимость</span>
          </label>
        </div>

        {/* Actions */}
        <div className="space-y-1.5 mt-3">
          <button onClick={() => duplicateObject(obj.uuid)} className="w-full btn-ghost text-center text-xs">
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
