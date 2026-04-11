import type { Ref } from 'vue-demi'
import type { MentionCandidate } from '../utils/mention'
import { computed, ref } from 'vue-demi'

function getSelection(el: HTMLElement): Selection | null {
  // Chrome requires shadowRoot.getSelection() inside shadow DOM
  const root = el.getRootNode()
  if (root instanceof ShadowRoot && typeof (root as any).getSelection === 'function')
    return (root as any).getSelection()
  return window.getSelection()
}

interface TriggerInfo {
  textNode: Text
  atIndex: number
  query: string
}

function findTrigger(el: HTMLElement): TriggerInfo | null {
  const sel = getSelection(el)
  if (!sel || sel.rangeCount === 0)
    return null

  const range = sel.getRangeAt(0)
  if (!range.collapsed)
    return null

  const { startContainer, startOffset } = range
  if (startContainer.nodeType !== Node.TEXT_NODE)
    return null

  const textNode = startContainer as Text
  const text = textNode.textContent || ''
  const beforeCursor = text.slice(0, startOffset)

  // Find the last @ that is preceded by space/newline or is at the start
  for (let i = beforeCursor.length - 1; i >= 0; i--) {
    const ch = beforeCursor[i]
    // Stop at space/newline — no trigger if we passed one without finding @
    if (ch === ' ' || ch === '\n')
      return null
    if (ch === '@') {
      // @ must be at start or preceded by space/newline
      if (i === 0 || beforeCursor[i - 1] === ' ' || beforeCursor[i - 1] === '\n') {
        return {
          textNode,
          atIndex: i,
          query: beforeCursor.slice(i + 1),
        }
      }
      return null
    }
  }
  return null
}

export function useMentionDropdown(
  inputEl: Ref<HTMLElement | null>,
  candidates: Ref<MentionCandidate[]>,
) {
  const isOpen = ref(false)
  const query = ref('')
  const activeIndex = ref(0)
  const dropdownPosition = ref({ x: 0, y: 0 })
  let currentTrigger: TriggerInfo | null = null

  const filteredCandidates = computed(() => {
    if (!isOpen.value)
      return []
    const q = query.value.toLowerCase()
    return candidates.value.filter((c) => {
      if (!q)
        return true
      return String(c.displayNumber).startsWith(q)
        || c.commentPreview.toLowerCase().includes(q)
    })
  })

  function checkForTrigger() {
    const el = inputEl.value
    if (!el)
      return

    const trigger = findTrigger(el)
    if (trigger) {
      currentTrigger = trigger
      query.value = trigger.query
      activeIndex.value = 0
      isOpen.value = true
      updatePosition()
    }
    else {
      close()
    }
  }

  function updatePosition() {
    const el = inputEl.value
    if (!el || !currentTrigger)
      return

    const sel = getSelection(el)
    if (!sel || sel.rangeCount === 0)
      return

    const range = sel.getRangeAt(0).cloneRange()
    range.setStart(currentTrigger.textNode, currentTrigger.atIndex)
    const rect = range.getBoundingClientRect()
    const containerRect = el.closest('.__va-input')?.getBoundingClientRect()
    if (!containerRect)
      return

    const x = rect.left - containerRect.left
    const y = rect.bottom - containerRect.top + 4

    // Flip above if it would overflow viewport bottom
    const viewportBottom = window.innerHeight
    const estimatedDropdownHeight = Math.min(filteredCandidates.value.length * 36 + 8, 200)
    if (rect.bottom + estimatedDropdownHeight > viewportBottom) {
      dropdownPosition.value = { x, y: rect.top - containerRect.top - estimatedDropdownHeight - 4 }
    }
    else {
      dropdownPosition.value = { x, y }
    }
  }

  function selectCandidate(candidate: MentionCandidate) {
    const el = inputEl.value
    if (!el || !currentTrigger)
      return

    const sel = getSelection(el)
    if (!sel || sel.rangeCount === 0)
      return

    const { textNode, atIndex } = currentTrigger
    const cursorOffset = sel.getRangeAt(0).startOffset

    // Create a range spanning from @ to cursor position
    const range = document.createRange()
    range.setStart(textNode, atIndex)
    range.setEnd(textNode, cursorOffset)
    range.deleteContents()

    // Create the chip element
    const chip = document.createElement('span')
    chip.contentEditable = 'false'
    chip.className = '__va-mention'
    chip.dataset.mentionId = candidate.id
    chip.textContent = `@${candidate.displayNumber}`

    // Insert chip + trailing space
    range.insertNode(chip)
    const space = document.createTextNode('\u00A0')
    chip.after(space)

    // Move cursor after the space
    const newRange = document.createRange()
    newRange.setStartAfter(space)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)

    close()

    // Trigger input event so the parent can serialize
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function onKeyDown(e: KeyboardEvent): boolean {
    if (!isOpen.value || filteredCandidates.value.length === 0)
      return false

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % filteredCandidates.value.length
      return true
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + filteredCandidates.value.length) % filteredCandidates.value.length
      return true
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      selectCandidate(filteredCandidates.value[activeIndex.value])
      return true
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return true
    }
    return false
  }

  function close() {
    isOpen.value = false
    query.value = ''
    activeIndex.value = 0
    currentTrigger = null
  }

  return {
    isOpen,
    filteredCandidates,
    activeIndex,
    dropdownPosition,
    checkForTrigger,
    selectCandidate,
    onKeyDown,
    close,
  }
}
