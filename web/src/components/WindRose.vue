<script setup lang="ts">
import { computed } from 'vue'
import type { CalculationData } from '@/types'

const props = defineProps<{
  data?: CalculationData['windRose']
  north?: number
  size?: number
}>()

const sz = computed(() => props.size ?? 140)
const cx = computed(() => sz.value / 2)
const R = computed(() => sz.value / 2 - 18)
const maxV = computed(() => Math.max(...(props.data?.map((d) => d.v) ?? [1])))

const cardinals = [
  { lab: 'С', deg: 0 },
  { lab: 'В', deg: 90 },
  { lab: 'Ю', deg: 180 },
  { lab: 'З', deg: 270 },
]

function petalPoints(d: NonNullable<CalculationData['windRose']>[number]) {
  const rad = ((d.deg - 90) * Math.PI) / 180
  const len = (d.v / maxV.value) * R.value
  const x = cx.value + Math.cos(rad) * len
  const y = cx.value + Math.sin(rad) * len
  const w = 7
  const px = cx.value + Math.cos(rad + Math.PI / 2) * w
  const py = cx.value + Math.sin(rad + Math.PI / 2) * w
  const qx = cx.value + Math.cos(rad - Math.PI / 2) * w
  const qy = cx.value + Math.sin(rad - Math.PI / 2) * w
  return `${cx.value},${cx.value} ${px},${py} ${x},${y} ${qx},${qy}`
}

function cardinalPosition(deg: number) {
  const rad = ((deg - 90 + (props.north ?? 0)) * Math.PI) / 180
  const r = R.value + 11
  return {
    x: cx.value + Math.cos(rad) * r,
    y: cx.value + Math.sin(rad) * r + 4,
  }
}
</script>

<template>
  <svg :width="sz" :height="sz" :viewBox="`0 0 ${sz} ${sz}`" class="rose">
    <g v-if="data?.length" :transform="`rotate(${north ?? 0} ${cx} ${cx})`">
      <circle
        v-for="f in [0.5, 1]"
        :key="f"
        :cx="cx"
        :cy="cx"
        :r="R * f"
        fill="none"
        stroke="var(--neutral-20)"
        stroke-width="1"
        :stroke-dasharray="f === 0.5 ? '3 3' : '0'"
      />
      <polygon
        v-for="d in data"
        :key="d.dir"
        :points="petalPoints(d)"
        :fill="d.v === maxV ? 'var(--red-60)' : 'var(--blue-40)'"
        :fill-opacity="d.v === maxV ? 0.9 : 0.55"
      />
    </g>
    <g v-if="data?.length">
      <text
        v-for="c in cardinals"
        :key="c.deg"
        :x="cardinalPosition(c.deg).x"
        :y="cardinalPosition(c.deg).y"
        text-anchor="middle"
        font-size="11"
        :font-weight="c.lab === 'С' ? 800 : 600"
        :fill="c.lab === 'С' ? 'var(--red-60)' : 'var(--content-tertiary-enabled)'"
      >{{ c.lab }}</text>
    </g>
    <text v-else :x="cx" :y="cx" text-anchor="middle" font-size="11" fill="var(--content-tertiary-enabled)">—</text>
  </svg>
</template>

<style scoped>
.rose { display: block; }
</style>
