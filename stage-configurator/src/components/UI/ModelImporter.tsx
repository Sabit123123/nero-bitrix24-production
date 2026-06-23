'use client';
import { useState, useCallback, useRef } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { convertModel } from '@/lib/model-converter';
import { saveCustomEquipment, CustomEquipment } from '@/lib/equipment-storage';

type Step = 'pick' | 'converting' | 'configure' | 'saving' | 'done' | 'error';

interface ModelImporterProps {
  onClose: () => void;
  onImported?: (item: CustomEquipment) => void;
  initialFile?: File | null;
}

const AUDIO_TYPES = [
  { id: 'linearray', label: 'Линейный массив' },
  { id: 'sub',       label: 'Сабвуфер' },
  { id: 'monitor',   label: 'Монитор' },
  { id: 'frontfill', label: 'Фронтфилл' },
  { id: 'delay',     label: 'Дилей' },
] as const;

const CATS = [
  { id: 'audio',     label: '🔊 Звук' },
  { id: 'light',     label: '💡 Свет' },
  { id: 'led',       label: '📺 LED' },
  { id: 'truss',     label: '🔩 Фермы' },
  { id: 'stage',     label: '🎭 Сцена' },
  { id: 'structure', label: '🏗️ Конструкции' },
] as const;

export function ModelImporter({ onClose, onImported, initialFile }: ModelImporterProps) {
  const [step, setStep] = useState<Step>('pick');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [dragging, setDragging] = useState(false);

  // Step 1 fields
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [name, setName] = useState(() => initialFile ? initialFile.name.replace(/\.[^.]+$/, '') : '');
  const [brand, setBrand] = useState('');
  const [cat, setCat] = useState<CustomEquipment['cat']>('structure');

  // Step 2 fields (configure)
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [w, setW] = useState(1.0);
  const [d, setD] = useState(1.0);
  const [h, setH] = useState(1.0);
  // audio
  const [audioType, setAudioType] = useState<string>('linearray');
  const [coverageAngle, setCoverageAngle] = useState(90);
  const [coverageRadius, setCoverageRadius] = useState(10);
  // light
  const [beamColor, setBeamColor] = useState('#ffffff');
  const [beamDeg, setBeamDeg] = useState(15);   // full-cone angle in degrees
  const [fogMaker, setFogMaker] = useState(false);
  const [laser, setLaser] = useState(false);

  const { addCustomModel } = useConfiguratorStore();
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setName(prev => prev || f.name.replace(/\.[^.]+$/, ''));
    setError('');
    setStep('pick');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStep('converting');
    setProgress('Обработка файла...');
    setError('');
    try {
      const result = await convertModel(file, name);
      setGlbUrl(result.glbUrl);
      setStep('configure');
    } catch (e: unknown) {
      setStep('error');
      setError(e instanceof Error ? e.message : 'Ошибка конвертации');
    }
  }, [file, name]);

  const handleSave = useCallback(async () => {
    if (!glbUrl) return;
    setStep('saving');
    try {
      const beamAngle = Math.tan(beamDeg / 2 * Math.PI / 180);
      const item: CustomEquipment = {
        id: `custom_${Date.now()}`,
        cat,
        name,
        emoji: cat === 'audio' ? '🔊' : cat === 'light' ? '💡' : cat === 'led' ? '📺' : '📦',
        w, d, h,
        weight: 0,
        brand,
        color: '#333333',
        modelUrl: glbUrl,
        isCustom: true,
        ...(cat === 'audio' && {
          audioType: audioType as CustomEquipment['audioType'],
          coverageAngle,
          coverageRadius,
        }),
        ...(cat === 'light' && fogMaker && { fogMaker: true }),
        ...(cat === 'light' && laser  && { laser: true }),
        ...(cat === 'light' && !fogMaker && !laser && {
          beamColor,
          beamAngle,
        }),
      };
      await saveCustomEquipment(item);
      addCustomModel(item);
      setStep('done');
      onImported?.(item);
      setTimeout(onClose, 1000);
    } catch (e: unknown) {
      setStep('error');
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    }
  }, [glbUrl, cat, name, brand, w, d, h, audioType, coverageAngle, coverageRadius, beamColor, beamDeg, fogMaker, laser, addCustomModel, onClose, onImported]);

  const inputCls = 'w-full bg-white/6 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50';
  const sectionCls = 'mb-5 space-y-3 p-3 rounded-lg';
  const sectionStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-[500px] max-h-[88vh] overflow-y-auto rounded-xl border border-white/10 p-6"
           style={{ background: 'rgba(10,10,15,0.98)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-white text-base">
              {step === 'configure' || step === 'saving' || step === 'done'
                ? 'Настройка объекта'
                : 'Импорт 3D модели'}
            </h2>
            <p className="text-xs text-white/30 mt-0.5">
              {step === 'configure' || step === 'saving' || step === 'done'
                ? 'Укажите размеры и тип — звук, свет, направленность'
                : 'SKP · GLB · GLTF · OBJ · FBX'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {/* ═══ STEP 1: Pick & convert ═══ */}
        {(step === 'pick' || step === 'converting' || step === 'error') && (
          <>
            {/* Drop zone */}
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => {
                const i = document.createElement('input');
                i.type = 'file';
                i.accept = '.skp,.glb,.gltf,.obj,.fbx';
                i.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f); };
                i.click();
              }}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-4"
              style={{
                borderColor: dragging ? '#C9A227' : file ? '#C9A22766' : 'rgba(255,255,255,0.12)',
                background: dragging ? 'rgba(201,162,39,0.06)' : 'rgba(255,255,255,0.02)',
              }}
            >
              {file ? (
                <div>
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-sm font-semibold text-white">{file.name}</div>
                  <div className="text-xs text-white/40 mt-1">{(file.size / 1024 / 1024).toFixed(2)} МБ</div>
                  <div className="text-xs text-yellow-500/70 mt-1">Нажмите, чтобы заменить</div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">⬆️</div>
                  <div className="text-sm text-white/70">Перетащите файл сюда</div>
                  <div className="text-xs text-white/30 mt-1">или нажмите для выбора</div>
                  <div className="text-xs text-white/20 mt-2">.skp .glb .gltf .obj .fbx</div>
                </div>
              )}
            </div>

            {file && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Название</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Название оборудования" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Производитель</label>
                    <input value={brand} onChange={e => setBrand(e.target.value)} className={inputCls} placeholder="Бренд" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Категория</label>
                    <select value={cat} onChange={e => setCat(e.target.value as CustomEquipment['cat'])}
                      className={inputCls} style={{ background: 'rgba(10,10,15,0.98)' }}>
                      {CATS.map(c => <option key={c.id} value={c.id} style={{ background: '#0a0a0f' }}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 'converting' && (
              <div className="flex items-center gap-3 p-3 rounded-lg mb-4"
                   style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
                <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin flex-shrink-0" />
                <span className="text-sm text-yellow-400">{progress}</span>
              </div>
            )}

            {step === 'error' && (
              <div className="p-3 rounded-lg mb-4"
                   style={{ background: 'rgba(200,0,0,0.08)', border: '1px solid rgba(200,0,0,0.2)' }}>
                <div className="text-sm text-red-400 mb-1">Ошибка</div>
                <div className="text-xs text-red-300/70">{error}</div>
                {file?.name.endsWith('.skp') && (
                  <div className="mt-2 text-xs text-white/40">
                    Новый формат SKP требует ключ CLOUDCONVERT_API_KEY в настройках Vercel.
                    Или экспортируйте модель в GLB из SketchUp: Файл → Экспорт → 3D модель → .glb
                  </div>
                )}
              </div>
            )}

            <button onClick={handleConvert} disabled={!file || step === 'converting'}
              className="w-full py-2.5 rounded-lg font-bold text-sm transition-all"
              style={{
                background: (!file || step === 'converting') ? 'rgba(201,162,39,0.3)' : '#C9A227',
                color: (!file || step === 'converting') ? 'rgba(0,0,0,0.5)' : '#050507',
                cursor: (!file || step === 'converting') ? 'not-allowed' : 'pointer',
              }}>
              {step === 'converting' ? 'Обработка...' : 'Далее →'}
            </button>
          </>
        )}

        {/* ═══ STEP 2: Configure properties ═══ */}
        {(step === 'configure' || step === 'saving' || step === 'done') && (
          <>
            {/* Dimensions */}
            <div className={sectionCls} style={sectionStyle}>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">📐 Размеры (метры)</div>
              <div className="grid grid-cols-3 gap-2">
                {([['Ш (W)', w, setW], ['Г (D)', d, setD], ['В (H)', h, setH]] as [string, number, (v: number) => void][]).map(([label, val, set]) => (
                  <div key={label}>
                    <label className="block text-xs text-white/40 mb-1">{label}</label>
                    <input type="number" step={0.05} min={0.01} value={val}
                      onChange={e => set(Math.max(0.01, +e.target.value))}
                      className="w-full bg-white/6 border border-white/10 rounded px-2 py-1.5 text-sm text-white outline-none focus:border-yellow-500/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Category picker */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Категория</div>
              <div className="grid grid-cols-3 gap-1.5">
                {CATS.map(c => (
                  <button key={c.id} onClick={() => setCat(c.id as CustomEquipment['cat'])}
                    className="py-1.5 px-2 rounded text-xs transition-all"
                    style={{
                      background: cat === c.id ? 'rgba(201,162,39,0.18)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${cat === c.id ? 'rgba(201,162,39,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: cat === c.id ? '#C9A227' : 'rgba(255,255,255,0.5)',
                    }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Audio ── */}
            {cat === 'audio' && (
              <div className={sectionCls} style={sectionStyle}>
                <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">🔊 Звуковые свойства</div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Тип</label>
                  <select value={audioType} onChange={e => setAudioType(e.target.value)}
                    className="w-full rounded px-2 py-1.5 text-sm text-white outline-none"
                    style={{ background: 'rgba(10,10,15,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {AUDIO_TYPES.map(t => <option key={t.id} value={t.id} style={{ background: '#0a0a0f' }}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-white/40">Угол покрытия</label>
                    <span className="text-xs text-yellow-500">{coverageAngle}°</span>
                  </div>
                  <input type="range" min={10} max={360} value={coverageAngle}
                    onChange={e => setCoverageAngle(+e.target.value)} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-white/40">Радиус покрытия</label>
                    <span className="text-xs text-yellow-500">{coverageRadius} м</span>
                  </div>
                  <input type="range" min={1} max={50} value={coverageRadius}
                    onChange={e => setCoverageRadius(+e.target.value)} className="w-full" />
                </div>
              </div>
            )}

            {/* ── Light ── */}
            {cat === 'light' && (
              <div className={sectionCls} style={sectionStyle}>
                <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">💡 Световые свойства</div>

                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'fog',   label: '🌫️ Дым/Hazer', val: fogMaker, set: (v: boolean) => { setFogMaker(v); if (v) setLaser(false); } },
                    { key: 'laser', label: '🔴 Лазер',     val: laser,    set: (v: boolean) => { setLaser(v);    if (v) setFogMaker(false); } },
                  ]).map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer p-2 rounded transition-all"
                      style={{
                        background: opt.val ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${opt.val ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <input type="checkbox" checked={opt.val} onChange={e => opt.set(e.target.checked)} className="accent-yellow-500" />
                      <span className="text-xs text-white/60">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {!fogMaker && !laser && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/40">Цвет луча</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={beamColor} onChange={e => setBeamColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent p-0.5" />
                        <span className="text-xs text-white/40 font-mono">{beamColor}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs text-white/40">Угол раскрытия луча</label>
                        <span className="text-xs text-yellow-500">{beamDeg}°</span>
                      </div>
                      <input type="range" min={1} max={90} value={beamDeg}
                        onChange={e => setBeamDeg(+e.target.value)} className="w-full" />
                      <div className="text-xs text-white/20 mt-1">
                        {beamDeg <= 10 ? '🔦 Точечный луч (spot)' : beamDeg <= 30 ? '💡 Средний (beam)' : '🌟 Широкий (wash)'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'done' && (
              <div className="p-3 rounded-lg mb-4 text-sm text-green-400"
                   style={{ background: 'rgba(0,180,0,0.08)', border: '1px solid rgba(0,180,0,0.2)' }}>
                ✓ Добавлено в сцену
              </div>
            )}

            <button onClick={handleSave} disabled={step === 'saving' || step === 'done'}
              className="w-full py-2.5 rounded-lg font-bold text-sm transition-all"
              style={{
                background: (step === 'saving' || step === 'done') ? 'rgba(201,162,39,0.3)' : '#C9A227',
                color: (step === 'saving' || step === 'done') ? 'rgba(0,0,0,0.5)' : '#050507',
                cursor: (step === 'saving' || step === 'done') ? 'not-allowed' : 'pointer',
              }}>
              {step === 'saving' ? 'Сохранение...' : step === 'done' ? '✓ Готово' : 'Добавить в сцену'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
