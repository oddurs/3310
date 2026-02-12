import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'

export function createScene() {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 200)
  camera.position.set(2, 4, 16)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0
  document.body.appendChild(renderer.domElement)

  // HDRI environment + backplate loaded by theme manager
  RectAreaLightUniformsLib.init()

  // === PRODUCT LIGHTING — 2:1 contrast, soft key, strong rim ===

  // KEY LIGHT — large soft octabox, 45° right, 45° down
  const keyLight = new THREE.RectAreaLight(0xfff5ee, 2.8, 16, 16)
  keyLight.position.set(8, 8, 8)
  keyLight.lookAt(0, 0, 0)
  scene.add(keyLight)

  // Key shadow caster (directional aligned with key)
  const keyShadow = new THREE.DirectionalLight(0xfff5ee, 0.4)
  keyShadow.position.set(8, 8, 8)
  keyShadow.castShadow = true
  keyShadow.shadow.mapSize.width = 2048
  keyShadow.shadow.mapSize.height = 2048
  keyShadow.shadow.camera.near = 0.5
  keyShadow.shadow.camera.far = 30
  keyShadow.shadow.camera.left = -6
  keyShadow.shadow.camera.right = 6
  keyShadow.shadow.camera.top = 6
  keyShadow.shadow.camera.bottom = -6
  keyShadow.shadow.radius = 4
  keyShadow.shadow.bias = -0.0005
  keyShadow.shadow.normalBias = 0.02
  scene.add(keyShadow)

  // FILL LIGHT — camera left, half the key for 2:1 ratio
  const fillLight = new THREE.RectAreaLight(0xe0e8f0, 1.5, 10, 10)
  fillLight.position.set(-8, 5, 8)
  fillLight.lookAt(0, 0, 0)
  scene.add(fillLight)

  // RIM LIGHT — top-left behind, opposite the key for edge separation
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.2)
  rimLight.position.set(-6, 6, -4)
  scene.add(rimLight)

  // SOFT KEY — SpotLight, 45° up-right, wide cone with full penumbra
  const softKey = new THREE.SpotLight(0xfff5ee, 10, 42, 0.980, 0.9, 0.4)
  softKey.position.set(2.5, 5, 4)
  softKey.target.position.set(0, 0, 0)
  scene.add(softKey)
  scene.add(softKey.target)

  // Low ambient — just enough to keep deepest shadows from going full black
  const ambient = new THREE.AmbientLight(0x606878, 0.25)
  scene.add(ambient)

  return { scene, camera, renderer, softKey }
}
