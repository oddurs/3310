import { describe, it, expect } from 'vitest'
import {
  COLS, ROWS, CELL,
  DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT,
  DIR_DX, DIR_DY, DIR_OPPOSITE,
  SPEED_TABLE,
} from '../../src/game/constants.js'

describe('Direction vectors', () => {
  it('DIR_UP moves y=-1', () => {
    expect(DIR_DX[DIR_UP]).toBe(0)
    expect(DIR_DY[DIR_UP]).toBe(-1)
  })

  it('DIR_DOWN moves y=+1', () => {
    expect(DIR_DX[DIR_DOWN]).toBe(0)
    expect(DIR_DY[DIR_DOWN]).toBe(1)
  })

  it('DIR_LEFT moves x=-1', () => {
    expect(DIR_DX[DIR_LEFT]).toBe(-1)
    expect(DIR_DY[DIR_LEFT]).toBe(0)
  })

  it('DIR_RIGHT moves x=+1', () => {
    expect(DIR_DX[DIR_RIGHT]).toBe(1)
    expect(DIR_DY[DIR_RIGHT]).toBe(0)
  })
})

describe('Direction opposites', () => {
  it('UP opposite is DOWN', () => {
    expect(DIR_OPPOSITE[DIR_UP]).toBe(DIR_DOWN)
  })

  it('DOWN opposite is UP', () => {
    expect(DIR_OPPOSITE[DIR_DOWN]).toBe(DIR_UP)
  })

  it('LEFT opposite is RIGHT', () => {
    expect(DIR_OPPOSITE[DIR_LEFT]).toBe(DIR_RIGHT)
  })

  it('RIGHT opposite is LEFT', () => {
    expect(DIR_OPPOSITE[DIR_RIGHT]).toBe(DIR_LEFT)
  })

  it('double opposite returns original direction', () => {
    for (let d = 0; d < 4; d++) {
      expect(DIR_OPPOSITE[DIR_OPPOSITE[d]]).toBe(d)
    }
  })
})

describe('Speed table', () => {
  it('has 15 entries', () => {
    expect(SPEED_TABLE).toHaveLength(15)
  })

  it('all values are positive', () => {
    for (const ms of SPEED_TABLE) {
      expect(ms).toBeGreaterThan(0)
    }
  })

  it('is monotonically decreasing (higher index = faster)', () => {
    for (let i = 1; i < SPEED_TABLE.length; i++) {
      expect(SPEED_TABLE[i]).toBeLessThan(SPEED_TABLE[i - 1])
    }
  })
})

describe('Grid dimensions', () => {
  it('COLS is positive', () => {
    expect(COLS).toBeGreaterThan(0)
  })

  it('ROWS is positive', () => {
    expect(ROWS).toBeGreaterThan(0)
  })

  it('CELL is positive', () => {
    expect(CELL).toBeGreaterThan(0)
  })
})
