<template>
  <section class="bg-cream-100 py-section">
    <div class="mx-auto max-w-2xl px-6">
      <p class="mb-8 font-mono text-xs uppercase tracking-wider text-ink-300">
        Get started
      </p>

      <div class="space-y-4">
        <div>
          <p class="mb-1.5 font-mono text-xs text-ink-400">
            # install
          </p>
          <UiCode>npm install agentation-vue</UiCode>
        </div>

        <div>
          <p class="mb-1.5 font-mono text-xs text-ink-400">
            # register plugin
          </p>
          <UiCode>
            <span class="text-[#cc99cd]">import</span> { AgentationVuePlugin } <span class="text-[#cc99cd]">from</span> <span class="text-[#7ec699]">'agentation-vue'</span>
            <span class="text-[#cc99cd]">import</span> <span class="text-[#7ec699]">'agentation-vue/style.css'</span>

            app.<span class="text-[#f8c555]">use</span>(AgentationVuePlugin)
          </UiCode>
        </div>

        <div>
          <p class="mb-1.5 font-mono text-xs text-ink-400">
            # add to template
          </p>
          <UiCode><span class="text-[#e06c75]">&lt;agentation-vue /&gt;</span></UiCode>
        </div>
      </div>

      <div class="mt-8 flex items-center gap-5 text-sm">
        <a
          href="https://github.com/Blaked84/agentation-vue"
          class="text-ink-500 transition-colors hover:text-ink-900"
        >
          GitHub →
        </a>
        <a
          href="https://www.npmjs.com/package/agentation-vue"
          class="text-ink-500 transition-colors hover:text-ink-900"
        >
          npm →
        </a>
        <a
          href="https://agentation.dev/schema/annotation.v1.json"
          class="text-ink-500 transition-colors hover:text-ink-900"
        >
          Schema →
        </a>
      </div>
    </div>
  </section>
</template>
