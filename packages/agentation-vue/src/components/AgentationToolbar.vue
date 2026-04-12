<script setup lang="ts">
import type { InteractionMode, ToolbarAnchor } from '../types'
import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue-demi'
import { useToolbarAutoHide } from '../composables/useToolbarAutoHide'
import { useToolbarDragSnap } from '../composables/useToolbarDragSnap'
import VaIcon from './VaIcon.vue'
import VaIconButton from './VaIconButton.vue'

const props = defineProps<{
  mode: InteractionMode
  annotationCount: number
  isPaused: boolean
  isAreaMode: boolean
  autoHideEnabled: boolean
  placement: ToolbarAnchor
  isPeekCharging: boolean
  peekDurationMs: number
}>()

const emit = defineEmits<{
  'activate': []
  'deactivate': []
  'copy': []
  'clear': []
  'toggle-pause': []
  'toggle-area': [value: boolean]
  'update:placement': [value: ToolbarAnchor]
  'open-settings': [anchorEl: HTMLElement | null]
  'drag-start': []
  'drag-end': []
}>()

const expanded = ref(false)
const {
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
} = useToolbarDragSnap({
  expanded,
  initialPlacement: props.placement,
  onDragStart: () => emit('drag-start'),
  onDragEnd: () => emit('drag-end'),
})

const autoHideEnabled = toRef(props, 'autoHideEnabled')
const {
  isAutoHideActive,
  isAutoHideRevealed,
  onToolbarPointerEnter,
  onToolbarPointerLeave,
  onToolbarPointerDown,
  onToolbarFocusIn,
  onToolbarFocusOut,
} = useToolbarAutoHide({
  enabled: autoHideEnabled,
  expanded,
  isDragging,
  placement,
  toolbarEl,
})

const toolbarClass = computed(() => [
  `__va-toolbar--place-${placement.value}`,
  {
    '__va-toolbar--collapsed': !expanded.value,
    '__va-toolbar--expanded': expanded.value,
    '__va-toolbar--dragging': isDragging.value,
    '__va-toolbar--auto-hide': isAutoHideActive.value,
    '__va-toolbar--auto-hide-revealed': isAutoHideRevealed.value,
  },
])

function onToggleClick() {
  if (consumeToggleClickSuppression()) {
    return
  }
  onActivate()
}

function onActivate() {
  expanded.value = true
  emit('activate')
}

function onDeactivate() {
  expanded.value = false
  emit('deactivate')
}

function onClear() {
  emit('clear')
}

function onOpenSettings(e: MouseEvent) {
  const anchorEl = e.currentTarget instanceof HTMLElement ? e.currentTarget : null
  emit('open-settings', anchorEl)
}

onBeforeUnmount(() => {
  cleanup()
})

watch(
  () => props.placement,
  (value) => {
    if (placement.value !== value)
      placement.value = value
  },
)

watch(placement, value => emit('update:placement', value))

defineExpose({ expanded, placement })
</script>

<template>
  <div class="__va-toolbar-layer" data-agentation-vue>
    <div v-if="isDragging" class="__va-snap-zones" aria-hidden="true">
      <div
        v-for="anchor in snapAnchors"
        :key="anchor"
        class="__va-snap-zone"
        :class="{ '__va-snap-zone--active': activeSnapAnchor === anchor, '__va-snap-zone--rect': isExpandedDrag }"
        :style="getSnapStyle(anchor)"
      />
    </div>

    <div
      ref="toolbarEl"
      class="__va-toolbar"
      :class="toolbarClass"
      :style="toolbarStyle"
      @pointerenter="onToolbarPointerEnter"
      @pointerleave="onToolbarPointerLeave"
      @pointerdown.capture="onToolbarPointerDown"
      @focusin="onToolbarFocusIn"
      @focusout="onToolbarFocusOut"
    >
      <div class="__va-toolbar-stage __va-toolbar-stage--toggle" :aria-hidden="expanded">
        <button
          type="button"
          class="__va-toolbar-toggle"
          aria-label="Appui long pour déplacer"
          @click="onToggleClick"
          @pointerdown="onTogglePointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
        >
          <VaIcon name="cursor" />
          <span v-if="annotationCount > 0" class="__va-toolbar-badge">{{ annotationCount }}</span>
          <svg
            v-if="isPeekCharging"
            class="__va-peek-ring"
            viewBox="0 0 46 46"
            aria-hidden="true"
          >
            <circle cx="23" cy="23" r="21" :style="{ animationDuration: `${peekDurationMs}ms` }" />
          </svg>
        </button>
      </div>

      <div class="__va-toolbar-stage __va-toolbar-stage--menu" :aria-hidden="!expanded">
        <button
          type="button"
          class="__va-drag-handle"
          aria-label="Glisser pour déplacer"
          @pointerdown="onHandlePointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
        >
          <span class="__va-drag-handle-dots" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
        </button>

        <div class="__va-toolbar-sep" />

        <!-- Element selector (default mode) -->
        <VaIconButton :active="!isAreaMode" title="Element selector" shortcut="V" @click="emit('toggle-area', false)">
          <VaIcon name="cursor" />
        </VaIconButton>

        <!-- Area selection -->
        <VaIconButton :active="isAreaMode" title="Area selection" shortcut="A" @click="emit('toggle-area', true)">
          <VaIcon name="area-select" />
        </VaIconButton>

        <div class="__va-toolbar-sep" />

        <!-- Pause animations -->
        <VaIconButton :active="isPaused" title="Pause animations" shortcut="P" @click="emit('toggle-pause')">
          <VaIcon v-if="!isPaused" name="pause" />
          <VaIcon v-else name="play" />
        </VaIconButton>

        <div class="__va-toolbar-sep" />

        <!-- Copy -->
        <VaIconButton :disabled="annotationCount === 0" title="Copy annotations" shortcut="C" @click="$emit('copy')">
          <VaIcon name="copy" />
        </VaIconButton>

        <!-- Clear -->
        <VaIconButton :disabled="annotationCount === 0" title="Clear annotations" shortcut="Backspace" @click="onClear">
          <VaIcon name="trash" />
        </VaIconButton>

        <div class="__va-toolbar-sep" />

        <!-- Settings -->
        <VaIconButton title="Settings" @click="onOpenSettings">
          <VaIcon name="settings" />
        </VaIconButton>

        <!-- Minimize -->
        <VaIconButton title="Minimize" shortcut="Esc" @click="onDeactivate">
          <VaIcon name="close" />
        </VaIconButton>
      </div>
    </div>
  </div>
</template>
