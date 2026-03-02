import type { Ref } from 'vue-demi'
import type { BoundingBox, InteractionMode } from '../types'
import { ref } from 'vue-demi'
import { VA_DATA_ATTR_SELECTOR } from '../constants'

const LEAF_TAGS = new Set(['button', 'a', 'input', 'img'])

interface CachedElement {
  el: Element
  rect: DOMRect
  isLeaf: boolean
}

export function useMultiSelect(
  mode: Ref<InteractionMode>,
  transitionFn: (to: InteractionMode) => boolean,
) {
  const selectionRect = ref<BoundingBox | null>(null)
  const selectedElements = ref<Element[]>([])
  let startX = 0
  let startY = 0
  let cachedElements: CachedElement[] = []
  let rafId: number | null = null

  function cacheElements() {
    cachedElements = []
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest(VA_DATA_ATTR_SELECTOR))
        continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0)
        continue
      const isLeaf = el.children.length === 0
        || LEAF_TAGS.has(el.tagName.toLowerCase())
      if (isLeaf) {
        cachedElements.push({ el, rect, isLeaf })
      }
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (mode.value !== 'inspect' || !e.shiftKey)
      return false

    e.preventDefault()
    document.documentElement.style.userSelect = 'none'

    startX = e.clientX
    startY = e.clientY
    selectionRect.value = { x: startX, y: startY, width: 0, height: 0 }
    transitionFn('multi-selecting')
    cacheElements()

    return true
  }

  function onMouseMove(e: MouseEvent) {
    if (mode.value !== 'multi-selecting')
      return

    const x = Math.min(startX, e.clientX)
    const y = Math.min(startY, e.clientY)
    const width = Math.abs(e.clientX - startX)
    const height = Math.abs(e.clientY - startY)
    selectionRect.value = { x, y, width, height }

    if (rafId !== null)
      return
    rafId = requestAnimationFrame(() => {
      rafId = null
      collectIntersectedElements()
    })
  }

  function onMouseUp() {
    if (mode.value !== 'multi-selecting')
      return

    document.documentElement.style.userSelect = ''
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    collectIntersectedElements()
  }

  function collectIntersectedElements() {
    if (!selectionRect.value)
      return

    const rect = selectionRect.value
    const intersected: Element[] = []

    for (const { el, rect: elRect } of cachedElements) {
      if (
        elRect.left < rect.x + rect.width
        && elRect.right > rect.x
        && elRect.top < rect.y + rect.height
        && elRect.bottom > rect.y
      ) {
        intersected.push(el)
      }
    }

    selectedElements.value = intersected
  }

  function reset() {
    selectionRect.value = null
    selectedElements.value = []
    cachedElements = []
    document.documentElement.style.userSelect = ''
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  return { selectionRect, selectedElements, onMouseDown, onMouseMove, onMouseUp, reset }
}
