import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { AgentationVuePlugin } from 'agentation-vue'
import 'agentation-vue/style.css'

Vue.use(VueRouter)
Vue.use(AgentationVuePlugin as any)

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: () => import('./pages/BasicElements.vue') },
    { path: '/nested', component: () => import('./pages/NestedLayout.vue') },
    { path: '/animated', component: () => import('./pages/AnimatedPage.vue') },
    { path: '/dynamic', component: () => import('./pages/DynamicContent.vue') },
    { path: '/iframes', component: () => import('./pages/IframePage.vue') },
    { path: '/fixed', component: () => import('./pages/FixedStickyPage.vue') },
  ],
})

new Vue({
  router,
  render: (h: any) => h(App),
}).$mount('#app')
