import {
  setAnnotationStorage,
} from '@agentation-vue-src/composables/useAnnotations'
import {
  setSettingsStorage,
} from '@agentation-vue-src/composables/useSettings'
import {
  setVueDetector,
} from '@agentation-vue-src/utils/dom-inspector'
import { BADGE_UPDATE_MESSAGE, PING_MESSAGE, UNMOUNT_MESSAGE } from '../shared/messages'
import { createAnnotationStorageAdapter } from './adapters/annotation-storage'
import { createSettingsStorageAdapter } from './adapters/settings-storage'
import { createBridgeVueDetector } from './bridge'
import { mountAgentation } from './shadow-mount'

declare global {
  interface Window {
    __agentationContentMounted?: boolean
    __agentationContentDestroy?: (() => void) | null
  }
}

async function sendBadgeCount(count: number) {
  try {
    await chrome.runtime.sendMessage({
      type: BADGE_UPDATE_MESSAGE,
      count,
    })
  }
  catch {}
}

async function bootstrap() {
  if (window.__agentationContentMounted)
    return

  const [annotationStorage, settingsStorage] = await Promise.all([
    createAnnotationStorageAdapter(),
    createSettingsStorageAdapter(),
  ])

  setAnnotationStorage(annotationStorage)
  setSettingsStorage(settingsStorage)
  setVueDetector(createBridgeVueDetector())

  const mountHandle = mountAgentation((count) => {
    void sendBadgeCount(count)
  })

  window.__agentationContentMounted = true
  window.__agentationContentDestroy = () => {
    mountHandle.destroy()
    window.__agentationContentDestroy = null
    window.__agentationContentMounted = false
    void sendBadgeCount(0)
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (!message || typeof message !== 'object')
      return undefined

    if (message.type === UNMOUNT_MESSAGE) {
      window.__agentationContentDestroy?.()
      return undefined
    }

    if (message.type === PING_MESSAGE) {
      void mountHandle.reportCount()
      return true
    }

    return undefined
  })
}

void bootstrap().catch((error) => {
  console.error('[Agentation extension] bootstrap failed', error)
})
