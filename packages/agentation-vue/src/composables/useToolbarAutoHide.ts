import type { Ref } from 'vue-demi'
import type { ToolbarAnchor } from './useToolbarDragSnap'
import { computed, onBeforeUnmount, ref, watch } from 'vue-demi'

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

interface Point {
  x: number
  y: number
}

interface ToolbarSize {
  width: number
  height: number
}

interface UseToolbarAutoHideOptions {
  enabled: Ref<boolean>
  expanded: Ref<boolean>
  isDragging: Ref<boolean>
  placement: Ref<ToolbarAnchor>
  toolbarEl: Ref<HTMLElement | null>
}

const EDGE_OFFSET = 20
const DEFAULT_TOOLBAR_SIZE = 44
const ACTIVATION_EDGE_DEPTH = 16
const ACTIVATION_INLINE_PAD = 30
const ACTIVATION_CORNER_SIZE = 32
const KEEP_ALIVE_PADDING = 56
const HIDE_DELAY_MS = 140
const ENTER_LOCK_MS = 220
const CLICK_LOCK_MS = 320

export function useToolbarAutoHide(options: UseToolbarAutoHideOptions) {
  const { enabled, expanded, isDragging, placement, toolbarEl } = options

  const isAutoHideRevealed = ref(false)
  const isAutoHideActive = computed(() => enabled.value && !expanded.value && !isDragging.value)

  let hideTimer: ReturnType<typeof setTimeout> | null = null
  let revealLockUntil = 0
  let listenersAttached = false

  function clearHideTimer() {
    if (!hideTimer) {
      return
    }
    clearTimeout(hideTimer)
    hideTimer = null
  }

  function reveal() {
    isAutoHideRevealed.value = true
    clearHideTimer()
  }

  function lockReveal(durationMs: number) {
    revealLockUntil = Math.max(revealLockUntil, Date.now() + durationMs)
    reveal()
  }

  function hideNow() {
    clearHideTimer()
    revealLockUntil = 0
    isAutoHideRevealed.value = false
  }

  function scheduleHide() {
    clearHideTimer()
    hideTimer = setTimeout(() => {
      if (Date.now() < revealLockUntil) {
        scheduleHide()
        return
      }
      isAutoHideRevealed.value = false
      hideTimer = null
    }, HIDE_DELAY_MS)
  }

  function getToolbarSize(): ToolbarSize {
    const el = toolbarEl.value
    return {
      width: el?.offsetWidth ?? DEFAULT_TOOLBAR_SIZE,
      height: el?.offsetHeight ?? DEFAULT_TOOLBAR_SIZE,
    }
  }

  function getCollapsedRect(anchor: ToolbarAnchor, size: ToolbarSize): Rect {
    const left = EDGE_OFFSET
    const top = EDGE_OFFSET
    const right = window.innerWidth - EDGE_OFFSET - size.width
    const bottom = window.innerHeight - EDGE_OFFSET - size.height
    const centerX = (window.innerWidth - size.width) / 2

    switch (anchor) {
      case 'top-left':
        return { left, top, right: left + size.width, bottom: top + size.height }
      case 'top-center':
        return { left: centerX, top, right: centerX + size.width, bottom: top + size.height }
      case 'top-right':
        return { left: right, top, right: right + size.width, bottom: top + size.height }
      case 'bottom-left':
        return { left, top: bottom, right: left + size.width, bottom: bottom + size.height }
      case 'bottom-center':
        return { left: centerX, top: bottom, right: centerX + size.width, bottom: bottom + size.height }
      case 'bottom-right':
      default:
        return { left: right, top: bottom, right: right + size.width, bottom: bottom + size.height }
    }
  }

  function getActivationRect(anchor: ToolbarAnchor, size: ToolbarSize): Rect {
    const W = window.innerWidth
    const H = window.innerHeight
    const centerX = W / 2

    switch (anchor) {
      case 'top-left':
        return { left: 0, top: 0, right: ACTIVATION_CORNER_SIZE, bottom: ACTIVATION_CORNER_SIZE }
      case 'top-center':
        return {
          left: centerX - size.width / 2 - ACTIVATION_INLINE_PAD,
          top: 0,
          right: centerX + size.width / 2 + ACTIVATION_INLINE_PAD,
          bottom: ACTIVATION_EDGE_DEPTH,
        }
      case 'top-right':
        return { left: W - ACTIVATION_CORNER_SIZE, top: 0, right: W, bottom: ACTIVATION_CORNER_SIZE }
      case 'bottom-left':
        return { left: 0, top: H - ACTIVATION_CORNER_SIZE, right: ACTIVATION_CORNER_SIZE, bottom: H }
      case 'bottom-center':
        return {
          left: centerX - size.width / 2 - ACTIVATION_INLINE_PAD,
          top: H - ACTIVATION_EDGE_DEPTH,
          right: centerX + size.width / 2 + ACTIVATION_INLINE_PAD,
          bottom: H,
        }
      case 'bottom-right':
      default:
        return { left: W - ACTIVATION_CORNER_SIZE, top: H - ACTIVATION_CORNER_SIZE, right: W, bottom: H }
    }
  }

  function inflateRect(rect: Rect, padding: number): Rect {
    return {
      left: rect.left - padding,
      top: rect.top - padding,
      right: rect.right + padding,
      bottom: rect.bottom + padding,
    }
  }

  function isInside(point: Point, rect: Rect): boolean {
    return point.x >= rect.left
      && point.x <= rect.right
      && point.y >= rect.top
      && point.y <= rect.bottom
  }

  function isInActivationZone(point: Point, anchor: ToolbarAnchor, size: ToolbarSize): boolean {
    return isInside(point, getActivationRect(anchor, size))
  }

  function onGlobalPointerMove(e: PointerEvent) {
    if (!isAutoHideActive.value) {
      return
    }

    const size = getToolbarSize()
    const point = { x: e.clientX, y: e.clientY }
    const keepAliveRect = inflateRect(getCollapsedRect(placement.value, size), KEEP_ALIVE_PADDING)

    if (isInActivationZone(point, placement.value, size) || (isAutoHideRevealed.value && isInside(point, keepAliveRect))) {
      reveal()
      return
    }

    scheduleHide()
  }

  function onWindowBlur() {
    if (isAutoHideActive.value) {
      hideNow()
    }
  }

  function addGlobalListeners() {
    if (listenersAttached || typeof window === 'undefined') {
      return
    }
    listenersAttached = true
    window.addEventListener('pointermove', onGlobalPointerMove, true)
    window.addEventListener('blur', onWindowBlur)
  }

  function removeGlobalListeners() {
    if (!listenersAttached || typeof window === 'undefined') {
      return
    }
    listenersAttached = false
    window.removeEventListener('pointermove', onGlobalPointerMove, true)
    window.removeEventListener('blur', onWindowBlur)
  }

  function onToolbarPointerEnter() {
    if (!isAutoHideActive.value) {
      return
    }
    lockReveal(ENTER_LOCK_MS)
  }

  function onToolbarPointerLeave() {
    // The toolbar moves on reveal, so pointerleave can fire mid-transition.
    // We let global pointer tracking decide when to hide to avoid flicker loops.
  }

  function onToolbarPointerDown() {
    if (!isAutoHideActive.value) {
      return
    }
    lockReveal(CLICK_LOCK_MS)
  }

  function onToolbarFocusIn() {
    if (!isAutoHideActive.value) {
      return
    }
    lockReveal(CLICK_LOCK_MS)
  }

  function onToolbarFocusOut() {
    if (!isAutoHideActive.value) {
      return
    }
    scheduleHide()
  }

  watch(
    isAutoHideActive,
    (active) => {
      if (!active) {
        removeGlobalListeners()
        hideNow()
        return
      }

      addGlobalListeners()
      isAutoHideRevealed.value = false
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    removeGlobalListeners()
    clearHideTimer()
  })

  return {
    isAutoHideActive,
    isAutoHideRevealed,
    onToolbarPointerEnter,
    onToolbarPointerLeave,
    onToolbarPointerDown,
    onToolbarFocusIn,
    onToolbarFocusOut,
  }
}
