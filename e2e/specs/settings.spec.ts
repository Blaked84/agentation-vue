import { expect, test } from '../fixtures/agentation-fixture'

test.describe('Settings', () => {
  test.beforeEach(async ({ ag }) => {
    await ag.gotoAndActivate('/')
  })

  test('settings panel opens and closes', async ({ ag }) => {
    await ag.settingsBtn.click()
    await expect(ag.settingsPanel).toBeVisible()

    await ag.settingsBtn.click()
    await expect(ag.settingsPanel).not.toBeVisible()
  })

  test('opening settings locks page selection interactions', async ({ ag }) => {
    await ag.settingsBtn.click()
    await expect(ag.settingsPanel).toBeVisible()

    const target = ag.page.locator('.test-submit').first()
    const box = await target.boundingBox()
    if (!box)
      throw new Error('Target element not found')

    await ag.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await expect(ag.settingsPanel).not.toBeVisible()
    await expect(ag.annotationInput).not.toBeVisible()
    await expect(ag.markers()).toHaveCount(0)

    await ag.page.waitForTimeout(260)
    await ag.clickElement('.test-submit')
    await expect(ag.annotationInput).toBeVisible()
    await ag.cancelBtn.click()
  })

  test('output detail can be toggled', async ({ ag }) => {
    await ag.settingsBtn.click()
    await expect(ag.settingsPanel).toBeVisible()

    // Find the output detail <select>
    const outputDetailSelect = ag.settingsPanel.locator('select').first()
    await expect(outputDetailSelect).toBeVisible()

    // Read initial value and switch to the other option
    const initialValue = await outputDetailSelect.inputValue()
    const nextValue = initialValue === 'standard' ? 'forensic' : 'standard'
    await outputDetailSelect.selectOption(nextValue)
    const newValue = await outputDetailSelect.inputValue()
    expect(newValue).toBe(nextValue)

    // Verify settings stored in localStorage
    const stored = await ag.page.evaluate(() => {
      const s = localStorage.getItem('agentation-vue-settings')
      return s ? JSON.parse(s) : null
    })
    expect(stored).toBeTruthy()
    expect(stored.outputDetail).toBe(newValue)
  })

  test('marker color changes when swatch is clicked', async ({ ag }) => {
    await ag.settingsBtn.click()

    const swatches = ag.settingsPanel.locator('.__va-color-swatch')
    const count = await swatches.count()
    expect(count).toBeGreaterThan(1)

    // Click a non-active swatch
    const inactive = swatches.filter({ hasNot: ag.page.locator('.__va-color-swatch--active') }).first()
    await inactive.click()

    // The clicked swatch should now be active
    await expect(inactive).toHaveClass(/__va-color-swatch--active/)
  })

  test('settings persist via localStorage across reload', async ({ ag }) => {
    await ag.settingsBtn.click()

    // Change a setting — click the first toggle
    const toggle = ag.settingsPanel.locator('.__va-toggle').first()
    await toggle.click()

    // Reload the page
    await ag.page.reload()
    await ag.toolbar.waitFor({ state: 'visible' })
    await ag.activate()
    await ag.settingsBtn.click()

    // Settings should be restored from localStorage
    const stored = await ag.page.evaluate(() => localStorage.getItem('agentation-vue-settings'))
    expect(stored).toBeTruthy()
  })

  test('auto-hide floating button setting persists', async ({ ag }) => {
    await ag.settingsBtn.click()
    const autoHideToggle = ag.settingsPanel.locator('button[aria-label="Auto-hide floating button"]')
    await autoHideToggle.click()

    const storedBeforeReload = await ag.page.evaluate(() => {
      const s = localStorage.getItem('agentation-vue-settings')
      return s ? JSON.parse(s) : null
    })
    expect(storedBeforeReload?.autoHideToolbar).toBe(true)

    await ag.page.reload()
    await ag.toolbar.waitFor({ state: 'visible' })

    const viewport = ag.page.viewportSize()
    if (!viewport)
      throw new Error('Viewport size unavailable')

    // After reload with auto-hide enabled, toolbar is hidden at bottom-right.
    // Move to the corner to reveal it before interacting.
    await ag.page.mouse.move(viewport.width - 4, viewport.height - 4)
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--auto-hide-revealed/)

    await ag.activate()
    await ag.settingsBtn.click()

    await expect(ag.settingsPanel.locator('button[aria-label="Auto-hide floating button"]')).toHaveAttribute('aria-checked', 'true')
  })

  test('toolbar placement persists across reload', async ({ ag }) => {
    const handleBox = await ag.dragHandle.boundingBox()
    if (!handleBox)
      throw new Error('Drag handle not found')

    await ag.page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await ag.page.mouse.down()
    await ag.page.mouse.move(30, 30)
    await ag.page.mouse.up()

    await expect(ag.toolbar).toHaveClass(/__va-toolbar--place-top-left/)

    const storedBeforeReload = await ag.page.evaluate(() => {
      const s = localStorage.getItem('agentation-vue-settings')
      return s ? JSON.parse(s) : null
    })
    expect(storedBeforeReload?.toolbarPlacement).toBe('top-left')

    await ag.page.reload()
    await ag.toolbar.waitFor({ state: 'visible' })
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--place-top-left/)
  })

  test('settings panel is anchored and stays in viewport after toolbar move', async ({ ag }) => {
    const handleBox = await ag.dragHandle.boundingBox()
    if (!handleBox)
      throw new Error('Drag handle not found')

    await ag.page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await ag.page.mouse.down()
    await ag.page.mouse.move(30, 30)
    await ag.page.mouse.up()

    await ag.settingsBtn.click()
    await expect(ag.settingsPanel).toBeVisible()

    const panelBox = await ag.settingsPanel.boundingBox()
    const buttonBox = await ag.settingsBtn.boundingBox()
    const viewport = ag.page.viewportSize()
    if (!panelBox || !buttonBox || !viewport)
      throw new Error('Missing geometry for settings positioning assertions')

    expect(panelBox.x).toBeGreaterThanOrEqual(8)
    expect(panelBox.y).toBeGreaterThanOrEqual(8)
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width - 8)
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height - 8)

    const horizontalGap = Math.max(
      0,
      Math.max(buttonBox.x - (panelBox.x + panelBox.width), panelBox.x - (buttonBox.x + buttonBox.width)),
    )
    const verticalGap = Math.max(
      0,
      Math.max(buttonBox.y - (panelBox.y + panelBox.height), panelBox.y - (buttonBox.y + buttonBox.height)),
    )

    expect(Math.min(horizontalGap, verticalGap)).toBeLessThanOrEqual(20)
  })
})
