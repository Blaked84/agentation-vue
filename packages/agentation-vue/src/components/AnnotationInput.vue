<template>
  <div
    class="__va-input"
    :style="inputStyle"
    data-agentation-vue
    @click.stop
    @mousedown.stop
  >
    <div v-if="componentChain" class="__va-input-chain">
      <ComponentChain :chain="componentChain" variant="light" />
    </div>
    <span v-else class="__va-input-label">{{ elementName || 'Annotation' }}</span>
    <input
      ref="inputEl"
      v-model="comment"
      placeholder="Add a comment..."
      @keydown.enter="onAdd"
      @keydown.escape="$emit('cancel')"
    />
    <div class="__va-input-actions">
      <VaButton variant="secondary" @click="$emit('cancel')">Cancel</VaButton>
      <VaButton :disabled="!comment.trim()" @click="onAdd">Add</VaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue-demi'
import ComponentChain from './ComponentChain.vue'
import VaButton from './VaButton.vue'

const props = defineProps<{
  position: { x: number; y: number }
  elementName?: string
  componentChain?: string
}>()

const emit = defineEmits<{
  add: [comment: string]
  cancel: []
}>()

const comment = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

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
  if (!text) return
  emit('add', text)
}

onMounted(() => {
  inputEl.value?.focus()
})
</script>
