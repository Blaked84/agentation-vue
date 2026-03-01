import { test, expect } from '../fixtures/agentation-fixture'

test.describe('Toolbar', () => {
  test('is visible in collapsed state on page load', async ({ ag }) => {
    await ag.goto('/')
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--collapsed/)
    await expect(ag.toggleButton).toBeVisible()
  })

  test('expands on toggle click and shows all buttons', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await expect(ag.elementSelectorBtn).toBeVisible()
    await expect(ag.areaSelectorBtn).toBeVisible()
    await expect(ag.pauseBtn).toBeVisible()
    await expect(ag.copyBtn).toBeVisible()
    await expect(ag.clearBtn).toBeVisible()
    await expect(ag.settingsBtn).toBeVisible()
    await expect(ag.minimizeBtn).toBeVisible()
  })

  test('minimize collapses toolbar back', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.minimizeBtn.click()
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--collapsed/)
    await expect(ag.toggleButton).toBeVisible()
  })

  test('copy and clear buttons are disabled with no annotations', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await expect(ag.copyBtn).toBeDisabled()
    await expect(ag.clearBtn).toBeDisabled()
  })

  test('badge shows annotation count after minimizing', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.annotateElement('.test-submit', 'First note')
    await ag.annotateElement('.test-cancel', 'Second note')
    await ag.minimizeBtn.click()
    await expect(ag.badge).toHaveText('2')
  })

  test('escape key deactivates toolbar', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.page.keyboard.press('Escape')
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--collapsed/)
  })
})
