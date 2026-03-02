<script setup lang="ts">
defineProps<{
  title: string
}>()

const links = [
  { to: '/', label: 'Basic Elements' },
  { to: '/nested', label: 'Nested Layout' },
  { to: '/animated', label: 'Animated' },
  { to: '/dynamic', label: 'Dynamic Content' },
  { to: '/iframes', label: 'Iframes' },
  { to: '/fixed', label: 'Fixed/Sticky' },
]
</script>

<template>
  <nav class="app-nav" data-moc-component="MocSidebarNav">
    <h2 class="app-title">
      {{ title }}
    </h2>
    <router-link
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="nav-link"
    >
      {{ link.label }}
    </router-link>
  </nav>
</template>

<style scoped>
.app-nav {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: fixed;
  top: 0;
  bottom: 0;
  overflow-y: auto;
}

.app-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #FF5C00;
}

.nav-link {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  color: #555;
  text-decoration: none;
  font-size: 14px;
  transition: all 150ms;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #1a1a1a;
}

.nav-link.router-link-active,
.router-link-active {
  background: #fff3ed;
  color: #FF5C00;
  font-weight: 500;
}
</style>
