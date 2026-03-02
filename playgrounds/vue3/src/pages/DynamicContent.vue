<script setup lang="ts">
import { ref } from 'vue'
import MocButton from '../components/moc/MocButton.vue'
import MocCard from '../components/moc/MocCard.vue'
import MocSection from '../components/moc/MocSection.vue'

const items = ref([
  { id: 1, text: 'First item' },
  { id: 2, text: 'Second item' },
  { id: 3, text: 'Third item' },
])
let nextId = 4

function addItem() {
  items.value.push({ id: nextId++, text: `Item #${nextId - 1}` })
}

function removeItem(id: number) {
  items.value = items.value.filter(i => i.id !== id)
}

function removeLastItem() {
  items.value.pop()
}

const showPanel = ref(false)

const asyncLoading = ref(false)
const asyncContent = ref('')

function loadAsync() {
  asyncLoading.value = true
  asyncContent.value = ''
  setTimeout(() => {
    asyncContent.value = 'This content was loaded asynchronously after a simulated delay.'
    asyncLoading.value = false
  }, 1500)
}

const accordionItems = [
  { title: 'Section One', content: 'Content for section one. This expands and collapses.' },
  { title: 'Section Two', content: 'Content for section two. Layout changes when this opens.' },
  { title: 'Section Three', content: 'Content for section three. Marker positions should update.' },
]
const openAccordions = ref<number[]>([])

function toggleAccordion(i: number) {
  const idx = openAccordions.value.indexOf(i)
  if (idx >= 0)
    openAccordions.value.splice(idx, 1)
  else openAccordions.value.push(i)
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Dynamic Content
    </h1>
    <p class="page-desc">
      Test annotations on dynamically changing content (v-for, v-if, async).
    </p>

    <MocSection title="Dynamic List (v-for)">
      <div class="list-controls">
        <MocButton variant="primary" size="sm" @click="addItem">
          Add Item
        </MocButton>
        <MocButton variant="secondary" size="sm" :disabled="items.length === 0" @click="removeLastItem">
          Remove Last
        </MocButton>
      </div>
      <ul class="item-list">
        <li v-for="item in items" :key="item.id" class="item">
          <span class="item-text">{{ item.text }}</span>
          <MocButton class="btn-remove" variant="ghost" size="sm" @click="removeItem(item.id)">
            x
          </MocButton>
        </li>
      </ul>
      <p v-if="items.length === 0" class="empty">
        No items. Click "Add Item" to add some.
      </p>
    </MocSection>

    <MocSection title="Conditional (v-if)">
      <MocButton variant="primary" size="sm" @click="showPanel = !showPanel">
        {{ showPanel ? 'Hide' : 'Show' }} Panel
      </MocButton>
      <MocCard v-if="showPanel" class="conditional-panel" title="Conditional Panel" muted>
        <p class="panel-text">
          This panel appears and disappears. Try annotating elements inside.
        </p>
        <template #footer>
          <MocButton variant="secondary">
            Panel Button
          </MocButton>
        </template>
      </MocCard>
    </MocSection>

    <MocSection title="Async Content">
      <MocButton variant="primary" size="sm" :disabled="asyncLoading" @click="loadAsync">
        {{ asyncLoading ? 'Loading...' : 'Load Content' }}
      </MocButton>
      <MocCard v-if="asyncContent" class="async-panel" title="Loaded Content" muted>
        <p class="panel-text">
          {{ asyncContent }}
        </p>
        <template #footer>
          <MocButton variant="secondary">
            Async Button
          </MocButton>
        </template>
      </MocCard>
    </MocSection>

    <MocSection title="Accordion">
      <div v-for="(item, i) in accordionItems" :key="i" class="accordion-item">
        <button class="accordion-header" @click="toggleAccordion(i)">
          {{ item.title }}
          <span>{{ openAccordions.includes(i) ? '-' : '+' }}</span>
        </button>
        <div v-if="openAccordions.includes(i)" class="accordion-body">
          {{ item.content }}
        </div>
      </div>
    </MocSection>
  </div>
</template>

<style scoped>
.page { max-width: 700px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 32px; }
.list-controls { display: flex; gap: 8px; margin-bottom: 12px; }
.item-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; }
.btn-remove { color: #ef4444; min-width: 30px; padding-left: 8px; padding-right: 8px; }
.btn-remove:hover { background: #fef2f2; }
.empty { color: #9ca3af; font-size: 13px; font-style: italic; }
.conditional-panel, .async-panel { margin-top: 12px; }
.panel-text { font-size: 13px; color: #6b7280; }
.accordion-item { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 4px; overflow: hidden; }
.accordion-header { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f9fafb; border: none; cursor: pointer; font-size: 14px; font-weight: 500; }
.accordion-header:hover { background: #f3f4f6; }
.accordion-body { padding: 12px 14px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
</style>
