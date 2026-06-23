'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="text-yellow-500 text-sm font-bold tracking-[0.3em] uppercase mb-4">New Direction</div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          Stage Configurator
        </h1>
        <p className="text-white/50 text-lg mb-10 leading-relaxed">
          Простой 3D-конфигуратор для концертных площадок.<br/>
          Собери сцену за 5–10 минут.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/configurator" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base px-8 py-3 rounded transition-colors">
            Создать сцену
          </Link>
          <Link
            href="/configurator"
            className="border border-white/20 text-white/70 hover:border-yellow-500/60 hover:text-yellow-400 font-bold text-base px-8 py-3 rounded transition-all"
          >
            Открыть проект
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          {[
            { icon: '🎭', title: 'Звук, свет, LED', desc: 'Полная библиотека концертного оборудования' },
            { icon: '⚡', title: 'Быстро', desc: 'Drag & drop. Собери сцену за 5–10 минут' },
            { icon: '📄', title: 'Экспорт PDF', desc: 'Список оборудования и рендер для клиента' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/8 rounded-lg p-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-white mb-1">{f.title}</div>
              <div className="text-white/50 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
