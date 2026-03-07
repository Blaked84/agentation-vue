import type { App } from 'vue'
import AgentationVue from '@agentation-vue-src/AgentationVue.vue'
import agentationStyles from '@agentation-vue-src/styles/agentation.css?inline'
import { createApp, nextTick } from 'vue'

const HOST_ID = '__agentation-ext-host'
const HOST_ATTR = 'data-agentation-vue'

interface MountHandle {
  destroy: () => void
  reportCount: () => Promise<void>
}

function createStyleElement(shadowRoot: ShadowRoot) {
  const style = document.createElement('style')
  style.textContent = agentationStyles
  shadowRoot.appendChild(style)
}

export function mountAgentation(onCountChange: (count: number) => void): MountHandle {
  const existingHost = document.getElementById(HOST_ID)
  existingHost?.remove()

  const host = document.createElement('div')
  host.id = HOST_ID
  host.setAttribute(HOST_ATTR, '')

  ;(document.body || document.documentElement).appendChild(host)

  const shadowRoot = host.attachShadow({ mode: 'open' })
  createStyleElement(shadowRoot)

  const mountNode = document.createElement('div')
  mountNode.setAttribute(HOST_ATTR, '')
  shadowRoot.appendChild(mountNode)

  const reportCount = async () => {
    await nextTick()
    onCountChange(shadowRoot.querySelectorAll('.__va-marker').length)
  }

  const app: App = createApp(AgentationVue, {
    disablePortal: true,
    onAnnotationAdd: reportCount,
    onAnnotationDelete: reportCount,
    onAnnotationUpdate: reportCount,
    onAnnotationsClear: () => onCountChange(0),
  })

  app.mount(mountNode)
  void reportCount()

  return {
    destroy() {
      app.unmount()
      host.remove()
    },
    reportCount,
  }
}
