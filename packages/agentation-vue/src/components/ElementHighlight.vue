<template>
  <div
    v-if="visible && rect"
    class="__va-highlight"
    :style="highlightStyle"
    data-agentation-vue
  >
    <div v-if="componentChain" class="__va-highlight-label __va-highlight-label--chain">
      <ComponentChain :chain="componentChain" variant="dark" />
    </div>
    <span v-else class="__va-highlight-label">{{ elementName }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue-demi'
import type { BoundingBox } from '../types'
import ComponentChain from './ComponentChain.vue'

const props = defineProps<{
  rect: BoundingBox | null
  elementName: string
  visible: boolean
  componentChain?: string
}>()

const highlightStyle = computed(() => {
  if (!props.rect) return {}
  return {
    left: `${props.rect.x}px`,
    top: `${props.rect.y}px`,
    width: `${props.rect.width}px`,
    height: `${props.rect.height}px`,
  }
})
</script>
