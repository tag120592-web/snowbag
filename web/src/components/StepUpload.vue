<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import { computed, nextTick, ref, watch } from 'vue'
import YandexMapPane from '@/components/YandexMapPane.vue'
import type { MapSelectPayload } from '@/types'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export interface UploadedFileItem {
  name: string
  size: string
  desc: string
  selected?: boolean
}

const props = defineProps<{
  isFresh: boolean
  files: UploadedFileItem[]
  scale: string | null
  mapAddress: string
  mapLat?: number | null
  mapLon?: number | null
  mapCity?: string
  mapSelected: boolean
  underlaySrc: string
  previewUnavailable: string
  uploading: boolean
}>()

const emit = defineEmits<{
  fileSelect: [file: File]
  mapSelect: [payload: MapSelectPayload]
}>()

const tab = ref<'file' | 'map'>('file')
const zoom = ref(100)
const rot = ref(0)
const address = ref(props.mapAddress)
const fileRef = ref<HTMLInputElement | null>(null)
const mapPaneRef = ref<InstanceType<typeof YandexMapPane> | null>(null)
const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const previewError = ref('')
const dragOver = ref(false)

watch(() => props.mapAddress, (v) => { address.value = v })

const previewFileName = computed(() => {
  const f = props.files.find((item) => item.selected) ?? props.files[0]
  return f?.name ?? ''
})

const isPdfPreview = computed(() => /\.pdf$/i.test(previewFileName.value))
const isDwgPreview = computed(() => /\.(dwg|dxf)$/i.test(previewFileName.value))

const hasFile = () => props.files.length > 0 || !!props.underlaySrc || !!props.previewUnavailable
const showFilePreview = () => !props.isFresh || hasFile()

async function renderPdfPreview(url: string) {
  await nextTick()
  const canvas = pdfCanvas.value
  if (!canvas) return
  previewError.value = ''
  try {
    const pdf = await pdfjsLib.getDocument({ url, withCredentials: false }).promise
    const page = await pdf.getPage(1)
    const baseViewport = page.getViewport({ scale: 1 })
    const maxW = 560
    const maxH = 380
    const scale = Math.min(maxW / baseViewport.width, maxH / baseViewport.height, 2)
    const viewport = page.getViewport({ scale })
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unavailable')
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
  } catch {
    previewError.value = 'Не удалось отобразить PDF. Проверьте, что API и хранилище файлов доступны.'
  }
}

watch(
  () => [props.underlaySrc, isPdfPreview.value] as const,
  ([src, isPdf]) => {
    previewError.value = ''
    if (src && isPdf) void renderPdfPreview(src)
  },
  { immediate: true },
)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  emit('fileSelect', file)
  ;(e.target as HTMLInputElement).value = ''
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) emit('fileSelect', file)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onMapSearch() {
  const q = address.value.trim()
  if (q) mapPaneRef.value?.geocode(q)
}

function onMapSelect(payload: MapSelectPayload) {
  address.value = payload.address
  emit('mapSelect', payload)
}

function onImageError() {
  previewError.value = 'Не удалось загрузить изображение. Проверьте доступность хранилища файлов.'
}
</script>

<template>
  <div class="upload-layout">
    <div class="upload-main">
      <div class="tabs">
        <button type="button" class="tab" :class="{ active: tab === 'file' }" @click="tab = 'file'">
          Файл чертежа
        </button>
        <button type="button" class="tab" :class="{ active: tab === 'map' }" @click="tab = 'map'">
          Адрес на карте
        </button>
      </div>

      <template v-if="tab === 'file'">
        <div v-if="showFilePreview()" class="toolbar">
          <button type="button" class="tool-btn" @click="zoom = Math.max(40, zoom - 20)">−</button>
          <span class="zoom">{{ zoom }}%</span>
          <button type="button" class="tool-btn" @click="zoom = Math.min(200, zoom + 20)">+</button>
          <span class="sep" />
          <button type="button" class="tool-btn" @click="rot = (rot + 90) % 360">↻</button>
          <div class="spacer" />
          <button type="button" class="scale-btn">
            Привязать масштаб<span v-if="scale"> · {{ scale }}</span>
          </button>
        </div>
        <div class="viewport">
          <div
            v-if="showFilePreview()"
            class="preview"
            :style="{ transform: `scale(${zoom / 100}) rotate(${rot}deg)` }"
          >
            <template v-if="previewUnavailable || isDwgPreview">
              <div class="preview-unavailable">
                <div class="preview-unavailable-icon">📐</div>
                <p>{{ previewUnavailable || 'Превью для DWG/DXF недоступно. Файл сохранён — конвертация будет в следующей версии.' }}</p>
              </div>
            </template>
            <template v-else-if="isPdfPreview && underlaySrc">
              <canvas ref="pdfCanvas" class="pdf-canvas" />
            </template>
            <img
              v-else-if="underlaySrc"
              :src="underlaySrc"
              alt="План кровли"
              class="underlay"
              @error="onImageError"
            />
            <div v-else class="preview-placeholder">Предпросмотр чертежа</div>
            <p v-if="previewError" class="preview-error">{{ previewError }}</p>
            <div v-if="files[0]" class="caption">
              {{ files.find((f) => f.selected)?.name || files[0].name }} · лист 1 · план кровли
            </div>
          </div>
          <div v-else class="empty">
            <div class="empty-icon">📄</div>
            <div class="empty-title">Чертёж не загружен</div>
            <p class="empty-text">Загрузите файл в панели справа — план кровли появится здесь</p>
          </div>
        </div>
      </template>

      <template v-else>
        <YandexMapPane
          ref="mapPaneRef"
          :address="mapAddress"
          :lat="mapLat"
          :lon="mapLon"
          :city="mapCity"
          @select="onMapSelect"
        />
      </template>
    </div>

    <aside class="upload-panel">
      <template v-if="tab === 'file'">
        <h3 class="panel-title">Источник данных</h3>
        <label
          class="dropzone"
          :class="{ 'drag-over': dragOver }"
          @drop="onDrop"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
        >
          <input ref="fileRef" type="file" accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf" hidden @change="onFileChange" />
          <div class="drop-icon">⬆</div>
          <div class="drop-title">Перетащите файл сюда</div>
          <div class="drop-hint">PDF, DWG, DXF, JPG, PNG · до 100 МБ</div>
          <button type="button" class="btn" @click.prevent="fileRef?.click()">Выбрать файл</button>
          <span v-if="uploading" class="uploading">Загрузка…</span>
        </label>

        <template v-if="files.length">
          <h3 class="panel-title">Загруженные файлы · {{ files.length }}</h3>
          <ul class="file-list">
            <li v-for="(f, i) in files" :key="i" class="file-item" :class="{ selected: f.selected }">
              <span class="file-name">{{ f.name }}</span>
              <span class="file-meta">{{ f.size }} · {{ f.desc }}</span>
            </li>
          </ul>
        </template>

        <div v-if="scale" class="info-box">
          Масштаб распознан по штампу чертежа: <strong>{{ scale }}</strong>. При необходимости задайте вручную по известному размеру.
        </div>
      </template>

      <template v-else>
        <h3 class="panel-title">Адрес объекта</h3>
        <label class="field">
          <span>Адрес на карте</span>
          <input v-model="address" placeholder="г. Екатеринбург, ул. Примерная, 1" @keydown.enter="onMapSearch" />
        </label>
        <button type="button" class="btn accent block" @click="onMapSearch">Найти на Яндекс.Картах</button>
        <p v-if="mapSelected" class="ok-box">Объект найден на карте — проверьте положение маркера на спутниковом снимке.</p>
        <p v-else class="hint">Укажите адрес объекта — карта отобразит спутниковый снимок кровли для дальнейшей обводки контура.</p>
      </template>
    </aside>
  </div>
</template>

<style scoped>
.upload-layout { flex: 1; display: flex; min-height: 0; }
.upload-main { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--neutral-10); }
.tabs { display: flex; gap: 2px; padding: 12px 20px 0; }
.tab {
  padding: 8px 16px; border: none; border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: var(--neutral-15); font-weight: 600; font-size: 13px; cursor: pointer;
  color: var(--content-secondary-enabled);
}
.tab.active { background: #fff; color: var(--red-60); }
.toolbar {
  display: flex; align-items: center; gap: 6px; margin: 0 20px; padding: 12px 20px;
  background: #fff; border-bottom: 1px solid var(--border-secondary-enabled);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
.tool-btn {
  width: 32px; height: 32px; border: 1px solid var(--border-secondary-enabled);
  border-radius: 8px; background: #fff; cursor: pointer; font-weight: 700;
}
.zoom { width: 48px; text-align: center; font-size: 13px; font-weight: 600; color: var(--content-secondary-enabled); }
.sep { width: 1px; height: 22px; background: var(--border-secondary-enabled); margin: 0 6px; }
.spacer { flex: 1; }
.scale-btn {
  height: 32px; padding: 0 12px; border: 1px solid var(--border-secondary-enabled);
  border-radius: 8px; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
}
.viewport { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; overflow: hidden; }
.preview {
  background: #fff; border: 1px solid var(--border-secondary-enabled); box-shadow: var(--shadow-small);
  border-radius: 4px; padding: 18px; transition: transform .25s; max-width: 100%;
}
.underlay { display: block; max-width: 560px; max-height: 380px; object-fit: contain; filter: grayscale(1) opacity(.85); }
.pdf-canvas { display: block; max-width: 560px; max-height: 380px; filter: grayscale(1) opacity(.85); }
.preview-placeholder {
  width: 560px; max-width: 100%; height: 280px; display: flex; align-items: center; justify-content: center;
  background: var(--neutral-10); color: var(--content-tertiary-enabled); font-size: 14px;
}
.preview-unavailable {
  width: 560px; max-width: 100%; min-height: 220px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px; padding: 24px; text-align: center;
  background: var(--neutral-10); border-radius: 8px;
}
.preview-unavailable-icon { font-size: 36px; opacity: .6; }
.preview-unavailable p { margin: 0; font-size: 13px; color: var(--content-secondary-enabled); line-height: 1.5; max-width: 420px; }
.preview-error { margin: 10px 0 0; font-size: 12px; color: var(--red-60); text-align: center; }
.caption {
  margin-top: 10px; font-family: var(--font-family-mono); font-size: 11px;
  color: var(--content-tertiary-enabled); text-align: center;
}
.empty { text-align: center; max-width: 320px; }
.empty-icon { font-size: 40px; margin-bottom: 12px; opacity: .5; }
.empty-title { font-size: 15px; font-weight: 600; color: var(--content-secondary-enabled); margin-bottom: 6px; }
.empty-text { font-size: 13px; color: var(--content-tertiary-enabled); line-height: 1.5; margin: 0; }
.map-pane {
  flex: 1; position: relative; display: flex; align-items: center; justify-content: center;
  margin: 20px; border-radius: var(--radius-lg); overflow: hidden;
  border: 1px solid var(--border-secondary-enabled);
  background: repeating-linear-gradient(45deg, #eef0f4, #eef0f4 12px, #e7e9ef 12px, #e7e9ef 24px);
}
.map-glow { position: absolute; inset: 0; background: radial-gradient(circle at 60% 45%, rgba(225,27,17,.10), transparent 40%); }
.map-pin { position: absolute; top: 42%; left: 60%; font-size: 32px; }
.map-search {
  position: absolute; top: 16px; left: 16px; right: 16px; display: flex; gap: 8px;
}
.map-input {
  flex: 1; height: 48px; padding: 0 14px; border: 1px solid var(--border-secondary-enabled);
  border-radius: var(--radius-md); font: inherit;
}
.map-label { font-family: monospace; font-size: 12px; color: var(--neutral-55); }
.upload-panel {
  width: 380px; flex: 0 0 380px; border-left: 1px solid var(--border-secondary-enabled);
  background: #fff; padding: 0 0 20px; overflow-y: auto;
}
.panel-title { margin: 18px 20px 12px; font-size: 15px; font-weight: 700; }
.dropzone {
  display: block; margin: 0 20px 16px; padding: 22px 18px; text-align: center; cursor: pointer;
  border: 1.5px dashed var(--border-secondary-enabled); border-radius: var(--radius-lg); background: var(--neutral-10);
  transition: border-color .15s, background .15s;
}
.dropzone.drag-over { border-color: var(--red-60); background: var(--red-10); }
.drop-icon { font-size: 28px; margin-bottom: 8px; }
.drop-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.drop-hint { font-size: 12.5px; color: var(--content-tertiary-enabled); margin-bottom: 12px; }
.uploading { display: block; margin-top: 8px; font-size: 12px; color: var(--red-60); }
.file-list { list-style: none; margin: 0; padding: 0 12px; }
.file-item {
  padding: 12px 14px; border: 1px solid var(--border-secondary-enabled); border-radius: 8px;
  margin-bottom: 6px; background: var(--neutral-10);
}
.file-item.selected { border-color: var(--red-60); background: var(--red-10); }
.file-name { display: block; font-size: 13px; font-weight: 600; }
.file-meta { font-size: 12px; color: var(--content-tertiary-enabled); }
.info-box {
  margin: 12px 20px 0; padding: 14px 16px; background: var(--blue-10); border-radius: var(--radius-md);
  font-size: 12.5px; color: var(--blue-65); line-height: 1.45;
}
.field { display: block; margin: 0 20px 12px; }
.field span { display: block; font-size: 12.5px; font-weight: 600; color: var(--content-secondary-enabled); margin-bottom: 6px; }
.field input {
  width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--border-secondary-enabled);
  border-radius: 8px; font: inherit;
}
.btn {
  height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--border-secondary-enabled);
  background: #fff; font-weight: 600; cursor: pointer; font-size: 14px;
}
.btn.accent { background: var(--red-60); color: #fff; border-color: var(--red-60); }
.btn.block { display: block; width: calc(100% - 40px); margin: 0 20px 12px; }
.ok-box {
  margin: 0 20px; padding: 12px 14px; background: var(--green-10); border-radius: var(--radius-md);
  font-size: 12.5px; color: var(--green-65); line-height: 1.45;
}
.hint { margin: 0 20px; font-size: 12.5px; color: var(--content-tertiary-enabled); line-height: 1.45; }
</style>
