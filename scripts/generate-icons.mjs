#!/usr/bin/env node
/**
 * Generate all icon assets from the cursor icon in packages/agentation-vue/src/icons.ts.
 *
 * Outputs:
 *   packages/chrome-extension/icon16.png
 *   packages/chrome-extension/icon48.png
 *   packages/chrome-extension/icon128.png
 *   playgrounds/landing/public/logo.svg
 *
 * Usage: node scripts/generate-icons.mjs
 * Requires: @resvg/resvg-js (pnpm add -Dw @resvg/resvg-js)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// 1. Read the cursor icon path from the source of truth
// ---------------------------------------------------------------------------
const iconsSource = readFileSync(
  resolve(root, 'packages/agentation-vue/src/icons.ts'),
  'utf-8',
)
const match = iconsSource.match(/'cursor':\s*'(.+?)'/)
if (!match) {
  console.error('Could not find cursor icon path in icons.ts')
  process.exit(1)
}
const cursorPath = match[1]

// VaIcon renders with these attributes:
//   viewBox="0 0 24 24" fill="none" stroke="currentColor"
//   stroke-width="2" stroke-linecap="round" stroke-linejoin="round"

const ACCENT = '#42b883'
const BG = '#111111'

// ---------------------------------------------------------------------------
// 2. Build SVGs
// ---------------------------------------------------------------------------

/** Chrome extension icon: green stroked cursor on dark rounded-rect background */
function extensionSvg(size) {
  const pad = Math.round(size * 0.18)
  const inner = size - pad * 2
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.16)}" fill="${BG}"/>`,
    `  <svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 24 24"`,
    `       fill="none" stroke="${ACCENT}" stroke-width="2"`,
    `       stroke-linecap="round" stroke-linejoin="round">`,
    `    ${cursorPath}`,
    `  </svg>`,
    `</svg>`,
  ].join('\n')
}

/** Landing-page logo: green stroked cursor, transparent background */
function logoSvg() {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"`,
    `     fill="none" stroke="${ACCENT}" stroke-width="2"`,
    `     stroke-linecap="round" stroke-linejoin="round">`,
    `  ${cursorPath}`,
    `</svg>`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// 3. Write SVGs + convert to PNG
// ---------------------------------------------------------------------------
const extDir = resolve(root, 'packages/chrome-extension')
const landingDir = resolve(root, 'playgrounds/landing/public')
mkdirSync(landingDir, { recursive: true })

// Landing logo (SVG only)
const logoPath = resolve(landingDir, 'logo.svg')
writeFileSync(logoPath, logoSvg())
console.log('wrote', logoPath)

// Chrome extension PNGs — render at 4x then let resvg resize for crisp results
const sizes = [16, 48, 128]

for (const size of sizes) {
  const svg = extensionSvg(size)
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  const png = resvg.render().asPng()
  const pngPath = resolve(extDir, `icon${size}.png`)
  writeFileSync(pngPath, png)
  console.log('wrote', pngPath)
}

console.log('done')
