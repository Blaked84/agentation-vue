# agentation-vue

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
