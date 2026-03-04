<script setup lang="ts">
defineProps<{
  variant?: 'ember' | 'neutral'
}>()
</script>

<template>
  <span
    class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium font-body"
    :class="variant === 'neutral'
      ? 'bg-cream-200 text-ink-700'
      : 'bg-ember-50 text-ember-600'"
  >
    <slot />
  </span>
</template>
