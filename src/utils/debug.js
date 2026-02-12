import GUI from 'lil-gui'

function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => console.log('Copied to clipboard'),
    () => console.warn('Clipboard write failed')
  )
}

export function createDebug({
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
}) {
  const gui = new GUI({ title: 'Debug', width: 300 })

  // =========================================================
  // Click Debug
  // =========================================================
  const clickDebug = { enabled: false }
  const clickFolder = gui.addFolder('Click Debug')
  clickFolder.add(clickDebug, 'enabled').name('Log clicks')

  const clickInfo = {
    x: '',
    y: '',
    z: '',
    zone: '',
    action: '',
    bounds: '',
    copy() {
      const lines = [
        `Click Debug:`,
        `  x: ${clickInfo.x}`,
        `  y: ${clickInfo.y}`,
        `  z: ${clickInfo.z}`,
        `  zone: ${clickInfo.zone}`,
        `  action: ${clickInfo.action}`,
      ]
      if (clickInfo.bounds) lines.push(`  bounds: ${clickInfo.bounds}`)
      copyText(lines.join('\n'))
    },
  }

  const clickXCtrl = clickFolder.add(clickInfo, 'x').name('X').disable()
  const clickYCtrl = clickFolder.add(clickInfo, 'y').name('Y').disable()
  const clickZCtrl = clickFolder.add(clickInfo, 'z').name('Z').disable()
  const clickZoneCtrl = clickFolder.add(clickInfo, 'zone').name('Zone').disable()
  const clickActionCtrl = clickFolder.add(clickInfo, 'action').name('Action').disable()
  const clickBoundsCtrl = clickFolder.add(clickInfo, 'bounds').name('Bounds').disable()
  clickFolder.add(clickInfo, 'copy').name('Copy click info')

  buttons.setDebug(clickDebug)
  buttons.setOnDebugClick((data) => {
    clickInfo.x = data.x.toFixed(3)
    clickInfo.y = data.y.toFixed(3)
    clickInfo.z = data.z.toFixed(3)
    clickInfo.zone = data.zone
    clickInfo.action = data.action
    clickInfo.bounds = data.bounds
      ? `x[${data.bounds.xMin}, ${data.bounds.xMax}] y[${data.bounds.yMin}, ${data.bounds.yMax}]`
      : ''
    clickXCtrl.updateDisplay()
    clickYCtrl.updateDisplay()
    clickZCtrl.updateDisplay()
    clickZoneCtrl.updateDisplay()
    clickActionCtrl.updateDisplay()
    clickBoundsCtrl.updateDisplay()

    // Auto-open the folder when a click comes in
    clickFolder.open()
  })

  clickFolder.close()

  // =========================================================
  // Screen / LCD
  // =========================================================
  const screenFolder = gui.addFolder('Screen')
  const screen = {
    get scaleX() { return screenMesh.scale.x },
    set scaleX(v) { screenMesh.scale.x = v },
    get scaleY() { return screenMesh.scale.y },
    set scaleY(v) { screenMesh.scale.y = v },
    get posX() { return screenMesh.position.x },
    set posX(v) { screenMesh.position.x = v },
    get posY() { return screenMesh.position.y },
    set posY(v) { screenMesh.position.y = v },
    get posZ() { return screenMesh.position.z },
    set posZ(v) { screenMesh.position.z = v },
    glowBase: 0.2,
    get glowDistance() { return screenGlow.distance },
    set glowDistance(v) { screenGlow.distance = v },
    copy() {
      copyText([
        `Screen:`,
        `  scaleX ${screen.scaleX}  scaleY ${screen.scaleY}`,
        `  posX ${screen.posX}  posY ${screen.posY}  posZ ${screen.posZ}`,
        `  glowBase ${screen.glowBase}  glowDistance ${screen.glowDistance}`,
      ].join('\n'))
    },
  }
  screenFolder.add(screen, 'scaleX', 0.8, 1.2, 0.005).name('Scale X')
  screenFolder.add(screen, 'scaleY', 0.8, 1.2, 0.005).name('Scale Y')
  screenFolder.add(screen, 'posX', -0.5, 0.5, 0.001).name('Pos X')
  screenFolder.add(screen, 'posY', -0.5, 1.5, 0.001).name('Pos Y')
  screenFolder.add(screen, 'posZ', -0.5, 0.5, 0.001).name('Pos Z')
  screenFolder.add(screen, 'glowBase', 0, 2, 0.01).name('Glow intensity').onChange(v => interaction.setGlowBase(v))
  screenFolder.add(screen, 'glowDistance', 0, 10, 0.1).name('Glow distance')
  screenFolder.add(screen, 'copy').name('Copy values')
  screenFolder.close()

  // =========================================================
  // Post-processing
  // =========================================================
  const postFolder = gui.addFolder('Post-processing')
  const post = {
    get bloomStrength() { return bloomPass.strength },
    set bloomStrength(v) { bloomPass.strength = v },
    get bloomRadius() { return bloomPass.radius },
    set bloomRadius(v) { bloomPass.radius = v },
    get bloomThreshold() { return bloomPass.threshold },
    set bloomThreshold(v) { bloomPass.threshold = v },
    get vignetteOffset() { return vignettePass.uniforms.offset.value },
    set vignetteOffset(v) { vignettePass.uniforms.offset.value = v },
    get vignetteDarkness() { return vignettePass.uniforms.darkness.value },
    set vignetteDarkness(v) { vignettePass.uniforms.darkness.value = v },
    get exposure() { return renderer.toneMappingExposure },
    set exposure(v) { renderer.toneMappingExposure = v },
    copy() {
      copyText([
        `Post-processing:`,
        `  bloomStrength ${post.bloomStrength}  bloomRadius ${post.bloomRadius}  bloomThreshold ${post.bloomThreshold}`,
        `  vignetteOffset ${post.vignetteOffset}  vignetteDarkness ${post.vignetteDarkness}`,
        `  exposure ${post.exposure}`,
      ].join('\n'))
    },
  }
  postFolder.add(post, 'bloomStrength', 0, 3, 0.01).name('Bloom strength')
  postFolder.add(post, 'bloomRadius', 0, 2, 0.01).name('Bloom radius')
  postFolder.add(post, 'bloomThreshold', 0, 1, 0.01).name('Bloom threshold')
  postFolder.add(post, 'vignetteOffset', 0, 3, 0.01).name('Vignette offset')
  postFolder.add(post, 'vignetteDarkness', 0, 3, 0.01).name('Vignette darkness')
  postFolder.add(post, 'exposure', 0, 3, 0.01).name('Exposure')
  postFolder.add(post, 'copy').name('Copy values')
  postFolder.close()

  // =========================================================
  // Phone Material
  // =========================================================
  const matFolder = gui.addFolder('Phone Material')
  const mat = {
    get metalness() { return phoneMaterial.metalness },
    set metalness(v) { phoneMaterial.metalness = v },
    get roughness() { return phoneMaterial.roughness },
    set roughness(v) { phoneMaterial.roughness = v },
    get clearcoat() { return phoneMaterial.clearcoat },
    set clearcoat(v) { phoneMaterial.clearcoat = v },
    get clearcoatRoughness() { return phoneMaterial.clearcoatRoughness },
    set clearcoatRoughness(v) { phoneMaterial.clearcoatRoughness = v },
    get envMapIntensity() { return phoneMaterial.envMapIntensity },
    set envMapIntensity(v) { phoneMaterial.envMapIntensity = v },
    copy() {
      copyText([
        `Phone Material:`,
        `  metalness ${mat.metalness}  roughness ${mat.roughness}`,
        `  clearcoat ${mat.clearcoat}  clearcoatRoughness ${mat.clearcoatRoughness}`,
        `  envMapIntensity ${mat.envMapIntensity}`,
      ].join('\n'))
    },
  }
  matFolder.add(mat, 'metalness', 0, 1, 0.01)
  matFolder.add(mat, 'roughness', 0, 1, 0.01)
  matFolder.add(mat, 'clearcoat', 0, 1, 0.01)
  matFolder.add(mat, 'clearcoatRoughness', 0, 1, 0.01)
  matFolder.add(mat, 'envMapIntensity', 0, 2, 0.01).name('Env map')

  const bezel = {
    get darken() { const s = getShaderRef(); return s ? s.uniforms.bezelDarken.value : 0.15 },
    set darken(v) { const s = getShaderRef(); if (s) s.uniforms.bezelDarken.value = v },
    get zThreshold() { const s = getShaderRef(); return s ? s.uniforms.bezelZThreshold.value : 0.30 },
    set zThreshold(v) { const s = getShaderRef(); if (s) s.uniforms.bezelZThreshold.value = v },
  }
  matFolder.add(bezel, 'darken', 0, 1, 0.01).name('Bezel darken')
  matFolder.add(bezel, 'zThreshold', 0, 0.6, 0.01).name('Bezel Z threshold')
  matFolder.add(mat, 'copy').name('Copy values')
  matFolder.close()

  // =========================================================
  // Screen Window (transparency rect)
  // =========================================================
  const swFolder = gui.addFolder('Screen Window')

  let baseRect = null
  function getBase() {
    if (baseRect) return baseRect
    const s = getShaderRef()
    if (!s) return null
    const mn = s.uniforms.scrMin.value
    const mx = s.uniforms.scrMax.value
    baseRect = { cx: (mn.x + mx.x) / 2, cy: (mn.y + mx.y) / 2, hw: (mx.x - mn.x) / 2, hh: (mx.y - mn.y) / 2 }
    return baseRect
  }

  const sw = {
    debugZones: false,
    centerX: 0,
    centerY: 0,
    scale: 1.0,
    padX: 0,
    padTop: 0,
    padBottom: 0,
    marginX: 0,
    marginTop: 0,
    marginBottom: 0,
  }

  function applyScreenRect() {
    const b = getBase()
    const s = getShaderRef()
    if (!b || !s) return
    const cx = b.cx + sw.centerX
    const cy = b.cy + sw.centerY
    const hw = b.hw * sw.scale - sw.padX + sw.marginX
    const hh = b.hh * sw.scale
    s.uniforms.scrMin.value.x = cx - hw
    s.uniforms.scrMin.value.y = cy - hh + sw.padBottom - sw.marginBottom
    s.uniforms.scrMax.value.x = cx + hw
    s.uniforms.scrMax.value.y = cy + hh - sw.padTop + sw.marginTop
  }

  const onSwChange = () => applyScreenRect()

  swFolder.add(sw, 'debugZones').name('Visualize zones').onChange(v => {
    const s = getShaderRef(); if (s) s.uniforms.debugZones.value = v ? 1 : 0
  })
  swFolder.add(sw, 'centerX', -1, 1, 0.005).name('Center X').onChange(onSwChange)
  swFolder.add(sw, 'centerY', -1, 1, 0.005).name('Center Y').onChange(onSwChange)
  swFolder.add(sw, 'scale', 0.1, 2, 0.01).name('Scale').onChange(onSwChange)
  swFolder.add(sw, 'padX', 0, 0.5, 0.005).name('Pad X (sides)').onChange(onSwChange)
  swFolder.add(sw, 'padTop', 0, 0.5, 0.005).name('Pad Top').onChange(onSwChange)
  swFolder.add(sw, 'padBottom', 0, 0.5, 0.005).name('Pad Bottom').onChange(onSwChange)
  swFolder.add(sw, 'marginX', 0, 0.5, 0.005).name('Margin X (sides)').onChange(onSwChange)
  swFolder.add(sw, 'marginTop', 0, 0.5, 0.005).name('Margin Top').onChange(onSwChange)
  swFolder.add(sw, 'marginBottom', 0, 0.5, 0.005).name('Margin Bottom').onChange(onSwChange)
  swFolder.add({ reset() {
    sw.centerX = 0; sw.centerY = 0; sw.scale = 1
    sw.padX = 0; sw.padTop = 0; sw.padBottom = 0
    sw.marginX = 0; sw.marginTop = 0; sw.marginBottom = 0
    baseRect = null; applyScreenRect()
    swFolder.controllersRecursive().forEach(c => c.updateDisplay())
  }}, 'reset').name('Reset')
  swFolder.add({ copy() {
    const s = getShaderRef(); if (!s) return
    const mn = s.uniforms.scrMin.value, mx = s.uniforms.scrMax.value
    copyText([
      `Screen Window:`,
      `  scrMin (${mn.x.toFixed(3)}, ${mn.y.toFixed(3)})  scrMax (${mx.x.toFixed(3)}, ${mx.y.toFixed(3)})`,
      `  center (${sw.centerX}, ${sw.centerY})  scale ${sw.scale}`,
      `  padX ${sw.padX}  padTop ${sw.padTop}  padBottom ${sw.padBottom}`,
      `  marginX ${sw.marginX}  marginTop ${sw.marginTop}  marginBottom ${sw.marginBottom}`,
    ].join('\n'))
  }}, 'copy').name('Copy values')
  swFolder.close()

  // =========================================================
  // Dot Matrix Grid
  // =========================================================
  const dotFolder = gui.addFolder('Dot Matrix')
  function dotUniform(name) {
    return {
      get value() { const s = getScreenShaderRef(); return s ? s.uniforms[name].value : 0 },
      set value(v) { const s = getScreenShaderRef(); if (s) s.uniforms[name].value = v },
    }
  }
  const dot = {
    get cols() { return dotUniform('dotCols').value }, set cols(v) { dotUniform('dotCols').value = v },
    get rows() { return dotUniform('dotRows').value }, set rows(v) { dotUniform('dotRows').value = v },
    get size() { return dotUniform('dotSize').value }, set size(v) { dotUniform('dotSize').value = v },
    get softness() { return dotUniform('dotSoftness').value }, set softness(v) { dotUniform('dotSoftness').value = v },
    get opacity() { return dotUniform('dotOpacity').value }, set opacity(v) { dotUniform('dotOpacity').value = v },
    copy() {
      copyText([
        `Dot Matrix:`,
        `  cols ${dot.cols}  rows ${dot.rows}`,
        `  size ${dot.size}  softness ${dot.softness}  opacity ${dot.opacity}`,
      ].join('\n'))
    },
  }
  dotFolder.add(dot, 'cols', 10, 400, 1).name('Columns')
  dotFolder.add(dot, 'rows', 10, 300, 1).name('Rows')
  dotFolder.add(dot, 'size', 0, 0.5, 0.01).name('Dot size')
  dotFolder.add(dot, 'softness', 0, 0.5, 0.01).name('Softness')
  dotFolder.add(dot, 'opacity', 0, 1, 0.01).name('Opacity')
  dotFolder.add(dot, 'copy').name('Copy values')
  dotFolder.close()

  // =========================================================
  // Soft Key Light
  // =========================================================
  if (softKey) {
    const skFolder = gui.addFolder('Soft Key Light')
    const sk = {
      get intensity() { return softKey.intensity },
      set intensity(v) { softKey.intensity = v },
      get distance() { return softKey.distance },
      set distance(v) { softKey.distance = v },
      get angle() { return softKey.angle },
      set angle(v) { softKey.angle = v },
      get penumbra() { return softKey.penumbra },
      set penumbra(v) { softKey.penumbra = v },
      get decay() { return softKey.decay },
      set decay(v) { softKey.decay = v },
      get posX() { return softKey.position.x },
      set posX(v) { softKey.position.x = v },
      get posY() { return softKey.position.y },
      set posY(v) { softKey.position.y = v },
      get posZ() { return softKey.position.z },
      set posZ(v) { softKey.position.z = v },
      copy() {
        copyText([
          `Soft Key Light:`,
          `  intensity ${sk.intensity}  distance ${sk.distance}  decay ${sk.decay}`,
          `  angle ${sk.angle.toFixed(3)}  penumbra ${sk.penumbra}`,
          `  pos ${sk.posX} ${sk.posY} ${sk.posZ}`,
        ].join('\n'))
      },
    }
    skFolder.add(sk, 'intensity', 0, 10, 0.1)
    skFolder.add(sk, 'distance', 0, 50, 1)
    skFolder.add(sk, 'angle', 0, Math.PI / 2, 0.01).name('Angle (rad)')
    skFolder.add(sk, 'penumbra', 0, 1, 0.01)
    skFolder.add(sk, 'decay', 0, 3, 0.1)
    skFolder.add(sk, 'posX', -10, 10, 0.1).name('Pos X')
    skFolder.add(sk, 'posY', -10, 10, 0.1).name('Pos Y')
    skFolder.add(sk, 'posZ', -10, 10, 0.1).name('Pos Z')
    skFolder.add(sk, 'copy').name('Copy values')
    skFolder.close()
  }

  // =========================================================
  // Camera
  // =========================================================
  const camFolder = gui.addFolder('Camera')
  const cam = {
    get fov() { return camera.fov },
    set fov(v) { camera.fov = v; camera.updateProjectionMatrix() },
    copy() {
      copyText([
        `Camera:`,
        `  fov ${cam.fov}`,
        `  position ${camera.position.x.toFixed(3)} ${camera.position.y.toFixed(3)} ${camera.position.z.toFixed(3)}`,
      ].join('\n'))
    },
  }
  camFolder.add(cam, 'fov', 10, 90, 1)
  camFolder.add(cam, 'copy').name('Copy values')
  camFolder.close()

  // =========================================================
  // FBX Meshes
  // =========================================================
  if (meshList && meshList.length > 0) {
    const meshFolder = gui.addFolder('Meshes')
    meshList.forEach((mesh, i) => {
      const label = mesh.name || `mesh_${i}`
      const obj = { visible: mesh.visible }
      meshFolder.add(obj, 'visible').name(label).onChange(v => { mesh.visible = v })
    })
    meshFolder.close()
  }

  // =========================================================
  // Copy All
  // =========================================================
  gui.add({
    copyAll() {
      const lines = [
        `Screen: scaleX ${screen.scaleX} scaleY ${screen.scaleY} posX ${screen.posX} posY ${screen.posY} posZ ${screen.posZ} glowBase ${screen.glowBase} glowDistance ${screen.glowDistance}`,
        `Post: bloomStrength ${post.bloomStrength} bloomRadius ${post.bloomRadius} bloomThreshold ${post.bloomThreshold} vignetteOffset ${post.vignetteOffset} vignetteDarkness ${post.vignetteDarkness} exposure ${post.exposure}`,
        `Material: metalness ${mat.metalness} roughness ${mat.roughness} clearcoat ${mat.clearcoat} clearcoatRoughness ${mat.clearcoatRoughness} envMapIntensity ${mat.envMapIntensity}`,
        `Camera: fov ${cam.fov}`,
      ]
      copyText(lines.join('\n'))
    },
  }, 'copyAll').name('Copy All Settings')

  // Toggle with backtick key
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Backquote') {
      gui._hidden ? gui.show() : gui.hide()
    }
  })

  // Start hidden
  gui.hide()

  return gui
}
