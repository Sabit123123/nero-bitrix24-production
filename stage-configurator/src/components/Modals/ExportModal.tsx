'use client';
import { useConfiguratorStore } from '@/store/configurator-store';
import { exportPNG, exportProjectPDF, buildEquipmentSummary } from '@/lib/export';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { project, objects, setProjectMeta } = useConfiguratorStore();
  const { totalWeight, total } = buildEquipmentSummary(objects);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-96 rounded-lg border border-white/10 p-5" style={{ background: 'rgba(10,10,15,0.98)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">📄 Экспорт проекта</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="panel-label block">Клиент</label>
            <input value={project.client} onChange={e => setProjectMeta({ client: e.target.value })}
              className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
          </div>
          <div>
            <label className="panel-label block">Площадка</label>
            <input value={project.venue} onChange={e => setProjectMeta({ venue: e.target.value })}
              className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
          </div>

          <div className="bg-white/4 rounded p-3 text-xs space-y-1 border border-white/8">
            <div className="flex justify-between"><span className="text-white/40">Объектов:</span><span className="text-white font-bold">{total} шт</span></div>
            <div className="flex justify-between"><span className="text-white/40">Общий вес:</span><span className="text-white font-bold">~{Math.round(totalWeight)} кг</span></div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => exportPNG(project.name)} className="flex-1 btn-ghost py-2">PNG</button>
            <button onClick={() => exportProjectPDF(project, objects)} className="flex-1 btn-gold py-2">PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
