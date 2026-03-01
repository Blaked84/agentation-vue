import { ref, type Ref } from 'vue-demi'
import type { BoundingBox, InteractionMode } from '../types'

export function useMultiSelect(
  mode: Ref<InteractionMode>,
  transitionFn: (to: InteractionMode) => boolean,
) {
  const selectionRect = ref<BoundingBox | null>(null)
  const selectedElements = ref<Element[]>([])
  let startX = 0
  let startY = 0

  function onMouseDown(e: MouseEvent) {
    if (mode.value !== 'inspect' || !e.shiftKey) return false

    e.preventDefault()
    document.documentElement.style.userSelect = 'none'

    startX = e.clientX
    startY = e.clientY
    selectionRect.value = { x: startX, y: startY, width: 0, height: 0 }
    transitionFn('multi-selecting')

    return true
  }

  function onMouseMove(e: MouseEvent) {
    if (mode.value !== 'multi-selecting') return

    const x = Math.min(startX, e.clientX)
    const y = Math.min(startY, e.clientY)
    const width = Math.abs(e.clientX - startX)
    const height = Math.abs(e.clientY - startY)
    selectionRect.value = { x, y, width, height }

    collectIntersectedElements()
  }

  function onMouseUp() {
    if (mode.value !== 'multi-selecting') return

    document.documentElement.style.userSelect = ''
    collectIntersectedElements()
  }

  function collectIntersectedElements() {
    if (!selectionRect.value) return

    const rect = selectionRect.value
    const all = document.querySelectorAll('body *:not([data-agentation-vue] *)')
    const intersected: Element[] = []

    for (const el of Array.from(all)) {
      if (el.closest('[data-agentation-vue]')) continue
      const elRect = el.getBoundingClientRect()
      if (elRect.width === 0 || elRect.height === 0) continue

      if (
        elRect.left < rect.x + rect.width &&
        elRect.right > rect.x &&
        elRect.top < rect.y + rect.height &&
        elRect.bottom > rect.y
      ) {
        const isLeaf = el.children.length === 0
          || el.tagName.toLowerCase() === 'button'
          || el.tagName.toLowerCase() === 'a'
          || el.tagName.toLowerCase() === 'input'
          || el.tagName.toLowerCase() === 'img'
        if (isLeaf) {
          intersected.push(el)
        }
      }
    }

    selectedElements.value = intersected
  }

  function reset() {
    selectionRect.value = null
    selectedElements.value = []
    document.documentElement.style.userSelect = ''
  }

  return { selectionRect, selectedElements, onMouseDown, onMouseMove, onMouseUp, reset }
}
