<script setup lang="ts">
import { computed } from 'vue-demi'
import { vaTooltipDirective } from '../directives/vaTooltip'

const props = withDefaults(defineProps<{
  active?: boolean
  disabled?: boolean
  title?: string
  shortcut?: string
}>(), {
  active: false,
  disabled: false,
})

const vVaTooltip = vaTooltipDirective
const tooltipValue = computed(() => {
  if (!props.title)
    return null
  return {
    text: props.title,
    shortcut: props.shortcut,
    disabled: props.disabled,
  }
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    v-va-tooltip="tooltipValue"
    type="button"
    class="__va-icon-btn"
    :class="{ '__va-icon-btn--active': active }"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
