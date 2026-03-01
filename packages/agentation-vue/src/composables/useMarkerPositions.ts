import type { Ref } from 'vue-demi'
import type { Annotation } from '../types'
import { onBeforeUnmount, onMounted } from 'vue-demi'

export function useMarkerPositions(annotations: Ref<Annotation[]>) {
  let resizeObserver: ResizeObserver | null = null
  let rafId: number | null = null

  function recalculatePositions() {
    if (rafId !== null)
      return
    rafId = requestAnimationFrame(() => {
      rafId = null
      for (const annotation of annotations.value) {
        const el = annotation._targetRef?.deref()
        if (!el)
          continue

        const rect = el.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        annotation.x = ((rect.left + rect.width / 2) / window.innerWidth) * 100
        annotation.y = annotation.isFixed
          ? rect.top + rect.height / 2
          : rect.top + rect.height / 2 + scrollTop
      }
    })
  }

  onMounted(() => {
    window.addEventListener('resize', recalculatePositions, { passive: true })
    window.addEventListener('scroll', recalculatePositions, { passive: true })

    resizeObserver = new ResizeObserver(recalculatePositions)
    const appRoot = document.querySelector('#app') || document.body
    resizeObserver.observe(appRoot)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', recalculatePositions)
    window.removeEventListener('scroll', recalculatePositions)
    resizeObserver?.disconnect()
    if (rafId !== null)
      cancelAnimationFrame(rafId)
  })

  return { recalculatePositions }
}
