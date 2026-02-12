import { describe, it, expect } from 'vitest'
import { COLS, ROWS } from '../../src/game/constants.js'
import { getMazeWalls, getMazeBitmap, getMazeStart, getMazeCount } from '../../src/game/mazes.js'

describe('getMazeCount', () => {
  it('returns 8', () => {
    expect(getMazeCount()).toBe(8)
  })
})

describe('getMazeWalls', () => {
  it('returns a Set for each maze', () => {
    for (let i = 0; i < getMazeCount(); i++) {
      const walls = getMazeWalls(i)
      expect(walls).toBeInstanceOf(Set)
    }
  })

  it('maze 0 (free mode) has no walls', () => {
    expect(getMazeWalls(0).size).toBe(0)
  })

  it('all walls are within grid bounds', () => {
    for (let i = 0; i < getMazeCount(); i++) {
      for (const key of getMazeWalls(i)) {
        const [x, y] = key.split(',').map(Number)
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThan(COLS)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThan(ROWS)
      }
    }
  })

  it('caches results (same reference on repeat call)', () => {
    const a = getMazeWalls(1)
    const b = getMazeWalls(1)
    expect(a).toBe(b)
  })
})

describe('getMazeBitmap', () => {
  it('returns a ROWS x COLS grid', () => {
    for (let i = 0; i < getMazeCount(); i++) {
      const grid = getMazeBitmap(i)
      expect(grid).toHaveLength(ROWS)
      for (const row of grid) {
        expect(row).toHaveLength(COLS)
      }
    }
  })

  it('bitmap matches wall set', () => {
    for (let i = 0; i < getMazeCount(); i++) {
      const walls = getMazeWalls(i)
      const grid = getMazeBitmap(i)
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const inWalls = walls.has(`${x},${y}`)
          const inBitmap = grid[y][x] === 1
          expect(inBitmap).toBe(inWalls)
        }
      }
    }
  })
})

describe('getMazeStart', () => {
  it('returns [x, y] for each maze', () => {
    for (let i = 0; i < getMazeCount(); i++) {
      const start = getMazeStart(i)
      expect(start).toHaveLength(2)
      const [x, y] = start
      expect(typeof x).toBe('number')
      expect(typeof y).toBe('number')
    }
  })

  it('start position is not inside a wall', () => {
    for (let i = 0; i < getMazeCount(); i++) {
      const walls = getMazeWalls(i)
      const [hx, hy] = getMazeStart(i)
      // Snake is 7 segments extending left from head
      for (let dx = 0; dx < 7; dx++) {
        expect(walls.has(`${hx - dx},${hy}`)).toBe(false)
      }
    }
  })

  it('start position is within grid bounds (including 7-segment body)', () => {
    for (let i = 0; i < getMazeCount(); i++) {
      const [hx, hy] = getMazeStart(i)
      expect(hx).toBeGreaterThanOrEqual(6) // need 7 cells leftward
      expect(hx).toBeLessThan(COLS)
      expect(hy).toBeGreaterThanOrEqual(0)
      expect(hy).toBeLessThan(ROWS)
    }
  })
})
