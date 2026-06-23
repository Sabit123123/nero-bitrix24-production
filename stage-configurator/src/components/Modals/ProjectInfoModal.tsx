'use client';
import { useConfiguratorStore } from '@/store/configurator-store';

interface Props { onClose: () => void }

export function ProjectInfoModal({ onClose }: Props) {
  const { project, setProjectMeta } = useConfiguratorStore();

  const field = (label: string, key: keyof typeof project, multiline = false) => (
    <div className="space-y-1">
      <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={(project[key] as string) ?? ''}
          onChange={e => setProjectMeta({ [key]: e.target.value })}
          rows={4}
          className="w-full bg-white/6 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/40 resize-none"
        />
      ) : (
        <input
          type={key === 'date' ? 'date' : 'text'}
          value={(project[key] as string) ?? ''}
          onChange={e => setProjectMeta({ [key]: e.target.value })}
          className="w-full bg-white/6 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/40"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[440px] rounded-xl border border-white/10 p-6 flex flex-col gap-4"
           style={{ background: 'rgba(8,8,12,0.98)', backdropFilter: 'blur(20px)' }}>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-base">Информация о проекте</div>
            <div className="text-xs text-white/30 mt-0.5">Используется в PDF-райдере</div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        {field('Название проекта', 'name')}
        {field('Клиент / Заказчик', 'client')}
        {field('Площадка / Venue', 'venue')}
        {field('Дата мероприятия', 'date')}
        {field('Примечания к райдеру', 'notes', true)}

        <button
          onClick={onClose}
          className="mt-2 py-2 rounded-lg text-sm font-bold"
          style={{ background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.4)', color: '#C9A227' }}
        >
          Готово
        </button>
      </div>
    </div>
  );
}
