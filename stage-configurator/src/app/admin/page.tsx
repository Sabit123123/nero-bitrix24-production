'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModelImporter } from '@/components/UI/ModelImporter';
import { listCustomEquipment, deleteCustomEquipment, CustomEquipment } from '@/lib/equipment-storage';
import { EQUIPMENT } from '@/lib/equipment-catalog';

export default function AdminPage() {
  const [custom, setCustom] = useState<CustomEquipment[]>([]);
  const [showImporter, setShowImporter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCustomEquipment().then(items => { setCustom(items); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить модель из каталога?')) return;
    await deleteCustomEquipment(id);
    setCustom(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen" style={{ background: '#050507', color: '#F5F0E8' }}>
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-3 flex items-center gap-4" style={{ background: 'rgba(5,5,7,0.92)' }}>
        <span className="text-yellow-500 font-black text-sm tracking-widest uppercase">ND</span>
        <div className="w-px h-5 bg-white/10" />
        <span className="text-white/60 text-sm font-semibold">Админ-панель</span>
        <div className="ml-auto flex gap-3">
          <Link href="/configurator" className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded transition-all">
            ← Конфигуратор
          </Link>
          <button
            onClick={() => setShowImporter(true)}
            className="text-xs font-bold px-4 py-1.5 rounded"
            style={{ background: '#C9A227', color: '#050507' }}
          >
            + Добавить модель
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Встроенных моделей', value: EQUIPMENT.length },
            { label: 'Своих моделей', value: custom.length },
            { label: 'Всего', value: EQUIPMENT.length + custom.length },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-lg border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-black text-yellow-500">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Custom equipment */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Свои 3D модели</h2>
            <span className="text-xs text-white/30">SKP / GLB / OBJ / FBX</span>
          </div>

          {loading && <div className="text-white/30 text-sm py-8 text-center">Загрузка...</div>}
          {!loading && custom.length === 0 && (
            <div
              onClick={() => setShowImporter(true)}
              className="border-2 border-dashed border-white/10 hover:border-yellow-500/30 rounded-xl p-12 text-center cursor-pointer transition-all group"
            >
              <div className="text-4xl mb-3">📦</div>
              <div className="text-white/60 font-semibold mb-1 group-hover:text-white transition-colors">
                Нет моделей
              </div>
              <div className="text-white/30 text-sm">Нажмите, чтобы добавить .skp или .glb</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {custom.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/8 hover:border-white/16 transition-all group">
                <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                  <div className="text-xs text-white/30">{item.brand || '—'} · {item.cat}</div>
                  <div className="text-xs text-white/20 truncate">{item.modelUrl.split('/').pop()}</div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-all"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Built-in catalog */}
        <div>
          <h2 className="font-bold text-white mb-4">Встроенный каталог ({EQUIPMENT.length} единиц)</h2>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 text-sm">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 truncate">{item.name}</div>
                  <div className="text-xs text-white/30">{item.brand} · {item.w}×{item.d}×{item.h}м · {item.weight}кг</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showImporter && (
        <ModelImporter
          onClose={() => setShowImporter(false)}
          onImported={item => setCustom(prev => [item, ...prev])}
        />
      )}
    </div>
  );
}
