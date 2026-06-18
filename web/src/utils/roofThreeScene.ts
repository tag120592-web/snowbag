import * as THREE from 'three'
import type { CalculationData, GeometryData, Obstacle } from '@/types'
import { VIEW_H, VIEW_W, polylineWallSegments, roofEdgeSegments } from '@/composables/useRoofDrawing'
import {
  ROOF_ELEVATION,
  Z_PER_METER,
  centroid,
  maxParapetM,
  metersToZ,
  obstacleVisualHeight,
  pointInPoly,
  roofBounds,
  snowDepthColor,
  snowDepthMAt,
} from '@/utils/roof3d'

/** Match SVG viewBox origin so 2D and 3D coordinates align (SVG Y grows down → negate for Three.js Z). */
function sceneOrigin(): [number, number] {
  return [VIEW_W / 2, VIEW_H / 2]
}

function toShape(points: number[][], ox: number, oz: number): THREE.Shape {
  const shape = new THREE.Shape()
  points.forEach(([x, y], i) => {
    const px = x - ox
    const pz = oz - y
    if (i === 0) shape.moveTo(px, pz)
    else shape.lineTo(px, pz)
  })
  shape.closePath()
  return shape
}

function svgToScene(x: number, y: number, ox: number, oz: number): [number, number] {
  return [x - ox, oz - y]
}

export function buildRoofScene(
  geometry: GeometryData,
  calculation: CalculationData | null | undefined,
  layers: { roof?: boolean; obstacles?: boolean; bags?: boolean; sensors?: boolean },
): THREE.Group {
  const group = new THREE.Group()
  const [ox, oz] = sceneOrigin()
  const parapetCapM = maxParapetM(geometry)
  const show = {
    roof: layers.roof !== false,
    obstacles: layers.obstacles !== false,
    sensors: layers.sensors !== false,
  }

  if (show.roof && geometry.roof?.length) {
    group.add(buildBuildingShell(geometry, ox, oz))
    group.add(buildSnowCover(geometry, calculation?.snowbags, ox, oz, parapetCapM))
    group.add(buildParapets(geometry.roof, geometry.sideParapets, ox, oz))
  }

  if (show.obstacles) {
    for (const o of geometry.obstacles ?? []) {
      group.add(buildObstacle(o, ox, oz))
    }
  }

  if (show.sensors) {
    for (const s of calculation?.sensors ?? []) {
      group.add(buildSensor(s, ox, oz, parapetCapM))
    }
  }

  return group
}

function buildBuildingShell(geometry: GeometryData, ox: number, oz: number): THREE.Group {
  const g = new THREE.Group()
  const roof = geometry.roof ?? []
  const roofShape = toShape(roof, ox, oz)
  const slabGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 0.35, bevelEnabled: false })
  slabGeo.rotateX(-Math.PI / 2)
  const slab = new THREE.Mesh(
    slabGeo,
    new THREE.MeshLambertMaterial({ color: 0xd8dde6 }),
  )
  slab.position.y = ROOF_ELEVATION - 0.35
  g.add(slab)

  const topGeo = new THREE.ShapeGeometry(roofShape)
  topGeo.rotateX(-Math.PI / 2)
  const top = new THREE.Mesh(topGeo, new THREE.MeshLambertMaterial({ color: 0xeef0f4 }))
  top.position.y = ROOF_ELEVATION + 0.01
  g.add(top)

  const bounds = roofBounds(roof)
  const wallH = metersToZ(3.2)
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xb8bec8 })
  const w = bounds.maxX - bounds.minX
  const d = bounds.maxY - bounds.minY
  const cx = (bounds.minX + bounds.maxX) / 2 - ox
  const cz = oz - (bounds.minY + bounds.maxY) / 2

  const south = new THREE.Mesh(new THREE.BoxGeometry(w + 8, wallH, 0.5), wallMat)
  south.position.set(cx, ROOF_ELEVATION - wallH / 2 - 0.1, cz + d / 2 + 4)
  g.add(south)

  const north = south.clone()
  north.position.z = cz - d / 2 - 4
  g.add(north)

  const west = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallH, d + 8), wallMat)
  west.position.set(cx - w / 2 - 4, ROOF_ELEVATION - wallH / 2 - 0.1, cz)
  g.add(west)

  const east = west.clone()
  east.position.x = cx + w / 2 + 4
  g.add(east)

  return g
}

function buildSnowCover(
  geometry: GeometryData,
  bags: CalculationData['snowbags'],
  ox: number,
  oz: number,
  parapetCapM: number,
): THREE.Group {
  const g = new THREE.Group()
  const roof = geometry.roof ?? []
  if (roof.length < 3) return g

  const bounds = roofBounds(roof)
  const cols = 48
  const rows = 32
  const geo = new THREE.PlaneGeometry(
    bounds.maxX - bounds.minX,
    bounds.maxY - bounds.minY,
    cols,
    rows,
  )
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position
  const colors: number[] = []

  for (let i = 0; i < pos.count; i += 1) {
    const lx = pos.getX(i) + (bounds.minX + bounds.maxX) / 2
    const ly = pos.getY(i) + (bounds.minY + bounds.maxY) / 2
    let depthM = pointInPoly(lx, ly, roof) ? snowDepthMAt(lx, ly, bags, parapetCapM) : 0

    for (const bag of bags ?? []) {
      const [bcx, bcy] = centroid(bag.poly)
      const dist = Math.hypot(lx - bcx, ly - bcy)
      const influence = Math.max(...bag.poly.map(([x, y]) => Math.hypot(x - bcx, y - bcy)), 20)
      if (dist < influence * 1.15) {
        const t = 1 - dist / (influence * 1.15)
        const bagDepth = Math.min(
          parapetCapM * 0.92,
          bag.mu * 0.07 + (bag.risk === 'critical' ? 0.35 : 0.18),
        )
        depthM = Math.max(depthM, bagDepth * t * t)
      }
    }

    depthM = Math.min(depthM, parapetCapM * 0.92)
    pos.setY(i, ROOF_ELEVATION + metersToZ(depthM))
    pos.setX(i, lx - ox)
    pos.setZ(i, oz - ly)

    const c = new THREE.Color(snowDepthColor(depthM))
    colors.push(c.r, c.g, c.b)
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshLambertMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    }),
  )
  g.add(mesh)

  return g
}

function buildParapets(
  roof: number[][],
  sideParapets: number[] | undefined,
  ox: number,
  oz: number,
): THREE.Group {
  const g = new THREE.Group()
  const mat = new THREE.MeshLambertMaterial({ color: 0x6b7280 })
  const sides = sideParapets ?? []
  const segments = roofEdgeSegments(roof)

  for (let i = 0; i < segments.length; i += 1) {
    const [a, b] = segments[i]
    const heightM = sides[i] ?? sides[i % sides.length] ?? 0.6
    if (heightM <= 0) continue
    const height = heightM * Z_PER_METER
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    if (len < 1) continue

    const midX = (a[0] + b[0]) / 2 - ox
    const midZ = oz - (a[1] + b[1]) / 2
    const angle = Math.atan2(-dy, dx)
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, height, 0.35), mat)
    wall.position.set(midX, ROOF_ELEVATION + height / 2, midZ)
    wall.rotation.y = -angle
    g.add(wall)

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.12, 0.38),
      new THREE.MeshLambertMaterial({ color: 0x4b5563 }),
    )
    cap.position.set(midX, ROOF_ELEVATION + height, midZ)
    cap.rotation.y = -angle
    g.add(cap)
  }

  return g
}

function buildObstacle(o: Obstacle, ox: number, oz: number): THREE.Object3D {
  const g = new THREE.Group()
  const sideMat = new THREE.MeshLambertMaterial({ color: 0x9aa3b2 })
  const topMat = new THREE.MeshLambertMaterial({ color: 0xdce1ea })

  if (o.shape === 'rect' && o.w && o.h) {
    const height = obstacleVisualHeight(o)
    if (height <= 0) return g
    const [px, pz] = svgToScene((o.x ?? 0) + o.w / 2, (o.y ?? 0) + o.h / 2, ox, oz)
    const box = new THREE.Mesh(new THREE.BoxGeometry(o.w, height, o.h), sideMat)
    box.position.set(px, ROOF_ELEVATION + height / 2, pz)
    g.add(box)

    const cap = new THREE.Mesh(new THREE.BoxGeometry(o.w, 0.15, o.h), topMat)
    cap.position.set(px, ROOF_ELEVATION + height, pz)
    g.add(cap)
  } else if (o.shape === 'circle' && o.r && o.cx != null && o.cy != null) {
    const r = o.r
    const height = Math.max(0.4, metersToZ(o.hM ?? 0.4))
    const [px, pz] = svgToScene(o.cx, o.cy, ox, oz)
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, Math.max(0.4, height), 24),
      new THREE.MeshLambertMaterial({ color: 0x9aa3b5 }),
    )
    cyl.position.set(px, ROOF_ELEVATION + Math.max(0.4, height) / 2, pz)
    g.add(cyl)
  } else if (o.shape === 'polyline' && o.points?.length) {
    g.add(buildPolylineObstacle(o, ox, oz, sideMat, topMat))
  }

  return g
}

function buildPolylineObstacle(
  o: Obstacle,
  ox: number,
  oz: number,
  sideMat: THREE.Material,
  topMat: THREE.Material,
): THREE.Group {
  const g = new THREE.Group()
  const pts = o.points ?? []
  const sideHeights = o.sideHeights ?? []
  const segments = polylineWallSegments(pts)

  for (let i = 0; i < segments.length; i += 1) {
    const [a, b] = segments[i]
    const heightM = sideHeights[i] ?? o.hM ?? 1
    const height = Math.max(0.1, heightM * Z_PER_METER)
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    if (len < 1) continue
    const midX = (a[0] + b[0]) / 2 - ox
    const midZ = oz - (a[1] + b[1]) / 2
    const angle = Math.atan2(-dy, dx)
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, height, 0.25), sideMat)
    wall.position.set(midX, ROOF_ELEVATION + height / 2, midZ)
    wall.rotation.y = -angle
    g.add(wall)

    const cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.25), topMat)
    cap.position.set(midX, ROOF_ELEVATION + height, midZ)
    cap.rotation.y = -angle
    g.add(cap)
  }

  return g
}

function buildSensor(
  s: { x: number; y: number },
  ox: number,
  oz: number,
  parapetCapM: number,
): THREE.Group {
  const g = new THREE.Group()
  const [px, pz] = svgToScene(s.x, s.y, ox, oz)
  const poleH = Math.min(metersToZ(parapetCapM * 0.85), 4.8)

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.2, 16),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  )
  base.position.set(px, ROOF_ELEVATION + 0.1, pz)
  g.add(base)

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, poleH, 8),
    new THREE.MeshLambertMaterial({ color: 0xe11b11 }),
  )
  pole.position.set(px, ROOF_ELEVATION + poleH / 2, pz)
  g.add(pole)

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xe11b11 }),
  )
  head.position.set(px, ROOF_ELEVATION + poleH + 0.9, pz)
  g.add(head)

  return g
}

export function fitCameraToGroup(
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; update: () => void },
  group: THREE.Group,
): void {
  const box = new THREE.Box3().setFromObject(group)
  if (box.isEmpty()) {
    camera.position.set(120, 280, 220)
    controls.target.set(0, 0, 0)
    controls.update()
    return
  }

  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.z, 1)
  const dist = maxDim * 1.35

  camera.position.set(center.x + dist * 0.65, dist * 0.72, center.z + dist * 0.55)
  controls.target.set(center.x, ROOF_ELEVATION + metersToZ(0.3), center.z)
  camera.near = maxDim * 0.01
  camera.far = maxDim * 20
  camera.updateProjectionMatrix()
  controls.update()
}

export function disposeObject3D(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry.dispose()
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const m of mats) m.dispose()
  })
}
