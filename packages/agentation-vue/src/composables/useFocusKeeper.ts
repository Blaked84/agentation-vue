import type { Ref } from 'vue-demi'
import { onBeforeUnmount, onMounted } from 'vue-demi'
import { isInsideAgentationTree } from '../utils/agentation-tree'

// Give up instead of fighting forever with a capture-phase focus trap
const MAX_RECOVERIES = 5
const RECOVERY_WINDOW_MS = 1000

/**
 * Modal libraries (Vuetify, Element Plus, focus-trap, …) listen for focus
 * moving outside their dialog and yank it back, which makes the annotation
 * input impossible to type in. This keeper watches for focus leaving the
 * agentation tree while the input is open and reclaims it, restoring the
 * caret where it was.
 */
export function useFocusKeeper(targetEl: Ref<HTMLElement | null>) {
  let savedRange: Range | null = null
  let recoveries: number[] = []
  let pending = false

  function saveSelection() {
    const el = targetEl.value
    const sel = window.getSelection()
    if (!el || !sel || sel.rangeCount === 0)
      return
    const range = sel.getRangeAt(0)
    if (el.contains(range.startContainer))
      savedRange = range.cloneRange()
  }

  function restoreSelection() {
    const el = targetEl.value
    if (!el || !savedRange || !el.contains(savedRange.startContainer))
      return
    const sel = window.getSelection()
    if (!sel)
      return
    sel.removeAllRanges()
    sel.addRange(savedRange)
  }

  function scheduleRecovery() {
    if (pending)
      return
    const now = Date.now()
    recoveries = recoveries.filter(t => now - t < RECOVERY_WINDOW_MS)
    if (recoveries.length >= MAX_RECOVERIES)
      return
    recoveries.push(now)
    pending = true
    requestAnimationFrame(() => {
      pending = false
      const el = targetEl.value
      if (!el || !el.isConnected)
        return
      if (isInsideAgentationTree(document.activeElement))
        return
      el.focus()
      restoreSelection()
    })
  }

  function onDocumentFocusIn(e: FocusEvent) {
    if (isInsideAgentationTree(e.target, e))
      return
    scheduleRecovery()
  }

  function onDocumentFocusOut(e: FocusEvent) {
    if (e.target !== targetEl.value)
      return
    saveSelection()
    // No relatedTarget: focus dropped to body (or the window lost focus —
    // the recovery callback no-ops in that case since activeElement is ours)
    if (!e.relatedTarget)
      scheduleRecovery()
  }

  function onSelectionChange() {
    saveSelection()
  }

  onMounted(() => {
    document.addEventListener('focusin', onDocumentFocusIn, true)
    document.addEventListener('focusout', onDocumentFocusOut, true)
    document.addEventListener('selectionchange', onSelectionChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('focusin', onDocumentFocusIn, true)
    document.removeEventListener('focusout', onDocumentFocusOut, true)
    document.removeEventListener('selectionchange', onSelectionChange)
  })
}
