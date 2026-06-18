import * as THREE from 'three'
import type { CalculationData, GeometryData, Obstacle, Snowbag } from '@/types'
import { VIEW_H, VIEW_W } from '@/composables/useRoofDrawing'
import {
  ROOF_ELEVATION,
  Z_PER_METER,
  metersToZ,
  obstacleVisualHeight,
  riskFill,
  shrink,
  snowDepthZ,
} from '@/utils/roof3d'

/** Match SVG viewBox origin so 2D and 3D coordinates align. */
function sceneOrigin(): [number, number] {
  return [VIEW_W / 2, VIEW_H / 2]
}

function toShape(points: number[][], ox: number, oz: number): THREE.Shape {
  const shape = new THREE.Shape()
  points.forEach(([x, z], i) => {
    const px = x - ox
    const pz = z - oz
    if (i === 0) shape.moveTo(px, pz)
    else shape.lineTo(px, pz)
  })
  shape.closePath()
  return shape
}

function extrudeShape(shape: THREE.Shape, height: number): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
  geo.rotateX(-Math.PI / 2)
  return geo
}

export function buildRoofScene(
  geometry: GeometryData,
  calculation: CalculationData | null | undefined,
  layers: { roof?: boolean; obstacles?: boolean; bags?: boolean; sensors?: boolean },
): THREE.Group {
  const group = new THREE.Group()
  const [ox, oz] = sceneOrigin()
  const show = {
    roof: layers.roof !== false,
    obstacles: layers.obstacles !== false,
    bags: layers.bags !== false,
    sensors: layers.sensors !== false,
  }

  if (show.roof && geometry.roof?.length) {
    const roofShape = toShape(geometry.roof, ox, oz)
    const topGeo = new THREE.ShapeGeometry(roofShape)
    topGeo.rotateX(-Math.PI / 2)
    const topMat = new THREE.MeshLambertMaterial({ color: 0xe8eaef })
    const top = new THREE.Mesh(topGeo, topMat)
    top.position.y = ROOF_ELEVATION + 0.02
    group.add(top)

    group.add(buildParapets(geometry.roof, geometry.sideParapets, ox, oz))
  }

  if (show.obstacles) {
    for (const o of geometry.obstacles ?? []) {
      group.add(buildObstacle(o, ox, oz))
    }
  }

  if (show.bags) {
    for (const bag of calculation?.snowbags ?? []) {
      group.add(buildSnowbag(bag, ox, oz))
    }
  }

  if (show.sensors) {
    for (const s of calculation?.sensors ?? []) {
      group.add(buildSensor(s, ox, oz))
    }
  }

  return group
}

function buildParapets(
  roof: number[][],
  sideParapets: number[] | undefined,
  ox: number,
  oz: number,
): THREE.Group {
  const g = new THREE.Group()
  const mat = new THREE.MeshLambertMaterial({ color: 0x9aa3b2 })
  const sides = sideParapets ?? []

  for (let i = 0; i < roof.length; i += 1) {
    const heightM = sides[i] ?? 0.6
    if (heightM <= 0) continue
    const height = heightM * Z_PER_METER
    const a = roof[i]
    const b = roof[(i + 1) % roof.length]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    if (len < 1) continue

    const midX = (a[0] + b[0]) / 2 - ox
    const midZ = (a[1] + b[1]) / 2 - oz
    const angle = Math.atan2(dy, dx)
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, height, 0.2), mat)
    wall.position.set(midX, ROOF_ELEVATION + height / 2, midZ)
    wall.rotation.y = -angle
    g.add(wall)
  }

  return g
}

function buildObstacle(o: Obstacle, ox: number, oz: number): THREE.Object3D {
  const g = new THREE.Group()
  const sideMat = new THREE.MeshLambertMaterial({ color: 0xa8b0bc })
  const topMat = new THREE.MeshLambertMaterial({ color: 0xd4d9e2 })

  if (o.shape === 'rect' && o.w && o.h) {
    const height = obstacleVisualHeight(o)
    if (height <= 0) return g
    const box = new THREE.Mesh(new THREE.BoxGeometry(o.w, height, o.h), sideMat)
    box.position.set(
      (o.x ?? 0) + o.w / 2 - ox,
      ROOF_ELEVATION + height / 2,
      (o.y ?? 0) + o.h / 2 - oz,
    )
    g.add(box)

    const cap = new THREE.Mesh(new THREE.BoxGeometry(o.w, 0.2, o.h), topMat)
    cap.position.set(box.position.x, ROOF_ELEVATION + height, box.position.z)
    g.add(cap)
  } else if (o.shape === 'circle' && o.r && o.cx != null && o.cy != null) {
    const r = o.r
    const height = Math.max(0.4, metersToZ(o.hM ?? 0.4))
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, Math.max(0.4, height), 24),
      new THREE.MeshLambertMaterial({ color: 0x9aa3b5 }),
    )
    cyl.position.set(o.cx - ox, ROOF_ELEVATION + Math.max(0.4, height) / 2, o.cy - oz)
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

  for (let i = 0; i < pts.length - 1; i += 1) {
    const heightM = sideHeights[i] ?? o.hM ?? 1
    const height = Math.max(0.1, heightM * Z_PER_METER)
    const a = pts[i]
    const b = pts[i + 1]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    if (len < 1) continue
    const midX = (a[0] + b[0]) / 2 - ox
    const midZ = (a[1] + b[1]) / 2 - oz
    const angle = Math.atan2(dy, dx)
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, height, 0.25), sideMat)
    wall.position.set(midX, ROOF_ELEVATION + height / 2, midZ)
    wall.rotation.y = -angle
    g.add(wall)

    const cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.15, 0.25), topMat)
    cap.position.set(midX, ROOF_ELEVATION + height, midZ)
    cap.rotation.y = -angle
    g.add(cap)
  }

  return g
}

function buildSnowbag(bag: Snowbag, ox: number, oz: number): THREE.Group {
  const g = new THREE.Group()
  const color = new THREE.Color(riskFill[bag.risk] ?? '#e11b11')
  const depth = snowDepthZ(bag)
  const shape = toShape(bag.poly, ox, oz)

  const glowMat = new THREE.MeshLambertMaterial({
    color,
    transparent: true,
    opacity: 0.35,
  })
  const glowGeo = extrudeShape(shape, 0.5)
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.y = ROOF_ELEVATION + 0.2
  g.add(glow)

  const bodyMat = new THREE.MeshLambertMaterial({
    color,
    transparent: true,
    opacity: 0.55,
  })
  const bodyGeo = extrudeShape(shape, depth)
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = ROOF_ELEVATION
  g.add(body)

  for (const t of [0.35, 0.58, 0.82]) {
    const layerShape = toShape(shrink(bag.poly, t), ox, oz)
    const layerMat = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: t === 0.35 ? 0.55 : t === 0.58 ? 0.7 : 0.85,
    })
    const layerGeo = extrudeShape(layerShape, 0.4)
    const layer = new THREE.Mesh(layerGeo, layerMat)
    layer.position.y = ROOF_ELEVATION + depth + 0.1
    g.add(layer)
  }

  const capGeo = new THREE.ShapeGeometry(shape)
  capGeo.rotateX(-Math.PI / 2)
  const capMat = new THREE.MeshLambertMaterial({
    color,
    transparent: true,
    opacity: 0.82,
  })
  const cap = new THREE.Mesh(capGeo, capMat)
  cap.position.y = ROOF_ELEVATION + depth + 0.15
  g.add(cap)

  return g
}

function buildSensor(s: { x: number; y: number }, ox: number, oz: number): THREE.Group {
  const g = new THREE.Group()
  const px = s.x - ox
  const pz = s.y - oz
  const poleH = 2.4

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, poleH, 8),
    new THREE.MeshLambertMaterial({ color: 0xe11b11 }),
  )
  pole.position.set(px, ROOF_ELEVATION + poleH / 2, pz)
  g.add(pole)

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xe11b11 }),
  )
  head.position.set(px, ROOF_ELEVATION + poleH + 1.2, pz)
  g.add(head)

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.15, 16),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  )
  base.position.set(px, ROOF_ELEVATION + 0.08, pz)
  g.add(base)

  return g
}

export function fitCameraToGroup(
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; update: () => void },
  group: THREE.Group,
): void {
  const box = new THREE.Box3().setFromObject(group)
  if (box.isEmpty()) {
    camera.position.set(0, 400, 0.01)
    controls.target.set(0, 0, 0)
    controls.update()
    return
  }

  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.z, 1)
  const dist = maxDim * 1.2

  camera.position.set(center.x, dist, center.z + 0.01)
  controls.target.set(center.x, 0, center.z)
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
