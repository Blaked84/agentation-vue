# agentation-vue

## 0.2.10

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
