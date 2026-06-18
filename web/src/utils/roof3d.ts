import type { GeometryData, Obstacle, Snowbag } from '@/types'

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

/** Max parapet height in meters for snow cap. */
export function maxParapetM(geometry: GeometryData): number {
  const sides = geometry.sideParapets ?? []
  if (!sides.length) return 0.6
  return Math.max(...sides, 0.6)
}

/** Snow depth in meters at plan point, capped by parapet. */
export function snowDepthMAt(
  x: number,
  y: number,
  bags: Snowbag[] | undefined,
  maxParapet: number,
): number {
  let depthM = 0.04
  for (const bag of bags ?? []) {
    if (!pointInPoly(x, y, bag.poly)) continue
    const local = bag.mu * 0.07 + (bag.risk === 'critical' ? 0.38 : bag.risk === 'high' ? 0.24 : 0.14)
    depthM = Math.max(depthM, local)
  }
  return Math.min(depthM, maxParapet * 0.92)
}

export function snowDepthZ(bag: Snowbag, maxParapetM = 0.6): number {
  const byMu = bag.mu * 0.07
  const byRisk = bag.risk === 'critical' ? 0.38 : bag.risk === 'high' ? 0.24 : 0.14
  return metersToZ(Math.min(maxParapetM * 0.92, Math.max(byMu, byRisk)))
}

/** Heat-map color by snow depth in meters (reference legend). */
export function snowDepthColor(depthM: number): number {
  const cm = depthM * 100
  if (cm <= 10) return 0x7ec8e8
  if (cm <= 20) return 0x6ecf8f
  if (cm <= 30) return 0xf5d547
  if (cm <= 50) return 0xf5a623
  return 0xe11b11
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

export function pointInPoly(x: number, y: number, poly: number[][]): boolean {
  if (poly.length < 3) return false
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i][0]
    const yi = poly[i][1]
    const xj = poly[j][0]
    const yj = poly[j][1]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function roofBounds(roof: number[][]): { minX: number; maxX: number; minY: number; maxY: number } {
  const xs = roof.map((p) => p[0])
  const ys = roof.map((p) => p[1])
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

export function parapetHeightAtEdge(
  geometry: GeometryData,
  edgeIndex: number,
): number {
  const sides = geometry.sideParapets ?? []
  return sides[edgeIndex] ?? maxParapetM(geometry)
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
