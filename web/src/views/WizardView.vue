<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import RoofCanvas from '@/components/RoofCanvas.vue'
import StepUpload from '@/components/StepUpload.vue'
import type { CalcMetaFields, UploadedFileItem } from '@/components/StepUpload.vue'
import ThermoParamsStep from '@/components/thermal/ThermoParamsStep.vue'
import ThermoHeteroStep from '@/components/thermal/ThermoHeteroStep.vue'
import ThermoResultStep from '@/components/thermal/ThermoResultStep.vue'
import { useThermalCalc } from '@/composables/useThermalCalc'
import {
  calculateProject,
  downloadExport,
  getCalculationRun,
  getProject,
  lookupClimate,
  projectUnderlayUrl,
  updateProject,
  uploadProjectFile,
  type ClimateLookupResult,
} from '@/api/client'
import WindRose from '@/components/WindRose.vue'
import YandexMapPane from '@/components/YandexMapPane.vue'
import {
  DEMO_GEOMETRY,
  DRAW_TOOLS,
  DEFAULT_PARAPET_M,
  EMPTY_GEOMETRY,
  STEPS,
  type CalculationData,
  type CalculationRunSnapshot,
  type GeometryData,
  type MapSelectPayload,
  type Obstacle,
  type Project,
  type Sensor,
  type Snowbag,
} from '@/types'
import type { DrawSession, EditTarget } from '@/composables/useRoofDrawing'
import {
  closedPolylineLengthPx,
  formatLengthM,
  formatParapetMm,
  parseParapetMm,
  PX_PER_M,
  roofSideCount,
  sideLabel,
  polylineEdgeCount,
  obstacleSideCount,
} from '@/composables/useRoofDrawing'
import { centroid } from '@/utils/roof3d'
import { parseCityFromAddress } from '@/utils/address'
import { parseUnderlayPageFromName } from '@/utils/pdfPage'
import { inferUnderlayMime, isDwgMime } from '@/utils/underlayMime'

const route = useRoute()
const router = useRouter()
const project = ref<Project | null>(null)
const calculation = ref<CalculationData | null>(null)
const geometry = ref<GeometryData>({ ...EMPTY_GEOMETRY, obstacles: [] })
const uploadedFiles = ref<UploadedFileItem[]>([])
const uploadScale = ref<string | null>(null)
const mapAddress = ref('')
const mapLat = ref<number | null>(null)
const mapLon = ref<number | null>(null)
const mapZoom = ref<number | null>(null)
const mapCenter = ref<[number, number] | null>(null)
const mapSelected = ref(false)
const step = ref(0)
const maxReached = ref(0)
const calculating = ref(false)

// Платформа: выбранные расчёты из адреса (?calc=snow,thermal). По умолчанию — снег.
const calcQuery = String(route.query.calc ?? 'snow')
const modules = ref({ snow: calcQuery.includes('snow'), thermal: calcQuery.includes('thermal') })
if (!modules.value.snow && !modules.value.thermal) modules.value.snow = true
// Динамическая сборка шагов: общие → снег → теплотехника → результат.
const stepDef = (id: string) => STEPS.find((s) => s.id === id)!
function buildSteps(m: { snow: boolean; thermal: boolean }) {
  const out: { id: string; n: number; label: string }[] = [stepDef('upload'), stepDef('roof')]
  if (m.snow) out.push(stepDef('climate'), stepDef('bags'))
  if (m.thermal) out.push({ id: 'thermo-params', n: 0, label: 'Теплотехника · состав' }, { id: 'thermo-hetero', n: 0, label: 'Неоднородности' })
  out.push(stepDef('result'))
  return out.map((x, i) => ({ ...x, n: i + 1 }))
}
const steps = computed(() => buildSteps(modules.value))

// Теплотехника: общая логика расчёта (для тепло-шагов).
const therm = useThermalCalc()
const isThermalStep = computed(() => ['thermo-params', 'thermo-hetero'].includes(steps.value[step.value]?.id ?? ''))
const isThermalResult = computed(() => steps.value[step.value]?.id === 'result' && modules.value.thermal && !modules.value.snow)
let thermalReady = false
async function initThermal() {
  if (!modules.value.thermal || !projectId.value || thermalReady) return
  thermalReady = true
  therm.reset(projectId.value)
  await therm.loadGeometry()
  await therm.runCalc()
}
watch(step, () => {
  if (isThermalStep.value || isThermalResult.value) void initThermal()
})
const calcProgress = ref(0)
const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const view3d = ref(false)
const underlayUrl = ref('')
const hasUnderlay = ref(false)
const showUnderlay = ref(true)
const primarySource = ref<'file' | 'map' | null>(null)
const orthogonalMode = ref(false)
const roofExpanded = ref(false)
const roofName = ref('Контур кровли')
const previewUnavailable = ref('')
const underlayMimeType = ref('')
const underlayPage = ref<number | null>(null)
const localUnderlayUrl = ref('')
const underlayVersion = ref(0)
const pdfPickerFile = ref<File | null>(null)
const editTarget = ref<EditTarget | null>(null)
const highlightedRoofSide = ref<number | null>(null)
const drawSession = ref<DrawSession | null>(null)
const addDialogOpen = ref(false)
const pickedTool = ref<(typeof DRAW_TOOLS)[number] | null>(null)
const elementDraftName = ref('')
const elementDraftHeight = ref(1)
const parapetMm = ref(600)
const climatePreview = ref<ClimateLookupResult | null>(null)
const climateLoading = ref(false)
let skipClimateWatch = false

function dataSourceStorageKey(id: string) {
  return `snowbag-data-source-${id}`
}

function mapViewportStorageKey(id: string) {
  return `snowbag-map-viewport-${id}`
}

function loadStoredMapViewport(id: string): { zoom: number; center: [number, number] } | null {
  try {
    const raw = localStorage.getItem(mapViewportStorageKey(id))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { zoom?: number; center?: [number, number] }
    if (parsed.zoom == null || !parsed.center?.length) return null
    return { zoom: parsed.zoom, center: [parsed.center[0], parsed.center[1]] }
  } catch {
    return null
  }
}

function storeMapViewport(id: string, zoom: number, center: [number, number]) {
  localStorage.setItem(mapViewportStorageKey(id), JSON.stringify({ zoom, center }))
}

function loadStoredDataSource(id: string): 'file' | 'map' | null {
  const v = localStorage.getItem(dataSourceStorageKey(id))
  return v === 'file' || v === 'map' ? v : null
}

function storeDataSource(id: string, source: 'file' | 'map') {
  localStorage.setItem(dataSourceStorageKey(id), source)
}

const snowRegion = ref('III')
const windRegion = ref('II')
const northDeg = ref(-18)
const selectedBagId = ref<string | null>(null)
const selectedSensorId = ref<string | null>(null)
const manualBagWidthM = ref(6)
const manualBagDepthM = ref(4)
const archiveView = ref(false)
const archiveLabel = ref('')

const projectId = computed(() => route.params.id as string | undefined)
const runId = computed(() => route.query.runId as string | undefined)

const underlaySrc = computed(() => {
  if (localUnderlayUrl.value) return localUnderlayUrl.value
  if (!projectId.value || !hasUnderlay.value) return ''
  const v = underlayVersion.value
  return `${projectUnderlayUrl(projectId.value)}${v ? `?v=${v}` : ''}`
})

onMounted(async () => {
  if (!projectId.value) {
    await router.replace('/')
    return
  }
  await loadProject()
})

async function loadProject() {
  if (!projectId.value) return
  try {
    archiveView.value = false
    archiveLabel.value = ''
    project.value = await getProject(projectId.value)
    applyProjectMeta()

    const rid = runId.value
    const isHistorical = rid && rid !== projectId.value
    if (isHistorical) {
      const run = await getCalculationRun(projectId.value, rid)
      applyRunSnapshot(run)
      archiveView.value = true
      archiveLabel.value = `${run.calcNo} · ${run.created}`
      maxReached.value = steps.value.length - 1
      step.value = steps.value.length - 1
      return
    }

    if (project.value.calculation && Object.keys(project.value.calculation).length) {
      calculation.value = project.value.calculation
      maxReached.value = steps.value.length - 1
      step.value = steps.value.length - 1
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Проект не найден'
  }
}

function applyProjectMeta() {
  if (!project.value) return
  if (project.value.geometry?.roof?.length) {
    geometry.value = {
      ...project.value.geometry,
      obstacles: [...(project.value.geometry.obstacles ?? [])],
      areaM2: project.value.geometry.areaM2 || project.value.areaM2 || DEMO_GEOMETRY.areaM2,
      walkway: undefined,
    }
    roofName.value = project.value.geometry.roofName ?? 'Контур кровли'
    if (geometry.value.roof?.length) {
      geometry.value = {
        ...geometry.value,
        sideParapets: syncSideParapets(geometry.value.roof),
      }
    }
  } else {
    geometry.value = { ...EMPTY_GEOMETRY, obstacles: [] }
    roofName.value = 'Контур кровли'
  }
  const underlayName = project.value.underlayName || 'План кровли'
  const resolvedMime = inferUnderlayMime(underlayName, project.value.underlayMimeType)
  const parsedPage = parseUnderlayPageFromName(underlayName)
  underlayPage.value = parsedPage
  const underlayDesc = isDwgMime(resolvedMime) || /\.(dwg|dxf)$/i.test(underlayName)
    ? 'узел / чертёж'
    : 'план кровли'
  uploadedFiles.value = project.value.underlayUrl
    ? [{
      name: underlayName,
      size: '—',
      desc: underlayDesc,
      selected: true,
      page: parsedPage ?? undefined,
    }]
    : []
  underlayMimeType.value = resolvedMime
  uploadScale.value = project.value.underlayUrl ? '1:200' : null
  mapAddress.value = project.value.address || ''
  mapLat.value = project.value.lat ?? null
  mapLon.value = project.value.lon ?? null
  if (projectId.value) {
    const storedViewport = loadStoredMapViewport(projectId.value)
    if (storedViewport) {
      mapZoom.value = storedViewport.zoom
      mapCenter.value = storedViewport.center
    }
  }
  mapSelected.value =
    (!!project.value.address && project.value.address !== 'Укажите адрес объекта')
    || (mapLat.value != null && mapLon.value != null)
  const storedSource = projectId.value ? loadStoredDataSource(projectId.value) : null
  if (storedSource) {
    primarySource.value = storedSource
  } else if (hasUnderlay.value) {
    primarySource.value = 'file'
  } else if (mapSelected.value) {
    primarySource.value = 'map'
  }
  snowRegion.value = project.value.snowRegion || 'III'
  windRegion.value = project.value.windRegion || 'II'
  northDeg.value = project.value.northDeg ?? -18
  parapetMm.value = parseParapetMm(project.value.parapet)
  hasUnderlay.value = !!project.value.underlayUrl
  if (hasUnderlay.value) underlayVersion.value += 1
  underlayUrl.value = project.value.underlayUrl || ''
}

function applyRunSnapshot(run: CalculationRunSnapshot) {
  if (run.geometry?.roof?.length) {
    geometry.value = {
      ...run.geometry,
      obstacles: [...(run.geometry.obstacles ?? [])],
      areaM2: run.geometry.areaM2 || project.value?.areaM2 || DEMO_GEOMETRY.areaM2,
    }
  }
  snowRegion.value = run.snowRegion || 'III'
  windRegion.value = run.windRegion || 'II'
  northDeg.value = run.northDeg ?? -18
  calculation.value = run.calculation
}

watch(() => project.value?.city, async (city) => {
  if (!city) return
  if (steps.value[step.value]?.id === 'climate') {
    await resolveClimateFromCoords()
  }
})

watch([snowRegion, windRegion], () => {
  if (skipClimateWatch) return
  if (steps.value[step.value]?.id === 'climate') void refreshClimate()
})

watch(step, async (i) => {
  if (steps.value[i]?.id === 'climate') {
    const city = parseCityFromAddress(mapAddress.value || project.value?.address || '')
    if (city && projectId.value && city !== project.value?.city && !archiveView.value) {
      try {
        project.value = await updateProject(projectId.value, { city })
      } catch { /* ignore */ }
    }
    void resolveClimateFromCoords()
  }
})

async function resolveClimateFromCoords() {
  const lat = mapLat.value ?? project.value?.lat ?? null
  const lon = mapLon.value ?? project.value?.lon ?? null
  const city = project.value?.city || cityFromAddress.value || ''
  if (!city && (lat == null || lon == null)) {
    climatePreview.value = null
    return
  }
  climateLoading.value = true
  try {
    if (lat != null && lon != null) {
      climatePreview.value = await lookupClimate(city, undefined, undefined, { lat, lon })
    } else {
      climatePreview.value = await lookupClimate(city)
    }
    skipClimateWatch = true
    snowRegion.value = climatePreview.value.snowRegion
    windRegion.value = climatePreview.value.windRegion
    skipClimateWatch = false
  } catch {
    climatePreview.value = null
  } finally {
    climateLoading.value = false
  }
}

async function refreshClimate() {
  const city = project.value?.city
  if (!city) {
    climatePreview.value = null
    return
  }
  climateLoading.value = true
  try {
    climatePreview.value = await lookupClimate(city, snowRegion.value, windRegion.value)
  } catch {
    climatePreview.value = null
  } finally {
    climateLoading.value = false
  }
}

const sgKgLabel = computed(() => {
  const sg = climatePreview.value?.sg
  if (sg == null) return '—'
  // 1 kPa (kN/m²) ≈ 1000/9.80665 kg/m² — matches SP20 reference (e.g. 1.5 kPa → 153 kg/m²)
  return String(Math.round((sg * 1000) / 9.80665)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
})

const climateWindRose = computed(() => {
  if (steps.value[step.value]?.id === 'climate' && climatePreview.value?.windRose?.length) {
    return climatePreview.value.windRose
  }
  return calculation.value?.windRose
})

function goStep(i: number) {
  step.value = i
  maxReached.value = Math.max(maxReached.value, i)
}

async function saveDraft() {
  if (!projectId.value || archiveView.value) return
  saving.value = true
  try {
    const sideParapets = ensureSideParapets()
    geometry.value = {
      ...geometry.value,
      roofName: roofName.value,
      sideParapets,
      walkway: undefined,
    }
    project.value = await updateProject(projectId.value, {
      geometry: geometry.value,
      northDeg: northDeg.value,
      snowRegion: snowRegion.value,
      windRegion: windRegion.value,
      areaM2: geometry.value.areaM2 ?? project.value?.areaM2,
      address: mapAddress.value || project.value?.address,
      lat: mapLat.value ?? undefined,
      lon: mapLon.value ?? undefined,
      city: project.value?.city,
      parapet: formatParapetMm(parapetMm.value),
      calculation: calculation.value ?? undefined,
      status: 'draft',
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

async function next() {
  if (archiveView.value) return
  const id = steps.value[step.value].id
  if (id === 'roof') {
    await saveDraft()
  }
  if (id === 'climate') {
    await saveDraft()
    const ok = await runCalculate()
    if (!ok && step.value < steps.value.length - 1) goStep(3)
    return
  }
  if (id === 'thermo-params') await initThermal()
  if (id === 'thermo-hetero') await therm.runCalc()
  if (step.value < steps.value.length - 1) goStep(step.value + 1)
}

function back() {
  if (step.value > 0) goStep(step.value - 1)
}

async function runCalculate(): Promise<boolean> {
  if (!projectId.value) return false
  calculating.value = true
  calcProgress.value = 5
  const timer = setInterval(() => {
    calcProgress.value = Math.min(100, calcProgress.value + 8)
  }, 120)
  try {
    const sensors = calculation.value?.sensors?.map((s) => ({ ...s, zone: s.zone ?? null }))
    const res = await calculateProject(projectId.value, {
      northDeg: northDeg.value,
      snowRegion: snowRegion.value,
      windRegion: windRegion.value,
      parapetMm: parapetMm.value,
      geometry: geometry.value,
      sensors: sensors?.length ? sensors : undefined,
    })
    calculation.value = res.calculation
    project.value = res.project
    goStep(3)
    return true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка расчёта'
    return false
  } finally {
    clearInterval(timer)
    calculating.value = false
  }
}

async function onFileSelect(file: File) {
  if (!projectId.value || archiveView.value) return
  error.value = ''
  previewUnavailable.value = ''

  if (/\.pdf$/i.test(file.name)) {
    pdfPickerFile.value = file
    return
  }

  await uploadUnderlayFile(file)
}

function onPdfPickerCancel() {
  pdfPickerFile.value = null
}

async function onPdfPageConfirm(payload: { page: number; file: File }) {
  pdfPickerFile.value = null
  underlayPage.value = payload.page
  await uploadUnderlayFile(payload.file, { page: payload.page })
}

async function uploadUnderlayFile(file: File, meta?: { page?: number }) {
  if (!projectId.value || archiveView.value) return
  uploading.value = true
  error.value = ''
  previewUnavailable.value = ''
  const isDwg = /\.(dwg|dxf)$/i.test(file.name)
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name)
  if (!isDwg && isImage) {
    if (localUnderlayUrl.value) URL.revokeObjectURL(localUnderlayUrl.value)
    localUnderlayUrl.value = URL.createObjectURL(file)
    hasUnderlay.value = true
    underlayMimeType.value = inferUnderlayMime(file.name, file.type)
  }
  try {
    await uploadProjectFile(projectId.value, file)
    if (isDwg) {
      hasUnderlay.value = false
      previewUnavailable.value = 'Превью для DWG/DXF недоступно. Файл сохранён — конвертация будет в следующей версии.'
    } else {
      hasUnderlay.value = true
      primarySource.value = 'file'
      if (projectId.value) storeDataSource(projectId.value, 'file')
      showUnderlay.value = true
      underlayUrl.value = projectUnderlayUrl(projectId.value)
      underlayVersion.value += 1
    }
    underlayMimeType.value = inferUnderlayMime(file.name, file.type)
    const uploadedName = file.name
    const uploadedMime = underlayMimeType.value
    const page = meta?.page ?? parseUnderlayPageFromName(uploadedName) ?? undefined
    if (page != null) underlayPage.value = page
    uploadedFiles.value = [{
      name: uploadedName,
      size: formatFileSize(file.size),
      desc: isDwg ? 'узел / чертёж' : 'план кровли',
      selected: true,
      page,
    }]
    if (isImage) uploadScale.value = uploadScale.value ?? '1:200'
    if (meta?.page != null) uploadScale.value = '1:200'
    await loadProject()
    if (hasUnderlay.value && uploadedFiles.value.length) {
      uploadedFiles.value = [{
        ...uploadedFiles.value[0],
        name: project.value?.underlayName || uploadedName,
        size: formatFileSize(file.size),
        page: underlayPage.value ?? page,
      }]
      underlayMimeType.value = inferUnderlayMime(
        project.value?.underlayName || uploadedName,
        project.value?.underlayMimeType || uploadedMime,
      )
      if (localUnderlayUrl.value) {
        URL.revokeObjectURL(localUnderlayUrl.value)
        localUnderlayUrl.value = ''
      }
    }
    if (isDwg) {
      hasUnderlay.value = false
      previewUnavailable.value = 'Превью для DWG/DXF недоступно. Файл сохранён — конвертация будет в следующей версии.'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка загрузки'
  } finally {
    uploading.value = false
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace('.', ',')} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} МБ`
}

async function onMapSelect(payload: MapSelectPayload) {
  if (archiveView.value) return
  mapAddress.value = payload.address
  mapLat.value = payload.lat
  mapLon.value = payload.lon
  if (payload.zoom != null) mapZoom.value = payload.zoom
  if (payload.center) mapCenter.value = payload.center
  if (payload.zoom != null && payload.center && projectId.value) {
    storeMapViewport(projectId.value, payload.zoom, payload.center)
  }
  mapSelected.value = true
  primarySource.value = 'map'
  if (projectId.value) storeDataSource(projectId.value, 'map')
  const city = parseCityFromAddress(payload.address)
  if (!projectId.value) return
  try {
    project.value = await updateProject(projectId.value, {
      address: payload.address,
      lat: payload.lat,
      lon: payload.lon,
      ...(city ? { city } : {}),
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось сохранить адрес'
  }
}

function onMapViewportChange(payload: { zoom: number; center: [number, number] }) {
  mapZoom.value = payload.zoom
  mapCenter.value = payload.center
  if (projectId.value) storeMapViewport(projectId.value, payload.zoom, payload.center)
}

const isFreshProject = computed(() => {
  if (route.query.new === '1') return true
  return !hasUnderlay.value && !(project.value?.geometry?.roof?.length) && uploadedFiles.value.length === 0
})

const calcMeta = computed<CalcMetaFields>(() => ({
  name: project.value?.name ?? '',
  city: project.value?.city ?? '',
  number: project.value?.number ?? '',
  calcNo: project.value?.calcNo ?? '',
  customer: project.value?.customer ?? '',
}))

async function onCalcMetaUpdate(payload: Partial<CalcMetaFields>) {
  if (archiveView.value || !projectId.value) return
  const body: Record<string, string> = {}
  if (payload.name !== undefined) body.name = payload.name
  if (payload.city !== undefined) body.city = payload.city
  if (payload.number !== undefined) body.number = payload.number
  if (payload.calcNo !== undefined) body.calcNo = payload.calcNo
  if (payload.customer !== undefined) body.customer = payload.customer
  if (!Object.keys(body).length) return
  try {
    project.value = await updateProject(projectId.value, body)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось сохранить данные расчёта'
  }
}

function openAddDialog() {
  pickedTool.value = null
  elementDraftName.value = ''
  elementDraftHeight.value = 1
  addDialogOpen.value = true
}

function pickDrawTool(t: (typeof DRAW_TOOLS)[number]) {
  pickedTool.value = t
  const n = (geometry.value.obstacles?.length ?? 0) + 1
  elementDraftName.value = `Элемент ${n}`
  elementDraftHeight.value = 1
}

function startDrawFromDialog() {
  const t = pickedTool.value
  if (!t) return
  const label = elementDraftName.value.trim() || `Элемент ${(geometry.value.obstacles?.length ?? 0) + 1}`
  drawSession.value = {
    tool: t.tool,
    target: 'obstacle',
    label,
    short: label,
    typeName: label,
    hM: elementDraftHeight.value,
  }
  orthogonalMode.value = true
  addDialogOpen.value = false
  pickedTool.value = null
}

function startDrawRoof() {
  if (archiveView.value) return
  drawSession.value = { tool: 'polyline', target: 'roof', label: 'контур кровли' }
  editTarget.value = null
  orthogonalMode.value = true
}

function cancelDraw() {
  drawSession.value = null
}

function onDrawFinish() {
  drawSession.value = null
}

function onRoofChange(points: number[][]) {
  geometry.value = {
    ...geometry.value,
    roof: points.map((p) => [...p]),
    sideParapets: syncSideParapets(points),
  }
  editTarget.value = 'roof'
  roofExpanded.value = true
}

function syncSideParapets(points: number[][]): number[] {
  const count = roofSideCount(points)
  const prev = geometry.value.sideParapets ?? []
  return Array.from({ length: count }, (_, i) => prev[i] ?? DEFAULT_PARAPET_M)
}

function ensureSideParapets(): number[] {
  return syncSideParapets(geometry.value.roof ?? [])
}

function updateSideParapet(index: number, value: number) {
  const sides = ensureSideParapets()
  sides[index] = Math.max(0, value)
  geometry.value = { ...geometry.value, sideParapets: sides }
}

function onObstacleAdd(o: Obstacle) {
  const id = `${o.short?.toLowerCase().replace(/\s+/g, '-') ?? 'el'}-${Date.now()}`
  const obstacle = {
    ...o,
    id,
    name: o.name ?? o.short,
    ...(o.shape === 'polyline' && o.points?.length
      ? { sideHeights: syncPolylineSideHeights(o.points) }
      : o.shape === 'rect' && o.w && o.h
        ? { sideHeights: syncRectSideHeights(o) }
        : {}),
  }
  geometry.value = {
    ...geometry.value,
    obstacles: [...(geometry.value.obstacles ?? []), obstacle],
  }
  editTarget.value = { obstacleId: id }
  drawSession.value = null
}

function onObstacleChange(o: Obstacle) {
  const next = { ...o }
  if (next.shape === 'polyline' && next.points?.length) {
    next.sideHeights = syncPolylineSideHeights(next.points, next.sideHeights ?? [])
  } else if (next.shape === 'rect' && next.w && next.h) {
    next.sideHeights = syncRectSideHeights(next, next.sideHeights ?? [])
  }
  geometry.value = {
    ...geometry.value,
    obstacles: (geometry.value.obstacles ?? []).map((x) => (x.id === next.id ? next : x)),
  }
}

function onObstacleSelect(id: string) {
  editTarget.value = { obstacleId: id }
  drawSession.value = null
}

function selectEditRoof() {
  if (editTarget.value === 'roof') {
    roofExpanded.value = !roofExpanded.value
  } else {
    editTarget.value = 'roof'
    roofExpanded.value = true
  }
  drawSession.value = null
}

function clearEditSelection() {
  editTarget.value = null
}

const selectedObstacle = computed(() => {
  const t = editTarget.value
  if (!t || typeof t !== 'object' || !('obstacleId' in t)) return null
  return geometry.value.obstacles?.find((o) => o.id === t.obstacleId) ?? null
})

const drawBannerLabel = computed(() => {
  const s = drawSession.value
  if (!s) return ''
  const ortho = orthogonalMode.value ? ' · ортогональный режим' : ''
  if (s.tool === 'polyline') return `Обведите ${s.label} на плане (Enter — завершить, Esc — отмена)${ortho}`
  if (s.tool === 'rect') return `Потяните прямоугольник для «${s.label}»${ortho}`
  return `Укажите центр и радиус для «${s.label}»`
})

const roofLengthLabel = computed(() => {
  const pts = geometry.value.roof ?? []
  if (pts.length < 2) return '—'
  return formatLengthM(closedPolylineLengthPx(pts))
})

const roofSidesLabel = computed(() => {
  const count = roofSideCount(geometry.value.roof ?? [])
  if (!count) return ''
  return `${count} ${count === 1 ? 'сторона' : count < 5 ? 'стороны' : 'сторон'}`
})

const sideParapetsList = computed(() => ensureSideParapets())

const roofSideIndices = computed(() => {
  const count = roofSideCount(geometry.value.roof ?? [])
  return Array.from({ length: count }, (_, i) => i)
})

function syncPolylineSideHeights(points: number[][], prev: number[] = []): number[] {
  const count = polylineEdgeCount(points)
  return Array.from({ length: count }, (_, i) => prev[i] ?? DEFAULT_PARAPET_M)
}

function syncRectSideHeights(obs: Obstacle, prev: number[] = []): number[] {
  return Array.from({ length: 4 }, (_, i) => prev[i] ?? obs.hM ?? DEFAULT_PARAPET_M)
}

function obstacleSideHeights(obs: Obstacle): number[] {
  if (obs.shape === 'polyline' && obs.points?.length) {
    return syncPolylineSideHeights(obs.points, obs.sideHeights ?? [])
  }
  if (obs.shape === 'rect' && obs.w && obs.h) {
    return syncRectSideHeights(obs, obs.sideHeights ?? [])
  }
  return []
}

function updateObstacleSideHeight(id: string, index: number, value: number) {
  const obs = geometry.value.obstacles?.find((o) => o.id === id)
  if (!obs) return
  if (obs.shape === 'polyline' && obs.points?.length) {
    const sides = syncPolylineSideHeights(obs.points, obs.sideHeights ?? [])
    sides[index] = Math.max(0, value)
    onObstacleChange({ ...obs, sideHeights: sides })
    return
  }
  if (obs.shape === 'rect' && obs.w && obs.h) {
    const sides = syncRectSideHeights(obs, obs.sideHeights ?? [])
    sides[index] = Math.max(0, value)
    onObstacleChange({ ...obs, sideHeights: sides })
  }
}

const selectedObstacleSideIndices = computed(() => {
  const obs = selectedObstacle.value
  if (!obs) return []
  const count = obstacleSideCount(obs)
  return Array.from({ length: count }, (_, i) => i)
})

const cityFromAddress = computed(() => parseCityFromAddress(mapAddress.value || project.value?.address || ''))

const climateCityLabel = computed(() => cityFromAddress.value || project.value?.city || '')

const showMapUnderlay = computed(() =>
  steps.value[step.value]?.id === 'roof'
  && primarySource.value === 'map'
  && mapSelected.value
  && mapLat.value != null
  && mapLon.value != null,
)

/** Map pan/zoom when not drawing on the roof canvas. */
const mapUnderlayNavigable = computed(() =>
  showMapUnderlay.value && !drawSession.value,
)

const showFileUnderlay = computed(() =>
  ['roof', 'climate'].includes(steps.value[step.value]?.id ?? '')
  && hasUnderlay.value
  && primarySource.value !== 'map',
)

const showUnderlayToggle = computed(() => showFileUnderlay.value)

function deleteSelected() {
  const t = editTarget.value
  if (!t) return
  if (t === 'roof') {
    if (!confirm('Сбросить контур кровли?')) return
    geometry.value = { ...geometry.value, roof: [], sideParapets: [] }
    roofExpanded.value = false
  } else if ('obstacleId' in t) {
    geometry.value = {
      ...geometry.value,
      obstacles: (geometry.value.obstacles ?? []).filter((o) => o.id !== t.obstacleId),
    }
  }
  editTarget.value = null
}

function updateObstacleName(id: string, name: string) {
  geometry.value = {
    ...geometry.value,
    obstacles: (geometry.value.obstacles ?? []).map((o) =>
      o.id === id ? { ...o, name, short: name, type: name } : o,
    ),
  }
}

function updateObstacleHeight(id: string, hM: number) {
  const v = Math.max(0, hM)
  geometry.value = {
    ...geometry.value,
    obstacles: (geometry.value.obstacles ?? []).map((o) =>
      o.id === id ? { ...o, hM: v } : o,
    ),
  }
}

function onSensorMove(id: string, x: number, y: number) {
  if (archiveView.value || !calculation.value?.sensors) return
  calculation.value = {
    ...calculation.value,
    sensors: calculation.value.sensors.map((s) => (s.id === id ? { ...s, x, y } : s)),
  }
}

async function recalcWithSensors() {
  if (archiveView.value || !projectId.value || !calculation.value?.sensors) return
  await runCalculateWithSensors(calculation.value.sensors)
}

async function runCalculateWithSensors(sensors: Sensor[]) {
  if (!projectId.value) return
  const res = await calculateProject(projectId.value, {
    northDeg: northDeg.value,
    snowRegion: snowRegion.value,
    windRegion: windRegion.value,
    parapetMm: parapetMm.value,
    geometry: geometry.value,
    sensors,
  })
  calculation.value = res.calculation
  project.value = res.project
}

const footerLabel = computed(() => {
  if (archiveView.value) return 'На главную'
  const id = steps.value[step.value].id
  if (id === 'climate') return 'Рассчитать мешки'
  if (id === 'bags') return 'Сформировать схему'
  if (id === 'thermo-params') return 'Далее'
  if (id === 'thermo-hetero') return 'Рассчитать теплотехнику'
  if (id === 'result') return 'Экспорт JSON'
  if (id === 'roof') return 'Подтвердить и далее'
  return 'Далее'
})

function onFooterNext() {
  if (archiveView.value) {
    void router.push('/')
    return
  }
  const id = steps.value[step.value].id
  if (id === 'result') {
    void downloadExport(projectId.value!, 'json')
    return
  }
  void next()
}

const roofAreaLabel = computed(() => {
  const a = project.value?.areaM2 || geometry.value.areaM2
  return a ? Math.round(a).toLocaleString('ru-RU') : '—'
})

const canvasLayers = computed(() => {
  const id = steps.value[step.value].id
  if (id === 'upload') {
    return { roof: false, underlay: false, obstacles: false, bags: false, sensors: false, wind: false }
  }
  const hasGeometry = !!(geometry.value.roof?.length)
  const showUnderlayLayer = showFileUnderlay.value && showUnderlay.value
  return {
    roof: hasGeometry,
    underlay: showUnderlayLayer,
    obstacles: id !== 'upload',
    walkway: false,
    parapet: id === 'roof' || id === 'bags' || id === 'result',
    bags: id === 'bags' || id === 'result',
    sensors: id === 'bags' || id === 'result',
    wind: id === 'climate' || id === 'bags' || id === 'result',
  }
})

function selectBag(id: string) {
  selectedBagId.value = selectedBagId.value === id ? null : id
}

function onBagChange(id: string, poly: number[][]) {
  if (!calculation.value?.snowbags) return
  const areaM2 = polygonAreaPx(poly) / (PX_PER_M * PX_PER_M)
  calculation.value = {
    ...calculation.value,
    snowbags: calculation.value.snowbags.map((b) =>
      b.id === id ? { ...b, poly, area: Math.max(1, Math.round(areaM2)) } : b,
    ),
  }
}

function selectSensor(id: string) {
  selectedSensorId.value = selectedSensorId.value === id ? null : id
}

function roofCentroid(): [number, number] {
  const pts = geometry.value.roof ?? []
  if (pts.length >= 3) return centroid(pts)
  return [500, 340]
}

function polygonAreaPx(poly: number[][]): number {
  if (poly.length < 3) return 0
  let sum = 0
  for (let i = 0; i < poly.length; i += 1) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

function makeManualBagPoly(cx: number, cy: number, widthM: number, depthM: number): number[][] {
  const w = Math.max(2, widthM) * PX_PER_M
  const h = Math.max(2, depthM) * PX_PER_M
  return [
    [cx - w / 2, cy - h / 2],
    [cx + w / 2, cy - h / 2],
    [cx + w / 2, cy + h / 2],
    [cx - w / 2, cy + h / 2],
  ]
}

function addSnowBag() {
  if (archiveView.value || !calculation.value) return
  const bags = [...(calculation.value.snowbags ?? [])]
  const n = bags.length + 1
  const id = `М-${n}`
  const [cx, cy] = roofCentroid()
  const poly = makeManualBagPoly(cx, cy, manualBagWidthM.value, manualBagDepthM.value)
  const areaM2 = polygonAreaPx(poly) / (PX_PER_M * PX_PER_M)
  const bag: Snowbag = {
    id,
    name: `Снеговой мешок ${n}`,
    basis: 'manual',
    scheme: 'ручная',
    poly,
    mu: 2.4,
    load: '4.3',
    area: Math.max(1, Math.round(areaM2)),
    risk: 'high',
    riskClass: 'повышенный',
  }
  calculation.value = {
    ...calculation.value,
    snowbags: [...bags, bag],
  }
  selectedBagId.value = id
}

function deleteSelectedBag() {
  const id = selectedBagId.value
  if (!id || !calculation.value?.snowbags) return
  calculation.value = {
    ...calculation.value,
    snowbags: calculation.value.snowbags.filter((b) => b.id !== id),
    sensors: (calculation.value.sensors ?? []).map((s) =>
      s.zone === id ? { ...s, zone: null } : s,
    ),
  }
  selectedBagId.value = null
}

function addSensor() {
  if (archiveView.value || !calculation.value) return
  const sensors = [...(calculation.value.sensors ?? [])]
  const n = sensors.length + 1
  const id = `S-${n}`
  let x = roofCentroid()[0]
  let y = roofCentroid()[1]
  if (selectedBagId.value) {
    const bag = calculation.value.snowbags?.find((b) => b.id === selectedBagId.value)
    if (bag?.poly?.length) {
      ;[x, y] = centroid(bag.poly)
    }
  }
  sensors.push({ id, x, y, zone: selectedBagId.value })
  calculation.value = { ...calculation.value, sensors }
  selectedSensorId.value = id
}

function deleteSelectedSensor() {
  const id = selectedSensorId.value
  if (!id || !calculation.value?.sensors) return
  calculation.value = {
    ...calculation.value,
    sensors: calculation.value.sensors.filter((s) => s.id !== id),
  }
  selectedSensorId.value = null
}

const showParapet = computed(() => parapetMm.value > 0)

const roofElements = computed(() =>
  (geometry.value.obstacles ?? []).map((o, i) => ({ ...o, ordinal: i + 1 })),
)
</script>

<template>
  <div class="layout">
    <AppHeader :project="project" @home="router.push('/')" />

    <nav class="stepper">
      <button
        v-for="(s, i) in steps"
        :key="s.id"
        type="button"
        class="step"
        :class="{ active: i === step, done: i < step }"
        :disabled="i > maxReached"
        @click="goStep(i)"
      >
        <span class="num">{{ i < step ? '✓' : s.n }}</span>
        <span class="label">{{ s.label }}</span>
      </button>
    </nav>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="archiveView" class="archive-banner">
      Архивная версия · {{ archiveLabel }} · только просмотр
    </div>

    <div v-if="calculating" class="calc-overlay">
      <div class="calc-card">
        <h2>Идёт расчёт снеговых мешков</h2>
        <p>{{ project?.name }} · {{ roofAreaLabel }} м²</p>
        <div class="bar"><div class="fill" :style="{ width: `${calcProgress}%` }" /></div>
      </div>
    </div>

    <div v-else class="work">
      <StepUpload
        v-if="steps[step].id === 'upload'"
        :is-fresh="isFreshProject"
        :files="uploadedFiles"
        :scale="uploadScale"
        :calc-meta="calcMeta"
        :calc-meta-readonly="archiveView"
        :map-address="mapAddress"
        :map-lat="mapLat"
        :map-lon="mapLon"
        :map-zoom="mapZoom"
        :map-center="mapCenter"
        :map-city="project?.city ?? ''"
        :map-selected="mapSelected"
        :underlay-src="underlaySrc"
        :underlay-mime-type="underlayMimeType"
        :underlay-page="underlayPage"
        :pdf-pick-file="pdfPickerFile"
        :preview-unavailable="previewUnavailable"
        :uploading="uploading"
        @file-select="onFileSelect"
        @map-select="onMapSelect"
        @map-viewport-change="onMapViewportChange"
        @pdf-page-confirm="onPdfPageConfirm"
        @pdf-pick-cancel="onPdfPickerCancel"
        @calc-meta-update="onCalcMetaUpdate"
      />

      <ThermoParamsStep v-else-if="steps[step].id === 'thermo-params'" />
      <ThermoHeteroStep v-else-if="steps[step].id === 'thermo-hetero'" />
      <ThermoResultStep v-else-if="isThermalResult" />

      <template v-else>
      <div class="canvas-pane">
        <div
          v-if="showUnderlayToggle"
          class="underlay-toggle"
        >
          <button type="button" class="toggle-track" :class="{ on: showUnderlay }" @click="showUnderlay = !showUnderlay">
            <span class="toggle-thumb" />
          </button>
          <span class="toggle-label">{{ showMapUnderlay ? 'Карта-подложка' : 'Подложка (оригинал)' }}</span>
        </div>
        <div
          v-if="steps[step].id === 'roof' && drawSession"
          class="draw-banner"
        >
          <span>{{ drawBannerLabel }}</span>
          <button
            type="button"
            class="ortho-btn"
            :class="{ active: orthogonalMode }"
            @click="orthogonalMode = !orthogonalMode"
          >⊥ Ортогональ</button>
          <button type="button" class="draw-cancel" @click="cancelDraw">Отмена</button>
        </div>
        <div class="canvas-stack">
          <YandexMapPane
            v-if="showMapUnderlay"
            class="map-underlay"
            :address="mapAddress"
            :lat="mapLat"
            :lon="mapLon"
            :zoom="mapZoom"
            :center="mapCenter"
            :city="project?.city ?? ''"
            :interactive="mapUnderlayNavigable"
            :allow-click="false"
            @viewport-change="onMapViewportChange"
          />
          <RoofCanvas
            class="roof-overlay"
            :class="{ 'roof-overlay--map': showMapUnderlay, 'roof-overlay--passthrough': mapUnderlayNavigable }"
            :geometry="geometry"
            :calculation="calculation"
            :north-deg="northDeg"
            :underlay-url="underlaySrc"
            :view3d="view3d && ['bags', 'result'].includes(steps[step].id)"
            :selected-bag-id="selectedBagId"
            :selected-sensor-id="selectedSensorId"
            :editable="steps[step].id === 'roof' && !archiveView"
            :editable-sensors="steps[step].id === 'bags' && !archiveView"
            :editable-bags="steps[step].id === 'bags' && !archiveView"
            :draw-session="steps[step].id === 'roof' ? drawSession : null"
            :edit-target="steps[step].id === 'roof' ? editTarget : null"
            :highlighted-side-index="steps[step].id === 'roof' ? highlightedRoofSide : null"
            :show-parapet="showParapet"
            :orthogonal="orthogonalMode"
            :transparent-bg="showMapUnderlay"
            :pointer-passthrough="mapUnderlayNavigable"
            :layers="canvasLayers"
            :preview-wind-rose="climateWindRose"
            @sensor-move="onSensorMove"
            @sensor-select="selectSensor"
            @bag-select="selectBag"
            @bag-change="onBagChange"
            @obstacle-select="onObstacleSelect"
            @roof-change="onRoofChange"
            @obstacle-add="onObstacleAdd"
            @obstacle-change="onObstacleChange"
            @draw-finish="onDrawFinish"
            @draw-cancel="cancelDraw"
            @edit-clear="clearEditSelection"
          />
        </div>
        <div v-if="['bags', 'result'].includes(steps[step].id)" class="canvas-tools">
          <button type="button" class="tool" :class="{ active: !view3d }" @click="view3d = false">2D</button>
          <button type="button" class="tool" :class="{ active: view3d }" @click="view3d = true">3D</button>
        </div>
        <div v-if="view3d && ['bags', 'result'].includes(steps[step].id)" class="heatmap-hint">
          Тепловая карта толщины снега · сугробы ограничены высотой парапета
        </div>
      </div>

      <aside class="panel">
        <template v-if="steps[step].id === 'roof'">
          <h3>Геометрия кровли</h3>
          <p>Обведите контур на {{ showMapUnderlay ? 'карте' : showFileUnderlay ? 'чертеже' : 'плане' }} и добавьте элементы.</p>

          <div v-if="!archiveView" class="panel-actions">
            <button
              v-if="!geometry.roof?.length"
              type="button"
              class="btn accent block"
              @click="startDrawRoof"
            >Обвести контур кровли</button>
            <button type="button" class="btn block" @click="openAddDialog">+ Добавить элементы</button>
          </div>

          <div class="roof-block" :class="{ active: editTarget === 'roof', expanded: roofExpanded }">
            <button type="button" class="obstacle-item roof-head" @click="selectEditRoof">
              <span class="obstacle-name">{{ roofName }}</span>
              <span class="obstacle-h">{{ roofLengthLabel }}<template v-if="roofSidesLabel"> · {{ roofSidesLabel }}</template></span>
            </button>
            <div v-if="roofExpanded && geometry.roof?.length" class="roof-sides">
              <div
                v-for="i in roofSideIndices"
                :key="`side-${i}`"
                class="side-row"
                :class="{ active: highlightedRoofSide === i }"
                @mouseenter="highlightedRoofSide = i"
                @mouseleave="highlightedRoofSide = null"
              >
                <span class="side-label">{{ sideLabel(i) }}</span>
                <label class="side-parapet">
                  <span>парапет, м</span>
                  <input
                    :value="sideParapetsList[i]"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    :disabled="archiveView"
                    @focus="highlightedRoofSide = i"
                    @input="updateSideParapet(i, Number(($event.target as HTMLInputElement).value))"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="obstacle-list">
            <button
              v-for="o in roofElements"
              :key="o.id"
              type="button"
              class="obstacle-item"
              :class="{ active: editTarget && typeof editTarget === 'object' && editTarget.obstacleId === o.id }"
              @click="onObstacleSelect(o.id)"
            >
              <span class="obstacle-name">{{ o.ordinal }}. {{ o.name || o.short }}</span>
              <span class="obstacle-h">{{ (o.hM ?? 0).toFixed(1) }} м</span>
            </button>
          </div>

          <div v-if="editTarget && !archiveView" class="edit-actions">
            <button type="button" class="btn danger" @click="deleteSelected">Удалить</button>
          </div>

          <div v-if="selectedObstacle && !archiveView" class="height-editor">
            <label>Название
              <input
                :value="selectedObstacle.name ?? selectedObstacle.short"
                type="text"
                @input="updateObstacleName(selectedObstacle.id, ($event.target as HTMLInputElement).value)"
              />
            </label>
            <template v-if="(selectedObstacle.shape === 'polyline' && selectedObstacle.points?.length) || (selectedObstacle.shape === 'rect' && selectedObstacle.w && selectedObstacle.h)">
              <div class="roof-sides obstacle-sides">
                <div
                  v-for="i in selectedObstacleSideIndices"
                  :key="`obs-side-${i}`"
                  class="side-row"
                >
                  <span class="side-label">{{ sideLabel(i) }}</span>
                  <label class="side-parapet">
                    <span>высота, м</span>
                    <input
                      :value="obstacleSideHeights(selectedObstacle)[i]"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      @input="updateObstacleSideHeight(selectedObstacle.id, i, Number(($event.target as HTMLInputElement).value))"
                    />
                  </label>
                </div>
              </div>
            </template>
            <template v-else>
              <label>Высота, м
                <input
                  :value="selectedObstacle.hM ?? 0"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  @input="updateObstacleHeight(selectedObstacle.id, Number(($event.target as HTMLInputElement).value))"
                />
              </label>
              <input
                :value="selectedObstacle.hM ?? 0"
                type="range"
                min="0"
                max="12"
                step="0.1"
                class="height-range"
                @input="updateObstacleHeight(selectedObstacle.id, Number(($event.target as HTMLInputElement).value))"
              />
            </template>
          </div>
        </template>

        <template v-else-if="steps[step].id === 'climate'">
          <h3>Ориентация и климат</h3>
          <p class="hint climate-norm">
            {{ climatePreview?.norm ?? 'СНиП 2.01.01-82' }}
            · роза ветров за {{ climatePreview?.monthLabel ?? 'январь' }}
          </p>
          <label>Город (определён по адресу)
            <input :value="climateCityLabel" readonly />
          </label>
          <p v-if="climatePreview?.regionSource === 'geo'" class="hint climate-geo">
            Снеговой и ветровой районы определены по координатам объекта на карте
          </p>
          <p v-else-if="mapLat == null || mapLon == null" class="hint climate-geo-warn">
            Укажите точку на карте на шаге «Подложка», чтобы определить районы автоматически
          </p>
          <label>Снеговой район (СП 20)
            <select v-model="snowRegion" :disabled="archiveView" @change="refreshClimate">
              <option v-for="r in ['I','II','III','IV','V','VI','VII','VIII']" :key="r" :value="r">{{ r }}</option>
            </select>
          </label>
          <label>Ветровой район
            <select v-model="windRegion" :disabled="archiveView" @change="refreshClimate">
              <option v-for="r in ['Ia','I','II','III','IV','V','VI','VII']" :key="r" :value="r">{{ r }}</option>
            </select>
          </label>
          <label>Ориентация севера, °
            <input v-model.number="northDeg" type="range" min="-90" max="90" step="1" :disabled="archiveView" />
            <span class="range-val">{{ northDeg }}°</span>
          </label>

          <div v-if="climatePreview" class="climate-metrics">
            <div>
              <span>Вес снег. покрова, Sg</span>
              <strong>{{ climatePreview.sg.toFixed(1).replace('.', ',') }} кПа</strong>
              <small>{{ sgKgLabel }} кг/м²</small>
            </div>
            <div>
              <span>Ветровое давление, w₀</span>
              <strong>{{ climatePreview.w0.toFixed(2).replace('.', ',') }} кПа</strong>
              <small>тип местности B</small>
            </div>
          </div>
          <p v-else-if="climateLoading" class="hint">Загрузка климата…</p>

          <h4 class="climate-sub">Роза ветров</h4>
          <p class="hint snip-source">СНиП 2.01.01-82, Приложение 4 — повторяемость направлений ветра за {{ climatePreview?.monthLabel ?? 'январь' }}</p>
          <div class="climate-rose-wrap">
            <WindRose
              v-if="climatePreview?.windRose?.length"
              :data="climatePreview.windRose"
              :north="northDeg"
              :size="150"
            />
            <p v-if="climatePreview?.prevailingLabel" class="prevailing">
              Преобладающий ветер — <strong>{{ climatePreview.prevailingLabel }}</strong>
            </p>
          </div>
          <div class="climate-info">
            Снеговые мешки формируются преимущественно с подветренной стороны препятствий и парапетов.
          </div>
        </template>

        <template v-else-if="steps[step].id === 'bags'">
          <h3>Снеговые мешки и датчики</h3>
          <div v-if="calculation?.metrics" class="metrics">
            <div><span>Мешки</span><strong>{{ calculation.metrics.bagsArea }} м²</strong></div>
            <div><span>Датчики</span><strong>{{ calculation.metrics.sensors }} шт.</strong></div>
            <div><span>Покрытие</span><strong>{{ calculation.metrics.coverage }}%</strong></div>
          </div>
          <div v-if="calculation?.metrics?.risk" class="risk-chips">
            <span v-if="calculation.metrics.risk.critical" class="chip critical">{{ calculation.metrics.risk.critical }} критич.</span>
            <span v-if="calculation.metrics.risk.high" class="chip high">{{ calculation.metrics.risk.high }} высоких</span>
            <span v-if="calculation.metrics.risk.medium" class="chip medium">{{ calculation.metrics.risk.medium }} средних</span>
          </div>
          <p class="hint">Перетащите датчики на схеме. Размер мешка меняйте за угловые маркеры на плане.</p>
          <div v-if="!archiveView" class="panel-actions bag-actions">
            <button type="button" class="btn block" @click="addSensor">+ Добавить датчик</button>
            <button type="button" class="btn block" :disabled="!selectedSensorId" @click="deleteSelectedSensor">Удалить датчик</button>
            <button type="button" class="btn block" @click="addSnowBag">+ Добавить снеговой мешок</button>
          </div>
          <div v-if="selectedBagId && !archiveView" class="bag-editor">
            <button type="button" class="btn danger block" @click="deleteSelectedBag">Удалить мешок «{{ selectedBagId }}»</button>
          </div>
          <button type="button" class="btn" :disabled="archiveView" @click="recalcWithSensors">Пересчитать с учётом датчиков</button>
          <ul class="list bag-list">
            <li
              v-for="bag in calculation?.snowbags"
              :key="bag.id"
              :class="{ active: selectedBagId === bag.id }"
              @click="selectBag(bag.id)"
            >
              <strong>{{ bag.id }}</strong> — {{ bag.name }}
              <span v-if="bag.scheme" class="bag-scheme">{{ bag.scheme }}</span>
              <span v-if="bag.riskClass" class="bag-risk" :class="bag.risk">{{ bag.riskClass }}</span>
              <div class="bag-meta">{{ bag.area }} м² · μ={{ bag.mu }} · S={{ bag.load }} кПа</div>
            </li>
          </ul>
        </template>

        <template v-else>
          <h3>Результат</h3>
          <div v-if="calculation?.metrics" class="metrics">
            <div><span>Площадь кровли</span><strong>{{ calculation.metrics.roofArea }} м²</strong></div>
            <div><span>Макс. нагрузка</span><strong>{{ calculation.metrics.maxLoad }} кПа</strong></div>
            <div><span>Датчики</span><strong>{{ calculation.metrics.sensors }} шт.</strong></div>
            <div v-if="calculation.metrics.avgDistM"><span>Ср. расстояние</span><strong>{{ calculation.metrics.avgDistM }} м</strong></div>
          </div>
          <table v-if="calculation?.spec?.length" class="spec">
            <thead><tr><th>№</th><th>Наименование</th><th>Кол.</th></tr></thead>
            <tbody>
              <tr v-for="row in calculation.spec" :key="row.pos">
                <td>{{ row.pos }}</td><td>{{ row.name }}</td><td>{{ row.qty }} {{ row.unit }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!archiveView" class="export-actions">
            <button class="btn" @click="downloadExport(projectId!, 'json')">JSON</button>
            <button class="btn" @click="downloadExport(projectId!, 'pdf')">PDF</button>
            <button class="btn" @click="downloadExport(projectId!, 'excel')">Excel</button>
          </div>
          <p v-else class="hint">Экспорт доступен для текущей версии расчёта на стартовой странице.</p>
        </template>
      </aside>
      </template>
    </div>

    <div v-if="addDialogOpen" class="dialog-backdrop" @click.self="addDialogOpen = false">
      <div class="dialog">
        <h4>Добавить элементы</h4>
        <template v-if="!pickedTool">
          <p class="hint">Выберите инструмент:</p>
          <div class="dialog-grid">
            <button
              v-for="t in DRAW_TOOLS"
              :key="t.id"
              type="button"
              class="dialog-item"
              @click="pickDrawTool(t)"
            >{{ t.name }}</button>
          </div>
        </template>
        <template v-else>
          <label>Название
            <input v-model="elementDraftName" type="text" placeholder="Элемент 1" />
          </label>
          <label>Высота, м
            <input v-model.number="elementDraftHeight" type="number" min="0" max="50" step="0.1" />
          </label>
          <p class="hint">{{ pickedTool.name }} — затем укажите на {{ showMapUnderlay ? 'карте' : 'плане' }}.</p>
          <div class="dialog-footer">
            <button type="button" class="btn secondary" @click="pickedTool = null">Назад</button>
            <button type="button" class="btn accent" @click="startDrawFromDialog">Добавить на план</button>
          </div>
        </template>
        <button type="button" class="dialog-close" aria-label="Закрыть" @click="addDialogOpen = false">×</button>
      </div>
    </div>

    <footer v-if="!calculating" class="footer">
      <button class="btn" :disabled="step === 0" @click="back">← Назад</button>
      <span class="step-info">Шаг {{ step + 1 }} из {{ steps.length }}</span>
      <button v-if="!archiveView" class="btn secondary" :disabled="saving" @click="saveDraft">{{ saving ? 'Сохранение…' : 'Сохранить черновик' }}</button>
      <button class="btn accent" @click="onFooterNext">{{ footerLabel }}</button>
    </footer>
  </div>
</template>

<style scoped>
.layout { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.stepper {
  height: 72px; display: flex; align-items: center; padding: 0 24px;
  background: #fff; border-bottom: 1px solid var(--border-secondary-enabled); gap: 8px;
}
.step { display: flex; align-items: center; gap: 10px; border: none; background: transparent; cursor: pointer; padding: 6px 8px; }
.step:disabled { cursor: default; opacity: 0.5; }
.num {
  width: 28px; height: 28px; border-radius: 999px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; background: var(--neutral-15); color: var(--neutral-50);
}
.step.active .num { background: var(--red-60); color: #fff; }
.step.done .num { background: var(--neutral-100); color: #fff; }
.step.active .label { font-weight: 700; color: var(--red-60); }
.work { flex: 1; display: flex; min-height: 0; }
.canvas-pane { flex: 1; min-width: 0; background: var(--neutral-10); display: flex; flex-direction: column; padding: 16px; position: relative; }
.canvas-tools { position: absolute; top: 24px; right: 24px; display: flex; gap: 6px; }
.tool { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-secondary-enabled); background: #fff; font-weight: 600; cursor: pointer; }
.tool.active { background: var(--red-60); color: #fff; border-color: var(--red-60); }
.heatmap-hint {
  position: absolute; top: 24px; left: 24px; max-width: 280px;
  background: rgba(255,255,255,.92); border: 1px solid var(--border-secondary-enabled);
  border-radius: var(--radius-md); padding: 8px 12px; font-size: 12px;
  color: var(--content-secondary-enabled);
}
.underlay-toggle {
  position: absolute; top: 24px; left: 24px; z-index: 2;
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.95); border: 1px solid var(--border-secondary-enabled);
  border-radius: var(--radius-md); padding: 8px 12px; box-shadow: var(--shadow-small);
}
.toggle-track {
  width: 38px; height: 22px; border-radius: 999px; border: none; cursor: pointer;
  padding: 2px; background: var(--neutral-25); transition: background .15s;
}
.toggle-track.on { background: var(--red-60); }
.toggle-thumb {
  display: block; width: 18px; height: 18px; border-radius: 999px; background: #fff;
  transform: translateX(0); transition: transform .15s;
}
.toggle-track.on .toggle-thumb { transform: translateX(16px); }
.toggle-label { font-size: 13px; font-weight: 600; color: var(--content-primary-a-enabled); }
.toggle-hint { font-size: 11.5px; color: var(--blue-65); }
.draw-banner {
  position: absolute; top: 24px; left: 50%; transform: translateX(-50%); z-index: 3;
  display: flex; align-items: center; gap: 12px; max-width: min(92%, 560px);
  background: var(--red-60); color: #fff; border-radius: var(--radius-md);
  padding: 10px 14px; box-shadow: var(--shadow-large); font-size: 13px; font-weight: 600;
}
.draw-cancel {
  border: none; background: rgba(255,255,255,.2); color: #fff; border-radius: 6px;
  padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0;
}
.ortho-btn {
  border: none; background: rgba(255,255,255,.15); color: #fff; border-radius: 6px;
  padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0;
}
.ortho-btn.active { background: #fff; color: var(--red-60); }
.canvas-stack { flex: 1; min-height: 0; position: relative; display: flex; flex-direction: column; }
.map-underlay { flex: 1; min-height: 0; margin: 0 !important; border-radius: var(--radius-lg); }
.map-underlay :deep(.map-wrap) { margin: 0; min-height: 100%; height: 100%; }
.roof-overlay { flex: 1; min-height: 0; }
.roof-overlay--map { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.roof-overlay--map:not(.roof-overlay--passthrough) { pointer-events: auto; }
.roof-block { border: 1px solid var(--border-secondary-enabled); border-radius: 8px; overflow: hidden; margin: 14px 0 8px; }
.roof-block.active { border-color: var(--red-60); }
.roof-head { width: 100%; border: none; border-radius: 0; }
.roof-sides { padding: 8px 12px 12px; background: var(--neutral-10); border-top: 1px solid var(--border-secondary-enabled); }
.side-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0; border-radius: 6px; transition: background 0.15s; }
.side-row.active { background: var(--red-10); padding-left: 6px; padding-right: 6px; }
.side-label { font-size: 12px; font-weight: 600; color: var(--content-secondary-enabled); }
.side-parapet { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--content-tertiary-enabled); }
.side-parapet input { width: 64px; height: 32px; margin: 0; text-align: center; }
.parapet-row {
  display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 12px;
  border: 1px solid var(--border-secondary-enabled); border-radius: 8px; background: var(--neutral-10);
}
.parapet-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.parapet-info strong { font-size: 13px; }
.hint-inline { font-size: 11px; color: var(--content-tertiary-enabled); }
.parapet-input { width: 72px; height: 36px; margin: 0; text-align: center; }
.parapet-unit { font-size: 12px; color: var(--content-tertiary-enabled); }
.panel-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.btn.block { width: 100%; justify-content: center; }
.edit-actions { margin-top: 12px; }
.btn.danger { background: var(--red-10); color: var(--red-60); border-color: var(--red-60); }
.dialog-backdrop {
  position: fixed; inset: 0; z-index: 100; background: rgba(20,24,38,.45);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.dialog {
  position: relative; width: min(460px, 100%); background: #fff; border-radius: var(--radius-lg);
  padding: 24px; box-shadow: var(--shadow-large); border: 1px solid var(--border-secondary-enabled);
}
.dialog h4 { margin: 0 0 12px; font-size: 16px; }
.dialog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
.dialog-item {
  padding: 12px 14px; border: 1px solid var(--border-secondary-enabled); border-radius: 8px;
  background: #fff; cursor: pointer; text-align: left; font: inherit; font-size: 13px;
}
.dialog-item:hover { background: var(--neutral-10); }
.dialog-footer { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
.dialog-close {
  position: absolute; top: 12px; right: 12px; border: none; background: transparent;
  font-size: 22px; line-height: 1; cursor: pointer; color: var(--content-tertiary-enabled);
}
.climate-norm { margin-top: 0; }
.climate-geo { margin: 4px 0 12px; color: var(--content-secondary-enabled); }
.climate-geo-warn { margin: 4px 0 12px; color: var(--status-warning, #b45309); }
.climate-metrics {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;
  padding: 14px; background: var(--neutral-10); border-radius: var(--radius-lg);
}
.climate-metrics div { display: flex; flex-direction: column; gap: 2px; }
.climate-metrics span { font-size: 11px; color: var(--content-tertiary-enabled); }
.climate-metrics strong { font-size: 17px; font-weight: 800; }
.climate-metrics small { font-size: 11px; color: var(--content-tertiary-enabled); }
.climate-sub { margin: 16px 0 8px; font-size: 14px; }
.climate-rose-wrap {
  padding: 12px; border: 1px solid var(--border-secondary-enabled);
  border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center;
}
.prevailing { margin: 8px 0 0; font-size: 12px; color: var(--content-tertiary-enabled); text-align: center; }
.prevailing strong { color: var(--red-60); }
.climate-info {
  margin-top: 14px; padding: 12px 14px; background: var(--blue-10);
  border-radius: var(--radius-md); font-size: 12.5px; color: var(--blue-65); line-height: 1.45;
}
.panel {
  width: 380px; flex: 0 0 380px; border-left: 1px solid var(--border-secondary-enabled);
  background: #fff; padding: 20px; overflow: auto;
}
.panel h3 { margin: 0 0 12px; font-size: 16px; }
.panel p { color: var(--content-secondary-enabled); line-height: 1.5; }
.upload-zone {
  display: block; margin-top: 16px; padding: 32px; border: 2px dashed var(--border-secondary-enabled);
  border-radius: var(--radius-lg); text-align: center; color: var(--content-tertiary-enabled); cursor: pointer;
}
.list { padding-left: 18px; line-height: 1.8; }
.bag-list { list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 10px; }
.bag-list li { border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); padding: 10px 12px; cursor: pointer; transition: border-color .15s, background .15s; }
.bag-list li.active { border-color: var(--red-60); background: var(--red-10); }
.obstacle-sides { margin-top: 8px; border-radius: var(--radius-md); }
.bag-meta { font-size: 12px; color: var(--content-tertiary-enabled); margin-top: 4px; }
.bag-scheme { font-size: 11px; font-weight: 700; color: var(--content-secondary-enabled); margin-left: 6px; padding: 2px 6px; background: var(--neutral-10); border-radius: 4px; }
.bag-risk { font-size: 11px; font-weight: 800; margin-left: 6px; }
.bag-risk.critical { color: var(--red-60); }
.bag-risk.high { color: var(--orange-60); }
.bag-risk.medium { color: var(--yellow-40); }
.risk-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.risk-chips .chip { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-md); }
.risk-chips .chip.critical { background: var(--red-10); color: var(--red-60); }
.risk-chips .chip.high { background: var(--orange-10); color: var(--orange-60); }
.risk-chips .chip.medium { background: var(--yellow-10); color: var(--yellow-40); }
.metrics { display: grid; gap: 10px; margin: 16px 0; }
.metrics div { display: flex; justify-content: space-between; padding: 10px 12px; background: var(--neutral-10); border-radius: 8px; }
.metrics span { color: var(--content-tertiary-enabled); }
.hint { font-size: 12px; color: var(--content-tertiary-enabled); margin-top: 12px; }
label { display: block; margin-top: 12px; font-size: 13px; font-weight: 600; }
input, select { width: 100%; margin-top: 6px; height: 40px; padding: 0 12px; border: 1px solid var(--border-secondary-enabled); border-radius: 8px; font: inherit; }
.range-val { display: inline-block; margin-left: 8px; font-weight: 700; }
.add-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.chip { padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border-secondary-enabled); background: var(--neutral-10); cursor: pointer; font-size: 12px; }
.list.compact { margin-bottom: 8px; }
.obstacle-list { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; max-height: 180px; overflow-y: auto; }
.bag-actions { margin-top: 10px; }
.bag-editor {
  margin: 12px 0; padding: 12px; border: 1px solid var(--border-secondary-enabled);
  border-radius: 8px; background: var(--neutral-10); display: flex; flex-direction: column; gap: 8px;
}
.bag-editor h4 { margin: 0; font-size: 13px; }
.bag-editor label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
.snip-source { margin: 0 0 8px; font-size: 11px; }
.obstacle-item {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-secondary-enabled);
  background: var(--neutral-10); cursor: pointer; text-align: left; font: inherit;
}
.obstacle-item.active { border-color: var(--red-60); background: var(--red-10); }
.obstacle-name { font-size: 13px; font-weight: 600; }
.obstacle-h { font-size: 12px; color: var(--content-tertiary-enabled); font-weight: 700; }
.height-editor { margin-top: 14px; padding: 14px; border-radius: 8px; background: var(--neutral-10); border: 1px solid var(--border-secondary-enabled); }
.height-range { width: 100%; margin-top: 10px; height: auto; padding: 0; border: none; }
.spec { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
.spec th, .spec td { border-bottom: 1px solid var(--neutral-15); padding: 6px 4px; text-align: left; }
.footer {
  height: 72px; display: flex; align-items: center; gap: 14px; padding: 0 28px;
  background: #fff; border-top: 1px solid var(--border-secondary-enabled);
}
.step-info { margin-left: auto; margin-right: 12px; color: var(--content-tertiary-enabled); font-weight: 600; }
.btn {
  height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--border-secondary-enabled);
  background: #fff; font-weight: 600; cursor: pointer;
}
.btn:disabled { opacity: 0.4; cursor: default; }
.btn.accent { background: var(--red-60); color: #fff; border-color: var(--red-60); }
.btn.secondary { background: var(--neutral-15); }
.export-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
.calc-overlay { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--neutral-10); }
.calc-card {
  width: 480px; background: #fff; border: 1px solid var(--border-secondary-enabled);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-large); padding: 28px;
}
.calc-card h2 { margin: 0 0 8px; font-size: 17px; }
.bar { height: 6px; background: var(--background-tertiary-enabled); border-radius: 999px; overflow: hidden; margin-top: 16px; }
.fill { height: 100%; background: var(--red-60); transition: width 0.2s; }
.error { color: var(--red-60); padding: 12px 24px; margin: 0; }
.archive-banner {
  padding: 10px 24px; background: var(--blue-10); color: var(--blue-65);
  font-size: 13px; font-weight: 600; border-bottom: 1px solid var(--border-secondary-enabled);
}
</style>
