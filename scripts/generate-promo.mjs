#!/usr/bin/env node
/**
 * Capture promotional images for the project.
 *
 * Starts the landing dev server, captures two screenshots, then shuts down:
 *   1. Chrome Web Store (1280×800)  → packages/chrome-extension/promo-1280x800.png
 *   2. Open Graph / Twitter Card (1200×630) → playgrounds/landing/public/og.png
 *
 * Usage: node scripts/generate-promo.mjs
 * Requires: @playwright/test (already in devDependencies)
 */

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const landingDir = resolve(root, 'playgrounds/landing')

const PORT = 3099 // avoid clashing with dev:landing on 3002
const BASE_URL = `http://localhost:${PORT}`

const targets = [
  {
    name: 'Chrome Web Store',
    path: '/promo/chrome-store',
    viewport: { width: 1280, height: 800 },
    output: resolve(root, 'packages/chrome-extension/promo-1280x800.png'),
  },
  {
    name: 'Open Graph',
    path: '/promo/og',
    viewport: { width: 1200, height: 630 },
    output: resolve(root, 'playgrounds/landing/public/og.png'),
  },
]

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
  server.on('error', (err) => {
    clearTimeout(timeout)
    reject(err)
  })
  server.on('exit', (code) => {
    if (code) {
      clearTimeout(timeout)
      reject(new Error(`Server exited with code ${code}`))
    }
  })
})

console.log('dev server ready')

// ---------------------------------------------------------------------------
// 2. Capture screenshots with Playwright
// ---------------------------------------------------------------------------
let browser
try {
  browser = await chromium.launch()

  for (const target of targets) {
    console.log(`capturing ${target.name} (${target.viewport.width}×${target.viewport.height})…`)
    const page = await browser.newPage({ viewport: target.viewport })

    await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'networkidle' })

    await page.waitForSelector('[data-demo-phase="frozen"]', { timeout: 30_000 })
    await page.waitForTimeout(400)

    await page.screenshot({
      path: target.output,
      clip: { x: 0, y: 0, ...target.viewport },
    })
    console.log('wrote', target.output)
    await page.close()
  }
}
finally {
  await browser?.close()
  server.kill()
}
