export interface MapSelectPayload {
  address: string
  lat: number
  lon: number
}

export interface CreateProjectPayload {
  name: string
  address?: string
  city?: string
  customer?: string
}

export interface ProjectListItem {
  id: string
  name: string
  number: string
  calcNo: string
  customer: string
  city: string
  areaM2: number
  sensors: number
  status: string
  created: string
  calcs: number
}

export interface CalculationRunItem {
  id: string
  projectId: string
  calcNo: string
  author: string
  status: string
  created: string
  current?: boolean
  sensors: number
}

export interface CalculationRunSnapshot extends CalculationRunItem {
  northDeg: number
  snowRegion: string
  windRegion: string
  geometry: GeometryData
  climate: Record<string, string>
  calculation: CalculationData
}

export interface CalculationHistory {
  projectId: string
  calcNo: string
  author: string
  items: CalculationRunItem[]
}

export interface Project extends ProjectListItem {
  address: string
  lat?: number | null
  lon?: number | null
  roofType: string
  parapet: string
  author: string
  northDeg: number
  snowRegion: string
  windRegion: string
  geometry: GeometryData
  climate: Record<string, string>
  calculation: CalculationData
  underlayUrl?: string
}

export interface GeometryData {
  roof?: number[][]
  obstacles?: Obstacle[]
  walkway?: number[][]
  areaM2?: number
}

export interface Obstacle {
  id: string
  type: string
  short: string
  shape: 'rect' | 'circle'
  x?: number
  y?: number
  w?: number
  h?: number
  cx?: number
  cy?: number
  r?: number
  hM?: number
}

export interface Snowbag {
  id: string
  name: string
  basis: string
  poly: number[][]
  mu: number
  load: string
  area: number
  risk: 'critical' | 'high' | 'medium'
}

export interface Sensor {
  id: string
  x: number
  y: number
  zone: string | null
}

export interface CalculationData {
  snowbags?: Snowbag[]
  sensors?: Sensor[]
  metrics?: {
    roofArea: string
    bagsArea: string
    bagsShare: string
    sensors: number
    coverage: string
    maxLoad: string
    minDistM?: string
    avgDistM?: string
    risk: Record<string, number>
  }
  spec?: Array<{ pos: number; name: string; unit: string; qty: number; note: string }>
  windRose?: Array<{ dir: string; deg: number; v: number }>
}

export const STEPS = [
  { id: 'upload', n: 1, label: 'Загрузка данных' },
  { id: 'roof', n: 2, label: 'Геометрия и элементы' },
  { id: 'climate', n: 3, label: 'Ориентация и климат' },
  { id: 'bags', n: 4, label: 'Мешки и датчики' },
  { id: 'result', n: 5, label: 'Результат' },
] as const

export const EMPTY_GEOMETRY: GeometryData = { roof: [], obstacles: [] }

export const DEMO_GEOMETRY: GeometryData = {
  roof: [[90, 90], [910, 90], [910, 440], [560, 440], [560, 590], [90, 590]],
  obstacles: [
    { id: 'shaft-1', type: 'Лестнично-лифтовая надстройка', short: 'Надстройка', shape: 'rect', x: 690, y: 150, w: 150, h: 110, hM: 3.6 },
    { id: 'vent-1', type: 'Вентиляционная установка', short: 'Вентустановка', shape: 'rect', x: 360, y: 150, w: 130, h: 74, hM: 2.4 },
    { id: 'unit-1', type: 'Технический блок (ИТП)', short: 'Техблок', shape: 'rect', x: 640, y: 312, w: 96, h: 62, hM: 1.8 },
    { id: 'sky-1', type: 'Зенитный фонарь', short: 'Фонарь', shape: 'rect', x: 160, y: 300, w: 240, h: 60, hM: 0.9 },
    { id: 'drain-1', type: 'Водосточная воронка', short: 'Воронка', shape: 'circle', cx: 150, cy: 560, r: 9 },
    { id: 'drain-2', type: 'Водосточная воронка', short: 'Воронка', shape: 'circle', cx: 470, cy: 560, r: 9 },
  ],
  walkway: [[120, 430], [520, 430], [520, 560]],
  areaM2: 8240,
}

export const ELEMENT_TYPES = [
  { id: 'vent', name: 'Вентиляционная установка', short: 'Вентустановка', hM: 2.4, hasHeight: true },
  { id: 'shaft', name: 'Лестнично-лифтовая надстройка', short: 'Надстройка', hM: 3.6, hasHeight: true },
  { id: 'unit', name: 'Технический блок (ИТП)', short: 'Техблок', hM: 1.8, hasHeight: true },
  { id: 'sky', name: 'Зенитный фонарь', short: 'Фонарь', hM: 0.9, hasHeight: true },
  { id: 'drain', name: 'Водосточная воронка', short: 'Воронка', hM: 0, hasHeight: false },
] as const
