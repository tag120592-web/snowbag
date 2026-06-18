<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getPublicConfig } from '@/api/client'
import { geocodeAddress } from '@/utils/geocode'
import type { MapSelectPayload } from '@/types'

const props = defineProps<{
  address: string
  lat?: number | null
  lon?: number | null
  city?: string
  /** When false, map is view-only (for geometry tracing overlay). */
  interactive?: boolean
}>()

const interactive = computed(() => props.interactive !== false)

const emit = defineEmits<{
  select: [payload: MapSelectPayload]
}>()

const apiKey = ref(import.meta.env.VITE_YANDEX_MAPS_API_KEY ?? '')
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

function applyGeocodeResult(result: { address: string; lat: number; lon: number }) {
  if (!map) return
  map.setCenter([result.lat, result.lon], 17)
  setPlacemark(result.lat, result.lon)
  emit('select', result)
}

let map: InstanceType<NonNullable<typeof window.ymaps>['Map']> | null = null
let placemark: unknown = null
let scriptPromise: Promise<void> | null = null

function normalizeCity(city: string) {
  return city.trim().toLowerCase().replace(/^г\.?\s*/, '')
}

function defaultCenter(): [number, number] {
  if (props.lat != null && props.lon != null) return [props.lat, props.lon]
  const cityKey = normalizeCity(props.city ?? '')
  return CITY_COORDS[cityKey] ?? [56.8389, 60.6057]
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
  placemark = new Placemark([lat, lon], {}, { preset: 'islands#redIcon' })
  map.geoObjects.add(placemark)
}

async function initMap() {
  if (!mapEl.value) return
  loadError.value = ''
  try {
    await loadYmapsScript()
    await new Promise<void>((resolve) => window.ymaps!.ready(resolve))
    if (map) {
      map.destroy()
      map = null
      placemark = null
    }
    const center = defaultCenter()
    map = new window.ymaps!.Map(
      mapEl.value,
      { center, zoom: props.lat != null ? 17 : 11, controls: ['zoomControl'] },
      { suppressMapOpenBlock: true },
    )
    map.setType('yandex#satellite')
    if (props.lat != null && props.lon != null) {
      setPlacemark(props.lat, props.lon)
    }
    if (interactive.value) {
      map.events.add('click', (event: { get: (key: string) => number[] }) => {
        const coords = event.get('coords')
        const lat = coords[0]
        const lon = coords[1]
        setPlacemark(lat, lon)
        emit('select', { address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon })
      })
    } else {
      map.behaviors.disable('scrollZoom')
    }
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
    applyGeocodeResult({ ...result, address: q })
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Ошибка геокодирования'
  } finally {
    geocoding.value = false
  }
}

watch(
  () => [props.lat, props.lon] as const,
  ([lat, lon]) => {
    if (map && lat != null && lon != null) {
      map.setCenter([lat, lon], 17)
      setPlacemark(lat, lon)
    }
  },
)

onMounted(() => { void initMap() })

onUnmounted(() => {
  if (map) {
    map.destroy()
    map = null
  }
})

defineExpose({ geocode })
</script>

<template>
  <div class="map-wrap">
    <div ref="mapEl" class="map-root" />
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
}
.map-root { width: 100%; height: 100%; min-height: 360px; }
.map-error {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px; text-align: center; background: rgba(255,255,255,.92); color: var(--red-60);
  font-size: 13px; font-weight: 600;
}
.map-error-hint { margin-top: 8px; color: var(--content-secondary-enabled); font-weight: 400; font-size: 12px; }
.map-error-hint code { font-family: var(--font-family-mono); font-size: 11px; }
.map-loading {
  position: absolute; top: 12px; right: 12px; padding: 8px 12px; border-radius: 8px;
  background: rgba(255,255,255,.95); font-size: 12px; font-weight: 600;
  box-shadow: var(--shadow-small);
}
</style>
