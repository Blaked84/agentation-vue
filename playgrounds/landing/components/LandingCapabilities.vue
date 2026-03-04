<script setup lang="ts">
const capabilities = [
  {
    title: 'Vue component tree',
    description: 'Auto-detects the full component hierarchy alongside CSS selectors.',
  },
  {
    title: 'Area & multi-select',
    description: 'Shift+drag for multi-element. Alt+drag for screen regions.',
  },
  {
    title: 'Forensic mode',
    description: 'Captures bounding boxes, computed styles, CSS classes, accessibility info.',
  },
]
</script>

<template>
  <section class="py-12">
    <div class="mx-auto max-w-2xl px-6 space-y-6">
      <div v-for="cap in capabilities" :key="cap.title">
        <h3 class="font-body text-sm font-semibold text-ink-900">
          {{ cap.title }}
        </h3>
        <p class="mt-1 text-sm text-ink-500">
          {{ cap.description }}
        </p>
      </div>
    </div>
  </section>
</template>
