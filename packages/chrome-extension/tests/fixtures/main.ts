import { createApp, defineComponent, h } from 'vue'

declare global {
  interface Window {
    __agentationShortcutHits?: string[]
    __resetAgentationShortcutHits?: () => void
  }
}

const shortcutHits: string[] = []
window.__agentationShortcutHits = shortcutHits
window.__resetAgentationShortcutHits = () => {
  shortcutHits.length = 0
}

window.addEventListener('keyup', (event) => {
  if (event.key === 'Escape')
    shortcutHits.push(`keyup:${event.key}`)
})

window.addEventListener('keypress', (event) => {
  if (event.key.toLowerCase() === 'v')
    shortcutHits.push(`keypress:${event.key.toLowerCase()}`)
})

const MocButton = defineComponent({
  name: 'MocButton',
  render() {
    return h('button', { class: 'test-submit', type: 'button' }, 'Submit')
  },
})

const MocButtonSecondary = defineComponent({
  name: 'MocButtonSecondary',
  render() {
    return h('button', { class: 'test-cancel', type: 'button' }, 'Cancel')
  },
})

const FeatureCard = defineComponent({
  name: 'FeatureCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  render() {
    return h('article', { class: 'card' }, [
      h('h2', this.title),
      h('p', this.body),
    ])
  },
})

const FixturePage = defineComponent({
  name: 'FixturePage',
  render() {
    return h('main', { class: 'page' }, [
      h('section', { class: 'hero' }, [
        h('h1', 'Chrome Extension Fixture'),
        h('p', 'This page intentionally contains no embedded Agentation instance. It exists only to validate the Chrome extension mount path.'),
        h('div', { class: 'actions' }, [
          h(MocButton),
          h(MocButtonSecondary),
        ]),
      ]),
      h('section', { class: 'card-grid' }, [
        h(FeatureCard, {
          title: 'Detection',
          body: 'Used to validate Vue component chain detection.',
        }),
        h(FeatureCard, {
          title: 'Persistence',
          body: 'Used to validate annotation session persistence.',
        }),
        h(FeatureCard, {
          title: 'Shadow DOM',
          body: 'Used to validate extension isolation from page styles.',
        }),
      ]),
    ])
  },
})

createApp(FixturePage).mount('#app')
