---
"agentation-vue": patch
---

fix(tooltip): render tooltips inside shadow root when host is in shadow DOM

Tooltips were invisible in the Chrome extension because the `vaTooltip` directive appended tooltip nodes to `document.body`, placing them outside the shadow root where the library's CSS is scoped. The directive now walks `el.getRootNode()` and appends into the `ShadowRoot` when present, falling back to `document.body` otherwise.
