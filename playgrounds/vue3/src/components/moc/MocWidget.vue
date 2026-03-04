<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="moc-widget">
    <span v-if="label" class="moc-widget__label">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
.moc-widget {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
}

.moc-widget__label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
  margin-bottom: 8px;
}
</style>
