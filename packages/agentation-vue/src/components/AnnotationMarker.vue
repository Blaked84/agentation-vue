<script setup lang="ts">
import { computed } from 'vue-demi'
import VaIcon from './VaIcon.vue'

const props = defineProps<{
  number: number
  x: number
  y: number
  isFixed?: boolean
  isStale?: boolean
  isPending?: boolean
}>()

defineEmits<{
  click: []
}>()

const markerStyle = computed(() => ({
  left: `${props.x}%`,
  top: `${props.y}px`,
}))
</script>

<template>
  <div
    class="__va-marker"
    :class="{
      '__va-marker--fixed': isFixed,
      '__va-marker--stale': isStale,
      '__va-marker--pending': isPending,
    }"
    :style="markerStyle"
    data-agentation-vue
    @click.stop="$emit('click')"
  >
    <template v-if="isPending">
      <VaIcon name="plus" class="__va-marker-plus" />
    </template>
    <template v-else>
      <span class="__va-marker-number">{{ number }}</span>
      <VaIcon name="pencil" class="__va-marker-pencil" />
    </template>
  </div>
</template>
