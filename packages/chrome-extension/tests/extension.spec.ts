import type { BrowserContext, Page, Worker } from '@playwright/test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, expect, test } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

const extensionPath = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist')
const navigationOptions = { waitUntil: 'domcontentloaded' as const }

test.describe('chrome extension integration', () => {
  let userDataDir: string
  let context: BrowserContext
  let page: Page
  let serviceWorker: Worker

  async function getServiceWorker() {
    let worker = context.serviceWorkers()[0]
    if (!worker)
      worker = await context.waitForEvent('serviceworker')
    return worker
  }

  async function activateCurrentTab() {
    await page.bringToFront()
    const worker = await getServiceWorker()
    const result = await worker.evaluate(url => globalThis.__agentationTestApi?.enableTabByUrl(url), page.url())
    expect(result).toBe(true)
  }

  async function deactivateCurrentTab() {
    await page.bringToFront()
    const worker = await getServiceWorker()
    const result = await worker.evaluate(url => globalThis.__agentationTestApi?.disableTabByUrl(url), page.url())
    expect(result).toBe(true)
  }

  async function hasShadowToolbar() {
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('*'))
        .some(node => node.shadowRoot?.querySelector('.__va-toolbar'))
    })
  }

  test.beforeAll(async () => {
    userDataDir = mkdtempSync(join(tmpdir(), 'agentation-extension-'))
    context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    })

    serviceWorker = await getServiceWorker()
    expect(serviceWorker.url()).toContain('chrome-extension://')
  })

  test.afterAll(async () => {
    await context.close()
    rmSync(userDataDir, { force: true, recursive: true })
  })

  test.beforeEach(async () => {
    page = context.pages()[0] ?? await context.newPage()
    await page.goto('/', navigationOptions)
    await page.evaluate(() => {
      sessionStorage.clear()
      localStorage.clear()
    })
    await page.reload(navigationOptions)
    await deactivateCurrentTab().catch(() => undefined)
  })

  test('mounts inside a shadow root and auto-remounts after reload', async () => {
    await activateCurrentTab()
    await page.reload(navigationOptions)

    expect(await hasShadowToolbar()).toBe(true)
    await expect(page.locator('.__va-toolbar')).toBeVisible()

    await page.reload(navigationOptions)

    expect(await hasShadowToolbar()).toBe(true)
    await expect(page.locator('.__va-toolbar')).toBeVisible()
  })

  test('detects Vue components through the main-world bridge', async () => {
    await activateCurrentTab()
    await page.reload(navigationOptions)
    await page.locator('.__va-toolbar-toggle').click()

    const target = page.locator('.test-submit').first()
    const box = await target.boundingBox()
    if (!box)
      throw new Error('Target element not found')

    await page.locator('.__va-intercept').click({
      force: true,
      position: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    })

    await expect(page.locator('.__va-input')).toBeVisible()
    await expect(page.locator('.__va-comp-chain')).toContainText('MocButton')
  })

  test('persists annotations in extension session storage and not page sessionStorage', async () => {
    await activateCurrentTab()
    await page.reload(navigationOptions)
    await page.locator('.__va-toolbar-toggle').click()

    const target = page.locator('.test-submit').first()
    const box = await target.boundingBox()
    if (!box)
      throw new Error('Target element not found')

    await page.locator('.__va-intercept').click({
      force: true,
      position: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    })

    await page.locator('.__va-input input').fill('Persist me')
    await page.locator('.__va-btn--primary').click()
    await expect(page.locator('.__va-marker')).toHaveCount(1)

    const pageStorage = await page.evaluate(() => sessionStorage.getItem('agentation-vue-annotations'))
    expect(pageStorage).toBeNull()

    await page.reload(navigationOptions)
    await expect(page.locator('.__va-marker')).toHaveCount(1)
  })

  test('stops auto-mounting after deactivation', async () => {
    await activateCurrentTab()
    await page.reload(navigationOptions)
    expect(await hasShadowToolbar()).toBe(true)

    await deactivateCurrentTab()
    await page.reload(navigationOptions)
    expect(await hasShadowToolbar()).toBe(false)
  })
})
