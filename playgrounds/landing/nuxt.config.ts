import { resolve } from 'node:path'

export default defineNuxtConfig({
  ssr: true,
  nitro: { preset: 'static' },
  devServer: { port: 3002 },

  modules: ['@nuxtjs/tailwindcss'],

  build: {
    transpile: ['agentation-vue', 'vue-demi'],
  },

  vite: {
    resolve: {
      alias: {
        'agentation-vue/style.css': resolve(
          __dirname, '../../packages/agentation-vue/src/styles/agentation.css',
        ),
        'agentation-vue': resolve(
          __dirname, '../../packages/agentation-vue/src/index.ts',
        ),
      },
    },
  },

  css: ['~/assets/css/main.css', 'agentation-vue/style.css'],

  app: {
    head: {
      title: 'agentation-vue — Visual annotations for AI coding agents',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Drop a Vue component into your app. Click any element to generate structured Markdown for AI coding agents.' },
        { property: 'og:title', content: 'agentation-vue' },
        { property: 'og:description', content: 'Visual annotations for AI coding agents — Vue 2.7 & Vue 3.' },
        { property: 'og:type', content: 'website' },
      ],
    },
  },

  compatibilityDate: '2025-01-01',
})
