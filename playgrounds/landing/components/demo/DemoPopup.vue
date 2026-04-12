<script setup lang="ts">
import { ComponentChain } from 'agentation-vue'

withDefaults(defineProps<{
  visible?: boolean
  text?: string
  position?: { x: number, y: number }
}>(), {
  visible: false,
  text: '',
  position: () => ({ x: 0, y: 0 }),
})

const fakeChain = 'App > Dashboard > StatsCard > ActionButton'
</script>

<template>
  <div
    class="absolute z-40 transition-all duration-200"
    data-agentation-vue
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
      pointerEvents: visible ? 'auto' : 'none',
    }"
  >
    <div
      class="__va-input"
      style="position: relative; z-index: auto; min-width: 240px;"
    >
      <div class="__va-input-chain">
        <ComponentChain :chain="fakeChain" variant="light" />
      </div>
      <div
        class="__va-input-editable"
        data-placeholder="Add a comment..."
        v-text="text"
      />
      <div class="__va-input-actions">
        <div class="__va-input-actions-right">
          <button type="button" class="__va-btn __va-btn--secondary">
            Cancel
          </button>
          <button
            type="button"
            class="__va-btn __va-btn--primary"
            data-demo-submit-btn
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
