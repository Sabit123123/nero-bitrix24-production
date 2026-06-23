import { EquipmentItem } from '@/types';

export const EQUIPMENT: EquipmentItem[] = [
  // ── AUDIO ────────────────────────────────────────────────────────────────
  { id:'tpa_tava_400',  cat:'audio', name:'TPA Tava 400',       emoji:'🔊', w:.56, d:.55, h:.76, weight:55,  brand:'TPA',              color:'#1a1a1a', audioType:'linearray',  coverageAngle:90,  coverageRadius:20 },
  { id:'tpa_sub_1500',  cat:'audio', name:'TPA Tava Sub 1500',  emoji:'🔊', w:.56, d:.70, h:.76, weight:78,  brand:'TPA',              color:'#111111', audioType:'sub',        coverageAngle:360, coverageRadius:10 },
  { id:'la12x',         cat:'audio', name:'d&b LA12X',          emoji:'🔊', w:.40, d:.50, h:.60, weight:45,  brand:'d&b audiotechnik', color:'#1c1c1c', audioType:'linearray',  coverageAngle:90,  coverageRadius:25 },
  { id:'v_sub',         cat:'audio', name:'d&b V-SUB',          emoji:'🔊', w:.56, d:.70, h:.70, weight:85,  brand:'d&b audiotechnik', color:'#111111', audioType:'sub',        coverageAngle:360, coverageRadius:12 },
  { id:'yi12',          cat:'audio', name:'d&b Yi12',           emoji:'🎙', w:.36, d:.40, h:.36, weight:18,  brand:'d&b audiotechnik', color:'#1a1a1a', audioType:'monitor',    coverageAngle:80,  coverageRadius:4  },
  { id:'k1',            cat:'audio', name:'L-Acoustics K1',     emoji:'🔊', w:.56, d:.69, h:.89, weight:56,  brand:'L-Acoustics',      color:'#f0f0e8', audioType:'linearray',  coverageAngle:90,  coverageRadius:30 },
  { id:'k2',            cat:'audio', name:'L-Acoustics K2',     emoji:'🔊', w:.40, d:.56, h:.74, weight:43,  brand:'L-Acoustics',      color:'#f0f0e8', audioType:'linearray',  coverageAngle:110, coverageRadius:25 },
  { id:'ksub',          cat:'audio', name:'L-Acoustics KS28',   emoji:'🔊', w:.56, d:.89, h:.56, weight:93,  brand:'L-Acoustics',      color:'#f0f0e8', audioType:'sub',        coverageAngle:360, coverageRadius:15 },
  { id:'mlab',          cat:'audio', name:'Meyer Sound MLAB',   emoji:'🔊', w:.24, d:.24, h:.34, weight:6.4, brand:'Meyer Sound',      color:'#d0c8b8', audioType:'frontfill',  coverageAngle:120, coverageRadius:5  },
  { id:'leo',           cat:'audio', name:'Meyer Sound LEO',    emoji:'🔊', w:.55, d:.72, h:.98, weight:104, brand:'Meyer Sound',      color:'#d0c8b8', audioType:'linearray',  coverageAngle:90,  coverageRadius:35 },
  { id:'front_fill',    cat:'audio', name:'Фронтфилл FF',       emoji:'🔉', w:.50, d:.30, h:.20, weight:12,  brand:'Generic',          color:'#222222', audioType:'frontfill',  coverageAngle:180, coverageRadius:6  },
  { id:'delay_top',     cat:'audio', name:'Delay Tower',        emoji:'🔊', w:.40, d:.50, h:.60, weight:42,  brand:'Generic',          color:'#1a1a1a', audioType:'delay',      coverageAngle:60,  coverageRadius:15 },
  { id:'amp_rack',      cat:'audio', name:'Рэк усилителей 6U',  emoji:'🎛️', w:.48, d:.50, h:.27, weight:40,  brand:'Generic',          color:'#1a1a1a' },
  { id:'dj_mixer',      cat:'audio', name:'DJ Микшер Pioneer',  emoji:'🎛️', w:.43, d:.35, h:.07, weight:8,   brand:'Pioneer DJ',       color:'#1a1a1a' },
  { id:'cdj3000',       cat:'audio', name:'CDJ-3000',           emoji:'💿', w:.32, d:.34, h:.10, weight:5.3, brand:'Pioneer DJ',       color:'#1a1a1a' },

  // ── LIGHT ────────────────────────────────────────────────────────────────
  { id:'mac_aura_xb',   cat:'light', name:'MAC Aura XB',        emoji:'💡', w:.30, d:.35, h:.52, weight:13.5, brand:'Martin',      color:'#222233', beamColor:'#ffffff', beamAngle:0.05 },
  { id:'bsw350',        cat:'light', name:'BSW 350',            emoji:'💡', w:.35, d:.35, h:.58, weight:18,   brand:'GLP',         color:'#1a1a22', beamColor:'#ffffff', beamAngle:0.04 },
  { id:'mac_quantum',   cat:'light', name:'MAC Quantum Wash',   emoji:'🔦', w:.35, d:.37, h:.62, weight:18,   brand:'Martin',      color:'#222233', beamColor:'#ff6600', beamAngle:0.35 },
  { id:'led_par',       cat:'light', name:'LED PAR 64',         emoji:'🔆', w:.22, d:.22, h:.35, weight:3.2,  brand:'Generic',     color:'#111122', beamColor:'#ffffff', beamAngle:0.25 },
  { id:'strobo',        cat:'light', name:'Atomic Strobe',      emoji:'⚡', w:.52, d:.30, h:.18, weight:8,    brand:'Martin',      color:'#2a2a2a', beamColor:'#ffffff', beamAngle:0.40 },
  { id:'follow_spot',   cat:'light', name:'Направленный луч',   emoji:'🎯', w:.30, d:.30, h:.55, weight:22,   brand:'Generic',     color:'#332211', beamColor:'#ffffff', beamAngle:0.05 },
  { id:'robe_bmfl',     cat:'light', name:'Robe BMFL Spot',     emoji:'💡', w:.38, d:.43, h:.71, weight:27,   brand:'Robe',        color:'#1a1a22', beamColor:'#ffffff', beamAngle:0.03 },
  { id:'clay_sharpy',   cat:'light', name:'Clay Paky Sharpy',   emoji:'💡', w:.25, d:.25, h:.64, weight:13.5, brand:'Clay Paky',   color:'#111122', beamColor:'#ffffff', beamAngle:0.02 },
  { id:'ayrton_ghibli', cat:'light', name:'Ayrton Ghibli',      emoji:'💡', w:.28, d:.31, h:.56, weight:16,   brand:'Ayrton',      color:'#1a1a22', beamColor:'#00aaff', beamAngle:0.04 },
  { id:'martin_mac700', cat:'light', name:'MAC 700 Profile',    emoji:'💡', w:.34, d:.40, h:.65, weight:22,   brand:'Martin',      color:'#222233', beamColor:'#ffffff', beamAngle:0.06 },
  { id:'led_bar',       cat:'light', name:'LED Баттен 1м',      emoji:'🌈', w:1.00,d:.08, h:.08, weight:4,    brand:'Generic',     color:'#111122', beamColor:'#ff00ff', beamAngle:0.50 },
  { id:'pixel_bar',     cat:'light', name:'Pixel Bar 2м',       emoji:'🌈', w:2.00,d:.08, h:.08, weight:7,    brand:'Generic',     color:'#111122', beamColor:'#ffaa00', beamAngle:0.50 },
  { id:'hazer_600',     cat:'light', name:'Hazer 600',          emoji:'🌫️', w:.40, d:.50, h:.30, weight:12,   brand:'Generic',     color:'#333344', fogMaker:true },
  { id:'hazer_1500',    cat:'light', name:'Hazer 1500',         emoji:'🌫️', w:.55, d:.65, h:.40, weight:18,   brand:'Generic',     color:'#333344', fogMaker:true },
  { id:'laser_show',    cat:'light', name:'Лазер шоу',          emoji:'🔴', w:.22, d:.30, h:.14, weight:5,    brand:'Generic',     color:'#220011', laser:true },
  { id:'laser_20w',     cat:'light', name:'Лазер 20W RGBA',     emoji:'🔴', w:.28, d:.32, h:.16, weight:7,    brand:'Generic',     color:'#220022', laser:true },

  // ── LED ──────────────────────────────────────────────────────────────────
  { id:'led_cab_500',   cat:'led', name:'Кабинет 500×500',      emoji:'📺', w:.50, d:.10, h:.50, weight:7,   brand:'Dicolor',   color:'#050510' },
  { id:'led_cab_1000',  cat:'led', name:'Кабинет 500×1000',     emoji:'📺', w:.50, d:.10, h:1.00,weight:13,  brand:'Dicolor',   color:'#050510' },
  { id:'dicolor_p391',  cat:'led', name:'Dicolor P3.91',        emoji:'📺', w:.50, d:.08, h:.50, weight:6.5, brand:'Dicolor',   color:'#050510' },
  { id:'absen_p25',     cat:'led', name:'Absen P2.5',           emoji:'📺', w:.50, d:.09, h:.50, weight:7.2, brand:'Absen',     color:'#050510' },
  { id:'led_proc',      cat:'led', name:'LED Процессор',        emoji:'🖥️', w:.48, d:.28, h:.09, weight:8,   brand:'Generic',   color:'#1a1a1a' },
  { id:'novastar_4k',   cat:'led', name:'Novastar 4K Scaler',   emoji:'🖥️', w:.48, d:.28, h:.09, weight:9,   brand:'Novastar',  color:'#1a1a1a' },
  { id:'media_server',  cat:'led', name:'Media Server',         emoji:'💻', w:.48, d:.48, h:.09, weight:15,  brand:'Disguise',  color:'#111111' },
  { id:'projector_10k', cat:'led', name:'Проектор 10000 лм',    emoji:'📽️', w:.60, d:.50, h:.22, weight:24,  brand:'Christie',  color:'#1a1a1a' },

  // ── TRUSS ────────────────────────────────────────────────────────────────
  { id:'truss_290_1m',  cat:'truss', name:'Ферма 290 1м',       emoji:'🔩', w:1.0, d:.29, h:.29, weight:6,  brand:'Generic', color:'#888888' },
  { id:'truss_290_2m',  cat:'truss', name:'Ферма 290 2м',       emoji:'🔩', w:2.0, d:.29, h:.29, weight:12, brand:'Generic', color:'#888888' },
  { id:'truss_290_3m',  cat:'truss', name:'Ферма 290 3м',       emoji:'🔩', w:3.0, d:.29, h:.29, weight:18, brand:'Generic', color:'#888888' },
  { id:'truss_300_2m',  cat:'truss', name:'Ферма 300 2м',       emoji:'🔩', w:2.0, d:.30, h:.30, weight:14, brand:'Generic', color:'#999999' },
  { id:'truss_400_2m',  cat:'truss', name:'Ферма 400 2м',       emoji:'🔩', w:2.0, d:.40, h:.40, weight:22, brand:'Generic', color:'#aaaaaa' },
  { id:'truss_400_3m',  cat:'truss', name:'Ферма 400 3м',       emoji:'🔩', w:3.0, d:.40, h:.40, weight:33, brand:'Generic', color:'#aaaaaa' },
  { id:'corner_290',    cat:'truss', name:'Угол 290',           emoji:'🔩', w:.29, d:.29, h:.29, weight:4,  brand:'Generic', color:'#888888' },
  { id:'corner_400',    cat:'truss', name:'Угол 400',           emoji:'🔩', w:.40, d:.40, h:.40, weight:6,  brand:'Generic', color:'#aaaaaa' },
  { id:'leg_290_2m',    cat:'truss', name:'Нога 290 2м',        emoji:'🔩', w:.29, d:.29, h:2.0, weight:12, brand:'Generic', color:'#888888' },
  { id:'leg_290_3m',    cat:'truss', name:'Нога 290 3м',        emoji:'🔩', w:.29, d:.29, h:3.0, weight:18, brand:'Generic', color:'#888888' },
  { id:'leg_290_4m',    cat:'truss', name:'Нога 290 4м',        emoji:'🔩', w:.29, d:.29, h:4.0, weight:24, brand:'Generic', color:'#888888' },
  { id:'base_plate',    cat:'truss', name:'Основание',          emoji:'🔩', w:.50, d:.50, h:.05, weight:8,  brand:'Generic', color:'#666666' },
  { id:'crank_stand',   cat:'truss', name:'Кран-стойка 4м',     emoji:'🔩', w:.60, d:.60, h:4.0, weight:45, brand:'Generic', color:'#777777' },

  // ── STAGE ────────────────────────────────────────────────────────────────
  { id:'stage_2x1',     cat:'stage', name:'Подиум 2×1м',        emoji:'🎭', w:2.0, d:1.0, h:.80, weight:65, brand:'Generic', color:'#2a2020' },
  { id:'stage_1x1',     cat:'stage', name:'Подиум 1×1м',        emoji:'🎭', w:1.0, d:1.0, h:.80, weight:32, brand:'Generic', color:'#2a2020' },
  { id:'stage_2x2',     cat:'stage', name:'Подиум 2×2м',        emoji:'🎭', w:2.0, d:2.0, h:.80, weight:90, brand:'Generic', color:'#2a2020' },
  { id:'stair_2',       cat:'stage', name:'Лестница 2-ступ.',   emoji:'🪜', w:.80, d:.60, h:.40, weight:18, brand:'Generic', color:'#1a1212' },
  { id:'stair_4',       cat:'stage', name:'Лестница 4-ступ.',   emoji:'🪜', w:.80, d:1.20,h:.80, weight:30, brand:'Generic', color:'#1a1212' },
  { id:'backdrop_6x4',  cat:'stage', name:'Задник 6×4м',        emoji:'🎪', w:6.0, d:.10, h:4.0, weight:25, brand:'Generic', color:'#0a0a0a' },
  { id:'backdrop_8x5',  cat:'stage', name:'Задник 8×5м',        emoji:'🎪', w:8.0, d:.10, h:5.0, weight:35, brand:'Generic', color:'#0a0a0a' },
  { id:'podium_dj',     cat:'stage', name:'DJ-стойка',          emoji:'🎛️', w:1.50,d:.80, h:1.1, weight:40, brand:'Generic', color:'#1a1a1a' },
  { id:'podium_lector', cat:'stage', name:'Кафедра',            emoji:'🎤', w:.60, d:.50, h:1.1, weight:20, brand:'Generic', color:'#2a2a2a' },
  { id:'table_8x2',     cat:'stage', name:'Банкетный стол 2м',  emoji:'🪑', w:2.0, d:.80, h:.75, weight:20, brand:'Generic', color:'#8a6a40' },
  { id:'chair',         cat:'stage', name:'Стул',               emoji:'🪑', w:.50, d:.50, h:.90, weight:5,  brand:'Generic', color:'#6a5040' },

  // ── STRUCTURE ────────────────────────────────────────────────────────────
  { id:'totem_290',     cat:'structure', name:'Тотем 290',      emoji:'🏗️', w:.29, d:.29, h:4.0, weight:35, brand:'Generic', color:'#777777' },
  { id:'totem_400',     cat:'structure', name:'Тотем 400',      emoji:'🏗️', w:.40, d:.40, h:5.0, weight:55, brand:'Generic', color:'#888888' },
  { id:'compact_totem', cat:'structure', name:'Compact Totem',  emoji:'🏗️', w:.25, d:.25, h:3.0, weight:22, brand:'Generic', color:'#888888' },
  { id:'goal_post',     cat:'structure', name:'Голпост 6м',     emoji:'🏗️', w:6.0, d:.29, h:4.5, weight:80, brand:'Generic', color:'#999999' },
  { id:'lighting_rig',  cat:'structure', name:'Световая рама',  emoji:'🏗️', w:4.0, d:.29, h:.29, weight:30, brand:'Generic', color:'#888888' },
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
