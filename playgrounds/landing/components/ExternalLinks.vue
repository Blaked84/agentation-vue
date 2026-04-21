<script setup lang="ts">
const { packageVersion: version } = useRuntimeConfig().public
</script>

<template>
  <div class="flex items-center gap-3">
    <a
      href="https://github.com/Blaked84/agentation-vue"
      class="p-2 -m-2 text-ink-400 transition-colors hover:text-ink-900"
    >
      <LandingIcon name="github" class="h-4 w-4" />
    </a>
    <a
      href="https://chromewebstore.google.com/detail/agentation-vue/jlnankjnhpjffajbcnodbohdkpoeifmc"
      class="p-2 -m-2 text-ink-400 transition-colors hover:text-ink-900"
      title="Chrome Extension"
    >
      <LandingIcon name="chrome" class="h-4 w-4" />
    </a>
    <a
      href="https://www.npmjs.com/package/agentation-vue"
      class="font-mono text-xs tabular-nums text-ink-300 transition-colors hover:text-ink-900"
    >
      v{{ version }}
    </a>
  </div>
</template>
