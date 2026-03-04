<script setup lang="ts">
import type { BoundingBox } from '../types'
import { computed } from 'vue-demi'
import { boundingBoxToStyle } from '../utils/style'
import ComponentChain from './ComponentChain.vue'

const props = defineProps<{
  rect: BoundingBox | null
  elementName: string
  visible: boolean
  componentChain?: string
}>()

const highlightStyle = computed(() => {
  if (!props.rect)
    return {}
  return boundingBoxToStyle(props.rect)
})
</script>

<template>
  <div
    v-if="visible && rect"
    class="__va-highlight"
    :style="highlightStyle"
    data-agentation-vue
  >
    <div v-if="componentChain" class="__va-highlight-label __va-highlight-label--chain">
      <ComponentChain :chain="componentChain" variant="dark" truncate="auto" />
    </div>
    <span v-else class="__va-highlight-label">{{ elementName }}</span>
  </div>
</template>
