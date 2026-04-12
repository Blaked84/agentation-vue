<script setup lang="ts">
/**
 * Hidden promo page — renders the hero content at exactly 1280x800
 * for Chrome Web Store screenshot capture.
 *
 * Not linked from anywhere. Captured by: pnpm generate:promo
 */
definePageMeta({ layout: false })
</script>

<template>
  <div class="promo-canvas bg-dot-grid">
    <div class="mx-auto max-w-landing px-6 pt-14 text-center">
      <p class="font-mono text-xs uppercase tracking-wider text-ink-300">
        Vue 2.7 & Vue 3
      </p>

      <h1
        class="mt-4 text-5xl leading-[1.1] tracking-tight"
      >
        See it. Point it.
        <em class="not-italic text-ember-500">Fix it.</em>
      </h1>

      <p
        class="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-500"
      >
        Agentation-vue turns UI annotations into instructions for your coding
        agents. Click any element, add a note, and paste the output into Claude
        Code, Cursor, or any AI tool.
      </p>

      <div class="mx-auto mt-8 max-w-4xl text-left">
        <ClientOnly>
          <DemoAnimation stop-at-phase="annotation-pinned" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
.promo-canvas {
  width: 1280px;
  height: 800px;
  overflow: hidden;
}
</style>
