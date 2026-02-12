import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

const THEMES = [
  {
    id: 'sunflowers',
    label: 'Sunflowers',
    hdr: '/env/sunflowers_2k.hdr',
    backplate: '/env/sunflowers_8k.jpg',
  },
  {
    id: 'shanghai',
    label: 'Shanghai Night',
    hdr: '/env/shanghai_bund_2k.hdr',
    backplate: '/env/shanghai_bund_8k.jpg',
  },
  {
    id: 'autumn_park',
    label: 'Autumn Park',
    hdr: '/env/autumn_park_2k.hdr',
    backplate: '/env/autumn_park_8k.jpg',
  },
  {
    id: 'beach',
    label: 'Beach Day',
    hdr: '/env/spiaggia_di_mondello_2k.hdr',
    backplate: '/env/spiaggia_di_mondello_8k.jpg',
  },
  {
    id: 'golden_sunset',
    label: 'Golden Sunset',
    hdr: '/env/kloppenheim_06_2k.hdr',
    backplate: '/env/kloppenheim_06_8k.jpg',
  },
]

export function createThemeManager(scene) {
  const rgbeLoader = new RGBELoader()
  const texLoader = new THREE.TextureLoader()

  // Cache loaded textures
  const cache = {}
  let currentIndex = 0
  let onChangeCallback = null

  function loadTheme(index) {
    const theme = THEMES[index]
    const cached = cache[theme.id]

    if (cached) {
      applyTheme(cached.env, cached.bg)
      return
    }

    let env = null
    let bg = null
    let loaded = 0

    function checkDone() {
      loaded++
      if (loaded === 2) {
        cache[theme.id] = { env, bg }
        applyTheme(env, bg)
      }
    }

    rgbeLoader.load(theme.hdr, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      env = texture
      checkDone()
    })

    texLoader.load(theme.backplate, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      texture.colorSpace = THREE.SRGBColorSpace
      bg = texture
      checkDone()
    })
  }

  function applyTheme(envTexture, bgTexture) {
    scene.environment = envTexture
    scene.background = bgTexture
    if (onChangeCallback) {
      onChangeCallback(THEMES[currentIndex])
    }
  }

  function next() {
    currentIndex = (currentIndex + 1) % THEMES.length
    loadTheme(currentIndex)
    return THEMES[currentIndex].label
  }

  function prev() {
    currentIndex = (currentIndex - 1 + THEMES.length) % THEMES.length
    loadTheme(currentIndex)
    return THEMES[currentIndex].label
  }

  function goTo(index) {
    currentIndex = index
    loadTheme(currentIndex)
    return THEMES[currentIndex].label
  }

  // Load initial theme
  loadTheme(0)

  return {
    next,
    prev,
    goTo,
    getCurrentTheme() { return THEMES[currentIndex] },
    getCurrentIndex() { return currentIndex },
    onChange(cb) { onChangeCallback = cb },
  }
}
