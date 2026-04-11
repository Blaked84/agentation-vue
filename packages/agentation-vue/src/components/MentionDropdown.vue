<script setup lang="ts">
import type { MentionCandidate } from '../utils/mention'
import { computed } from 'vue-demi'

const props = defineProps<{
  open: boolean
  candidates: MentionCandidate[]
  activeIndex: number
  position: { x: number, y: number }
}>()

defineEmits<{
  select: [candidate: MentionCandidate]
}>()

const dropdownStyle = computed(() => {
  if (!props.open)
    return { display: 'none' }
  return {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
  }
})
</script>

<template>
  <div
    v-show="open && candidates.length > 0"
    class="__va-mention-dropdown"
    :style="dropdownStyle"
    role="listbox"
    data-agentation-vue
  >
    <div
      v-for="(candidate, i) in candidates"
      :key="candidate.id"
      class="__va-mention-option"
      :class="{ '__va-mention-option--active': i === activeIndex }"
      role="option"
      :aria-selected="i === activeIndex"
      @mousedown.prevent="$emit('select', candidate)"
    >
      <span class="__va-mention-option-number">{{ candidate.displayNumber }}</span>
      <span class="__va-mention-option-preview">{{ candidate.commentPreview }}</span>
    </div>
  </div>
</template>
