import { resolve } from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: Number(process.env.PORT) || 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      'agentation-vue/style.css': resolve(__dirname, '../../packages/agentation-vue/src/styles/agentation.css'),
      'agentation-vue': resolve(__dirname, '../../packages/agentation-vue/src/index.ts'),
    },
  },
})
