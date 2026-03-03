# agentation-vue

Visual feedback tool for AI coding agents. Drop a single component into your Vue app and let your AI agent see and annotate UI elements.

Compatible with **Vue 3.3+** and **Vue 2.7**.

## Installation

### From GitHub Release (current)

```bash
npm install https://github.com/<org>/<repo>/releases/download/v0.1.0/agentation-vue-0.1.0.tgz
```

### From npm (later)

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
- **Session persistence** — annotations survive page refreshes via `sessionStorage`
- **Custom tooltip directive** — `v-va-tooltip` with optional keyboard shortcut badge

## Custom Tooltips

The plugin registers a global directive `v-va-tooltip` (Vue 2.7 and Vue 3).

```vue
<button v-va-tooltip="'Copy annotations'">
  Copy
</button>

<button v-va-tooltip="{ text: 'Copy annotations', shortcut: 'C' }">
  Copy
</button>
```

`showDelay` is supported (in ms), with a default of `300`:

```vue
<button v-va-tooltip="{ text: 'Copy annotations', shortcut: 'C', showDelay: 300 }">
  Copy
</button>
```

You can also import and register `vaTooltipDirective` manually if you don't use `AgentationVuePlugin`.
