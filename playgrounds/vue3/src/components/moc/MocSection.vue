<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="moc-section" data-moc-component="MocSection">
    <h2 class="moc-section__title">
      {{ title }}
    </h2>
    <div class="moc-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.moc-section {
  margin-bottom: 32px;
}

.moc-section__title {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
}

.moc-section__body {
  display: block;
}
</style>
