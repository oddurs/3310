// Snake II maze layouts — 8 mazes for campaign mode
// Grid: 23 columns × 13 rows
// Each maze is an array of [x, y] wall positions

import { COLS, ROWS } from './constants.js'

function buildBorder() {
  const walls = []
  for (let x = 0; x < COLS; x++) {
    walls.push([x, 0])
    walls.push([x, ROWS - 1])
  }
  for (let y = 1; y < ROWS - 1; y++) {
    walls.push([0, y])
    walls.push([COLS - 1, y])
  }
  return walls
}

function hLine(x0, x1, y) {
  const w = []
  for (let x = x0; x <= x1; x++) w.push([x, y])
  return w
}

function vLine(x, y0, y1) {
  const w = []
  for (let y = y0; y <= y1; y++) w.push([x, y])
  return w
}

const MAZES = [
  // Maze 0: Empty (free mode default)
  [],

  // Maze 1: Full border
  buildBorder(),

  // Maze 2: Corner pieces + horizontal bars
  [
    [0,0],[1,0],[21,0],[22,0],
    [0,1],[22,1],
    ...hLine(7, 15, 4),
    ...hLine(7, 15, 8),
    [0,11],[22,11],
    [0,12],[1,12],[21,12],[22,12],
  ],

  // Maze 3: Two L-shaped walls
  [
    ...vLine(8, 0, 6),
    ...hLine(14, 22, 2),
    ...vLine(14, 6, 12),
    ...hLine(0, 8, 10),
  ],

  // Maze 4: Complex bordered maze with inner rooms
  [
    ...buildBorder(),
    [6,2],[16,2],
    [6,3],[8,3],[9,3],[10,3],[11,3],[12,3],[13,3],[14,3],[16,3],
    [6,4],[16,4],
    [6,8],[16,8],
    [6,9],[8,9],[9,9],[10,9],[11,9],[12,9],[13,9],[14,9],[16,9],
    [6,10],[16,10],
  ],

  // Maze 5: Room maze
  [
    [0,0],[1,0],[2,0],
    [5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],[15,0],[16,0],[17,0],[18,0],[19,0],
    [0,1],[10,1],
    [10,2],
    [10,3],
    ...hLine(0, 10, 4), ...hLine(13, 22, 4),
    ...hLine(0, 22, 7),
    ...vLine(12, 8, 12),
  ],

  // Maze 6: Cross pattern
  [
    [11,0],
    [11,1],
    [10,2],[11,2],[12,2],
    [11,3],
    [11,4],
    [7,5],[11,5],[15,5],
    ...hLine(0, 22, 6),
    [7,7],[11,7],[15,7],
    [11,8],
    [11,9],
    [10,10],[11,10],[12,10],
    [11,11],
    [11,12],
  ],

  // Maze 7: Complex corridors
  [
    [14,0],
    [14,1],[15,1],[16,1],
    [8,2],[14,2],
    [4,3],[8,3],[14,3],
    ...hLine(0, 11, 4), ...hLine(14, 20, 4),
    [14,5],
    [8,6],
    [8,7],
    ...hLine(2, 8, 8), ...hLine(11, 22, 8),
    [8,9],[14,9],[18,9],
    [8,10],[14,10],
    [6,11],[7,11],[8,11],
    [8,12],
  ],
]

// Starting positions per maze: head position (facing right, 7 segments)
// Segments go from head at (hx, hy) leftward to (hx-6, hy)
const MAZE_STARTS = [
  [10, 6],  // maze 0: center
  [10, 6],  // maze 1: center
  [10, 6],  // maze 2: center
  [6, 7],   // maze 3: left side row 7
  [10, 6],  // maze 4: center (rows 5-7 clear)
  [10, 5],  // maze 5: center row 5
  [8, 3],   // maze 6: left of center row 3
  [10, 0],  // maze 7: top row
]

const _wallSets = new Map()

export function getMazeWalls(index) {
  if (_wallSets.has(index)) return _wallSets.get(index)
  const set = new Set()
  for (const [x, y] of MAZES[index] || []) {
    set.add(`${x},${y}`)
  }
  _wallSets.set(index, set)
  return set
}

export function getMazeBitmap(index) {
  const grid = []
  for (let y = 0; y < ROWS; y++) {
    grid.push(new Uint8Array(COLS))
  }
  for (const [x, y] of MAZES[index] || []) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      grid[y][x] = 1
    }
  }
  return grid
}

export function getMazeStart(index) {
  return MAZE_STARTS[index] || MAZE_STARTS[0]
}

export function getMazeCount() {
  return MAZES.length
}
