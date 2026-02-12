import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

const B = import.meta.env.BASE_URL

const THEMES = [
  {
    id: 'sunflowers',
    label: 'Sunflowers',
    hdr: B + 'env/sunflowers_2k.hdr',
    backplate: B + 'env/sunflowers_4k.jpg',
  },
  {
    id: 'shanghai',
    label: 'Shanghai Night',
    hdr: B + 'env/shanghai_bund_2k.hdr',
    backplate: B + 'env/shanghai_bund_4k.jpg',
  },
  {
    id: 'autumn_park',
    label: 'Autumn Park',
    hdr: B + 'env/autumn_park_2k.hdr',
    backplate: B + 'env/autumn_park_4k.jpg',
  },
  {
    id: 'beach',
    label: 'Beach Day',
    hdr: B + 'env/spiaggia_di_mondello_2k.hdr',
    backplate: B + 'env/spiaggia_di_mondello_4k.jpg',
  },
  {
    id: 'golden_sunset',
    label: 'Golden Sunset',
    hdr: B + 'env/kloppenheim_06_2k.hdr',
    backplate: B + 'env/kloppenheim_06_4k.jpg',
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

  function loadInitial() {
    return new Promise((resolve) => {
      const theme = THEMES[0]
      let env = null, bg = null, loaded = 0
      function checkDone() {
        if (++loaded === 2) {
          cache[theme.id] = { env, bg }
          applyTheme(env, bg)
          resolve()
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
    })
  }

  function preloadRest() {
    let i = 1
    function next() {
      if (i >= THEMES.length) return
      const idx = i++
      const theme = THEMES[idx]
      if (cache[theme.id]) { next(); return }
      let env = null, bg = null, done = 0
      function check() {
        if (++done === 2) { cache[theme.id] = { env, bg }; next() }
      }
      rgbeLoader.load(theme.hdr, (t) => { t.mapping = THREE.EquirectangularReflectionMapping; env = t; check() })
      texLoader.load(theme.backplate, (t) => { t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; bg = t; check() })
    }
    next()
  }

  return {
    loadInitial,
    next,
    prev,
    goTo,
    preloadRest,
    getCurrentTheme() { return THEMES[currentIndex] },
    getCurrentIndex() { return currentIndex },
    onChange(cb) { onChangeCallback = cb },
  }
}
