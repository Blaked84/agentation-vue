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

      <h1
        class="mt-4 text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl lg:text-6xl"
      >
        See it. Point it.
        <em class="typewriter relative not-italic text-ember-500"><span class="typewriter-text">Fix it.</span><span class="terminal-cursor" /></em>
      </h1>

      <p
        class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-balance text-ink-500 md:text-lg"
      >
        Agentation-vue turns UI annotations into instructions for your coding
        agents. Click any element, add a note, and paste the output into Claude
        Code, Cursor, or any AI tool.
      </p>

      <div class="mx-auto mt-10 max-w-4xl text-left">
        <div class="demo-zoom">
          <ClientOnly>
            <DemoAnimation />
          </ClientOnly>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center gap-5">
        <a
          href="https://chromewebstore.google.com/detail/agentation-vue/jlnankjnhpjffajbcnodbohdkpoeifmc"
          class="group inline-flex items-center gap-2.5 rounded-va-lg border border-ember-500 bg-ember-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-150 ease-spring hover:bg-ember-600 hover:shadow-md active:scale-[0.96]"
        >
          <LandingIcon name="chrome" class="h-5 w-5" />
          <span>Add to Chrome</span>
        </a>

        <div class="flex items-center gap-3 text-xs text-ink-300">
          <span class="h-px w-8 bg-ink-300/30" />
          <span class="font-mono uppercase tracking-wider">or add to your Vue codebase</span>
          <span class="h-px w-8 bg-ink-300/30" />
        </div>

        <button
          class="group flex items-center gap-3 rounded-va border border-ink-700 bg-ink-900 px-5 py-2.5 font-mono text-sm text-[#d4d4d4] transition-[background-color,transform] duration-150 ease-spring hover:bg-ink-700 active:scale-[0.96]"
          @click="copyInstall"
        >
          <span class="select-none text-ink-500">$ </span>
          <span>npm install agentation-vue</span>
          <LandingIcon :name="copied ? 'check' : 'copy'" class="h-4 w-4 text-ink-500 transition-colors group-hover:text-[#d4d4d4]" />
        </button>
      </div>

      <p class="mt-10 mb-2 font-mono text-xs tracking-wide text-ink-300">
        Unofficial Vue.js port of
        <a
          href="https://agentation.dev"
          class="underline decoration-ink-300/40 underline-offset-2 transition-colors hover:text-ink-600"
        >agentation.dev</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.demo-zoom {
  zoom: 0.55;
}
@media (min-width: 640px) {
  .demo-zoom {
    zoom: 0.9;
  }
}
@media (min-width: 768px) {
  .demo-zoom {
    zoom: 1;
  }
}

.typewriter {
  font-family: 'Inconsolata', monospace;
}

.typewriter-text {
  display: inline-block;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
  animation: type 0.7s steps(7) 0.6s forwards;
}

.terminal-cursor {
  position: absolute;
  display: inline-block;
  width: 0.5ch;
  height: 0.85em;
  margin-left: 2px;
  vertical-align: baseline;
  background-color: currentColor;
  opacity: 0;
  animation:
    cursor-on 0s 0.4s forwards,
    blink 1s step-end 0.4s 4,
    cursor-off 0s 4.4s forwards;
}

@keyframes type {
  to { width: 7ch; }
}

@keyframes cursor-on {
  to { opacity: 1; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes cursor-off {
  to { opacity: 0; }
}
</style>
