// Общая логика теплотехнического расчёта (состояние + действия), которую разделяют
// шаги мастера. Состояние на уровне модуля — единый расчёт в один момент времени.
// Готово для встройки в общий мастер: шаги-компоненты просто используют этот composable.
import { computed, ref, watch } from 'vue'
import { getProject } from '@/api/client'
import { DEMO_GEOMETRY, type GeometryData, type Obstacle } from '@/types'
import {
  DEFAULT_INDOOR_TEMP,
  HETERO_NODES,
  calculateThermal,
  type HeteroItem,
  type ThermalResponse,
} from '@/api/thermal'

const projectId = ref('')
const categoryId = ref('4')
const systemEkn = ref('tn-standart')
const tIn = ref(DEFAULT_INDOOR_TEMP['4'])
const humidityPct = ref(55)
const hetero = ref<HeteroItem[]>([])
const result = ref<ThermalResponse | null>(null)
const geometry = ref<GeometryData | null>(null)
const calculating = ref(false)
const error = ref('')
let heteroSeq = 0

watch(categoryId, (id) => {
  tIn.value = DEFAULT_INDOOR_TEMP[id] ?? 20
})

const humidityRegime = computed(() => {
  const p = humidityPct.value
  if (p <= 50) return { label: 'Сухой', cls: 'reg-dry' }
  if (p <= 60) return { label: 'Нормальный', cls: 'reg-norm' }
  if (p <= 75) return { label: 'Влажный', cls: 'reg-wet' }
  return { label: 'Мокрый', cls: 'reg-soak' }
})

const planGeometry = computed<GeometryData>(() =>
  geometry.value && (geometry.value.roof?.length ?? 0) >= 3 ? geometry.value : DEMO_GEOMETRY,
)
const usingDemoPlan = computed(() => planGeometry.value === DEMO_GEOMETRY)
const activeObstacleIds = computed(() =>
  hetero.value.map((h) => h.elementId).filter((x): x is string => !!x),
)
const displayLayers = computed(() => result.value?.thermal?.layers ?? result.value?.system?.layers ?? [])
const rPct = computed(() => (result.value?.thermal ? Math.round(result.value.thermal.r * 1000) / 10 : 100))

function nodeLabel(node: string) {
  return HETERO_NODES.find((n) => n.node === node)?.label ?? node
}

function reset(id: string) {
  projectId.value = id
  hetero.value = []
  result.value = null
  geometry.value = null
  heteroSeq = 0
}

async function loadGeometry() {
  geometry.value = null
  if (!projectId.value) return
  try {
    const p = await getProject(projectId.value)
    geometry.value = p.geometry ?? null
  } catch {
    geometry.value = null
  }
}

// Задать геометрию напрямую (живая модель из мастера — приоритетнее загрузки с сервера).
function setGeometry(g: GeometryData | null) {
  if (g && (g.roof?.length ?? 0) >= 3) geometry.value = g
}

function addHetero(node: string, kind: 'linear' | 'point') {
  heteroSeq += 1
  hetero.value.push({
    id: `h${heteroSeq}`, kind, sp230Node: node, status: 'confirmed',
    ...(kind === 'linear' ? { lengthM: 50 } : { count: 1 }),
  })
}
function removeHetero(id: string) {
  hetero.value = hetero.value.filter((h) => h.id !== id)
}
function obstacleToNode(o: Obstacle): { node: string; kind: 'linear' | 'point' } | null {
  const t = (o.type + ' ' + (o.short ?? '')).toLowerCase()
  if (t.includes('фонар')) return { node: 'fonar', kind: 'linear' }
  if (t.includes('надстрой') || t.includes('лестничн') || t.includes('шахт')) return { node: 'junction', kind: 'linear' }
  if (t.includes('аэратор')) return { node: 'aerator', kind: 'point' }
  if (t.includes('проходк')) return { node: 'prohodka', kind: 'point' }
  if (t.includes('колонн')) return { node: 'kolonna', kind: 'point' }
  if (t.includes('блок') || t.includes('установк') || t.includes('вент')) return { node: 'junction', kind: 'linear' }
  return null
}
// Узел по умолчанию для нераспознанного элемента: круг → точечная, иначе → линейная.
function defaultNode(o: Obstacle): { node: string; kind: 'linear' | 'point' } {
  return o.shape === 'circle' ? { node: 'prohodka', kind: 'point' } : { node: 'junction', kind: 'linear' }
}
function toggleObstacle(o: Obstacle) {
  const exists = hetero.value.find((h) => h.elementId === o.id)
  if (exists) {
    hetero.value = hetero.value.filter((h) => h.elementId !== o.id)
    return
  }
  const map = obstacleToNode(o) ?? defaultNode(o)
  heteroSeq += 1
  hetero.value.push({
    id: `h${heteroSeq}`, elementId: o.id, kind: map.kind, sp230Node: map.node, status: 'confirmed',
    ...(map.kind === 'linear' ? { lengthM: 40 } : { count: 1 }),
  })
}

async function runCalc() {
  if (!projectId.value) return
  calculating.value = true
  error.value = ''
  try {
    result.value = await calculateThermal(projectId.value, {
      modules: { thermal: true, vapor: true },
      categoryId: categoryId.value,
      tIn: tIn.value,
      humidityPct: humidityPct.value,
      systemEkn: systemEkn.value,
      heterogeneities: hetero.value,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка расчёта'
  } finally {
    calculating.value = false
  }
}

// Пересчёт при смене системы — чтобы состав и разрез на шаге «состав» обновлялись сразу.
watch(systemEkn, () => {
  if (projectId.value) void runCalc()
})

export function useThermalCalc() {
  return {
    // состояние
    projectId, categoryId, systemEkn, tIn, humidityPct, hetero, result, geometry, calculating, error,
    // computed
    humidityRegime, planGeometry, usingDemoPlan, activeObstacleIds, displayLayers, rPct,
    // действия
    reset, loadGeometry, setGeometry, addHetero, removeHetero, toggleObstacle, runCalc, nodeLabel,
  }
}
