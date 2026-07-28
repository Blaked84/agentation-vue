import { expect, test } from '../fixtures/agentation-fixture'

// "domain-port" (the default) sharing annotations across pages on the same origin
// is covered by session-persistence.spec.ts ("annotations are shared across
// pages on the same origin (default "domain-port" scope)") -- not duplicated here.
//
// NOTE: The distinction between "domain" (ignores port) and "domain-port" (port-aware)
// can only be observed by loading the same hostname on two different ports, which this
// single-port Playwright dev server cannot do. That port-isolation behavior is covered
// by unit tests in useAnnotations.spec.ts instead.
test.describe('Annotation Scope', () => {
  test('path scope: annotation persists across a query-string change on the same path, but not on a different path', async ({ ag }) => {
    await ag.goto('/?a=1&scope=path')
    await ag.activate()
    await ag.annotateElement('.test-submit', 'Path scoped note')
    await expect(ag.markers()).toHaveCount(1)

    // Same pathname ("/"), different query string -> annotation persists.
    await ag.goto('/?a=2&scope=path', { clean: false })
    await expect(ag.markers()).toHaveCount(1)

    // Different pathname on the same origin -> annotation does not appear.
    await ag.goto('/nested?scope=path', { clean: false })
    await expect(ag.markers()).toHaveCount(0)
  })

  test('domain scope: annotation persists across a different path on the same hostname', async ({ ag }) => {
    await ag.goto('/?scope=domain')
    await ag.activate()
    await ag.annotateElement('.page-title', 'Domain scoped note')
    await expect(ag.markers()).toHaveCount(1)

    // Different pathname, same hostname, shared selector -> annotation still shares under 'domain'.
    await ag.goto('/nested?scope=domain', { clean: false })
    await expect(ag.markers()).toHaveCount(1)
  })

  test('markers from another page are dimmed with the "foreign" class', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    await ag.annotateElement('.page-title', 'Created on home page')
    await expect(ag.markers()).toHaveCount(1)

    // Created on the current page -> not foreign.
    await expect(ag.foreignMarkers()).toHaveCount(0)

    // Minimize toolbar first so overlay is removed, then nav link is clickable
    await ag.minimizeBtn.click()
    await ag.page.click('.nav-link[href="/nested"]')
    await ag.page.waitForURL('**/nested')

    // Same origin -> default "domain-port" scope shares the annotation across pages,
    // but it was created on a different URL -> it renders dimmed as foreign.
    await expect(ag.markers()).toHaveCount(1)
    await expect(ag.foreignMarkers()).toHaveCount(1)

    await ag.page.click('.nav-link[href="/"]')
    await ag.page.waitForURL('**/')

    // Back on the page where it was created -> no longer foreign.
    await expect(ag.markers()).toHaveCount(1)
    await expect(ag.foreignMarkers()).toHaveCount(0)
  })
})
