// Snake II splash screen — loads the original logo and renders it
// as a 1-bit-per-pixel bitmap at 84×48 Nokia LCD resolution.
// The source logo.png is 216×154 (2× of 108×77 native).

const LOGO_URL = '/images/snake2_logo.png'

let _splashImage = null
let _bitmap = null

// Preload the logo image
export function preloadSplash() {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      _splashImage = img
      _buildBitmap()
      resolve()
    }
    img.onerror = () => resolve() // degrade gracefully
    img.src = LOGO_URL
  })
}

// Build a clean 84×48 1-bit bitmap from the loaded image.
// Uses area-averaging (box filter) for downscaling instead of
// nearest-neighbor, which prevents lost pixel detail.
function _buildBitmap() {
  if (!_splashImage || _bitmap) return

  // Use the 2× source (216×154) for maximum fidelity
  const srcW = 216
  const srcH = 154

  // Draw logo at 2× onto offscreen canvas
  const offscreen = document.createElement('canvas')
  offscreen.width = srcW
  offscreen.height = srcH
  const octx = offscreen.getContext('2d')
  octx.imageSmoothingEnabled = false
  octx.drawImage(_splashImage, 0, 0, srcW, srcH)

  const imgData = octx.getImageData(0, 0, srcW, srcH)
  const src = imgData.data

  // Find content bounding box at 2× resolution
  let top = srcH, bottom = 0, left = srcW, right = 0
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      if (src[(y * srcW + x) * 4 + 3] > 128) {
        if (y < top) top = y
        if (y > bottom) bottom = y
        if (x < left) left = x
        if (x > right) right = x
      }
    }
  }

  const contentW = right - left + 1
  const contentH = bottom - top + 1

  // Scale to fit 84×48 maintaining aspect ratio
  const scale = Math.min(84 / contentW, 48 / contentH)
  const dstW = Math.round(contentW * scale)
  const dstH = Math.round(contentH * scale)
  const offsetX = Math.floor((84 - dstW) / 2)
  const offsetY = Math.floor((48 - dstH) / 2)

  // For each destination pixel, compute how much of the source area
  // is covered by opaque pixels (area averaging / box filter).
  _bitmap = []
  for (let y = 0; y < 48; y++) {
    const row = new Uint8Array(84)
    for (let x = 0; x < 84; x++) {
      const lx = x - offsetX
      const ly = y - offsetY
      if (lx >= 0 && lx < dstW && ly >= 0 && ly < dstH) {
        // Source region this dest pixel maps to (floating point)
        const sx0 = left + lx / scale
        const sy0 = top + ly / scale
        const sx1 = left + (lx + 1) / scale
        const sy1 = top + (ly + 1) / scale

        // Sample all source pixels in this region
        const isx0 = Math.floor(sx0)
        const isy0 = Math.floor(sy0)
        const isx1 = Math.min(Math.ceil(sx1), srcW)
        const isy1 = Math.min(Math.ceil(sy1), srcH)

        let opaque = 0
        let total = 0
        for (let sy = isy0; sy < isy1; sy++) {
          for (let sx = isx0; sx < isx1; sx++) {
            total++
            if (src[(sy * srcW + sx) * 4 + 3] > 128) {
              opaque++
            }
          }
        }
        // Pixel is "on" if ≥40% of the source area is opaque
        row[x] = (total > 0 && opaque / total >= 0.4) ? 1 : 0
      }
    }
    _bitmap.push(row)
  }
}

export function getSplashBitmap() {
  return _bitmap
}
