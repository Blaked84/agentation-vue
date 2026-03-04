<script setup lang="ts">
defineProps<{
  id?: string
}>()
</script>

<template>
  <section :id="id" class="px-6 py-section">
    <div class="mx-auto max-w-landing">
      <slot />
    </div>
  </section>
</template>
