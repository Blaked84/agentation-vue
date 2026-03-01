import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { AgentationVuePlugin } from 'agentation-vue'
import 'agentation-vue/style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/BasicElements.vue') },
    { path: '/nested', component: () => import('./pages/NestedLayout.vue') },
    { path: '/animated', component: () => import('./pages/AnimatedPage.vue') },
    { path: '/dynamic', component: () => import('./pages/DynamicContent.vue') },
    { path: '/iframes', component: () => import('./pages/IframePage.vue') },
    { path: '/fixed', component: () => import('./pages/FixedStickyPage.vue') },
  ],
})

createApp(App)
  .use(router)
  .use(AgentationVuePlugin)
  .mount('#app')
