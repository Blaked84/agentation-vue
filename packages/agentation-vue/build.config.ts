import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index.ts' },
  ],
  externals: ['vue', 'vue-demi'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
