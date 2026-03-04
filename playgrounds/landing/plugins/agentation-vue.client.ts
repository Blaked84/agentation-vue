import { AgentationVuePlugin } from 'agentation-vue'
import 'agentation-vue/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(AgentationVuePlugin, {
    theme: 'dark',
  })
})
