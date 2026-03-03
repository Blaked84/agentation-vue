import { expect, test } from '../fixtures/agentation-fixture'

test.describe('Annotation Flow', () => {
  test.beforeEach(async ({ ag }) => {
    await ag.gotoAndActivate('/')
  })

  test('clicking an element and adding comment creates a marker', async ({ ag }) => {
    await ag.annotateElement('.test-submit', 'Fix button color')
    const markers = ag.markers()
    await expect(markers).toHaveCount(1)
    await expect(markers.first()).toHaveText('1')
  })

  test('pressing Enter in input saves annotation', async ({ ag }) => {
    await ag.clickElement('.test-submit')
    await ag.inputField.fill('Enter saves')
    await ag.page.keyboard.press('Enter')
    await ag.annotationInput.waitFor({ state: 'hidden', timeout: 3000 })
    await expect(ag.markers()).toHaveCount(1)
  })

  test('pressing Escape in input cancels without creating marker', async ({ ag }) => {
    await ag.clickElement('.test-submit')
    await ag.inputField.fill('Will cancel')
    await ag.page.keyboard.press('Escape')
    await expect(ag.annotationInput).not.toBeVisible()
    await expect(ag.markers()).toHaveCount(0)
  })

  test('Cancel button dismisses input without creating marker', async ({ ag }) => {
    await ag.clickElement('.test-submit')
    await ag.inputField.fill('Will cancel')
    await ag.cancelBtn.click()
    await expect(ag.annotationInput).not.toBeVisible()
    await expect(ag.markers()).toHaveCount(0)
  })

  test('multiple annotations get sequential numbers', async ({ ag }) => {
    await ag.annotateElement('.test-submit', 'First')
    await ag.annotateElement('.test-cancel', 'Second')
    await ag.annotateElement('.test-delete', 'Third')

    const markers = ag.markers()
    await expect(markers).toHaveCount(3)
    await expect(markers.nth(0)).toHaveText('1')
    await expect(markers.nth(1)).toHaveText('2')
    await expect(markers.nth(2)).toHaveText('3')
  })

  test('clicking a marker opens edit, delete removes it', async ({ ag }) => {
    await ag.annotateElement('.test-submit', 'Will delete')
    await expect(ag.markers()).toHaveCount(1)

    await ag.markers().first().click()
    await ag.annotationInput.waitFor({ state: 'visible' })
    await ag.page.locator('.__va-input-delete-btn').click()
    await ag.annotationInput.waitFor({ state: 'hidden', timeout: 3000 })
    await expect(ag.markers()).toHaveCount(0)
  })

  test('Add button is disabled when comment is empty', async ({ ag }) => {
    await ag.clickElement('.test-submit')
    await expect(ag.addBtn).toBeDisabled()
    await ag.inputField.fill('Now has text')
    await expect(ag.addBtn).not.toBeDisabled()
  })

  test('annotation input shows element info', async ({ ag }) => {
    await ag.clickElement('.test-submit')
    // Should show either a component chain or an element label
    const inputLabel = ag.page.locator('.__va-input-label, .__va-input-chain, .__va-comp-chain')
    await expect(inputLabel.first()).toBeVisible()
  })

  test('annotation input shows computed styles in collapsible section', async ({ ag }) => {
    await ag.clickElement('.avatar')

    const stylesSummary = ag.page.locator('.__va-input-styles-summary')
    await expect(stylesSummary).toBeVisible()
    await stylesSummary.click()

    const styleLines = ag.page.locator('.__va-input-style-line')
    const lineCount = await styleLines.count()
    expect(lineCount).toBeGreaterThan(0)
  })
})
