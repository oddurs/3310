import { createScene } from './scene/setup.js'
import { loadPhone } from './scene/phone.js'
import { createEnvironment } from './scene/environment.js'
import { createInteraction } from './scene/interaction.js'
import { createGame } from './game/snake.js'
import { createLCD } from './game/lcd.js'
import { createInput } from './utils/input.js'
import { createButtons } from './scene/buttons.js'
import { createSounds } from './audio/sounds.js'
import { createAmbient } from './audio/ambient.js'
import { createRadio } from './audio/radio.js'
import { createThemeManager } from './scene/themes.js'
import { createDebug } from './utils/debug.js'
import { preloadSplash } from './game/splash.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import * as THREE from 'three'

// Vignette shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - dot(uv, uv);
      texel.rgb *= mix(1.0 - darkness, 1.0, vignette);
      gl_FragColor = texel;
    }
  `,
}

async function init() {
  const loadingEl = document.getElementById('loading')

  // Create core systems
  const { scene, camera, renderer, softKey } = createScene()
  camera.layers.enable(1) // see screenGlow light (layer 1)
  const game = createGame()
  const lcd = createLCD()
  const sounds = createSounds()
  const ambient = createAmbient()
  const radio = createRadio()
  const input = createInput(game)

  // Theme manager (loads HDRI + backplate, provides UI + radio controls)
  const themes = createThemeManager(scene, radio)
  // themes.onChange((theme) => {
  //   ambient.setTheme(theme.id)
  // })

  // Environment
  createEnvironment(scene)

  // Load phone model and splash image in parallel
  const [phoneResult] = await Promise.all([
    loadPhone(scene, lcd.texture),
    preloadSplash(),
  ])
  const { phone, meshList, screenMesh, screenGlow, phoneMaterial, updateShader, getShaderRef, getScreenShaderRef } = phoneResult

  // Interaction — camera orbits around static phone
  const interaction = createInteraction(camera, screenGlow)

  // Clickable phone buttons (nav pad, numpad, menu, C)
  const buttons = createButtons(camera, renderer, phone, game)

  // Post-processing
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.06, // strength
    0.3,  // radius
    0.92  // threshold
  )
  composer.addPass(bloomPass)

  const vignettePass = new ShaderPass(VignetteShader)
  vignettePass.uniforms.offset.value = 1.0
  vignettePass.uniforms.darkness.value = 1.2
  composer.addPass(vignettePass)

  // Debug panel (toggle with backtick key)
  createDebug({
    bloomPass,
    vignettePass,
    screenMesh,
    screenGlow,
    phoneMaterial,
    renderer,
    camera,
    buttons,
    interaction,
    meshList,
    getShaderRef,
    getScreenShaderRef,
    softKey,
  })

  // Hide HTML loading overlay — splash screen is now on the LCD
  loadingEl.classList.add('hidden')

  // Draw splash screen on LCD (game starts in 'splash' state)
  lcd.draw(game.getState())

  // Enable audio and dismiss splash on first user interaction
  let audioEnabled = false
  function onFirstInteraction() {
    if (!audioEnabled) {
      audioEnabled = true
      sounds.initContext()
      radio.initContext(sounds.getContext())
      // Ambient sounds disabled for now
      // ambient.init(new AudioContext())
      // ambient.setTheme(themes.getCurrentTheme().id)
    }
    game.dismissSplash()
    window.removeEventListener('click', onFirstInteraction)
    window.removeEventListener('keydown', onFirstInteraction)
  }
  window.addEventListener('click', onFirstInteraction)
  window.addEventListener('keydown', onFirstInteraction)

  // Also auto-dismiss splash after 3 seconds
  setTimeout(() => {
    game.dismissSplash()
  }, 3000)

  // Camera intro animation
  const cameraStart = camera.position.clone()
  const cameraEnd = new THREE.Vector3(0, 1, 8)
  const introDuration = 2.5 // seconds
  let introElapsed = 0
  let introComplete = false

  // Smooth ease-out cubic: decelerates into final position
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }

  // Scroll zoom
  let targetZoom = cameraEnd.z
  const zoomMin = 4
  const zoomMax = 14
  let currentZoom = cameraEnd.z

  window.addEventListener('wheel', (e) => {
    e.preventDefault()
    targetZoom += e.deltaY * 0.005
    targetZoom = Math.max(zoomMin, Math.min(zoomMax, targetZoom))
  }, { passive: false })

  // Resize handler
  function onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    composer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  // Event handler for sounds and effects
  function handleEvent(evt) {
    if (audioEnabled) {
      switch (evt.event) {
        case 'moved':
          sounds.move()
          break
        case 'ate':
          sounds.eat()
          break
        case 'bonusAte':
          sounds.eatBonus()
          break
        case 'died':
          sounds.die()
          break
        case 'start':
          sounds.start()
          break
        case 'levelUp':
          sounds.levelUp()
          break
      }
    }
    // Screen pulse only on notable events (not every move tick)
    if (evt.event === 'ate' || evt.event === 'bonusAte' || evt.event === 'start' || evt.event === 'levelUp') {
      interaction.triggerPulse()
    }
  }

  // Game loop
  let lastTime = 0

  function animate(timestamp) {
    requestAnimationFrame(animate)

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1)
    lastTime = timestamp

    // Camera intro pan
    if (!introComplete) {
      introElapsed += dt
      const t = Math.min(introElapsed / introDuration, 1)
      const eased = easeOutCubic(t)
      camera.position.lerpVectors(cameraStart, cameraEnd, eased)
      camera.lookAt(0, 0, 0)
      if (t >= 1) introComplete = true
    } else {
      // Smooth scroll zoom
      const zoomLerp = 1 - Math.pow(0.001, dt)
      currentZoom += (targetZoom - currentZoom) * zoomLerp
    }

    // Process input events (start, etc.)
    for (const evt of input.drainEvents()) {
      handleEvent(evt)
    }
    for (const evt of buttons.drainEvents()) {
      handleEvent(evt)
    }

    // Process input buffer (direction changes)
    input.flush()

    // Update game
    const event = game.update(timestamp)
    if (event) {
      handleEvent(event)
    }

    // Update LCD
    lcd.draw(game.getState())

    // Update interaction (camera orbit, pulse decay)
    if (introComplete) {
      interaction.update(dt, currentZoom)
    }

    // Update phone shader (sync transparent window with group rotation)
    updateShader()

    // Render
    composer.render()
  }

  requestAnimationFrame(animate)
}

init().catch(console.error)
