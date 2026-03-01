import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { builder: 'mkdist', input: './src', outDir: './dist', format: 'esm' },
    { builder: 'mkdist', input: './src', outDir: './dist', format: 'cjs' },
  ],
  externals: ['vue', 'vue-demi'],
  declaration: true,
  clean: true,
})
