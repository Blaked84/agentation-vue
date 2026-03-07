import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const distDir = resolve(rootDir, 'dist')

const alias = {
  'agentation-vue': resolve(rootDir, '../agentation-vue/src/index.ts'),
  '@agentation-vue-src': resolve(rootDir, '../agentation-vue/src'),
}

function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      mkdirSync(distDir, { recursive: true })
      copyFileSync(resolve(rootDir, 'manifest.json'), resolve(distDir, 'manifest.json'))
    },
  }
}

export function createBuildConfig(entry: string, fileName: string, name: string, emptyOutDir = false) {
  return defineConfig({
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    plugins: [vue(), copyStaticFiles()],
    resolve: { alias },
    build: {
      emptyOutDir,
      minify: false,
      outDir: distDir,
      sourcemap: true,
      lib: {
        entry: resolve(rootDir, entry),
        fileName: () => fileName,
        formats: ['iife'],
        name,
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  })
}

export default createBuildConfig('src/content/index.ts', 'content-script.js', 'AgentationExtensionContentScript')
