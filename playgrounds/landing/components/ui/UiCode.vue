<script setup lang="ts">
defineProps<{
  lang?: string
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-va-lg bg-[#1e1e1e] p-4 font-mono text-sm leading-relaxed text-cream-100">
    <pre class="m-0"><code><slot /></code></pre>
  </div>
</template>
