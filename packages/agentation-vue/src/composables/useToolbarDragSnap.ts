import type { Ref } from 'vue-demi'
import type { BoundingBox, ToolbarAnchor } from '../types'
import { computed, ref } from 'vue-demi'
import { clamp } from '../utils/math'

export type { ToolbarAnchor } from '../types'

interface Point {
  x: number
  y: number
}

interface UseToolbarDragSnapOptions {
  expanded: Ref<boolean>
  initialPlacement?: ToolbarAnchor
  onDragStart?: () => void
  onDragEnd?: () => void
}

const TOOLBAR_SIZE = 42
const EDGE_OFFSET = 20
const LONG_PRESS_MS = 350
const HALF_TOOLBAR_SIZE = TOOLBAR_SIZE / 2
const TOOLBAR_ANCHORS: ToolbarAnchor[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']

function isToolbarAnchor(value: unknown): value is ToolbarAnchor {
  return typeof value === 'string' && TOOLBAR_ANCHORS.includes(value as ToolbarAnchor)
}

export function useToolbarDragSnap(options: UseToolbarDragSnapOptions) {
  const { expanded, initialPlacement, onDragStart, onDragEnd } = options

  const placement = ref<ToolbarAnchor>(isToolbarAnchor(initialPlacement) ? initialPlacement : 'bottom-right')
  const isDragging = ref(false)
  const dragPosition = ref<Point | null>(null)
  const suppressNextClick = ref(false)
  const activePointerId = ref<number | null>(null)
  const toolbarEl = ref<HTMLElement | null>(null)
  const dragOffset = ref({ x: HALF_TOOLBAR_SIZE, y: HALF_TOOLBAR_SIZE })
  const dragSize = ref({ width: TOOLBAR_SIZE, height: TOOLBAR_SIZE })
  const dragSource = ref<'toggle' | 'handle' | null>(null)
  const dragRotation = ref(0)
  let longPressTimer: ReturnType<typeof setTimeout> | null = null

  const snapAnchors = TOOLBAR_ANCHORS
  const isExpandedDrag = computed(() => isDragging.value && dragSource.value === 'handle')

  const toolbarStyle = computed(() => {
    if (!isDragging.value || !dragPosition.value) {
      return undefined
    }
    return {
      left: `${dragPosition.value.x}px`,
      top: `${dragPosition.value.y}px`,
      transform: `rotate(${dragRotation.value}deg)`,
    }
  })

  const activeSnapAnchor = computed<ToolbarAnchor | null>(() => {
    const current = dragPosition.value
    if (!current) {
      return null
    }
    return findClosestAnchor(
      current.x + dragSize.value.width / 2,
      current.y + dragSize.value.height / 2,
    )
  })

  function getAnchorRects(size: { width: number, height: number }): Record<ToolbarAnchor, BoundingBox> {
    const top = EDGE_OFFSET
    const bottom = window.innerHeight - EDGE_OFFSET - size.height
    const left = EDGE_OFFSET
    const right = window.innerWidth - EDGE_OFFSET - size.width
    const centerX = (window.innerWidth - size.width) / 2
    return {
      'top-left': { x: left, y: top, width: size.width, height: size.height },
      'top-center': { x: centerX, y: top, width: size.width, height: size.height },
      'top-right': { x: right, y: top, width: size.width, height: size.height },
      'bottom-left': { x: left, y: bottom, width: size.width, height: size.height },
      'bottom-center': { x: centerX, y: bottom, width: size.width, height: size.height },
      'bottom-right': { x: right, y: bottom, width: size.width, height: size.height },
    }
  }

  function getSnapPoints(size: { width: number, height: number }): Record<ToolbarAnchor, Point> {
    const rects = getAnchorRects(size)
    const result = {} as Record<ToolbarAnchor, Point>
    for (const anchor of snapAnchors) {
      const r = rects[anchor]
      result[anchor] = { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }
    return result
  }

  function findClosestAnchor(x: number, y: number): ToolbarAnchor {
    const points = getSnapPoints(dragSize.value)
    let closest: ToolbarAnchor = 'bottom-right'
    let bestDistance = Number.POSITIVE_INFINITY

    for (const [anchor, point] of Object.entries(points) as [ToolbarAnchor, Point][]) {
      const dx = point.x - x
      const dy = point.y - y
      const distance = dx * dx + dy * dy
      if (distance < bestDistance) {
        bestDistance = distance
        closest = anchor
      }
    }

    return closest
  }

  function captureDragMetrics(clientX: number, clientY: number) {
    const rect = toolbarEl.value?.getBoundingClientRect()
    if (!rect) {
      return
    }
    dragOffset.value = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
    dragSize.value = {
      width: rect.width,
      height: rect.height,
    }
  }

  function updateDragPosition(clientX: number, clientY: number) {
    const { width, height } = dragSize.value
    dragPosition.value = {
      x: clamp(clientX - dragOffset.value.x, 0, window.innerWidth - width),
      y: clamp(clientY - dragOffset.value.y, 0, window.innerHeight - height),
    }
  }

  function clearLongPressTimer() {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  function finishDrag(clientX: number, clientY: number) {
    updateDragPosition(clientX, clientY)
    const current = dragPosition.value
    if (current) {
      placement.value = findClosestAnchor(
        current.x + dragSize.value.width / 2,
        current.y + dragSize.value.height / 2,
      )
    }
    isDragging.value = false
    dragPosition.value = null
    onDragEnd?.()
  }

  function getSnapStyle(anchor: ToolbarAnchor): Record<string, string> {
    const rect = getAnchorRects(dragSize.value)[anchor]
    if (isExpandedDrag.value) {
      return {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }
    }

    return {
      left: `${rect.x + rect.width / 2}px`,
      top: `${rect.y + rect.height / 2}px`,
    }
  }

  function startDragPointer(
    e: PointerEvent,
    source: 'toggle' | 'handle',
    options: { immediate: boolean },
  ) {
    if (e.button !== 0) {
      return
    }

    activePointerId.value = e.pointerId
    dragSource.value = source
    captureDragMetrics(e.clientX, e.clientY)
    const target = e.currentTarget as HTMLElement | null
    target?.setPointerCapture?.(e.pointerId)

    clearLongPressTimer()
    dragRotation.value = (2 + Math.random() * 3) * (Math.random() < 0.5 ? -1 : 1)
    if (options.immediate) {
      dragRotation.value = (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1)
      isDragging.value = true
      onDragStart?.()
      updateDragPosition(e.clientX, e.clientY)
      return
    }

    longPressTimer = setTimeout(() => {
      if (activePointerId.value !== e.pointerId || expanded.value) {
        return
      }
      dragRotation.value = (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1)
      isDragging.value = true
      onDragStart?.()
      updateDragPosition(e.clientX, e.clientY)
    }, LONG_PRESS_MS)
  }

  function onTogglePointerDown(e: PointerEvent) {
    if (expanded.value) {
      return
    }
    startDragPointer(e, 'toggle', { immediate: false })
  }

  function onHandlePointerDown(e: PointerEvent) {
    if (!expanded.value) {
      return
    }
    startDragPointer(e, 'handle', { immediate: true })
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging.value || activePointerId.value !== e.pointerId) {
      return
    }
    updateDragPosition(e.clientX, e.clientY)
  }

  function onPointerUp(e: PointerEvent) {
    if (activePointerId.value !== e.pointerId) {
      return
    }

    clearLongPressTimer()
    if (isDragging.value) {
      finishDrag(e.clientX, e.clientY)
      if (dragSource.value === 'toggle') {
        suppressNextClick.value = true
      }
    }

    activePointerId.value = null
    dragSource.value = null
    const target = e.currentTarget as HTMLElement | null
    target?.releasePointerCapture?.(e.pointerId)
  }

  function onPointerCancel() {
    if (isDragging.value) {
      onDragEnd?.()
    }
    clearLongPressTimer()
    isDragging.value = false
    dragPosition.value = null
    activePointerId.value = null
    dragSource.value = null
  }

  function consumeToggleClickSuppression() {
    if (!suppressNextClick.value) {
      return false
    }
    suppressNextClick.value = false
    return true
  }

  function cleanup() {
    clearLongPressTimer()
    if (isDragging.value) {
      isDragging.value = false
      onDragEnd?.()
    }
    activePointerId.value = null
    dragSource.value = null
  }

  return {
    placement,
    isDragging,
    toolbarStyle,
    toolbarEl,
    snapAnchors,
    activeSnapAnchor,
    isExpandedDrag,
    getSnapStyle,
    onTogglePointerDown,
    onHandlePointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    consumeToggleClickSuppression,
    cleanup,
  }
}
