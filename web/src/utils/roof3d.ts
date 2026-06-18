import type { Obstacle, Snowbag } from '@/types'

/** Визуальный масштаб: 1 м высоты → Z единиц в изометрии */
export const Z_PER_METER = 8

export const ROOF_ELEVATION = 0

export function metersToZ(hM: number): number {
  return Math.max(0, hM) * Z_PER_METER
}

export function obstacleVisualHeight(o: Obstacle): number {
  if (o.shape === 'circle') return 0
  if (o.hM != null && o.hM > 0) return metersToZ(o.hM)
  return metersToZ(1.2)
}

export function snowDepthZ(bag: Snowbag): number {
  const byMu = bag.mu * 3.5
  const byRisk = bag.risk === 'critical' ? 16 : bag.risk === 'high' ? 10 : 5
  return Math.min(22, Math.max(byMu, byRisk))
}

export function centroid(pts: number[][]): [number, number] {
  const n = pts.length || 1
  const sx = pts.reduce((s, p) => s + p[0], 0)
  const sy = pts.reduce((s, p) => s + p[1], 0)
  return [sx / n, sy / n]
}

export function shrink(pts: number[][], t: number): number[][] {
  const [cx, cy] = centroid(pts)
  return pts.map(([x, y]) => [cx + (x - cx) * t, cy + (y - cy) * t])
}

export const riskFill: Record<string, string> = {
  critical: '#e11b11',
  high: '#f5a623',
  medium: '#f5d547',
}

export const riskLine: Record<string, string> = {
  critical: '#c41212',
  high: '#d48806',
  medium: '#c9a820',
}

export function obstacleHasHeight(o: Obstacle): boolean {
  return o.shape === 'rect'
}
