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
  getProject,
  lookupClimate,
  updateProject,
  uploadProjectFile,
} from '@/api/client'
import { DEMO_GEOMETRY, ELEMENT_TYPES, EMPTY_GEOMETRY, STEPS, type CalculationData, type GeometryData, type Project, type Sensor } from '@/types'

const route = useRoute()
const router = useRouter()
const project = ref<Project | null>(null)
const calculation = ref<CalculationData | null>(null)
const geometry = ref<GeometryData>({ ...EMPTY_GEOMETRY, obstacles: [] })
const uploadedFiles = ref<UploadedFileItem[]>([])
const uploadScale = ref<string | null>(null)
const mapAddress = ref('')
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
const selectedObstacleId = ref<string | null>(null)

const snowRegion = ref('III')
const windRegion = ref('II')
const northDeg = ref(-18)

const projectId = computed(() => route.params.id as string | undefined)

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
    project.value = await getProject(projectId.value)
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
    mapSelected.value = !!project.value.address && project.value.address !== 'Укажите адрес объекта'
    snowRegion.value = project.value.snowRegion || 'III'
    windRegion.value = project.value.windRegion || 'II'
    northDeg.value = project.value.northDeg ?? -18
    if (project.value.underlayUrl) underlayUrl.value = project.value.underlayUrl
    if (project.value.calculation && Object.keys(project.value.calculation).length) {
      calculation.value = project.value.calculation
      maxReached.value = STEPS.length - 1
      step.value = STEPS.length - 1
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Проект не найден'
  }
}

watch(() => project.value?.city, async (city) => {
  if (!city) return
  try {
    const c = await lookupClimate(city)
    if (!project.value?.snowRegion) snowRegion.value = c.snowRegion
    if (!project.value?.windRegion) windRegion.value = c.windRegion
  } catch { /* ignore */ }
})

function goStep(i: number) {
  step.value = i
  maxReached.value = Math.max(maxReached.value, i)
}

async function saveDraft() {
  if (!projectId.value) return
  saving.value = true
  try {
    project.value = await updateProject(projectId.value, {
      geometry: geometry.value,
      northDeg: northDeg.value,
      snowRegion: snowRegion.value,
      windRegion: windRegion.value,
      areaM2: geometry.value.areaM2 ?? project.value?.areaM2,
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
  if (!projectId.value) return
  uploading.value = true
  error.value = ''
  try {
    const uploaded = await uploadProjectFile(projectId.value, file)
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      underlayUrl.value = uploaded.url
    }
    uploadedFiles.value = [{
      name: file.name,
      size: formatFileSize(file.size),
      desc: /\.(dwg|dxf)$/i.test(file.name) ? 'узел / чертёж' : 'план кровли',
      selected: true,
    }]
    if (/\.pdf$/i.test(file.name)) uploadScale.value = '1:200'
    await loadProject()
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

function onMapSelect(address: string) {
  mapAddress.value = address
  mapSelected.value = true
  if (project.value) project.value = { ...project.value, address }
}

const isFreshProject = computed(() => {
  if (route.query.new === '1') return true
  return !underlayUrl.value && !(project.value?.geometry?.roof?.length) && uploadedFiles.value.length === 0
})

function addObstacle(type: (typeof ELEMENT_TYPES)[number]) {
  const id = `${type.id}-${Date.now()}`
  const isCircle = !type.hasHeight
  geometry.value = {
    ...geometry.value,
    obstacles: [
      ...(geometry.value.obstacles ?? []),
      {
        id,
        type: type.name,
        short: type.short,
        shape: isCircle ? 'circle' : 'rect',
        x: 400,
        y: 280,
        w: 100,
        h: 70,
        cx: 420,
        cy: 300,
        r: 9,
        hM: type.hasHeight ? type.hM : undefined,
      },
    ],
  }
  selectedObstacleId.value = id
}

const selectedObstacle = computed(() =>
  geometry.value.obstacles?.find((o) => o.id === selectedObstacleId.value) ?? null,
)

function updateObstacleHeight(id: string, hM: number) {
  const v = Math.max(0, hM)
  geometry.value = {
    ...geometry.value,
    obstacles: (geometry.value.obstacles ?? []).map((o) =>
      o.id === id ? { ...o, hM: v } : o,
    ),
  }
}

function onObstacleSelect(id: string) {
  selectedObstacleId.value = selectedObstacleId.value === id ? null : id
}

function onSensorMove(id: string, x: number, y: number) {
  if (!calculation.value?.sensors) return
  calculation.value = {
    ...calculation.value,
    sensors: calculation.value.sensors.map((s) => (s.id === id ? { ...s, x, y } : s)),
  }
}

async function recalcWithSensors() {
  if (!projectId.value || !calculation.value?.sensors) return
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
  const id = STEPS[step.value].id
  if (id === 'climate') return 'Рассчитать мешки'
  if (id === 'bags') return 'Сформировать схему'
  if (id === 'result') return 'Экспорт JSON'
  if (id === 'roof') return 'Подтвердить и далее'
  return 'Далее'
})

function onFooterNext() {
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
    underlay: !!underlayUrl.value,
    obstacles: id !== 'upload',
    bags: id === 'bags' || id === 'result',
    sensors: id === 'bags' || id === 'result',
    wind: id === 'climate' || id === 'bags' || id === 'result',
  }
})
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
        :map-selected="mapSelected"
        :underlay-url="underlayUrl"
        :uploading="uploading"
        @file-select="onFileSelect"
        @map-select="onMapSelect"
      />

      <template v-else>
      <div class="canvas-pane">
        <RoofCanvas
          :geometry="geometry"
          :calculation="calculation"
          :north-deg="northDeg"
          :underlay-url="underlayUrl"
          :view3d="view3d && ['bags', 'result'].includes(STEPS[step].id)"
          :editable-sensors="STEPS[step].id === 'bags'"
          :editable-obstacles="STEPS[step].id === 'roof'"
          :selected-obstacle-id="selectedObstacleId"
          :layers="canvasLayers"
          @sensor-move="onSensorMove"
          @obstacle-select="onObstacleSelect"
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
          <p>Проверьте контур и препятствия. Укажите высоту каждого элемента — она влияет на расчёт и 3D-схему.</p>
          <ul class="list compact">
            <li>Контур кровли · {{ geometry.roof?.length ?? 0 }} точек</li>
            <li>Площадь: {{ roofAreaLabel }} м²</li>
          </ul>
          <div class="add-row">
            <button v-for="t in ELEMENT_TYPES" :key="t.id" type="button" class="chip" @click="addObstacle(t)">+ {{ t.short }}</button>
          </div>
          <div v-if="geometry.obstacles?.length" class="obstacle-list">
            <button
              v-for="o in geometry.obstacles"
              :key="o.id"
              type="button"
              class="obstacle-item"
              :class="{ active: selectedObstacleId === o.id }"
              @click="selectedObstacleId = o.id"
            >
              <span class="obstacle-name">{{ o.short || o.type }}</span>
              <span v-if="o.shape === 'rect'" class="obstacle-h">{{ (o.hM ?? 0).toFixed(1) }} м</span>
            </button>
          </div>
          <div v-if="selectedObstacle?.shape === 'rect'" class="height-editor">
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
            <p class="hint">Кровля — отметка 0. Элемент строится вверх от кровли.</p>
          </div>
        </template>

        <template v-else-if="STEPS[step].id === 'climate'">
          <h3>Ориентация и климат</h3>
          <label>Снеговой район
            <select v-model="snowRegion">
              <option v-for="r in ['I','II','III','IV','V','VI','VII','VIII']" :key="r" :value="r">{{ r }}</option>
            </select>
          </label>
          <label>Ветровой район
            <select v-model="windRegion">
              <option v-for="r in ['I','II','III','IV','V','VI','VII']" :key="r" :value="r">{{ r }}</option>
            </select>
          </label>
          <label>Ориентация севера, °
            <input v-model.number="northDeg" type="range" min="-90" max="90" step="1" />
            <span class="range-val">{{ northDeg }}°</span>
          </label>
          <label>Город<input :value="project?.city ?? ''" readonly /></label>
          <p class="hint">Расчёт по СП 20.13330.2016 (изм. № 6)</p>
        </template>

        <template v-else-if="STEPS[step].id === 'bags'">
          <h3>Снеговые мешки и датчики</h3>
          <div v-if="calculation?.metrics" class="metrics">
            <div><span>Мешки</span><strong>{{ calculation.metrics.bagsArea }} м²</strong></div>
            <div><span>Датчики</span><strong>{{ calculation.metrics.sensors }} шт.</strong></div>
            <div><span>Покрытие</span><strong>{{ calculation.metrics.coverage }}%</strong></div>
          </div>
          <p class="hint">Перетащите датчики на схеме, затем пересчитайте при необходимости.</p>
          <button type="button" class="btn" @click="recalcWithSensors">Пересчитать с учётом датчиков</button>
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
          <div class="export-actions">
            <button class="btn" @click="downloadExport(projectId!, 'json')">JSON</button>
            <button class="btn" @click="downloadExport(projectId!, 'pdf')">PDF</button>
            <button class="btn" @click="downloadExport(projectId!, 'excel')">Excel</button>
          </div>
        </template>
      </aside>
      </template>
    </div>

    <footer v-if="!calculating" class="footer">
      <button class="btn" :disabled="step === 0" @click="back">← Назад</button>
      <span class="step-info">Шаг {{ step + 1 }} из {{ STEPS.length }}</span>
      <button class="btn secondary" :disabled="saving" @click="saveDraft">{{ saving ? 'Сохранение…' : 'Сохранить черновик' }}</button>
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
</style>
