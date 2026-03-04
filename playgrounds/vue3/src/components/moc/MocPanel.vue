<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="moc-panel">
    <h4 v-if="title" class="moc-panel__title">
      {{ title }}
    </h4>
    <div class="moc-panel__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.moc-panel {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.moc-panel__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #374151;
}

.moc-panel__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
