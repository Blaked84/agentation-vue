<script setup lang="ts">
import { VaIcon } from 'agentation-vue'

withDefaults(defineProps<{
  expanded?: boolean
  annotationCount?: number
}>(), {
  expanded: false,
  annotationCount: 0,
})
</script>

<template>
  <div class="__va-toolbar-layer" data-agentation-vue data-va-theme="dark">
    <div
      class="__va-toolbar __va-toolbar--place-bottom-right"
      :class="expanded ? '__va-toolbar--expanded' : '__va-toolbar--collapsed'"
      style="position: absolute; bottom: 16px; right: 16px; z-index: 30;"
    >
      <div class="__va-toolbar-stage __va-toolbar-stage--toggle" :aria-hidden="expanded">
        <button
          type="button"
          class="__va-toolbar-toggle"
          data-demo-toolbar-toggle
        >
          <VaIcon name="cursor" />
          <span v-if="annotationCount > 0" class="__va-toolbar-badge">{{ annotationCount }}</span>
        </button>
      </div>

      <div class="__va-toolbar-stage __va-toolbar-stage--menu" :aria-hidden="!expanded">
        <button type="button" class="__va-drag-handle">
          <span class="__va-drag-handle-dots" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </span>
        </button>

        <div class="__va-toolbar-sep" />

        <button type="button" class="__va-icon-btn __va-icon-btn--active">
          <VaIcon name="cursor" />
        </button>

        <button type="button" class="__va-icon-btn">
          <VaIcon name="area-select" />
        </button>

        <div class="__va-toolbar-sep" />

        <button type="button" class="__va-icon-btn">
          <VaIcon name="pause" />
        </button>

        <div class="__va-toolbar-sep" />

        <button
          type="button"
          class="__va-icon-btn"
          :class="{ '__va-icon-btn--disabled': annotationCount === 0 }"
          :disabled="annotationCount === 0"
          data-demo-copy-btn
        >
          <VaIcon name="copy" />
        </button>

        <button
          type="button"
          class="__va-icon-btn"
          :disabled="annotationCount === 0"
        >
          <VaIcon name="trash" />
        </button>

        <div class="__va-toolbar-sep" />

        <button type="button" class="__va-icon-btn">
          <VaIcon name="settings" />
        </button>

        <button type="button" class="__va-icon-btn">
          <VaIcon name="close" />
        </button>
      </div>
    </div>
  </div>
</template>
