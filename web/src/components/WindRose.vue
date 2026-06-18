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
const maxV = computed(() => Math.max(...(props.data?.map((d) => d.v) ?? [1])))

function petalPoints(d: NonNullable<CalculationData['windRose']>[number]) {
  const R = sz.value / 2 - 18
  const rad = ((d.deg - 90) * Math.PI) / 180
  const len = (d.v / maxV.value) * R
  const x = cx.value + Math.cos(rad) * len
  const y = cx.value + Math.sin(rad) * len
  const w = 7
  const px = cx.value + Math.cos(rad + Math.PI / 2) * w
  const py = cx.value + Math.sin(rad + Math.PI / 2) * w
  const qx = cx.value + Math.cos(rad - Math.PI / 2) * w
  const qy = cx.value + Math.sin(rad - Math.PI / 2) * w
  return `${cx.value},${cx.value} ${px},${py} ${x},${y} ${qx},${qy}`
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
        :r="(sz / 2 - 18) * f"
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
    <text v-else :x="cx" :y="cx" text-anchor="middle" font-size="11" fill="var(--content-tertiary-enabled)">—</text>
  </svg>
</template>

<style scoped>
.rose { display: block; }
</style>
