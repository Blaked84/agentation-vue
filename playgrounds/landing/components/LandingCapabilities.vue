<script setup lang="ts">
import type { LandingIconName } from '../icons'

const capabilities: { title: string, description: string, icon: LandingIconName }[] = [
  {
    title: 'Vue component tree',
    description: 'Auto-detects the full component hierarchy alongside CSS selectors.',
    icon: 'component-tree',
  },
  {
    title: 'Keyboard shortcuts',
    description: 'Double-tap a modifier key to toggle inspect mode. Hold it to peek at elements without leaving your flow.',
    icon: 'keyboard',
  },
  {
    title: 'Area & multi-select',
    description: 'Shift+drag for multi-element. Alt+drag for screen regions.',
    icon: 'area-select',
  },
  {
    title: 'Forensic mode',
    description: 'Captures bounding boxes, computed styles, CSS classes, accessibility info.',
    icon: 'search',
  },
]
</script>

<template>
  <section class="py-12">
    <div class="mx-auto max-w-2xl px-6 space-y-6">
      <div v-for="cap in capabilities" :key="cap.title" class="flex gap-3">
        <LandingIcon :name="cap.icon" class="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-300" />
        <div>
          <h3 class="font-body text-sm font-semibold text-ink-900">
            {{ cap.title }}
          </h3>
          <p class="mt-1 text-sm text-pretty text-ink-500">
            {{ cap.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
