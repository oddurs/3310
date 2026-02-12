import {
  COLS, ROWS, SPEED_TABLE,
  DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT,
  DIR_DX, DIR_DY, DIR_OPPOSITE,
  SPR_HEAD, SPR_HEAD_OPEN, SPR_BODY, SPR_BODY_FULL,
  SPR_TURN, SPR_TURN_FULL, SPR_TAIL, SPR_NIBBLE,
} from './constants.js'
import { TURN_INDEX } from './sprites.js'
import { getMazeWalls, getMazeStart } from './mazes.js'
import { loadLeaderboard, saveToLeaderboard } from './leaderboard.js'

// User levels 1-9 mapped to SPEED_TABLE indices (index 0 unused)
const LEVEL_TO_SPEED = [0, 0, 2, 4, 6, 8, 10, 11, 13, 14]

export function createGame() {
  let cachedLeaderboard = loadLeaderboard()
  let state = 'splash'   // splash | menu | menuLevel | leaderboard | playing | paused | dying | gameover
  let segments = []       // [{x, y, sprite}, ...] head at index 0
  let direction = DIR_RIGHT
  let nextDirection = DIR_RIGHT
  let nibble = null       // {x, y}
  let bonus = null        // {x, y, type, timer} or null
  let score = 0
  let highScore = 0
  let gameLevel = 1       // user level 1-9
  let tickInterval = SPEED_TABLE[LEVEL_TO_SPEED[1]]
  let lastTick = 0

  // Menu state
  let menuIndex = 0       // 0=New game, 1=Level, 2=Top score
  let tempLevel = 1       // temporary level in picker (reverted on cancel)

  // Campaign state
  let campaignMaze = 0
  let campaignNibblesEaten = 0
  let campaignNibblesTarget = 10

  // Eating mechanics
  let fullIndex = -1       // segment index showing "full" sprite, -1 = none
  let nibblesEaten = 0     // total nibbles since game start (for bonus timing)
  let nextBonusAt = 0      // nibble count that triggers next bonus
  let bonusTicksLeft = 0   // ticks remaining for current bonus

  // Death animation
  let deathBlinkVisible = true
  let deathBlinkCount = 0
  let deathBlinkTimer = 0

  // Current maze walls (Set of "x,y" strings)
  let walls = new Set()

  function getActiveMaze() {
    return 0
  }

  function scheduleNextBonus() {
    nextBonusAt = nibblesEaten + 5 + Math.floor(Math.random() * 3) // 5-7 nibbles
  }

  function spawnNibble() {
    const occupied = new Set()
    for (const seg of segments) occupied.add(`${seg.x},${seg.y}`)
    if (bonus) {
      occupied.add(`${bonus.x},${bonus.y}`)
      occupied.add(`${bonus.x + 1},${bonus.y}`)
    }
    // Also exclude wall cells
    for (const w of walls) occupied.add(w)

    const free = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!occupied.has(`${x},${y}`)) free.push({ x, y })
      }
    }
    if (free.length === 0) { nibble = null; return }
    nibble = free[Math.floor(Math.random() * free.length)]
  }

  function spawnBonus() {
    const occupied = new Set()
    for (const seg of segments) occupied.add(`${seg.x},${seg.y}`)
    if (nibble) occupied.add(`${nibble.x},${nibble.y}`)
    for (const w of walls) occupied.add(w)

    // Bonus is 2 cells wide: (x, y) and (x+1, y)
    const free = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS - 1; x++) {
        if (!occupied.has(`${x},${y}`) && !occupied.has(`${x + 1},${y}`)) {
          free.push({ x, y })
        }
      }
    }
    if (free.length === 0) return
    const pos = free[Math.floor(Math.random() * free.length)]
    bonus = {
      x: pos.x,
      y: pos.y,
      type: Math.floor(Math.random() * 6),
      timer: 20,
    }
    bonusTicksLeft = 20
  }

  function dirFromDelta(dx, dy) {
    if (dx === 0 && dy === -1) return DIR_UP
    if (dx === 0 && dy === 1) return DIR_DOWN
    if (dx === -1 && dy === 0) return DIR_LEFT
    if (dx === 1 && dy === 0) return DIR_RIGHT
    return DIR_RIGHT
  }

  function buildInitialSnake(headX, headY) {
    // 7 segments facing right: head at (headX, headY), body extends left
    segments = []
    for (let i = 0; i < 7; i++) {
      const x = headX - i
      let sprite
      if (i === 0) sprite = SPR_HEAD + DIR_RIGHT
      else if (i === 6) sprite = SPR_TAIL + DIR_RIGHT
      else sprite = SPR_BODY + DIR_RIGHT
      segments.push({ x, y: headY, sprite })
    }
  }

  function reset() {
    const maze = getActiveMaze()
    walls = getMazeWalls(maze)
    const [hx, hy] = getMazeStart(maze)
    buildInitialSnake(hx, hy)
    direction = DIR_RIGHT
    nextDirection = DIR_RIGHT
    score = 0
    tickInterval = SPEED_TABLE[LEVEL_TO_SPEED[gameLevel]]
    fullIndex = -1
    nibblesEaten = 0
    bonus = null
    bonusTicksLeft = 0
    campaignNibblesEaten = 0
    campaignNibblesTarget = 10
    scheduleNextBonus()
    spawnNibble()
  }

  function start() {
    reset()
    state = 'playing'
    lastTick = 0
    return { event: 'start' }
  }

  function setDirection(dir) {
    if (dir === DIR_OPPOSITE[direction]) return
    nextDirection = dir
  }

  function updateTailSprite() {
    if (segments.length < 2) return
    const tail = segments[segments.length - 1]
    const prev = segments[segments.length - 2]
    // Direction from tail toward the segment ahead of it
    let dx = prev.x - tail.x
    let dy = prev.y - tail.y
    // Handle wrapping: if distance > 1, reverse the direction
    if (dx > 1) dx = -1
    if (dx < -1) dx = 1
    if (dy > 1) dy = -1
    if (dy < -1) dy = 1
    tail.sprite = SPR_TAIL + dirFromDelta(dx, dy)
  }

  function update(timestamp) {
    if (state === 'dying') {
      // Death blink animation using real time
      if (timestamp - deathBlinkTimer >= 270) {
        deathBlinkTimer = timestamp
        deathBlinkVisible = !deathBlinkVisible
        deathBlinkCount++
        if (deathBlinkCount >= 10) {
          state = 'gameover'
          if (score > highScore) highScore = score
          saveToLeaderboard(score)
          cachedLeaderboard = loadLeaderboard()
        }
      }
      return null
    }

    if (state !== 'playing') return null
    if (lastTick === 0) { lastTick = timestamp; return null }
    if (timestamp - lastTick < tickInterval) return null
    lastTick = timestamp

    // Apply buffered direction
    direction = nextDirection

    const head = segments[0]
    const dx = DIR_DX[direction]
    const dy = DIR_DY[direction]
    let nx = head.x + dx
    let ny = head.y + dy

    // Free mode: wrap around edges
    if (nx < 0) nx = COLS - 1
    else if (nx >= COLS) nx = 0
    if (ny < 0) ny = ROWS - 1
    else if (ny >= ROWS) ny = 0

    // Maze wall collision
    if (walls.has(`${nx},${ny}`)) {
      return die(timestamp)
    }

    // Self collision (don't check tail since it will move, unless eating)
    const ateNibble = nibble && nx === nibble.x && ny === nibble.y
    const ateBonusCheck = bonus && ny === bonus.y && (nx === bonus.x || nx === bonus.x + 1)
    const willGrow = ateNibble || ateBonusCheck
    const checkSegments = willGrow ? segments : segments.slice(0, -1)
    for (const seg of checkSegments) {
      if (seg.x === nx && seg.y === ny) {
        return die(timestamp)
      }
    }

    // Check if food is one cell ahead of the new head → open-mouth
    const aheadX = nx + dx
    const aheadY = ny + dy
    const foodAhead = (nibble && aheadX === nibble.x && aheadY === nibble.y) ||
                      (bonus && aheadY === bonus.y && (aheadX === bonus.x || aheadX === bonus.x + 1))
    const headSprite = (foodAhead || ateNibble || ateBonusCheck)
      ? SPR_HEAD_OPEN + direction
      : SPR_HEAD + direction

    // Determine the sprite for the old head (now becomes body or turn)
    const oldHeadDir = segments[0].sprite % 4
    let oldHeadNewSprite
    if (oldHeadDir === direction) {
      // Straight: body segment
      oldHeadNewSprite = SPR_BODY + direction
    } else {
      // Turn segment
      const turnOff = TURN_INDEX[oldHeadDir][direction]
      oldHeadNewSprite = (turnOff >= 0) ? SPR_TURN + turnOff : SPR_BODY + direction
    }

    // Apply "full" sprite to the old head if fullIndex is active
    if (fullIndex >= 0) {
      // The full bulge is at fullIndex position
      fullIndex++
      if (fullIndex >= segments.length) {
        fullIndex = -1
      }
    }

    // Push new head
    segments.unshift({ x: nx, y: ny, sprite: headSprite })
    // Update old head (now at index 1)
    segments[1].sprite = oldHeadNewSprite

    // Apply full sprite to the segment at fullIndex
    if (fullIndex >= 1 && fullIndex < segments.length) {
      const seg = segments[fullIndex]
      const spr = seg.sprite
      if (spr >= SPR_BODY && spr < SPR_BODY + 4) {
        seg.sprite = spr + 4 // body → body full
      } else if (spr >= SPR_TURN && spr < SPR_TURN + 8) {
        seg.sprite = spr + 8 // turn → turn full
      }
    }

    let event = { event: 'moved' }

    if (ateNibble) {
      // Grow: don't pop tail
      nibblesEaten++
      campaignNibblesEaten++
      score += LEVEL_TO_SPEED[gameLevel] + 1
      fullIndex = 1 // start full bulge at segment behind head

      spawnNibble()

      // Check if bonus should spawn
      if (nibblesEaten >= nextBonusAt && !bonus) {
        spawnBonus()
      }

      event = { event: 'ate' }
    } else if (ateBonusCheck) {
      // Ate bonus food: grow, score bonus, remove bonus
      const bonusScore = 5 * (LEVEL_TO_SPEED[gameLevel] + 10) - 2 * (20 - bonus.timer)
      score += Math.max(bonusScore, 1)
      fullIndex = 1
      bonus = null
      bonusTicksLeft = 0
      event = { event: 'bonusAte' }
    } else {
      // Normal move: pop tail
      segments.pop()
    }

    // Decrement bonus timer
    if (bonus) {
      bonus.timer--
      if (bonus.timer <= 0) {
        bonus = null
        bonusTicksLeft = 0
      }
    }

    // Clear full sprites on non-full segments (reset any previous full sprites)
    for (let i = 1; i < segments.length - 1; i++) {
      if (i === fullIndex) continue
      const spr = segments[i].sprite
      if (spr >= SPR_BODY_FULL && spr < SPR_BODY_FULL + 4) {
        segments[i].sprite = spr - 4
      } else if (spr >= SPR_TURN_FULL && spr < SPR_TURN_FULL + 8) {
        segments[i].sprite = spr - 8
      }
    }

    // Update tail sprite
    updateTailSprite()

    return event
  }

  function die(timestamp) {
    state = 'dying'
    deathBlinkVisible = true
    deathBlinkCount = 0
    deathBlinkTimer = timestamp
    return { event: 'died' }
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused'
    } else if (state === 'paused') {
      state = 'playing'
      lastTick = 0 // reset tick timer to avoid catching up
    }
  }

  function dismissSplash() {
    if (state === 'splash') state = 'menu'
  }

  function returnToMenu() {
    if (state === 'gameover') {
      state = 'menu'
      menuIndex = 0
      campaignMaze = 0
    }
  }

  // Menu navigation
  function menuUp() {
    if (state === 'menu' && menuIndex > 0) menuIndex--
  }

  function menuDown() {
    if (state === 'menu' && menuIndex < 2) menuIndex++
  }

  function menuLeft() {
    if (state === 'menuLevel' && tempLevel > 1) tempLevel--
  }

  function menuRight() {
    if (state === 'menuLevel' && tempLevel < 9) tempLevel++
  }

  function menuSelect() {
    if (menuIndex === 0) return start()
    if (menuIndex === 1) {
      tempLevel = gameLevel
      state = 'menuLevel'
    }
    if (menuIndex === 2) {
      state = 'leaderboard'
    }
    return null
  }

  function menuBack() {
    if (state === 'menuLevel' || state === 'leaderboard') {
      state = 'menu'
    }
  }

  function levelConfirm() {
    if (state === 'menuLevel') {
      gameLevel = tempLevel
      state = 'menu'
    }
  }

  function getState() {
    return {
      state,
      segments,
      nibble,
      bonus,
      score,
      highScore,
      direction,
      gameLevel,
      menuIndex,
      tempLevel,
      leaderboard: cachedLeaderboard,
      deathBlinkVisible,
      walls: getActiveMaze(),
    }
  }

  return {
    update, getState, setDirection, start, togglePause,
    dismissSplash, returnToMenu,
    menuUp, menuDown, menuLeft, menuRight,
    menuSelect, menuBack, levelConfirm,
  }
}
