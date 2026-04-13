import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../packages/agentation-vue/package.json'), 'utf-8'))

const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const isPromoCapture = process.env.PROMO_CAPTURE === 'true'
const posthogPublicKey = process.env.POSTHOG_PUBLIC_KEY || ''
const posthogHost = process.env.POSTHOG_HOST || 'https://eu.i.posthog.com'

export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'static',
    prerender: { ignore: ['/promo'] },
  },
  devServer: { port: 3002 },
  devtools: { enabled: !isPromoCapture },

  runtimeConfig: {
    public: {
      packageVersion: pkg.version,
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    ...(posthogPublicKey ? ['@posthog/nuxt' as const] : []),
  ],

  posthogConfig: {
    publicKey: posthogPublicKey,
    // Managed reverse proxy (set via POSTHOG_HOST secret) to avoid ad-blockers
    // and keep 1st-party requests. Falls back to eu.i.posthog.com in dev.
    host: posthogHost,
    clientConfig: {
      // Keep links in PostHog dashboards pointing back to the real PostHog UI
      ui_host: 'https://eu.posthog.com',
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
    },
  },

  build: {
    transpile: ['agentation-vue', 'vue-demi'],
  },

  vite: {
    resolve: {
      alias: {
        'agentation-vue/style.css': resolve(
          __dirname,
          '../../packages/agentation-vue/src/styles/agentation.css',
        ),
        'agentation-vue': resolve(
          __dirname,
          '../../packages/agentation-vue/src/index.ts',
        ),
      },
    },
  },

  css: ['~/assets/css/main.css', 'agentation-vue/style.css'],

  app: {
    ...(isGitHubPages && { baseURL: '/agentation-vue/' }),
    head: {
      title: 'agentation-vue — Visual annotations for AI coding agents',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inconsolata:wght@400;500;700&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
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
