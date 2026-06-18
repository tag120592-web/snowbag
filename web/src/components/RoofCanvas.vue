<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GeometryData, CalculationData } from '@/types'
import WindRose from '@/components/WindRose.vue'
import RoofScene3D from '@/components/RoofScene3D.vue'

const props = defineProps<{
  geometry: GeometryData
  calculation?: CalculationData | null
  layers?: { roof?: boolean; obstacles?: boolean; bags?: boolean; sensors?: boolean; wind?: boolean; underlay?: boolean }
  northDeg?: number
  underlayUrl?: string
  view3d?: boolean
  editableSensors?: boolean
  editableObstacles?: boolean
  selectedObstacleId?: string | null
}>()

const emit = defineEmits<{
  sensorMove: [id: string, x: number, y: number]
  obstacleSelect: [id: string]
}>()

const riskColors: Record<string, { fill: string; soft: string }> = {
  critical: { fill: 'var(--red-60)', soft: 'var(--red-10)' },
  high: { fill: 'var(--orange-40)', soft: 'var(--orange-10)' },
  medium: { fill: 'var(--yellow-30)', soft: 'var(--yellow-10)' },
}

const dragging = ref<string | null>(null)

const show = computed(() => ({
  roof: props.layers?.roof !== false,
  obstacles: props.layers?.obstacles !== false,
  bags: props.layers?.bags !== false,
  sensors: props.layers?.sensors !== false,
  wind: props.layers?.wind !== false,
  underlay: props.layers?.underlay !== false,
}))

function ptsStr(pts: number[][]) {
  return pts.map((p) => p.join(',')).join(' ')
}

function onSensorDown(id: string, e: MouseEvent) {
  if (!props.editableSensors) return
  dragging.value = id
  e.preventDefault()
}

function onMove(e: MouseEvent) {
  if (!dragging.value) return
  const svg = e.currentTarget as SVGSVGElement
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return
  const p = pt.matrixTransform(ctm.inverse())
  emit('sensorMove', dragging.value, p.x, p.y)
}

function onUp() {
  dragging.value = null
}
</script>

<template>
  <RoofScene3D
    v-if="view3d"
    :geometry="geometry"
    :calculation="calculation"
    :layers="layers"
  />

  <div v-else class="wrap">
    <svg
      viewBox="0 0 1000 680"
      class="canvas"
      @mousemove="onMove"
      @mouseup="onUp"
      @mouseleave="onUp"
    >
      <rect x="0" y="0" width="1000" height="680" fill="var(--neutral-15)" />

      <image
        v-if="show.underlay && underlayUrl"
        :href="underlayUrl"
        x="0"
        y="0"
        width="1000"
        height="680"
        opacity="0.45"
        preserveAspectRatio="xMidYMid meet"
      />

      <g v-if="show.roof && geometry.roof?.length">
        <polygon :points="ptsStr(geometry.roof)" fill="#fff" stroke="var(--neutral-65)" stroke-width="2.5" />
      </g>

      <g v-if="show.obstacles && geometry.obstacles?.length">
        <template v-for="o in geometry.obstacles" :key="o.id">
          <g
            :class="{ selectable: editableObstacles, selected: selectedObstacleId === o.id }"
            @click="editableObstacles && emit('obstacleSelect', o.id)"
          >
            <rect
              v-if="o.shape === 'rect' && o.w && o.h"
              :x="o.x" :y="o.y" :width="o.w" :height="o.h"
              :fill="selectedObstacleId === o.id ? 'var(--red-10)' : 'var(--neutral-20)'"
              :stroke="selectedObstacleId === o.id ? 'var(--red-60)' : 'var(--neutral-55)'"
              :stroke-width="selectedObstacleId === o.id ? 2.5 : 1.5"
            />
            <text
              v-if="o.shape === 'rect' && o.w && o.h && o.short"
              :x="(o.x ?? 0) + (o.w ?? 0) / 2"
              :y="(o.y ?? 0) + (o.h ?? 0) / 2 + 4"
              text-anchor="middle"
              font-size="11"
              font-weight="600"
              fill="var(--content-secondary-enabled)"
              pointer-events="none"
            >{{ o.short }}</text>
            <text
              v-if="o.shape === 'rect' && o.w && o.h && editableObstacles"
              :x="(o.x ?? 0) + (o.w ?? 0) / 2"
              :y="(o.y ?? 0) + (o.h ?? 0) / 2 + 18"
              text-anchor="middle"
              font-size="10"
              font-weight="700"
              fill="var(--red-60)"
              pointer-events="none"
            >h {{ (o.hM ?? 0).toFixed(1) }} м</text>
            <circle
              v-else-if="o.shape === 'circle' && o.r"
              :cx="o.cx" :cy="o.cy" :r="o.r"
              :fill="selectedObstacleId === o.id ? 'var(--blue-10)' : 'var(--blue-40)'"
              :stroke="selectedObstacleId === o.id ? 'var(--red-60)' : 'var(--blue-60)'"
              :stroke-width="selectedObstacleId === o.id ? 2.5 : 1.5"
            />
          </g>
        </template>
        <polyline
          v-if="geometry.walkway?.length"
          :points="ptsStr(geometry.walkway)"
          fill="none" stroke="var(--neutral-45)" stroke-width="2" stroke-dasharray="8 6"
        />
      </g>

      <g v-if="show.bags && calculation?.snowbags?.length">
        <polygon
          v-for="bag in calculation.snowbags"
          :key="bag.id"
          :points="ptsStr(bag.poly)"
          :fill="riskColors[bag.risk]?.soft ?? 'var(--red-10)'"
          :stroke="riskColors[bag.risk]?.fill ?? 'var(--red-60)'"
          stroke-width="1.5"
          opacity="0.85"
        />
        <text
          v-for="bag in calculation.snowbags"
          :key="`${bag.id}-lbl`"
          :x="bag.poly.reduce((s, p) => s + p[0], 0) / bag.poly.length"
          :y="bag.poly.reduce((s, p) => s + p[1], 0) / bag.poly.length + 4"
          text-anchor="middle"
          font-size="12"
          font-weight="800"
          :fill="riskColors[bag.risk]?.fill ?? 'var(--red-60)'"
        >{{ bag.id }}</text>
      </g>

      <g v-if="show.sensors && calculation?.sensors?.length">
        <g
          v-for="s in calculation.sensors"
          :key="s.id"
          :class="{ draggable: editableSensors }"
          @mousedown="onSensorDown(s.id, $event)"
        >
          <circle :cx="s.x" :cy="s.y" r="14" fill="#fff" stroke="var(--red-60)" stroke-width="2" />
          <circle :cx="s.x" :cy="s.y" r="5" fill="var(--red-60)" />
          <text :x="s.x" :y="s.y - 18" text-anchor="middle" font-size="11" font-weight="700" fill="var(--content-primary-a-enabled)">{{ s.id }}</text>
        </g>
      </g>

      <g :transform="`rotate(${northDeg ?? 0} 920 80)`">
        <circle cx="920" cy="80" r="24" fill="#fff" stroke="var(--border-secondary-enabled)" />
        <polygon points="920,62 914,86 926,86" fill="var(--red-60)" />
        <text x="920" y="58" text-anchor="middle" font-size="9" font-weight="800">С</text>
      </g>

      <foreignObject v-if="show.wind && calculation?.windRose?.length" x="24" y="24" width="150" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <WindRose :data="calculation.windRose" :north="northDeg" :size="140" />
        </div>
      </foreignObject>
    </svg>
  </div>
</template>

<style scoped>
.wrap { width: 100%; height: 100%; display: flex; }
.canvas { width: 100%; height: 100%; display: block; }
.draggable { cursor: grab; }
.draggable:active { cursor: grabbing; }
.selectable { cursor: pointer; }
</style>
