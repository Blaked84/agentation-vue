<template>
  <button class="__va-btn" :class="`__va-btn--${variant}`" :disabled="disabled" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}>(), {
  variant: 'primary',
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
