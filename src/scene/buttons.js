import * as THREE from 'three'

// Button zone detection for clicking on the 3D Nokia phone model
// Zones calibrated from actual raycast hit coordinates on the phone model

// Column boundaries (midpoints between column centers)
const COL_L = -0.281
const COL_R = 0.312

export const ZONES = {
  menuBtn: { yMin: -0.32, yMax: -0.15, xMin: -0.50, xMax: 0.50 },
  cBtn:    { yMin: -0.50, yMax: -0.30, xMin: -0.75, xMax: -0.20 },
  navUp:   { yMin: -0.48, yMax: -0.30, xMin: -0.20, xMax: 0.75 },
  navDown: { yMin: -0.75, yMax: -0.48, xMin: -0.60, xMax: 0.60 },

  num1: { yMin: -1.124, yMax: -0.75, xMin: -0.80, xMax: COL_L },
  num2: { yMin: -1.124, yMax: -0.75, xMin: COL_L,  xMax: COL_R },
  num3: { yMin: -1.124, yMax: -0.75, xMin: COL_R,  xMax: 0.80 },
  num4: { yMin: -1.490, yMax: -1.124, xMin: -0.80, xMax: COL_L },
  num5: { yMin: -1.490, yMax: -1.124, xMin: COL_L,  xMax: COL_R },
  num6: { yMin: -1.490, yMax: -1.124, xMin: COL_R,  xMax: 0.80 },
  num7: { yMin: -1.838, yMax: -1.490, xMin: -0.80, xMax: COL_L },
  num8: { yMin: -1.838, yMax: -1.490, xMin: COL_L,  xMax: COL_R },
  num9: { yMin: -1.838, yMax: -1.490, xMin: COL_R,  xMax: 0.80 },
  numStar:  { yMin: -2.20, yMax: -1.838, xMin: -0.80, xMax: COL_L },
  num0:     { yMin: -2.20, yMax: -1.838, xMin: COL_L,  xMax: COL_R },
  numPound: { yMin: -2.20, yMax: -1.838, xMin: COL_R,  xMax: 0.80 },
}

function hitTest(localPos) {
  const x = localPos.x
  const y = localPos.y
  for (const [name, z] of Object.entries(ZONES)) {
    if (x >= z.xMin && x <= z.xMax && y >= z.yMin && y <= z.yMax) {
      return name
    }
  }
  return null
}

function zoneToAction(zone) {
  switch (zone) {
    case 'navUp':  case 'num2':    return 'up'
    case 'navDown': case 'num8':   return 'down'
    case 'num4':                   return 'left'
    case 'num6':                   return 'right'
    case 'navOk':  case 'num5':
    case 'menuBtn':                return 'ok'
    case 'cBtn':                   return 'back'
    default:                       return null
  }
}

export function createButtons(camera, renderer, phoneGroup, game) {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const pendingEvents = []
  let debugConfig = { enabled: false }
  let onDebugClick = null

  // Button press animation state
  const press = {
    amount: 0,
    zone: null,  // ZONES entry { xMin, yMin, xMax, yMax }
    decay: 12,   // speed of release
  }

  function setDebug(config) {
    debugConfig = config
  }

  function setOnDebugClick(cb) {
    onDebugClick = cb
  }

  function onClick(e) {
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(phoneGroup.children, true)
    if (intersects.length === 0) return

    const localPoint = phoneGroup.worldToLocal(intersects[0].point.clone())
    const zone = hitTest(localPoint)
    const action = zone ? zoneToAction(zone) : null

    if (debugConfig.enabled && onDebugClick) {
      const zoneBounds = zone ? ZONES[zone] : null
      onDebugClick({
        x: localPoint.x,
        y: localPoint.y,
        z: localPoint.z,
        zone: zone || 'none',
        action: action || 'none',
        bounds: zoneBounds,
      })
    }

    if (!zone || !action) return

    // Trigger press animation
    press.zone = ZONES[zone]
    press.amount = 1.0

    const { state } = game.getState()
    handleAction(action, state)
  }

  function handleAction(action, state) {
    if (state === 'splash') {
      game.dismissSplash()
      return
    }

    if (state === 'menu') {
      switch (action) {
        case 'up':    game.menuUp(); break
        case 'down':  game.menuDown(); break
        case 'ok':
          const evt = game.menuSelect()
          if (evt) pendingEvents.push(evt)
          break
      }
      return
    }

    if (state === 'leaderboard') {
      game.menuBack()
      return
    }

    if (state === 'menuLevel') {
      switch (action) {
        case 'left':  game.menuLeft(); break
        case 'right': game.menuRight(); break
        case 'ok':    game.levelConfirm(); break
        case 'back':  game.menuBack(); break
      }
      return
    }

    if (state === 'playing') {
      switch (action) {
        case 'up':    game.setDirection(0); break
        case 'down':  game.setDirection(1); break
        case 'left':  game.setDirection(2); break
        case 'right': game.setDirection(3); break
        case 'back':  game.togglePause(); break
      }
      return
    }

    if (state === 'paused') {
      if (action === 'ok' || action === 'back') {
        game.togglePause()
      }
      return
    }

    if (state === 'gameover') {
      if (action === 'ok') {
        game.returnToMenu()
        pendingEvents.push({ event: 'menuReturn' })
      }
      return
    }
  }

  renderer.domElement.addEventListener('click', onClick)

  function drainEvents() {
    return pendingEvents.splice(0)
  }

  function update(dt) {
    if (press.amount > 0) {
      press.amount = Math.max(0, press.amount - dt * press.decay)
    }
  }

  function getPress() {
    return press
  }

  return { drainEvents, setDebug, setOnDebugClick, update, getPress }
}
