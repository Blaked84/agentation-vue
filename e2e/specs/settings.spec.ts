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

  test('output detail can be toggled', async ({ ag }) => {
    await ag.settingsBtn.click()
    await expect(ag.settingsPanel).toBeVisible()

    // Find the output detail toggles
    const toggles = ag.settingsPanel.locator('.__va-toggle')
    const firstToggle = toggles.first()
    await expect(firstToggle).toBeVisible()

    // Click it to change the value
    await firstToggle.click()

    // Verify settings stored in localStorage
    const stored = await ag.page.evaluate(() => {
      const s = localStorage.getItem('agentation-vue-settings')
      return s ? JSON.parse(s) : null
    })
    expect(stored).toBeTruthy()
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
})
