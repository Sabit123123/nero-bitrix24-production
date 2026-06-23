'use client';
import { useState } from 'react';
import { EQUIPMENT, CATEGORIES } from '@/lib/equipment-catalog';
import { EquipmentItem } from '@/types';
import { useConfiguratorStore } from '@/store/configurator-store';

export function EquipmentLibrary() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const { addObject } = useConfiguratorStore();

  const filtered = EQUIPMENT.filter(item =>
    (activeCat === 'all' || item.cat === activeCat) &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()) || item.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDragStart = (e: React.DragEvent, item: EquipmentItem) => {
    e.dataTransfer.setData('application/nd-equipment', item.id);
  };

  const handleClick = (item: EquipmentItem) => {
    addObject(item.id, [0, item.h / 2, 0]);
  };

  const catColors: Record<string, string> = {
    audio: '#2244ff', light: '#ffdd00', led: '#00aaff',
    truss: '#888888', stage: '#aa6622', structure: '#666666', decor: '#aa44aa'
  };

  return (
    <div className="w-64 flex-shrink-0 flex flex-col border-r border-white/8"
         style={{ background: 'rgba(5,5,7,0.88)' }}>

      <div className="p-2 border-b border-white/8">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск оборудования..."
          className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none placeholder-white/30"
        />
      </div>

      <div className="flex flex-wrap gap-1 p-2 border-b border-white/8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-2 py-1 text-xs font-bold rounded border transition-all ${
              activeCat === cat.id
                ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/8'
                : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={e => handleDragStart(e, item)}
            onClick={() => handleClick(item)}
            className="flex items-center gap-2 p-2 rounded border border-transparent hover:bg-white/5 hover:border-white/10 cursor-grab active:cursor-grabbing transition-all group"
          >
            <div
              className="relative w-9 h-9 rounded flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${catColors[item.cat] || '#333333'}20` }}
            >
              {item.emoji}
              <span
                className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ background: catColors[item.cat] }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{item.name}</div>
              <div className="text-xs text-white/30">{item.w}×{item.d}м · {item.weight}кг</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-white/30 text-xs">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
