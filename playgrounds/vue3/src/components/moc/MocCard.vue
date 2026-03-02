<script setup lang="ts">
interface Props {
  title?: string
  muted?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  muted: false,
})
</script>

<template>
  <article class="moc-card" :class="{ 'moc-card--muted': muted }" data-moc-component="MocCard">
    <header v-if="title || $slots.header" class="moc-card__header">
      <slot name="header">
        <h3 class="moc-card__title">
          {{ title }}
        </h3>
      </slot>
    </header>

    <div class="moc-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="moc-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<style scoped>
.moc-card {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.moc-card--muted {
  background: #F9FAFB;
}

.moc-card__header {
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.moc-card__title {
  font-size: 14px;
  font-weight: 600;
}

.moc-card__body {
  padding: 16px;
  font-size: 13px;
  color: #6B7280;
}

.moc-card__footer {
  padding: 12px 16px;
  border-top: 1px solid #E5E7EB;
}
</style>
