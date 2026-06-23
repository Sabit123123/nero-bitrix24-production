'use client';
import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Toolbar } from '@/components/UI/Toolbar';
import { EquipmentLibrary } from '@/components/UI/EquipmentLibrary';
import { PropertiesPanel } from '@/components/UI/PropertiesPanel';
import { LEDConstructor } from '@/components/UI/LEDConstructor';
import { TrussConstructor } from '@/components/UI/TrussConstructor';
import { TemplatesModal } from '@/components/Modals/TemplatesModal';
import { OpenProjectModal } from '@/components/Modals/OpenProjectModal';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import { exportPNG, exportProjectPDF } from '@/lib/export';

const Scene3D = dynamic(() => import('@/components/Scene/Scene3D').then(m => ({ default: m.Scene3D })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div style={{ color: '#C9A227', fontSize: 14 }}>Загрузка 3D сцены...</div>
    </div>
  ),
});

type Toast = { id: number; msg: string; type: 'ok' | 'err' };

export default function ConfiguratorPage() {
  const [showLED, setShowLED] = useState(false);
  const [showTruss, setShowTruss] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveProject, clearAll, objects, project } = useConfiguratorStore();

  const toast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const result = await saveProject();
      toast(result.storage === 'cloud' ? '☁️ Сохранено в облако' : '💾 Сохранено локально');
    } catch (e) {
      toast('Ошибка сохранения', 'err');
      console.error(e);
    }
  }, [saveProject, toast]);

  const handleNew = useCallback(() => {
    if (objects.length && !confirm('Создать новую сцену? Несохранённые изменения будут потеряны.')) return;
    clearAll();
  }, [objects.length, clearAll]);

  const handleExportPNG = useCallback(() => {
    exportPNG(project.name);
    toast('PNG экспортирован');
  }, [project.name, toast]);

  const handleExportPDF = useCallback(() => {
    exportProjectPDF(project, objects);
    toast('PDF открыт в новой вкладке');
  }, [objects, project, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('application/nd-equipment');
    if (!itemId) return;
    const item = EQUIPMENT.find(eq => eq.id === itemId);
    if (item) useConfiguratorStore.getState().addObject(itemId, [0, item.h / 2, 0]);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast(`"${file.name}" — импорт GLB будет добавлен в следующей версии`, 'err');
    e.target.value = '';
  }, [toast]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#050507' }}>
      <Toolbar
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onOpenTemplates={() => setShowTemplates(true)}
        onImportModel={() => fileInputRef.current?.click()}
        onSave={handleSave}
        onNew={handleNew}
        onOpen={() => setShowOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <EquipmentLibrary />

        <div className="flex-1 relative" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          <Scene3D />

          {/* Quick-add overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            <button
              onClick={() => setShowLED(true)}
              style={{ backdropFilter: 'blur(12px)', background: 'rgba(5,5,7,0.9)' }}
              className="btn-ghost px-4 py-2"
            >
              📺 LED Экран
            </button>
            <button
              onClick={() => setShowTruss(true)}
              style={{ backdropFilter: 'blur(12px)', background: 'rgba(5,5,7,0.9)' }}
              className="btn-ghost px-4 py-2"
            >
              🔩 Ферма
            </button>
          </div>

          {/* Toasts */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-50 pointer-events-none">
            {toasts.map(t => (
              <div key={t.id} className="px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
                style={{
                  background: t.type === 'ok' ? 'rgba(10,10,15,0.95)' : 'rgba(80,10,10,0.95)',
                  border: `1px solid ${t.type === 'ok' ? 'rgba(201,162,39,0.4)' : 'rgba(255,60,60,0.4)'}`,
                  color: t.type === 'ok' ? '#C9A227' : '#ff8888',
                }}>
                {t.msg}
              </div>
            ))}
          </div>
        </div>

        <PropertiesPanel />
      </div>

      <input ref={fileInputRef} type="file" accept=".glb,.gltf,.obj,.fbx" className="hidden" onChange={handleFileChange} />

      {showLED     && <LEDConstructor    onClose={() => setShowLED(false)} />}
      {showTruss   && <TrussConstructor  onClose={() => setShowTruss(false)} />}
      {showTemplates && <TemplatesModal  onClose={() => setShowTemplates(false)} />}
      {showOpen    && <OpenProjectModal  onClose={() => setShowOpen(false)} />}
    </div>
  );
}
