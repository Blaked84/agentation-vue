import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { builder: 'mkdist', input: './src', outDir: './dist', format: 'esm' },
  ],
  externals: ['vue', 'vue-demi'],
  declaration: true,
  clean: true,
  hooks: {
    // mkdist compiles .ts files to .mjs but preserves .vue SFCs as-is, without
    // rewriting their import specifiers. This means a .vue file importing from
    // "../directives/vaTooltip" will fail at resolution time in the consumer's
    // bundler because the actual file on disk is "vaTooltip.mjs".
    //
    // We can't switch to Vite library mode because it pre-compiles templates
    // into Vue 3 render functions, which breaks Vue 2.7 compatibility.
    // Shipping raw .vue SFCs (via mkdist) lets the consumer's bundler compile
    // templates for the correct Vue version.
    //
    // This hook walks all .vue files in dist/ after build and appends ".mjs"
    // to extensionless relative imports when the corresponding .mjs file exists.
    'build:done': function (ctx) {
      fixVueImports(ctx.options.outDir)
    },
  },
})

function fixVueImports(dir: string) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      fixVueImports(fullPath)
      continue
    }
    if (!entry.endsWith('.vue'))
      continue

    const content = readFileSync(fullPath, 'utf-8')
    const fixed = content.replace(
      /from ["'](\.\.?\/[^"']+)["']/g,
      (match, importPath) => {
        if (/\.\w+$/.test(importPath))
          return match
        const resolved = join(dir, `${importPath}.mjs`)
        if (existsSync(resolved))
          return match.replace(importPath, `${importPath}.mjs`)
        return match
      },
    )
    if (fixed !== content)
      writeFileSync(fullPath, fixed)
  }
}
