import { test, expect } from '../fixtures/agentation-fixture'

test.describe('Session Persistence', () => {
  // goto() auto-clears storage by default

  test('annotations persist after navigating to a different page', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.annotateElement('.test-submit', 'Persistent note')
    await expect(ag.markers()).toHaveCount(1)

    // Minimize toolbar first so overlay is removed, then nav link is clickable
    await ag.minimizeBtn.click()
    await ag.page.click('.nav-link[href="/nested"]')
    await ag.page.waitForURL('**/nested')

    // Markers should still be present
    await expect(ag.markers()).toHaveCount(1)
  })

  test('annotations are stored in sessionStorage with correct structure', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.annotateElement('.test-submit', 'Check storage')

    const stored = await ag.getStoredAnnotations()
    expect(stored).toHaveLength(1)
    expect(stored[0]).toHaveProperty('id')
    expect(stored[0]).toHaveProperty('comment', 'Check storage')
    expect(stored[0]).toHaveProperty('element')
    expect(stored[0]).toHaveProperty('elementPath')
    expect(stored[0]).toHaveProperty('timestamp')
    expect(stored[0]).toHaveProperty('x')
    expect(stored[0]).toHaveProperty('y')
  })

  test('annotations survive page reload', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.annotateElement('.test-submit', 'Survive reload')
    await expect(ag.markers()).toHaveCount(1)

    await ag.page.reload()
    await ag.toolbar.waitFor({ state: 'visible' })

    // After reload, markers should be restored
    await expect(ag.markers()).toHaveCount(1)
  })
})
