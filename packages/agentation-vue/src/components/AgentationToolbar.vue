<script setup lang="ts">
import type { InteractionMode } from '../types'
import { onBeforeUnmount, ref } from 'vue-demi'
import { useToolbarDragSnap } from '../composables/useToolbarDragSnap'
import VaIcon from './VaIcon.vue'
import VaIconButton from './VaIconButton.vue'

defineProps<{
  mode: InteractionMode
  annotationCount: number
  isPaused: boolean
  isAreaMode: boolean
}>()

const emit = defineEmits<{
  activate: []
  deactivate: []
  copy: []
  clear: []
  togglePause: []
  toggleArea: [value: boolean]
  openSettings: [anchorEl: HTMLElement | null]
  dragStart: []
  dragEnd: []
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
  onDragStart: () => emit('dragStart'),
  onDragEnd: () => emit('dragEnd'),
})

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
  // eslint-disable-next-line no-alert
  if (confirm('Clear all annotations?'))
    emit('clear')
}

function onOpenSettings(e: MouseEvent) {
  const anchorEl = e.currentTarget instanceof HTMLElement ? e.currentTarget : null
  emit('openSettings', anchorEl)
}

onBeforeUnmount(() => {
  cleanup()
})

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
      :class="[
        `__va-toolbar--place-${placement}`,
        { '__va-toolbar--collapsed': !expanded, '__va-toolbar--dragging': isDragging },
      ]"
      :style="toolbarStyle"
    >
      <template v-if="!expanded">
        <button
          type="button"
          class="__va-toolbar-toggle"
          title="Appui long pour déplacer"
          @click="onToggleClick"
          @pointerdown="onTogglePointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
        >
          <VaIcon name="cursor" />
          <span v-if="annotationCount > 0" class="__va-toolbar-badge">{{ annotationCount }}</span>
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="__va-drag-handle"
          title="Glisser pour déplacer"
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
        <VaIconButton :active="!isAreaMode" title="Element selector" @click="emit('toggleArea', false)">
          <VaIcon name="cursor" />
        </VaIconButton>

        <!-- Area selection -->
        <VaIconButton :active="isAreaMode" title="Area selection" @click="emit('toggleArea', true)">
          <VaIcon name="area-select" />
        </VaIconButton>

        <div class="__va-toolbar-sep" />

        <!-- Pause animations -->
        <VaIconButton :active="isPaused" title="Pause animations" @click="emit('togglePause')">
          <VaIcon v-if="!isPaused" name="pause" />
          <VaIcon v-else name="play" />
        </VaIconButton>

        <div class="__va-toolbar-sep" />

        <!-- Copy -->
        <VaIconButton :disabled="annotationCount === 0" title="Copy annotations" @click="$emit('copy')">
          <VaIcon name="copy" />
        </VaIconButton>

        <!-- Clear -->
        <VaIconButton :disabled="annotationCount === 0" title="Clear annotations" @click="onClear">
          <VaIcon name="trash" />
        </VaIconButton>

        <div class="__va-toolbar-sep" />

        <!-- Settings -->
        <VaIconButton title="Settings" @click="onOpenSettings">
          <VaIcon name="settings" />
        </VaIconButton>

        <!-- Minimize -->
        <VaIconButton title="Minimize" @click="onDeactivate">
          <VaIcon name="minimize" />
        </VaIconButton>
      </template>
    </div>
  </div>
</template>
