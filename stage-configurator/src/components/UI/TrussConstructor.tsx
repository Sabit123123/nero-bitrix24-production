'use client';
import { useState } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { TrussConfig } from '@/types';

interface TrussConstructorProps {
  onClose: () => void;
}

export function TrussConstructor({ onClose }: TrussConstructorProps) {
  const { addTruss } = useConfiguratorStore();
  const [config, setConfig] = useState<TrussConfig>({
    type: '290',
    shape: 'straight',
    length: 4,
    width: 4,
    height: 3,
    depth: 2,
  });

  const update = <K extends keyof TrussConfig>(k: K, v: TrussConfig[K]) =>
    setConfig(c => ({ ...c, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-96 rounded-lg border border-white/10 p-5" style={{ background: 'rgba(10,10,15,0.98)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">🔩 Конструктор ферм</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          {/* Type */}
          <div>
            <label className="panel-label block">Тип фермы</label>
            <div className="flex gap-2">
              {(['290', '300', '400'] as const).map(t => (
                <button key={t} onClick={() => update('type', t)}
                  className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${
                    config.type === t ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/8' : 'border-white/10 text-white/50'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Shape */}
          <div>
            <label className="panel-label block">Форма</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: 'straight', l: 'Прямая' },
                { v: 'totem', l: 'Тотем' },
                { v: 'p-shape', l: 'П-образная' },
                { v: 'square', l: 'Квадрат' },
                { v: 'roof', l: 'Крыша' },
              ] as const).map(s => (
                <button key={s.v} onClick={() => update('shape', s.v)}
                  className={`py-1.5 rounded text-xs font-bold border transition-all ${
                    config.shape === s.v ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/8' : 'border-white/10 text-white/50'
                  }`}
                >{s.l}</button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="panel-label block">Длина (м)</label>
            <input type="number" min={1} max={20} step={0.5} value={config.length}
              onChange={e => update('length', +e.target.value)}
              className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
            />
          </div>

          <button
            onClick={() => {
              addTruss(config, [0, (config.height || 3) / 2, -3]);
              onClose();
            }}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded transition-colors"
          >
            Создать ферму
          </button>
        </div>
      </div>
    </div>
  );
}
