import type { Ref } from 'vue-demi'
import type { InteractionMode } from '../types'

export interface TextSelectionResult {
  selectedText: string
  range: Range
  rect: DOMRect
  anchorElement: Element
}

export function useTextSelection(mode: Ref<InteractionMode>) {
  function checkTextSelection(e: MouseEvent): TextSelectionResult | null {
    if (mode.value !== 'inspect')
      return null
    if (e.shiftKey || e.altKey)
      return null

    const selection = window.getSelection()
    const selectedText = selection?.toString().trim() ?? ''

    if (selectedText.length >= 2 && selection?.rangeCount) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      if (rect.width > 5) {
        const anchorElement = range.commonAncestorContainer instanceof Element
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement

        if (anchorElement) {
          return { selectedText, range, rect, anchorElement }
        }
      }
    }

    return null
  }

  return { checkTextSelection }
}
