<script setup lang="ts">
import { computed } from 'vue'
import type { CalculationData, GeometryData } from '@/types'
import {
  ROOF_ELEVATION,
  obstacleVisualHeight,
  riskFill,
  riskLine,
  shrink,
  snowDepthZ,
} from '@/utils/roof3d'

const props = defineProps<{
  geometry: GeometryData
  calculation?: CalculationData | null
  layers?: { roof?: boolean; obstacles?: boolean; bags?: boolean; sensors?: boolean }
}>()

const ISO = 0.58
const GROUND_Z = -6

const maxSceneZ = computed(() => {
  let z = ROOF_ELEVATION + 20
  for (const o of props.geometry.obstacles ?? []) {
    z = Math.max(z, ROOF_ELEVATION + obstacleVisualHeight(o))
  }
  for (const bag of props.calculation?.snowbags ?? []) {
    z = Math.max(z, ROOF_ELEVATION + snowDepthZ(bag))
  }
  return z
})

const bounds = computed(() => {
  const roof = props.geometry.roof ?? []
  if (!roof.length) return { ox: 500, oy: 380, scale: 1 }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const [x, y] of roof) {
    for (const z of [GROUND_Z, maxSceneZ.value]) {
      const [sx, sy] = toIso(x, y, z)
      minX = Math.min(minX, sx)
      maxX = Math.max(maxX, sx)
      minY = Math.min(minY, sy)
      maxY = Math.max(maxY, sy)
    }
  }
  const w = maxX - minX || 1
  const h = maxY - minY || 1
  const pad = 40
  const scale = Math.min((960 - pad * 2) / w, (620 - pad * 2) / h)
  const ox = 500 - ((minX + maxX) / 2) * scale
  const oy = 360 - ((minY + maxY) / 2) * scale
  return { ox, oy, scale }
})

function toIso(x: number, y: number, z = 0): [number, number] {
  const sx = (x - y) * ISO
  const sy = (x + y) * ISO * 0.5 - z * 1.1
  return [sx, sy]
}

function T(x: number, y: number, z = 0): [number, number] {
  const [sx, sy] = toIso(x, y, z)
  return [sx * bounds.value.scale + bounds.value.ox, sy * bounds.value.scale + bounds.value.oy]
}

function ptsT(pts: number[][], z: number) {
  return pts.map((p) => T(p[0], p[1], z).join(',')).join(' ')
}

function quadSideT(a: number[], b: number[], zTop: number, zBot: number) {
  const [ax, ay] = T(a[0], a[1], zBot)
  const [bx, by] = T(b[0], b[1], zBot)
  const [atx, aty] = T(a[0], a[1], zTop)
  const [btx, bty] = T(b[0], b[1], zTop)
  return `${ax},${ay} ${bx},${by} ${btx},${bty} ${atx},${aty}`
}

const roofSides = computed(() => {
  const roof = props.geometry.roof ?? []
  const sides: string[] = []
  for (let i = 0; i < roof.length; i++) {
    const a = roof[i]
    const b = roof[(i + 1) % roof.length]
    sides.push(quadSideT(a, b, ROOF_ELEVATION, GROUND_Z))
  }
  return sides
})

const obstacleMeshes = computed(() => {
  const out: Array<{ top: string; sides: string[]; hM: number }> = []
  for (const o of props.geometry.obstacles ?? []) {
    if (o.shape !== 'rect' || !o.w || !o.h) continue
    const h = obstacleVisualHeight(o)
    if (h <= 0) continue
    const base = ROOF_ELEVATION
    const topZ = base + h
    const corners = [
      [o.x!, o.y!],
      [o.x! + o.w, o.y!],
      [o.x! + o.w, o.y! + o.h],
      [o.x!, o.y! + o.h],
    ]
    const top = ptsT(corners, topZ)
    const sides: string[] = []
    for (let i = 0; i < 4; i++) {
      sides.push(quadSideT(corners[i], corners[(i + 1) % 4], topZ, base))
    }
    out.push({ top, sides, hM: o.hM ?? 0 })
  }
  return out
})

const snowMeshes = computed(() => {
  const bags = props.calculation?.snowbags ?? []
  return bags.map((bag) => {
    const depth = snowDepthZ(bag)
    const base = ROOF_ELEVATION
    const topZ = base + depth
    const poly = bag.poly
    const top = ptsT(poly, topZ)
    const sides: string[] = []
    for (let i = 0; i < poly.length; i++) {
      sides.push(quadSideT(poly[i], poly[(i + 1) % poly.length], topZ, base))
    }
    const heatLayers = [0.35, 0.58, 0.82].map((t) => ({
      points: ptsT(shrink(poly, t), topZ + 0.3),
      opacity: t === 0.35 ? 0.55 : t === 0.58 ? 0.7 : 0.85,
    }))
    return { bag, depth, top, sides, heatLayers }
  })
})

const show = computed(() => ({
  roof: props.layers?.roof !== false,
  obstacles: props.layers?.obstacles !== false,
  bags: props.layers?.bags !== false,
  sensors: props.layers?.sensors !== false,
}))
</script>

<template>
  <div class="scene3d">
    <svg viewBox="0 0 1000 680" class="canvas">
      <defs>
        <linearGradient id="roofTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8f9fb" />
          <stop offset="100%" stop-color="#e8eaef" />
        </linearGradient>
        <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.25" />
        </filter>
        <filter id="bagblur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="roofclip3d">
          <polygon v-if="geometry.roof?.length" :points="ptsT(geometry.roof, ROOF_ELEVATION + 0.2)" />
        </clipPath>
        <radialGradient
          v-for="risk in ['critical', 'high', 'medium']"
          :id="`baggrad-${risk}`"
          :key="risk"
          cx="50%"
          cy="50%"
          r="65%"
        >
          <stop offset="0%" :stop-color="riskFill[risk]" stop-opacity="0.75" />
          <stop offset="55%" :stop-color="riskFill[risk]" stop-opacity="0.4" />
          <stop offset="100%" :stop-color="riskFill[risk]" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1000" height="680" fill="var(--neutral-10)" />

      <g v-if="show.roof && geometry.roof?.length" filter="url(#shadow3d)">
        <polygon
          v-for="(side, i) in roofSides"
          :key="`rs-${i}`"
          :points="side"
          fill="#c8cdd6"
          stroke="#9aa3b5"
          stroke-width="0.8"
        />
        <polygon :points="ptsT(geometry.roof, GROUND_Z)" fill="#b0b8c4" stroke="#8a94a6" stroke-width="1" />
        <polygon :points="ptsT(geometry.roof, ROOF_ELEVATION)" fill="url(#roofTop)" stroke="#6b7280" stroke-width="2" />
      </g>

      <g v-if="show.obstacles">
        <g v-for="(m, i) in obstacleMeshes" :key="`obs-${i}`">
          <polygon
            v-for="(side, j) in m.sides"
            :key="`os-${i}-${j}`"
            :points="side"
            fill="#a8b0bc"
            stroke="#7a8494"
            stroke-width="0.6"
          />
          <polygon :points="m.top" fill="#d4d9e2" stroke="#6b7280" stroke-width="1.2" />
        </g>
      </g>

      <g v-if="show.bags && snowMeshes.length" clip-path="url(#roofclip3d)">
        <g v-for="m in snowMeshes" :key="`${m.bag.id}-glow`">
          <polygon
            :points="ptsT(m.bag.poly, ROOF_ELEVATION + 0.4)"
            :fill="`url(#baggrad-${m.bag.risk})`"
            filter="url(#bagblur)"
          />
        </g>
      </g>

      <g v-if="show.bags && snowMeshes.length">
        <g v-for="m in snowMeshes" :key="m.bag.id">
          <polygon
            v-for="(side, j) in m.sides"
            :key="`ss-${m.bag.id}-${j}`"
            :points="side"
            :fill="riskFill[m.bag.risk] ?? '#e11b11'"
            :fill-opacity="0.35"
            stroke="none"
          />
          <polygon
            v-for="(layer, j) in m.heatLayers"
            :key="`hl-${m.bag.id}-${j}`"
            :points="layer.points"
            :fill="riskFill[m.bag.risk] ?? '#e11b11'"
            :fill-opacity="layer.opacity"
            stroke="none"
          />
          <polygon
            :points="m.top"
            :fill="riskFill[m.bag.risk] ?? '#e11b11'"
            :fill-opacity="0.82"
            :stroke="riskLine[m.bag.risk] ?? '#c41212'"
            stroke-width="1"
            stroke-dasharray="4 3"
          />
        </g>
      </g>

      <g v-if="show.sensors && calculation?.sensors?.length">
        <g v-for="s in calculation.sensors" :key="s.id">
          <line
            :x1="T(s.x, s.y, ROOF_ELEVATION)[0]"
            :y1="T(s.x, s.y, ROOF_ELEVATION)[1]"
            :x2="T(s.x, s.y, ROOF_ELEVATION + 18)[0]"
            :y2="T(s.x, s.y, ROOF_ELEVATION + 18)[1]"
            stroke="var(--red-60)"
            stroke-width="2.5"
          />
          <circle
            :cx="T(s.x, s.y, ROOF_ELEVATION + 18)[0]"
            :cy="T(s.x, s.y, ROOF_ELEVATION + 18)[1]"
            r="7"
            fill="var(--red-60)"
            stroke="#fff"
            stroke-width="2"
          />
        </g>
      </g>

      <text x="24" y="32" font-size="13" font-weight="700" fill="var(--content-tertiary-enabled)">3D · изометрия</text>
      <text x="24" y="50" font-size="11" fill="var(--content-tertiary-enabled)">Кровля: отм. 0 · высота снега — тепловая карта</text>
    </svg>
  </div>
</template>

<style scoped>
.scene3d {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
