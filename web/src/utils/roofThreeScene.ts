import * as THREE from 'three'
import type { CalculationData, GeometryData, Obstacle, Snowbag } from '@/types'
import {
  ROOF_ELEVATION,
  centroid,
  obstacleVisualHeight,
  riskFill,
  shrink,
  snowDepthZ,
} from '@/utils/roof3d'

const GROUND_Y = -6

function toShape(points: number[][], cx: number, cz: number): THREE.Shape {
  const shape = new THREE.Shape()
  points.forEach(([x, z], i) => {
    const px = x - cx
    const pz = z - cz
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

function sceneCenter(geometry: GeometryData): [number, number] {
  const roof = geometry.roof ?? []
  if (roof.length) return centroid(roof)
  return [500, 340]
}

export function buildRoofScene(
  geometry: GeometryData,
  calculation: CalculationData | null | undefined,
  layers: { roof?: boolean; obstacles?: boolean; bags?: boolean; sensors?: boolean },
): THREE.Group {
  const group = new THREE.Group()
  const [cx, cz] = sceneCenter(geometry)
  const show = {
    roof: layers.roof !== false,
    obstacles: layers.obstacles !== false,
    bags: layers.bags !== false,
    sensors: layers.sensors !== false,
  }

  if (show.roof && geometry.roof?.length) {
    const roofShape = toShape(geometry.roof, cx, cz)
    const wallHeight = ROOF_ELEVATION - GROUND_Y

    const wallGeo = extrudeShape(roofShape, wallHeight)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xc8cdd6 })
    const walls = new THREE.Mesh(wallGeo, wallMat)
    walls.position.y = GROUND_Y
    group.add(walls)

    const topGeo = new THREE.ShapeGeometry(roofShape)
    topGeo.rotateX(-Math.PI / 2)
    const topMat = new THREE.MeshLambertMaterial({ color: 0xe8eaef })
    const top = new THREE.Mesh(topGeo, topMat)
    top.position.y = ROOF_ELEVATION + 0.05
    group.add(top)

    const groundGeo = new THREE.ShapeGeometry(roofShape)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xb0b8c4 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.position.y = GROUND_Y
    group.add(ground)
  }

  if (show.obstacles) {
    for (const o of geometry.obstacles ?? []) {
      group.add(buildObstacle(o, cx, cz))
    }
  }

  if (show.bags) {
    for (const bag of calculation?.snowbags ?? []) {
      group.add(buildSnowbag(bag, cx, cz))
    }
  }

  if (show.sensors) {
    for (const s of calculation?.sensors ?? []) {
      group.add(buildSensor(s, cx, cz))
    }
  }

  return group
}

function buildObstacle(o: Obstacle, cx: number, cz: number): THREE.Object3D {
  const g = new THREE.Group()
  const sideMat = new THREE.MeshLambertMaterial({ color: 0xa8b0bc })
  const topMat = new THREE.MeshLambertMaterial({ color: 0xd4d9e2 })

  if (o.shape === 'rect' && o.w && o.h) {
    const height = obstacleVisualHeight(o)
    if (height <= 0) return g
    const box = new THREE.Mesh(new THREE.BoxGeometry(o.w, height, o.h), sideMat)
    box.position.set(
      (o.x ?? 0) + o.w / 2 - cx,
      ROOF_ELEVATION + height / 2,
      (o.y ?? 0) + o.h / 2 - cz,
    )
    g.add(box)

    const cap = new THREE.Mesh(new THREE.BoxGeometry(o.w, 0.2, o.h), topMat)
    cap.position.set(box.position.x, ROOF_ELEVATION + height, box.position.z)
    g.add(cap)
  } else if (o.shape === 'circle' && o.r && o.cx != null && o.cy != null) {
    const r = o.r
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, 0.4, 24),
      new THREE.MeshLambertMaterial({ color: 0x9aa3b5 }),
    )
    cyl.position.set(o.cx - cx, ROOF_ELEVATION + 0.2, o.cy - cz)
    g.add(cyl)
  }

  return g
}

function buildSnowbag(bag: Snowbag, cx: number, cz: number): THREE.Group {
  const g = new THREE.Group()
  const color = new THREE.Color(riskFill[bag.risk] ?? '#e11b11')
  const depth = snowDepthZ(bag)
  const shape = toShape(bag.poly, cx, cz)

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
    const layerShape = toShape(shrink(bag.poly, t), cx, cz)
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

function buildSensor(s: { x: number; y: number }, cx: number, cz: number): THREE.Group {
  const g = new THREE.Group()
  const px = s.x - cx
  const pz = s.y - cz
  const poleH = 18

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, poleH, 8),
    new THREE.MeshLambertMaterial({ color: 0xe11b11 }),
  )
  pole.position.set(px, ROOF_ELEVATION + poleH / 2, pz)
  g.add(pole)

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xe11b11 }),
  )
  head.position.set(px, ROOF_ELEVATION + poleH + 3.5, pz)
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
    camera.position.set(400, 300, 400)
    controls.target.set(0, 0, 0)
    controls.update()
    return
  }

  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1)
  const dist = maxDim * 1.35

  camera.position.set(center.x + dist * 0.85, center.y + dist * 0.65, center.z + dist * 0.85)
  controls.target.copy(center)
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
