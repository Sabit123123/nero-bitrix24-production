export interface EquipmentItem {
  id: string;
  cat: 'audio' | 'light' | 'led' | 'truss' | 'stage' | 'structure' | 'decor';
  name: string;
  emoji: string;
  w: number;   // width m
  d: number;   // depth m
  h: number;   // height m
  weight: number; // kg
  brand: string;
  color: string; // hex
  beamColor?: string;
  beamAngle?: number;
  fogMaker?: boolean;
  laser?: boolean;
  audioType?: 'sub' | 'linearray' | 'monitor' | 'frontfill' | 'delay';
  coverageAngle?: number;
  coverageRadius?: number;
}

export interface PlacedObject {
  uuid: string;
  itemId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  visible: boolean;
  // LED screen specific
  isLED?: boolean;
  ledConfig?: LEDConfig;
  // Truss specific
  isTruss?: boolean;
  trussConfig?: TrussConfig;
  // Custom imported model (SKP/GLB/etc.)
  isCustom?: boolean;
  customModelUrl?: string;
  // User annotation
  note?: string;
}

export interface LEDConfig {
  cabinetW: number;
  cabinetH: number;
  countX: number;
  countY: number;
  shape: 'flat' | 'concave' | 'convex';
  curvature: number; // 0-15 degrees
  pixelPitch: 'P2.6' | 'P2.9' | 'P3.91';
}

export interface TrussConfig {
  type: '290' | '300' | '400';
  shape: 'straight' | 'totem' | 'p-shape' | 'square' | 'roof';
  length?: number;
  width?: number;
  height?: number;
  depth?: number;
}

export interface Project {
  id?: string;
  name: string;
  client: string;
  venue: string;
  date: string;
  roomW: number;
  roomD: number;
  wallH: number;
  objects: PlacedObject[];
  thumbnail?: string;
  notes: string;
}
