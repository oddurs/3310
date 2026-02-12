import {
  LCD_W, LCD_H, BORDER, HEADER_H, COLS, ROWS, CELL,
  BG_COLOR, FG_COLOR, FG_LIGHT, BORDER_COLOR,
  SPR_NIBBLE,
} from './constants.js'
import { drawSprite, drawFoodSprite } from './sprites.js'
import { getMazeBitmap } from './mazes.js'
import { getSplashBitmap } from './splash.js'
import {
  drawChar as _drawChar,
  drawText as _drawText,
  drawTextCentered as _drawTextCentered,
  measureText7,
  drawText7 as _drawText7,
} from './fonts.js'
import * as THREE from 'three'

// Layout geometry (all in canvas pixel coords)
// Outer pad:   6px (BORDER) on all sides
// Header:      y=6..19 (HEADER_H=14)
// Field border: 2px frame around game cells
// Game cells:  23×8 = 184px wide, 13×8 = 104px tall
//
// Canvas 200×134:
//   x: 0-5 pad | 6-7 border | 8-191 cells | 192-193 border | 194-199 pad
//   y: 0-5 pad | 6-19 header | 20-21 border | 22-125 cells | 126-127 border | 128-133 pad
const FIELD_Y = BORDER + HEADER_H    // 16 — y where the field border starts
const FIELD_INNER_X = BORDER + 2     // 4 — x of first game cell
const FIELD_INNER_Y = FIELD_Y + 2    // 18 — y of first game cell

// Width of the content area inside outer padding
const CONTENT_W = LCD_W - BORDER * 2  // 188

export function createLCD() {
  const canvas = document.createElement('canvas')
  canvas.width = LCD_W
  canvas.height = LCD_H
  const ctx = canvas.getContext('2d')

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.generateMipmaps = false

  // Local wrappers binding ctx from closure
  const drawChar = (ch, x, y) => _drawChar(ctx, ch, x, y)
  const drawText = (text, x, y) => _drawText(ctx, text, x, y)
  const drawTextCentered = (text, y) => _drawTextCentered(ctx, text, y)
  const drawText7 = (text, x, y) => _drawText7(ctx, text, x, y)

  function clear() {
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0, 0, LCD_W, LCD_H)
  }

  function drawFieldBorder() {
    // 2px border around the game field (below header)
    ctx.fillStyle = FG_COLOR
    const x = BORDER
    const y = FIELD_Y
    const w = LCD_W - BORDER * 2
    const h = ROWS * CELL + 4
    // Top
    ctx.fillRect(x, y, w, 2)
    // Bottom
    ctx.fillRect(x, y + h - 2, w, 2)
    // Left
    ctx.fillRect(x, y, 2, h)
    // Right
    ctx.fillRect(x + w - 2, y, 2, h)
  }

  function drawHeader(gameState) {
    const { score, bonus } = gameState
    ctx.fillStyle = FG_COLOR

    // Score in top-left (inside outer border)
    const scoreStr = String(score).padStart(4, '0')
    drawText(scoreStr, BORDER + 2, BORDER + 2)

    // Bonus food icon + countdown in top-right
    if (bonus) {
      const timerStr = String(bonus.timer)
      const timerTextW = timerStr.length * 8
      // Food icon (16x8) + 2px gap + countdown text
      const totalW = 16 + 2 + timerTextW
      const rx = LCD_W - BORDER - 2 - totalW
      const ry = BORDER + 3
      drawFoodSprite(ctx, bonus.type, rx, ry)
      drawText(timerStr, rx + 18, ry - 1)
    }
  }

  function drawMazeWalls(mazeIndex) {
    if (mazeIndex === 0) return
    const bitmap = getMazeBitmap(mazeIndex)
    ctx.fillStyle = FG_COLOR
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (bitmap[y][x]) {
          ctx.fillRect(FIELD_INNER_X + x * CELL, FIELD_INNER_Y + y * CELL, CELL, CELL)
        }
      }
    }
  }

  function drawGameScreen(gameState) {
    const { segments, nibble, bonus, walls: mazeIndex } = gameState

    // Draw field border
    drawFieldBorder()

    // Draw maze walls
    drawMazeWalls(mazeIndex)

    // Draw nibble
    if (nibble) {
      ctx.fillStyle = FG_COLOR
      drawSprite(ctx, SPR_NIBBLE, FIELD_INNER_X + nibble.x * CELL, FIELD_INNER_Y + nibble.y * CELL)
    }

    // Draw bonus food on field (16x8 sprite, 2 cells wide)
    if (bonus) {
      ctx.fillStyle = FG_COLOR
      drawFoodSprite(ctx, bonus.type, FIELD_INNER_X + bonus.x * CELL, FIELD_INNER_Y + bonus.y * CELL)
    }

    // Draw snake segments (tail-to-head order for correct overlap)
    ctx.fillStyle = FG_COLOR
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i]
      drawSprite(ctx, seg.sprite, FIELD_INNER_X + seg.x * CELL, FIELD_INNER_Y + seg.y * CELL)
    }

    // Draw header (score + bonus countdown) on top
    drawHeader(gameState)
  }

  function drawSplash() {
    const bitmap = getSplashBitmap()
    if (!bitmap) return
    // Center the 84x48 bitmap (at 2x = 168x96) on the canvas
    const offsetX = Math.floor((LCD_W - 84 * 2) / 2)
    const offsetY = Math.floor((LCD_H - 48 * 2) / 2)
    ctx.fillStyle = FG_COLOR
    for (let y = 0; y < 48; y++) {
      for (let x = 0; x < 84; x++) {
        if (bitmap[y][x]) {
          ctx.fillRect(offsetX + x * 2, offsetY + y * 2, 2, 2)
        }
      }
    }
  }

  function drawMenu(gameState) {
    const { menuIndex, gameLevel } = gameState
    const items = ['New game', 'Level', 'Top score']

    const contentL = BORDER              // 6
    const contentR = LCD_W - BORDER      // 194

    // Scrollbar geometry (right edge of content area)
    const trackW = 2
    const trackX = contentR - trackW     // 192 (track: x=192..193)

    // Highlight bar: 1px from content left edge, extends to scrollbar right edge
    const barL = contentL + 1            // 7
    const barH = 24 + 2                  // 26 (1px above text + 24px font + 1px below)
    const itemGap = 0
    const itemStep = barH + itemGap      // 26

    // "8-1-X" Nokia menu path (Games > Snake II > item) — top right
    ctx.fillStyle = FG_COLOR
    const settingsStr = `8-1-${menuIndex + 1}`
    const settingsW = measureText7(settingsStr)
    drawText7(settingsStr, contentR - settingsW, BORDER)

    // Menu list starts below settings
    const listTop = BORDER + 20 + 6  // 32
    const listBot = listTop + items.length * itemStep - itemGap  // bottom of last bar

    // Draw menu items
    for (let i = 0; i < items.length; i++) {
      const y = listTop + i * itemStep

      if (i === menuIndex) {
        // Full-width highlight bar (extends to scrollbar edge = folder tab)
        ctx.fillStyle = FG_COLOR
        ctx.fillRect(barL, y, contentR - barL, barH)
        // Inverted text
        ctx.fillStyle = BG_COLOR
        drawText7(items[i], barL + 2, y)
      } else {
        ctx.fillStyle = FG_COLOR
        drawText7(items[i], barL + 2, y)
      }
    }

    // Scrollbar track — only drawn ABOVE and BELOW the selected item bracket.
    // The selected item's highlight bar already fills the bracket region,
    // so the step from wide bar to narrow track creates the "folder tab" notch.
    ctx.fillStyle = FG_COLOR
    const thumbTop = listTop + menuIndex * itemStep
    const thumbBot = thumbTop + barH
    if (thumbTop > listTop) {
      ctx.fillRect(trackX, listTop, trackW, thumbTop - listTop)
    }
    if (thumbBot < listBot) {
      ctx.fillRect(trackX, thumbBot, trackW, listBot - thumbBot)
    }

    // "Select" — centered at bottom
    ctx.fillStyle = FG_COLOR
    const selectW = measureText7('Select')
    drawText7('Select', Math.floor((LCD_W - selectW) / 2), LCD_H - BORDER - 25)
  }

  function drawMenuLevel(gameState) {
    const { tempLevel } = gameState
    const contentX = BORDER
    const contentW = CONTENT_W

    ctx.fillStyle = FG_COLOR

    // "Level" title at top
    const title = 'Level'
    drawText7(title, contentX + 10, 10)

    // Separator line
    ctx.fillRect(contentX, 28, contentW, 1)

    // Large centered level number with arrows
    const levelStr = String(tempLevel)
    const levelW = measureText7(levelStr)
    const centerY = 56
    drawText7(levelStr, Math.floor((LCD_W - levelW) / 2), centerY)

    // Left/right arrows
    const arrowY = centerY
    drawText7('<', Math.floor((LCD_W - levelW) / 2) - 20, arrowY)
    drawText7('>', Math.floor((LCD_W + levelW) / 2) + 8, arrowY)

    // Bottom labels: "Back" (left) and "OK" (right)
    const backLabel = 'Back'
    const okLabel = 'OK'
    const bottomY = LCD_H - BORDER - 16
    drawText7(backLabel, contentX + 4, bottomY)
    const okW = measureText7(okLabel)
    drawText7(okLabel, LCD_W - BORDER - okW, bottomY)
  }

  function drawLeaderboard(gameState) {
    const { leaderboard } = gameState
    const contentX = BORDER
    const contentW = CONTENT_W

    ctx.fillStyle = FG_COLOR

    // "Top score" title
    drawText7('Top score', contentX + 10, BORDER)

    // Separator line
    const sepY = BORDER + 20 + 4
    ctx.fillRect(contentX, sepY, contentW, 1)

    // Score entries
    const entryTop = sepY + 4
    const entryH = 20 + 2
    for (let i = 0; i < 5; i++) {
      const y = entryTop + i * entryH
      const rank = `${i + 1}.`
      const scoreStr = leaderboard[i] != null
        ? String(leaderboard[i]).padStart(4, '0')
        : '----'
      drawText7(rank, contentX + 10, y)
      drawText7(scoreStr, contentX + 46, y)
    }

    // "Back" centered at bottom
    const backW = measureText7('Back')
    drawText7('Back', Math.floor((LCD_W - backW) / 2), LCD_H - BORDER - 20)
  }

  function drawGameOver(gameState) {
    const { score, highScore } = gameState
    ctx.fillStyle = FG_COLOR

    drawTextCentered('GAME OVER', 16)
    drawTextCentered('SCORE:' + String(score), 40)

    if (score >= highScore && score > 0) {
      drawTextCentered('NEW BEST!', 56)
    } else {
      drawTextCentered('BEST:' + String(highScore), 56)
    }

    drawTextCentered('PRESS ENTER', 80)
  }

  function drawPaused() {
    // Semi-transparent overlay over the game field
    ctx.fillStyle = BG_COLOR
    ctx.globalAlpha = 0.7
    ctx.fillRect(FIELD_INNER_X, FIELD_INNER_Y, COLS * CELL, ROWS * CELL)
    ctx.globalAlpha = 1

    ctx.fillStyle = FG_COLOR
    const text = 'PAUSED'
    const w = text.length * 8
    drawText(text, Math.floor((LCD_W - w) / 2), FIELD_INNER_Y + Math.floor((ROWS * CELL - 10) / 2))
  }

  function draw(gameState) {
    clear()

    const { state, deathBlinkVisible } = gameState

    if (state === 'splash') {
      drawSplash()
    } else if (state === 'menu') {
      drawMenu(gameState)
    } else if (state === 'menuLevel') {
      drawMenuLevel(gameState)
    } else if (state === 'leaderboard') {
      drawLeaderboard(gameState)
    } else if (state === 'playing') {
      drawGameScreen(gameState)
    } else if (state === 'paused') {
      drawGameScreen(gameState)
      drawPaused()
    } else if (state === 'dying') {
      if (deathBlinkVisible) {
        drawGameScreen(gameState)
      }
    } else if (state === 'gameover') {
      drawGameOver(gameState)
    }

    texture.needsUpdate = true
  }

  return { canvas, texture, draw }
}
