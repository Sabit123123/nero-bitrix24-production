'use client';
import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Toolbar } from '@/components/UI/Toolbar';
import { EquipmentLibrary } from '@/components/UI/EquipmentLibrary';
import { PropertiesPanel } from '@/components/UI/PropertiesPanel';
import { LEDConstructor } from '@/components/UI/LEDConstructor';
import { TrussConstructor } from '@/components/UI/TrussConstructor';
import { TemplatesModal } from '@/components/Modals/TemplatesModal';
import { useConfiguratorStore } from '@/store/configurator-store';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import { exportPNG, exportProjectPDF } from '@/lib/export';

// Dynamic import to avoid SSR issues with Three.js
const Scene3D = dynamic(() => import('@/components/Scene/Scene3D').then(m => ({ default: m.Scene3D })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-yellow-500 text-sm">Загрузка 3D сцены...</div>
    </div>
  ),
});

export default function ConfiguratorPage() {
  const [showLEDConstructor, setShowLEDConstructor] = useState(false);
  const [showTrussConstructor, setShowTrussConstructor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveProject, objects, project } = useConfiguratorStore();

  const handleExportPNG = useCallback(() => {
    exportPNG(project.name);
  }, [project.name]);

  const handleExportPDF = useCallback(() => {
    exportProjectPDF(project, objects);
  }, [objects, project]);

  const handleImportModel = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Импорт модели "${file.name}" — в разработке. Поместите GLB файл в /public/models/ и добавьте в каталог.`);
    e.target.value = '';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('application/nd-equipment');
    if (itemId) {
      const { addObject } = useConfiguratorStore.getState();
      const item = EQUIPMENT.find(eq => eq.id === itemId);
      if (item) addObject(itemId, [0, item.h / 2, 0]);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#050507' }}>
      <Toolbar
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onOpenTemplates={() => setShowTemplates(true)}
        onImportModel={handleImportModel}
        onSave={saveProject}
        onNew={() => { if (confirm('Создать новую сцену? Несохранённые изменения будут потеряны.')) useConfiguratorStore.getState().clearAll(); }}
      />

      <div className="flex flex-1 overflow-hidden">
        <EquipmentLibrary />

        {/* 3D Canvas area */}
        <div
          className="flex-1 relative"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <Scene3D />

          {/* Quick add buttons overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            <button
              onClick={() => setShowLEDConstructor(true)}
              className="btn-ghost flex items-center gap-2 px-4 py-2"
              style={{ backdropFilter: 'blur(12px)', background: 'rgba(5,5,7,0.9)' }}
            >
              📺 LED Экран
            </button>
            <button
              onClick={() => setShowTrussConstructor(true)}
              className="btn-ghost flex items-center gap-2 px-4 py-2"
              style={{ backdropFilter: 'blur(12px)', background: 'rgba(5,5,7,0.9)' }}
            >
              🔩 Ферма
            </button>
          </div>
        </div>

        <PropertiesPanel />
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".glb,.gltf,.obj,.fbx" className="hidden" onChange={handleFileChange} />

      {/* Modals */}
      {showLEDConstructor && <LEDConstructor onClose={() => setShowLEDConstructor(false)} />}
      {showTrussConstructor && <TrussConstructor onClose={() => setShowTrussConstructor(false)} />}
      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
