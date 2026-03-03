# Icon Usage

Never use inline SVGs in components. Always use the `VaIcon` component with the icon registry.

## How to add/use icons:
1. Register the icon path in `packages/agentation-vue/src/icons.ts`
2. Use `<VaIcon name="icon-name" />` in templates
3. Control size via CSS on the parent or the VaIcon element itself

## Icon registry location:
- Icons: `packages/agentation-vue/src/icons.ts`
- Component: `packages/agentation-vue/src/components/VaIcon.vue`

## VaIcon renders:
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" v-html="icons[name]" />
```

## Do NOT:
- Write inline `<svg>` elements in component templates
- Duplicate SVG paths that already exist in the icon registry
