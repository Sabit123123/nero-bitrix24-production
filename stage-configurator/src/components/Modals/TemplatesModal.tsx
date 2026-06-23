'use client';
import { useConfiguratorStore } from '@/store/configurator-store';

const TEMPLATES = [
  {
    id: 'wedding', name: '🎊 Свадьба', desc: 'Зал 12×8м, сцена, L/R звук, свет',
    setup: (store: ReturnType<typeof useConfiguratorStore.getState>) => {
      store.setRoom(12, 8, 3.5);
      store.clearAll();
      store.addObject('stage_2x1', [0, 0.4, -2]);
      store.addObject('stage_2x1', [2, 0.4, -2]);
      store.addObject('stage_2x1', [-2, 0.4, -2]);
      store.addObject('tpa_tava_400', [-4, 0.3, -2]);
      store.addObject('tpa_tava_400', [4, 0.3, -2]);
      store.addObject('tpa_sub_1500', [-3, 0.38, -2]);
      store.addObject('tpa_sub_1500', [3, 0.38, -2]);
      store.addObject('mac_aura_xb', [-2, 0.26, -3.5]);
      store.addObject('mac_aura_xb', [0, 0.26, -3.5]);
      store.addObject('mac_aura_xb', [2, 0.26, -3.5]);
      store.addObject('led_par', [-1, 0.175, -3.8]);
      store.addObject('led_par', [1, 0.175, -3.8]);
      store.addObject('backdrop_6x4', [0, 2, -3.9]);
    }
  },
  {
    id: 'concert', name: '🎵 Концерт', desc: 'Зал 20×15м, большая сцена, полный риг',
    setup: (store: ReturnType<typeof useConfiguratorStore.getState>) => {
      store.setRoom(20, 15, 6);
      store.clearAll();
      for (let i = -3; i <= 3; i++) store.addObject('stage_2x1', [i * 2, 0.4, -5]);
      store.addObject('tpa_tava_400', [-7, 0.3, -3]);
      store.addObject('tpa_tava_400', [7, 0.3, -3]);
      store.addObject('tpa_sub_1500', [-5, 0.38, -5]);
      store.addObject('tpa_sub_1500', [-3, 0.38, -5]);
      store.addObject('tpa_sub_1500', [3, 0.38, -5]);
      store.addObject('tpa_sub_1500', [5, 0.38, -5]);
      for (let i = -2; i <= 2; i++) store.addObject('mac_aura_xb', [i * 2, 0.26, -6]);
      store.addObject('bsw350', [-3, 0.29, -6]);
      store.addObject('bsw350', [3, 0.29, -6]);
      store.addObject('hazer_600', [0, 0.16, -5.5]);
    }
  },
  {
    id: 'corporate', name: '💼 Корпоратив', desc: 'Зал 15×10м, сцена, умеренный звук',
    setup: (store: ReturnType<typeof useConfiguratorStore.getState>) => {
      store.setRoom(15, 10, 4);
      store.clearAll();
      store.addObject('stage_2x1', [-2, 0.4, -3]);
      store.addObject('stage_2x1', [0, 0.4, -3]);
      store.addObject('stage_2x1', [2, 0.4, -3]);
      store.addObject('la12x', [-5, 0.3, 0]);
      store.addObject('la12x', [5, 0.3, 0]);
      store.addObject('v_sub', [-3, 0.35, -3]);
      store.addObject('v_sub', [3, 0.35, -3]);
      store.addObject('mac_quantum', [-1, 0.31, -4]);
      store.addObject('mac_quantum', [1, 0.31, -4]);
    }
  },
  {
    id: 'club', name: '🎧 Клуб', desc: 'Зал 8×6м, сабы везде, beam свет',
    setup: (store: ReturnType<typeof useConfiguratorStore.getState>) => {
      store.setRoom(8, 6, 3.5);
      store.clearAll();
      store.addObject('tpa_sub_1500', [-2, 0.38, -2]);
      store.addObject('tpa_sub_1500', [0, 0.38, -2]);
      store.addObject('tpa_sub_1500', [2, 0.38, -2]);
      store.addObject('tpa_tava_400', [-3, 0.3, 0]);
      store.addObject('tpa_tava_400', [3, 0.3, 0]);
      store.addObject('bsw350', [-1, 0.29, -2.5]);
      store.addObject('bsw350', [1, 0.29, -2.5]);
      store.addObject('mac_aura_xb', [0, 0.26, -2.5]);
      store.addObject('hazer_1500', [0, 0.2, 0]);
      store.addObject('laser_show', [-1, 0.07, 0]);
    }
  },
  {
    id: 'conference', name: '🎤 Конференция', desc: 'Зал 10×8м, кафедра, front fill',
    setup: (store: ReturnType<typeof useConfiguratorStore.getState>) => {
      store.setRoom(10, 8, 3.5);
      store.clearAll();
      store.addObject('stage_1x1', [0, 0.4, -2]);
      store.addObject('front_fill', [-2, 0.1, -2]);
      store.addObject('front_fill', [2, 0.1, -2]);
      store.addObject('delay_top', [0, 0.3, 1]);
      store.addObject('mac_quantum', [-1, 0.31, -2.5]);
      store.addObject('mac_quantum', [1, 0.31, -2.5]);
    }
  },
];

interface TemplatesModalProps {
  onClose: () => void;
}

export function TemplatesModal({ onClose }: TemplatesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-[480px] rounded-lg border border-white/10 p-5" style={{ background: 'rgba(10,10,15,0.98)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Шаблоны сцен</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => { t.setup(useConfiguratorStore.getState()); onClose(); }}
              className="p-4 rounded-lg border border-white/10 hover:border-yellow-500/40 hover:bg-yellow-500/4 text-left transition-all group"
            >
              <div className="text-xl mb-1">{t.name.split(' ')[0]}</div>
              <div className="text-sm font-bold text-white mb-1">{t.name.slice(2)}</div>
              <div className="text-xs text-white/40">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
