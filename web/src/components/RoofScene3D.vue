<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CalculationData, GeometryData } from '@/types'
import { buildRoofScene, disposeObject3D, fitCameraToGroup } from '@/utils/roofThreeScene'

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
let raf = 0
let resizeObserver: ResizeObserver | null = null

function rebuildScene() {
  if (!scene || !camera || !controls) return

  if (content) {
    scene.remove(content)
    disposeObject3D(content)
    content = null
  }

  content = buildRoofScene(props.geometry, props.calculation, props.layers ?? {})
  scene.add(content)
  fitCameraToGroup(camera, controls, content)
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
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(animate)
}

function init() {
  const el = containerRef.value
  if (!el) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xebedf0)

  camera = new THREE.PerspectiveCamera(45, 1, 1, 100000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.domElement.className = 'canvas'
  el.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 50
  controls.maxPolarAngle = Math.PI * 0.48

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
      <p class="title">3D · Three.js</p>
      <p class="hint">Перетащите для вращения · колёсико для масштаба</p>
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
}

.title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--content-tertiary-enabled);
}

.hint {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--content-tertiary-enabled);
}
</style>
