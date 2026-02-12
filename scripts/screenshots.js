#!/usr/bin/env node

// Automated screenshot generator for OG/sharing images
// Uses Playwright to capture the Nokia 3310 Snake app in each theme
//
// Usage:
//   npm run screenshots
//   node scripts/screenshots.js
//
// Output: public/og/<theme-id>.jpg + public/og/og.jpg (default sharing image)

import { chromium } from 'playwright'
import { createServer } from 'vite'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { existsSync, mkdirSync, copyFileSync } from 'fs'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/og')

// Write to temp dir during capture so Vite's file watcher doesn't trigger reloads
const TMP_DIR = join(tmpdir(), 'nokia-snake-screenshots')

// OG image standard: 1200x630. Capture at 2x for downscale sharpness.
const WIDTH = 1200
const HEIGHT = 630
const SCALE = 2
const JPEG_QUALITY = 85

// Theme IDs must match THEMES array in src/scene/themes.js
const THEMES = ['sunflowers', 'shanghai', 'autumn_park', 'beach', 'golden_sunset']

async function main() {
  mkdirSync(TMP_DIR, { recursive: true })
  mkdirSync(OUT_DIR, { recursive: true })

  // Start Vite dev server
  console.log('Starting Vite dev server...')
  const server = await createServer({
    root: ROOT,
    server: { port: 0 },
  })
  await server.listen()
  const port = server.config.server.port || server.httpServer.address().port
  const baseUrl = `http://localhost:${port}`
  console.log(`Dev server running at ${baseUrl}`)

  // Launch browser with software WebGL
  const browser = await chromium.launch({
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-gpu-rasterization',
    ],
  })
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  })
  const page = await context.newPage()

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`  [browser] ${msg.text()}`)
  })
  page.on('pageerror', (err) => console.log(`  [browser error] ${err.message}`))

  try {
    console.log('Loading app...')
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 })

    // Wait for loading overlay to disappear
    await page.waitForSelector('#loading.hidden', { timeout: 30000 })
    console.log('App loaded.')

    // Dismiss splash and wait for camera intro (2.5s) to complete
    await page.click('canvas')
    await page.waitForTimeout(4000)

    // Inject a <style> to hide UI when body has .screenshot-mode
    await page.evaluate(() => {
      const style = document.createElement('style')
      style.textContent = `
        body.screenshot-mode > div { opacity: 0 !important; }
      `
      document.head.appendChild(style)
    })

    for (let i = 0; i < THEMES.length; i++) {
      const themeId = THEMES[i]
      console.log(`Capturing ${themeId} (${i + 1}/${THEMES.length})...`)

      if (i > 0) {
        // Click the env "next" (›) button
        await page.evaluate(() => {
          const allBtns = Array.from(document.querySelectorAll('button'))
          const nextBtn = allBtns.find(b => b.textContent.trim() === '\u203A')
          if (nextBtn) nextBtn.click()
        })
        await page.waitForTimeout(3000)
      }

      // Hide UI, screenshot, show UI
      await page.evaluate(() => document.body.classList.add('screenshot-mode'))
      await page.waitForTimeout(200)

      const pngPath = join(TMP_DIR, `${themeId}.png`)
      await page.screenshot({ path: pngPath, type: 'png' })

      await page.evaluate(() => document.body.classList.remove('screenshot-mode'))
    }
  } finally {
    await browser.close()
    await server.close()
  }

  // Convert PNGs → resized compressed JPEGs using macOS sips
  console.log(`\nProcessing ${THEMES.length} images (resize ${WIDTH * SCALE}→${WIDTH}, JPEG q${JPEG_QUALITY})...`)
  for (const themeId of THEMES) {
    const src = join(TMP_DIR, `${themeId}.png`)
    const dst = resolve(OUT_DIR, `${themeId}.jpg`)
    if (!existsSync(src)) continue
    execSync(
      `sips -z ${HEIGHT} ${WIDTH} "${src}" --setProperty format jpeg --setProperty formatOptions ${JPEG_QUALITY} --out "${dst}"`,
      { stdio: 'pipe' }
    )
    console.log(`  ${themeId}.jpg`)
  }

  // Default OG image = first theme
  copyFileSync(
    resolve(OUT_DIR, `${THEMES[0]}.jpg`),
    resolve(OUT_DIR, 'og.jpg')
  )

  console.log(`\nDefault OG image: public/og/og.jpg (${THEMES[0]})`)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
