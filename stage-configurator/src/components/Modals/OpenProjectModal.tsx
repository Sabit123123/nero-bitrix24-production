'use client';
import { useEffect, useState } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { Project } from '@/types';

interface OpenProjectModalProps {
  onClose: () => void;
}

export function OpenProjectModal({ onClose }: OpenProjectModalProps) {
  const { listProjects, loadProject, deleteProject, cloudEnabled } = useConfiguratorStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects().then(p => { setProjects(p); setLoading(false); });
  }, [listProjects]);

  const handleLoad = (p: Project) => {
    loadProject(p);
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Удалить проект?')) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-[480px] max-h-[70vh] flex flex-col rounded-lg border border-white/10" style={{ background: 'rgba(10,10,15,0.98)' }}>
        <div className="flex items-center justify-between p-4 border-b border-white/8">
          <div>
            <h2 className="font-bold text-white">Открыть проект</h2>
            <p className="text-xs text-white/30 mt-0.5">
              {cloudEnabled ? '☁️ Облачное хранилище (Supabase)' : '💾 Локальное хранилище'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading && (
            <div className="text-center py-12 text-white/30 text-sm">Загрузка...</div>
          )}
          {!loading && projects.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">
              <div className="text-3xl mb-3">📭</div>
              Нет сохранённых проектов
            </div>
          )}
          {projects.map(p => (
            <div
              key={p.id || p.name}
              onClick={() => handleLoad(p)}
              className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-white/5 hover:border-white/10 cursor-pointer transition-all group"
            >
              {p.thumbnail ? (
                <img src={p.thumbnail} alt="" className="w-16 h-10 rounded object-cover flex-shrink-0 border border-white/10" />
              ) : (
                <div className="w-16 h-10 rounded flex-shrink-0 border border-white/8 flex items-center justify-center text-xl" style={{ background: '#0a0a14' }}>🎭</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{p.name}</div>
                <div className="text-xs text-white/40">{p.client || '—'} · {p.venue || '—'}</div>
                <div className="text-xs text-white/25">{p.date} · {(p.objects ?? []).length} объектов · {p.roomW}×{p.roomD}м</div>
              </div>
              <button
                onClick={e => p.id && handleDelete(e, p.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
