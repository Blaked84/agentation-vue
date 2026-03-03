import { expect, test } from '../fixtures/agentation-fixture'

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

  test('collapsed toolbar auto-hide reveals near the edge and remains clickable', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.settingsBtn.click()
    await ag.page.locator('button[aria-label="Auto-hide floating button"]').click()
    await ag.minimizeBtn.click()

    const viewport = ag.page.viewportSize()
    if (!viewport)
      throw new Error('Viewport size unavailable')

    await expect(ag.toolbar).toHaveClass(/__va-toolbar--auto-hide/)

    await ag.page.mouse.move(viewport.width / 2, viewport.height / 2)
    await expect(ag.toolbar).not.toHaveClass(/__va-toolbar--auto-hide-revealed/)

    await ag.page.mouse.move(viewport.width - 4, viewport.height - 4)
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--auto-hide-revealed/)

    await ag.toggleButton.click()
    await expect(ag.elementSelectorBtn).toBeVisible()
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

  test('long press drag snaps collapsed toolbar to bottom-left', async ({ ag }) => {
    await ag.goto('/')
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--place-bottom-right/)

    const box = await ag.toggleButton.boundingBox()
    if (!box)
      throw new Error('Toggle button not found')

    const viewport = ag.page.viewportSize()
    if (!viewport)
      throw new Error('Viewport size unavailable')

    await ag.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await ag.page.mouse.down()
    await ag.page.waitForTimeout(450)
    await ag.page.mouse.move(30, viewport.height - 30)
    await ag.page.mouse.up()

    await expect(ag.toolbar).toHaveClass(/__va-toolbar--collapsed/)
    await expect(ag.toolbar).toHaveClass(/__va-toolbar--place-bottom-left/)
    await expect(ag.elementSelectorBtn).toBeHidden()
  })

  test('shows drag affordances (tooltip + snap zones) for collapsed toolbar', async ({ ag }) => {
    await ag.goto('/')
    await expect(ag.toggleButton).toHaveAttribute('aria-label', 'Appui long pour déplacer')

    const box = await ag.toggleButton.boundingBox()
    if (!box)
      throw new Error('Toggle button not found')

    await ag.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await ag.page.mouse.down()
    await ag.page.waitForTimeout(450)

    const snapZones = ag.page.locator('.__va-snap-zone')
    await expect(snapZones).toHaveCount(6)
    await expect(ag.page.locator('.__va-snap-zone--active')).toHaveCount(1)

    await ag.page.mouse.up()
    await expect(snapZones).toHaveCount(0)
  })

  test('expanded toolbar can be dragged with grab handle', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await expect(ag.dragHandle).toBeVisible()
    await expect(ag.dragHandle).toHaveAttribute('aria-label', 'Glisser pour déplacer')

    await ag.dragHandle.hover()
    await ag.page.mouse.down()
    await expect(ag.page.locator('.__va-snap-zone--rect')).toHaveCount(6)
    await ag.page.mouse.move(30, 30)
    await ag.page.mouse.up()

    await expect(ag.toolbar).toHaveClass(/__va-toolbar--place-top-left/)
    await expect(ag.elementSelectorBtn).toBeVisible()
  })

  test('dragging expanded toolbar does not create annotation input or marker', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await expect(ag.markers()).toHaveCount(0)

    const targetBox = await ag.page.locator('.test-submit').first().boundingBox()
    if (!targetBox)
      throw new Error('Drag target not found')

    await ag.dragHandle.hover()
    await ag.page.mouse.down()
    // Confirm drag activated before moving to target
    await expect(ag.page.locator('.__va-snap-zone--rect')).toHaveCount(6)
    await ag.page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2)
    await ag.page.mouse.up()

    await expect(ag.annotationInput).toBeHidden()
    await expect(ag.markers()).toHaveCount(0)
  })
})
