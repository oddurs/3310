import GUI from 'lil-gui'
import * as THREE from 'three'
import { createLightDebug } from './light-debug.js'

function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => console.log('Copied to clipboard'),
    () => console.warn('Clipboard write failed')
  )
}

export function createDebug({
  bloomPass,
  vignettePass,
  colorGradePass,
  screenMesh,
  screenMaterial,
  screenGlow,
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
    glowBase: 0.37,
    get glowDistance() { return screenGlow ? screenGlow.distance : 0 },
    set glowDistance(v) { if (screenGlow) screenGlow.distance = v },
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
  // LCD Surface
  // =========================================================
  const lcdFolder = gui.addFolder('LCD Surface')
  const lcd = {
    get emissiveIntensity() { return screenMaterial.emissiveIntensity },
    set emissiveIntensity(v) { screenMaterial.emissiveIntensity = v },
    get roughness() { return screenMaterial.roughness },
    set roughness(v) { screenMaterial.roughness = v },
    get clearcoat() { return screenMaterial.clearcoat },
    set clearcoat(v) { screenMaterial.clearcoat = v },
    get clearcoatRoughness() { return screenMaterial.clearcoatRoughness },
    set clearcoatRoughness(v) { screenMaterial.clearcoatRoughness = v },
    get envMapIntensity() { return screenMaterial.envMapIntensity },
    set envMapIntensity(v) { screenMaterial.envMapIntensity = v },
    get contrast() { const s = getScreenShaderRef(); return s ? s.uniforms.lcdContrast.value : 1 },
    set contrast(v) { const s = getScreenShaderRef(); if (s) s.uniforms.lcdContrast.value = v },
    get brightness() { const s = getScreenShaderRef(); return s ? s.uniforms.lcdBrightness.value : 0 },
    set brightness(v) { const s = getScreenShaderRef(); if (s) s.uniforms.lcdBrightness.value = v },
    get toneMapped() { return screenMaterial.toneMapped },
    set toneMapped(v) { screenMaterial.toneMapped = v; screenMaterial.needsUpdate = true },
    copy() {
      copyText([
        `LCD Surface:`,
        `  emissiveIntensity ${lcd.emissiveIntensity}  roughness ${lcd.roughness}`,
        `  clearcoat ${lcd.clearcoat}  clearcoatRoughness ${lcd.clearcoatRoughness}`,
        `  envMapIntensity ${lcd.envMapIntensity}`,
        `  contrast ${lcd.contrast}  brightness ${lcd.brightness}`,
        `  toneMapped ${lcd.toneMapped}`,
      ].join('\n'))
    },
  }
  lcdFolder.add(lcd, 'emissiveIntensity', 0, 3, 0.01).name('Emissive')
  lcdFolder.add(lcd, 'contrast', 0, 3, 0.01).name('Contrast')
  lcdFolder.add(lcd, 'brightness', -1, 1, 0.01).name('Brightness')
  lcdFolder.add(lcd, 'roughness', 0, 1, 0.01).name('Roughness')
  lcdFolder.add(lcd, 'clearcoat', 0, 1, 0.01).name('Clearcoat')
  lcdFolder.add(lcd, 'clearcoatRoughness', 0, 1, 0.01).name('Clearcoat rough')
  lcdFolder.add(lcd, 'envMapIntensity', 0, 2, 0.01).name('Env reflections')
  lcdFolder.add(lcd, 'toneMapped').name('Tone mapped')
  lcdFolder.add(lcd, 'copy').name('Copy values')
  lcdFolder.close()

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
  // Color Grading
  // =========================================================
  const PRESET_NAMES = ['None', 'Cinematic Warm', 'Cool Blue', 'Vintage', 'Noir', 'Teal & Orange', 'Cross Process', 'Faded Film']
  const cgFolder = gui.addFolder('Color Grading')
  const cg = {
    presetName: PRESET_NAMES[0],
    get intensity() { return colorGradePass.uniforms.intensity.value },
    set intensity(v) { colorGradePass.uniforms.intensity.value = v },
    get saturation() { return colorGradePass.uniforms.saturation.value },
    set saturation(v) { colorGradePass.uniforms.saturation.value = v },
    get temperature() { return colorGradePass.uniforms.temperature.value },
    set temperature(v) { colorGradePass.uniforms.temperature.value = v },
    get tint() { return colorGradePass.uniforms.tint.value },
    set tint(v) { colorGradePass.uniforms.tint.value = v },
    get gamma() { return colorGradePass.uniforms.gamma.value },
    set gamma(v) { colorGradePass.uniforms.gamma.value = v },
    get shadows() { return colorGradePass.uniforms.shadows.value },
    set shadows(v) { colorGradePass.uniforms.shadows.value = v },
    get highlights() { return colorGradePass.uniforms.highlights.value },
    set highlights(v) { colorGradePass.uniforms.highlights.value = v },
    copy() {
      copyText([
        `Color Grading:`,
        `  preset ${cg.presetName}  intensity ${cg.intensity}`,
        `  saturation ${cg.saturation}  temperature ${cg.temperature}  tint ${cg.tint}`,
        `  gamma ${cg.gamma}  shadows ${cg.shadows}  highlights ${cg.highlights}`,
      ].join('\n'))
    },
  }
  cgFolder.add(cg, 'presetName', PRESET_NAMES).name('Preset').onChange(v => {
    const idx = PRESET_NAMES.indexOf(v)
    colorGradePass.uniforms.preset.value = idx
    if (idx > 0 && cg.intensity === 0) {
      cg.intensity = 0.7
      cgFolder.controllersRecursive().forEach(c => c.updateDisplay())
    }
  })
  cgFolder.add(cg, 'intensity', 0, 1, 0.01).name('Intensity')
  cgFolder.add(cg, 'saturation', 0, 2, 0.01).name('Saturation')
  cgFolder.add(cg, 'temperature', -2, 2, 0.01).name('Temperature')
  cgFolder.add(cg, 'tint', -2, 2, 0.01).name('Tint')
  cgFolder.add(cg, 'gamma', 0.2, 3, 0.01).name('Gamma')
  cgFolder.add(cg, 'shadows', -1, 1, 0.01).name('Shadows')
  cgFolder.add(cg, 'highlights', -1, 1, 0.01).name('Highlights')
  cgFolder.add(cg, 'copy').name('Copy values')
  cgFolder.close()

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
  // Bezel Frame (raised area around screen)
  // =========================================================
  const tzFolder = gui.addFolder('Bezel Frame')
  const tz = {
    get darken() { const s = getShaderRef(); return s ? s.uniforms.topZoneDarken.value : 0.45 },
    set darken(v) { const s = getShaderRef(); if (s) s.uniforms.topZoneDarken.value = v },
    get tintR() { const s = getShaderRef(); return s ? s.uniforms.topZoneTint.value.x : 1 },
    set tintR(v) { const s = getShaderRef(); if (s) s.uniforms.topZoneTint.value.x = v },
    get tintG() { const s = getShaderRef(); return s ? s.uniforms.topZoneTint.value.y : 1 },
    set tintG(v) { const s = getShaderRef(); if (s) s.uniforms.topZoneTint.value.y = v },
    get tintB() { const s = getShaderRef(); return s ? s.uniforms.topZoneTint.value.z : 1 },
    set tintB(v) { const s = getShaderRef(); if (s) s.uniforms.topZoneTint.value.z = v },
    get alpha() { const s = getShaderRef(); return s ? s.uniforms.topZoneAlpha.value : 1 },
    set alpha(v) { const s = getShaderRef(); if (s) s.uniforms.topZoneAlpha.value = v },
    get zThreshold() { const s = getShaderRef(); return s ? s.uniforms.bezelZThreshold.value : 0.30 },
    set zThreshold(v) { const s = getShaderRef(); if (s) s.uniforms.bezelZThreshold.value = v },
    copy() {
      copyText([
        `Bezel Frame:`,
        `  darken ${tz.darken}  alpha ${tz.alpha}`,
        `  tint (${tz.tintR}, ${tz.tintG}, ${tz.tintB})`,
        `  zThreshold ${tz.zThreshold}`,
      ].join('\n'))
    },
  }
  tzFolder.add(tz, 'darken', 0, 2, 0.01).name('Darken')
  tzFolder.add(tz, 'tintR', 0, 2, 0.01).name('Tint R')
  tzFolder.add(tz, 'tintG', 0, 2, 0.01).name('Tint G')
  tzFolder.add(tz, 'tintB', 0, 2, 0.01).name('Tint B')
  tzFolder.add(tz, 'alpha', 0, 1, 0.01).name('Alpha')
  tzFolder.add(tz, 'zThreshold', 0, 0.6, 0.01).name('Z threshold')
  tzFolder.add(tz, 'copy').name('Copy values')
  tzFolder.close()

  // =========================================================
  // Backing Plane (interior blocker behind screen)
  // =========================================================
  const bpFolder = gui.addFolder('Backing Plane')
  const bp = {
    get posZ() { return backingMesh.position.z },
    set posZ(v) { backingMesh.position.z = v },
    get scaleX() { return backingMesh.scale.x },
    set scaleX(v) { backingMesh.scale.x = v },
    get scaleY() { return backingMesh.scale.y },
    set scaleY(v) { backingMesh.scale.y = v },
    get color() { return '#' + backingMesh.material.color.getHexString() },
    set color(v) { backingMesh.material.color.set(v) },
    get visible() { return backingMesh.visible },
    set visible(v) { backingMesh.visible = v },
    copy() {
      copyText([
        `Backing Plane:`,
        `  z ${bp.posZ}  scale (${bp.scaleX}, ${bp.scaleY})`,
        `  color ${bp.color}  visible ${bp.visible}`,
      ].join('\n'))
    },
  }
  bpFolder.add(bp, 'posZ', -0.5, 0.5, 0.01).name('Z position')
  bpFolder.add(bp, 'scaleX', 0.5, 3, 0.01).name('Scale X')
  bpFolder.add(bp, 'scaleY', 0.5, 3, 0.01).name('Scale Y')
  bpFolder.addColor(bp, 'color').name('Color')
  bpFolder.add(bp, 'visible').name('Visible')
  bpFolder.add(bp, 'copy').name('Copy values')
  bpFolder.close()

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
  // HDRI Environment Lighting
  // =========================================================
  const hdriFolder = gui.addFolder('HDRI Environment')
  const hdri = {
    get envIntensity() { return scene.environmentIntensity ?? 1.0 },
    set envIntensity(v) { scene.environmentIntensity = v },
    get envRotation() { return scene.environmentRotation?.y ?? 0 },
    set envRotation(v) {
      if (!scene.environmentRotation) scene.environmentRotation = new THREE.Euler()
      scene.environmentRotation.y = v
    },
    get bgIntensity() { return scene.backgroundIntensity ?? 1.0 },
    set bgIntensity(v) { scene.backgroundIntensity = v },
    get bgBlurriness() { return scene.backgroundBlurriness ?? 0 },
    set bgBlurriness(v) { scene.backgroundBlurriness = v },
    get phoneEnvMap() { return phoneMaterial.envMapIntensity },
    set phoneEnvMap(v) { phoneMaterial.envMapIntensity = v },
    get exposure() { return renderer.toneMappingExposure },
    set exposure(v) { renderer.toneMappingExposure = v },
    copy() {
      copyText([
        `HDRI Environment:`,
        `  envIntensity ${hdri.envIntensity}  bgIntensity ${hdri.bgIntensity}`,
        `  bgBlurriness ${hdri.bgBlurriness}  envRotation ${hdri.envRotation.toFixed(2)}`,
        `  phoneEnvMap ${hdri.phoneEnvMap}  exposure ${hdri.exposure}`,
      ].join('\n'))
    },
  }
  hdriFolder.add(hdri, 'envIntensity', 0, 5, 0.01).name('Env intensity')
  hdriFolder.add(hdri, 'envRotation', -Math.PI, Math.PI, 0.01).name('Env rotation')
  hdriFolder.add(hdri, 'bgIntensity', 0, 5, 0.01).name('BG intensity')
  hdriFolder.add(hdri, 'bgBlurriness', 0, 1, 0.01).name('BG blurriness')
  hdriFolder.add(hdri, 'phoneEnvMap', 0, 5, 0.01).name('Phone envMap')
  hdriFolder.add(hdri, 'exposure', 0, 5, 0.01).name('Exposure')
  hdriFolder.add(hdri, 'copy').name('Copy values')

  // =========================================================
  // Lighting (full suite with diagram + helpers + per-light controls)
  // =========================================================
  let lightDebug = null
  if (lights && scene) {
    lightDebug = createLightDebug(gui, scene, lights, screenGlow, camera)
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

  return { gui, lightDebug }
}
