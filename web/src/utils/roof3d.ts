import { roofEdgeSegments } from '@/composables/useRoofDrawing'
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

/** Unit normal pointing into the polygon interior (plan coordinates). */
export function edgeInwardNormal(a: number[], b: number[], poly: number[][]): [number, number] {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy)
  if (len < 1e-9) return [0, 0]
  let nx = -dy / len
  let ny = dx / len
  const [cx, cy] = centroid(poly)
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  if ((cx - mx) * nx + (cy - my) * ny < 0) {
    nx = -nx
    ny = -ny
  }
  return [nx, ny]
}

function intersectOffsetLines(
  p1: [number, number],
  d1: [number, number],
  p2: [number, number],
  d2: [number, number],
): number[] | null {
  const cross = d1[0] * d2[1] - d1[1] * d2[0]
  if (Math.abs(cross) < 1e-9) return null
  const wx = p2[0] - p1[0]
  const wy = p2[1] - p1[1]
  const t = (wx * d2[1] - wy * d2[0]) / cross
  return [p1[0] + d1[0] * t, p1[1] + d1[1] * t]
}

/** Offset polygon inward by wall thickness (plan px). */
export function insetPolygon(poly: number[][], distance: number): number[][] {
  if (distance <= 0 || poly.length < 3) return poly.map((p) => [...p])
  const segments = roofEdgeSegments(poly)
  if (segments.length < 3) return poly.map((p) => [...p])

  const n = segments.length
  const offsetLines: Array<{ p: [number, number]; d: [number, number] }> = []
  for (const [a, b] of segments) {
    const [nx, ny] = edgeInwardNormal(a, b, poly)
    offsetLines.push({
      p: [a[0] + nx * distance, a[1] + ny * distance],
      d: [b[0] - a[0], b[1] - a[1]],
    })
  }

  const result: number[][] = []
  for (let i = 0; i < n; i += 1) {
    const prev = (i - 1 + n) % n
    const hit = intersectOffsetLines(
      offsetLines[prev].p,
      offsetLines[prev].d,
      offsetLines[i].p,
      offsetLines[i].d,
    )
    if (hit) {
      result.push(hit)
      continue
    }
    const vtx = segments[i][0]
    const [nx1, ny1] = edgeInwardNormal(segments[prev][0], segments[prev][1], poly)
    const [nx2, ny2] = edgeInwardNormal(segments[i][0], segments[i][1], poly)
    let mx = nx1 + nx2
    let my = ny1 + ny2
    const ml = Math.hypot(mx, my)
    if (ml < 1e-9) {
      result.push([vtx[0], vtx[1]])
    } else {
      mx /= ml
      my /= ml
      result.push([vtx[0] + mx * distance, vtx[1] + my * distance])
    }
  }
  return result
}

/** Roof deck inside parapet ring; outer contour = outer parapet face. */
export function roofDeckPolygon(outerContour: number[][], wallThicknessPx: number): number[][] {
  const deck = insetPolygon(outerContour, wallThicknessPx)
  if (deck.length < 3) return outerContour.map((p) => [...p])
  return deck
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
