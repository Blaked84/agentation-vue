# agentation-vue

[![npm version](https://img.shields.io/npm/v/agentation-vue)](https://www.npmjs.com/package/agentation-vue)
[![npm downloads](https://img.shields.io/npm/dm/agentation-vue)](https://www.npmjs.com/package/agentation-vue)

![agentation-vue in action](https://raw.githubusercontent.com/Blaked84/agentation-vue/main/packages/chrome-extension/promo-1280x800.png)

Visual feedback tool for AI coding agents. Drop a single component into your Vue app and let your AI agent see and annotate UI elements.

Compatible with **Vue 3.3+** and **Vue 2.7**.

> **Note:** This is an unofficial, community-maintained Vue adaptation of [Agentation](https://github.com/benjitaylor/agentation). It is not affiliated with or endorsed by the original project.

## Installation

```bash
npm install agentation-vue
```

## Setup — Vue 3

```ts
import { AgentationVuePlugin } from 'agentation-vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import 'agentation-vue/style.css'

createApp(App)
  .use(AgentationVuePlugin)
  .mount('#app')
```

Then place the component once in your root `App.vue`:

```vue
<template>
  <router-view />
  <agentation-vue />
</template>
```

## Setup — Vue 2.7

```ts
import { AgentationVuePlugin } from 'agentation-vue'
// main.ts
import Vue from 'vue'
import App from './App.vue'
import 'agentation-vue/style.css'

Vue.use(AgentationVuePlugin)

new Vue({
  render: h => h(App),
}).$mount('#app')
```

Then place the component once in your root `App.vue`:

```vue
<template>
  <div>
    <router-view />
    <agentation-vue />
  </div>
</template>
```

> Vue 2 templates require a single root element — wrap your content in a `<div>`.

## Chrome extension

This repo also contains a Chrome extension for injecting Agentation without modifying the target app code.

## Features

- **Click-to-annotate** — click any element to pin a numbered marker and leave a comment
- **Multi-select** — `Shift+drag` to rubber-band select multiple elements at once
- **Area select** — `Alt+drag` to annotate a screen region
- **Text selection** — highlight text to annotate it
- **Vue component tree** — automatically detects and reports the Vue component hierarchy for each annotated element
- **Markdown output** — copies all annotations as structured Markdown, ready to paste into an AI chat
- **Forensic mode** — captures bounding boxes, computed styles, CSS classes, and accessibility attributes
- **Themes** — light, dark, or auto (follows system preference)
- **Auto-hide launcher** — optionally tucks the collapsed floating button near screen edges and reveals it on approach
- **Session persistence** — annotations survive refreshes and are scoped per page URL via `sessionStorage`
- **Custom tooltip directive** — `v-va-tooltip` with optional keyboard shortcut badge

## Acknowledgments

This project is inspired by and based on [Agentation](https://github.com/benjitaylor/agentation) by [Ben Taylor](https://github.com/benjitaylor). Thank you for the original concept and implementation.

## License

[PolyForm Shield 1.0.0](./LICENSE) — Copyright (c) 2026 Dorian Becker
