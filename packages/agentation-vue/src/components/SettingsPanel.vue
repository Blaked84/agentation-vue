<script setup lang="ts">
import type { Settings } from '../types'
import { computed, toRef } from 'vue-demi'
import { vaTooltipDirective } from '../directives/vaTooltip'
import VaIcon from './VaIcon.vue'
import VaToggle from './VaToggle.vue'

const props = defineProps<{
  settings: Settings
}>()
const emit = defineEmits<{
  update: [settings: Partial<Settings>]
}>()
const settings = toRef(props, 'settings')

const presetColors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#EAB308', '#FF5C00', '#EF4444']
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

function update(key: keyof Settings, value: any) {
  emit('update', { [key]: value })
}

function onSelectChange(key: keyof Settings, event: Event) {
  const target = event.currentTarget as HTMLSelectElement | null
  if (!target)
    return
  update(key, target.value)
}

const isDarkTheme = computed(() => {
  if (settings.value.theme === 'dark')
    return true
  if (settings.value.theme === 'light')
    return false
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-color-scheme: dark)').matches
})

const themeIcon = computed(() => (isDarkTheme.value ? 'sun' : 'moon'))
const vVaTooltip = vaTooltipDirective

function toggleTheme() {
  update('theme', isDarkTheme.value ? 'light' : 'dark')
}
</script>

<template>
  <div class="__va-settings" data-agentation-vue @click.stop>
    <div class="__va-settings-top">
      <span class="__va-settings-title">Agentation vue</span>
      <button v-va-tooltip="'Toggle theme'" type="button" class="__va-theme-toggle" @click="toggleTheme">
        <VaIcon :name="themeIcon" />
      </button>
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Output Detail</span>
      <select :value="settings.outputDetail" @change="onSelectChange('outputDetail', $event)">
        <option value="standard">
          Standard
        </option>
        <option value="forensic">
          Forensic
        </option>
      </select>
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Vue component tree</span>
      <VaToggle
        :model-value="settings.showComponentTree"
        aria-label="Vue component tree"
        @update:model-value="update('showComponentTree', $event)"
      />
    </div>

    <div class="__va-settings-divider" />

    <div class="__va-settings-row __va-settings-row--stack">
      <span class="__va-settings-label">Marker Color</span>
      <div class="__va-color-swatches">
        <button
          v-for="color in presetColors"
          :key="color"
          type="button"
          class="__va-color-swatch"
          :class="{ '__va-color-swatch--active': settings.markerColor === color }"
          :style="{ background: color }"
          @click="update('markerColor', color)"
        />
      </div>
    </div>

    <div class="__va-settings-divider" />

    <div class="__va-settings-row">
      <span class="__va-settings-label">Clear on copy/send</span>
      <VaToggle
        :model-value="settings.clearAfterCopy"
        aria-label="Clear on copy/send"
        @update:model-value="update('clearAfterCopy', $event)"
      />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Block page interactions</span>
      <VaToggle
        :model-value="settings.blockPageInteractions"
        aria-label="Block page interactions"
        @update:model-value="update('blockPageInteractions', $event)"
      />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Auto-hide floating button</span>
      <VaToggle
        :model-value="settings.autoHideToolbar"
        aria-label="Auto-hide floating button"
        @update:model-value="update('autoHideToolbar', $event)"
      />
    </div>

    <div class="__va-settings-divider" />

    <div class="__va-settings-row">
      <span class="__va-settings-label">Activate with double tap</span>
      <select :value="settings.activationKey" @change="onSelectChange('activationKey', $event)">
        <option value="none">
          Off
        </option>
        <option value="Meta">
          {{ isMac ? '&#8984; Cmd' : 'Ctrl' }}
        </option>
        <option value="Alt">
          {{ isMac ? '&#8997; Option' : 'Alt' }}
        </option>
        <option value="Shift">
          Shift
        </option>
      </select>
    </div>
  </div>
</template>
