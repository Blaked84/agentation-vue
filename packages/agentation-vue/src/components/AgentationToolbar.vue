<script setup lang="ts">
import { ref } from 'vue-demi'
import VaIconButton from './VaIconButton.vue'

defineProps<{
  mode: string
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
  openSettings: []
}>()

const expanded = ref(false)

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

defineExpose({ expanded })
</script>

<template>
  <div
    class="__va-toolbar"
    :class="{ '__va-toolbar--collapsed': !expanded }"
    data-agentation-vue
  >
    <template v-if="!expanded">
      <button class="__va-toolbar-toggle" title="Agentation Vue" @click="onActivate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
        </svg>
        <span v-if="annotationCount > 0" class="__va-toolbar-badge">{{ annotationCount }}</span>
      </button>
    </template>

    <template v-else>
      <!-- Element selector (default mode) -->
      <VaIconButton :active="!isAreaMode" title="Element selector" @click="$emit('toggleArea', false)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
        </svg>
      </VaIconButton>

      <!-- Area selection -->
      <VaIconButton :active="isAreaMode" title="Area selection" @click="$emit('toggleArea', true)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18" opacity="0.3" />
        </svg>
      </VaIconButton>

      <div class="__va-toolbar-sep" />

      <!-- Pause animations -->
      <VaIconButton :active="isPaused" title="Pause animations" @click="$emit('togglePause')">
        <svg v-if="!isPaused" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </VaIconButton>

      <div class="__va-toolbar-sep" />

      <!-- Copy -->
      <VaIconButton :disabled="annotationCount === 0" title="Copy annotations" @click="$emit('copy')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </VaIconButton>

      <!-- Clear -->
      <VaIconButton :disabled="annotationCount === 0" title="Clear annotations" @click="onClear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        </svg>
      </VaIconButton>

      <div class="__va-toolbar-sep" />

      <!-- Settings -->
      <VaIconButton title="Settings" @click="$emit('openSettings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </VaIconButton>

      <!-- Minimize -->
      <VaIconButton title="Minimize" @click="onDeactivate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </VaIconButton>
    </template>
  </div>
</template>
