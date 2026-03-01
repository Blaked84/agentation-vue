<template>
  <div class="page">
    <h1 class="page-title">Dynamic Content</h1>
    <p class="page-desc">Test annotations on dynamically changing content (v-for, v-if, async).</p>

    <section class="section">
      <h2>Dynamic List (v-for)</h2>
      <div class="list-controls">
        <button class="btn btn-primary btn-sm" @click="addItem">Add Item</button>
        <button class="btn btn-secondary btn-sm" @click="removeLastItem" :disabled="items.length === 0">Remove Last</button>
      </div>
      <ul class="item-list">
        <li v-for="item in items" :key="item.id" class="item">
          <span class="item-text">{{ item.text }}</span>
          <button class="btn-remove" @click="removeItem(item.id)">x</button>
        </li>
      </ul>
      <p v-if="items.length === 0" class="empty">No items. Click "Add Item" to add some.</p>
    </section>

    <section class="section">
      <h2>Conditional (v-if)</h2>
      <button class="btn btn-primary btn-sm" @click="showPanel = !showPanel">
        {{ showPanel ? 'Hide' : 'Show' }} Panel
      </button>
      <div v-if="showPanel" class="conditional-panel">
        <h3>Conditional Panel</h3>
        <p>This panel appears and disappears. Try annotating elements inside.</p>
        <button class="btn btn-secondary">Panel Button</button>
      </div>
    </section>

    <section class="section">
      <h2>Async Content</h2>
      <button class="btn btn-primary btn-sm" @click="loadAsync" :disabled="asyncLoading">
        {{ asyncLoading ? 'Loading...' : 'Load Content' }}
      </button>
      <div v-if="asyncContent" class="async-panel">
        <h3>Loaded Content</h3>
        <p>{{ asyncContent }}</p>
        <button class="btn btn-secondary">Async Button</button>
      </div>
    </section>

    <section class="section">
      <h2>Accordion</h2>
      <div v-for="(item, i) in accordionItems" :key="i" class="accordion-item">
        <button class="accordion-header" @click="toggleAccordion(i)">
          {{ item.title }}
          <span>{{ openAccordions.includes(i) ? '-' : '+' }}</span>
        </button>
        <div v-if="openAccordions.includes(i)" class="accordion-body">
          {{ item.content }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  if (idx >= 0) openAccordions.value.splice(idx, 1)
  else openAccordions.value.push(i)
}
</script>

<style scoped>
.page { max-width: 700px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 32px; }
.section { margin-bottom: 32px; }
.section h2 { font-size: 18px; margin-bottom: 12px; }
.btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; border: none; font-weight: 500; }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-primary { background: #3B82F6; color: white; }
.btn-secondary { background: #6B7280; color: white; }
.list-controls { display: flex; gap: 8px; margin-bottom: 12px; }
.item-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; }
.btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; padding: 2px 6px; border-radius: 4px; }
.btn-remove:hover { background: #fef2f2; }
.empty { color: #9ca3af; font-size: 13px; font-style: italic; }
.conditional-panel, .async-panel { margin-top: 12px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
.conditional-panel h3, .async-panel h3 { font-size: 15px; margin-bottom: 8px; }
.conditional-panel p, .async-panel p { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
.accordion-item { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 4px; overflow: hidden; }
.accordion-header { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f9fafb; border: none; cursor: pointer; font-size: 14px; font-weight: 500; }
.accordion-header:hover { background: #f3f4f6; }
.accordion-body { padding: 12px 14px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
</style>
