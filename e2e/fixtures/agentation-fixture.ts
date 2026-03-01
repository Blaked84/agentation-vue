import type { Locator, Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'

class AgentationPage {
  readonly page: Page

  // Toolbar
  readonly toolbar: Locator
  readonly toggleButton: Locator
  readonly elementSelectorBtn: Locator
  readonly areaSelectorBtn: Locator
  readonly pauseBtn: Locator
  readonly copyBtn: Locator
  readonly clearBtn: Locator
  readonly settingsBtn: Locator
  readonly minimizeBtn: Locator
  readonly badge: Locator

  // Overlay & interaction
  readonly overlay: Locator
  readonly highlight: Locator
  readonly highlightLabel: Locator

  // Annotation input
  readonly annotationInput: Locator
  readonly inputField: Locator
  readonly addBtn: Locator
  readonly cancelBtn: Locator

  // Settings
  readonly settingsPanel: Locator

  // Copy feedback
  readonly copyFeedback: Locator

  constructor(page: Page) {
    this.page = page

    this.toolbar = page.locator('.__va-toolbar')
    this.toggleButton = page.locator('.__va-toolbar-toggle')
    this.elementSelectorBtn = page.locator('button[title="Element selector"]')
    this.areaSelectorBtn = page.locator('button[title="Area selection"]')
    this.pauseBtn = page.locator('button[title="Pause animations"]')
    this.copyBtn = page.locator('button[title="Copy annotations"]')
    this.clearBtn = page.locator('button[title="Clear annotations"]')
    this.settingsBtn = page.locator('button[title="Settings"]')
    this.minimizeBtn = page.locator('button[title="Minimize"]')
    this.badge = page.locator('.__va-toolbar-badge')

    this.overlay = page.locator('.__va-intercept')
    this.highlight = page.locator('.__va-highlight')
    this.highlightLabel = page.locator('.__va-highlight-label')

    this.annotationInput = page.locator('.__va-input')
    this.inputField = page.locator('.__va-input input')
    this.addBtn = page.locator('.__va-btn--primary')
    this.cancelBtn = page.locator('.__va-btn--secondary')

    this.settingsPanel = page.locator('.__va-settings')
    this.copyFeedback = page.locator('.__va-copy-feedback')
  }

  async goto(path = '/', { clean = true } = {}) {
    await this.page.goto(path)
    if (clean) {
      await this.page.evaluate(() => {
        sessionStorage.removeItem('agentation-vue-annotations')
        localStorage.removeItem('agentation-vue-settings')
      })
      await this.page.reload()
    }
    await this.toolbar.waitFor({ state: 'visible' })
  }

  async activate() {
    await this.toggleButton.click()
    await this.elementSelectorBtn.waitFor({ state: 'visible' })
  }

  async gotoAndActivate(path = '/') {
    await this.goto(path)
    await this.activate()
  }

  /** Click an element through the intercept overlay */
  async clickElement(selector: string) {
    const el = this.page.locator(selector).first()
    const box = await el.boundingBox()
    if (!box)
      throw new Error(`Element not found: ${selector}`)
    await this.overlay.click({
      position: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      force: true,
    })
    await this.annotationInput.waitFor({ state: 'visible' })
  }

  async addComment(text: string) {
    await this.inputField.fill(text)
    await this.addBtn.click()
    await this.annotationInput.waitFor({ state: 'hidden', timeout: 3000 })
  }

  /** Full flow: click + comment + save */
  async annotateElement(selector: string, comment: string) {
    await this.clickElement(selector)
    await this.addComment(comment)
  }

  markers() {
    return this.page.locator('.__va-marker')
  }

  async getMarkerCount(): Promise<number> {
    return this.markers().count()
  }

  async clearStorage() {
    await this.page.evaluate(() => {
      sessionStorage.removeItem('agentation-vue-annotations')
      localStorage.removeItem('agentation-vue-settings')
    })
  }

  async getStoredAnnotations(): Promise<any[]> {
    return this.page.evaluate(() => {
      const stored = sessionStorage.getItem('agentation-vue-annotations')
      return stored ? JSON.parse(stored) : []
    })
  }
}

export const test = base.extend<{ ag: AgentationPage }>({
  ag: async ({ page }, use) => {
    await use(new AgentationPage(page))
  },
})

export { expect }
