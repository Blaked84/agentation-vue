import { expect, test } from '../fixtures/agentation-fixture'

test.describe('Copy & Clear', () => {
  test.beforeEach(async ({ ag }) => {
    await ag.gotoAndActivate('/')
  })

  test('copy button copies markdown to clipboard', async ({ ag, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await ag.annotateElement('.test-submit', 'Fix this button')

    await ag.copyBtn.click()

    const clipboardText = await ag.page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('## Feedback')
    expect(clipboardText).toContain('Fix this button')
  })

  test('copy shows "Copied!" feedback', async ({ ag, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await ag.annotateElement('.test-submit', 'Note')

    await ag.copyBtn.click()
    await expect(ag.copyFeedback).toBeVisible()
    await expect(ag.copyFeedback).toHaveText('Copied!')
  })

  test('clear removes all annotations after confirming dialog', async ({ ag }) => {
    await ag.annotateElement('.test-submit', 'Note 1')
    await ag.annotateElement('.test-cancel', 'Note 2')
    await expect(ag.markers()).toHaveCount(2)

    ag.page.on('dialog', dialog => dialog.accept())
    await ag.clearBtn.click()

    await expect(ag.markers()).toHaveCount(0)
    await expect(ag.copyBtn).toBeDisabled()
  })

  test('clear does nothing when dialog is dismissed', async ({ ag }) => {
    await ag.annotateElement('.test-submit', 'Keep me')
    await expect(ag.markers()).toHaveCount(1)

    ag.page.on('dialog', dialog => dialog.dismiss())
    await ag.clearBtn.click()

    // Wait a moment then verify markers still there
    await ag.page.waitForTimeout(300)
    await expect(ag.markers()).toHaveCount(1)
  })
})
