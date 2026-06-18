import type { Obstacle } from '@/types'

export const SNAP = 10
export const MIN_RECT = 20
export const MIN_RADIUS = 5
export const VIEW_W = 1000
export const VIEW_H = 680

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
