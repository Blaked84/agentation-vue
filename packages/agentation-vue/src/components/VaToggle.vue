<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:model-value': [value: boolean] }>()

function toggle() {
  emit('update:model-value', !props.modelValue)
}
</script>

<template>
  <button class="__va-toggle" :class="{ '__va-toggle--active': modelValue }" @click="toggle" />
</template>
