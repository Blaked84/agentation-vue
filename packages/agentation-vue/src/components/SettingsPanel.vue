<template>
  <div class="__va-settings" data-agentation-vue @click.stop>
    <div class="__va-settings-title">Settings</div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Output Detail</span>
      <select :value="settings.outputDetail" @change="update('outputDetail', $event.target.value)">
        <option value="standard">Standard</option>
        <option value="forensic">Forensic</option>
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
        ></button>
      </div>
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Block page interactions</span>
      <VaToggle :model-value="settings.blockPageInteractions" @update:modelValue="update('blockPageInteractions', $event)" />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Clear after copy</span>
      <VaToggle :model-value="settings.clearAfterCopy" @update:modelValue="update('clearAfterCopy', $event)" />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Vue component tree</span>
      <VaToggle :model-value="settings.showComponentTree" @update:modelValue="update('showComponentTree', $event)" />
    </div>

    <div class="__va-settings-row">
      <span class="__va-settings-label">Theme</span>
      <select :value="settings.theme" @change="update('theme', $event.target.value)">
        <option value="auto">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Settings } from '../types'
import VaToggle from './VaToggle.vue'

const presetColors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#EAB308', '#FF5C00', '#EF4444']

const props = defineProps<{
  settings: Settings
}>()

const emit = defineEmits<{
  update: [settings: Partial<Settings>]
}>()

function update(key: keyof Settings, value: any) {
  emit('update', { [key]: value })
}
</script>
