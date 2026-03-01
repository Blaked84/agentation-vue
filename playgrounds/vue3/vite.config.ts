import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000 },
  resolve: {
    alias: {
      'agentation-vue/style.css': resolve(__dirname, '../../packages/agentation-vue/src/styles/agentation.css'),
      'agentation-vue': resolve(__dirname, '../../packages/agentation-vue/src/index.ts'),
    },
  },
})
