import * as THREE from 'three'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'

// ─── Light icon shapes for the 2D diagram ───
const ICONS = {
  rect: (ctx, x, y, r, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x - r, y - r * 0.6, r * 2, r * 1.2)
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.strokeRect(x - r, y - r * 0.6, r * 2, r * 1.2)
  },
  dir: (ctx, x, y, r, color) => {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r); ctx.lineTo(x - r, y + r); ctx.closePath(); ctx.fill()
  },
  spot: (ctx, x, y, r, color) => {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = color; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(-0.4) * r * 2.5, y + Math.sin(-0.4) * r * 2.5)
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(0.4) * r * 2.5, y + Math.sin(0.4) * r * 2.5)
    ctx.stroke()
  },
  point: (ctx, x, y, r, color) => {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.arc(x, y, r * 2, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
  },
  ambient: (ctx, x, y, r, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5)
      ctx.lineTo(x + Math.cos(a) * r * 1.8, y + Math.sin(a) * r * 1.8)
      ctx.stroke()
    }
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill()
  },
  camera: (ctx, x, y, r, color) => {
    // Camera body
    ctx.fillStyle = color
    ctx.fillRect(x - r * 1.2, y - r * 0.8, r * 2.4, r * 1.6)
    // Lens
    ctx.beginPath()
    ctx.moveTo(x + r * 1.2, y - r * 0.5)
    ctx.lineTo(x + r * 2.2, y - r * 0.8)
    ctx.lineTo(x + r * 2.2, y + r * 0.8)
    ctx.lineTo(x + r * 1.2, y + r * 0.5)
    ctx.closePath()
    ctx.fill()
    // FOV cone
    ctx.strokeStyle = color + '60'; ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - r * 6, y - r * 4)
    ctx.moveTo(x, y)
    ctx.lineTo(x - r * 6, y + r * 4)
    ctx.stroke()
    ctx.setLineDash([])
  },
}

// ─── 2D Schematic Diagram ───
function createDiagram(lights, screenGlow, camera) {
  const panel = document.createElement('div')
  panel.style.cssText = 'position:fixed;top:10px;left:10px;z-index:10000;background:rgba(15,15,20,0.92);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:16px;display:none;font-family:monospace;user-select:none;backdrop-filter:blur(8px);'

  // Header
  const header = document.createElement('div')
  header.style.cssText = 'color:rgba(255,255,255,0.8);font-size:13px;font-weight:bold;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;letter-spacing:1px;'
  header.innerHTML = '<span>LIGHTING RIG</span>'
  const closeBtn = document.createElement('span')
  closeBtn.textContent = '\u2715'
  closeBtn.style.cssText = 'cursor:pointer;padding:2px 8px;font-size:14px;opacity:0.6;'
  closeBtn.onmouseenter = () => { closeBtn.style.opacity = '1' }
  closeBtn.onmouseleave = () => { closeBtn.style.opacity = '0.6' }
  closeBtn.onclick = () => { panel.style.display = 'none' }
  header.appendChild(closeBtn)
  panel.appendChild(header)

  // View tabs
  const tabBar = document.createElement('div')
  tabBar.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;'
  let currentView = 'top'
  const views = ['top', 'side', 'front']
  const tabBtns = {}
  views.forEach(v => {
    const btn = document.createElement('button')
    btn.textContent = v === 'top' ? 'Top (XZ)' : v === 'side' ? 'Side (YZ)' : 'Front (XY)'
    btn.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:12px;font-family:monospace;padding:5px 12px;cursor:pointer;border-radius:4px;transition:all 0.15s;'
    btn.onclick = () => { currentView = v; updateTabs(); draw() }
    tabBar.appendChild(btn)
    tabBtns[v] = btn
  })
  panel.appendChild(tabBar)

  function updateTabs() {
    views.forEach(v => {
      tabBtns[v].style.background = v === currentView ? 'rgba(100,140,255,0.3)' : 'rgba(255,255,255,0.08)'
      tabBtns[v].style.color = v === currentView ? 'rgba(180,200,255,0.95)' : 'rgba(255,255,255,0.6)'
      tabBtns[v].style.borderColor = v === currentView ? 'rgba(100,140,255,0.5)' : 'rgba(255,255,255,0.15)'
    })
  }
  updateTabs()

  // Canvas — bigger
  const W = 440, H = 440
  const dpr = 2
  const canvas = document.createElement('canvas')
  canvas.width = W * dpr; canvas.height = H * dpr
  canvas.style.cssText = `width:${W}px;height:${H}px;border-radius:6px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);`
  panel.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // Legend
  const legend = document.createElement('div')
  legend.style.cssText = 'margin-top:12px;display:flex;flex-wrap:wrap;gap:8px 16px;'
  panel.appendChild(legend)

  const lightDefs = [
    { id: 'key',       label: 'Key',        light: lights.key,       icon: 'rect',    color: '#ffcc44' },
    { id: 'keyShadow', label: 'Key Shad',   light: lights.keyShadow, icon: 'dir',     color: '#cc9933' },
    { id: 'fill',      label: 'Fill',       light: lights.fill,      icon: 'rect',    color: '#88aaff' },
    { id: 'rim',       label: 'Rim',        light: lights.rim,       icon: 'dir',     color: '#dddddd' },
    { id: 'soft',      label: 'Soft',       light: lights.soft,      icon: 'spot',    color: '#ffdd88' },
    { id: 'ambient',   label: 'Ambient',    light: lights.ambient,   icon: 'ambient', color: '#8090aa' },
    ...(screenGlow ? [{ id: 'glow', label: 'Glow', light: screenGlow, icon: 'point', color: '#aabb88' }] : []),
    { id: 'camera',    label: 'Camera',     light: null,             icon: 'camera',  color: '#ff6688' },
  ]

  lightDefs.forEach(d => {
    const item = document.createElement('div')
    item.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,0.6);'
    const dot = document.createElement('span')
    dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${d.color};display:inline-block;flex-shrink:0;`
    item.appendChild(dot)
    item.appendChild(document.createTextNode(d.label))
    legend.appendChild(item)
  })

  function worldToCanvas(pos) {
    const scale = W / 28  // 28 world units fit across canvas
    const cx = W / 2, cy = H / 2
    let px, py
    if (currentView === 'top') {
      px = cx + pos.x * scale
      py = cy - pos.z * scale
    } else if (currentView === 'side') {
      px = cx + pos.z * scale
      py = cy - pos.y * scale
    } else {
      px = cx + pos.x * scale
      py = cy - pos.y * scale
    }
    return { x: px, y: py }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.5
    const gridStep = W / 14  // 2-unit grid
    for (let i = 0; i <= 14; i++) {
      const p = i * gridStep
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(W, p); ctx.stroke()
    }

    // Center axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px monospace'
    ctx.textAlign = 'right'
    if (currentView === 'top') {
      ctx.fillText('+X', W - 8, H / 2 - 6)
      ctx.textAlign = 'center'
      ctx.fillText('+Z', W / 2, 16)
    } else if (currentView === 'side') {
      ctx.fillText('+Z', W - 8, H / 2 - 6)
      ctx.textAlign = 'center'
      ctx.fillText('+Y', W / 2, 16)
    } else {
      ctx.fillText('+X', W - 8, H / 2 - 6)
      ctx.textAlign = 'center'
      ctx.fillText('+Y', W / 2, 16)
    }

    // Scale markers
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    for (let i = -6; i <= 6; i += 2) {
      if (i === 0) continue
      const p = worldToCanvas(new THREE.Vector3(i, i, i))
      if (currentView === 'top') {
        ctx.fillText(i, p.x, H / 2 + 12)
        ctx.fillText(i, W / 2 + 12, H / 2 - (i * W / 28) + 3)
      } else if (currentView === 'side') {
        ctx.fillText(i, p.x, H / 2 + 12)
      } else {
        ctx.fillText(i, p.x, H / 2 + 12)
      }
    }

    // Phone silhouette
    const phoneW = 1.5, phoneH = 5
    let p1, p2
    if (currentView === 'top') {
      p1 = worldToCanvas(new THREE.Vector3(-phoneW / 2, 0, -0.3))
      p2 = worldToCanvas(new THREE.Vector3(phoneW / 2, 0, 0.3))
    } else if (currentView === 'side') {
      p1 = worldToCanvas(new THREE.Vector3(0, -phoneH / 2, -0.3))
      p2 = worldToCanvas(new THREE.Vector3(0, phoneH / 2, 0.3))
    } else {
      p1 = worldToCanvas(new THREE.Vector3(-phoneW / 2, -phoneH / 2, 0))
      p2 = worldToCanvas(new THREE.Vector3(phoneW / 2, phoneH / 2, 0))
    }
    const rx = Math.min(p1.x, p2.x), ry = Math.min(p1.y, p2.y)
    const rw = Math.abs(p2.x - p1.x), rh = Math.abs(p2.y - p1.y)
    ctx.fillStyle = 'rgba(80,100,120,0.3)'
    ctx.strokeStyle = 'rgba(100,130,160,0.6)'
    ctx.lineWidth = 1.5
    const pr = 4
    ctx.beginPath()
    ctx.roundRect(rx, ry, Math.max(rw, 8), Math.max(rh, 8), pr)
    ctx.fill(); ctx.stroke()

    // Phone label
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    const phoneLabelPos = worldToCanvas(new THREE.Vector3(0, 0, 0))
    ctx.fillText('PHONE', phoneLabelPos.x, phoneLabelPos.y + 4)

    // Draw camera
    if (camera) {
      const camPos = camera.position
      const cp = worldToCanvas(camPos)

      // FOV cone toward origin
      const origin = worldToCanvas(new THREE.Vector3(0, 0, 0))
      const dx = origin.x - cp.x, dy = origin.y - cp.y
      const angle = Math.atan2(dy, dx)
      const fovHalf = (camera.fov * Math.PI / 180) / 2
      const coneLen = 60

      ctx.strokeStyle = 'rgba(255,102,136,0.15)'
      ctx.fillStyle = 'rgba(255,102,136,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cp.x, cp.y)
      ctx.lineTo(cp.x + Math.cos(angle - fovHalf) * coneLen, cp.y + Math.sin(angle - fovHalf) * coneLen)
      ctx.lineTo(cp.x + Math.cos(angle + fovHalf) * coneLen, cp.y + Math.sin(angle + fovHalf) * coneLen)
      ctx.closePath()
      ctx.fill(); ctx.stroke()

      // Camera body
      const camColor = '#ff6688'
      ctx.fillStyle = camColor
      ctx.beginPath(); ctx.arc(cp.x, cp.y, 7, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = camColor; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(cp.x, cp.y, 7, 0, Math.PI * 2); ctx.stroke()

      // Inner dot
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(cp.x, cp.y, 2.5, 0, Math.PI * 2); ctx.fill()

      // Direction line
      ctx.strokeStyle = camColor + 'aa'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cp.x, cp.y)
      ctx.lineTo(cp.x + Math.cos(angle) * 20, cp.y + Math.sin(angle) * 20)
      ctx.stroke()

      // Label
      ctx.fillStyle = camColor + 'cc'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('CAM', cp.x, cp.y - 14)

      // Position text
      ctx.fillStyle = camColor + '88'
      ctx.font = '9px monospace'
      ctx.fillText(`(${camPos.x.toFixed(1)}, ${camPos.y.toFixed(1)}, ${camPos.z.toFixed(1)})`, cp.x, cp.y + 20)
    }

    // Draw lights
    lightDefs.forEach(d => {
      if (!d.light || !d.light.visible) return
      const pos = d.light.getWorldPosition ? d.light.getWorldPosition(new THREE.Vector3()) : d.light.position.clone()
      const p = worldToCanvas(pos)

      // Direction line to origin
      const origin = worldToCanvas(new THREE.Vector3(0, 0, 0))
      ctx.strokeStyle = d.color + '30'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(origin.x, origin.y); ctx.stroke()
      ctx.setLineDash([])

      // Intensity ring (size proportional to intensity)
      const intensityR = Math.min(d.light.intensity * 4, 30)
      ctx.fillStyle = d.color + '08'
      ctx.strokeStyle = d.color + '15'
      ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.arc(p.x, p.y, intensityR, 0, Math.PI * 2); ctx.fill(); ctx.stroke()

      // Icon
      ICONS[d.icon](ctx, p.x, p.y, 8, d.color)

      // Label
      ctx.fillStyle = d.color + 'cc'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(d.label, p.x, p.y - 14)

      // Intensity value
      const intensity = d.light.intensity !== undefined ? d.light.intensity.toFixed(1) : ''
      if (intensity) {
        ctx.fillStyle = d.color + '77'
        ctx.font = '10px monospace'
        ctx.fillText(intensity, p.x, p.y + 20)
      }
    })
  }

  // Draggable
  let dragging = false, dragX = 0, dragY = 0
  header.style.cursor = 'move'
  header.addEventListener('mousedown', (e) => {
    dragging = true
    dragX = e.clientX - panel.offsetLeft
    dragY = e.clientY - panel.offsetTop
    e.preventDefault()
  })
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return
    panel.style.left = (e.clientX - dragX) + 'px'
    panel.style.top = (e.clientY - dragY) + 'px'
  })
  window.addEventListener('mouseup', () => { dragging = false })

  document.body.appendChild(panel)

  return {
    show() { panel.style.display = 'block'; draw() },
    hide() { panel.style.display = 'none' },
    toggle() { panel.style.display === 'none' ? this.show() : this.hide() },
    update: draw,
    element: panel,
  }
}

// ─── Three.js Light Helpers ───
function createHelpers(scene, lights, screenGlow) {
  const helpers = {}

  // Key light (RectArea)
  const keyHelper = new RectAreaLightHelper(lights.key)
  lights.key.add(keyHelper)
  helpers.key = keyHelper

  // Key shadow (Directional)
  const keyShadowHelper = new THREE.DirectionalLightHelper(lights.keyShadow, 2, 0xffcc44)
  scene.add(keyShadowHelper)
  helpers.keyShadow = keyShadowHelper

  // Fill light (RectArea)
  const fillHelper = new RectAreaLightHelper(lights.fill)
  lights.fill.add(fillHelper)
  helpers.fill = fillHelper

  // Rim light (Directional)
  const rimHelper = new THREE.DirectionalLightHelper(lights.rim, 2, 0xffffff)
  scene.add(rimHelper)
  helpers.rim = rimHelper

  // Soft key (Spot)
  const softHelper = new THREE.SpotLightHelper(lights.soft, 0xffdd88)
  scene.add(softHelper)
  helpers.soft = softHelper

  // Screen glow (Point)
  if (screenGlow) {
    const glowHelper = new THREE.PointLightHelper(screenGlow, 0.2, 0xaabb88)
    scene.add(glowHelper)
    helpers.glow = glowHelper
  }

  // Shadow camera helper
  const shadowCamHelper = new THREE.CameraHelper(lights.keyShadow.shadow.camera)
  scene.add(shadowCamHelper)
  shadowCamHelper.visible = false
  helpers.shadowCam = shadowCamHelper

  // Start all invisible
  Object.values(helpers).forEach(h => { h.visible = false })

  function setVisible(v) {
    Object.entries(helpers).forEach(([key, h]) => {
      if (key !== 'shadowCam') h.visible = v
    })
  }

  function updateAll() {
    if (helpers.keyShadow.visible) helpers.keyShadow.update()
    if (helpers.rim.visible) helpers.rim.update()
    if (helpers.soft.visible) helpers.soft.update()
  }

  return { helpers, setVisible, updateAll }
}

// ─── lil-gui Controls ───
function addLightFolder(gui, name, light, helpers, diagram) {
  const folder = gui.addFolder(name)
  const type = light.type

  folder.add(light, 'visible').name('Enabled').onChange(() => diagram.update())
  folder.addColor({ color: '#' + light.color.getHexString() }, 'color').name('Color').onChange(v => {
    light.color.set(v)
    diagram.update()
  })
  folder.add(light, 'intensity', 0, type === 'SpotLight' ? 30 : 5, 0.01).name('Intensity').onChange(() => diagram.update())

  if (type !== 'AmbientLight') {
    const posFolder = folder.addFolder('Position')
    posFolder.add(light.position, 'x', -20, 20, 0.1).name('X').onChange(() => diagram.update())
    posFolder.add(light.position, 'y', -20, 20, 0.1).name('Y').onChange(() => diagram.update())
    posFolder.add(light.position, 'z', -20, 20, 0.1).name('Z').onChange(() => diagram.update())
    posFolder.close()
  }

  if (type === 'RectAreaLight') {
    folder.add(light, 'width', 0.5, 40, 0.5).name('Width')
    folder.add(light, 'height', 0.5, 40, 0.5).name('Height')
  }

  if (type === 'SpotLight') {
    folder.add(light, 'angle', 0, Math.PI / 2, 0.01).name('Angle')
    folder.add(light, 'penumbra', 0, 1, 0.01).name('Penumbra')
    folder.add(light, 'decay', 0, 3, 0.1).name('Decay')
    folder.add(light, 'distance', 0, 100, 1).name('Distance')
  }

  if (type === 'DirectionalLight' && light.castShadow) {
    const shadowFolder = folder.addFolder('Shadow')
    shadowFolder.add(light.shadow, 'radius', 0, 20, 0.5).name('Radius')
    shadowFolder.add(light.shadow, 'bias', -0.01, 0.01, 0.0001).name('Bias')
    shadowFolder.add(light.shadow, 'normalBias', -0.1, 0.1, 0.001).name('Normal Bias')
    shadowFolder.close()
  }

  if (type === 'PointLight') {
    folder.add(light, 'distance', 0, 20, 0.1).name('Distance')
    folder.add(light, 'decay', 0, 3, 0.1).name('Decay')
  }

  folder.add({
    copy() {
      const pos = light.position ? `pos (${light.position.x.toFixed(1)}, ${light.position.y.toFixed(1)}, ${light.position.z.toFixed(1)})` : ''
      const lines = [
        `${name}: ${type}`,
        `  intensity ${light.intensity}  color #${light.color.getHexString()}`,
      ]
      if (pos) lines.push(`  ${pos}`)
      if (type === 'RectAreaLight') lines.push(`  width ${light.width}  height ${light.height}`)
      if (type === 'SpotLight') lines.push(`  angle ${light.angle.toFixed(3)}  penumbra ${light.penumbra}  decay ${light.decay}  distance ${light.distance}`)
      if (type === 'PointLight') lines.push(`  distance ${light.distance}  decay ${light.decay}`)
      navigator.clipboard.writeText(lines.join('\n'))
    },
  }, 'copy').name('Copy values')

  folder.close()
  return folder
}

// ─── Main export ───
export function createLightDebug(gui, scene, lights, screenGlow, camera) {
  const lightingFolder = gui.addFolder('Lighting')

  const diagram = createDiagram(lights, screenGlow, camera)
  const { helpers, setVisible, updateAll } = createHelpers(scene, lights, screenGlow)

  const master = {
    showDiagram: false,
    showHelpers: false,
    showShadowCam: false,
  }
  lightingFolder.add(master, 'showDiagram').name('Show diagram').onChange(v => v ? diagram.show() : diagram.hide())
  lightingFolder.add(master, 'showHelpers').name('Show 3D helpers').onChange(v => { setVisible(v); updateAll() })
  lightingFolder.add(master, 'showShadowCam').name('Shadow camera').onChange(v => { helpers.shadowCam.visible = v })

  addLightFolder(lightingFolder, 'Key Light', lights.key, helpers, diagram)
  addLightFolder(lightingFolder, 'Key Shadow', lights.keyShadow, helpers, diagram)
  addLightFolder(lightingFolder, 'Fill Light', lights.fill, helpers, diagram)
  addLightFolder(lightingFolder, 'Rim Light', lights.rim, helpers, diagram)
  addLightFolder(lightingFolder, 'Soft Key', lights.soft, helpers, diagram)
  addLightFolder(lightingFolder, 'Ambient', lights.ambient, helpers, diagram)
  if (screenGlow) addLightFolder(lightingFolder, 'Screen Glow', screenGlow, helpers, diagram)

  lightingFolder.add({
    copyAll() {
      const lines = []
      const allLights = [
        { name: 'Key', l: lights.key },
        { name: 'Key Shadow', l: lights.keyShadow },
        { name: 'Fill', l: lights.fill },
        { name: 'Rim', l: lights.rim },
        { name: 'Soft Key', l: lights.soft },
        { name: 'Ambient', l: lights.ambient },
      ]
      if (screenGlow) allLights.push({ name: 'Screen Glow', l: screenGlow })
      allLights.forEach(({ name, l }) => {
        const pos = l.position ? `(${l.position.x.toFixed(1)}, ${l.position.y.toFixed(1)}, ${l.position.z.toFixed(1)})` : 'n/a'
        lines.push(`${name}: intensity=${l.intensity} color=#${l.color.getHexString()} pos=${pos}`)
      })
      navigator.clipboard.writeText(lines.join('\n'))
    },
  }, 'copyAll').name('Copy all lighting')

  lightingFolder.close()

  return {
    update() {
      updateAll()
      if (diagram.element.style.display !== 'none') {
        diagram.update()
      }
    },
    diagram,
  }
}
