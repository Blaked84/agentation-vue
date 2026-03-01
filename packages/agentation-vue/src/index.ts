import type { App } from 'vue-demi'
import AgentationVue from './AgentationVue.vue'

export { AgentationVue }
export default AgentationVue

export const AgentationVuePlugin = {
  install(app: App) {
    app.component('AgentationVue', AgentationVue)
    app.component('agentation-vue', AgentationVue)
  },
}

export type {
  OutputDetail,
  InteractionMode,
  BoundingBox,
  ElementRef,
  Annotation,
  AgentationProps,
  AgentationEmits,
  Settings,
} from './types'

export { useInteractionMode } from './composables/useInteractionMode'
export { useAnnotations } from './composables/useAnnotations'
export { useElementDetection } from './composables/useElementDetection'
export { useTextSelection } from './composables/useTextSelection'
export { useMultiSelect } from './composables/useMultiSelect'
export { useAreaSelect } from './composables/useAreaSelect'
export { useAnimationPause } from './composables/useAnimationPause'
export { useMarkerPositions } from './composables/useMarkerPositions'
export { useOutputFormatter, formatAnnotations } from './composables/useOutputFormatter'
export { useSettings } from './composables/useSettings'

export { default as VaButton } from './components/VaButton.vue'
export { default as VaIconButton } from './components/VaIconButton.vue'
export { default as VaToggle } from './components/VaToggle.vue'
export { default as ComponentChain } from './components/ComponentChain.vue'
