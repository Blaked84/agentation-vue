<script setup lang="ts">
import type { AnnotationScope } from 'agentation-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MocSidebarNav from './components/moc/MocSidebarNav.vue'

// e2e hook: ?scope=domain|domain-port|path overrides the annotation scope prop.
// Left unset otherwise so the component's own default ('domain-port') applies.
const route = useRoute()
const annotationScope = computed<AnnotationScope | undefined>(() => {
  const scope = route.query.scope
  return scope === 'domain' || scope === 'domain-port' || scope === 'path' ? scope : undefined
})
</script>

<template>
  <div class="app-layout">
    <MocSidebarNav title="Agentation Vue" />
    <main class="app-main">
      <router-view />
    </main>
    <agentation-vue :scope="annotationScope" />
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: #fafafa; }
.app-layout { display: flex; min-height: 100vh; }
.app-main { margin-left: 220px; flex: 1; padding: 32px; max-width: 900px; }
</style>
