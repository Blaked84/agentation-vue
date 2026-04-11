import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AgentationVue from '../../src/AgentationVue.vue'

describe('agentationVue', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
      unobserve() {}
    })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('renders in place when disablePortal is true', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    const wrapper = mount(AgentationVue, {
      attachTo: host,
      props: {
        disablePortal: true,
        copyToClipboard: false,
      },
    })

    await nextTick()

    expect(host.querySelector('[data-agentation-vue]')).not.toBeNull()

    wrapper.unmount()
    host.remove()
  })

  it('stops open-toolbar shortcuts from reaching host keyboard listeners', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    const wrapper = mount(AgentationVue, {
      attachTo: host,
      props: {
        disablePortal: true,
        copyToClipboard: false,
      },
    })

    await nextTick()
    await wrapper.get('.__va-toolbar-toggle').trigger('click')
    await nextTick()

    const keydownSpy = vi.fn()
    const keyupSpy = vi.fn()
    window.addEventListener('keydown', keydownSpy, true)
    window.addEventListener('keyup', keyupSpy, true)

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', bubbles: true, cancelable: true }))
    document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'v', bubbles: true, cancelable: true }))

    expect(keydownSpy).not.toHaveBeenCalled()
    expect(keyupSpy).not.toHaveBeenCalled()

    window.removeEventListener('keydown', keydownSpy, true)
    window.removeEventListener('keyup', keyupSpy, true)
    wrapper.unmount()
    host.remove()
  })
})
