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

export function createUI({ initialEnvLabel, onEnvPrev, onEnvNext, radio, onAbout, onShare }) {
  // === BOTTOM BAR ===
  const bar = document.createElement('div')
  bar.style.cssText = 'position:fixed;bottom:20px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 24px;z-index:10;pointer-events:none;'

  // --- Environment controls (left side) ---
  const envGroup = document.createElement('div')
  envGroup.style.cssText = 'display:flex;align-items:center;gap:2px;pointer-events:auto;'

  const envLabel = document.createElement('span')
  envLabel.style.cssText = LABEL_STYLE + 'min-width:100px;text-align:center;'
  envLabel.textContent = initialEnvLabel

  envGroup.appendChild(makeArrow('\u2039', onEnvPrev))
  envGroup.appendChild(envLabel)
  envGroup.appendChild(makeArrow('\u203A', onEnvNext))
  bar.appendChild(envGroup)

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

    // Pixel-art vertical volume popup — chunky bar segments
    const NUM_BARS = 8
    const volPopup = document.createElement('div')
    volPopup.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);padding:8px 7px;margin-bottom:6px;background:rgba(0,0,0,0.75);border:2px solid rgba(255,255,255,0.2);border-radius:0;opacity:0;pointer-events:none;transition:opacity 0.2s;display:flex;flex-direction:column-reverse;align-items:center;gap:3px;image-rendering:pixelated;'

    const bars = []
    for (let i = 0; i < NUM_BARS; i++) {
      const bar_ = document.createElement('div')
      bar_.style.cssText = 'width:16px;height:6px;background:rgba(255,255,255,0.15);cursor:pointer;transition:background 0.05s;border:1px solid rgba(255,255,255,0.08);'
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
        b.style.background = i < filled ? '#8b9a5b' : 'rgba(255,255,255,0.12)'
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

  // === TOP-LEFT TITLE + ICON BUTTONS ===
  const titleGroup = document.createElement('div')
  titleGroup.style.cssText = `position:fixed;top:20px;left:24px;z-index:10;display:flex;align-items:center;gap:12px;font-family:${FONT};-webkit-font-smoothing:none;`

  const titleEl = document.createElement('span')
  titleEl.textContent = '3310.love'
  titleEl.style.cssText = `color:rgba(255,255,255,0.6);font-size:20px;line-height:1;letter-spacing:0.5px;`

  // pixelarticons SVGs (24x24)
  const svgAbout = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z"/></svg>'
  const svgShare = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4h-2v2h2v2H6v2H4v8h2v2h6v-2H6v-8h10v2h-2v2h2v-2h2v-2h2V8h-2V6h-2V4z"/></svg>'
  const svgGithub = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h2v12h3v3h7v-7h-3V2h8v8h-3v9h-9v3H2v-8h3V2zm15 6V4h-4v4h4zM8 19v-3H4v4h4v-1z"/></svg>'

  const aboutBtn = makeIconBtn(svgAbout, 'About', onAbout)
  const shareBtn = makeIconBtn(svgShare, 'Share', onShare)
  const githubBtn = makeIconBtn(svgGithub, 'GitHub', () => {
    window.open('https://github.com/oddurs/3310', '_blank')
  })

  titleGroup.appendChild(titleEl)
  titleGroup.appendChild(aboutBtn)
  document.body.appendChild(titleGroup)

  // === TOP-RIGHT SHARE + GITHUB ===
  const rightGroup = document.createElement('div')
  rightGroup.style.cssText = `position:fixed;top:20px;right:24px;z-index:10;display:flex;align-items:center;gap:8px;`
  rightGroup.appendChild(shareBtn)
  rightGroup.appendChild(githubBtn)
  document.body.appendChild(rightGroup)

  return {
    updateEnvLabel(text) { envLabel.textContent = text },
  }
}
