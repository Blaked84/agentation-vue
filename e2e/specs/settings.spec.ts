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
})
