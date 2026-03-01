import { test, expect } from '../fixtures/agentation-fixture'

test.describe('Element Detection', () => {
  test.beforeEach(async ({ ag }) => {
    await ag.gotoAndActivate('/')
  })

  test('hovering over an element shows highlight box', async ({ ag }) => {
    const btn = ag.page.locator('.test-submit')
    const box = await btn.boundingBox()
    if (!box) throw new Error('Button not found')

    await ag.overlay.hover({
      position: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      force: true,
    })
    await expect(ag.highlight).toBeVisible()
  })

  test('highlight label shows element name', async ({ ag }) => {
    const btn = ag.page.locator('.test-submit')
    const box = await btn.boundingBox()
    if (!box) throw new Error('Button not found')

    await ag.overlay.hover({
      position: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      force: true,
    })
    await expect(ag.highlightLabel.first()).toBeVisible()
    const text = await ag.highlightLabel.first().textContent()
    expect(text).toBeTruthy()
  })

  test('highlight repositions when moving to a different element', async ({ ag }) => {
    const btn = ag.page.locator('.test-submit')
    const img = ag.page.locator('img.avatar')

    const btnBox = await btn.boundingBox()
    const imgBox = await img.boundingBox()
    if (!btnBox || !imgBox) throw new Error('Elements not found')

    // Hover button
    await ag.overlay.hover({
      position: { x: btnBox.x + btnBox.width / 2, y: btnBox.y + btnBox.height / 2 },
      force: true,
    })
    await expect(ag.highlight).toBeVisible()
    const hlBox1 = await ag.highlight.boundingBox()

    // Hover image (different section on the page)
    await ag.overlay.hover({
      position: { x: imgBox.x + imgBox.width / 2, y: imgBox.y + imgBox.height / 2 },
      force: true,
    })
    // Wait for highlight to update position
    await ag.page.waitForTimeout(150)
    await expect(ag.highlight).toBeVisible()
    const hlBox2 = await ag.highlight.boundingBox()

    // Highlight should have moved to cover the new element
    expect(hlBox1!.y).not.toBeCloseTo(hlBox2!.y, 0)
  })

  test('no highlight on toolbar elements', async ({ ag }) => {
    // Move to the toolbar area
    const toolbarBox = await ag.toolbar.boundingBox()
    if (!toolbarBox) throw new Error('Toolbar not found')

    // Move mouse to toolbar — the overlay shouldn't react to toolbar elements
    // since they have data-agentation-vue and the overlay itself ignores them
    await ag.page.mouse.move(toolbarBox.x + 10, toolbarBox.y + 10)

    // The highlight should not be visible (toolbar is outside the overlay)
    // or if overlay is behind toolbar, the highlight won't appear
    // Give a moment for any potential highlight to appear
    await ag.page.waitForTimeout(200)
    const highlightVisible = await ag.highlight.isVisible().catch(() => false)
    // If highlight appeared, it should not be targeting a toolbar element
    if (highlightVisible) {
      const label = await ag.highlightLabel.first().textContent()
      expect(label).not.toContain('__va-')
    }
  })
})
