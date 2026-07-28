import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AgentationVue from '../../src/AgentationVue.vue'

// jsdom does not implement showModal/close; stub them so the library's
// showModal patch has something to wrap
function stubDialogMethods() {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

async function flush() {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

describe('modal dialog hosting', () => {
  beforeAll(() => {
    stubDialogMethods()
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
      unobserve() {}
    })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('re-hosts the UI inside an open modal dialog and restores it on close', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const wrapper = mount(AgentationVue, {
      attachTo: host,
      props: { copyToClipboard: false },
    })
    await nextTick()

    const root = document.querySelector('.__va-root') as HTMLElement
    expect(root.parentElement).toBe(document.body)

    const dialog = document.createElement('dialog')
    document.body.appendChild(dialog)
    dialog.showModal()
    await flush()

    expect(root.parentElement).toBe(dialog)
    expect(root.classList.contains('__va-root--in-dialog')).toBe(true)

    dialog.close()
    await flush()

    expect(root.parentElement).toBe(document.body)
    expect(root.classList.contains('__va-root--in-dialog')).toBe(false)
    expect(root.style.top).toBe('')

    dialog.remove()
    wrapper.unmount()
    host.remove()
  })

  it('follows stacked modal dialogs and recovers when one is removed without close', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const wrapper = mount(AgentationVue, {
      attachTo: host,
      props: { copyToClipboard: false },
    })
    await nextTick()

    const root = document.querySelector('.__va-root') as HTMLElement

    const first = document.createElement('dialog')
    const second = document.createElement('dialog')
    document.body.appendChild(first)
    document.body.appendChild(second)

    first.showModal()
    second.showModal()
    await flush()
    expect(root.parentElement).toBe(second)

    // Removing the hosting dialog without firing close (v-if teardown)
    second.remove()
    await flush()
    expect(root.parentElement).toBe(first)

    first.close()
    await flush()
    expect(root.parentElement).toBe(document.body)

    first.remove()
    wrapper.unmount()
    host.remove()
  })
})
