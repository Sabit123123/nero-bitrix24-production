'use client';
import { useState, useCallback, useRef } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { convertModel } from '@/lib/model-converter';
import { saveCustomEquipment, CustomEquipment } from '@/lib/equipment-storage';

type ImportState = 'idle' | 'uploading' | 'converting' | 'done' | 'error';

interface ModelImporterProps {
  onClose: () => void;
  onImported?: (item: CustomEquipment) => void;
  initialFile?: File | null;
}

export function ModelImporter({ onClose, onImported, initialFile }: ModelImporterProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  // Pre-fill from a file dropped onto the canvas, if provided
  const [name, setName] = useState(() => initialFile ? initialFile.name.replace(/\.[^.]+$/, '') : '');
  const [brand, setBrand] = useState('');
  const [cat, setCat] = useState<CustomEquipment['cat']>('structure');
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [dragging, setDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const { addCustomModel } = useConfiguratorStore();

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setName(prev => prev || f.name.replace(/\.[^.]+$/, ''));
    setError('');
    setState('idle');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleImport = useCallback(async () => {
    if (!file) return;
    setState('uploading');
    setProgress('Загрузка файла...');
    setError('');

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'skp' || ext === 'obj' || ext === 'fbx' || ext === 'dae') {
        setState('converting');
        setProgress(`Конвертация ${ext.toUpperCase()} → GLB...`);
      }

      const result = await convertModel(file, name);
      setProgress('Сохранение в каталог...');

      const item: CustomEquipment = {
        id: `custom_${Date.now()}`,
        cat,
        name: name || result.name,
        emoji: '📦',
        w: 1,
        d: 1,
        h: 1,
        weight: 0,
        brand,
        color: '#333333',
        modelUrl: result.glbUrl,
        isCustom: true,
      };

      await saveCustomEquipment(item);
      addCustomModel(item);

      setState('done');
      setProgress('Готово!');
      onImported?.(item);

      setTimeout(() => onClose(), 1200);

    } catch (e: unknown) {
      setState('error');
      const msg = e instanceof Error ? e.message : 'Ошибка';
      setError(msg);
    }
  }, [file, name, brand, cat, addCustomModel, onClose, onImported]);

  const CATS: { id: CustomEquipment['cat']; label: string }[] = [
    { id: 'audio', label: '🔊 Звук' },
    { id: 'light', label: '💡 Свет' },
    { id: 'led', label: '📺 LED' },
    { id: 'truss', label: '🔩 Фермы' },
    { id: 'stage', label: '🎭 Сцена' },
    { id: 'structure', label: '🏗️ Конструкции' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-[460px] rounded-xl border border-white/10 p-6" style={{ background: 'rgba(10,10,15,0.98)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-white text-base">Импорт 3D модели</h2>
            <p className="text-xs text-white/30 mt-0.5">SKP · GLB · GLTF · OBJ · FBX</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {/* Drop zone */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='.skp,.glb,.gltf,.obj,.fbx'; i.onchange=e=>{ const f=(e.target as HTMLInputElement).files?.[0]; if(f) handleFile(f); }; i.click(); }}
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

        {/* Metadata */}
        {file && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Название</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/6 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
                placeholder="Название оборудования"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Производитель</label>
                <input
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-white/6 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
                  placeholder="Бренд"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Категория</label>
                <select
                  value={cat}
                  onChange={e => setCat(e.target.value as CustomEquipment['cat'])}
                  className="w-full bg-white/6 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {CATS.map(c => <option key={c.id} value={c.id} style={{ background: '#0a0a0f' }}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Progress / Error */}
        {(state === 'uploading' || state === 'converting') && (
          <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
            <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin flex-shrink-0" />
            <span className="text-sm text-yellow-400">{progress}</span>
          </div>
        )}
        {state === 'done' && (
          <div className="p-3 rounded-lg mb-4 text-sm text-green-400" style={{ background: 'rgba(0,180,0,0.08)', border: '1px solid rgba(0,180,0,0.2)' }}>
            ✓ {progress}
          </div>
        )}
        {state === 'error' && (
          <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(200,0,0,0.08)', border: '1px solid rgba(200,0,0,0.2)' }}>
            <div className="text-sm text-red-400 mb-1">Ошибка</div>
            <div className="text-xs text-red-300/70">{error}</div>
            {error.includes('CLOUDCONVERT_API_KEY') && (
              <div className="mt-2 text-xs text-white/40">
                Получите бесплатный API ключ на <span className="text-yellow-500">cloudconvert.com</span> (25 конвертаций/день)
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || state === 'uploading' || state === 'converting' || state === 'done'}
          className="w-full py-2.5 rounded-lg font-bold text-sm transition-all"
          style={{
            background: (!file || state === 'uploading' || state === 'converting') ? 'rgba(201,162,39,0.3)' : '#C9A227',
            color: (!file || state === 'uploading' || state === 'converting') ? 'rgba(0,0,0,0.5)' : '#050507',
            cursor: (!file || state === 'uploading' || state === 'converting') ? 'not-allowed' : 'pointer',
          }}
        >
          {state === 'uploading' ? 'Загрузка...' :
           state === 'converting' ? 'Конвертация...' :
           state === 'done' ? '✓ Импортировано' :
           'Импортировать'}
        </button>
      </div>
    </div>
  );
}
