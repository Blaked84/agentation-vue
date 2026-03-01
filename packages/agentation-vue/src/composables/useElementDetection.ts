import type { Ref } from 'vue-demi'
import type { BoundingBox } from '../types'
import { ref } from 'vue-demi'
import { detectVueComponents } from '../utils/dom-inspector'
import { getElementName } from '../utils/selectors'

export function useElementDetection(
  overlayRef: Ref<HTMLElement | null>,
  showComponentTree?: () => boolean,
) {
  const hoveredElement = ref<Element | null>(null)
  const hoveredRect = ref<BoundingBox | null>(null)
  const hoveredName = ref('')
  const hoveredComponentChain = ref<string | undefined>()

  let lastElement: Element | null = null
  let rafId: number | null = null

  function getElementUnderOverlay(e: MouseEvent): Element | null {
    const overlay = overlayRef.value
    if (!overlay)
      return document.elementFromPoint(e.clientX, e.clientY)

    const previousPointerEvents = overlay.style.pointerEvents
    overlay.style.pointerEvents = 'none'
    const el = document.elementFromPoint(e.clientX, e.clientY)
    overlay.style.pointerEvents = previousPointerEvents
    return el
  }

  function clearHighlight() {
    hoveredElement.value = null
    hoveredRect.value = null
    hoveredName.value = ''
    hoveredComponentChain.value = undefined
    lastElement = null
  }

  function updateHighlight(el: Element) {
    const rect = el.getBoundingClientRect()
    hoveredElement.value = el
    hoveredRect.value = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }
    hoveredName.value = getElementName(el)
    if (showComponentTree?.()) {
      hoveredComponentChain.value = detectVueComponents(el)
    }
    else {
      hoveredComponentChain.value = undefined
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (rafId !== null)
      return

    rafId = requestAnimationFrame(() => {
      rafId = null
      const el = getElementUnderOverlay(e)

      if (el === lastElement)
        return

      if (el?.closest('[data-agentation-vue]')) {
        clearHighlight()
        return
      }

      lastElement = el
      if (el) {
        updateHighlight(el)
      }
      else {
        clearHighlight()
      }
    })
  }

  function cleanup() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    clearHighlight()
  }

  return {
    hoveredElement,
    hoveredRect,
    hoveredName,
    hoveredComponentChain,
    onMouseMove,
    clearHighlight,
    getElementUnderOverlay,
    cleanup,
  }
}
