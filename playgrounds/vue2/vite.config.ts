import { resolve } from 'node:path'
import process from 'node:process'
import vue2 from '@vitejs/plugin-vue2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue2()],
  server: {
    port: Number(process.env.PORT) || 3001,
    strictPort: true,
  },
  resolve: {
    alias: {
      'agentation-vue/style.css': resolve(__dirname, '../../packages/agentation-vue/src/styles/agentation.css'),
      'agentation-vue': resolve(__dirname, '../../packages/agentation-vue/src/index.ts'),
      'vue-demi': resolve(__dirname, '../../packages/agentation-vue/node_modules/vue-demi/lib/v2.7/index.mjs'),
      'vue': resolve(__dirname, 'node_modules/vue/dist/vue.runtime.esm.js'),
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
})
