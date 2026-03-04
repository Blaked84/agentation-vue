<script setup lang="ts">
const copied = ref(false)

function copyInstall() {
  navigator.clipboard.writeText('npm install agentation-vue')
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <section class="bg-dot-grid pt-20 pb-12 md:pt-28">
    <div class="mx-auto max-w-landing px-6 text-center">
      <p class="font-mono text-xs uppercase tracking-wider text-ink-300">
        Vue 2.7 & Vue 3
      </p>

      <h1 class="mt-4 text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
        See it. Point it. <em class="not-italic italic text-ember-500">Fix it.</em>
      </h1>

      <p class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-500 md:text-lg">
        Agentation-vue turns UI annotations into instructions for your coding agents.
        Click any element, add a note, and paste the output into Claude Code, Cursor, or any AI tool.
      </p>

      <div class="mx-auto mt-10 max-w-4xl text-left">
        <ClientOnly>
          <DemoAnimation />
        </ClientOnly>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          class="group flex items-center gap-3 rounded-va border border-ink-700 bg-ink-900 px-5 py-3 font-mono text-sm text-[#d4d4d4] transition-all duration-150 ease-spring hover:bg-ink-700"
          @click="copyInstall"
        >
          <span class="select-none text-ink-500">$ </span>
          <span>npm install agentation-vue</span>
          <svg
            class="h-4 w-4 text-ink-500 transition-colors group-hover:text-[#d4d4d4]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect v-if="!copied" x="9" y="9" width="13" height="13" rx="2" />
            <path v-if="!copied" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            <path v-if="copied" d="M20 6L9 17l-5-5" />
          </svg>
        </button>

        <a
          href="https://github.com/Blaked84/agentation-vue"
          class="text-sm text-ink-500 transition-colors hover:text-ink-900"
        >
          GitHub →
        </a>
      </div>

      <p class="mt-6 text-xs text-ink-300">
        Unofficial Vue.js port of
        <a href="https://agentation.dev" class="underline decoration-ink-300/50 underline-offset-2 transition-colors hover:text-ink-500">agentation.dev</a>
      </p>
    </div>
  </section>
</template>
