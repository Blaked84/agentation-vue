<script setup lang="ts">
import type { Settings } from '../types'
import { computed, toRef } from 'vue-demi'
import { VA_VERSION } from '../constants'
import { vaTooltipDirective } from '../directives/vaTooltip'
import VaIcon from './VaIcon.vue'
import VaSelect from './VaSelect.vue'
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

function onToggleRowClick(key: keyof Settings, event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.__va-toggle'))
    return
  update(key, !settings.value[key])
}

const outputDetailOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'forensic', label: 'Forensic' },
]

const scopeOptions = [
  { value: 'domain', label: 'Domain' },
  { value: 'domain-port', label: 'Domain and port' },
  { value: 'path', label: 'Path' },
]

const modifierOptions = computed(() => [
  { value: 'none', label: 'Off' },
  { value: 'Meta', label: isMac ? '⌘ Cmd' : 'Ctrl' },
  { value: 'Alt', label: isMac ? '⌥ Option' : 'Alt' },
  { value: 'Shift', label: '⇧ Shift' },
])

const peekOptions = computed(() => [
  ...modifierOptions.value,
  { value: 'Control', label: isMac ? '⌃ Control' : 'Ctrl' },
])

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
      <span class="__va-settings-title">Agentation vue <span class="__va-settings-version">v{{ VA_VERSION }}</span></span>
      <button v-va-tooltip="'Toggle theme'" type="button" class="__va-theme-toggle" @click="toggleTheme">
        <VaIcon :name="themeIcon" />
      </button>
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Output Detail</span>
      <VaSelect
        :model-value="settings.outputDetail"
        :options="outputDetailOptions"
        aria-label="Output Detail"
        @update:model-value="update('outputDetail', $event)"
      />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Annotation scope</span>
      <VaSelect
        :model-value="settings.scope"
        :options="scopeOptions"
        aria-label="Annotation scope"
        @update:model-value="update('scope', $event)"
      />
    </div>

    <div class="__va-settings-row __va-settings-row--clickable" @click="onToggleRowClick('showComponentTree', $event)">
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

    <div class="__va-settings-row __va-settings-row--clickable" @click="onToggleRowClick('clearAfterCopy', $event)">
      <span class="__va-settings-label">Clear After Copy</span>
      <VaToggle
        :model-value="settings.clearAfterCopy"
        aria-label="Clear After Copy"
        @update:model-value="update('clearAfterCopy', $event)"
      />
    </div>

    <div class="__va-settings-row __va-settings-row--clickable" @click="onToggleRowClick('blockPageInteractions', $event)">
      <span class="__va-settings-label">Block page interactions</span>
      <VaToggle
        :model-value="settings.blockPageInteractions"
        aria-label="Block page interactions"
        @update:model-value="update('blockPageInteractions', $event)"
      />
    </div>

    <div class="__va-settings-row __va-settings-row--clickable" @click="onToggleRowClick('autoHideToolbar', $event)">
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
      <VaSelect
        :model-value="settings.activationKey"
        :options="modifierOptions"
        aria-label="Activate with double tap"
        @update:model-value="update('activationKey', $event)"
      />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Peek inspect (hold key)</span>
      <VaSelect
        :model-value="settings.peekKey"
        :options="peekOptions"
        aria-label="Peek inspect (hold key)"
        @update:model-value="update('peekKey', $event)"
      />
    </div>
  </div>
</template>
