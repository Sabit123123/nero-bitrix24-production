'use client';
import { useState } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { LEDConfig } from '@/types';

interface LEDConstructorProps {
  onClose: () => void;
}

export function LEDConstructor({ onClose }: LEDConstructorProps) {
  const { addLEDScreen } = useConfiguratorStore();
  const [config, setConfig] = useState<LEDConfig>({
    cabinetW: 500,
    cabinetH: 500,
    countX: 8,
    countY: 6,
    shape: 'flat',
    curvature: 0,
    pixelPitch: 'P3.91',
  });

  const cW = config.cabinetW / 1000;
  const cH = config.cabinetH / 1000;
  const totalW = cW * config.countX;
  const totalH = cH * config.countY;
  const totalArea = totalW * totalH;
  const totalCabinets = config.countX * config.countY;
  const totalWeight = totalCabinets * (config.cabinetH === 500 ? 7 : 13);

  const update = <K extends keyof LEDConfig>(k: K, v: LEDConfig[K]) =>
    setConfig(c => ({ ...c, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-96 rounded-lg border border-white/10 p-5" style={{ background: 'rgba(10,10,15,0.98)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">📺 LED Конструктор</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          {/* Cabinet type */}
          <div>
            <label className="panel-label block">Тип кабинета</label>
            <div className="flex gap-2">
              {[{ w: 500, h: 500, label: '500×500' }, { w: 500, h: 1000, label: '500×1000' }].map(t => (
                <button
                  key={t.label}
                  onClick={() => update('cabinetH', t.h)}
                  className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${
                    config.cabinetH === t.h
                      ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/8'
                      : 'border-white/10 text-white/50 hover:border-white/30'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pixel pitch */}
          <div>
            <label className="panel-label block">Шаг пикселя</label>
            <div className="flex gap-2">
              {(['P2.6', 'P2.9', 'P3.91'] as const).map(p => (
                <button key={p} onClick={() => update('pixelPitch', p)}
                  className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${
                    config.pixelPitch === p ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/8' : 'border-white/10 text-white/50'
                  }`}
                >{p}</button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="panel-label block">По ширине</label>
              <input type="number" min={1} max={40} value={config.countX}
                onChange={e => update('countX', +e.target.value)}
                className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="panel-label block">По высоте</label>
              <input type="number" min={1} max={20} value={config.countY}
                onChange={e => update('countY', +e.target.value)}
                className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Shape */}
          <div>
            <label className="panel-label block">Форма</label>
            <div className="flex gap-2">
              {([{ v: 'flat', l: 'Плоский' }, { v: 'concave', l: 'Вогнутый' }, { v: 'convex', l: 'Выпуклый' }] as const).map(s => (
                <button key={s.v} onClick={() => update('shape', s.v)}
                  className={`flex-1 py-1.5 rounded text-xs font-bold border transition-all ${
                    config.shape === s.v ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/8' : 'border-white/10 text-white/50'
                  }`}
                >{s.l}</button>
              ))}
            </div>
          </div>

          {/* Curvature */}
          {config.shape !== 'flat' && (
            <div>
              <label className="panel-label block">Угол кривизны</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={15} value={config.curvature}
                  onChange={e => update('curvature', +e.target.value)} className="flex-1"
                />
                <span className="text-xs text-yellow-500 w-8">{config.curvature}°</span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white/4 rounded p-3 text-xs space-y-1 border border-white/8">
            <div className="flex justify-between"><span className="text-white/40">Размер экрана:</span><span className="text-white font-bold">{totalW.toFixed(2)} × {totalH.toFixed(2)} м</span></div>
            <div className="flex justify-between"><span className="text-white/40">Площадь:</span><span className="text-white font-bold">{totalArea.toFixed(2)} м²</span></div>
            <div className="flex justify-between"><span className="text-white/40">Кабинетов:</span><span className="text-white font-bold">{totalCabinets} шт</span></div>
            <div className="flex justify-between"><span className="text-white/40">Вес:</span><span className="text-white font-bold">~{totalWeight} кг</span></div>
          </div>

          <button
            onClick={() => {
              addLEDScreen(config, [0, totalH / 2, -2]);
              onClose();
            }}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded transition-colors"
          >
            Создать LED экран
          </button>
        </div>
      </div>
    </div>
  );
}
