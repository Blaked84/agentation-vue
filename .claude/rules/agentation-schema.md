# Agentation Annotation Schema Compliance

The `Annotation` interface in `packages/agentation-vue/src/types.ts` is based on https://agentation.dev/schema/annotation.v1.json with Vue-specific adaptations.

## Required fields (always present on every annotation):
- `id`: string — unique identifier
- `comment`: string — human feedback text
- `elementPath`: string — CSS selector path (e.g. "body > main > button.cta")
- `timestamp`: number — Unix timestamp in milliseconds
- `x`: number — percentage of viewport width (0-100)
- `y`: number — pixels from document top
- `element`: string — HTML tag name only (e.g. "button", "input", "div"). NOT a CSS selector.

## Vue-specific adaptation:
- The schema's `reactComponents` field is named `vueComponents` in this package (Vue library, not React)
- `vueComponents: string` — ` > ` delimited component tree (e.g. `"App > RouterView > BasicElements"`)
- This is a string, NOT an array
- `url`: string — page URL where annotation was created
- `boundingBox`: `{ x, y, width, height }` — all numbers

## Output detail levels:
- Only 2 levels: `standard` and `forensic`
- `standard` includes: element, comment, vueComponents, elementPath, nearbyElements
- `forensic` adds: vueComponents with file paths, cssClasses, boundingBox, computedStyles, accessibility

## Do NOT:
- Store CSS selectors in `element` — that goes in `elementPath`
- Make `vueComponents` an array — it's a ` > ` delimited string
- Add fields not in the schema to the public API without checking schema compatibility
- Add output detail levels beyond `standard` and `forensic`
