<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CalculationData, GeometryData } from '@/types'

const props = defineProps<{
  loadGrid?: CalculationData['loadGrid']
  roof?: number[][]
  areaM2?: number
}>()

const wrapRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ro: ResizeObserver | null = null

function roofBounds(roof: number[][]) {
  let minX = roof[0][0]
  let maxX = roof[0][0]
  let minY = roof[0][1]
  let maxY = roof[0][1]
  for (const [x, y] of roof) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  return { minX, minY, maxX, maxY }
}

function polygonArea(pts: number[][]) {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]
  }
  return Math.abs(a) / 2
}

function metersPerPixel(roof: number[][], areaM2: number) {
  const px = polygonArea(roof)
  if (px <= 0) return 1
  return Math.sqrt((areaM2 > 0 ? areaM2 : 8240) / px)
}

function heatColor(value: number, min: number, max: number) {
  if (max <= min) return 'rgb(59, 130, 246)'
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  let r = 0
  let g = 0
  let b = 0
  if (t < 0.25) {
    const k = t / 0.25
    g = Math.round(100 + 155 * k)
    b = 255
  } else if (t < 0.5) {
    const k = (t - 0.25) / 0.25
    g = 255
    b = Math.round(255 * (1 - k))
  } else if (t < 0.75) {
    const k = (t - 0.5) / 0.25
    r = Math.round(255 * k)
    g = 255
  } else {
    const k = (t - 0.75) / 0.25
    r = 255
    g = Math.round(255 * (1 - k))
  }
  return `rgb(${r}, ${g}, ${b})`
}

function draw() {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  const grid = props.loadGrid
  const roof = props.roof
  if (!canvas || !wrap || !grid?.grid?.length || !roof?.length) return

  const cssW = wrap.clientWidth
  const cssH = wrap.clientHeight
  if (cssW < 1 || cssH < 1) return

  const dpr = window.devicePixelRatio || 1
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  const b = grid.bounds
  const widthM = b.max_x - b.min_x
  const heightM = b.max_y - b.min_y
  const scale = Math.min(cssW / widthM, cssH / heightM) * 0.92
  const offsetX = (cssW - widthM * scale) / 2
  const offsetY = (cssH - heightM * scale) / 2

  const toCanvas = (xM: number, yM: number) => ({
    x: offsetX + (xM - b.min_x) * scale,
    y: cssH - (offsetY + (yM - b.min_y) * scale),
  })

  const rb = roofBounds(roof)
  const mpp = metersPerPixel(roof, props.areaM2 ?? 0)

  ctx.save()
  ctx.beginPath()
  const first = toCanvas(0, 0)
  const mapRoof = (px: number, py: number) => toCanvas((px - rb.minX) * mpp, (py - rb.minY) * mpp)
  const p0 = mapRoof(roof[0][0], roof[0][1])
  ctx.moveTo(p0.x, p0.y)
  for (let i = 1; i < roof.length; i++) {
    const p = mapRoof(roof[i][0], roof[i][1])
    ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.clip()

  const cellPx = Math.max(2, Math.ceil(grid.cell_size_m * scale * 1.5) + 1)
  for (const cell of grid.grid) {
    const { x, y } = toCanvas(cell.x, cell.y)
    ctx.fillStyle = heatColor(cell.value_kpa, grid.min_value_kpa, grid.max_value_kpa)
    ctx.fillRect(Math.floor(x - cellPx / 2), Math.floor(y - cellPx / 2), cellPx, cellPx)
  }
  ctx.restore()

  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(p0.x, p0.y)
  for (let i = 1; i < roof.length; i++) {
    const p = mapRoof(roof[i][0], roof[i][1])
    ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.stroke()
}

onMounted(() => {
  draw()
  if (wrapRef.value) {
    ro = new ResizeObserver(() => draw())
    ro.observe(wrapRef.value)
  }
})

onBeforeUnmount(() => {
  ro?.disconnect()
})

watch(() => [props.loadGrid, props.roof, props.areaM2], () => draw(), { deep: true })
</script>

<template>
  <div ref="wrapRef" class="load-heatmap">
    <canvas ref="canvasRef" />
    <div v-if="loadGrid" class="legend">
      <span>{{ loadGrid.min_value_kpa.toFixed(2) }} кПа</span>
      <span class="bar" />
      <span>{{ loadGrid.max_value_kpa.toFixed(2) }} кПа</span>
    </div>
  </div>
</template>

<style scoped>
.load-heatmap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}
canvas {
  flex: 1;
  width: 100%;
  height: 100%;
}
.legend {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 11px;
  color: var(--content-secondary-enabled);
  background: rgba(255, 255, 255, 0.9);
}
.bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, rgb(0, 100, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 0, 0));
}
</style>
