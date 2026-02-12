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
// Debug tools loaded only in dev mode (tree-shaken from production build)
const loadDebug = import.meta.env.DEV
  ? () => import('./utils/debug.js').then(m => m.createDebug)
  : () => Promise.resolve(null)
import { preloadSplash } from './game/splash.js'
import { createPostProcessing } from './scene/postprocessing.js'
import { createCameraController } from './scene/camera.js'
import { createEventHandler } from './game/events.js'
import { createUI } from './scene/ui.js'
import { createAboutPopup } from './scene/about.js'
import { createDustParticles } from './scene/particles.js'

async function init() {
  const loadingEl = document.getElementById('loading')

  // Create core systems
  const { scene, camera, renderer, softKey, lights } = createScene()
  camera.layers.enable(1)
  const game = createGame()
  const lcd = createLCD()
  const sounds = createSounds()
  const ambient = createAmbient()
  const radio = createRadio()
  const input = createInput(game)

  // Theme manager (loads HDRI + backplate)
  const themes = createThemeManager(scene)

  // UI (bottom bar + top-right title)
  const aboutPopup = createAboutPopup()
  const ui = createUI({
    initialEnvLabel: themes.getCurrentTheme().label,
    onEnvPrev: () => { ui.updateEnvLabel(themes.prev()) },
    onEnvNext: () => { ui.updateEnvLabel(themes.next()) },
    radio,
    onAbout: () => aboutPopup.show(),
  })

  // Environment
  createEnvironment(scene)

  // Load phone model and splash image in parallel
  const [phoneResult] = await Promise.all([
    loadPhone(scene, lcd.texture),
    preloadSplash(),
  ])
  const { phone, meshList, screenMesh, screenMaterial, backingMesh, phoneMaterial, updateShader, getShaderRef, getScreenShaderRef } = phoneResult

  // Ambient dust particles
  const dust = createDustParticles(scene, camera)

  // Interaction — camera orbits around static phone
  const interaction = createInteraction(camera, null)

  // Clickable phone buttons (nav pad, numpad, menu, C)
  const buttons = createButtons(camera, renderer, phone, game)

  // Post-processing
  const { composer, bloomPass, vignettePass, colorGradePass } = createPostProcessing(renderer, scene, camera)

  // Debug panel (dev mode only — stripped from production build)
  let debug = {}
  const createDebugFn = await loadDebug()
  if (createDebugFn) {
    debug = createDebugFn({
      bloomPass,
      vignettePass,
      colorGradePass,
      screenMesh,
      screenMaterial,
      screenGlow: null,
      backingMesh,
      phoneMaterial,
      renderer,
      camera,
      buttons,
      interaction,
      meshList,
      getShaderRef,
      getScreenShaderRef,
      softKey,
      lights,
      scene,
    })
  }

  // Hide HTML loading overlay — splash screen is now on the LCD
  loadingEl.classList.add('hidden')

  // Preload remaining environments in background (one at a time)
  setTimeout(() => themes.preloadRest(), 2000)

  // Draw splash screen on LCD (game starts in 'splash' state)
  lcd.draw(game.getState())

  // Event handler for sounds and effects
  let audioEnabled = false
  const eventHandler = createEventHandler(sounds, interaction, () => audioEnabled)

  // Enable audio and dismiss splash on first user interaction
  function onFirstInteraction() {
    if (!audioEnabled) {
      audioEnabled = true
      sounds.initContext()
      radio.initContext(sounds.getContext())
    }
    game.dismissSplash()
    window.removeEventListener('click', onFirstInteraction, true)
    window.removeEventListener('keydown', onFirstInteraction, true)
  }
  window.addEventListener('click', onFirstInteraction, true)
  window.addEventListener('keydown', onFirstInteraction, true)

  // Also auto-dismiss splash after 3 seconds
  setTimeout(() => {
    game.dismissSplash()
  }, 3000)

  // Camera controller (intro animation + scroll zoom)
  const cameraCtrl = createCameraController(camera)

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

  // Game loop
  let lastTime = 0

  function animate(timestamp) {
    requestAnimationFrame(animate)

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1)
    lastTime = timestamp

    // Camera intro pan + scroll zoom
    cameraCtrl.update(dt)

    // Process input events (start, etc.)
    for (const evt of input.drainEvents()) {
      eventHandler.handle(evt)
    }
    for (const evt of buttons.drainEvents()) {
      eventHandler.handle(evt)
    }

    // Process input buffer (direction changes)
    input.flush()

    // Update game
    const event = game.update(timestamp)
    if (event) {
      eventHandler.handle(event)
    }

    // Update LCD
    lcd.draw(game.getState())

    // Update interaction (camera orbit, pulse decay)
    if (cameraCtrl.isIntroComplete()) {
      interaction.update(dt, cameraCtrl.getCurrentZoom())
    }

    // Update button press animation
    buttons.update(dt)
    const press = buttons.getPress()
    const shader = getShaderRef()
    if (shader && press.zone && press.amount > 0.001) {
      shader.uniforms.pressMin.value.set(press.zone.xMin, press.zone.yMin)
      shader.uniforms.pressMax.value.set(press.zone.xMax, press.zone.yMax)
      shader.uniforms.pressAmount.value = press.amount
    } else if (shader) {
      shader.uniforms.pressAmount.value = 0
    }

    // Update dust particles
    dust.update(dt)

    // Update phone shader (sync transparent window with group rotation)
    updateShader()

    // Update light helpers + diagram if visible
    if (debug.lightDebug) debug.lightDebug.update()

    // Render
    composer.render()
  }

  requestAnimationFrame(animate)
}

init().catch(console.error)
