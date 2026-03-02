<script setup lang="ts">
import { computed, onMounted, ref } from 'vue-demi'
import ComponentChain from './ComponentChain.vue'
import VaButton from './VaButton.vue'

const props = defineProps<{
  position: { x: number, y: number }
  elementName?: string
  componentChain?: string
  computedStyles?: Record<string, string>
}>()

const emit = defineEmits<{
  add: [comment: string]
  cancel: []
}>()

const comment = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const computedStyleEntries = computed(() => Object.entries(props.computedStyles || {}))

const inputStyle = computed(() => {
  const x = Math.min(props.position.x, window.innerWidth - 380)
  const y = Math.min(props.position.y + 20, window.innerHeight - 150)
  return {
    left: `${Math.max(10, x)}px`,
    top: `${Math.max(10, y)}px`,
  }
})

function onAdd() {
  const text = comment.value.trim()
  if (!text)
    return
  emit('add', text)
}

onMounted(() => {
  inputEl.value?.focus()
})
</script>

<template>
  <div
    class="__va-input"
    :style="inputStyle"
    data-agentation-vue
    @click.stop
    @mousedown.stop
  >
    <details
      v-if="computedStyleEntries.length > 0"
      class="__va-input-styles"
      @click.stop
      @mousedown.stop
    >
      <summary class="__va-input-styles-summary">
        <ComponentChain v-if="componentChain" :chain="componentChain" variant="light" />
        <span v-else class="__va-input-styles-element">{{ elementName || 'Annotation' }}</span>
      </summary>
      <div class="__va-input-styles-block">
        <div
          v-for="[prop, value] in computedStyleEntries"
          :key="prop"
          class="__va-input-style-line"
        >
          <span class="__va-input-style-prop">{{ prop }}</span>: <span class="__va-input-style-value">{{ value }}</span>;
        </div>
      </div>
    </details>
    <div v-else-if="componentChain" class="__va-input-chain">
      <ComponentChain :chain="componentChain" variant="light" />
    </div>
    <span v-else class="__va-input-label">{{ elementName || 'Annotation' }}</span>
    <input
      ref="inputEl"
      v-model="comment"
      placeholder="Add a comment..."
      @keydown.enter="onAdd"
      @keydown.escape="$emit('cancel')"
    >
    <div class="__va-input-actions">
      <VaButton variant="secondary" @click="$emit('cancel')">
        Cancel
      </VaButton>
      <VaButton :disabled="!comment.trim()" @click="onAdd">
        Add
      </VaButton>
    </div>
  </div>
</template>
