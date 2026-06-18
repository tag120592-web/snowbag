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
  <svg viewBox="0 0 1000 680" class="plan" preserveAspectRatio="xMidYMid meet">
    <!-- контур кровли -->
    <path :d="roofPath" fill="var(--neutral-15)" stroke="var(--content-primary-a-enabled)" stroke-width="3" stroke-linejoin="round" />

    <!-- все элементы кровли — кликабельны (клик = добавить/убрать неоднородность) -->
    <g v-for="o in geometry.obstacles ?? []" :key="o.id" class="ob" :class="{ active: isActive(o.id) }" @click="emit('toggle', o)">
      <rect v-if="o.shape === 'rect'" :x="o.x" :y="o.y" :width="o.w" :height="o.h" rx="6" />
      <circle v-else-if="o.shape === 'circle'" :cx="o.cx" :cy="o.cy" :r="(o.r ?? 8) + 6" />
      <polygon v-else-if="o.points && o.points.length" :points="o.points.map((p) => p.join(',')).join(' ')" />
      <text :x="center(o)[0]" :y="center(o)[1] + 5" text-anchor="middle" font-size="15" font-weight="600">{{ o.short || o.type }}</text>
    </g>

    <text v-if="!(geometry.obstacles ?? []).length" x="500" y="40" text-anchor="middle" font-size="16" fill="var(--content-tertiary-enabled)">
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
  stroke-width: 2;
  transition: all 0.12s;
}
.ob text { fill: var(--content-primary-a-enabled); pointer-events: none; }
.ob:hover rect, .ob:hover circle, .ob:hover polygon { stroke: var(--content-accent-enabled); }
.ob.active rect, .ob.active circle, .ob.active polygon {
  fill: var(--red-10);
  stroke: var(--content-accent-enabled);
  stroke-width: 3;
}
</style>
