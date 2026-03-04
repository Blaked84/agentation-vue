<script setup lang="ts">
defineProps<{
  url?: string
}>()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-cream-300 shadow-va-deep">
    <!-- Browser chrome -->
    <div class="flex items-center gap-2 border-b border-cream-300 bg-cream-200 px-4 py-2.5">
      <div class="flex gap-1.5">
        <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span class="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>
      <div class="flex-1 rounded-full bg-cream-100 px-3 py-1 text-center font-mono text-xs text-ink-500">
        {{ url || 'localhost:3000' }}
      </div>
    </div>

    <!-- Content area -->
    <div class="bg-white">
      <slot />
    </div>
  </div>
</template>
