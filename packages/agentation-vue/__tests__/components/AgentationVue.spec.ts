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
})
