import { expect, test } from '../fixtures/agentation-fixture'

test.describe('Session Persistence', () => {
  // goto() auto-clears storage by default

  test('annotations are shared across pages on the same origin (default "domain-port" scope)', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.annotateElement('.page-title', 'Persistent note')
    await expect(ag.markers()).toHaveCount(1)

    // Minimize toolbar first so overlay is removed, then nav link is clickable
    await ag.minimizeBtn.click()
    await ag.page.click('.nav-link[href="/nested"]')
    await ag.page.waitForURL('**/nested')

    // Same origin -> default "domain-port" scope shares the annotation across pages
    await expect(ag.markers()).toHaveCount(1)

    await ag.page.click('.nav-link[href="/"]')
    await ag.page.waitForURL('**/')

    // Still visible back on the original page
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
