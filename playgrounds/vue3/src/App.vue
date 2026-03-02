<script setup lang="ts">
import MocSidebarNav from './components/moc/MocSidebarNav.vue'
</script>

<template>
  <div class="app-layout">
    <MocSidebarNav title="Agentation Vue" />
    <main class="app-main">
      <router-view />
    </main>
    <agentation-vue />
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: #fafafa; }
.app-layout { display: flex; min-height: 100vh; }
.app-main { margin-left: 220px; flex: 1; padding: 32px; max-width: 900px; }
</style>
