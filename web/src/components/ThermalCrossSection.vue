<script setup lang="ts">
import { computed } from 'vue'
import type { ThermalLayer } from '@/api/thermal'

const props = defineProps<{
  layers: ThermalLayer[]
  tIn: number
  systemName?: string
  planeIndex?: number
}>()

const fmt = (n: number, d = 2) => n.toFixed(d).replace('.', ',')

function colorFor(role: string): string {
  const r = role.toLowerCase()
  if (r.includes('теплоизол')) return 'var(--orange-20)'
  if (r.includes('гидро')) return 'var(--blue-20)'
  if (r.includes('паро')) return 'var(--green-15)'
  if (r.includes('несущ') || r.includes('осно')) return 'var(--neutral-25)'
  return 'var(--neutral-15)'
}

const W = 560
const padTop = 34
const padBot = 34
const x0 = 178
const bw = 220

const bands = computed(() => {
  const vis = props.layers.map((l) => ({
    ...l,
    h: Math.min(150, Math.max(26, l.thicknessMm * 0.9 + 24)),
  }))
  let y = padTop
  return vis.map((l) => {
    const b = { ...l, y }
    y += l.h
    return b
  })
})

const totalH = computed(() => bands.value.reduce((a, b) => a + b.h, 0))
const H = computed(() => totalH.value + padTop + padBot)

// Y плоскости максимального увлажнения — наружная (верхняя) граница слоя planeIndex.
const planeY = computed(() => {
  const i = props.planeIndex
  if (i === undefined || i < 0 || i >= bands.value.length) return null
  return bands.value[i].y
})
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" width="100%" :height="H" preserveAspectRatio="xMidYMid meet" class="xsection">
    <!-- наружный воздух -->
    <text :x="x0 + bw / 2" :y="18" text-anchor="middle" font-size="11" font-weight="700" fill="var(--blue-60)">
      ↑ Наружный воздух
    </text>

    <g v-for="(b, i) in bands" :key="i">
      <rect :x="x0" :y="b.y" :width="bw" :height="b.h" :fill="colorFor(b.role)" stroke="#fff" stroke-width="1.5" />
      <!-- название материала -->
      <text :x="x0 + bw / 2" :y="b.y + b.h / 2 + 4" text-anchor="middle" font-size="10.5" font-weight="600"
        fill="var(--content-primary-a-enabled)" style="paint-order: stroke; stroke: #fff; stroke-width: 3px">
        {{ b.material.name }}
      </text>
      <!-- слева: роль и толщина -->
      <line :x1="x0" :y1="b.y + b.h / 2" :x2="x0 - 12" :y2="b.y + b.h / 2" stroke="var(--content-tertiary-enabled)" stroke-width="1" />
      <text :x="x0 - 16" :y="b.y + b.h / 2 - 3" text-anchor="end" font-size="11" font-weight="600" fill="var(--content-primary-a-enabled)">
        {{ b.role }}
      </text>
      <text :x="x0 - 16" :y="b.y + b.h / 2 + 12" text-anchor="end" font-size="10.5" fill="var(--content-tertiary-enabled)">
        {{ b.thicknessMm > 0 ? fmt(b.thicknessMm, 0) + ' мм' : '—' }}
      </text>
      <!-- справа: R -->
      <text v-if="b.r > 0.02" :x="x0 + bw + 12" :y="b.y + b.h / 2 + 4" text-anchor="start" font-size="11"
        font-weight="600" :fill="b.isInsulant ? 'var(--orange-50)' : 'var(--content-secondary-enabled)'">
        R {{ fmt(b.r) }}
      </text>
    </g>

    <rect :x="x0" :y="padTop" :width="bw" :height="totalH" fill="none" stroke="var(--content-primary-a-enabled)" stroke-width="2" />

    <!-- плоскость максимального увлажнения (конденсат) -->
    <g v-if="planeY !== null">
      <line :x1="x0 - 6" :y1="planeY" :x2="x0 + bw + 6" :y2="planeY" stroke="var(--blue-55)" stroke-width="2" stroke-dasharray="5 3" />
      <rect :x="x0 + bw + 8" :y="planeY - 9" width="118" height="18" rx="9" fill="var(--blue-10)" stroke="var(--blue-55)" stroke-width="1" />
      <text :x="x0 + bw + 16" :y="planeY + 3" font-size="10" font-weight="600" fill="#2f6fb0">💧 плоск. увлажнения</text>
    </g>

    <!-- внутренний воздух -->
    <text :x="x0 + bw / 2" :y="H - 12" text-anchor="middle" font-size="11" font-weight="700" fill="var(--content-accent-enabled)">
      ↓ Внутренний воздух · +{{ tIn }} °C
    </text>
  </svg>
</template>

<style scoped>
.xsection { display: block; max-width: 100%; }
</style>
