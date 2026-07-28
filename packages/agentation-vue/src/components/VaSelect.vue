<script setup lang="ts">
import { computed } from 'vue-demi'
import VaIcon from './VaIcon.vue'

export interface VaSelectOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: VaSelectOption[]
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:model-value': [value: string] }>()

// A native select always sizes itself to its widest option. Rendering the
// selected label into a hidden in-flow sizer lets the field track the current
// selection instead, with the select overlaid on top of it.
const selectedLabel = computed(
  () => props.options.find(option => option.value === props.modelValue)?.label ?? '',
)

function onChange(event: Event) {
  const target = event.currentTarget as HTMLSelectElement | null
  if (target)
    emit('update:model-value', target.value)
}
</script>

<template>
  <span class="__va-select">
    <span class="__va-select-sizer" aria-hidden="true">{{ selectedLabel }}</span>
    <select :value="modelValue" :aria-label="ariaLabel" @change="onChange">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <VaIcon name="chevron-down" class="__va-select-chevron" />
  </span>
</template>
