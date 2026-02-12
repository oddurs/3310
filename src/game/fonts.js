import { LCD_W } from './constants.js'

// 3x5 pixel font bitmaps (each char is 3 wide, 5 tall, stored as 15-bit number)
const FONT = {}
function defChar(ch, rows) {
  let bits = 0
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      if (rows[r][c] === '#') bits |= 1 << (r * 3 + c)
    }
  }
  FONT[ch] = bits
}

defChar('0', ['###', '# #', '# #', '# #', '###'])
defChar('1', [' # ', '## ', ' # ', ' # ', '###'])
defChar('2', ['###', '  #', '###', '#  ', '###'])
defChar('3', ['###', '  #', '###', '  #', '###'])
defChar('4', ['# #', '# #', '###', '  #', '  #'])
defChar('5', ['###', '#  ', '###', '  #', '###'])
defChar('6', ['###', '#  ', '###', '# #', '###'])
defChar('7', ['###', '  #', ' # ', ' # ', ' # '])
defChar('8', ['###', '# #', '###', '# #', '###'])
defChar('9', ['###', '# #', '###', '  #', '###'])
defChar('A', [' # ', '# #', '###', '# #', '# #'])
defChar('B', ['## ', '# #', '## ', '# #', '## '])
defChar('C', ['###', '#  ', '#  ', '#  ', '###'])
defChar('D', ['## ', '# #', '# #', '# #', '## '])
defChar('E', ['###', '#  ', '## ', '#  ', '###'])
defChar('F', ['###', '#  ', '## ', '#  ', '#  '])
defChar('G', ['###', '#  ', '# #', '# #', '###'])
defChar('H', ['# #', '# #', '###', '# #', '# #'])
defChar('I', ['###', ' # ', ' # ', ' # ', '###'])
defChar('J', ['  #', '  #', '  #', '# #', '###'])
defChar('K', ['# #', '# #', '## ', '# #', '# #'])
defChar('L', ['#  ', '#  ', '#  ', '#  ', '###'])
defChar('M', ['# #', '###', '###', '# #', '# #'])
defChar('N', ['# #', '###', '###', '###', '# #'])
defChar('O', ['###', '# #', '# #', '# #', '###'])
defChar('P', ['###', '# #', '###', '#  ', '#  '])
defChar('Q', ['###', '# #', '# #', '###', '  #'])
defChar('R', ['###', '# #', '## ', '# #', '# #'])
defChar('S', ['###', '#  ', '###', '  #', '###'])
defChar('T', ['###', ' # ', ' # ', ' # ', ' # '])
defChar('U', ['# #', '# #', '# #', '# #', '###'])
defChar('V', ['# #', '# #', '# #', '# #', ' # '])
defChar('W', ['# #', '# #', '###', '###', '# #'])
defChar('X', ['# #', '# #', ' # ', '# #', '# #'])
defChar('Y', ['# #', '# #', '###', ' # ', ' # '])
defChar('Z', ['###', '  #', ' # ', '#  ', '###'])
defChar(' ', ['   ', '   ', '   ', '   ', '   '])
defChar(':', ['   ', ' # ', '   ', ' # ', '   '])
defChar('-', ['   ', '   ', '###', '   ', '   '])
defChar('>', [' # ', '  #', '   ', '  #', ' # '])
defChar('!', [' # ', ' # ', ' # ', '   ', ' # '])

// Nokia font rasterizer: renders NokjaOriginalSmallBold to pixel-perfect bitmaps
// Canvas fillText always anti-aliases, so we rasterize to an offscreen canvas,
// threshold the alpha to binary, and cache per-glyph pixel arrays.
const NOKIA_FONT_SIZE = 20
const NOKIA_FONT_CSS = `${NOKIA_FONT_SIZE}px "Nokia", monospace`
const glyphCache = {}

function rasterGlyph(ch) {
  if (glyphCache[ch]) return glyphCache[ch]
  const off = document.createElement('canvas')
  const octx = off.getContext('2d')
  octx.font = NOKIA_FONT_CSS
  const advance = Math.ceil(octx.measureText(ch).width)
  off.width = advance + 2
  off.height = NOKIA_FONT_SIZE + 6
  // canvas resize clears font — set again
  octx.font = NOKIA_FONT_CSS
  octx.textBaseline = 'top'
  octx.fillStyle = '#000'
  octx.fillText(ch, 0, 1)
  const id = octx.getImageData(0, 0, off.width, off.height)
  const pixels = []
  for (let y = 0; y < off.height; y++) {
    for (let x = 0; x < off.width; x++) {
      if (id.data[(y * off.width + x) * 4 + 3] > 128) {
        pixels.push(x, y)
      }
    }
  }
  glyphCache[ch] = { pixels, advance }
  return glyphCache[ch]
}

// Draw a 3x5 character at 2x scale (each font pixel = 2x2 canvas pixels)
export function drawChar(ctx, ch, x, y) {
  const bits = FONT[ch.toUpperCase()]
  if (bits === undefined) return
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      if (bits & (1 << (r * 3 + c))) {
        ctx.fillRect(x + c * 2, y + r * 2, 2, 2)
      }
    }
  }
}

export function drawText(ctx, text, x, y) {
  for (let i = 0; i < text.length; i++) {
    drawChar(ctx, text[i], x + i * 8, y)
  }
}

export function drawTextCentered(ctx, text, y) {
  const w = text.length * 8
  drawText(ctx, text, Math.floor((LCD_W - w) / 2), y)
}

export function measureText7(text) {
  let w = 0
  for (let i = 0; i < text.length; i++) {
    w += rasterGlyph(text[i]).advance
  }
  return w
}

export function drawText7(ctx, text, x, y) {
  let cx = x
  for (let i = 0; i < text.length; i++) {
    const g = rasterGlyph(text[i])
    for (let j = 0; j < g.pixels.length; j += 2) {
      ctx.fillRect(cx + g.pixels[j], y + g.pixels[j + 1], 1, 1)
    }
    cx += g.advance
  }
}
