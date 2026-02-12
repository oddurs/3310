import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from '../game/constants.js'

export function createInput(game) {
  const buffer = []
  const MAX_BUFFER = 2
  const pendingEvents = []

  function handleKey(e) {
    const { state } = game.getState()

    // Splash: any key dismisses
    if (state === 'splash') {
      e.preventDefault()
      game.dismissSplash()
      return
    }

    // Menu: navigate items, enter to select
    if (state === 'menu') {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': case 'Numpad2':
          e.preventDefault()
          game.menuUp()
          break
        case 'ArrowDown': case 'KeyS': case 'Numpad8':
          e.preventDefault()
          game.menuDown()
          break
        case 'Enter': case 'Space': case 'Numpad5': case 'NumpadEnter':
          e.preventDefault()
          const evt = game.menuSelect()
          if (evt) pendingEvents.push(evt)
          break
      }
      return
    }

    // Leaderboard: any key goes back
    if (state === 'leaderboard') {
      e.preventDefault()
      game.menuBack()
      return
    }

    // Level picker: left/right adjust, enter to confirm, back to cancel
    if (state === 'menuLevel') {
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': case 'Numpad4':
          e.preventDefault()
          game.menuLeft()
          break
        case 'ArrowRight': case 'KeyD': case 'Numpad6':
          e.preventDefault()
          game.menuRight()
          break
        case 'Enter': case 'Space': case 'Numpad5': case 'NumpadEnter':
          e.preventDefault()
          game.levelConfirm()
          break
        case 'Escape': case 'Backspace': case 'KeyC':
          e.preventDefault()
          game.menuBack()
          break
      }
      return
    }

    // Playing: directions + pause
    if (state === 'playing') {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': case 'Numpad2':
          e.preventDefault()
          bufferDirection(DIR_UP)
          break
        case 'ArrowDown': case 'KeyS': case 'Numpad8':
          e.preventDefault()
          bufferDirection(DIR_DOWN)
          break
        case 'ArrowLeft': case 'KeyA': case 'Numpad4':
          e.preventDefault()
          bufferDirection(DIR_LEFT)
          break
        case 'ArrowRight': case 'KeyD': case 'Numpad6':
          e.preventDefault()
          bufferDirection(DIR_RIGHT)
          break
        case 'KeyP': case 'Escape': case 'Backspace': case 'KeyC':
          e.preventDefault()
          game.togglePause()
          break
      }
      return
    }

    // Paused: resume
    if (state === 'paused') {
      switch (e.code) {
        case 'KeyP': case 'Escape': case 'Enter': case 'Space':
        case 'Numpad5': case 'NumpadEnter': case 'Backspace': case 'KeyC':
          e.preventDefault()
          game.togglePause()
          break
      }
      return
    }

    // Game over: return to menu
    if (state === 'gameover') {
      switch (e.code) {
        case 'Enter': case 'Space': case 'Numpad5': case 'NumpadEnter':
          e.preventDefault()
          game.returnToMenu()
          pendingEvents.push({ event: 'menuReturn' })
          break
      }
      return
    }
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
