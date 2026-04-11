<script setup lang="ts">
import type { BoundingBox, Settings } from '../types'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue-demi'
import { clamp } from '../utils/math'
import SettingsPanel from './SettingsPanel.vue'

type Placement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'

const props = defineProps<{
  open: boolean
  settings: Settings
  anchorEl: HTMLElement | null
}>()

const emit = defineEmits<{
  close: []
  update: [settings: Partial<Settings>]
}>()

const panelEl = ref<HTMLElement | null>(null)
const placement = ref<Placement>('bottom-start')
const style = ref<Record<string, string>>({
  left: '-9999px',
  top: '-9999px',
  visibility: 'hidden',
})

const GAP = 8
const VIEWPORT_PADDING = 8
let rafId: number | null = null

function getPlacementCandidates(anchorRect: DOMRect): Placement[] {
  const isOnBottomHalf = anchorRect.top > window.innerHeight / 2
  const isOnRightHalf = anchorRect.left > window.innerWidth / 2
  const preferredVertical = isOnBottomHalf ? 'top' : 'bottom'
  const secondaryVertical = isOnBottomHalf ? 'bottom' : 'top'
  const preferredAlign = isOnRightHalf ? 'end' : 'start'
  const secondaryAlign = isOnRightHalf ? 'start' : 'end'
  const preferredHorizontal = isOnRightHalf ? 'left' : 'right'
  const secondaryHorizontal = isOnRightHalf ? 'right' : 'left'

  return [
    `${preferredVertical}-${preferredAlign}` as Placement,
    `${preferredVertical}-${secondaryAlign}` as Placement,
    `${secondaryVertical}-${preferredAlign}` as Placement,
    `${secondaryVertical}-${secondaryAlign}` as Placement,
    `${preferredHorizontal}-start` as Placement,
    `${preferredHorizontal}-end` as Placement,
    `${secondaryHorizontal}-start` as Placement,
    `${secondaryHorizontal}-end` as Placement,
  ]
}

function getCoordinates(anchorRect: DOMRect, panelRect: BoundingBox, value: Placement): { x: number, y: number } {
  switch (value) {
    case 'top-start':
      return { x: anchorRect.left, y: anchorRect.top - GAP - panelRect.height }
    case 'top-end':
      return { x: anchorRect.right - panelRect.width, y: anchorRect.top - GAP - panelRect.height }
    case 'bottom-start':
      return { x: anchorRect.left, y: anchorRect.bottom + GAP }
    case 'bottom-end':
      return { x: anchorRect.right - panelRect.width, y: anchorRect.bottom + GAP }
    case 'left-start':
      return { x: anchorRect.left - GAP - panelRect.width, y: anchorRect.top }
    case 'left-end':
      return { x: anchorRect.left - GAP - panelRect.width, y: anchorRect.bottom - panelRect.height }
    case 'right-start':
      return { x: anchorRect.right + GAP, y: anchorRect.top }
    case 'right-end':
      return { x: anchorRect.right + GAP, y: anchorRect.bottom - panelRect.height }
    default:
      return { x: anchorRect.left, y: anchorRect.bottom + GAP }
  }
}

function getOverflow(x: number, y: number, panelRect: BoundingBox) {
  const rightLimit = window.innerWidth - VIEWPORT_PADDING
  const bottomLimit = window.innerHeight - VIEWPORT_PADDING
  return {
    left: Math.max(0, VIEWPORT_PADDING - x),
    right: Math.max(0, x + panelRect.width - rightLimit),
    top: Math.max(0, VIEWPORT_PADDING - y),
    bottom: Math.max(0, y + panelRect.height - bottomLimit),
  }
}

function getOverflowScore(overflow: ReturnType<typeof getOverflow>) {
  return overflow.left + overflow.right + overflow.top + overflow.bottom
}

function applyPosition() {
  if (!props.open)
    return

  const anchorEl = props.anchorEl
  const panel = panelEl.value
  if (!anchorEl || !panel) {
    style.value = { left: '-9999px', top: '-9999px', visibility: 'hidden' }
    return
  }

  if (!anchorEl.isConnected) {
    emit('close')
    return
  }

  const anchorRect = anchorEl.getBoundingClientRect()
  const panelRect: BoundingBox = {
    x: 0,
    y: 0,
    width: panel.offsetWidth,
    height: panel.offsetHeight,
  }

  const candidates = getPlacementCandidates(anchorRect)
  let best = candidates[0]
  let bestCoords = getCoordinates(anchorRect, panelRect, best)
  let bestOverflow = getOverflow(bestCoords.x, bestCoords.y, panelRect)
  let bestScore = getOverflowScore(bestOverflow)

  for (let i = 1; i < candidates.length; i++) {
    const candidate = candidates[i]
    const coords = getCoordinates(anchorRect, panelRect, candidate)
    const overflow = getOverflow(coords.x, coords.y, panelRect)
    const score = getOverflowScore(overflow)
    if (score < bestScore) {
      best = candidate
      bestCoords = coords
      bestOverflow = overflow
      bestScore = score
    }
  }

  const x = clamp(
    bestCoords.x,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerWidth - VIEWPORT_PADDING - panelRect.width),
  )
  const y = clamp(
    bestCoords.y,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerHeight - VIEWPORT_PADDING - panelRect.height),
  )

  placement.value = best
  style.value = {
    left: `${Math.round(x)}px`,
    top: `${Math.round(y)}px`,
    visibility: 'visible',
  }
}

function schedulePositionUpdate() {
  if (rafId != null)
    return
  rafId = window.requestAnimationFrame(() => {
    rafId = null
    applyPosition()
  })
}

function onDocumentPointerDown(e: PointerEvent) {
  if (!props.open)
    return
  const path = e.composedPath()
  if (panelEl.value && path.includes(panelEl.value))
    return
  if (props.anchorEl && path.includes(props.anchorEl))
    return
  emit('close')
}

function addGlobalListeners() {
  window.addEventListener('resize', schedulePositionUpdate)
  window.addEventListener('scroll', schedulePositionUpdate, true)
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
}

function removeGlobalListeners() {
  window.removeEventListener('resize', schedulePositionUpdate)
  window.removeEventListener('scroll', schedulePositionUpdate, true)
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      applyPosition()
      addGlobalListeners()
    }
    else {
      removeGlobalListeners()
      style.value = { left: '-9999px', top: '-9999px', visibility: 'hidden' }
    }
  },
  { immediate: true },
)

watch(
  () => props.anchorEl,
  async () => {
    if (!props.open)
      return
    await nextTick()
    applyPosition()
  },
)

onBeforeUnmount(() => {
  removeGlobalListeners()
  if (rafId != null) {
    window.cancelAnimationFrame(rafId)
    rafId = null
  }
})
</script>

<template>
  <div
    v-if="open"
    ref="panelEl"
    class="__va-settings-popover"
    :data-placement="placement"
    :style="style"
    data-agentation-vue
    @click.stop
  >
    <SettingsPanel :settings="settings" @update="$emit('update', $event)" />
  </div>
</template>
