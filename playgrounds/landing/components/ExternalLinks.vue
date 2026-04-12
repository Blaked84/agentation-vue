<script setup lang="ts">
const { packageVersion: version } = useRuntimeConfig().public
</script>

<template>
  <div class="flex items-center gap-3">
    <a
      href="https://github.com/Blaked84/agentation-vue"
      class="text-ink-400 transition-colors hover:text-ink-900"
    >
      <LandingIcon name="github" class="h-4 w-4" />
    </a>
    <a
      href="https://www.npmjs.com/package/agentation-vue"
      class="font-mono text-xs text-ink-300 transition-colors hover:text-ink-900"
    >
      v{{ version }}
    </a>
  </div>
</template>
