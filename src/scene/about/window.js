import { pageHome, pageLeaderboard, pageGuestbook, pageCredits } from './pages.js'

const W98 = '"MS Sans Serif","Microsoft Sans Serif",Tahoma,sans-serif'
const W98_RAISED = 'border-top:2px solid #fff;border-left:2px solid #fff;border-bottom:2px solid #000;border-right:2px solid #000;'
const W98_INSET = 'border-top:2px solid #808080;border-left:2px solid #808080;border-bottom:2px solid #fff;border-right:2px solid #fff;'
const W98_BTN = `background:#c0c0c0;width:16px;height:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:${W98};padding:0;box-shadow:inset -1px -1px 0 #000,inset 1px 1px 0 #fff,inset -2px -2px 0 #808080,inset 2px 2px 0 #dfdfdf;border:none;`

export function createAboutPopup() {
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
  titleText.innerHTML = '<span style="font-size:10px;">&#127760;</span> 3310.love - Microsoft Internet Explorer'
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
  addrUrl.textContent = 'http://www.3310.love'
  addrBar.innerHTML = '<span style="font-size:11px;white-space:nowrap;">Address</span>'
  addrBar.appendChild(addrUrl)

  // --- Content area (the "webpage") ---
  const content = document.createElement('div')
  content.style.cssText = `background:#fff;${W98_INSET}flex:1;overflow-y:auto;min-height:0;`

  // --- Multi-page navigation ---
  let currentPage = 'home'

  function navigateTo(page) {
    currentPage = page
    const pages = content.querySelectorAll('[data-page]')
    pages.forEach(p => { p.style.display = p.dataset.page === page ? '' : 'none' })
    const urls = { home: 'http://www.3310.love', leaderboard: 'http://www.3310.love/leaderboard', guestbook: 'http://www.3310.love/guestbook', credits: 'http://www.3310.love/credits' }
    addrUrl.textContent = urls[page] || 'http://www.3310.love'
    content.scrollTop = 0
  }

  content.addEventListener('click', (e) => {
    const link = e.target.closest('[data-nav]')
    if (link) {
      e.preventDefault()
      navigateTo(link.dataset.nav)
    }
  })

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

  // --- Show ---
  function show() {
    if (popup.style.display === 'flex') return
    applyBounds()
    popup.style.display = 'flex'
  }

  return { show }
}
