import type { VueDetector } from 'agentation-vue'

const REQUEST_EVENT = 'agentation:detect-vue:request'
const RESPONSE_EVENT = 'agentation:detect-vue:response'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getElementSamplePoint(el: Element) {
  const rect = el.getBoundingClientRect()
  const x = rect.width > 0 ? rect.left + rect.width / 2 : rect.left
  const y = rect.height > 0 ? rect.top + rect.height / 2 : rect.top

  return {
    x: clamp(x, 0, Math.max(window.innerWidth - 1, 0)),
    y: clamp(y, 0, Math.max(window.innerHeight - 1, 0)),
  }
}

export function createBridgeVueDetector(): VueDetector {
  return (el, includeFile = false) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const { x, y } = getElementSamplePoint(el)
    let result: string | undefined

    const onResponse = (event: Event) => {
      const customEvent = event as CustomEvent<{ requestId: string, chain?: string }>
      if (customEvent.detail.requestId !== requestId)
        return
      result = customEvent.detail.chain
    }

    document.addEventListener(RESPONSE_EVENT, onResponse as EventListener)
    document.dispatchEvent(new CustomEvent(REQUEST_EVENT, {
      detail: {
        requestId,
        x,
        y,
        includeFile,
      },
    }))
    document.removeEventListener(RESPONSE_EVENT, onResponse as EventListener)

    return result
  }
}
