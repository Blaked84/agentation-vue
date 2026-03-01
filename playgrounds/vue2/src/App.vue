<template>
  <div class="app-layout">
    <nav class="app-nav">
      <h2 class="app-title">Agentation Vue (2.7)</h2>
      <router-link to="/" class="nav-link">Basic Elements</router-link>
      <router-link to="/nested" class="nav-link">Nested Layout</router-link>
      <router-link to="/animated" class="nav-link">Animated</router-link>
      <router-link to="/dynamic" class="nav-link">Dynamic Content</router-link>
      <router-link to="/iframes" class="nav-link">Iframes</router-link>
      <router-link to="/fixed" class="nav-link">Fixed/Sticky</router-link>
    </nav>
    <main class="app-main">
      <router-view />
    </main>
    <agentation-vue />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: #fafafa; }
.app-layout { display: flex; min-height: 100vh; }
.app-nav {
  width: 220px; background: #fff; border-right: 1px solid #e5e5e5; padding: 20px; display: flex;
  flex-direction: column; gap: 4px; position: fixed; top: 0; bottom: 0; overflow-y: auto;
}
.app-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #FF5C00; }
.nav-link {
  display: block; padding: 8px 12px; border-radius: 6px; color: #555; text-decoration: none;
  font-size: 14px; transition: all 150ms;
}
.nav-link:hover { background: #f5f5f5; color: #1a1a1a; }
.router-link-active { background: #fff3ed; color: #FF5C00; font-weight: 500; }
.app-main { margin-left: 220px; flex: 1; padding: 32px; max-width: 900px; }
</style>
