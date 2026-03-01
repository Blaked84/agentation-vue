<template>
  <button class="__va-toggle" :class="{ '__va-toggle--active': modelValue }" @click="toggle"></button>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>
