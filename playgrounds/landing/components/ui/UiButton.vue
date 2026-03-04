<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  as?: 'button' | 'a'
  href?: string
}>()
</script>

<template>
  <component
    :is="as === 'a' ? 'a' : 'button'"
    :href="href"
    class="inline-flex items-center justify-center gap-2 font-body font-semibold transition-all duration-150 ease-spring cursor-pointer"
    :class="[
      variant === 'secondary'
        ? 'bg-cream-200 hover:bg-cream-300 text-ink-700 border border-cream-300'
        : 'bg-ember-500 hover:bg-ember-600 text-white shadow-va hover:shadow-va-hover',
      size === 'sm'
        ? 'px-4 py-2 text-sm rounded-va'
        : 'px-6 py-3 text-base rounded-va',
    ]"
  >
    <slot />
  </component>
</template>
