import { expect, test } from '../fixtures/agentation-fixture'

test.describe('Modal annotation', () => {
  test('can type a comment when annotating inside a native modal dialog', async ({ ag }) => {
    await ag.goto('/modals')
    await ag.page.getByRole('button', { name: 'Open native dialog' }).click()
    await ag.activate()

    await ag.clickElement('.demo-dialog input')
    await ag.inputField.pressSequentially('Native dialog note')
    await expect(ag.inputField).toHaveText('Native dialog note')

    await ag.addBtn.click()
    await ag.annotationInput.waitFor({ state: 'hidden', timeout: 3000 })
    await expect(ag.markers()).toHaveCount(1)
  })

  test('UI returns to body when the native modal dialog closes', async ({ ag }) => {
    await ag.goto('/modals')
    await ag.page.getByRole('button', { name: 'Open native dialog' }).click()

    const hostedInDialog = await ag.page.evaluate(() =>
      document.querySelector('.__va-root')?.parentElement?.tagName === 'DIALOG',
    )
    expect(hostedInDialog).toBe(true)

    await ag.page.locator('.demo-dialog button', { hasText: 'Close' }).click()

    // `close()` queues the close event rather than firing it synchronously, so
    // poll instead of sampling once. Vue 3 restores to body, Vue 2 to #__va-portal.
    await expect.poll(() => ag.page.evaluate(() => {
      const parent = document.querySelector('.__va-root')?.parentElement
      return !!parent && parent.tagName !== 'DIALOG'
        && (parent === document.body || parent.id === '__va-portal')
    })).toBe(true)
  })

  test('can type a comment when annotating inside a focus-trap modal', async ({ ag }) => {
    await ag.goto('/modals')
    await ag.page.getByRole('button', { name: 'Open focus-trap modal' }).click()
    await ag.activate()

    await ag.clickElement('.demo-modal input')
    await ag.inputField.pressSequentially('Trapped modal note')
    await expect(ag.inputField).toHaveText('Trapped modal note')

    await ag.addBtn.click()
    await ag.annotationInput.waitFor({ state: 'hidden', timeout: 3000 })
    await expect(ag.markers()).toHaveCount(1)
  })

  test('can type a comment when the page is pointer-events locked', async ({ ag }) => {
    await ag.goto('/modals')
    await ag.page.getByRole('button', { name: 'Open pointer-lock modal' }).click()
    await ag.activate()

    await ag.clickElement('.demo-modal input')
    await ag.inputField.pressSequentially('Pointer locked note')
    await expect(ag.inputField).toHaveText('Pointer locked note')

    await ag.addBtn.click()
    await ag.annotationInput.waitFor({ state: 'hidden', timeout: 3000 })
    await expect(ag.markers()).toHaveCount(1)
  })
})
