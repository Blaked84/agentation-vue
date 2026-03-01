<template>
  <button class="__va-icon-btn" :class="{ '__va-icon-btn--active': active }" :disabled="disabled" :title="title" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  active?: boolean
  disabled?: boolean
  title?: string
}>(), {
  active: false,
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
