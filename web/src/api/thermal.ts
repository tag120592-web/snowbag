// API-клиент модуля теплотехники (ТТР + влагонакопление).
const base = import.meta.env.VITE_API_URL ?? ''

export interface ThermalLayer {
  material: { ekn?: string; name: string; lambda: number; source?: string }
  role: string
  thicknessMm: number
  isInsulant: boolean
  r: number
}

export interface HeteroItem {
  id: string
  elementId?: string
  kind: 'linear' | 'point'
  sp230Node: string
  status: 'candidate' | 'confirmed' | 'excluded'
  type?: string
  lengthM?: number
  count?: number
  psi?: number
  chi?: number
}

export interface ThermalResult {
  rsi: number
  rse: number
  rcond: number
  r: number
  rred: number
  rreq: number
  requiredInsulationMm: number
  reservePct: number
  verdict: string
  layers: ThermalLayer[]
  includedHetero: HeteroItem[]
  surfaceTemps: Array<{ node: string; tauMin: number; tauReq: number; pass: boolean }>
}

export interface VaporResult {
  maxMoisturePlane: string
  planeLayerIndex: number
  rvp: number
  rvpReq1: number
  rvpReq2: number
  rvpReqFinal: number
  pass: boolean
  verdict: string
}

export interface ThermalClimate {
  city: string
  tht: number
  tot: number
  zot: number
  humidityZone: string
  norm: string
}

export interface ThermalResponse {
  thermal?: ThermalResult
  vapor?: VaporResult
  climate: ThermalClimate
  system: { ekn?: string; slug: string; name: string; note?: string; layers: ThermalLayer[] }
}

export interface ThermalPayload {
  modules: { thermal: boolean; vapor: boolean }
  categoryId: string
  tIn?: number
  humidityPct?: number
  systemEkn: string
  heterogeneities?: HeteroItem[]
}

export async function calculateThermal(projectId: string, payload: ThermalPayload): Promise<ThermalResponse> {
  const res = await fetch(`${base}/api/v1/projects/${projectId}/thermal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Ошибка расчёта')
  }
  return res.json()
}

// Каталог расчётных модулей платформы (по прототипу data.js MODULES).
export interface CalcModule {
  id: 'snow' | 'thermal' | 'vapor' | 'wind'
  name: string
  norm: string
  icon: string
  tint: string
  ink: string
  desc: string
  outputs: string[]
  ready: boolean
}

export const MODULES: CalcModule[] = [
  {
    id: 'snow', name: 'Расчёт снеговых мешков', norm: 'СП 20.13330.2016', icon: '❄️',
    tint: 'var(--blue-10)', ink: 'var(--blue-60)',
    desc: 'Зоны снегонакопления, коэффициенты μ, нагрузки и расстановка датчиков мониторинга.',
    outputs: ['Снеговые мешки и μ', 'Карта нагрузок', 'Спецификация датчиков'], ready: true,
  },
  {
    id: 'thermal', name: 'Теплотехнический расчёт', norm: 'СП 50.13330.2018', icon: '🌡️',
    tint: 'var(--red-10)', ink: 'var(--content-accent-enabled)',
    desc: 'Приведённое сопротивление теплопередаче с учётом неоднородностей, состава системы ТЕХНОНИКОЛЬ и проверки влагонакопления.',
    outputs: ['Состав конструкции', 'Неоднородности и r', 'Соответствие СП 50', 'Влагонакопление'], ready: true,
  },
  {
    id: 'vapor', name: 'Расчёт паропроницаемости', norm: 'СП 50.13330.2018', icon: '💧',
    tint: 'var(--neutral-15)', ink: 'var(--content-tertiary-enabled)',
    desc: 'Проверка ограждающей конструкции на сопротивление паропроницанию (раздел 8 СП 50).',
    outputs: [], ready: false,
  },
  {
    id: 'wind', name: 'Ветровые нагрузки', norm: 'СП 20.13330.2016', icon: '🌬️',
    tint: 'var(--neutral-15)', ink: 'var(--content-tertiary-enabled)',
    desc: 'Расчёт ветровой нагрузки и зон отрыва на покрытии.',
    outputs: [], ready: false,
  },
]

// Температура помещения по умолчанию по категории (зеркалит бэкенд DefaultIndoorTemp).
export const DEFAULT_INDOOR_TEMP: Record<string, number> = { '1': 20, '2': 21, '3': 20, '4': 16, '5': 16 }

// Демо-справочники (позже — из ПИМ / эндпоинта систем).
export const BUILDING_CATEGORIES = [
  { id: '1', title: '1 · Жилые, гостиницы, общежития' },
  { id: '2', title: '2 · Детсады, школы, медицинские, интернаты' },
  { id: '3', title: '3 · Общественные, административные, бытовые' },
  { id: '4', title: '4 · Производственные (сухой/нормальный)' },
  { id: '5', title: '5 · Производственные с избытком теплоты' },
]

export const THERMAL_SYSTEMS = [
  { slug: 'tn-standart', name: 'ТН-КРОВЛЯ Стандарт' },
  { slug: 'tn-prof', name: 'ТН-КРОВЛЯ Проф' },
  { slug: 'tn-smart', name: 'ТН-КРОВЛЯ Смарт' },
  { slug: 'tn-balast', name: 'ТН-КРОВЛЯ Балласт' },
]

// Типы узлов неоднородностей СП 230 для ручного добавления.
export const HETERO_NODES = [
  { node: 'parapet', kind: 'linear', label: 'Парапет (сопряжение со стеной)' },
  { node: 'fonar', kind: 'linear', label: 'Примыкание к фонарю' },
  { node: 'junction', kind: 'linear', label: 'Примыкание к надстройке/шахте' },
  { node: 'def_shov', kind: 'linear', label: 'Деформационный шов' },
  { node: 'prohodka', kind: 'point', label: 'Проходка трубы/кабеля' },
  { node: 'aerator', kind: 'point', label: 'Аэратор' },
  { node: 'kolonna', kind: 'point', label: 'Колонна' },
] as const
