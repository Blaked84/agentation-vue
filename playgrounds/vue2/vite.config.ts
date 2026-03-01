import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue2()],
  server: { port: 3001 },
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
