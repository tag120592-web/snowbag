<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CalculationData, GeometryData } from '@/types'
import { buildRoofScene, disposeObject3D, fitCameraToGroup } from '@/utils/roofThreeScene'
import { roofBounds } from '@/utils/roof3d'
import { VIEW_H, VIEW_W } from '@/composables/useRoofDrawing'

const props = defineProps<{
  geometry: GeometryData
  calculation?: CalculationData | null
  layers?: { roof?: boolean; obstacles?: boolean; bags?: boolean; sensors?: boolean }
}>()

const containerRef = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let content: THREE.Group | null = null
let snowfall: THREE.Points | null = null
let snowVelocities: Float32Array | null = null
const SNOW_PARTICLE_COUNT = 1800
let raf = 0
let resizeObserver: ResizeObserver | null = null

function disposeSnowfall() {
  if (snowfall && scene) {
    scene.remove(snowfall)
    snowfall.geometry.dispose()
    ;(snowfall.material as THREE.Material).dispose()
  }
  snowfall = null
  snowVelocities = null
}

function initSnowfall() {
  if (!scene) return
  disposeSnowfall()

  const roof = props.geometry.roof ?? []
  if (roof.length < 3) return

  const bounds = roofBounds(roof)
  const ox = VIEW_W / 2
  const oz = VIEW_H / 2
  const spanX = bounds.maxX - bounds.minX
  const spanY = bounds.maxY - bounds.minY
  const pad = Math.max(spanX, spanY) * 0.35
  const minX = bounds.minX - pad - ox
  const maxX = bounds.maxX + pad - ox
  const minZ = oz - bounds.maxY - pad
  const maxZ = oz - bounds.minY + pad
  const topY = 120 + Math.max(spanX, spanY) * 0.15

  const positions = new Float32Array(SNOW_PARTICLE_COUNT * 3)
  snowVelocities = new Float32Array(SNOW_PARTICLE_COUNT)

  for (let i = 0; i < SNOW_PARTICLE_COUNT; i += 1) {
    positions[i * 3] = minX + Math.random() * (maxX - minX)
    positions[i * 3 + 1] = Math.random() * topY
    positions[i * 3 + 2] = minZ + Math.random() * (maxZ - minZ)
    snowVelocities[i] = 0.35 + Math.random() * 0.55
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  snowfall = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  )
  scene.add(snowfall)
}

function updateSnowfall() {
  if (!snowfall || !snowVelocities) return

  const roof = props.geometry.roof ?? []
  const bounds = roofBounds(roof)
  const ox = VIEW_W / 2
  const oz = VIEW_H / 2
  const spanX = bounds.maxX - bounds.minX
  const spanY = bounds.maxY - bounds.minY
  const pad = Math.max(spanX, spanY) * 0.35
  const minX = bounds.minX - pad - ox
  const maxX = bounds.maxX + pad - ox
  const minZ = oz - bounds.maxY - pad
  const maxZ = oz - bounds.minY + pad
  const topY = 120 + Math.max(spanX, spanY) * 0.15

  const pos = snowfall.geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < SNOW_PARTICLE_COUNT; i += 1) {
    let y = pos.getY(i) - snowVelocities[i]
    let x = pos.getX(i) + (Math.random() - 0.5) * 0.08
    let z = pos.getZ(i) + (Math.random() - 0.5) * 0.08
    if (y < 0) {
      y = topY * (0.4 + Math.random() * 0.6)
      x = minX + Math.random() * (maxX - minX)
      z = minZ + Math.random() * (maxZ - minZ)
    }
    pos.setXYZ(i, x, y, z)
  }
  pos.needsUpdate = true
}

function rebuildScene() {
  if (!scene || !camera || !controls) return

  if (content) {
    scene.remove(content)
    disposeObject3D(content)
    content = null
  }
  disposeSnowfall()

  content = buildRoofScene(props.geometry, props.calculation, {
    ...props.layers,
    bags: false,
  })
  scene.add(content)
  fitCameraToGroup(camera, controls, content)
  initSnowfall()
}

function resize() {
  const el = containerRef.value
  if (!el || !renderer || !camera) return
  const w = el.clientWidth
  const h = el.clientHeight
  if (w === 0 || h === 0) return
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
}

function animate() {
  controls?.update()
  updateSnowfall()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(animate)
}

function init() {
  const el = containerRef.value
  if (!el) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xdce3ef)

  camera = new THREE.PerspectiveCamera(42, 1, 1, 100000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.domElement.className = 'canvas'
  el.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 50
  controls.maxPolarAngle = Math.PI * 0.52

  const ambient = new THREE.AmbientLight(0xffffff, 0.65)
  const sun = new THREE.DirectionalLight(0xffffff, 0.85)
  sun.position.set(300, 500, 200)
  scene.add(ambient, sun)

  const fill = new THREE.DirectionalLight(0xdde4ff, 0.35)
  fill.position.set(-200, 180, -300)
  scene.add(fill)

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(el)
  resize()
  rebuildScene()
  animate()
}

function destroy() {
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  resizeObserver = null

  if (content && scene) {
    scene.remove(content)
    disposeObject3D(content)
    content = null
  }
  disposeSnowfall()

  controls?.dispose()
  controls = null
  renderer?.dispose()

  const el = containerRef.value
  if (el && renderer?.domElement.parentElement === el) {
    el.removeChild(renderer.domElement)
  }

  renderer = null
  scene = null
  camera = null
}

onMounted(init)
onUnmounted(destroy)

watch(
  () => [props.geometry, props.calculation, props.layers],
  () => rebuildScene(),
  { deep: true },
)
</script>

<template>
  <div ref="containerRef" class="scene3d">
    <div class="overlay">
      <p class="hint">Перетащите для вращения</p>
    </div>
  </div>
</template>

<style scoped>
.scene3d {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.scene3d :deep(.canvas) {
  width: 100%;
  height: 100%;
  display: block;
}

.overlay {
  position: absolute;
  top: 12px;
  left: 16px;
  pointer-events: none;
  z-index: 1;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: var(--shadow-small);
}

.hint {
  margin: 0;
  font-size: 11px;
  color: var(--content-tertiary-enabled);
}
</style>
