import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from '../game/constants.js'
import { dispatchAction } from '../game/dispatch.js'

const KEY_TO_ACTION = {
  ArrowUp: 'up', KeyW: 'up', Numpad2: 'up',
  ArrowDown: 'down', KeyS: 'down', Numpad8: 'down',
  ArrowLeft: 'left', KeyA: 'left', Numpad4: 'left',
  ArrowRight: 'right', KeyD: 'right', Numpad6: 'right',
  Enter: 'ok', Space: 'ok', Numpad5: 'ok', NumpadEnter: 'ok',
  Escape: 'back', Backspace: 'back', KeyC: 'back', KeyP: 'back',
}

const ACTION_TO_DIR = { up: DIR_UP, down: DIR_DOWN, left: DIR_LEFT, right: DIR_RIGHT }

export function createInput(game) {
  const buffer = []
  const MAX_BUFFER = 2
  const pendingEvents = []

  function handleKey(e) {
    const { state } = game.getState()

    // Splash: any key dismisses (keyboard-specific — buttons use dispatch)
    if (state === 'splash') {
      e.preventDefault()
      game.dismissSplash()
      return
    }

    // Leaderboard: any key goes back (keyboard-specific)
    if (state === 'leaderboard') {
      e.preventDefault()
      game.menuBack()
      return
    }

    const action = KEY_TO_ACTION[e.code]
    if (!action) return

    // Playing: buffer directions (keyboard-specific — buttons dispatch directly)
    if (state === 'playing') {
      const dir = ACTION_TO_DIR[action]
      if (dir !== undefined) {
        e.preventDefault()
        bufferDirection(dir)
        return
      }
    }

    e.preventDefault()
    const evt = dispatchAction(game, action)
    if (evt) pendingEvents.push(evt)
  }

  function bufferDirection(dir) {
    if (buffer.length < MAX_BUFFER) {
      buffer.push(dir)
    }
  }

  function flush() {
    if (buffer.length > 0) {
      game.setDirection(buffer.shift())
    }
  }

  function drainEvents() {
    return pendingEvents.splice(0)
  }

  window.addEventListener('keydown', handleKey)

  return { flush, drainEvents }
}
