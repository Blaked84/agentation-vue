<script setup lang="ts">
import { ComponentChain } from 'agentation-vue'

withDefaults(defineProps<{
  visible?: boolean
  rect?: { x: number, y: number, width: number, height: number } | null
  chain?: string
}>(), {
  visible: false,
  rect: null,
  chain: '',
})
</script>

<template>
  <div
    v-if="rect"
    class="pointer-events-none absolute transition-all duration-150 ease-out"
    data-agentation-vue
    :style="{
      left: `${rect.x}px`,
      top: `${rect.y}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.98)',
    }"
  >
    <div class="__va-highlight" style="position: absolute; inset: 0; z-index: auto;">
      <div v-if="chain" class="__va-highlight-label __va-highlight-label--chain">
        <ComponentChain :chain="chain" variant="dark" />
      </div>
    </div>
  </div>
</template>
