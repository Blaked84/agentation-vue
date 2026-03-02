<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'md' | 'sm'
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    class="moc-button"
    :class="[`moc-button--${variant}`, `moc-button--${size}`]"
    data-moc-component="MocButton"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style scoped>
.moc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 150ms ease;
}

.moc-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.moc-button--sm {
  padding: 6px 12px;
  font-size: 13px;
}

.moc-button--md {
  padding: 8px 16px;
  font-size: 14px;
}

.moc-button--primary {
  background: #3B82F6;
  color: #fff;
}

.moc-button--primary:hover:not(:disabled) {
  background: #2563EB;
}

.moc-button--secondary {
  background: #6B7280;
  color: #fff;
}

.moc-button--secondary:hover:not(:disabled) {
  background: #4B5563;
}

.moc-button--danger {
  background: #EF4444;
  color: #fff;
}

.moc-button--danger:hover:not(:disabled) {
  background: #DC2626;
}

.moc-button--outline {
  background: transparent;
  color: #6B7280;
  border: 1px solid #D1D5DB;
}

.moc-button--outline:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.moc-button--ghost {
  background: transparent;
  color: #6B7280;
}

.moc-button--ghost:hover:not(:disabled) {
  background: #F3F4F6;
}
</style>
