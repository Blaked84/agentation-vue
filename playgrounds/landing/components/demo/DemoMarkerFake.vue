<script setup lang="ts">
import { VaIcon } from 'agentation-vue'

withDefaults(defineProps<{
  position?: { x: number, y: number }
  number?: number
  visible?: boolean
  pending?: boolean
}>(), {
  position: () => ({ x: 0, y: 0 }),
  number: 1,
  visible: false,
  pending: false,
})
</script>

<template>
  <div
    v-if="visible"
    class="__va-marker animate-marker-pop"
    :class="{ '__va-marker--pending': pending }"
    data-agentation-vue
    :style="{
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex: 40,
    }"
  >
    <template v-if="pending">
      <VaIcon name="plus" class="__va-marker-plus" />
    </template>
    <template v-else>
      <span class="__va-marker-number">{{ number }}</span>
    </template>
  </div>
</template>
