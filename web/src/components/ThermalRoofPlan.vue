<script setup lang="ts">
import { computed } from 'vue'
import type { GeometryData, Obstacle } from '@/types'

const props = defineProps<{ geometry: GeometryData; activeIds: string[] }>()
const emit = defineEmits<{ toggle: [obstacle: Obstacle] }>()

const roofPath = computed(() => {
  const r = props.geometry.roof ?? []
  if (r.length < 3) return ''
  return 'M' + r.map((p) => `${p[0]} ${p[1]}`).join(' L') + ' Z'
})

// Авто-вписывание: viewBox по габаритам кровли (любой масштаб заполняет превью).
const box = computed(() => {
  const r = props.geometry.roof ?? []
  if (r.length < 3) return { x: 0, y: 0, w: 1000, h: 680 }
  const xs = r.map((p) => p[0])
  const ys = r.map((p) => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(...xs) - minX
  const h = Math.max(...ys) - minY
  const pad = Math.max(w, h) * 0.12
  return { x: minX - pad, y: minY - pad, w: w + 2 * pad, h: h + 2 * pad }
})
const viewBox = computed(() => `${box.value.x} ${box.value.y} ${box.value.w} ${box.value.h}`)
// Масштаб обводки/подписей (подобраны под viewBox=1000) и размер маркера элемента.
const u = computed(() => box.value.w / 1000)
const markerR = computed(() => box.value.w * 0.02)

function isActive(id: string) {
  return props.activeIds.includes(id)
}

function center(o: Obstacle): [number, number] {
  if (o.shape === 'circle') return [o.cx ?? 0, o.cy ?? 0]
  if (o.shape === 'rect') return [(o.x ?? 0) + (o.w ?? 0) / 2, (o.y ?? 0) + (o.h ?? 0) / 2]
  const pts = o.points ?? []
  if (!pts.length) return [0, 0]
  const sx = pts.reduce((a, p) => a + p[0], 0) / pts.length
  const sy = pts.reduce((a, p) => a + p[1], 0) / pts.length
  return [sx, sy]
}
</script>

<template>
  <svg :viewBox="viewBox" class="plan" preserveAspectRatio="xMidYMid meet" :style="{ '--u': u }">
    <!-- контур кровли -->
    <path :d="roofPath" fill="var(--neutral-15)" stroke="var(--content-primary-a-enabled)" :stroke-width="3 * u" stroke-linejoin="round" />

    <!-- все элементы кровли — кликабельны (клик = добавить/убрать неоднородность) -->
    <g v-for="o in geometry.obstacles ?? []" :key="o.id" class="ob" :class="{ active: isActive(o.id) }" @click="emit('toggle', o)">
      <rect v-if="o.shape === 'rect'" :x="o.x" :y="o.y" :width="o.w" :height="o.h" :rx="6 * u" />
      <circle v-else-if="o.shape === 'circle'" :cx="o.cx" :cy="o.cy" :r="markerR" />
      <polygon v-else-if="o.points && o.points.length" :points="o.points.map((p) => p.join(',')).join(' ')" />
      <text :x="center(o)[0]" :y="center(o)[1] + 4 * u" text-anchor="middle" :font-size="11 * u" font-weight="600">{{ o.short || o.type }}</text>
    </g>

    <text v-if="!(geometry.obstacles ?? []).length" :x="box.x + box.w / 2" :y="box.y + 30 * u" text-anchor="middle" :font-size="16 * u" fill="var(--content-tertiary-enabled)">
      Элементы кровли не заданы
    </text>
  </svg>
</template>

<style scoped>
.plan { display: block; width: 100%; height: auto; max-height: 100%; background: var(--background-secondary-a-enabled); border-radius: var(--radius-md); }
.ob { cursor: pointer; }
.ob rect, .ob circle, .ob polygon {
  fill: var(--background-primary-a-enabled);
  stroke: var(--content-tertiary-enabled);
  stroke-width: calc(2 * var(--u, 1));
  transition: all 0.12s;
}
.ob text { fill: var(--content-primary-a-enabled); pointer-events: none; }
.ob:hover rect, .ob:hover circle, .ob:hover polygon { stroke: var(--content-accent-enabled); }
.ob.active rect, .ob.active circle, .ob.active polygon {
  fill: var(--red-10);
  stroke: var(--content-accent-enabled);
  stroke-width: calc(3 * var(--u, 1));
}
</style>
