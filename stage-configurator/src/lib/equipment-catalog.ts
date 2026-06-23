import { EquipmentItem } from '@/types';

export const EQUIPMENT: EquipmentItem[] = [
  // AUDIO
  { id:'tpa_tava_400', cat:'audio', name:'TPA Tava 400', emoji:'🔊', w:.56, d:.55, h:.76, weight:55, brand:'TPA', color:'#1a1a1a', audioType:'linearray', coverageAngle:90, coverageRadius:20 },
  { id:'tpa_sub_1500', cat:'audio', name:'TPA Tava Sub 1500', emoji:'🔊', w:.56, d:.7, h:.76, weight:78, brand:'TPA', color:'#111111', audioType:'sub', coverageAngle:360, coverageRadius:10 },
  { id:'la12x', cat:'audio', name:'d&b LA12X', emoji:'🔊', w:.4, d:.5, h:.6, weight:45, brand:'d&b audiotechnik', color:'#1c1c1c', audioType:'linearray', coverageAngle:90, coverageRadius:25 },
  { id:'v_sub', cat:'audio', name:'d&b V-SUB', emoji:'🔊', w:.56, d:.7, h:.7, weight:85, brand:'d&b audiotechnik', color:'#111111', audioType:'sub', coverageAngle:360, coverageRadius:12 },
  { id:'yi12', cat:'audio', name:'d&b Yi12', emoji:'🎙', w:.36, d:.4, h:.36, weight:18, brand:'d&b audiotechnik', color:'#1a1a1a', audioType:'monitor', coverageAngle:80, coverageRadius:4 },
  { id:'front_fill', cat:'audio', name:'Фронтфилл FF', emoji:'🔉', w:.5, d:.3, h:.2, weight:12, brand:'Generic', color:'#222222', audioType:'frontfill', coverageAngle:180, coverageRadius:6 },
  { id:'delay_top', cat:'audio', name:'Delay Tower', emoji:'🔊', w:.4, d:.5, h:.6, weight:42, brand:'Generic', color:'#1a1a1a', audioType:'delay', coverageAngle:60, coverageRadius:15 },

  // LIGHT
  { id:'mac_aura_xb', cat:'light', name:'MAC Aura XB', emoji:'💡', w:.3, d:.35, h:.52, weight:13.5, brand:'Martin', color:'#222233', beamColor:'#ffffff', beamAngle:0.05 },
  { id:'bsw350', cat:'light', name:'BSW 350', emoji:'💡', w:.35, d:.35, h:.58, weight:18, brand:'GLP', color:'#1a1a22', beamColor:'#ffffff', beamAngle:0.04 },
  { id:'mac_quantum', cat:'light', name:'MAC Quantum Wash', emoji:'🔦', w:.35, d:.37, h:.62, weight:18, brand:'Martin', color:'#222233', beamColor:'#ff6600', beamAngle:0.35 },
  { id:'led_par', cat:'light', name:'LED PAR 64', emoji:'🔆', w:.22, d:.22, h:.35, weight:3.2, brand:'Generic', color:'#111122', beamColor:'#ffffff', beamAngle:0.25 },
  { id:'strobo', cat:'light', name:'Atomic Strobe', emoji:'⚡', w:.52, d:.3, h:.18, weight:8, brand:'Martin', color:'#2a2a2a', beamColor:'#ffffff', beamAngle:0.4 },
  { id:'follow_spot', cat:'light', name:'Направленный луч', emoji:'🎯', w:.3, d:.3, h:.55, weight:22, brand:'Generic', color:'#332211', beamColor:'#ffffff', beamAngle:0.05 },
  { id:'hazer_600', cat:'light', name:'Hazer 600', emoji:'🌫️', w:.4, d:.5, h:.3, weight:12, brand:'Generic', color:'#333344', fogMaker:true },
  { id:'hazer_1500', cat:'light', name:'Hazer 1500', emoji:'🌫️', w:.55, d:.65, h:.4, weight:18, brand:'Generic', color:'#333344', fogMaker:true },
  { id:'laser_show', cat:'light', name:'Лазер шоу', emoji:'🔴', w:.22, d:.3, h:.14, weight:5, brand:'Generic', color:'#220011', laser:true },

  // LED
  { id:'led_cab_500', cat:'led', name:'Кабинет 500×500', emoji:'📺', w:.5, d:.1, h:.5, weight:7, brand:'Dicolor', color:'#050510' },
  { id:'led_cab_1000', cat:'led', name:'Кабинет 500×1000', emoji:'📺', w:.5, d:.1, h:1.0, weight:13, brand:'Dicolor', color:'#050510' },
  { id:'dicolor_p391', cat:'led', name:'Dicolor P3.91', emoji:'📺', w:.5, d:.08, h:.5, weight:6.5, brand:'Dicolor', color:'#050510' },
  { id:'led_proc', cat:'led', name:'LED Процессор', emoji:'🖥️', w:.48, d:.28, h:.09, weight:8, brand:'Generic', color:'#1a1a1a' },

  // TRUSS
  { id:'truss_290_1m', cat:'truss', name:'Ферма 290 1м', emoji:'🔩', w:1.0, d:.29, h:.29, weight:6, brand:'Generic', color:'#888888' },
  { id:'truss_290_2m', cat:'truss', name:'Ферма 290 2м', emoji:'🔩', w:2.0, d:.29, h:.29, weight:12, brand:'Generic', color:'#888888' },
  { id:'truss_300_2m', cat:'truss', name:'Ферма 300 2м', emoji:'🔩', w:2.0, d:.30, h:.30, weight:14, brand:'Generic', color:'#999999' },
  { id:'truss_400_2m', cat:'truss', name:'Ферма 400 2м', emoji:'🔩', w:2.0, d:.40, h:.40, weight:22, brand:'Generic', color:'#aaaaaa' },
  { id:'corner_290', cat:'truss', name:'Угол 290', emoji:'🔩', w:.29, d:.29, h:.29, weight:4, brand:'Generic', color:'#888888' },
  { id:'leg_290_3m', cat:'truss', name:'Нога 290 3м', emoji:'🔩', w:.29, d:.29, h:3.0, weight:18, brand:'Generic', color:'#888888' },

  // STAGE
  { id:'stage_2x1', cat:'stage', name:'Подиум 2×1м', emoji:'🎭', w:2.0, d:1.0, h:.8, weight:65, brand:'Generic', color:'#4a3828' },
  { id:'stage_1x1', cat:'stage', name:'Подиум 1×1м', emoji:'🎭', w:1.0, d:1.0, h:.8, weight:32, brand:'Generic', color:'#4a3828' },
  { id:'stair_2', cat:'stage', name:'Лестница 2-ступ.', emoji:'🪜', w:.8, d:.6, h:.4, weight:18, brand:'Generic', color:'#3a2818' },
  { id:'backdrop_6x4', cat:'stage', name:'Фон 6×4м', emoji:'🎪', w:6.0, d:.1, h:4.0, weight:25, brand:'Generic', color:'#111111' },

  // STRUCTURE
  { id:'totem_290', cat:'structure', name:'Тотем 290', emoji:'🏗️', w:.29, d:.29, h:4.0, weight:35, brand:'Generic', color:'#777777' },
  { id:'compact_totem', cat:'structure', name:'Compact Totem', emoji:'🏗️', w:.25, d:.25, h:3.0, weight:22, brand:'Generic', color:'#888888' },
];

export const CATEGORIES = [
  { id: 'all',       label: 'Все',          emoji: '📦' },
  { id: 'audio',     label: 'Звук',         emoji: '🔊' },
  { id: 'light',     label: 'Свет',         emoji: '💡' },
  { id: 'led',       label: 'LED',          emoji: '📺' },
  { id: 'truss',     label: 'Фермы',        emoji: '🔩' },
  { id: 'stage',     label: 'Сцена',        emoji: '🎭' },
  { id: 'structure', label: 'Конструкции',  emoji: '🏗️' },
];
