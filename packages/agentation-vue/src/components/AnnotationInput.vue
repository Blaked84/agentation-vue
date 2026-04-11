<script setup lang="ts">
import type { MentionCandidate } from '../utils/mention'
import { computed, onMounted, ref, toRef } from 'vue-demi'
import { useMentionDropdown } from '../composables/useMentionDropdown'
import { hydrateMentions, serializeMentions } from '../utils/mention'
import ComponentChain from './ComponentChain.vue'
import MentionDropdown from './MentionDropdown.vue'
import VaButton from './VaButton.vue'
import VaIcon from './VaIcon.vue'

const props = defineProps<{
  position: { x: number, y: number }
  elementName?: string
  componentChain?: string
  computedStyles?: Record<string, string>
  initialComment?: string
  isEditing?: boolean
  mentionCandidates?: MentionCandidate[]
}>()

const emit = defineEmits<{
  add: [comment: string]
  cancel: []
  delete: []
}>()

const inputEl = ref<HTMLDivElement | null>(null)
const commentText = ref(props.initialComment || '')
const computedStyleEntries = computed(() => Object.entries(props.computedStyles || {}))
const candidates = toRef(props, 'mentionCandidates')
const safeCandidates = computed(() => candidates.value || [])

const mention = useMentionDropdown(inputEl, safeCandidates)

const inputStyle = computed(() => {
  const x = Math.min(props.position.x, window.innerWidth - 380)
  const y = Math.min(props.position.y + 20, window.innerHeight - 150)
  return {
    left: `${Math.max(10, x)}px`,
    top: `${Math.max(10, y)}px`,
  }
})

function autoResize() {
  const el = inputEl.value
  if (!el)
    return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function getComment(): string {
  const el = inputEl.value
  if (!el)
    return ''
  return serializeMentions(el)
}

function onInput() {
  commentText.value = getComment()
  autoResize()
  mention.checkForTrigger()
}

function onKeyDown(e: KeyboardEvent) {
  // Let the mention dropdown handle navigation keys first
  if (mention.onKeyDown(e))
    return

  if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    onAdd()
  }
  else if (e.key === 'Escape') {
    if (mention.isOpen.value) {
      e.preventDefault()
      mention.close()
    }
    else {
      emit('cancel')
    }
  }
}

function onAdd() {
  const text = getComment().trim()
  if (!text)
    return
  emit('add', text)
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

function onSelectCandidate(candidate: MentionCandidate) {
  mention.selectCandidate(candidate)
}

onMounted(() => {
  const el = inputEl.value
  if (!el)
    return

  if (props.initialComment) {
    const html = hydrateMentions(props.initialComment, safeCandidates.value)
    el.innerHTML = html
  }

  el.focus()

  // Place cursor at end
  const sel = window.getSelection()
  if (sel && el.childNodes.length > 0) {
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  autoResize()
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
        <ComponentChain v-if="componentChain" :chain="componentChain" variant="light" truncate="leaf" />
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
      <ComponentChain :chain="componentChain" variant="light" truncate="leaf" />
    </div>
    <span v-else class="__va-input-label">{{ elementName || 'Annotation' }}</span>
    <div
      ref="inputEl"
      class="__va-input-editable"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      data-placeholder="Add a comment..."
      @input="onInput"
      @keydown="onKeyDown"
      @paste="onPaste"
    />
    <MentionDropdown
      :open="mention.isOpen.value"
      :candidates="mention.filteredCandidates.value"
      :active-index="mention.activeIndex.value"
      :position="mention.dropdownPosition.value"
      @select="onSelectCandidate"
    />
    <div class="__va-input-actions">
      <button
        v-if="isEditing"
        class="__va-input-delete-btn"
        type="button"
        @click="$emit('delete')"
      >
        <VaIcon name="trash" />
      </button>
      <div class="__va-input-actions-right">
        <VaButton variant="secondary" @click="$emit('cancel')">
          Cancel
        </VaButton>
        <VaButton :disabled="!commentText.trim()" @click="onAdd">
          {{ isEditing ? 'Save' : 'Add' }}
        </VaButton>
      </div>
    </div>
  </div>
</template>
