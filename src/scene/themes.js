import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

const THEMES = [
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
    id: 'dark_forest',
    label: 'Dark Forest',
    hdr: '/env/dark_autumn_forest_2k.hdr',
    backplate: '/env/dark_autumn_forest_8k.jpg',
  },
  {
    id: 'golden_sunset',
    label: 'Golden Sunset',
    hdr: '/env/kloppenheim_06_2k.hdr',
    backplate: '/env/kloppenheim_06_8k.jpg',
  },
  {
    id: 'starry_safari',
    label: 'Starry Safari',
    hdr: '/env/dikhololo_night_2k.hdr',
    backplate: '/env/dikhololo_night_8k.jpg',
  },
]

const FONT = '"Nokia", monospace'
const BTN_STYLE = `background:none;border:none;color:rgba(255,255,255,0.5);font-size:20px;cursor:pointer;padding:4px 8px;transition:color 0.2s;font-family:${FONT};-webkit-font-smoothing:none;`
const LABEL_STYLE = `color:rgba(255,255,255,0.6);font-size:16px;font-family:${FONT};white-space:nowrap;user-select:none;letter-spacing:0.5px;-webkit-font-smoothing:none;`

function makeArrow(text, onClick) {
  const btn = document.createElement('button')
  btn.textContent = text
  btn.style.cssText = BTN_STYLE
  btn.addEventListener('mouseenter', () => { btn.style.color = 'rgba(255,255,255,0.9)' })
  btn.addEventListener('mouseleave', () => { btn.style.color = 'rgba(255,255,255,0.5)' })
  btn.addEventListener('click', onClick)
  return btn
}

export function createThemeManager(scene, radio) {
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
    updateThemeLabel()
  }

  function prev() {
    currentIndex = (currentIndex - 1 + THEMES.length) % THEMES.length
    loadTheme(currentIndex)
    updateThemeLabel()
  }

  function goTo(index) {
    currentIndex = index
    loadTheme(currentIndex)
    updateThemeLabel()
  }

  // === BOTTOM BAR UI ===
  const bar = document.createElement('div')
  bar.style.cssText = 'position:fixed;bottom:20px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 24px;z-index:10;pointer-events:none;'

  // --- Environment controls (left side) ---
  const envGroup = document.createElement('div')
  envGroup.style.cssText = 'display:flex;align-items:center;gap:2px;pointer-events:auto;'

  const envLabel = document.createElement('span')
  envLabel.style.cssText = LABEL_STYLE + 'min-width:100px;text-align:center;'
  envLabel.textContent = THEMES[0].label

  envGroup.appendChild(makeArrow('\u2039', prev))
  envGroup.appendChild(envLabel)
  envGroup.appendChild(makeArrow('\u203A', next))
  bar.appendChild(envGroup)

  function updateThemeLabel() {
    envLabel.textContent = THEMES[currentIndex].label
  }

  // --- Radio controls (right side) ---
  if (radio) {
    const radioGroup = document.createElement('div')
    radioGroup.style.cssText = 'display:flex;align-items:center;gap:4px;pointer-events:auto;'

    const radioLabel = document.createElement('span')
    radioLabel.style.cssText = LABEL_STYLE + 'min-width:110px;text-align:center;'
    radioLabel.textContent = radio.getStation().name

    // pixelarticons speaker SVGs (24x24 grid, rendered at 24px for crisp pixels)
    const svgOn = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2h2v20h-2v-2H9v-2h2V6H9V4h2V2zM7 8V6h2v2H7zm0 8H3V8h4v2H5v4h2v2zm0 0v2h2v-2H7zm10-6h-2v4h2v-4zm2-2h2v8h-2V8zm0 8v2h-4v-2h4zm0-10v2h-4V6h4z"/></svg>'
    const svgOff = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2h-2v2H9v2H7v2H3v8h4v2h2v2h2v2h2V2zM9 18v-2H7v-2H5v-4h2V8h2V6h2v12H9zm10-6.777h-2v-2h-2v2h2v2h-2v2h2v-2h2v2h2v-2h-2v-2zm0 0h2v-2h-2v2z"/></svg>'

    // Volume wrapper — positions the popup relative to the speaker button
    const volWrap = document.createElement('div')
    volWrap.style.cssText = 'position:relative;display:flex;align-items:center;'

    // Speaker button (24px icon)
    const muteBtn = document.createElement('button')
    muteBtn.style.cssText = 'background:none;border:none;cursor:pointer;padding:4px;color:rgba(255,255,255,0.5);transition:color 0.2s;display:flex;align-items:center;'
    muteBtn.innerHTML = `<span style="width:24px;height:24px;display:block;">${svgOff}</span>`

    // Nokia-style vertical volume popup — blocky bar segments
    const NUM_BARS = 8
    const volPopup = document.createElement('div')
    volPopup.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);padding:6px 5px;margin-bottom:4px;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.15);opacity:0;pointer-events:none;transition:opacity 0.2s;display:flex;flex-direction:column-reverse;align-items:center;gap:2px;'

    const bars = []
    for (let i = 0; i < NUM_BARS; i++) {
      const bar_ = document.createElement('div')
      bar_.style.cssText = 'width:10px;height:4px;background:rgba(255,255,255,0.15);cursor:pointer;transition:background 0.05s;'
      bars.push(bar_)
      volPopup.appendChild(bar_)
    }

    function setVolFromBar(i) {
      const v = (i + 1) / NUM_BARS
      radio.setVolume(v * 0.1)
      updateVolBars()
    }

    function barIndexFromY(clientY) {
      const rect = volPopup.getBoundingClientRect()
      // column-reverse: bottom bar is index 0, top bar is index NUM_BARS-1
      const ratio = 1 - (clientY - rect.top) / rect.height
      return Math.max(0, Math.min(NUM_BARS - 1, Math.floor(ratio * NUM_BARS)))
    }

    // Drag support: mousedown on popup starts drag, mousemove updates, mouseup ends
    let dragging = false
    volPopup.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      dragging = true
      volPopup.setPointerCapture(e.pointerId)
      setVolFromBar(barIndexFromY(e.clientY))
    })
    volPopup.addEventListener('pointermove', (e) => {
      if (!dragging) return
      setVolFromBar(barIndexFromY(e.clientY))
    })
    volPopup.addEventListener('pointerup', () => { dragging = false })
    volPopup.addEventListener('pointercancel', () => { dragging = false })

    function updateVolBars() {
      const filled = Math.round(radio.getVolume() / 0.1 * NUM_BARS)
      bars.forEach((b, i) => {
        b.style.background = i < filled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.15)'
      })
    }
    updateVolBars()

    volWrap.appendChild(muteBtn)
    volWrap.appendChild(volPopup)

    // Show/hide popup on hover
    let hideTimeout = null
    function showPopup() {
      clearTimeout(hideTimeout)
      volPopup.style.opacity = '1'
      volPopup.style.pointerEvents = 'auto'
    }
    function scheduleHide() {
      hideTimeout = setTimeout(() => {
        volPopup.style.opacity = '0'
        volPopup.style.pointerEvents = 'none'
      }, 400)
    }
    volWrap.addEventListener('mouseenter', showPopup)
    volWrap.addEventListener('mouseleave', scheduleHide)
    muteBtn.addEventListener('mouseenter', () => { muteBtn.style.color = 'rgba(255,255,255,0.9)' })
    muteBtn.addEventListener('mouseleave', () => { muteBtn.style.color = 'rgba(255,255,255,0.5)' })

    function updateRadioUI() {
      radioLabel.textContent = radio.getStation().name
      muteBtn.innerHTML = `<span style="width:24px;height:24px;display:block;">${radio.isPlaying() ? svgOn : svgOff}</span>`
      updateVolBars()
    }

    function radioNext() {
      radio.next().then(updateRadioUI)
    }

    function radioPrev() {
      radio.prev().then(updateRadioUI)
    }

    function toggleMute() {
      radio.toggle()
      updateRadioUI()
    }

    muteBtn.addEventListener('click', toggleMute)

    radioGroup.appendChild(makeArrow('\u2039', radioPrev))
    radioGroup.appendChild(radioLabel)
    radioGroup.appendChild(makeArrow('\u203A', radioNext))
    radioGroup.appendChild(volWrap)
    bar.appendChild(radioGroup)
  }

  document.body.appendChild(bar)

  // === TOP-RIGHT TITLE + ICON BUTTONS ===
  const titleGroup = document.createElement('div')
  titleGroup.style.cssText = `position:fixed;top:20px;right:24px;z-index:10;display:flex;align-items:center;gap:12px;font-family:${FONT};-webkit-font-smoothing:none;`

  const titleEl = document.createElement('span')
  titleEl.textContent = '3310.fi'
  titleEl.style.cssText = `color:rgba(255,255,255,0.6);font-size:20px;line-height:1;letter-spacing:0.5px;`

  // pixelarticons SVGs (24x24)
  const svgAbout = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z"/></svg>'
  const svgShare = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4h-2v2h2v2H6v2H4v8h2v2h6v-2H6v-8h10v2h-2v2h2v-2h2v-2h2V8h-2V6h-2V4z"/></svg>'
  const svgGithub = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h2v12h3v3h7v-7h-3V2h8v8h-3v9h-9v3H2v-8h3V2zm15 6V4h-4v4h4zM8 19v-3H4v4h4v-1z"/></svg>'

  function makeIconBtn(svgHtml, title, onClick) {
    const btn = document.createElement('button')
    btn.innerHTML = `<span style="width:20px;height:20px;display:block;">${svgHtml}</span>`
    btn.title = title
    btn.style.cssText = 'background:none;border:none;cursor:pointer;padding:2px;color:rgba(255,255,255,0.4);transition:color 0.2s;display:flex;align-items:center;'
    btn.addEventListener('mouseenter', () => { btn.style.color = 'rgba(255,255,255,0.8)' })
    btn.addEventListener('mouseleave', () => { btn.style.color = 'rgba(255,255,255,0.4)' })
    if (onClick) btn.addEventListener('click', onClick)
    return btn
  }

  const aboutBtn = makeIconBtn(svgAbout, 'About')
  const shareBtn = makeIconBtn(svgShare, 'Share', () => {
    if (navigator.share) {
      navigator.share({ title: '3310.fi — Nokia Snake II', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  })
  const githubBtn = makeIconBtn(svgGithub, 'GitHub', () => {
    window.open('https://github.com/nicatspark/nokia-snake', '_blank')
  })

  titleGroup.appendChild(titleEl)
  titleGroup.appendChild(aboutBtn)
  titleGroup.appendChild(shareBtn)
  titleGroup.appendChild(githubBtn)
  document.body.appendChild(titleGroup)

  // === ABOUT POPUP (Win98 browser window — draggable, resizable) ===
  const W98 = '"MS Sans Serif","Microsoft Sans Serif",Tahoma,sans-serif'
  const W98_RAISED = 'border-top:2px solid #fff;border-left:2px solid #fff;border-bottom:2px solid #000;border-right:2px solid #000;'
  const W98_INSET = 'border-top:2px solid #808080;border-left:2px solid #808080;border-bottom:2px solid #fff;border-right:2px solid #fff;'
  const W98_BTN = `background:#c0c0c0;${W98_RAISED}border-width:1px;width:16px;height:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:${W98};padding:0;`

  let popW = 520, popH = 420
  let popX = Math.round((window.innerWidth - popW) / 2)
  let popY = Math.round((window.innerHeight - popH) / 2)
  let maximized = false, savedBounds = null

  const popup = document.createElement('div')
  popup.style.cssText = `position:fixed;z-index:51;background:#c0c0c0;${W98_RAISED}padding:2px;font-family:${W98};font-size:11px;image-rendering:pixelated;display:none;flex-direction:column;`

  function applyBounds() {
    popup.style.left = popX + 'px'
    popup.style.top = popY + 'px'
    popup.style.width = popW + 'px'
    popup.style.height = popH + 'px'
  }

  // --- Title bar ---
  const titleBar = document.createElement('div')
  titleBar.style.cssText = 'background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-weight:bold;font-size:11px;padding:2px 3px;display:flex;align-items:center;justify-content:space-between;margin-bottom:1px;cursor:default;user-select:none;flex-shrink:0;'

  const titleText = document.createElement('span')
  titleText.style.cssText = 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'
  titleText.innerHTML = '<span style="font-size:10px;">&#127760;</span> 3310.fi - Microsoft Internet Explorer'
  titleBar.appendChild(titleText)

  const winBtns = document.createElement('div')
  winBtns.style.cssText = 'display:flex;gap:1px;flex-shrink:0;margin-left:4px;'

  const minBtn = document.createElement('div')
  minBtn.style.cssText = W98_BTN
  minBtn.innerHTML = '<svg width="8" height="7" viewBox="0 0 8 7" shape-rendering="crispEdges"><rect x="0" y="5" width="7" height="2" fill="#000"/></svg>'

  const maxBtn = document.createElement('div')
  maxBtn.style.cssText = W98_BTN
  const svgMax = '<svg width="9" height="9" viewBox="0 0 9 9" shape-rendering="crispEdges"><rect x="0" y="0" width="9" height="9" fill="none" stroke="#000" stroke-width="1"/><rect x="0" y="0" width="9" height="3" fill="#000"/></svg>'
  const svgRestore = '<svg width="9" height="9" viewBox="0 0 9 9" shape-rendering="crispEdges"><rect x="2" y="0" width="7" height="7" fill="none" stroke="#000" stroke-width="1"/><rect x="2" y="0" width="7" height="2" fill="#000"/><rect x="0" y="2" width="7" height="7" fill="#c0c0c0" stroke="#000" stroke-width="1"/><rect x="0" y="2" width="7" height="2" fill="#000"/></svg>'
  maxBtn.innerHTML = svgMax

  const closeBtn = document.createElement('div')
  closeBtn.style.cssText = W98_BTN
  closeBtn.innerHTML = '<svg width="7" height="7" viewBox="0 0 7 7" shape-rendering="crispEdges"><path d="M0,0 L3,3 L0,6 L1,7 L3.5,3.5 L6,7 L7,6 L4,3 L7,0 L6,0 L3.5,2.5 L1,0Z" fill="#000"/></svg>'

  winBtns.append(minBtn, maxBtn, closeBtn)
  titleBar.appendChild(winBtns)

  // --- Menu bar ---
  const menuBar = document.createElement('div')
  menuBar.style.cssText = 'background:#c0c0c0;padding:1px 2px;font-size:11px;border-bottom:1px solid #808080;flex-shrink:0;'
  menuBar.innerHTML = '<span style="padding:1px 5px;">File</span><span style="padding:1px 5px;">Edit</span><span style="padding:1px 5px;">View</span><span style="padding:1px 5px;">Favorites</span><span style="padding:1px 5px;">Help</span>'

  // --- Address bar ---
  const addrBar = document.createElement('div')
  addrBar.style.cssText = 'background:#c0c0c0;padding:2px 4px;display:flex;align-items:center;gap:4px;border-bottom:1px solid #808080;flex-shrink:0;'
  const addrUrl = document.createElement('div')
  addrUrl.style.cssText = `flex:1;background:#fff;${W98_INSET}padding:1px 3px;font-size:11px;white-space:nowrap;overflow:hidden;`
  addrUrl.textContent = 'http://www.3310.fi'
  addrBar.innerHTML = '<span style="font-size:11px;white-space:nowrap;">Address</span>'
  addrBar.appendChild(addrUrl)

  // Finnish flag SVG as data URI
  const flagSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='24'%3E%3Crect width='36' height='24' fill='%23fff'/%3E%3Crect y='9' width='36' height='6' fill='%23003580'/%3E%3Crect x='10' width='6' height='24' fill='%23003580'/%3E%3C/svg%3E"
  // US flag SVG
  const usFlagSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='24'%3E%3Crect width='36' height='24' fill='%23fff'/%3E%3Crect y='0' width='36' height='2' fill='%23B22234'/%3E%3Crect y='4' width='36' height='2' fill='%23B22234'/%3E%3Crect y='8' width='36' height='2' fill='%23B22234'/%3E%3Crect y='12' width='36' height='2' fill='%23B22234'/%3E%3Crect y='16' width='36' height='2' fill='%23B22234'/%3E%3Crect y='20' width='36' height='2' fill='%23B22234'/%3E%3Crect y='22' width='36' height='2' fill='%23B22234'/%3E%3Crect width='15' height='13' fill='%233C3B6E'/%3E%3C/svg%3E"
  // 1x1 transparent spacer gif
  const spacer = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  // Old-school rotary telephone pixel art — chunky, artifacted, "stock photo" feel
  const telPx = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='14' shape-rendering='crispEdges'%3E%3Crect x='2' y='0' width='12' height='3' fill='%23222'/%3E%3Crect x='1' y='3' width='3' height='2' fill='%23333'/%3E%3Crect x='12' y='3' width='3' height='2' fill='%23333'/%3E%3Crect x='4' y='3' width='8' height='2' fill='%23111'/%3E%3Crect x='0' y='5' width='16' height='6' fill='%23222'/%3E%3Crect x='5' y='6' width='6' height='4' rx='0' fill='%23444'/%3E%3Crect x='6' y='7' width='4' height='2' fill='%23666'/%3E%3Crect x='1' y='11' width='14' height='3' fill='%23191919'/%3E%3Crect x='0' y='12' width='16' height='2' fill='%23111'/%3E%3C/svg%3E"
  // Tiny "snake" pixel art
  const snakePx = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8' shape-rendering='crispEdges'%3E%3Crect x='0' y='3' width='3' height='3' fill='%23586838'/%3E%3Crect x='3' y='3' width='3' height='3' fill='%23687848'/%3E%3Crect x='6' y='3' width='3' height='3' fill='%23586838'/%3E%3Crect x='9' y='1' width='3' height='3' fill='%23687848'/%3E%3Crect x='12' y='0' width='3' height='3' fill='%23586838'/%3E%3Crect x='13' y='0' width='1' height='1' fill='%23333'/%3E%3C/svg%3E"

  // --- Content area (the "webpage") ---
  const content = document.createElement('div')
  content.style.cssText = `background:#fff;${W98_INSET}flex:1;overflow-y:auto;min-height:0;`

  // --- Multi-page navigation ---
  let currentPage = 'home'

  function navigateTo(page) {
    currentPage = page
    const pages = content.querySelectorAll('[data-page]')
    pages.forEach(p => { p.style.display = p.dataset.page === page ? '' : 'none' })
    const urls = { home: 'http://www.3310.fi', leaderboard: 'http://www.3310.fi/leaderboard', guestbook: 'http://www.3310.fi/guestbook', credits: 'http://www.3310.fi/credits' }
    addrUrl.textContent = urls[page] || 'http://www.3310.fi'
    content.scrollTop = 0
  }

  content.addEventListener('click', (e) => {
    const link = e.target.closest('[data-nav]')
    if (link) {
      e.preventDefault()
      navigateTo(link.dataset.nav)
    }
  })

  // Shared header + nav builder
  const siteHeader = `
    <style>
      @keyframes flagwave { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
      @keyframes blinker { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes marquee { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
    </style>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#003580" style="background:linear-gradient(180deg,#004090,#002a60);">
          <table width="100%" cellpadding="6" cellspacing="0" border="0">
            <tr>
              <td width="40" align="center" valign="middle">
                <img src="${flagSvg}" width="32" height="22" alt="flag.gif" border="1" style="border-color:#002a60;animation:flagwave 1.5s ease-in-out infinite;transform-origin:left center;image-rendering:pixelated;">
              </td>
              <td valign="middle">
                <font face="Arial,Helvetica" color="#FFFFFF" size="4"><b><a data-nav="home" href="#" style="color:#fff;text-decoration:none;">3310.fi</a></b></font><br>
                <font face="Arial,Helvetica" color="#8899BB" size="1">RECONNECTING PEOPLE</font>
              </td>
              <td align="right" valign="middle">
                <img src="${telPx}" width="32" height="28" alt="phone.gif" style="image-rendering:pixelated;opacity:0.3;">
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td bgcolor="#FFD700" height="2"><img src="${spacer}" width="1" height="2"></td></tr>
      <tr><td bgcolor="#003580" height="1"><img src="${spacer}" width="1" height="1"></td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#FFFFCC" style="overflow:hidden;font-family:Arial,Helvetica;font-size:9px;color:#666;padding:2px 0;height:14px;">
          <div style="white-space:nowrap;animation:marquee 18s linear infinite;">
            &#9733; Welcome to 3310.fi &mdash; The Snake II Experience &mdash; Now playable in your browser! &#9733; Tervetuloa! &#9733; Built in Brooklyn, NY &#9733;
          </div>
        </td>
      </tr>
    </table>`

  function makeNav(activePage) {
    const items = [
      { id: 'home', label: 'Home' },
      { id: 'leaderboard', label: 'Leaderboard' },
      { id: 'guestbook', label: 'Guestbook' },
      { id: 'credits', label: 'Credits' },
    ]
    return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td bgcolor="#003580" style="padding:3px 6px;"><font color="#FFFFFF" size="1"><b>NAVIGATE</b></font></td></tr>
      ${items.map(it => `<tr><td style="padding:3px 6px;"><font color="#003580">&#9656; ${it.id === activePage ? `<b>${it.label}</b>` : `<a data-nav="${it.id}" href="#" style="color:#003580;">${it.label}</a>`}</font></td></tr>`).join('')}
      <tr><td bgcolor="#DDD" height="1"><img src="${spacer}" width="1" height="1"></td></tr>
      <tr><td style="padding:5px 6px 3px;"><font color="#999" size="1"><b>LINKS</b></font></td></tr>
      <tr><td style="padding:2px 6px;"><font color="#003580" size="1">&#9656; <u>Webring</u></font></td></tr>
      <tr><td style="padding:2px 6px;"><font color="#003580" size="1">&#9656; <u>Link to us</u></font></td></tr>
      <tr><td bgcolor="#DDD" height="1"><img src="${spacer}" width="1" height="1"></td></tr>
      <tr>
        <td align="center" style="padding:8px 6px;">
          <img src="${usFlagSvg}" width="20" height="14" alt="us.gif" style="image-rendering:pixelated;"><br>
          <font color="#999" size="1">Made in<br>Brooklyn</font>
        </td>
      </tr>
    </table>`
  }

  const siteFooter = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td bgcolor="#003580" height="2"><img src="${spacer}" width="1" height="2"></td></tr>
      <tr><td bgcolor="#FFD700" height="1"><img src="${spacer}" width="1" height="1"></td></tr>
      <tr>
        <td bgcolor="#E8E8E0" align="center" style="padding:8px;font-family:Arial,Helvetica;font-size:9px;color:#666;">
          <img src="${usFlagSvg}" width="16" height="11" style="image-rendering:pixelated;vertical-align:middle;" alt="us.gif">
          &nbsp;You are visitor No.
          <font face="Courier New,monospace" size="2" color="#000"><b>003&thinsp;847</b></font>
          <br><br>
          Best viewed in <b>800&times;600</b> with Internet Explorer 5.0 or Netscape Navigator 4.7
          <br>
          Optimized for 56K modem &nbsp;&#9679;&nbsp; Page size: 12KB
          <br><br>
          <font color="#999">
            &copy; 2000&ndash;2001 3310.fi &mdash; All rights reserved<br>
            This site is not affiliated with Nokia Corporation<br>
            <u>webmaster@3310.fi</u>
          </font>
          <br><br>
          <font face="Courier New" size="1" color="#AAA">
            &#9472;&#9472;&#9472; Made with Notepad and Brooklyn grit &#9472;&#9472;&#9472;
          </font>
        </td>
      </tr>
    </table>`

  // === PAGE: HOME ===
  const pageHome = `
  <div data-page="home">
    ${siteHeader}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman',Times,serif;font-size:13px;color:#333;">
      <tr>
        <td width="105" bgcolor="#E8E8E0" valign="top" style="border-right:1px solid #CCC;font-family:Arial,Helvetica;font-size:10px;">
          ${makeNav('home')}
        </td>
        <td valign="top" style="padding:10px 14px;">
          <font face="Arial,Helvetica" size="3" color="#003580"><b>Welcome to 3310.fi!</b></font>
          &nbsp;<font face="Arial" size="1" color="#FF0000" style="animation:blinker 1s step-end infinite;"><b>NEW!</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 8px;">

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="top">
                <font face="'Times New Roman',serif" size="2">
                  Tervetuloa! This is <b>3310.fi</b> &mdash; a loving tribute to the most
                  indestructible phone ever made and the game that defined a generation.
                  <br><br>
                  Play <b>Snake&nbsp;II</b> in your browser, exactly as it was meant to be played.
                  No downloads. No installs. Just pure Nokia nostalgia.
                </font>
              </td>
              <td width="60" align="center" valign="top" style="padding-left:8px;">
                <img src="${telPx}" width="48" height="42" alt="tel.gif" style="image-rendering:pixelated;border:1px solid #999;">
                <br><font face="Arial" size="1" color="#999">phone.gif<br>(3KB)</font>
              </td>
            </tr>
          </table>

          <br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; The Story</b></font><br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <font face="'Times New Roman',serif" size="2">
            In the autumn of 2000, Nokia released the <b>3310</b>. It cost 189 markka.
            Within two years, 126 million units had shipped worldwide. For many Finns &mdash;
            and millions of people around the world &mdash; it was their first mobile phone.
            <br><br>
            But the 3310 was more than a phone. It was a <i>gaming platform</i>. Pre-loaded
            with <b>Snake&nbsp;II</b>, it turned every bus ride, every boring lecture, every
            sauna break into a high-score attempt.
          </font>

          <br><br>
          <table width="100%" cellpadding="4" cellspacing="0" border="0">
            <tr>
              <td width="50%" align="center" style="padding:4px;">
                <table cellpadding="2" cellspacing="0" border="1" bordercolor="#999" bgcolor="#F8F8F0">
                  <tr><td align="center">
                    <img src="${snakePx}" width="80" height="40" alt="snake2.gif" style="image-rendering:pixelated;display:block;">
                    <font face="Arial" size="1" color="#666">snake2.gif (1KB)</font>
                  </td></tr>
                </table>
              </td>
              <td width="50%" valign="middle">
                <font face="Arial" size="1" color="#666">
                  <i>"I remember playing Snake on the bus to school in Espoo. My high score
                  was 4,280. Nobody believed me."</i>
                  <br>&mdash; Anonymous, Helsinki, 2001
                </font>
              </td>
            </tr>
          </table>

          <br>
          <font face="'Times New Roman',serif" size="2">
            Snake&nbsp;II improved on the original with maze levels, bonus items, and a
            slightly larger play field. The rules were simple: eat, grow, don&rsquo;t crash.
            The execution was perfect.
          </font>

          <br><br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Why This Project</b></font><br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <font face="'Times New Roman',serif" size="2">
            Some things are too good to stay buried in a drawer. The 3310 can&rsquo;t connect
            to modern networks anymore, but the feeling of playing Snake at 2am under
            the covers &mdash; that feeling is universal.
            <br><br>
            <b>3310.fi</b> is a faithful recreation of that experience. The original
            84&times;48 pixel display. The original game logic. The authentic Nokia LCD green.
            Rendered in 3D, playable in your browser, free forever.
            <br><br>
            Built with &#9829; in Brooklyn, NY, by people who wore out the 5 key.
          </font>

          <br><br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Technical Specifications</b></font><br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#999" style="font-family:Arial,Helvetica;font-size:10px;border-collapse:collapse;">
            <tr bgcolor="#003580"><td colspan="2"><font color="#FFF"><b>SPECIFICATIONS</b></font></td></tr>
            <tr bgcolor="#F0F0E8"><td width="40%"><b>Display</b></td><td>84 &times; 48 pixels, monochrome</td></tr>
            <tr><td><b>LCD Color</b></td><td style="font-family:monospace;">#c7cfa1 (Nokia Green&trade;)</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>Platform</b></td><td>Web / Three.js / WebGL</td></tr>
            <tr><td><b>Controls</b></td><td>Arrow keys, WASD, Numpad, or click phone buttons</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>Battery Life</b></td><td>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; Unlimited</td></tr>
            <tr><td><b>Durability</b></td><td>Indestructible (just like the original)</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>Price</b></td><td>Free / Ilmainen</td></tr>
          </table>

          <br>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <font face="Arial" size="1" color="#003580">
                  [ <a data-nav="guestbook" href="#" style="color:#003580;">Sign our Guestbook</a> ]&nbsp;&nbsp;
                  [ <a data-nav="leaderboard" href="#" style="color:#003580;">View Leaderboard</a> ]&nbsp;&nbsp;
                  [ <u>Email Webmaster</u> ]
                </font>
              </td>
            </tr>
          </table>
          <br>
        </td>
      </tr>
    </table>
    ${siteFooter}
  </div>`

  // === PAGE: LEADERBOARD ===
  const pageLeaderboard = `
  <div data-page="leaderboard" style="display:none;">
    ${siteHeader}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman',Times,serif;font-size:13px;color:#333;">
      <tr>
        <td width="105" bgcolor="#E8E8E0" valign="top" style="border-right:1px solid #CCC;font-family:Arial,Helvetica;font-size:10px;">
          ${makeNav('leaderboard')}
        </td>
        <td valign="top" style="padding:10px 14px;">
          <font face="Arial,Helvetica" size="3" color="#003580"><b>&#9733; Leaderboard</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 8px;">

          <font face="Arial" size="1" color="#666">Top Snake II players worldwide. Updated every 30 minutes.</font>
          <br><br>

          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#999" style="font-family:Arial,Helvetica;font-size:10px;border-collapse:collapse;">
            <tr bgcolor="#003580">
              <td width="8%"><font color="#FFD700"><b>#</b></font></td>
              <td width="30%"><font color="#FFF"><b>PLAYER</b></font></td>
              <td width="20%"><font color="#FFF"><b>SCORE</b></font></td>
              <td width="15%"><font color="#FFF"><b>LEVEL</b></font></td>
              <td width="27%"><font color="#FFF"><b>DATE</b></font></td>
            </tr>
            <tr bgcolor="#FFFFF0"><td><font color="#FFD700"><b>1</b></font></td><td>&#9733; Snak3_K1ng</td><td><b>9,847</b></td><td>9</td><td>01/15/2001</td></tr>
            <tr bgcolor="#F0F0E8"><td><font color="#C0C0C0"><b>2</b></font></td><td>xX_V1per_Xx</td><td><b>8,203</b></td><td>8</td><td>12/28/2000</td></tr>
            <tr bgcolor="#FFFFF0"><td><font color="#CD7F32"><b>3</b></font></td><td>NokiaNinja_FI</td><td><b>7,651</b></td><td>8</td><td>02/03/2001</td></tr>
            <tr bgcolor="#F0F0E8"><td>4</td><td>~*SnakeCharmer*~</td><td>6,940</td><td>7</td><td>11/19/2000</td></tr>
            <tr bgcolor="#FFFFF0"><td>5</td><td>KewlDude2001</td><td>6,512</td><td>7</td><td>03/07/2001</td></tr>
            <tr bgcolor="#F0F0E8"><td>6</td><td>L33tGamer</td><td>5,880</td><td>6</td><td>10/30/2000</td></tr>
            <tr bgcolor="#FFFFF0"><td>7</td><td>SuomiPerkele</td><td>5,433</td><td>6</td><td>01/22/2001</td></tr>
            <tr bgcolor="#F0F0E8"><td>8</td><td>BK_Bushwick</td><td>5,101</td><td>5</td><td>04/11/2001</td></tr>
            <tr bgcolor="#FFFFF0"><td>9</td><td>Pikach00</td><td>4,780</td><td>5</td><td>02/14/2001</td></tr>
            <tr bgcolor="#F0F0E8"><td>10</td><td>RetroFanatic</td><td>4,280</td><td>5</td><td>12/01/2000</td></tr>
            <tr bgcolor="#FFFFF0"><td>11</td><td>MidnightSnaker</td><td>3,902</td><td>4</td><td>03/19/2001</td></tr>
            <tr bgcolor="#F0F0E8"><td>12</td><td>CyberSerpent99</td><td>3,650</td><td>4</td><td>11/05/2000</td></tr>
            <tr bgcolor="#FFFFF0"><td>13</td><td>JariFromEspoo</td><td>3,411</td><td>4</td><td>01/08/2001</td></tr>
            <tr bgcolor="#F0F0E8"><td>14</td><td>n00b_sl4yer</td><td>2,890</td><td>3</td><td>02/27/2001</td></tr>
            <tr bgcolor="#FFFFF0"><td>15</td><td>BrooklynBite</td><td>2,344</td><td>3</td><td>04/02/2001</td></tr>
          </table>

          <br>
          <table width="100%" cellpadding="4" cellspacing="0" border="1" bordercolor="#999" bgcolor="#FFFFF0" style="font-family:Arial,Helvetica;font-size:10px;">
            <tr><td bgcolor="#003580"><font color="#FFF"><b>SUBMIT YOUR SCORE</b></font></td></tr>
            <tr><td style="padding:8px;">
              <font face="Arial" size="1" color="#666">
                Think you can beat our high scores? Play Snake II and take a screenshot!<br><br>
                <b>Name:</b> <span style="background:#fff;border:1px inset #999;padding:1px 3px;font-family:Courier New;">____________</span><br><br>
                <b>Score:</b> <span style="background:#fff;border:1px inset #999;padding:1px 3px;font-family:Courier New;">______</span>
                &nbsp;&nbsp;
                <span style="background:#c0c0c0;border-top:1px solid #fff;border-left:1px solid #fff;border-bottom:1px solid #000;border-right:1px solid #000;padding:1px 8px;cursor:pointer;font-size:10px;">&nbsp;Submit&nbsp;</span>
                <br><br>
                <font color="#999" size="1"><i>* Screenshot proof required. Email to webmaster@3310.fi</i></font>
              </font>
            </td></tr>
          </table>

          <br>
          <font face="Arial" size="1" color="#999">
            &#9679; Leaderboard resets monthly &nbsp;&#9679;&nbsp; No cheating! We check screenshots &nbsp;&#9679;&nbsp; <a data-nav="home" href="#" style="color:#003580;">Back to Home</a>
          </font>
          <br><br>
        </td>
      </tr>
    </table>
    ${siteFooter}
  </div>`

  // === PAGE: GUESTBOOK ===
  const pageGuestbook = `
  <div data-page="guestbook" style="display:none;">
    ${siteHeader}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman',Times,serif;font-size:13px;color:#333;">
      <tr>
        <td width="105" bgcolor="#E8E8E0" valign="top" style="border-right:1px solid #CCC;font-family:Arial,Helvetica;font-size:10px;">
          ${makeNav('guestbook')}
        </td>
        <td valign="top" style="padding:10px 14px;">
          <font face="Arial,Helvetica" size="3" color="#003580"><b>&#9993; Guestbook</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 8px;">

          <font face="Arial" size="1" color="#666">47 entries &mdash; Page 1 of 4 &mdash; [ 1 | <u>2</u> | <u>3</u> | <u>4</u> ]</font>
          <br><br>

          <!-- Entry 1 -->
          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#CCC" style="font-family:Arial,Helvetica;font-size:10px;margin-bottom:6px;">
            <tr bgcolor="#E8E8F0">
              <td><b>Snak3_K1ng</b> <font color="#999">from Helsinki, FI</font></td>
              <td width="120" align="right"><font color="#999">01/15/2001 14:32</font></td>
            </tr>
            <tr><td colspan="2" style="padding:4px 6px;">
              This is the BEST snake game on the internet!!! I play every day at work (don't tell my boss lol). My high score is 9847. Can anyone beat that?? :-D<br>
              <font color="#999" size="1">IP: 195.148.xxx.xxx</font>
            </td></tr>
          </table>

          <!-- Entry 2 -->
          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#CCC" style="font-family:Arial,Helvetica;font-size:10px;margin-bottom:6px;">
            <tr bgcolor="#E8E8F0">
              <td><b>~*Sarah*~</b> <font color="#999">from Williamsburg, Brooklyn</font></td>
              <td width="120" align="right"><font color="#999">01/12/2001 09:18</font></td>
            </tr>
            <tr><td colspan="2" style="padding:4px 6px;">
              omg this takes me back!! i used 2 play snake on my moms phone under the covers at night. the green screen glow was so magical. this site is amazing, bookmarked!! :-) :-) :-)
            </td></tr>
          </table>

          <!-- Entry 3 -->
          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#CCC" style="font-family:Arial,Helvetica;font-size:10px;margin-bottom:6px;">
            <tr bgcolor="#E8E8F0">
              <td><b>JariFromEspoo</b> <font color="#999">from Espoo, FI</font></td>
              <td width="120" align="right"><font color="#999">01/10/2001 22:45</font></td>
            </tr>
            <tr><td colspan="2" style="padding:4px 6px;">
              Hei! Great job with this site. Brings back memories of playing Snake on the bus to Otaniemi. The 3D phone model is incredible! How did you make it? Kiitos paljon!
            </td></tr>
          </table>

          <!-- Entry 4 -->
          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#CCC" style="font-family:Arial,Helvetica;font-size:10px;margin-bottom:6px;">
            <tr bgcolor="#E8E8F0">
              <td><b>xX_WebMaStEr_Xx</b> <font color="#999">from Palo Alto, CA</font></td>
              <td width="120" align="right"><font color="#999">01/08/2001 16:03</font></td>
            </tr>
            <tr><td colspan="2" style="padding:4px 6px;">
              cool site dude! i added you to my webring. check out MY homepage at geocities.com/xX_WebMaStEr_Xx. i have a snake game too but yours is way better. keep it up!! :-P
            </td></tr>
          </table>

          <!-- Entry 5 -->
          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#CCC" style="font-family:Arial,Helvetica;font-size:10px;margin-bottom:6px;">
            <tr bgcolor="#E8E8F0">
              <td><b>RetroFanatic</b> <font color="#999">from Park Slope, Brooklyn</font></td>
              <td width="120" align="right"><font color="#999">01/05/2001 11:29</font></td>
            </tr>
            <tr><td colspan="2" style="padding:4px 6px;">
              Just found this through AltaVista. This is seriously impressive work. The attention to detail on the LCD screen is spot on. Will there be a version with Sound? *bookmarked*
            </td></tr>
          </table>

          <!-- Entry 6 -->
          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#CCC" style="font-family:Arial,Helvetica;font-size:10px;margin-bottom:6px;">
            <tr bgcolor="#E8E8F0">
              <td><b>KewlDude2001</b> <font color="#999">from Tampa, FL</font></td>
              <td width="120" align="right"><font color="#999">01/03/2001 19:57</font></td>
            </tr>
            <tr><td colspan="2" style="padding:4px 6px;">
              YO this is so sick!!! ive been looking for a snake game 4ever. this 1 is the realest. gonna show all my friends at school. A+++++ SITE WOULD VISIT AGAIN
            </td></tr>
          </table>

          <!-- Entry 7 -->
          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#CCC" style="font-family:Arial,Helvetica;font-size:10px;margin-bottom:6px;">
            <tr bgcolor="#E8E8F0">
              <td><b>MikkoH</b> <font color="#999">from Tampere, FI</font></td>
              <td width="120" align="right"><font color="#999">12/28/2000 08:12</font></td>
            </tr>
            <tr><td colspan="2" style="padding:4px 6px;">
              Hauska sivu! I work at a phone factory and I approve this :-) The sound effects are very accurate. Nostalgic. Good work from Brooklyn!
            </td></tr>
          </table>

          <br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <!-- Sign form -->
          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9998; Sign the Guestbook</b></font><br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <table width="100%" cellpadding="4" cellspacing="0" border="1" bordercolor="#CCC" bgcolor="#F8F8F0" style="font-family:Arial,Helvetica;font-size:10px;">
            <tr><td>
              <b>Name:</b><br>
              <span style="display:inline-block;width:200px;background:#fff;border:2px inset #999;padding:2px 3px;font-family:Courier New;font-size:11px;">visitor_${Math.floor(Math.random() * 9000 + 1000)}</span>
              <br><br>
              <b>Location:</b><br>
              <span style="display:inline-block;width:200px;background:#fff;border:2px inset #999;padding:2px 3px;font-family:Courier New;font-size:11px;">Brooklyn, NY</span>
              <br><br>
              <b>Message:</b><br>
              <span style="display:inline-block;width:100%;max-width:300px;height:50px;background:#fff;border:2px inset #999;padding:2px 3px;font-family:Courier New;font-size:11px;">Great site!</span>
              <br><br>
              <b>Mood:</b>
              <span style="background:#fff;border:2px inset #999;padding:1px 3px;font-size:10px;"> :-) Happy &nbsp;&#9660;</span>
              <br><br>
              <span style="background:#c0c0c0;border-top:2px solid #fff;border-left:2px solid #fff;border-bottom:2px solid #000;border-right:2px solid #000;padding:2px 12px;cursor:pointer;">&nbsp;Sign Guestbook!&nbsp;</span>
              &nbsp;
              <span style="background:#c0c0c0;border-top:2px solid #fff;border-left:2px solid #fff;border-bottom:2px solid #000;border-right:2px solid #000;padding:2px 12px;cursor:pointer;">&nbsp;Preview&nbsp;</span>
              <br><br>
              <font color="#999" size="1"><i>* HTML tags are not allowed. No spam please!</i></font>
            </td></tr>
          </table>

          <br>
          <font face="Arial" size="1" color="#999">
            &#9679; Be nice! &nbsp;&#9679;&nbsp; No spam or ads &nbsp;&#9679;&nbsp; <a data-nav="home" href="#" style="color:#003580;">Back to Home</a>
          </font>
          <br><br>
        </td>
      </tr>
    </table>
    ${siteFooter}
  </div>`

  // === PAGE: CREDITS ===
  const pageCredits = `
  <div data-page="credits" style="display:none;">
    ${siteHeader}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman',Times,serif;font-size:13px;color:#333;">
      <tr>
        <td width="105" bgcolor="#E8E8E0" valign="top" style="border-right:1px solid #CCC;font-family:Arial,Helvetica;font-size:10px;">
          ${makeNav('credits')}
        </td>
        <td valign="top" style="padding:10px 14px;">
          <font face="Arial,Helvetica" size="3" color="#003580"><b>&#9829; Credits</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 8px;">

          <font face="'Times New Roman',serif" size="2">
            <b>3310.fi</b> was built with love, nostalgia, and way too many late nights in Brooklyn, New York.
          </font>

          <br><br>

          <table width="100%" cellpadding="3" cellspacing="0" border="1" bordercolor="#999" style="font-family:Arial,Helvetica;font-size:10px;border-collapse:collapse;">
            <tr bgcolor="#003580"><td colspan="2"><font color="#FFF"><b>PROJECT CREDITS</b></font></td></tr>
            <tr bgcolor="#F0F0E8"><td width="35%"><b>Concept &amp; Code</b></td><td>3310.fi Team, Brooklyn NY</td></tr>
            <tr><td><b>3D Phone Model</b></td><td>Nokia 3310 FBX + PBR textures</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>Game Engine</b></td><td>Snake II recreation (84&times;48 grid)</td></tr>
            <tr><td><b>Rendering</b></td><td>Three.js + WebGL</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>LCD Shader</b></td><td>Custom dot-matrix overlay</td></tr>
            <tr><td><b>Sound Design</b></td><td>Authentic Nokia-style bleeps</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>Radio Stations</b></td><td>Live internet radio streams</td></tr>
            <tr><td><b>Environments</b></td><td>HDRI from Poly Haven</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>Font</b></td><td>Nokia pixel font (bitmap)</td></tr>
            <tr><td><b>Inspiration</b></td><td>Nokia 3310, released Oct 2000</td></tr>
            <tr bgcolor="#F0F0E8"><td><b>Dedication</b></td><td>For everyone who wore out the 5 key</td></tr>
          </table>

          <br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Special Thanks</b></font><br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <font face="'Times New Roman',serif" size="2">
            &bull; Nokia Corporation, for making the indestructible 3310<br>
            &bull; Taneli Armanto, creator of the original Snake (1997)<br>
            &bull; Everyone on the early internet who made weird personal homepages<br>
            &bull; The 56K modem, for teaching us patience<br>
            &bull; Finnish sisu, Brooklyn grit, and late-night coffee<br>
            &bull; You, for visiting this site :-)
          </font>

          <br><br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Colophon</b></font><br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <font face="'Times New Roman',serif" size="2">
            This website was hand-coded in <del>Notepad</del> a code editor in Brooklyn, NY. It uses
            no frameworks, no cookies, and no tracking. Like the Nokia 3310 itself, it&rsquo;s
            built to last.
            <br><br>
            The vintage web aesthetic is a tribute to the personal homepages of 1999&ndash;2001.
            Back when the internet was weird, wonderful, and full of animated GIFs.
            <br><br>
            <table cellpadding="4" cellspacing="0" border="1" bordercolor="#999" bgcolor="#F8F8F0">
              <tr><td align="center">
                <font face="Courier New" size="1">
                  &lt;!-- Last updated: January 2001 --&gt;<br>
                  &lt;!-- Best viewed at 800x600 --&gt;<br>
                  &lt;!-- Made with love in BK --&gt;
                </font>
              </td></tr>
            </table>
          </font>

          <br>
          <font face="Arial" size="1" color="#999">
            &#9679; <a data-nav="home" href="#" style="color:#003580;">Back to Home</a> &nbsp;&#9679;&nbsp; <a data-nav="guestbook" href="#" style="color:#003580;">Sign our Guestbook</a>
          </font>
          <br><br>
        </td>
      </tr>
    </table>
    ${siteFooter}
  </div>`

  content.innerHTML = pageHome + pageLeaderboard + pageGuestbook + pageCredits

  // --- Status bar with resize grip ---
  const statusBar = document.createElement('div')
  statusBar.style.cssText = `${W98_INSET}background:#c0c0c0;padding:1px 4px;font-size:10px;color:#000;margin-top:1px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;`

  const statusText = document.createElement('span')
  statusText.innerHTML = '&#127760; Done'

  const resizeGrip = document.createElement('div')
  resizeGrip.style.cssText = 'width:13px;height:13px;cursor:se-resize;flex-shrink:0;overflow:hidden;'
  resizeGrip.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13"><rect x="9" y="11" width="2" height="2" fill="#808080"/><rect x="10" y="12" width="2" height="2" fill="#fff"/><rect x="5" y="11" width="2" height="2" fill="#808080"/><rect x="6" y="12" width="2" height="2" fill="#fff"/><rect x="9" y="7" width="2" height="2" fill="#808080"/><rect x="10" y="8" width="2" height="2" fill="#fff"/><rect x="1" y="11" width="2" height="2" fill="#808080"/><rect x="2" y="12" width="2" height="2" fill="#fff"/><rect x="5" y="7" width="2" height="2" fill="#808080"/><rect x="6" y="8" width="2" height="2" fill="#fff"/><rect x="9" y="3" width="2" height="2" fill="#808080"/><rect x="10" y="4" width="2" height="2" fill="#fff"/></svg>'

  statusBar.append(statusText, resizeGrip)

  popup.append(titleBar, menuBar, addrBar, content, statusBar)
  popup.addEventListener('wheel', (e) => { e.stopPropagation() }, { passive: true })
  document.body.appendChild(popup)

  // --- Drag by title bar ---
  let dragActive = false, dragOX = 0, dragOY = 0
  titleBar.addEventListener('pointerdown', (e) => {
    if (winBtns.contains(e.target)) return
    if (maximized) return
    dragActive = true
    dragOX = e.clientX - popX
    dragOY = e.clientY - popY
    titleBar.setPointerCapture(e.pointerId)
    e.preventDefault()
  })
  titleBar.addEventListener('pointermove', (e) => {
    if (!dragActive) return
    popX = e.clientX - dragOX
    popY = e.clientY - dragOY
    applyBounds()
  })
  titleBar.addEventListener('pointerup', () => { dragActive = false })
  titleBar.addEventListener('pointercancel', () => { dragActive = false })

  // --- Minimize (hides window, re-open via About link) ---
  minBtn.addEventListener('click', () => { popup.style.display = 'none' })

  // --- Maximize / restore ---
  function toggleMaximize() {
    if (maximized) {
      popX = savedBounds.x; popY = savedBounds.y
      popW = savedBounds.w; popH = savedBounds.h
      maximized = false
      popup.style.cssText = popup.style.cssText // force repaint
      popup.style.borderStyle = 'solid'
      popup.style.borderWidth = '2px'
      popup.style.borderTopColor = '#fff'; popup.style.borderLeftColor = '#fff'
      popup.style.borderBottomColor = '#000'; popup.style.borderRightColor = '#000'
      resizeGrip.style.display = ''
      maxBtn.innerHTML = svgMax
    } else {
      savedBounds = { x: popX, y: popY, w: popW, h: popH }
      popX = 0; popY = 0
      popW = window.innerWidth; popH = window.innerHeight
      maximized = true
      popup.style.borderWidth = '0'
      resizeGrip.style.display = 'none'
      maxBtn.innerHTML = svgRestore
    }
    applyBounds()
  }
  maxBtn.addEventListener('click', toggleMaximize)
  titleBar.addEventListener('dblclick', (e) => {
    if (winBtns.contains(e.target)) return
    toggleMaximize()
  })

  // --- Resize via grip ---
  let resizeActive = false, rSX = 0, rSY = 0, rSW = 0, rSH = 0
  resizeGrip.addEventListener('pointerdown', (e) => {
    if (maximized) return
    resizeActive = true
    rSX = e.clientX; rSY = e.clientY; rSW = popW; rSH = popH
    resizeGrip.setPointerCapture(e.pointerId)
    e.preventDefault()
    e.stopPropagation()
  })
  resizeGrip.addEventListener('pointermove', (e) => {
    if (!resizeActive) return
    popW = Math.max(320, rSW + e.clientX - rSX)
    popH = Math.max(200, rSH + e.clientY - rSY)
    applyBounds()
  })
  resizeGrip.addEventListener('pointerup', () => { resizeActive = false })
  resizeGrip.addEventListener('pointercancel', () => { resizeActive = false })

  // --- Close ---
  closeBtn.addEventListener('click', () => { popup.style.display = 'none' })

  // --- Show / hide ---
  function showAbout() {
    if (popup.style.display === 'flex') return
    applyBounds()
    popup.style.display = 'flex'
  }

  aboutBtn.addEventListener('click', showAbout)

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
