import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const distDir = resolve(rootDir, 'dist')
const workspaceRoot = resolve(rootDir, '../..')

const alias = {
  'agentation-vue': resolve(rootDir, '../agentation-vue/src/index.ts'),
  '@agentation-vue-src': resolve(rootDir, '../agentation-vue/src'),
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function getPackageVersion() {
  return readJson(resolve(rootDir, '../agentation-vue/package.json')).version
}

function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      mkdirSync(distDir, { recursive: true })
      const manifest = readJson(resolve(rootDir, 'manifest.json'))
      manifest.version = getPackageVersion()
      writeFileSync(resolve(distDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
    },
  }
}

function createBuildConfig(entry, fileName, name, emptyOutDir = false) {
  return {
    root: workspaceRoot,
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
  }
}

rmSync(distDir, { force: true, recursive: true })

const builds = [
  createBuildConfig('src/background/service-worker.ts', 'service-worker.js', 'AgentationExtensionServiceWorker', true),
  createBuildConfig('src/content/index.ts', 'content-script.js', 'AgentationExtensionContentScript'),
  createBuildConfig('src/main-world/vue-bridge.ts', 'main-world.js', 'AgentationExtensionMainWorld'),
]

for (const config of builds) {
  await build(config)
}
