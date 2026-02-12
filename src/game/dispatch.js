import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from './constants.js'

const ACTION_TO_DIR = { up: DIR_UP, down: DIR_DOWN, left: DIR_LEFT, right: DIR_RIGHT }

/**
 * Shared state→action routing for keyboard and button input.
 * Returns an event object (e.g. { event: 'start' }) or null.
 */
export function dispatchAction(game, action) {
  const { state } = game.getState()

  if (state === 'splash') {
    game.dismissSplash()
    return null
  }

  if (state === 'menu') {
    switch (action) {
      case 'up':   game.menuUp(); return null
      case 'down': game.menuDown(); return null
      case 'ok':   return game.menuSelect() || null
    }
    return null
  }

  if (state === 'leaderboard') {
    game.menuBack()
    return null
  }

  if (state === 'menuLevel') {
    switch (action) {
      case 'left':  game.menuLeft(); break
      case 'right': game.menuRight(); break
      case 'ok':    game.levelConfirm(); break
      case 'back':  game.menuBack(); break
    }
    return null
  }

  if (state === 'playing') {
    const dir = ACTION_TO_DIR[action]
    if (dir !== undefined) {
      game.setDirection(dir)
      return null
    }
    if (action === 'back') {
      game.togglePause()
    }
    return null
  }

  if (state === 'paused') {
    if (action === 'ok' || action === 'back') {
      game.togglePause()
    }
    return null
  }

  if (state === 'gameover') {
    if (action === 'ok') {
      game.returnToMenu()
      return { event: 'menuReturn' }
    }
    return null
  }

  return null
}
