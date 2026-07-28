# agentation-vue

## 0.3.0

### Minor Changes

- feat: add configurable `scope` prop for annotation persistence

  Annotations were previously keyed in `sessionStorage` by the full page URL (including query string and hash), so they vanished whenever the URL varied slightly across navigations. Added a `scope` prop (`'domain' | 'domain-port' | 'path'`) that controls how annotations are grouped for storage:

  - `'domain'` keys annotations by protocol + hostname, ignoring the port, so annotations persist across ports, paths, query strings, and hashes on the same hostname.
  - `'domain-port'` (the default) keys annotations by origin (protocol + host + port), so annotations persist across paths, query strings, and hashes but stay isolated per port.
  - `'path'` keys annotations by origin + pathname, ignoring the query string and hash, so annotations persist across query/hash changes but stay isolated per page path.

  **This changes existing behavior**: annotations are now shared across all pages on the same origin instead of being isolated per exact URL. The `url` field stored on each annotation is unaffected and still records the full page URL where it was created.

  `scope` is now also a persisted user setting exposed in the settings panel (Annotation scope), so users can change it without a host-provided prop; the prop still overrides the persisted setting when explicitly passed.

## 0.2.15

### Patch Changes

- Fix the annotation input being impossible to type in when annotating content inside modals:

  - Re-host the library UI inside open native `<dialog>` modals — `showModal()` paints the dialog in the top layer and makes everything else inert, which made the UI invisible and non-interactive
  - Reclaim focus stolen from the annotation input by focus-trap modal libraries (Vuetify, Element Plus, focus-trap), and stop focus events from bubbling to document-level traps
  - Strip `inert`/`aria-hidden` applied to library containers by modal libraries (Headless UI style) and survive `body { pointer-events: none }` locks (reka-ui/Radix style)
  - Fix Vue 3 portal: `<component :is="'Teleport'">` rendered a literal `<teleport>` element in place instead of teleporting the UI to `body`

## 0.2.14

### Patch Changes

- c253868: fix(chrome-extension): include Vue component chain in copied annotation text

  The Vue component tree was visible in the annotation input popup but missing from the copied markdown. The main-world bridge's `document.elementFromPoint(x, y)` returned the extension's own shadow host whenever the input popup overlapped the target element's sample point at save time, so the re-detection in `onInputAdd` returned `undefined` and `vueComponents` was never stored. The bridge now iterates `document.elementsFromPoint(x, y)` and skips any element under a `[data-agentation-vue]` ancestor so the underlying page element is reached even while the popup is visible.

## 0.2.13

### Patch Changes

- f0d003f: fix(tooltip): render tooltips inside shadow root when host is in shadow DOM

  Tooltips were invisible in the Chrome extension because the `vaTooltip` directive appended tooltip nodes to `document.body`, placing them outside the shadow root where the library's CSS is scoped. The directive now walks `el.getRootNode()` and appends into the `ShadowRoot` when present, falling back to `document.body` otherwise.

## 0.2.12

### Features

- Add peek inspect mode — hold a key to temporarily inspect elements without entering annotation mode
- Allow pinning annotations without comment text (button shows "Pin" when empty, "Add" when filled)

### Fixes

- Derive `VA_VERSION` from `package.json` at build time instead of a hardcoded string, keeping the version in sync with changesets

### Other

- Add npm version and downloads badges to README
- Copy root README into package on prepack for npm listing

## 0.2.10 / 0.2.11

### Patch Changes

- Replace clear confirmation dialog with dismissable undo toast (5s timeout)
- Add @mention system for cross-referencing annotations in comments — type `@` to open a completion dropdown, select an annotation to insert an inline chip with stable ID-based references

## 0.2.9

### Patch Changes

- Stop toolbar keyboard shortcuts from propagating to the host app or Chrome extension when the toolbar is open

## 0.2.7

### Patch Changes

- cc899d7: ### Features

  - Global keyboard shortcut system with double-tap activation
  - Chrome extension build and release flow

  ### Fixes

  - Prevent link clicks from being followed during annotation mode
  - Rewrite extensionless imports in compiled .vue SFCs
  - Fix package module exports (ESM-only)

  ### Other

  - Remove CJS support (ESM only)
  - Reduce grab handle visual weight to match toolbar icons
