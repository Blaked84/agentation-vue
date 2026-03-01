<script setup lang="ts">
import { computed } from 'vue-demi'

const props = defineProps<{
  number: number
  x: number
  y: number
  isFixed?: boolean
  isStale?: boolean
  color?: string
}>()

defineEmits<{
  click: []
}>()

const markerStyle = computed(() => ({
  'left': `${props.x}%`,
  'top': `${props.y}px`,
  '--va-accent': props.color || undefined,
  'background': props.color || undefined,
}))
</script>

<template>
  <div
    class="__va-marker"
    :class="{
      '__va-marker--fixed': isFixed,
      '__va-marker--stale': isStale,
    }"
    :style="markerStyle"
    data-agentation-vue
    @click.stop="$emit('click')"
  >
    {{ number }}
  </div>
</template>
