import { create } from 'zustand';
import { PlacedObject, Project, LEDConfig, TrussConfig } from '@/types';
import { EQUIPMENT } from '@/lib/equipment-catalog';

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

  // LED Constructor
  addLEDScreen: (config: LEDConfig, position: [number, number, number]) => void;

  // Truss Constructor
  addTruss: (config: TrussConfig, position: [number, number, number]) => void;

  // Project
  project: Project;
  setProjectMeta: (meta: Partial<Project>) => void;
  saveProject: () => Promise<void>;
  loadProject: (data: Project) => void;

  // UI State
  showGrid: boolean;
  showCoverage: boolean;
  showBeams: boolean;
  snapEnabled: boolean;
  cameraMode: 'perspective' | 'orthographic';
  toggleGrid: () => void;
  toggleCoverage: () => void;
  toggleBeams: () => void;
  toggleSnap: () => void;
  toggleCameraMode: () => void;

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
    if (!item) throw new Error('Item not found');
    get().pushHistory();
    const obj: PlacedObject = {
      uuid: crypto.randomUUID(),
      itemId,
      name: item.name,
      position: position || [0, item.h / 2, 0],
      rotation: [0, 0, 0],
      scale: 1,
      visible: true,
    };
    set(s => ({ objects: [...s.objects, obj] }));
    return obj;
  },

  updateObject: (uuid, updates) => set(s => ({
    objects: s.objects.map(o => o.uuid === uuid ? { ...o, ...updates } : o)
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
    const copy: PlacedObject = {
      ...obj,
      uuid: crypto.randomUUID(),
      position: [obj.position[0] + 1, obj.position[1], obj.position[2] + 1],
    };
    set(s => ({ objects: [...s.objects, copy] }));
  },

  selectObject: (uuid) => set({ selectedId: uuid }),
  clearAll: () => set({ objects: [], selectedId: null }),

  addLEDScreen: (config, position) => {
    get().pushHistory();
    const obj: PlacedObject = {
      uuid: crypto.randomUUID(),
      itemId: 'led_screen',
      name: `LED ${(config.countX * config.cabinetW / 1000).toFixed(1)}×${(config.countY * config.cabinetH / 1000).toFixed(1)}м`,
      position,
      rotation: [0, 0, 0],
      scale: 1,
      visible: true,
      isLED: true,
      ledConfig: config,
    };
    set(s => ({ objects: [...s.objects, obj] }));
  },

  addTruss: (config, position) => {
    get().pushHistory();
    const obj: PlacedObject = {
      uuid: crypto.randomUUID(),
      itemId: 'truss',
      name: `Ферма ${config.type} ${config.shape}`,
      position,
      rotation: [0, 0, 0],
      scale: 1,
      visible: true,
      isTruss: true,
      trussConfig: config,
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
    const data = { ...project, objects, roomW, roomD, wallH, date: new Date().toISOString().split('T')[0] };
    const saves = JSON.parse(localStorage.getItem('nd_projects') || '[]');
    const idx = saves.findIndex((s: Project) => s.name === data.name);
    if (idx >= 0) saves[idx] = data; else saves.push(data);
    localStorage.setItem('nd_projects', JSON.stringify(saves));
  },

  loadProject: (data) => set({
    objects: data.objects,
    roomW: data.roomW,
    roomD: data.roomD,
    wallH: data.wallH,
    project: data,
  }),

  showGrid: true,
  showCoverage: false,
  showBeams: true,
  snapEnabled: true,
  cameraMode: 'perspective',
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  toggleCoverage: () => set(s => ({ showCoverage: !s.showCoverage })),
  toggleBeams: () => set(s => ({ showBeams: !s.showBeams })),
  toggleSnap: () => set(s => ({ snapEnabled: !s.snapEnabled })),
  toggleCameraMode: () => set(s => ({ cameraMode: s.cameraMode === 'perspective' ? 'orthographic' : 'perspective' })),

  history: [],
  pushHistory: () => set(s => ({ history: [...s.history.slice(-20), [...s.objects]] })),
  undo: () => {
    const { history } = get();
    if (!history.length) return;
    const prev = history[history.length - 1];
    set({ objects: prev, history: history.slice(0, -1) });
  },
}));
