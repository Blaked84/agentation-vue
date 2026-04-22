---
"agentation-vue": patch
---

fix(chrome-extension): include Vue component chain in copied annotation text

The Vue component tree was visible in the annotation input popup but missing from the copied markdown. The main-world bridge's `document.elementFromPoint(x, y)` returned the extension's own shadow host whenever the input popup overlapped the target element's sample point at save time, so the re-detection in `onInputAdd` returned `undefined` and `vueComponents` was never stored. The bridge now iterates `document.elementsFromPoint(x, y)` and skips any element under a `[data-agentation-vue]` ancestor so the underlying page element is reached even while the popup is visible.
