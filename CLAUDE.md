# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev:vue3              # Vue 3 playground on :3000
pnpm dev:vue2              # Vue 2 playground on :3001

# Build
pnpm build                 # Build dist/ via unbuild (mkdist, not bundled)

# Testing
pnpm test                  # All unit tests (watch mode)
pnpm test:unit             # Unit project only
vitest run <file>          # Single test file, no watch
pnpm test:e2e              # Playwright e2e (Vue 3)
pnpm test:e2e:vue2         # Playwright e2e (Vue 2)

# Quality
pnpm lint                  # ESLint (@antfu/eslint-config)
pnpm typecheck             # vue-tsc across all packages

# Release
pnpm changeset             # Create a changeset
pnpm release               # Build + changeset publish
```

## Architecture

**pnpm monorepo** with three workspace members:
- `packages/agentation-vue` — the published library (Vue 2.7 & 3 compatible via `vue-demi`)
- `playgrounds/vue3` and `playgrounds/vue2` — dev playgrounds that alias `agentation-vue` to source

### Build: unbuild + mkdist

mkdist compiles each source file 1:1 into `dist/`, preserving directory structure (no bundling). Outputs both ESM (`.mjs`) and CJS (`.js`). Tree-shaking happens in the consumer's bundler. Dev mode (`pnpm -C packages/agentation-vue dev`) uses `unbuild --stub` for live passthrough.

### Vue 2/3 dual compatibility

All Vue imports come from `vue-demi`, never `vue` directly. The main compatibility branching point is teleport: Vue 3 uses `<Teleport to="body">`, Vue 2 manually moves DOM into a portal container (`createPortalContainer()` in `utils/portal.ts`). Gate on `isVue2` from `vue-demi`.

### State management: module-level singletons

`useAnnotations` and `useSettings` create reactive state at **module scope**, not inside the composable function. One shared instance across all component usages. Tests must use `vi.resetModules()` + dynamic `import()` in `beforeEach` to get fresh state.

Annotations are URL-scoped and persisted to `sessionStorage` as `Record<url, Annotation[]>`. Settings persist to `localStorage`.

### Component hierarchy

`AgentationVue.vue` is the root — a large orchestrator that wires all composables together. Props override persisted settings via `watch(..., { immediate: true })`.

Key composables: `useInteractionMode` (state machine: idle → inspect → {multi-selecting, area-selecting, input-open}), `useElementDetection` (RAF-throttled hover tracking), `useMultiSelect` (Shift+drag), `useAreaSelect` (Alt+drag), `useMarkerPositions` (scroll/resize-aware repositioning), `useToolbarDragSnap` (long-press drag with 6-anchor snap).

### DOM conventions

- All internal CSS classes use `__va-` prefix
- `data-agentation-vue` attribute marks all library DOM — used to filter out own elements during detection
- Playwright e2e tests rely on `__va-*` selectors via the `AgentationPage` page object (`e2e/fixtures/`)

## Key conventions

- **Event naming**: kebab-case only for emits and `v-on` (enforced by ESLint)
- **RAF throttling**: all mouse-move handlers throttle via `requestAnimationFrame`
- **Selector filtering**: DOM queries filter with `.closest('[data-agentation-vue]')` to skip library UI
- **History patching**: monkey-patches `pushState`/`replaceState` to fire `va:history-change` for SPA URL-scoped annotations
- **TypeScript**: `strict: true`, `ES2022` target, `vitest/globals` types available without imports
- **Changesets**: `baseBranch: "main"`, `access: "public"`, playgrounds are ignored
