<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import type { DrawSession, EditTarget } from '@/composables/useRoofDrawing'
import {
  MIN_RADIUS,
  MIN_RECT,
  PX_PER_M,
  closedPolylineLengthPx,
  formatLengthM,
  roofEdgeSegments,
  moveBagPoly,
  moveCircle,
  moveRect,
  moveVertex,
  orthogonalPoint,
  polylineLengthPx,
  rectDragWithOrthogonal,
  rectFromDrag,
  rectSidePoints,
  resizeBagPoly,
  resizeCircle,
  resizeRect,
  segmentLengthPx,
  svgPointFromEvent,
  bagPolyBBox,
} from '@/composables/useRoofDrawing'
import type { GeometryData, CalculationData, Obstacle } from '@/types'
import WindRose from '@/components/WindRose.vue'
const RoofScene3D = defineAsyncComponent(() => import('@/components/RoofScene3D.vue'))

const props = defineProps<{
  geometry: GeometryData
  calculation?: CalculationData | null
  layers?: { roof?: boolean; obstacles?: boolean; bags?: boolean; sensors?: boolean; wind?: boolean; underlay?: boolean; walkway?: boolean; parapet?: boolean }
  northDeg?: number
  underlayUrl?: string
  /** Размещение подложки в координатах холста (для совмещения с распознанной геометрией). */
  underlayTransform?: { x: number; y: number; w: number; h: number } | null
  /** Окно отображения (zoom-to-fit): viewBox холста. Геометрия в реальном масштабе
   *  мелкая — этим окном приближаем её к рабочей области, не меняя координат. */
  fitBox?: { x: number; y: number; w: number; h: number } | null
  view3d?: boolean
  editable?: boolean
  editableSensors?: boolean
  drawSession?: DrawSession | null
  editTarget?: EditTarget | null
  previewWindRose?: CalculationData['windRose']
  showParapet?: boolean
  orthogonal?: boolean
  transparentBg?: boolean
  selectedBagId?: string | null
  selectedSensorId?: string | null
  highlightedSideIndex?: number | null
  editableBags?: boolean
  /** Let map underlay receive wheel/drag when true. */
  pointerPassthrough?: boolean
}>()

const emit = defineEmits<{
  roofChange: [points: number[][]]
  walkwayChange: [points: number[][]]
  obstacleAdd: [obstacle: Obstacle]
  obstacleChange: [obstacle: Obstacle]
  obstacleSelect: [id: string]
  drawFinish: []
  drawCancel: []
  editClear: []
  sensorMove: [id: string, x: number, y: number]
  sensorSelect: [id: string]
  bagSelect: [id: string]
  bagChange: [id: string, poly: number[][]]
}>()

const riskColors: Record<string, { fill: string; soft: string; line: string }> = {
  critical: { fill: 'var(--red-60)', soft: 'var(--red-10)', line: 'var(--red-65)' },
  high: { fill: 'var(--orange-40)', soft: 'var(--orange-10)', line: 'var(--orange-50)' },
  medium: { fill: 'var(--yellow-30)', soft: 'var(--yellow-10)', line: 'var(--yellow-40)' },
}

const svgRef = ref<SVGSVGElement | null>(null)
const sensorDragging = ref<string | null>(null)
const bagDrag = ref<
  | { kind: 'corner'; id: string; corner: number }
  | { kind: 'move'; id: string; start: [number, number]; origPoly: number[][] }
  | null
>(null)

type PolyDraw = { points: number[][] }
type RectDraw = { start: [number, number]; current: [number, number] }
type CircleDraw = { center: [number, number]; current: [number, number] }

const polyDraft = ref<PolyDraw | null>(null)
const rectDraft = ref<RectDraw | null>(null)
const circleDraft = ref<CircleDraw | null>(null)
const cursorPt = ref<[number, number] | null>(null)

type EditDrag =
  | { kind: 'vertex'; target: 'roof' | 'walkway' | 'polyline'; obstacleId?: string; index: number }
  | { kind: 'rect-move'; id: string; start: [number, number]; origX: number; origY: number }
  | { kind: 'rect-corner'; id: string; corner: number }
  | { kind: 'circle-move'; id: string; start: [number, number]; origCx: number; origCy: number }
  | { kind: 'circle-radius'; id: string }

const editDrag = ref<EditDrag | null>(null)

const show = computed(() => ({
  roof: props.layers?.roof !== false,
  obstacles: props.layers?.obstacles !== false,
  bags: props.layers?.bags !== false,
  sensors: props.layers?.sensors !== false,
  wind: props.layers?.wind !== false,
  underlay: props.layers?.underlay !== false,
  walkway: props.layers?.walkway !== false,
  parapet: props.layers?.parapet !== false,
}))

// Бокс подложки: по умолчанию весь холст (ручной режим), либо заданный трансформ
// из распознавания (чтобы подложка совпала с геометрией в реальном масштабе).
const ulBox = computed(() => props.underlayTransform ?? { x: 0, y: 0, w: 1000, h: 680 })

// viewBox: по умолчанию весь холст; при наличии fitBox приближаем к нему (zoom вида).
const viewBox = computed(() => {
  const f = props.fitBox
  return f ? `${f.x} ${f.y} ${f.w} ${f.h}` : '0 0 1000 680'
})
// Коэффициент зума: делим на него толщины линий, радиусы ручек, маркеры и подписи,
// чтобы при приближении они оставались нормального экранного размера (1 без зума).
const fz = computed(() => (props.fitBox ? 1000 / props.fitBox.w : 1))

const isDrawing = computed(() => !!props.drawSession && props.editable)
const isEditing = computed(() => !!props.editTarget && props.editable && !props.drawSession)
const crosshair = computed(() => isDrawing.value)

const selectedObstacleId = computed(() => {
  const t = props.editTarget
  if (t && typeof t === 'object' && 'obstacleId' in t) return t.obstacleId
  return null
})

const roofSelected = computed(() => props.editTarget === 'roof')

function ptsStr(pts: number[][]) {
  return pts.map((p) => p.join(',')).join(' ')
}

function polyCentroid(pts: number[][]) {
  const n = pts.length || 1
  return [
    pts.reduce((s, p) => s + p[0], 0) / n,
    pts.reduce((s, p) => s + p[1], 0) / n,
  ]
}

const bagRiskKeys = ['critical', 'high', 'medium'] as const

function getSvg(): SVGSVGElement | null {
  return svgRef.value
}

function resetDrafts() {
  polyDraft.value = null
  rectDraft.value = null
  circleDraft.value = null
  cursorPt.value = null
}

watch(() => props.drawSession, (s) => {
  resetDrafts()
  if (s?.tool === 'polyline') polyDraft.value = { points: [] }
})

function snapDrawPoint(pt: [number, number]): [number, number] {
  if (!props.orthogonal || !polyDraft.value?.points.length) return pt
  const anchor = polyDraft.value.points[polyDraft.value.points.length - 1] as [number, number]
  return orthogonalPoint(anchor, pt)
}

function onCanvasMove(e: MouseEvent) {
  const svg = getSvg()
  if (!svg) return

  if (sensorDragging.value) {
    const p = svgPointFromEvent(svg, e)
    emit('sensorMove', sensorDragging.value, p[0], p[1])
    return
  }

  if (bagDrag.value) {
    const bag = props.calculation?.snowbags?.find((b) => b.id === bagDrag.value!.id)
    if (bag?.poly?.length) {
      const p = svgPointFromEvent(svg, e)
      if (bagDrag.value.kind === 'move') {
        const dx = p[0] - bagDrag.value.start[0]
        const dy = p[1] - bagDrag.value.start[1]
        const poly = moveBagPoly(bagDrag.value.origPoly, dx, dy)
        emit('bagChange', bagDrag.value.id, poly)
      } else {
        const poly = resizeBagPoly(bag.poly, bagDrag.value.corner, p)
        emit('bagChange', bagDrag.value.id, poly)
      }
    }
    return
  }

  let pt = svgPointFromEvent(svg, e)
  if (isDrawing.value && props.drawSession?.tool === 'polyline') {
    pt = snapDrawPoint(pt)
  }

  cursorPt.value = pt

  if (editDrag.value) {
    handleEditDrag(pt)
    return
  }

  if (rectDraft.value) {
    const end = props.orthogonal
      ? rectDragWithOrthogonal(rectDraft.value.start, pt, true)
      : pt
    rectDraft.value = { ...rectDraft.value, current: end }
  } else if (circleDraft.value && circleDraft.value.center) {
    circleDraft.value = { ...circleDraft.value, current: pt }
  }
}

function handleEditDrag(pt: [number, number]) {
  const drag = editDrag.value
  if (!drag) return

  if (drag.kind === 'vertex') {
    if (drag.target === 'polyline' && drag.obstacleId) {
      const obs = props.geometry.obstacles?.find((o) => o.id === drag.obstacleId)
      if (obs?.points) {
        const next = moveVertex(obs.points, drag.index, pt)
        emit('obstacleChange', { ...obs, points: next })
      }
      return
    }
    const pts = drag.target === 'roof'
      ? props.geometry.roof ?? []
      : props.geometry.walkway ?? []
    const next = moveVertex(pts, drag.index, pt)
    if (drag.target === 'roof') emit('roofChange', next)
    else emit('walkwayChange', next)
    return
  }

  const obs = props.geometry.obstacles?.find((o) => o.id === drag.id)
  if (!obs) return

  if (drag.kind === 'rect-move') {
    const dx = pt[0] - drag.start[0]
    const dy = pt[1] - drag.start[1]
    emit('obstacleChange', moveRect(
      { ...obs, x: drag.origX, y: drag.origY },
      dx,
      dy,
    ))
  } else if (drag.kind === 'rect-corner') {
    emit('obstacleChange', resizeRect(obs, drag.corner, pt))
  } else if (drag.kind === 'circle-move') {
    emit('obstacleChange', moveCircle(obs, drag.origCx + pt[0] - drag.start[0], drag.origCy + pt[1] - drag.start[1]))
  } else if (drag.kind === 'circle-radius') {
    emit('obstacleChange', resizeCircle(obs, pt))
  }
}

function onCanvasUp() {
  sensorDragging.value = null
  bagDrag.value = null
  editDrag.value = null

  if (rectDraft.value && props.drawSession?.tool === 'rect') {
    finishRectDraw()
  } else if (circleDraft.value && props.drawSession?.tool === 'circle') {
    finishCircleDraw()
  }
}

function onCanvasDown(e: MouseEvent) {
  if (!props.editable || props.view3d) return
  const svg = getSvg()
  if (!svg || e.button !== 0) return

  const pt = svgPointFromEvent(svg, e)

  if (props.drawSession) {
    e.preventDefault()
    handleDrawClick(pt)
    return
  }

  if (props.editTarget === 'roof' || props.editTarget === 'walkway') {
    return
  }

  if (!selectedObstacleId.value) {
    emit('editClear')
  }
}

function handleDrawClick(pt: [number, number]) {
  const session = props.drawSession
  if (!session) return

  const drawPt = session.tool === 'polyline' ? snapDrawPoint(pt) : pt

  if (session.tool === 'polyline') {
    if (!polyDraft.value) polyDraft.value = { points: [] }
    polyDraft.value.points.push([...drawPt])
    return
  }

  if (session.tool === 'rect') {
    if (!rectDraft.value) rectDraft.value = { start: drawPt, current: drawPt }
    return
  }

  if (session.tool === 'circle') {
    if (!circleDraft.value) circleDraft.value = { center: drawPt, current: drawPt }
  }
}

function finishPolyline() {
  const session = props.drawSession
  const pts = polyDraft.value?.points ?? []
  const minPts = session?.target === 'roof' ? 3 : 2
  if (!session || pts.length < minPts) return

  if (session.target === 'roof') emit('roofChange', pts.map((p) => [...p]))
  else if (session.target === 'walkway') emit('walkwayChange', pts.map((p) => [...p]))
  else if (session.target === 'obstacle') {
    emit('obstacleAdd', {
      id: `poly-${Date.now()}`,
      type: session.typeName ?? session.label,
      short: session.short ?? session.label,
      name: session.short ?? session.label,
      shape: 'polyline',
      points: pts.map((p) => [...p]),
      hM: session.hM ?? 1,
    })
  }

  resetDrafts()
  emit('drawFinish')
}

function finishRectDraw() {
  const draft = rectDraft.value
  const session = props.drawSession
  if (!draft || !session || session.target !== 'obstacle') {
    rectDraft.value = null
    return
  }
  const { x, y, w, h } = rectFromDrag(draft.start, draft.current)
  if (w < MIN_RECT || h < MIN_RECT) {
    rectDraft.value = null
    return
  }
  emit('obstacleAdd', {
    id: `rect-${Date.now()}`,
    type: session.typeName ?? session.label,
    short: session.short ?? session.label.slice(0, 12),
    shape: 'rect',
    x, y, w, h,
    hM: session.hM ?? 2,
  })
  rectDraft.value = null
  emit('drawFinish')
}

function finishCircleDraw() {
  const draft = circleDraft.value
  const session = props.drawSession
  if (!draft || !session || session.target !== 'obstacle') {
    circleDraft.value = null
    return
  }
  const cx = draft.center[0]
  const cy = draft.center[1]
  const r = Math.max(MIN_RADIUS, Math.hypot(draft.current[0] - cx, draft.current[1] - cy))
  emit('obstacleAdd', {
    id: `circle-${Date.now()}`,
    type: session.typeName ?? session.label,
    short: session.short ?? session.label.slice(0, 12),
    shape: 'circle',
    cx, cy, r,
  })
  circleDraft.value = null
  emit('drawFinish')
}

function onCanvasDblClick(e: MouseEvent) {
  if (!props.drawSession || props.drawSession.tool !== 'polyline') return
  e.preventDefault()
  finishPolyline()
}

function onKeyDown(e: KeyboardEvent) {
  if (!props.editable) return
  if (e.key === 'Escape' && props.drawSession) {
    resetDrafts()
    emit('drawCancel')
  }
  if (e.key === 'Enter' && props.drawSession?.tool === 'polyline') {
    finishPolyline()
  }
}

function startVertexDrag(target: 'roof' | 'walkway' | 'polyline', index: number, e: MouseEvent, obstacleId?: string) {
  if (!isEditing.value) return
  e.stopPropagation()
  e.preventDefault()
  editDrag.value = { kind: 'vertex', target, index, obstacleId }
}

function startRectCornerDrag(id: string, corner: number, e: MouseEvent) {
  if (!isEditing.value) return
  e.stopPropagation()
  e.preventDefault()
  editDrag.value = { kind: 'rect-corner', id, corner }
}

function startRectMove(o: Obstacle, e: MouseEvent) {
  if (!isEditing.value || selectedObstacleId.value !== o.id) return
  const svg = getSvg()
  if (!svg) return
  e.stopPropagation()
  const pt = svgPointFromEvent(svg, e)
  editDrag.value = {
    kind: 'rect-move',
    id: o.id,
    start: pt,
    origX: o.x ?? 0,
    origY: o.y ?? 0,
  }
}

function startCircleMove(o: Obstacle, e: MouseEvent) {
  if (!isEditing.value || selectedObstacleId.value !== o.id) return
  const svg = getSvg()
  if (!svg) return
  e.stopPropagation()
  e.preventDefault()
  const pt = svgPointFromEvent(svg, e)
  editDrag.value = {
    kind: 'circle-move',
    id: o.id,
    start: pt,
    origCx: o.cx ?? 0,
    origCy: o.cy ?? 0,
  }
}

function startCircleRadiusDrag(id: string, e: MouseEvent) {
  if (!isEditing.value) return
  e.stopPropagation()
  e.preventDefault()
  editDrag.value = { kind: 'circle-radius', id }
}

function onSensorDown(id: string, e: MouseEvent) {
  if (!props.editableSensors) return
  e.stopPropagation()
  emit('sensorSelect', id)
  sensorDragging.value = id
  e.preventDefault()
}

function startBagCornerDrag(id: string, corner: number, e: MouseEvent) {
  if (!props.editableBags) return
  e.stopPropagation()
  e.preventDefault()
  bagDrag.value = { kind: 'corner', id, corner }
}

function startBagMove(bag: { id: string; poly?: number[][] }, e: MouseEvent) {
  if (!props.editableBags) return
  e.stopPropagation()
  e.preventDefault()
  if (props.selectedBagId !== bag.id) {
    emit('bagSelect', bag.id)
    return
  }
  const svg = getSvg()
  if (!svg || !bag.poly?.length) return
  const pt = svgPointFromEvent(svg, e)
  bagDrag.value = {
    kind: 'move',
    id: bag.id,
    start: pt,
    origPoly: bag.poly.map((p) => [...p] as [number, number]),
  }
}

function bagCornerPoints(poly: number[][]): number[][] {
  const { x, y, w, h } = bagPolyBBox(poly)
  return [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
}

const previewRect = computed(() => {
  if (!rectDraft.value) return null
  return rectFromDrag(rectDraft.value.start, rectDraft.value.current)
})

const previewCircle = computed(() => {
  if (!circleDraft.value) return null
  const { center, current } = circleDraft.value
  return {
    cx: center[0],
    cy: center[1],
    r: Math.max(MIN_RADIUS, Math.hypot(current[0] - center[0], current[1] - center[1])),
  }
})

const polylinePreview = computed(() => {
  if (!polyDraft.value?.points.length) return null
  const pts = [...polyDraft.value.points]
  if (cursorPt.value) pts.push(cursorPt.value)
  return pts
})

const draftLengthLabel = computed(() => {
  if (!polylinePreview.value || polylinePreview.value.length < 2) return ''
  const session = props.drawSession
  const px = session?.target === 'roof' && polyDraft.value?.points.length
    && polyDraft.value.points.length >= 3
    ? closedPolylineLengthPx(polylinePreview.value.slice(0, -1))
    : polylineLengthPx(polylinePreview.value)
  return formatLengthM(px)
})

function segmentMidpoint(a: number[], b: number[]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

function roofSegmentLabels(points: number[][]) {
  const labels: Array<{ x: number; y: number; text: string }> = []
  for (const [a, b] of roofEdgeSegments(points)) {
    const [x, y] = segmentMidpoint(a, b)
    labels.push({ x, y: y - 8 / fz.value, text: formatLengthM(segmentLengthPx(a, b)) })
  }
  return labels
}

function openPolylineLabels(points: number[][]) {
  if (points.length < 2) return []
  const labels: Array<{ x: number; y: number; text: string }> = []
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]
    const b = points[i]
    const [x, y] = segmentMidpoint(a, b)
    labels.push({ x, y: y - 8 / fz.value, text: formatLengthM(segmentLengthPx(a, b)) })
  }
  return labels
}

function elementSegmentLabels(o: Obstacle) {
  if (o.shape === 'rect' && o.w && o.h) return roofSegmentLabels(rectSidePoints(o))
  if (o.shape === 'polyline' && o.points?.length) {
    if (o.points.length >= 3) return roofSegmentLabels(o.points)
    return openPolylineLabels(o.points)
  }
  return []
}

const displayWindRose = computed(() => {
  if (props.previewWindRose?.length) return props.previewWindRose
  return props.calculation?.windRose
})
const walkwaySelected = computed(() => props.editTarget === 'walkway')

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <RoofScene3D
    v-if="view3d"
    :geometry="geometry"
    :calculation="calculation"
    :layers="layers"
  />

  <div v-else class="wrap" :class="{ crosshair, 'pointer-passthrough': pointerPassthrough, 'map-edit-mode': pointerPassthrough && isEditing }">
    <svg
      ref="svgRef"
      :viewBox="viewBox"
      class="canvas"
      :class="{ 'canvas--overlay': transparentBg }"
      @mousedown="onCanvasDown"
      @mousemove="onCanvasMove"
      @mouseup="onCanvasUp"
      @mouseleave="onCanvasUp"
      @dblclick="onCanvasDblClick"
    >
      <rect x="0" y="0" width="1000" height="680" :fill="transparentBg ? 'transparent' : 'var(--neutral-15)'" />

      <defs v-if="show.bags && calculation?.snowbags?.length">
        <radialGradient
          v-for="risk in bagRiskKeys"
          :id="`baggrad-${risk}`"
          :key="risk"
          cx="50%"
          cy="50%"
          r="62%"
        >
          <stop offset="0%" :stop-color="riskColors[risk].fill" stop-opacity="0.62" />
          <stop offset="55%" :stop-color="riskColors[risk].fill" stop-opacity="0.34" />
          <stop offset="100%" :stop-color="riskColors[risk].fill" stop-opacity="0" />
        </radialGradient>
        <filter id="bagblur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <clipPath v-if="geometry.roof?.length" id="roofclip">
          <polygon :points="ptsStr(geometry.roof)" />
        </clipPath>
      </defs>

      <image
        v-if="show.underlay && underlayUrl"
        :href="underlayUrl"
        :x="ulBox.x"
        :y="ulBox.y"
        :width="ulBox.w"
        :height="ulBox.h"
        :opacity="transparentBg ? 1 : 0.72"
        preserveAspectRatio="xMidYMid meet"
      />

      <g v-if="show.roof && geometry.roof?.length">
        <polygon
          :points="ptsStr(geometry.roof)"
          fill="#fff"
          :stroke="roofSelected ? 'var(--red-60)' : 'var(--neutral-65)'"
          :stroke-width="(roofSelected ? 3 : 2.5) / fz"
        />
        <polygon
          v-if="show.parapet && showParapet"
          :points="ptsStr(geometry.roof)"
          fill="none"
          stroke="var(--neutral-45)"
          :stroke-width="7 / fz"
          stroke-opacity="0.35"
          stroke-linejoin="round"
          pointer-events="none"
        />
        <template v-if="roofSelected && editable">
          <circle
            v-for="(p, i) in geometry.roof"
            :key="`rv-${i}`"
            :cx="p[0]"
            :cy="p[1]"
            :r="6 / fz"
            fill="#fff"
            stroke="var(--red-60)"
            :stroke-width="2 / fz"
            class="handle map-interactive"
            @mousedown="startVertexDrag('roof', i, $event)"
          />
        </template>
        <template v-if="geometry.roof?.length && highlightedSideIndex != null">
          <line
            v-for="(seg, i) in roofEdgeSegments(geometry.roof)"
            :key="`hl-${i}`"
            :x1="seg[0][0]"
            :y1="seg[0][1]"
            :x2="seg[1][0]"
            :y2="seg[1][1]"
            stroke="var(--red-60)"
            :stroke-width="highlightedSideIndex === i ? 10 : 0"
            stroke-linecap="round"
            stroke-opacity="0.75"
            pointer-events="none"
          />
        </template>
        <text
          v-for="(lbl, i) in roofSegmentLabels(geometry.roof ?? [])"
          :key="`rl-${i}`"
          :x="lbl.x"
          :y="lbl.y"
          text-anchor="middle"
          :font-size="10 / fz"
          font-weight="700"
          fill="var(--red-60)"
          pointer-events="none"
        >{{ lbl.text }}</text>
      </g>

      <g v-if="show.walkway && geometry.walkway?.length">
        <polyline
          :points="ptsStr(geometry.walkway)"
          fill="none"
          :stroke="walkwaySelected ? 'var(--red-60)' : 'var(--neutral-45)'"
          :stroke-width="walkwaySelected ? 3 : 2"
          stroke-dasharray="8 6"
        />
        <template v-if="walkwaySelected && editable">
          <circle
            v-for="(p, i) in geometry.walkway"
            :key="`wv-${i}`"
            :cx="p[0]"
            :cy="p[1]"
            :r="6 / fz"
            fill="#fff"
            stroke="var(--red-60)"
            :stroke-width="2 / fz"
            class="handle map-interactive"
            @mousedown="startVertexDrag('walkway', i, $event)"
          />
        </template>
      </g>

      <g v-if="show.obstacles && geometry.obstacles?.length">
        <template v-for="o in geometry.obstacles" :key="o.id">
          <g
            :class="{ selectable: editable && !drawSession }"
            @click.stop="editable && !drawSession && emit('obstacleSelect', o.id)"
          >
            <rect
              v-if="o.shape === 'rect' && o.w && o.h"
              :x="o.x" :y="o.y" :width="o.w" :height="o.h"
              :fill="selectedObstacleId === o.id ? 'var(--red-10)' : 'var(--neutral-20)'"
              :stroke="selectedObstacleId === o.id ? 'var(--red-60)' : 'var(--neutral-55)'"
              :stroke-width="(selectedObstacleId === o.id ? 2.5 : 1.5) / fz"
              @mousedown="startRectMove(o, $event)"
            />
            <text
              v-if="o.shape === 'rect' && o.w && o.h && o.short"
              :x="(o.x ?? 0) + (o.w ?? 0) / 2"
              :y="(o.y ?? 0) + (o.h ?? 0) / 2 + 4 / fz"
              text-anchor="middle"
              :font-size="11 / fz"
              font-weight="600"
              fill="var(--content-secondary-enabled)"
              pointer-events="none"
            >{{ o.short }}</text>
            <text
              v-if="o.shape === 'rect' && o.w && o.h && editable"
              :x="(o.x ?? 0) + (o.w ?? 0) / 2"
              :y="(o.y ?? 0) + (o.h ?? 0) / 2 + 18 / fz"
              text-anchor="middle"
              :font-size="10 / fz"
              font-weight="700"
              fill="var(--red-60)"
              pointer-events="none"
            >h {{ (o.hM ?? 0).toFixed(1) }} м</text>
            <circle
              v-else-if="o.shape === 'circle' && o.r"
              :cx="o.cx" :cy="o.cy" :r="o.r / fz"
              :fill="selectedObstacleId === o.id ? 'var(--blue-10)' : 'var(--blue-40)'"
              :stroke="selectedObstacleId === o.id ? 'var(--red-60)' : 'var(--blue-60)'"
              :stroke-width="(selectedObstacleId === o.id ? 2.5 : 1.5) / fz"
              @mousedown="startCircleMove(o, $event)"
            />
            <polygon
              v-else-if="o.shape === 'polyline' && o.points && o.points.length >= 3"
              :points="ptsStr(o.points)"
              fill="none"
              :stroke="selectedObstacleId === o.id ? 'var(--red-60)' : 'var(--orange-40)'"
              :stroke-width="(selectedObstacleId === o.id ? 3 : 2) / fz"
            />
            <polyline
              v-else-if="o.shape === 'polyline' && o.points?.length"
              :points="ptsStr(o.points)"
              fill="none"
              :stroke="selectedObstacleId === o.id ? 'var(--red-60)' : 'var(--orange-40)'"
              :stroke-width="(selectedObstacleId === o.id ? 3 : 2) / fz"
            />
            <template v-if="selectedObstacleId === o.id && editable && !drawSession && o.shape === 'polyline' && o.points?.length">
              <circle
                v-for="(p, i) in o.points"
                :key="`pv-${o.id}-${i}`"
                :cx="p[0]"
                :cy="p[1]"
                :r="6 / fz"
                fill="#fff"
                stroke="var(--red-60)"
                :stroke-width="2 / fz"
                class="handle map-interactive"
                @mousedown="startVertexDrag('polyline', i, $event, o.id)"
              />
            </template>
            <text
              v-for="(lbl, i) in elementSegmentLabels(o)"
              :key="`pl-${o.id}-${i}`"
              :x="lbl.x"
              :y="lbl.y"
              text-anchor="middle"
              :font-size="10 / fz"
              font-weight="700"
              fill="var(--orange-40)"
              pointer-events="none"
            >{{ lbl.text }}</text>
            <template v-if="selectedObstacleId === o.id && editable && !drawSession && o.shape === 'rect' && o.w && o.h">
              <rect
                v-for="(p, i) in [[o.x, o.y], [o.x! + o.w!, o.y], [o.x, o.y! + o.h!], [o.x! + o.w!, o.y! + o.h!]]"
                :key="`rc-${i}`"
                :x="p[0]! - 4.5 / fz"
                :y="p[1]! - 4.5 / fz"
                :width="9 / fz"
                :height="9 / fz"
                fill="#fff"
                stroke="var(--red-60)"
                :stroke-width="2 / fz"
                class="handle corner"
                @mousedown="startRectCornerDrag(o.id, i, $event)"
              />
            </template>
            <template v-if="selectedObstacleId === o.id && editable && !drawSession && o.shape === 'circle' && o.r">
              <circle
                :cx="o.cx"
                :cy="o.cy"
                :r="5 / fz"
                fill="#fff"
                stroke="var(--red-60)"
                :stroke-width="2 / fz"
                class="handle map-interactive"
                @mousedown="startCircleMove(o, $event)"
              />
              <circle
                :cx="(o.cx ?? 0) + (o.r ?? 0) / fz"
                :cy="o.cy"
                :r="5 / fz"
                fill="#fff"
                stroke="var(--red-60)"
                :stroke-width="2 / fz"
                class="handle map-interactive"
                @mousedown="startCircleRadiusDrag(o.id, $event)"
              />
            </template>
          </g>
        </template>
      </g>

      <!-- Draw previews -->
      <g v-if="isDrawing" pointer-events="none">
        <polyline
          v-if="polylinePreview"
          :points="ptsStr(polylinePreview)"
          fill="none"
          stroke="var(--red-60)"
          :stroke-width="2 / fz"
          :stroke-dasharray="`${6 / fz} ${4 / fz}`"
        />
        <circle
          v-for="(p, i) in polyDraft?.points ?? []"
          :key="`dp-${i}`"
          :cx="p[0]"
          :cy="p[1]"
          :r="4 / fz"
          fill="var(--red-60)"
        />
        <text
          v-if="draftLengthLabel"
          :x="polylinePreview?.[polylinePreview.length - 1]?.[0] ?? 500"
          :y="(polylinePreview?.[polylinePreview.length - 1]?.[1] ?? 340) - 12 / fz"
          text-anchor="middle"
          :font-size="12 / fz"
          font-weight="800"
          fill="var(--red-60)"
        >{{ draftLengthLabel }}</text>
        <text
          v-for="(lbl, i) in openPolylineLabels(polylinePreview ?? [])"
          :key="`dl-${i}`"
          :x="lbl.x"
          :y="lbl.y"
          text-anchor="middle"
          :font-size="10 / fz"
          font-weight="700"
          fill="var(--red-60)"
        >{{ lbl.text }}</text>
        <rect
          v-if="previewRect"
          :x="previewRect.x"
          :y="previewRect.y"
          :width="previewRect.w"
          :height="previewRect.h"
          fill="rgba(255,60,60,0.1)"
          stroke="var(--red-60)"
          :stroke-width="2 / fz"
          :stroke-dasharray="`${6 / fz} ${4 / fz}`"
        />
        <circle
          v-if="previewCircle"
          :cx="previewCircle.cx"
          :cy="previewCircle.cy"
          :r="previewCircle.r"
          fill="rgba(59,130,246,0.15)"
          stroke="var(--blue-60)"
          :stroke-width="2 / fz"
          :stroke-dasharray="`${6 / fz} ${4 / fz}`"
        />
      </g>

      <g v-if="show.bags && calculation?.snowbags?.length">
        <g v-if="geometry.roof?.length" clip-path="url(#roofclip)">
          <polygon
            v-for="bag in calculation.snowbags"
            :key="`${bag.id}-fill`"
            :points="ptsStr(bag.poly)"
            :fill="`url(#baggrad-${bag.risk})`"
            filter="url(#bagblur)"
          />
        </g>
        <template v-else>
          <polygon
            v-for="bag in calculation.snowbags"
            :key="`${bag.id}-fill`"
            :points="ptsStr(bag.poly)"
            :fill="`url(#baggrad-${bag.risk})`"
            filter="url(#bagblur)"
          />
        </template>
        <g
          v-for="bag in calculation.snowbags"
          :key="bag.id"
          class="bag-zone map-interactive"
          :class="{ selected: selectedBagId === bag.id, selectable: editableBags }"
        >
          <polygon
            :points="ptsStr(bag.poly)"
            fill="transparent"
            :stroke="riskColors[bag.risk]?.line ?? 'var(--red-60)'"
            :stroke-width="selectedBagId === bag.id ? 2.5 : 1.1"
            stroke-dasharray="5 4"
            :stroke-opacity="selectedBagId === bag.id ? 0.95 : 0.45"
            @mousedown.stop="startBagMove(bag, $event)"
          />
          <text
            :x="polyCentroid(bag.poly)[0]"
            :y="polyCentroid(bag.poly)[1] + 4"
            text-anchor="middle"
            font-size="12"
            font-weight="800"
            :fill="riskColors[bag.risk]?.line ?? 'var(--red-60)'"
          >{{ bag.id }}</text>
          <template v-if="selectedBagId === bag.id && editableBags && bag.poly?.length">
            <rect
              v-for="(p, i) in bagCornerPoints(bag.poly)"
              :key="`bc-${bag.id}-${i}`"
              :x="p[0] - 4.5"
              :y="p[1] - 4.5"
              width="9"
              height="9"
              fill="#fff"
              stroke="var(--red-60)"
              stroke-width="2"
              class="handle corner map-interactive"
              @mousedown.stop="startBagCornerDrag(bag.id, i, $event)"
            />
          </template>
        </g>
      </g>

      <g v-if="show.sensors && calculation?.sensors?.length">
        <g
          v-for="s in calculation.sensors"
          :key="s.id"
          class="map-interactive"
          :class="{ draggable: editableSensors, selected: selectedSensorId === s.id }"
          @mousedown="onSensorDown(s.id, $event)"
        >
          <circle :cx="s.x" :cy="s.y" r="14" fill="#fff" :stroke="selectedSensorId === s.id ? 'var(--red-65)' : 'var(--red-60)'" stroke-width="2" />
          <circle :cx="s.x" :cy="s.y" r="5" fill="var(--red-60)" />
          <text :x="s.x" :y="s.y - 18" text-anchor="middle" font-size="11" font-weight="700" fill="var(--content-primary-a-enabled)">{{ s.id }}</text>
        </g>
      </g>

      <foreignObject v-if="show.wind && displayWindRose?.length" x="850" y="10" width="150" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <WindRose :data="displayWindRose" :north="northDeg" :size="140" />
        </div>
      </foreignObject>
    </svg>
  </div>
</template>

<style scoped>
.wrap { width: 100%; height: 100%; display: flex; }
.wrap.pointer-passthrough { pointer-events: none; }
/* Parent pointer-events:none does not block SVG children (default auto) — disable the canvas explicitly. */
.wrap.pointer-passthrough .canvas { pointer-events: none; }
.wrap.pointer-passthrough.map-edit-mode :deep(.map-interactive) { pointer-events: auto; }
.wrap.crosshair { cursor: crosshair; }
.canvas { width: 100%; height: 100%; display: block; }
.canvas--overlay { background: transparent; }
.draggable { cursor: grab; }
.draggable:active { cursor: grabbing; }
.selectable { cursor: pointer; }
.handle { cursor: grab; }
.handle.corner { cursor: nwse-resize; }
.handle:active { cursor: grabbing; }
</style>
