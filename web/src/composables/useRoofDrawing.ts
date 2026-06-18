import type { Obstacle } from '@/types'

export const SNAP = 10
export const MIN_RECT = 20
export const MIN_RADIUS = 5
export const VIEW_W = 1000
export const VIEW_H = 680
/** Pixels per meter on the plan canvas (matches design prototype). */
export const PX_PER_M = 6.6

export type DrawTool = 'polyline' | 'rect' | 'circle'

export type DrawTargetKind = 'roof' | 'walkway' | 'obstacle'

export interface DrawSession {
  tool: DrawTool
  target: DrawTargetKind
  label: string
  short?: string
  typeName?: string
  hM?: number
}

export type EditTarget = 'roof' | 'walkway' | { obstacleId: string }

export function snap(v: number, step = SNAP): number {
  return Math.round(v / step) * step
}

export function snapPoint(x: number, y: number, step = SNAP): [number, number] {
  return [snap(x, step), snap(y, step)]
}

export function segmentLengthPx(a: number[], b: number[]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1])
}

export function polylineLengthPx(points: number[][]): number {
  if (points.length < 2) return 0
  let total = 0
  for (let i = 1; i < points.length; i += 1) {
    total += segmentLengthPx(points[i - 1], points[i])
  }
  return total
}

export function closedPolylineLengthPx(points: number[][]): number {
  if (points.length < 2) return polylineLengthPx(points)
  let total = polylineLengthPx(points)
  total += segmentLengthPx(points[points.length - 1], points[0])
  return total
}

export function pxToM(px: number, pxPerM = PX_PER_M): number {
  return px / pxPerM
}

export function formatLengthM(px: number, pxPerM = PX_PER_M): string {
  const m = pxToM(px, pxPerM)
  if (m < 10) return `${m.toFixed(1).replace('.', ',')} м`
  return `${Math.round(m).toLocaleString('ru-RU')} м`
}

export function roofSideCount(points: number[][]): number {
  return points.length >= 3 ? points.length : 0
}

export function sideLabel(index: number): string {
  return `Сторона ${index + 1}`
}

/** Closed polygon: one side per vertex; open polyline: one side per segment. */
export function elementSideCount(points: number[][], closed = true): number {
  if (points.length < 2) return 0
  if (closed) return points.length >= 3 ? points.length : 0
  return points.length - 1
}

/** Constrain pointer to horizontal or vertical axis from anchor. */
export function orthogonalPoint(
  anchor: [number, number],
  pointer: [number, number],
): [number, number] {
  const dx = Math.abs(pointer[0] - anchor[0])
  const dy = Math.abs(pointer[1] - anchor[1])
  if (dx >= dy) return [snap(pointer[0]), anchor[1]]
  return [anchor[0], snap(pointer[1])]
}

export function rectDragWithOrthogonal(
  start: [number, number],
  end: [number, number],
  orthogonal: boolean,
): [number, number] {
  if (!orthogonal) return end
  return orthogonalPoint(start, end)
}

export function clampView(x: number, y: number): [number, number] {
  return [
    Math.max(0, Math.min(VIEW_W, x)),
    Math.max(0, Math.min(VIEW_H, y)),
  ]
}

export function svgPointFromEvent(svg: SVGSVGElement, e: MouseEvent): [number, number] {
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return [0, 0]
  const p = pt.matrixTransform(ctm.inverse())
  return clampView(snap(p.x), snap(p.y))
}

export function rectFromDrag(
  start: [number, number],
  end: [number, number],
  min = MIN_RECT,
): { x: number; y: number; w: number; h: number } {
  let x = Math.min(start[0], end[0])
  let y = Math.min(start[1], end[1])
  let w = Math.abs(end[0] - start[0])
  let h = Math.abs(end[1] - start[1])
  if (w < min) w = min
  if (h < min) h = min
  if (end[0] < start[0]) x = start[0] - w
  if (end[1] < start[1]) y = start[1] - h
  return { x, y, w, h }
}

export function resizeRect(
  o: Obstacle,
  corner: number,
  pointer: [number, number],
  min = MIN_RECT,
): Obstacle {
  const x0 = o.x ?? 0
  const y0 = o.y ?? 0
  const w0 = o.w ?? min
  const h0 = o.h ?? min
  let x = x0
  let y = y0
  let w = w0
  let h = h0
  const [px, py] = pointer

  if (corner === 0) {
    x = px
    y = py
    w = x0 + w0 - px
    h = y0 + h0 - py
  } else if (corner === 1) {
    y = py
    w = px - x0
    h = y0 + h0 - py
  } else if (corner === 2) {
    x = px
    w = x0 + w0 - px
    h = py - y0
  } else {
    w = px - x0
    h = py - y0
  }

  if (w < min) {
    if (corner === 0 || corner === 2) x = x0 + w0 - min
    w = min
  }
  if (h < min) {
    if (corner === 0 || corner === 1) y = y0 + h0 - min
    h = min
  }

  return { ...o, x, y, w, h }
}

export function moveRect(o: Obstacle, dx: number, dy: number): Obstacle {
  return { ...o, x: (o.x ?? 0) + dx, y: (o.y ?? 0) + dy }
}

export function moveCircle(o: Obstacle, cx: number, cy: number): Obstacle {
  return { ...o, cx, cy }
}

export function resizeCircle(o: Obstacle, pointer: [number, number], min = MIN_RADIUS): Obstacle {
  const cx = o.cx ?? 0
  const cy = o.cy ?? 0
  const r = Math.max(min, Math.hypot(pointer[0] - cx, pointer[1] - cy))
  return { ...o, r: snap(r) }
}

export function moveVertex(points: number[][], index: number, pos: [number, number]): number[][] {
  return points.map((p, i) => (i === index ? [...pos] : p))
}

export function parseParapetMm(value: string | undefined): number {
  if (!value) return 600
  const m = value.match(/(\d+)/)
  return m ? Number(m[1]) : 600
}

export function formatParapetMm(mm: number): string {
  return `${Math.round(mm)} мм`
}
