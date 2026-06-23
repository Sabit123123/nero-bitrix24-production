'use client';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import type { CustomEquipment } from '@/types';

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

const CAT_LABELS: Record<string, string> = {
  audio: 'Звук',
  light: 'Свет',
  led: 'LED',
  truss: 'Ферма',
  stage: 'Сцена',
  structure: 'Конструкция',
  decor: 'Декор',
};

const AUDIO_TYPE_LABELS: Record<string, string> = {
  sub: 'Сабвуфер',
  linearray: 'Линейный массив',
  monitor: 'Монитор',
  frontfill: 'Фронтфилл',
  delay: 'Дилей',
};

function CustomEquipmentConfig({ eq, onChange }: {
  eq: CustomEquipment;
  onChange: (patch: Partial<CustomEquipment>) => void;
}) {
  return (
    <div className="panel-section">
      <div className="panel-label">Тип оборудования</div>
      <div className="space-y-2">

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 w-16 flex-shrink-0">Категория</span>
          <select
            value={eq.cat}
            onChange={e => onChange({ cat: e.target.value as CustomEquipment['cat'] })}
            className="flex-1 bg-white/6 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
          >
            {Object.entries(CAT_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {eq.cat === 'light' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 w-16 flex-shrink-0">Цвет луча</span>
              <input
                type="color"
                value={eq.beamColor ?? '#ffffff'}
                onChange={e => onChange({ beamColor: e.target.value })}
                className="w-8 h-6 rounded border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-xs text-white/30">{eq.beamColor ?? '#ffffff'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 w-16 flex-shrink-0">Угол</span>
              <input
                type="range" min={5} max={60} step={1}
                value={eq.beamAngle ?? 25}
                onChange={e => onChange({ beamAngle: +e.target.value })}
                className="flex-1"
              />
              <span className="text-xs text-yellow-500 w-8 text-right">{eq.beamAngle ?? 25}°</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!eq.laser}
                onChange={e => onChange({ laser: e.target.checked })}
                className="accent-yellow-500"
              />
              <span className="text-xs text-white/60">Лазер</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!eq.fogMaker}
                onChange={e => onChange({ fogMaker: e.target.checked })}
                className="accent-yellow-500"
              />
              <span className="text-xs text-white/60">Генератор тумана</span>
            </label>
          </>
        )}

        {eq.cat === 'audio' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 w-16 flex-shrink-0">Тип</span>
              <select
                value={eq.audioType ?? 'linearray'}
                onChange={e => onChange({ audioType: e.target.value as CustomEquipment['audioType'] })}
                className="flex-1 bg-white/6 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
              >
                {Object.entries(AUDIO_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 w-16 flex-shrink-0">Угол охв.</span>
              <input
                type="range" min={10} max={180} step={5}
                value={eq.coverageAngle ?? 90}
                onChange={e => onChange({ coverageAngle: +e.target.value })}
                className="flex-1"
              />
              <span className="text-xs text-yellow-500 w-8 text-right">{eq.coverageAngle ?? 90}°</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 w-16 flex-shrink-0">Радиус</span>
              <input
                type="range" min={1} max={30} step={0.5}
                value={eq.coverageRadius ?? 10}
                onChange={e => onChange({ coverageRadius: +e.target.value })}
                className="flex-1"
              />
              <span className="text-xs text-yellow-500 w-8 text-right">{eq.coverageRadius ?? 10}м</span>
            </div>
          </>
        )}

      </div>
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
  const patchCustomEq = (patch: Partial<CustomEquipment>) => {
    if (!obj.customEquipment) return;
    updateObject(obj.uuid, { customEquipment: { ...obj.customEquipment, ...patch } });
  };

  const catLabel = obj.customEquipment ? (CAT_LABELS[obj.customEquipment.cat] ?? '3D модель') : '';
  const headerEmoji = item?.emoji
    ?? (obj.customEquipment?.cat === 'light' ? '💡' : obj.customEquipment?.cat === 'audio' ? '🔊' : '📦');

  return (
    <div className="w-56 flex-shrink-0 flex flex-col border-l border-white/8 overflow-y-auto"
         style={{ background: 'rgba(5,5,7,0.88)' }}>
      <div className="p-3">

        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/8">
          <span className="text-xl flex-shrink-0">{headerEmoji}</span>
          <div className="min-w-0 flex-1">
            <input
              value={obj.name}
              onChange={e => updateObject(obj.uuid, { name: e.target.value })}
              className="bg-transparent text-sm font-bold text-white outline-none w-full hover:bg-white/6 focus:bg-white/6 rounded px-1 -mx-1"
            />
            <div className="text-xs text-white/30 px-1">
              {item?.brand ?? catLabel ?? (obj.isCustom ? '3D модель' : '')}
            </div>
          </div>
        </div>

        {item && (
          <div className="panel-section">
            <div className="panel-label">Размеры</div>
            <div className="text-xs text-white/50 space-y-0.5">
              <div>{item.w} × {item.d} × {item.h} м</div>
              <div>{item.weight} кг</div>
            </div>
          </div>
        )}

        {obj.isCustom && obj.customEquipment && (
          <CustomEquipmentConfig eq={obj.customEquipment} onChange={patchCustomEq} />
        )}

        <div className="panel-section">
          <div className="panel-label">Позиция</div>
          <div className="space-y-1.5">
            <NumInput label="X" value={pos[0]} onChange={v => setPos(0, v)} />
            <NumInput label="Y" value={pos[1]} onChange={v => setPos(1, v)} />
            <NumInput label="Z" value={pos[2]} onChange={v => setPos(2, v)} />
          </div>
        </div>

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

        <div className="panel-section">
          <div className="panel-label">Заметка</div>
          <textarea
            value={obj.note ?? ''}
            onChange={e => updateObject(obj.uuid, { note: e.target.value })}
            placeholder="Комментарий для райдера..."
            rows={2}
            className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-yellow-500/40 resize-none placeholder:text-white/20"
          />
        </div>

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
