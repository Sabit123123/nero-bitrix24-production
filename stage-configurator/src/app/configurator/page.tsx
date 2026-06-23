'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Toolbar } from '@/components/UI/Toolbar';
import { EquipmentLibrary } from '@/components/UI/EquipmentLibrary';
import { PropertiesPanel } from '@/components/UI/PropertiesPanel';
import { LEDConstructor } from '@/components/UI/LEDConstructor';
import { TrussConstructor } from '@/components/UI/TrussConstructor';
import { TemplatesModal } from '@/components/Modals/TemplatesModal';
import { OpenProjectModal } from '@/components/Modals/OpenProjectModal';
import { ProjectInfoModal } from '@/components/Modals/ProjectInfoModal';
import { ModelImporter } from '@/components/UI/ModelImporter';
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
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
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

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't fire when typing in an input/textarea
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const store = useConfiguratorStore.getState();
      const { selectedId } = store;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) store.removeObject(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault(); store.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedId) store.duplicateObject(selectedId);
      }
      if (e.key === 'Escape') {
        store.selectObject(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openImporter = useCallback((file?: File) => {
    setDroppedFile(file ?? null);
    setShowImporter(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Catalog equipment drag
    const itemId = e.dataTransfer.getData('application/nd-equipment');
    if (itemId) {
      const item = EQUIPMENT.find(eq => eq.id === itemId);
      if (item) useConfiguratorStore.getState().addObject(itemId, [0, item.h / 2, 0]);
      return;
    }
    // Custom imported model drag from library
    const customRaw = e.dataTransfer.getData('application/nd-custom');
    if (customRaw) {
      try {
        const { id, name, url } = JSON.parse(customRaw);
        useConfiguratorStore.getState().addObjectCustom(id, name, url);
      } catch { /* ignore malformed */ }
      return;
    }
    // File drop (SKP / GLB / OBJ / FBX)
    const file = e.dataTransfer.files[0];
    if (file) openImporter(file);
  }, [openImporter]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#050507' }}>
      <Toolbar
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onOpenTemplates={() => setShowTemplates(true)}
        onImportModel={() => openImporter()}
        onSave={handleSave}
        onNew={handleNew}
        onOpen={() => setShowOpen(true)}
        onProjectInfo={() => setShowProjectInfo(true)}
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

      {showImporter && (
        <ModelImporter
          initialFile={droppedFile}
          onClose={() => { setShowImporter(false); setDroppedFile(null); }}
          onImported={() => toast('Модель импортирована и добавлена на сцену')}
        />
      )}

      {showLED     && <LEDConstructor    onClose={() => setShowLED(false)} />}
      {showTruss   && <TrussConstructor  onClose={() => setShowTruss(false)} />}
      {showTemplates && <TemplatesModal  onClose={() => setShowTemplates(false)} />}
      {showOpen    && <OpenProjectModal  onClose={() => setShowOpen(false)} />}
      {showProjectInfo && <ProjectInfoModal onClose={() => setShowProjectInfo(false)} />}
    </div>
  );
}
