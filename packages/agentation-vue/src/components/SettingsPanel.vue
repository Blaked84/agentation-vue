<script setup lang="ts">
import type { Settings } from '../types'
import VaToggle from './VaToggle.vue'

defineProps<{
  settings: Settings
}>()

const emit = defineEmits<{
  update: [settings: Partial<Settings>]
}>()

const presetColors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#EAB308', '#FF5C00', '#EF4444']

function update(key: keyof Settings, value: any) {
  emit('update', { [key]: value })
}

function onSelectChange(key: keyof Settings, event: Event) {
  update(key, (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="__va-settings" data-agentation-vue @click.stop>
    <div class="__va-settings-title">
      Settings
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
      <span class="__va-settings-label">Marker Color</span>
      <div class="__va-color-swatches">
        <button
          v-for="color in presetColors"
          :key="color"
          class="__va-color-swatch"
          :class="{ '__va-color-swatch--active': settings.markerColor === color }"
          :style="{ background: color }"
          @click="update('markerColor', color)"
        />
      </div>
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Block page interactions</span>
      <VaToggle :model-value="settings.blockPageInteractions" @update:model-value="update('blockPageInteractions', $event)" />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Clear after copy</span>
      <VaToggle :model-value="settings.clearAfterCopy" @update:model-value="update('clearAfterCopy', $event)" />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Vue component tree</span>
      <VaToggle :model-value="settings.showComponentTree" @update:model-value="update('showComponentTree', $event)" />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Theme</span>
      <select :value="settings.theme" @change="onSelectChange('theme', $event)">
        <option value="auto">
          Auto
        </option>
        <option value="light">
          Light
        </option>
        <option value="dark">
          Dark
        </option>
      </select>
    </div>
  </div>
</template>
