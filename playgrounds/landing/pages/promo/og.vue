<script setup lang="ts">
/**
 * Hidden promo page — renders hero content at exactly 1200x630
 * for Open Graph / Twitter Card image capture.
 *
 * Not linked from anywhere. Captured by: node scripts/generate-promo.mjs
 */
definePageMeta({ layout: false })
</script>

<template>
  <div class="promo-canvas bg-dot-grid">
    <div class="mx-auto max-w-[1100px] px-10 pt-14 text-center">
      <p class="font-mono text-xs uppercase tracking-wider text-ink-300">
        Vue 2.7 & Vue 3
      </p>

      <h1 class="mt-2 text-[44px] leading-[1.1] tracking-tight">
        See it. Point it.
        <em class="not-italic text-ember-500">Fix it.</em>
      </h1>

      <p class="mx-auto mt-3 max-w-2xl text-balance text-base leading-relaxed text-ink-500">
        Agentation-vue turns UI annotations into instructions for your coding
        agents. Click any element, add a note, and paste the output into Claude
        Code, Cursor, or any AI tool.
      </p>

      <div class="mx-auto mt-5 max-w-4xl text-left">
        <ClientOnly>
          <DemoAnimation stop-at-phase="annotation-pinned" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
.promo-canvas {
  width: 1200px;
  height: 630px;
  overflow: hidden;
}
</style>
