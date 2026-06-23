import { create } from 'zustand';
import { PlacedObject, Project, LEDConfig, TrussConfig } from '@/types';
import { EQUIPMENT } from '@/lib/equipment-catalog';
import { saveProject as sbSave, listProjects as sbList, deleteProject as sbDelete, isCloudAvailable } from '@/lib/supabase';
import { CustomEquipment } from '@/lib/equipment-storage';

interface SaveResult { storage: 'cloud' | 'local'; id: string }

interface ConfiguratorStore {
  // Scene
  roomW: number;
  roomD: number;
  wallH: number;
  setRoom: (w: number, d: number, h: number) => void;

  // Objects
  objects: PlacedObject[];
  selectedId: string | null;
  addObject: (itemId: string, position?: [number, number, number]) => PlacedObject;
  updateObject: (uuid: string, updates: Partial<PlacedObject>) => void;
  removeObject: (uuid: string) => void;
  duplicateObject: (uuid: string) => void;
  selectObject: (uuid: string | null) => void;
  clearAll: () => void;

  // LED & Truss constructors
  addLEDScreen: (config: LEDConfig, position: [number, number, number]) => void;
  addTruss: (config: TrussConfig, position: [number, number, number]) => void;

  // Custom imported models
  customModels: CustomEquipment[];
  addCustomModel: (item: CustomEquipment) => void;
  addObjectCustom: (itemId: string, name: string, modelUrl: string, equipment?: CustomEquipment) => void;

  // Project
  project: Project;
  setProjectMeta: (meta: Partial<Project>) => void;
  saveProject: () => Promise<SaveResult>;
  loadProject: (data: Project) => void;
  listProjects: () => Promise<Project[]>;
  deleteProject: (id: string) => Promise<void>;

  // Cloud status
  cloudEnabled: boolean;

  // UI State
  showGrid: boolean;
  showCoverage: boolean;
  showBeams: boolean;
  snapEnabled: boolean;
  cameraMode: 'perspective' | 'orthographic';
  floorType: 'concrete' | 'parquet' | 'carpet' | 'stage' | 'tile' | 'light';
  toggleGrid: () => void;
  toggleCoverage: () => void;
  toggleBeams: () => void;
  toggleSnap: () => void;
  toggleCameraMode: () => void;
  setFloorType: (t: ConfiguratorStore['floorType']) => void;

  // Undo
  history: PlacedObject[][];
  undo: () => void;
  pushHistory: () => void;
}

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  roomW: 12,
  roomD: 8,
  wallH: 4.2,
  setRoom: (w, d, h) => set({ roomW: w, roomD: d, wallH: h }),

  objects: [],
  selectedId: null,

  addObject: (itemId, position) => {
    const item = EQUIPMENT.find(e => e.id === itemId);
    if (!item) throw new Error(`Equipment not found: ${itemId}`);
    get().pushHistory();
    const obj: PlacedObject = {
      uuid: crypto.randomUUID(),
      itemId,
      name: item.name,
      position: position ?? [0, item.h / 2, 0],
      rotation: [0, 0, 0],
      scale: 1,
      visible: true,
    };
    set(s => ({ objects: [...s.objects, obj] }));
    return obj;
  },

  updateObject: (uuid, updates) => set(s => ({
    objects: s.objects.map(o => o.uuid === uuid ? { ...o, ...updates } : o),
  })),

  removeObject: (uuid) => {
    get().pushHistory();
    set(s => ({
      objects: s.objects.filter(o => o.uuid !== uuid),
      selectedId: s.selectedId === uuid ? null : s.selectedId,
    }));
  },

  duplicateObject: (uuid) => {
    const obj = get().objects.find(o => o.uuid === uuid);
    if (!obj) return;
    get().pushHistory();
    set(s => ({
      objects: [
        ...s.objects,
        { ...obj, uuid: crypto.randomUUID(), position: [obj.position[0] + 1, obj.position[1], obj.position[2] + 1] },
      ],
    }));
  },

  selectObject: (uuid) => set({ selectedId: uuid }),
  clearAll: () => { get().pushHistory(); set({ objects: [], selectedId: null }); },

  addLEDScreen: (config, position) => {
    get().pushHistory();
    const w = (config.countX * config.cabinetW / 1000).toFixed(1);
    const h = (config.countY * config.cabinetH / 1000).toFixed(1);
    set(s => ({
      objects: [...s.objects, {
        uuid: crypto.randomUUID(),
        itemId: 'led_screen',
        name: `LED ${w}×${h}м`,
        position,
        rotation: [0, 0, 0],
        scale: 1,
        visible: true,
        isLED: true,
        ledConfig: config,
      }],
    }));
  },

  addTruss: (config, position) => {
    get().pushHistory();
    set(s => ({
      objects: [...s.objects, {
        uuid: crypto.randomUUID(),
        itemId: 'truss',
        name: `Ферма ${config.type} ${config.shape}`,
        position,
        rotation: [0, 0, 0],
        scale: 1,
        visible: true,
        isTruss: true,
        trussConfig: config,
      }],
    }));
  },

  customModels: [],
  addCustomModel: (item) => {
    set(s => ({ customModels: s.customModels.some(m => m.id === item.id) ? s.customModels : [...s.customModels, item] }));
    // Also add to scene immediately
    get().addObjectCustom(item.id, item.name, item.modelUrl, item);
  },
  addObjectCustom: (itemId, name, modelUrl, equipment?) => {
    get().pushHistory();
    const obj: PlacedObject = {
      uuid: crypto.randomUUID(),
      itemId,
      name,
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: 1,
      visible: true,
      isCustom: true,
      customModelUrl: modelUrl,
      customEquipment: equipment,
    };
    set(s => ({ objects: [...s.objects, obj] }));
  },

  project: {
    name: 'Новый проект',
    client: '',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    roomW: 12,
    roomD: 8,
    wallH: 4.2,
    objects: [],
    notes: '',
  },

  setProjectMeta: (meta) => set(s => ({ project: { ...s.project, ...meta } })),

  saveProject: async () => {
    const { project, objects, roomW, roomD, wallH } = get();
    // Grab scene thumbnail from the WebGL canvas
    const thumbnail = typeof document !== 'undefined'
      ? (document.querySelector('canvas') as HTMLCanvasElement | null)?.toDataURL('image/jpeg', 0.6) ?? undefined
      : undefined;
    const data: Project = { ...project, objects, roomW, roomD, wallH, date: new Date().toISOString().split('T')[0], thumbnail };
    const result = await sbSave(data);
    set(s => ({ project: { ...s.project, id: result.id, thumbnail } }));
    return result;
  },

  loadProject: (data) => set({
    objects: data.objects ?? [],
    roomW: data.roomW,
    roomD: data.roomD,
    wallH: data.wallH,
    project: data,
    selectedId: null,
  }),

  listProjects: () => sbList(),
  deleteProject: (id) => sbDelete(id),

  cloudEnabled: isCloudAvailable(),

  showGrid: true,
  showCoverage: false,
  showBeams: true,
  snapEnabled: true,
  cameraMode: 'perspective',
  floorType: 'concrete',
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  toggleCoverage: () => set(s => ({ showCoverage: !s.showCoverage })),
  toggleBeams: () => set(s => ({ showBeams: !s.showBeams })),
  toggleSnap: () => set(s => ({ snapEnabled: !s.snapEnabled })),
  toggleCameraMode: () => set(s => ({
    cameraMode: s.cameraMode === 'perspective' ? 'orthographic' : 'perspective',
  })),
  setFloorType: (t) => set({ floorType: t }),

  history: [],
  pushHistory: () => set(s => ({ history: [...s.history.slice(-20), [...s.objects]] })),
  undo: () => {
    const { history } = get();
    if (!history.length) return;
    set({ objects: history[history.length - 1], history: history.slice(0, -1) });
  },
}));
