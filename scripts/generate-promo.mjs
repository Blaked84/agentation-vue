#!/usr/bin/env node
/**
 * Capture the Chrome Web Store promotional image (1280x800).
 *
 * Starts the landing dev server, waits for the demo animation to reach
 * the terminal-output frame, takes a screenshot, then shuts down.
 *
 * Output: packages/chrome-extension/promo-1280x800.png
 *
 * Usage: node scripts/generate-promo.mjs
 * Requires: @playwright/test (already in devDependencies)
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const landingDir = resolve(root, 'playgrounds/landing')
const outputPath = resolve(root, 'packages/chrome-extension/promo-1280x800.png')

const PORT = 3099 // avoid clashing with dev:landing on 3002
const URL = `http://localhost:${PORT}/promo/chrome-store`

// ---------------------------------------------------------------------------
// 1. Start the landing dev server
// ---------------------------------------------------------------------------
console.log('starting landing dev server on port', PORT)
const server = spawn('npx', ['nuxi', 'dev', '--port', String(PORT)], {
  cwd: landingDir,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, BROWSER: 'none', PROMO_CAPTURE: 'true' },
})

// Wait until the dev server is ready
await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Dev server timed out after 60s')), 60_000)

  function onData(chunk) {
    const text = chunk.toString()
    if (text.includes('Local:') || text.includes('localhost')) {
      clearTimeout(timeout)
      resolve()
    }
  }

  server.stdout.on('data', onData)
  server.stderr.on('data', onData)
  server.on('error', (err) => { clearTimeout(timeout); reject(err) })
  server.on('exit', (code) => {
    if (code) { clearTimeout(timeout); reject(new Error(`Server exited with code ${code}`)) }
  })
})

console.log('dev server ready')

// ---------------------------------------------------------------------------
// 2. Capture screenshot with Playwright
// ---------------------------------------------------------------------------
let browser
try {
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  await page.goto(URL, { waitUntil: 'networkidle' })

  // Wait for the demo animation to reach the frozen "annotation-pinned" frame.
  await page.waitForSelector('[data-demo-phase="frozen"]', { timeout: 30_000 })
  // Short settle delay so marker/toolbar transitions are fully at rest.
  await page.waitForTimeout(400)

  await page.screenshot({ path: outputPath, clip: { x: 0, y: 0, width: 1280, height: 800 } })
  console.log('wrote', outputPath)
} finally {
  await browser?.close()
  server.kill()
}
