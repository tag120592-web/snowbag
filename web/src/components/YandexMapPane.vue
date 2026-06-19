<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { getPublicConfig } from '@/api/client'
import { geocodeAddress } from '@/utils/geocode'
import type { MapSelectPayload } from '@/types'

const props = defineProps<{
  address: string
  lat?: number | null
  lon?: number | null
  city?: string
  zoom?: number | null
  center?: [number, number] | null
  interactive?: boolean
  allowClick?: boolean
  viewportSync?: boolean
}>()

const interactive = computed(() => props.interactive !== false)
const allowClick = computed(() => props.allowClick !== false)
const viewportSync = computed(() => props.viewportSync !== false)

const emit = defineEmits<{
  select: [payload: MapSelectPayload]
  viewportChange: [payload: { zoom: number; center: [number, number] }]
}>()

const apiKey = ref(import.meta.env.VITE_YANDEX_MAPS_API_KEY ?? '')
const mapWrapEl = ref<HTMLDivElement | null>(null)
const mapEl = ref<HTMLDivElement | null>(null)
const loadError = ref('')
const geocoding = ref(false)
const keyResolved = ref(!!apiKey.value)

const CITY_COORDS: Record<string, [number, number]> = {
  'екатеринбург': [56.8389, 60.6057],
  'москва': [55.7558, 37.6173],
  'санкт-петербург': [59.9343, 30.3351],
  'казань': [55.7963, 49.1088],
  'пермь': [58.0105, 56.2502],
  'новосибирск': [55.0084, 82.9357],
  'челябинск': [55.1644, 61.4368],
  'тюмень': [57.153, 65.5343],
  'волгоград': [48.7082, 44.5153],
}

function applyGeocodeResult(result: { address: string; lat: number; lon: number; label?: string }) {
  if (!map) return
  const zoom = props.zoom ?? 17
  map.setCenter([result.lat, result.lon], zoom)
  setPlacemark(result.lat, result.lon)
  emitViewport()
  emit('select', {
    address: result.label?.trim() || result.address,
    lat: result.lat,
    lon: result.lon,
    zoom: map.getZoom(),
    center: mapCenter(),
  })
}

let map: InstanceType<NonNullable<typeof window.ymaps>['Map']> | null = null
let placemark: unknown = null
let scriptPromise: Promise<void> | null = null
let initPromise: Promise<void> | null = null
let viewportEndListener: (() => void) | null = null
let actionStartListener: (() => void) | null = null
let actionEndListener: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null
let wheelListener: ((e: WheelEvent) => void) | null = null
let panMouseDown: ((e: MouseEvent) => void) | null = null
let panMouseMove: ((e: MouseEvent) => void) | null = null
let panMouseUp: (() => void) | null = null
let suppressViewportApply = false
let userInteracting = false
let panActive = false
let panStart: [number, number] | null = null
let panMovedPx = 0
let suppressMapClick = false

const PAN_OPTS = { capture: true } as const
const WHEEL_OPTS = { passive: false, capture: true } as const

function normalizeCity(city: string) {
  return city.trim().toLowerCase().replace(/^г\.?\s*/, '')
}

function defaultCenter(): [number, number] {
  if (props.center) return props.center
  if (props.lat != null && props.lon != null) return [props.lat, props.lon]
  const cityKey = normalizeCity(props.city ?? '')
  return CITY_COORDS[cityKey] ?? [56.8389, 60.6057]
}

function defaultZoom(): number {
  if (props.zoom != null) return props.zoom
  return props.lat != null ? 17 : 11
}

function mapCenter(): [number, number] {
  if (!map) return defaultCenter()
  const c = map.getCenter()
  return [c[0], c[1]]
}

function emitViewport() {
  if (!map) return
  suppressViewportApply = true
  emit('viewportChange', { zoom: map.getZoom(), center: mapCenter() })
  void nextTick(() => {
    requestAnimationFrame(() => { suppressViewportApply = false })
  })
}

function viewportMatchesProps(): boolean {
  if (!map) return true
  const center = defaultCenter()
  const zoom = props.zoom ?? map.getZoom()
  const cur = map.getCenter()
  return (
    Math.abs(cur[0] - center[0]) < 1e-5
    && Math.abs(cur[1] - center[1]) < 1e-5
    && map.getZoom() === zoom
  )
}

function syncMapElementSize(): boolean {
  const wrap = mapWrapEl.value
  const el = mapEl.value
  if (!wrap || !el) return false
  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (w < 1 || h < 1) return false
  el.style.width = `${w}px`
  el.style.height = `${h}px`
  return true
}

function panByPixels(dx: number, dy: number) {
  if (!map) return
  const px = map.getGlobalPixelCenter()
  map.setGlobalPixelCenter([px[0] - dx, px[1] - dy], map.getZoom())
}

function bindResizeObserver() {
  const target = mapWrapEl.value
  if (!target || resizeObserver) return
  resizeObserver = new ResizeObserver(() => {
    if (syncMapElementSize()) void fitMapToContainer()
  })
  resizeObserver.observe(target)
}

function bindWheelZoom() {
  const target = mapWrapEl.value
  if (!target || wheelListener) return
  wheelListener = (e: WheelEvent) => {
    if (!map || !interactive.value) return
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY
    if (delta === 0) return
    userInteracting = true
    const next = map.getZoom() + (delta > 0 ? -1 : 1)
    map.setZoom(next, { duration: 150, checkZoomRange: true })
    window.setTimeout(() => {
      userInteracting = false
      emitViewport()
    }, 160)
  }
  target.addEventListener('wheel', wheelListener, WHEEL_OPTS)
}

function unbindWheelZoom() {
  if (mapWrapEl.value && wheelListener) {
    mapWrapEl.value.removeEventListener('wheel', wheelListener, WHEEL_OPTS)
  }
  wheelListener = null
}

function bindPanHandlers() {
  const wrap = mapWrapEl.value
  if (!wrap || panMouseDown) return

  panMouseDown = (e: MouseEvent) => {
    if (!interactive.value || e.button !== 0) return
    if ((e.target as HTMLElement).closest('[class*="zoom"]')) return
    suppressMapClick = false
    panActive = true
    panMovedPx = 0
    panStart = [e.clientX, e.clientY]
    userInteracting = true
    wrap.classList.add('map-wrap--dragging')
  }

  panMouseMove = (e: MouseEvent) => {
    if (!panActive || !panStart || !map) return
    const dx = e.clientX - panStart[0]
    const dy = e.clientY - panStart[1]
    if (dx === 0 && dy === 0) return
    panMovedPx += Math.abs(dx) + Math.abs(dy)
    panStart = [e.clientX, e.clientY]
    panByPixels(dx, dy)
    e.preventDefault()
  }

  panMouseUp = () => {
    if (!panActive) return
    panActive = false
    panStart = null
    userInteracting = false
    wrap.classList.remove('map-wrap--dragging')
    if (panMovedPx > 2) {
      suppressMapClick = true
      emitViewport()
    }
    panMovedPx = 0
  }

  wrap.addEventListener('mousedown', panMouseDown, PAN_OPTS)
  window.addEventListener('mousemove', panMouseMove)
  window.addEventListener('mouseup', panMouseUp)
}

function unbindPanHandlers() {
  const wrap = mapWrapEl.value
  if (wrap && panMouseDown) wrap.removeEventListener('mousedown', panMouseDown, PAN_OPTS)
  if (panMouseMove) window.removeEventListener('mousemove', panMouseMove)
  if (panMouseUp) window.removeEventListener('mouseup', panMouseUp)
  panMouseDown = null
  panMouseMove = null
  panMouseUp = null
  panActive = false
  panStart = null
}

function loadYmapsScript(): Promise<void> {
  if (window.ymaps) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = resolveApiKey().then((key) => {
    if (!key) {
      throw new Error('VITE_YANDEX_MAPS_API_KEY не задан')
    }
    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-ymaps="1"]')
      if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', () => reject(new Error('ymaps load failed')))
        return
      }
      const script = document.createElement('script')
      script.dataset.ymaps = '1'
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('ymaps load failed'))
      document.head.appendChild(script)
    })
  })
  return scriptPromise
}

async function resolveApiKey(): Promise<string> {
  if (apiKey.value) return apiKey.value
  try {
    const cfg = await getPublicConfig()
    apiKey.value = cfg.yandexMapsApiKey?.trim() ?? ''
  } catch {
    apiKey.value = ''
  } finally {
    keyResolved.value = true
  }
  return apiKey.value
}

function setPlacemark(lat: number, lon: number) {
  if (!map || !window.ymaps) return
  const ymaps = window.ymaps as typeof window.ymaps & Record<string, unknown>
  const Placemark = ymaps.Placemark as new (coords: number[], props?: object, options?: object) => unknown
  if (placemark) map.geoObjects.remove(placemark)
  placemark = new Placemark([lat, lon], {}, { preset: 'islands#redIcon', draggable: false })
  map.geoObjects.add(placemark)
}

function setMapInteractivity(enabled: boolean) {
  if (!map) return
  // Native drag/scroll often fail inside flex layouts — pan/zoom handled on map-wrap.
  const behaviors = ['scrollZoom', 'drag', 'dblClickZoom', 'multiTouch'] as const
  for (const b of behaviors) {
    map.behaviors.disable(b)
  }
  if (enabled) map.behaviors.enable('dblClickZoom')
}

function clearMapEventListeners() {
  if (!map) return
  if (viewportEndListener) {
    map.events.remove('actionend', viewportEndListener)
    viewportEndListener = null
  }
  if (actionStartListener) {
    map.events.remove('actionstart', actionStartListener)
    actionStartListener = null
  }
  if (actionEndListener) {
    map.events.remove('actionend', actionEndListener)
    actionEndListener = null
  }
}

function bindViewportEvents() {
  if (!map || viewportEndListener) return
  actionStartListener = () => { userInteracting = true }
  actionEndListener = () => { userInteracting = false }
  viewportEndListener = () => emitViewport()
  map.events.add('actionstart', actionStartListener)
  map.events.add('actionend', actionEndListener)
  map.events.add('actionend', viewportEndListener)
}

async function waitForContainerSize(maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i += 1) {
    await nextTick()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    if (syncMapElementSize()) return true
  }
  return false
}

async function fitMapToContainer() {
  if (!map) return
  if (!syncMapElementSize()) return
  map.container.fitToViewport()
}

function applyViewportFromProps() {
  if (!map) return
  if (viewportMatchesProps()) {
    if (props.lat != null && props.lon != null) setPlacemark(props.lat, props.lon)
    return
  }
  const center = defaultCenter()
  const zoom = props.zoom ?? map.getZoom()
  map.setCenter(center, zoom, { duration: 0 })
  if (props.lat != null && props.lon != null) setPlacemark(props.lat, props.lon)
}

async function initMap() {
  if (initPromise) return initPromise
  initPromise = doInitMap().finally(() => { initPromise = null })
  return initPromise
}

async function doInitMap() {
  if (!mapEl.value) return
  loadError.value = ''
  try {
    await waitForContainerSize()
    await loadYmapsScript()
    await new Promise<void>((resolve) => window.ymaps!.ready(resolve))
    if (map) {
      clearMapEventListeners()
      unbindWheelZoom()
      unbindPanHandlers()
      map.destroy()
      map = null
      placemark = null
    }
    syncMapElementSize()
    const center = defaultCenter()
    map = new window.ymaps!.Map(
      mapEl.value,
      { center, zoom: defaultZoom(), controls: ['zoomControl'] },
      { suppressMapOpenBlock: true },
    )
    map.setType('yandex#satellite')
    setMapInteractivity(interactive.value)
    if (props.lat != null && props.lon != null) {
      setPlacemark(props.lat, props.lon)
    }
    if (interactive.value && allowClick.value) {
      map.events.add('click', (event: { get: (key: string) => number[] }) => {
        if (suppressMapClick) {
          suppressMapClick = false
          return
        }
        const coords = event.get('coords')
        const lat = coords[0]
        const lon = coords[1]
        setPlacemark(lat, lon)
        emitViewport()
        emit('select', {
          address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
          lat,
          lon,
          zoom: map!.getZoom(),
          center: mapCenter(),
        })
      })
    }
    bindViewportEvents()
    bindPanHandlers()
    bindWheelZoom()
    bindResizeObserver()
    await fitMapToContainer()
    requestAnimationFrame(() => { void fitMapToContainer() })
  } catch (e) {
    scriptPromise = null
    loadError.value = e instanceof Error ? e.message : 'Не удалось загрузить Яндекс.Карты'
  }
}

async function geocode(query: string) {
  const q = query.trim()
  if (!q) return
  geocoding.value = true
  loadError.value = ''
  try {
    if (!map) await initMap()
    if (!map) throw new Error('Карта не инициализирована')
    const result = await geocodeAddress(q, props.city ?? '')
    applyGeocodeResult({ ...result, address: q, label: result.address })
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Ошибка геокодирования'
  } finally {
    geocoding.value = false
  }
}

watch(
  () => [props.lat, props.lon] as const,
  (cur, prev) => {
    if (!map || suppressViewportApply || userInteracting) return
    if (cur[0] === prev?.[0] && cur[1] === prev?.[1]) return
    applyViewportFromProps()
  },
)

watch(
  () => [props.center, props.zoom] as const,
  () => {
    if (!viewportSync.value) return
    if (!map || suppressViewportApply || userInteracting) return
    if (!viewportMatchesProps()) applyViewportFromProps()
  },
)

watch(interactive, (enabled) => {
  setMapInteractivity(enabled)
  if (enabled) {
    bindPanHandlers()
    bindWheelZoom()
  } else {
    unbindPanHandlers()
    unbindWheelZoom()
  }
})

onMounted(async () => {
  await initMap()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  unbindWheelZoom()
  unbindPanHandlers()
  if (map) {
    clearMapEventListeners()
    map.destroy()
    map = null
  }
})

defineExpose({ geocode, relayout: fitMapToContainer })
</script>

<template>
  <div
    ref="mapWrapEl"
    class="map-wrap"
    :class="{ 'map-wrap--interactive': interactive }"
  >
    <div ref="mapEl" class="map-root" tabindex="0" />
    <div v-if="loadError" class="map-error">
      <p>{{ loadError }}</p>
      <p v-if="keyResolved && !apiKey" class="map-error-hint">Добавьте ключ в <code>VITE_YANDEX_MAPS_API_KEY</code> (файл <code>web/.env</code>) или <code>YANDEX_MAPS_API_KEY</code> (корневой <code>.env</code> для Docker).</p>
    </div>
    <div v-if="geocoding" class="map-loading">Поиск на карте…</div>
  </div>
</template>

<style scoped>
.map-wrap {
  flex: 1;
  position: relative;
  margin: 20px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-secondary-enabled);
  min-height: 360px;
  min-width: 0;
  height: 100%;
}
.map-wrap--interactive { cursor: grab; }
.map-wrap--interactive.map-wrap--dragging { cursor: grabbing; }
.map-root {
  position: absolute;
  inset: 0;
  outline: none;
  touch-action: none;
}
.map-error {
  position: absolute; inset: 0; z-index: 2;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px; text-align: center; background: rgba(255,255,255,.92); color: var(--red-60);
  font-size: 13px; font-weight: 600;
}
.map-error-hint { margin-top: 8px; color: var(--content-secondary-enabled); font-weight: 400; font-size: 12px; }
.map-error-hint code { font-family: var(--font-family-mono); font-size: 11px; }
.map-loading {
  position: absolute; top: 12px; right: 12px; z-index: 1;
  padding: 8px 12px; border-radius: 8px;
  background: rgba(255,255,255,.95); font-size: 12px; font-weight: 600;
  box-shadow: var(--shadow-small); pointer-events: none;
}
</style>
