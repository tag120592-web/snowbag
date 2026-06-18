<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import RoofCanvas from '@/components/RoofCanvas.vue'
import StepUpload from '@/components/StepUpload.vue'
import type { UploadedFileItem } from '@/components/StepUpload.vue'
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
import {
  DEMO_GEOMETRY,
  ELEMENT_TYPES,
  EMPTY_GEOMETRY,
  STEPS,
  type CalculationData,
  type CalculationRunSnapshot,
  type GeometryData,
  type MapSelectPayload,
  type Obstacle,
  type Project,
  type Sensor,
} from '@/types'
import type { DrawSession, EditTarget } from '@/composables/useRoofDrawing'
import { formatParapetMm, parseParapetMm } from '@/composables/useRoofDrawing'

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
const mapSelected = ref(false)
const step = ref(0)
const maxReached = ref(0)
const calculating = ref(false)
const calcProgress = ref(0)
const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const view3d = ref(false)
const underlayUrl = ref('')
const hasUnderlay = ref(false)
const showUnderlay = ref(false)
const previewUnavailable = ref('')
const editTarget = ref<EditTarget | null>(null)
const drawSession = ref<DrawSession | null>(null)
const addDialogOpen = ref(false)
const pickedKind = ref<'element' | 'roof' | 'walkway' | null>(null)
const pickedElement = ref<(typeof ELEMENT_TYPES)[number] | null>(null)
const parapetMm = ref(600)
const climatePreview = ref<ClimateLookupResult | null>(null)
const climateLoading = ref(false)

const snowRegion = ref('III')
const windRegion = ref('II')
const northDeg = ref(-18)
const archiveView = ref(false)
const archiveLabel = ref('')

const projectId = computed(() => route.params.id as string | undefined)
const runId = computed(() => route.query.runId as string | undefined)

const underlaySrc = computed(() => {
  if (!projectId.value || !hasUnderlay.value) return ''
  return projectUnderlayUrl(projectId.value)
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
      maxReached.value = STEPS.length - 1
      step.value = STEPS.length - 1
      return
    }

    if (project.value.calculation && Object.keys(project.value.calculation).length) {
      calculation.value = project.value.calculation
      maxReached.value = STEPS.length - 1
      step.value = STEPS.length - 1
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
    }
  } else {
    geometry.value = { ...EMPTY_GEOMETRY, obstacles: [] }
  }
  uploadedFiles.value = project.value.underlayUrl
    ? [{ name: 'План кровли', size: '—', desc: 'план кровли', selected: true }]
    : []
  uploadScale.value = project.value.underlayUrl ? '1:200' : null
  mapAddress.value = project.value.address || ''
  mapLat.value = project.value.lat ?? null
  mapLon.value = project.value.lon ?? null
  mapSelected.value =
    (!!project.value.address && project.value.address !== 'Укажите адрес объекта')
    || (mapLat.value != null && mapLon.value != null)
  snowRegion.value = project.value.snowRegion || 'III'
  windRegion.value = project.value.windRegion || 'II'
  northDeg.value = project.value.northDeg ?? -18
  parapetMm.value = parseParapetMm(project.value.parapet)
  hasUnderlay.value = !!project.value.underlayUrl
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
  await refreshClimate()
})

watch([snowRegion, windRegion], () => {
  if (STEPS[step.value]?.id === 'climate') void refreshClimate()
})

watch(step, (i) => {
  if (STEPS[i]?.id === 'climate') void refreshClimate()
})

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
  return String(Math.round(sg * 102)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
})

const climateWindRose = computed(() => {
  if (STEPS[step.value]?.id === 'climate' && climatePreview.value?.windRose?.length) {
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
    project.value = await updateProject(projectId.value, {
      geometry: geometry.value,
      northDeg: northDeg.value,
      snowRegion: snowRegion.value,
      windRegion: windRegion.value,
      areaM2: geometry.value.areaM2 ?? project.value?.areaM2,
      address: mapAddress.value || project.value?.address,
      lat: mapLat.value ?? undefined,
      lon: mapLon.value ?? undefined,
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
  const id = STEPS[step.value].id
  if (id === 'roof') {
    await saveDraft()
  }
  if (id === 'climate') {
    await runCalculate()
    return
  }
  if (step.value < STEPS.length - 1) goStep(step.value + 1)
}

function back() {
  if (step.value > 0) goStep(step.value - 1)
}

async function runCalculate() {
  if (!projectId.value) return
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
      geometry: geometry.value,
      sensors: sensors?.length ? sensors : undefined,
    })
    calculation.value = res.calculation
    project.value = res.project
    goStep(3)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка расчёта'
  } finally {
    clearInterval(timer)
    calculating.value = false
  }
}

async function onFileSelect(file: File) {
  if (!projectId.value || archiveView.value) return
  uploading.value = true
  error.value = ''
  previewUnavailable.value = ''
  const isDwg = /\.(dwg|dxf)$/i.test(file.name)
  try {
    await uploadProjectFile(projectId.value, file)
    if (isDwg) {
      hasUnderlay.value = false
      underlayUrl.value = ''
      previewUnavailable.value = 'Превью для DWG/DXF недоступно. Файл сохранён — конвертация будет в следующей версии.'
    } else {
      hasUnderlay.value = true
      underlayUrl.value = projectUnderlayUrl(projectId.value)
    }
    uploadedFiles.value = [{
      name: file.name,
      size: formatFileSize(file.size),
      desc: isDwg ? 'узел / чертёж' : 'план кровли',
      selected: true,
    }]
    if (/\.pdf$/i.test(file.name)) uploadScale.value = '1:200'
    else if (!isDwg && file.type.startsWith('image/')) uploadScale.value = uploadScale.value ?? '1:200'
    await loadProject()
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
  mapSelected.value = true
  if (!projectId.value) return
  try {
    project.value = await updateProject(projectId.value, {
      address: payload.address,
      lat: payload.lat,
      lon: payload.lon,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось сохранить адрес'
  }
}

const isFreshProject = computed(() => {
  if (route.query.new === '1') return true
  return !hasUnderlay.value && !(project.value?.geometry?.roof?.length) && uploadedFiles.value.length === 0
})

function openAddDialog() {
  pickedKind.value = null
  pickedElement.value = null
  addDialogOpen.value = true
}

function pickElement(t: (typeof ELEMENT_TYPES)[number]) {
  pickedKind.value = 'element'
  pickedElement.value = t
}

function pickRoofDraw() {
  pickedKind.value = 'roof'
  pickedElement.value = null
}

function pickWalkwayDraw() {
  pickedKind.value = 'walkway'
  pickedElement.value = null
}

function startDrawFromDialog() {
  if (pickedKind.value === 'roof') {
    drawSession.value = { tool: 'polyline', target: 'roof', label: 'контур кровли' }
    editTarget.value = null
  } else if (pickedKind.value === 'walkway') {
    drawSession.value = { tool: 'polyline', target: 'walkway', label: 'пешеходную дорожку' }
    editTarget.value = null
  } else if (pickedElement.value) {
    const t = pickedElement.value
    drawSession.value = {
      tool: t.hasHeight ? 'rect' : 'circle',
      target: 'obstacle',
      label: t.short,
      short: t.short,
      typeName: t.name,
      hM: t.hasHeight ? t.hM : undefined,
    }
    editTarget.value = null
  }
  addDialogOpen.value = false
  pickedKind.value = null
  pickedElement.value = null
}

function startDrawRoof() {
  if (archiveView.value) return
  drawSession.value = { tool: 'polyline', target: 'roof', label: 'контур кровли' }
  editTarget.value = null
}

function cancelDraw() {
  drawSession.value = null
}

function onDrawFinish() {
  drawSession.value = null
}

function onRoofChange(points: number[][]) {
  geometry.value = { ...geometry.value, roof: points.map((p) => [...p]) }
  editTarget.value = 'roof'
}

function onWalkwayChange(points: number[][]) {
  geometry.value = { ...geometry.value, walkway: points.map((p) => [...p]) }
  editTarget.value = 'walkway'
}

function onObstacleAdd(o: Obstacle) {
  const id = `${o.short?.toLowerCase().replace(/\s+/g, '-') ?? 'el'}-${Date.now()}`
  const obstacle = { ...o, id }
  geometry.value = {
    ...geometry.value,
    obstacles: [...(geometry.value.obstacles ?? []), obstacle],
  }
  editTarget.value = { obstacleId: id }
  drawSession.value = null
}

function onObstacleChange(o: Obstacle) {
  geometry.value = {
    ...geometry.value,
    obstacles: (geometry.value.obstacles ?? []).map((x) => (x.id === o.id ? { ...o } : x)),
  }
}

function onObstacleSelect(id: string) {
  editTarget.value = { obstacleId: id }
  drawSession.value = null
}

function selectEditRoof() {
  editTarget.value = 'roof'
  drawSession.value = null
}

function selectEditWalkway() {
  editTarget.value = 'walkway'
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
  if (s.tool === 'polyline') return `Обведите ${s.label} на плане (Enter — завершить, Esc — отмена)`
  if (s.tool === 'rect') return `Потяните прямоугольник для «${s.label}»`
  return `Укажите центр и радиус для «${s.label}»`
})

function deleteSelected() {
  const t = editTarget.value
  if (!t) return
  if (t === 'roof') {
    if (!confirm('Сбросить контур кровли?')) return
    geometry.value = { ...geometry.value, roof: [] }
  } else if (t === 'walkway') {
    geometry.value = { ...geometry.value, walkway: [] }
  } else if ('obstacleId' in t) {
    geometry.value = {
      ...geometry.value,
      obstacles: (geometry.value.obstacles ?? []).filter((o) => o.id !== t.obstacleId),
    }
  }
  editTarget.value = null
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
    geometry: geometry.value,
    sensors,
  })
  calculation.value = res.calculation
  project.value = res.project
}

const footerLabel = computed(() => {
  if (archiveView.value) return 'На главную'
  const id = STEPS[step.value].id
  if (id === 'climate') return 'Рассчитать мешки'
  if (id === 'bags') return 'Сформировать схему'
  if (id === 'result') return 'Экспорт JSON'
  if (id === 'roof') return 'Подтвердить и далее'
  return 'Далее'
})

function onFooterNext() {
  if (archiveView.value) {
    void router.push('/')
    return
  }
  const id = STEPS[step.value].id
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
  const id = STEPS[step.value].id
  if (id === 'upload') {
    return { roof: false, underlay: false, obstacles: false, bags: false, sensors: false, wind: false }
  }
  const hasGeometry = !!(geometry.value.roof?.length)
  return {
    roof: hasGeometry,
    underlay: hasUnderlay.value && showUnderlay.value,
    obstacles: id !== 'upload',
    walkway: id === 'roof' || id === 'bags' || id === 'result',
    parapet: id === 'roof' || id === 'bags' || id === 'result',
    bags: id === 'bags' || id === 'result',
    sensors: id === 'bags' || id === 'result',
    wind: id === 'climate' || id === 'bags' || id === 'result',
  }
})

const showParapet = computed(() => parapetMm.value > 0)

const hasWalkway = computed(() => !!(geometry.value.walkway?.length))
</script>

<template>
  <div class="layout">
    <AppHeader :project="project" @home="router.push('/')" />

    <nav class="stepper">
      <button
        v-for="(s, i) in STEPS"
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
        v-if="STEPS[step].id === 'upload'"
        :is-fresh="isFreshProject"
        :files="uploadedFiles"
        :scale="uploadScale"
        :map-address="mapAddress"
        :map-lat="mapLat"
        :map-lon="mapLon"
        :map-city="project?.city ?? ''"
        :map-selected="mapSelected"
        :underlay-src="underlaySrc"
        :preview-unavailable="previewUnavailable"
        :uploading="uploading"
        @file-select="onFileSelect"
        @map-select="onMapSelect"
      />

      <template v-else>
      <div class="canvas-pane">
        <div
          v-if="STEPS[step].id === 'roof' && hasUnderlay"
          class="underlay-toggle"
        >
          <button type="button" class="toggle-track" :class="{ on: showUnderlay }" @click="showUnderlay = !showUnderlay">
            <span class="toggle-thumb" />
          </button>
          <span class="toggle-label">Подложка (оригинал)</span>
          <span v-if="showUnderlay" class="toggle-hint">· сравнение с чертежом</span>
        </div>
        <div
          v-if="STEPS[step].id === 'roof' && drawSession"
          class="draw-banner"
        >
          <span>{{ drawBannerLabel }}</span>
          <button type="button" class="draw-cancel" @click="cancelDraw">Отмена</button>
        </div>
        <RoofCanvas
          :geometry="geometry"
          :calculation="calculation"
          :north-deg="northDeg"
          :underlay-url="underlaySrc"
          :view3d="view3d && ['bags', 'result'].includes(STEPS[step].id)"
          :editable="STEPS[step].id === 'roof' && !archiveView"
          :editable-sensors="STEPS[step].id === 'bags' && !archiveView"
          :draw-session="STEPS[step].id === 'roof' ? drawSession : null"
          :edit-target="STEPS[step].id === 'roof' ? editTarget : null"
          :show-parapet="showParapet"
          :layers="canvasLayers"
          :preview-wind-rose="climateWindRose"
          @sensor-move="onSensorMove"
          @obstacle-select="onObstacleSelect"
          @roof-change="onRoofChange"
          @walkway-change="onWalkwayChange"
          @obstacle-add="onObstacleAdd"
          @obstacle-change="onObstacleChange"
          @draw-finish="onDrawFinish"
          @draw-cancel="cancelDraw"
          @edit-clear="clearEditSelection"
        />
        <div v-if="['bags', 'result'].includes(STEPS[step].id)" class="canvas-tools">
          <button type="button" class="tool" :class="{ active: !view3d }" @click="view3d = false">2D</button>
          <button type="button" class="tool" :class="{ active: view3d }" @click="view3d = true">3D</button>
        </div>
        <div v-if="view3d && ['bags', 'result'].includes(STEPS[step].id)" class="heatmap-hint">
          Высота снежного покрова — тепловая карта по зонам мешков
        </div>
      </div>

      <aside class="panel">
        <template v-if="STEPS[step].id === 'roof'">
          <h3>Геометрия кровли</h3>
          <p>Проверьте контур и препятствия. Нарисуйте элементы на плане или перетащите вершины и маркеры.</p>
          <ul class="list compact">
            <li>Площадь: {{ roofAreaLabel }} м²</li>
          </ul>

          <div v-if="!archiveView" class="parapet-row">
            <div class="parapet-info">
              <strong>Парапет по периметру</strong>
              <span class="hint-inline">Высота влияет на расчёт</span>
            </div>
            <input
              v-model.number="parapetMm"
              type="number"
              min="0"
              max="3000"
              step="50"
              class="parapet-input"
            />
            <span class="parapet-unit">мм</span>
          </div>

          <div v-if="!archiveView" class="panel-actions">
            <button type="button" class="btn block" @click="openAddDialog">+ Добавить элемент</button>
            <button
              v-if="!geometry.roof?.length"
              type="button"
              class="btn secondary block"
              @click="startDrawRoof"
            >Обвести контур кровли</button>
          </div>

          <div class="obstacle-list">
            <button
              type="button"
              class="obstacle-item"
              :class="{ active: editTarget === 'roof' }"
              @click="selectEditRoof"
            >
              <span class="obstacle-name">Контур кровли</span>
              <span class="obstacle-h">{{ geometry.roof?.length ?? 0 }} точек</span>
            </button>
            <button
              v-if="hasWalkway || !archiveView"
              type="button"
              class="obstacle-item"
              :class="{ active: editTarget === 'walkway' }"
              @click="selectEditWalkway"
            >
              <span class="obstacle-name">Пешеходная дорожка</span>
              <span class="obstacle-h">{{ geometry.walkway?.length ?? 0 }} точек</span>
            </button>
            <button
              v-for="o in geometry.obstacles"
              :key="o.id"
              type="button"
              class="obstacle-item"
              :class="{ active: editTarget && typeof editTarget === 'object' && editTarget.obstacleId === o.id }"
              @click="onObstacleSelect(o.id)"
            >
              <span class="obstacle-name">{{ o.short || o.type }}</span>
              <span v-if="o.shape === 'rect'" class="obstacle-h">{{ (o.hM ?? 0).toFixed(1) }} м</span>
            </button>
          </div>

          <div v-if="editTarget && !archiveView" class="edit-actions">
            <button type="button" class="btn danger" @click="deleteSelected">Удалить</button>
          </div>

          <div v-if="selectedObstacle?.shape === 'rect' && !archiveView" class="height-editor">
            <label>Высота «{{ selectedObstacle.short }}», м
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
            <p class="hint">Кровля — отметка 0. Элемент строится вверх от кровли. Угловые маркеры — на плане.</p>
          </div>
        </template>

        <template v-else-if="STEPS[step].id === 'climate'">
          <h3>Ориентация и климат</h3>
          <p class="hint climate-norm">
            {{ climatePreview?.norm ?? 'СНиП 2.01.01-82' }}
            · роза ветров за {{ climatePreview?.monthLabel ?? 'январь' }}
          </p>
          <label>Город
            <input :value="project?.city ?? ''" readonly />
          </label>
          <label>Снеговой район (СП 20)
            <select v-model="snowRegion" :disabled="archiveView" @change="refreshClimate">
              <option v-for="r in ['I','II','III','IV','V','VI','VII','VIII']" :key="r" :value="r">{{ r }}</option>
            </select>
          </label>
          <label>Ветровой район
            <select v-model="windRegion" :disabled="archiveView" @change="refreshClimate">
              <option v-for="r in ['I','II','III','IV','V','VI','VII']" :key="r" :value="r">{{ r }}</option>
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

        <template v-else-if="STEPS[step].id === 'bags'">
          <h3>Снеговые мешки и датчики</h3>
          <div v-if="calculation?.metrics" class="metrics">
            <div><span>Мешки</span><strong>{{ calculation.metrics.bagsArea }} м²</strong></div>
            <div><span>Датчики</span><strong>{{ calculation.metrics.sensors }} шт.</strong></div>
            <div><span>Покрытие</span><strong>{{ calculation.metrics.coverage }}%</strong></div>
          </div>
          <p class="hint">Перетащите датчики на схеме, затем пересчитайте при необходимости.</p>
          <button type="button" class="btn" :disabled="archiveView" @click="recalcWithSensors">Пересчитать с учётом датчиков</button>
          <ul class="list">
            <li v-for="bag in calculation?.snowbags" :key="bag.id">{{ bag.id }} — {{ bag.name }} ({{ bag.area }} м²)</li>
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
        <h4>Добавить элемент кровли</h4>
        <template v-if="!pickedKind">
          <p class="hint">Выберите тип:</p>
          <div class="dialog-grid">
            <button type="button" class="dialog-item" @click="pickRoofDraw">Контур кровли</button>
            <button type="button" class="dialog-item" @click="pickWalkwayDraw">Пешеходная дорожка</button>
            <button
              v-for="t in ELEMENT_TYPES"
              :key="t.id"
              type="button"
              class="dialog-item"
              @click="pickElement(t)"
            >{{ t.name }}</button>
          </div>
        </template>
        <template v-else>
          <p class="hint">
            {{ pickedKind === 'element' ? pickedElement?.name : pickedKind === 'roof' ? 'Контур кровли' : 'Пешеходная дорожка' }}
            — затем укажите на плане.
          </p>
          <div class="dialog-footer">
            <button type="button" class="btn secondary" @click="pickedKind = null; pickedElement = null">Назад</button>
            <button type="button" class="btn accent" @click="startDrawFromDialog">Добавить на план</button>
          </div>
        </template>
        <button type="button" class="dialog-close" aria-label="Закрыть" @click="addDialogOpen = false">×</button>
      </div>
    </div>

    <footer v-if="!calculating" class="footer">
      <button class="btn" :disabled="step === 0" @click="back">← Назад</button>
      <span class="step-info">Шаг {{ step + 1 }} из {{ STEPS.length }}</span>
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
.obstacle-list { display: flex; flex-direction: column; gap: 4px; margin-top: 14px; max-height: 220px; overflow-y: auto; }
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
