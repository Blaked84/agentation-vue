import type { Ref } from 'vue-demi'
import type { Annotation } from '../types'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue-demi'
import { isInsideAgentationTree } from '../utils/agentation-tree'
import { resolveAnnotationTarget } from '../utils/annotation-target'

interface RectEdges {
  top: number
  right: number
  bottom: number
  left: number
}

const CLIPPING_OVERFLOW_VALUES = new Set(['auto', 'scroll', 'hidden', 'overlay'])

export function isTargetCenterClipped(
  targetRect: RectEdges,
  clippingRects: RectEdges[],
): boolean {
  const centerX = (targetRect.left + targetRect.right) / 2
  const centerY = (targetRect.top + targetRect.bottom) / 2
  let intersectionTop = targetRect.top
  let intersectionRight = targetRect.right
  let intersectionBottom = targetRect.bottom
  let intersectionLeft = targetRect.left

  for (const clippingRect of clippingRects) {
    intersectionTop = Math.max(intersectionTop, clippingRect.top)
    intersectionRight = Math.min(intersectionRight, clippingRect.right)
    intersectionBottom = Math.min(intersectionBottom, clippingRect.bottom)
    intersectionLeft = Math.max(intersectionLeft, clippingRect.left)

    if (
      intersectionLeft >= intersectionRight
      || intersectionTop >= intersectionBottom
      || centerX < intersectionLeft
      || centerX > intersectionRight
      || centerY < intersectionTop
      || centerY > intersectionBottom
    ) {
      return true
    }
  }

  return false
}

function getElementClientRect(element: HTMLElement): RectEdges {
  const rect = element.getBoundingClientRect()
  const scaleX = element.offsetWidth ? rect.width / element.offsetWidth : 1
  const scaleY = element.offsetHeight ? rect.height / element.offsetHeight : 1
  const left = rect.left + element.clientLeft * scaleX
  const top = rect.top + element.clientTop * scaleY

  return {
    top,
    right: left + element.clientWidth * scaleX,
    bottom: top + element.clientHeight * scaleY,
    left,
  }
}

function mapsDiffer(current: Map<string, boolean>, next: Map<string, boolean>): boolean {
  if (current.size !== next.size)
    return true

  for (const [id, clipped] of current) {
    if (!next.has(id) || next.get(id) !== clipped)
      return true
  }

  return false
}

export function useMarkerPositions(annotations: Ref<Annotation[]>) {
  let resizeObserver: ResizeObserver | null = null
  let rafId: number | null = null
  let retryResolutionPending = false
  const scrollableAncestorCache = new WeakMap<Element, HTMLElement[]>()
  const unresolvedIds = new Set<string>()
  const targetStates = ref<Map<string, boolean>>(new Map())
  const scrollListenerOptions = { capture: true, passive: true } as const

  function getScrollableAncestors(target: Element): HTMLElement[] {
    const cached = scrollableAncestorCache.get(target)
    if (cached)
      return cached

    const ancestors: HTMLElement[] = []
    let ancestor = target.parentElement
    while (
      ancestor
      && ancestor !== document.body
      && ancestor !== document.documentElement
    ) {
      const style = window.getComputedStyle(ancestor)
      if (
        CLIPPING_OVERFLOW_VALUES.has(style.overflowX)
        || CLIPPING_OVERFLOW_VALUES.has(style.overflowY)
      ) {
        ancestors.push(ancestor)
      }
      ancestor = ancestor.parentElement
    }
    scrollableAncestorCache.set(target, ancestors)
    return ancestors
  }

  function recalculatePositions(isRetry = false) {
    retryResolutionPending = retryResolutionPending || isRetry
    if (rafId !== null)
      return
    rafId = requestAnimationFrame(() => {
      rafId = null
      const isRetryPass = retryResolutionPending
      retryResolutionPending = false
      if (isRetryPass)
        unresolvedIds.clear()

      const nextStates = new Map<string, boolean>()
      for (const annotation of annotations.value) {
        if (unresolvedIds.has(annotation.id) && !isRetryPass)
          continue

        const el = resolveAnnotationTarget(annotation)
        if (!el) {
          unresolvedIds.add(annotation.id)
          continue
        }

        const rect = el.getBoundingClientRect()
        const clippingRects = getScrollableAncestors(el)
          .map(getElementClientRect)
        nextStates.set(annotation.id, isTargetCenterClipped(rect, clippingRects))

        const scrollTop = window.scrollY || document.documentElement.scrollTop

        annotation.x = ((rect.left + rect.width / 2) / window.innerWidth) * 100
        annotation.y = annotation.isFixed
          ? rect.top + rect.height / 2
          : rect.top + rect.height / 2 + scrollTop
      }

      if (mapsDiffer(targetStates.value, nextStates))
        targetStates.value = nextStates
    })
  }

  function scheduleReanchor() {
    recalculatePositions(true)
  }

  function handleResize() {
    recalculatePositions()
  }

  function handleResizeObserver() {
    recalculatePositions(true)
  }

  function onScroll(e: Event) {
    const t = e.target
    if (t instanceof Element && isInsideAgentationTree(t))
      return
    recalculatePositions()
  }

  const stopWatch = watch(annotations, scheduleReanchor, { flush: 'post' })

  onMounted(() => {
    window.addEventListener('resize', handleResize, { passive: true })
    document.addEventListener('scroll', onScroll, scrollListenerOptions)

    resizeObserver = new ResizeObserver(handleResizeObserver)
    const appRoot = document.querySelector('#app') || document.body
    resizeObserver.observe(appRoot)
    scheduleReanchor()
  })

  onBeforeUnmount(() => {
    stopWatch()
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('scroll', onScroll, scrollListenerOptions)
    resizeObserver?.disconnect()
    if (rafId !== null)
      cancelAnimationFrame(rafId)
  })

  return { targetStates, recalculatePositions }
}
