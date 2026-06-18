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

// Является ли препятствие кандидатом в неоднородность (по типу) — иначе показываем бледно.
type ObNode = { kind: 'linear' | 'point' }
function obstacleNode(o: Obstacle): ObNode | null {
  const t = (o.type + ' ' + (o.short ?? '')).toLowerCase()
  if (t.includes('фонар')) return { kind: 'linear' }
  if (t.includes('надстрой') || t.includes('лестничн') || t.includes('шахт')) return { kind: 'linear' }
  if (t.includes('аэратор')) return { kind: 'point' }
  if (t.includes('проходк')) return { kind: 'point' }
  if (t.includes('колонн')) return { kind: 'point' }
  if (t.includes('блок') || t.includes('установк') || t.includes('вент')) return { kind: 'linear' }
  return null
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

const candidates = computed(() =>
  (props.geometry.obstacles ?? []).map((o) => ({ o, node: obstacleNode(o) })),
)
</script>

<template>
  <svg viewBox="0 0 1000 680" class="plan" preserveAspectRatio="xMidYMid meet">
    <!-- контур кровли -->
    <path :d="roofPath" fill="var(--neutral-15)" stroke="var(--content-primary-a-enabled)" stroke-width="3" stroke-linejoin="round" />

    <g v-for="{ o, node } in candidates" :key="o.id">
      <!-- препятствие-неоднородность: кликабельно -->
      <g v-if="node" class="ob" :class="{ active: isActive(o.id), point: node.kind === 'point' }" @click="emit('toggle', o)">
        <rect v-if="o.shape === 'rect'" :x="o.x" :y="o.y" :width="o.w" :height="o.h" rx="8" />
        <circle v-else-if="o.shape === 'circle'" :cx="o.cx" :cy="o.cy" :r="(o.r ?? 8) + 8" />
        <polygon v-else-if="o.points" :points="o.points.map((p) => p.join(',')).join(' ')" />
        <text :x="center(o)[0]" :y="center(o)[1] + 5" text-anchor="middle" font-size="15" font-weight="600">{{ o.short || o.type }}</text>
      </g>
      <!-- прочее (воронки и т.п.): бледно, не кликабельно -->
      <g v-else opacity="0.35">
        <circle v-if="o.shape === 'circle'" :cx="o.cx" :cy="o.cy" :r="o.r ?? 8" fill="var(--blue-40)" />
        <rect v-else-if="o.shape === 'rect'" :x="o.x" :y="o.y" :width="o.w" :height="o.h" rx="4" fill="var(--neutral-25)" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.plan { display: block; width: 100%; height: auto; background: var(--background-secondary-a-enabled); border-radius: var(--radius-md); }
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
.ob.point rect, .ob.point circle, .ob.point polygon { stroke-dasharray: 4 3; }
</style>
