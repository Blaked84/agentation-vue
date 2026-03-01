import type { Ref } from 'vue-demi'
import type { BoundingBox, InteractionMode } from '../types'
import { ref } from 'vue-demi'

export function useAreaSelect(
  mode: Ref<InteractionMode>,
  transitionFn: (to: InteractionMode) => boolean,
) {
  const areaRect = ref<BoundingBox | null>(null)
  const isAreaMode = ref(false)
  let startX = 0
  let startY = 0

  function toggleAreaMode() {
    isAreaMode.value = !isAreaMode.value
  }

  function onMouseDown(e: MouseEvent) {
    const shouldActivate = (mode.value === 'inspect' && e.altKey)
      || (mode.value === 'inspect' && isAreaMode.value)

    if (!shouldActivate)
      return false

    e.preventDefault()
    document.documentElement.style.userSelect = 'none'

    startX = e.clientX
    startY = e.clientY
    areaRect.value = { x: startX, y: startY, width: 0, height: 0 }
    transitionFn('area-selecting')

    return true
  }

  function onMouseMove(e: MouseEvent) {
    if (mode.value !== 'area-selecting')
      return

    const x = Math.min(startX, e.clientX)
    const y = Math.min(startY, e.clientY)
    const width = Math.abs(e.clientX - startX)
    const height = Math.abs(e.clientY - startY)
    areaRect.value = { x, y, width, height }
  }

  function onMouseUp() {
    if (mode.value !== 'area-selecting')
      return
    document.documentElement.style.userSelect = ''
  }

  function reset() {
    areaRect.value = null
    document.documentElement.style.userSelect = ''
  }

  return { areaRect, isAreaMode, toggleAreaMode, onMouseDown, onMouseMove, onMouseUp, reset }
}
