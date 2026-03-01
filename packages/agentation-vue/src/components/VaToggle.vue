<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:model-value': [value: boolean] }>()

function toggle() {
  emit('update:model-value', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    class="__va-toggle"
    :class="{ '__va-toggle--active': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    @click="toggle"
  />
</template>
