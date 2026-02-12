// Snake II faithful replica constants
// Layout: 188 wide, header + game field + borders

// LCD canvas dimensions
// Layout: 6 pad + 2 field border + content + 2 field border + 6 pad
export const LCD_W = 200  // 6 + 2 + 184(23×8) + 2 + 6
export const LCD_H = 134  // 6 + 14 header + 2 + 104(13×8) + 2 + 6

// Game grid
export const COLS = 23
export const ROWS = 13
export const CELL = 8  // pixels per cell
export const BORDER = 6 // pixel border around canvas edge
export const HEADER_H = 14 // header area height (score + bonus info)

// LCD colors (authentic Nokia green LCD)
export const BG_COLOR = '#c7cfa1'
export const FG_COLOR = '#67743c'
export const FG_LIGHT = '#8b956a'
export const BORDER_COLOR = '#b0b88e'

// Numeric directions
export const DIR_UP = 0
export const DIR_DOWN = 1
export const DIR_LEFT = 2
export const DIR_RIGHT = 3

// Movement vectors indexed by direction
export const DIR_DX = [0, 0, -1, 1]
export const DIR_DY = [-1, 1, 0, 0]

// Opposite direction lookup
export const DIR_OPPOSITE = [DIR_DOWN, DIR_UP, DIR_RIGHT, DIR_LEFT]

// Speed table: ms per tick at each level (0-14)
export const SPEED_TABLE = [
  658, 478, 378, 298, 228, 178, 138, 108, 88, 68, 48, 38, 28, 18, 8
]

// Sprite index base constants
export const SPR_HEAD = 0
export const SPR_HEAD_OPEN = 4
export const SPR_BODY = 8
export const SPR_BODY_FULL = 12
export const SPR_TURN = 16
export const SPR_TURN_FULL = 24
export const SPR_TAIL = 32
export const SPR_NIBBLE = 36
