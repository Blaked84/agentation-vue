<script setup lang="ts">
import { ref } from 'vue-demi'
import VaIcon from './VaIcon.vue'
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
      <button type="button" class="__va-toolbar-toggle" title="Agentation Vue" @click="onActivate">
        <VaIcon name="cursor" />
        <span v-if="annotationCount > 0" class="__va-toolbar-badge">{{ annotationCount }}</span>
      </button>
    </template>

    <template v-else>
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
      <VaIconButton title="Settings" @click="emit('openSettings')">
        <VaIcon name="settings" />
      </VaIconButton>

      <!-- Minimize -->
      <VaIconButton title="Minimize" @click="onDeactivate">
        <VaIcon name="minimize" />
      </VaIconButton>
    </template>
  </div>
</template>
