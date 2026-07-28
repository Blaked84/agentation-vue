import type { Locator } from '@playwright/test'
import { expect, test } from '../fixtures/agentation-fixture'

async function expectSameCenter(marker: Locator, target: Locator) {
  await expect.poll(async () => {
    const markerBox = await marker.boundingBox()
    const targetBox = await target.boundingBox()
    if (!markerBox || !targetBox)
      return Number.POSITIVE_INFINITY

    const markerCenterY = markerBox.y + markerBox.height / 2
    const targetCenterY = targetBox.y + targetBox.height / 2
    return Math.abs(markerCenterY - targetCenterY)
  }).toBeLessThan(2)
}

test.describe('Marker positioning', () => {
  test('current-page marker stays anchored during window scroll', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    const target = ag.page.locator('.quote-text')
    await target.scrollIntoViewIfNeeded()
    await ag.annotateElement('.quote-text', 'Window scroll target')

    const marker = ag.markers().filter({ hasText: '1' })
    await expectSameCenter(marker, target)

    await ag.page.evaluate(() => window.scrollBy(0, 300))
    await expectSameCenter(marker, target)
  })

  test('reload-restored marker stays anchored during window scroll', async ({ ag }) => {
    await ag.gotoAndActivate('/')
    const target = ag.page.locator('.test-submit')
    await ag.annotateElement('.test-submit', 'Reloaded target')

    await ag.page.reload()
    await ag.toolbar.waitFor({ state: 'visible' })
    await ag.activate()

    const marker = ag.markers().filter({ hasText: '1' })
    await expectSameCenter(marker, target)

    await ag.page.evaluate(() => window.scrollBy(0, 300))
    await expectSameCenter(marker, target)
  })

  test('foreign markers render only when their selectors resolve, while count and copy keep all annotations', async ({ ag, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await ag.gotoAndActivate('/')
    await ag.annotateElement('.page-title', 'Shared title')
    await ag.annotateElement('.test-submit', 'Home-only button')

    await ag.goto('/nested', { clean: false })
    await expect(ag.badge).toHaveText('2')
    await expect(ag.markers()).toHaveCount(1)
    await expect(ag.foreignMarkers()).toHaveCount(1)

    await ag.activate()
    const marker = ag.foreignMarkers()
    const target = ag.page.locator('.page-title')
    await ag.page.evaluate(() => {
      const title = document.querySelector<HTMLElement>('.page-title')
      if (title)
        title.style.marginTop = '120px'
      window.dispatchEvent(new Event('resize'))
    })
    await expectSameCenter(marker, target)

    await ag.copyBtn.click()
    const clipboardText = await ag.page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('Shared title')
    expect(clipboardText).toContain('Home-only button')
  })

  test('marker stays anchored while an inner container scrolls', async ({ ag }) => {
    await ag.gotoAndActivate('/nested')
    const scroller = ag.page.locator('.scroll-container')
    const target = ag.page.locator('.test-scroll-target')
    await target.scrollIntoViewIfNeeded()
    await ag.annotateElement('.test-scroll-target', 'Inner scroll target')

    const marker = ag.markers().filter({ hasText: '1' })
    await expectSameCenter(marker, target)

    await scroller.evaluate((element) => {
      element.scrollTop += 80
    })
    await expectSameCenter(marker, target)
  })

  test('marker hides while its target is clipped by an inner scroller and reappears anchored', async ({ ag }) => {
    await ag.gotoAndActivate('/nested')
    const scroller = ag.page.locator('.scroll-container')
    const target = ag.page.locator('.test-scroll-target')
    await target.scrollIntoViewIfNeeded()
    await ag.annotateElement('.test-scroll-target', 'Clipped inner target')

    const marker = ag.markers().filter({ hasText: '1' })
    const visibleScrollTop = await scroller.evaluate(element => element.scrollTop)
    await expectSameCenter(marker, target)

    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    await expect(marker).toHaveClass(/__va-marker--clipped/)
    await expect(marker).toHaveCSS('visibility', 'hidden')
    await expect(marker).toHaveCount(1)

    await scroller.evaluate((element, scrollTop) => {
      element.scrollTop = scrollTop
    }, visibleScrollTop)
    await expect(marker).not.toHaveClass(/__va-marker--clipped/)
    await expect(marker).toHaveCSS('visibility', 'visible')
    await expectSameCenter(marker, target)
  })

  test('continuous wheel input passes through the blocking overlay without breaking inspection', async ({ ag }) => {
    await ag.page.addInitScript(() => {
      localStorage.setItem(
        'agentation-vue-settings',
        JSON.stringify({ blockPageInteractions: true }),
      )
    })
    await ag.gotoAndActivate('/nested')

    const scroller = ag.page.locator('.scroll-container')
    await scroller.scrollIntoViewIfNeeded()
    await scroller.evaluate((element) => {
      element.scrollTop = 0
    })
    await expect(ag.overlay).toHaveCSS('pointer-events', 'auto')

    const scrollerBox = await scroller.boundingBox()
    if (!scrollerBox)
      throw new Error('Scrollable container has no bounding box')
    await ag.page.mouse.move(
      scrollerBox.x + scrollerBox.width / 2,
      scrollerBox.y + scrollerBox.height / 2,
    )

    for (let i = 0; i < 8; i++)
      await ag.page.mouse.wheel(0, 20)

    await expect.poll(() => scroller.evaluate(element => element.scrollTop))
      .toBeGreaterThanOrEqual(120)
    await expect(ag.overlay).toHaveCSS('pointer-events', 'none')

    const target = ag.page.locator('.test-scroll-target')
    const targetBox = await target.boundingBox()
    if (!targetBox)
      throw new Error('Nested scroll target has no bounding box')
    await ag.page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
    )
    await expect(ag.highlight).toBeVisible()

    await ag.page.mouse.click(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
    )
    await expect(ag.annotationInput).toBeVisible()
    await ag.cancelBtn.click()
    await expect(ag.annotationInput).toBeHidden()
    await expect(ag.overlay).toHaveCSS('pointer-events', 'auto')
  })
})
