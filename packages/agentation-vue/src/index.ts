import type { App } from 'vue-demi'
import AgentationVue from './AgentationVue.vue'
import { vaTooltipDirective } from './directives/vaTooltip'

export { AgentationVue }
export default AgentationVue

export const AgentationVuePlugin = {
  install(app: App) {
    app.component('AgentationVue', AgentationVue)
    app.component('agentation-vue', AgentationVue)
    app.directive('va-tooltip', vaTooltipDirective as any)
  },
}

export { default as ComponentChain } from './components/ComponentChain.vue'
export { default as VaButton } from './components/VaButton.vue'
export { default as VaIcon } from './components/VaIcon.vue'
export { default as VaIconButton } from './components/VaIconButton.vue'
export { default as VaToggle } from './components/VaToggle.vue'
export { vaTooltipDirective }
export { useAnimationPause } from './composables/useAnimationPause'
export { useAnnotations } from './composables/useAnnotations'
export { useAreaSelect } from './composables/useAreaSelect'
export { useElementDetection } from './composables/useElementDetection'
export { useInteractionMode } from './composables/useInteractionMode'
export { useKeyboardShortcuts, DEFAULT_SHORTCUT_CONFIG } from './composables/useKeyboardShortcuts'
export { useMarkerPositions } from './composables/useMarkerPositions'
export { useMultiSelect } from './composables/useMultiSelect'
export { formatAnnotations, useOutputFormatter } from './composables/useOutputFormatter'
export { useSettings } from './composables/useSettings'
export { useTextSelection } from './composables/useTextSelection'
export { useToolbarAutoHide } from './composables/useToolbarAutoHide'
export type { VaTooltipOptions, VaTooltipPlacement, VaTooltipValue } from './directives/vaTooltip'
export { icons } from './icons'
export type { IconName } from './icons'
export type {
  DoubleTapConfig,
  KeyboardShortcutConfig,
  KeyboardShortcutState,
  ShortcutAction,
} from './composables/useKeyboardShortcuts'
export type {
  AgentationEmits,
  AgentationProps,
  Annotation,
  BoundingBox,
  ElementRef,
  InteractionMode,
  OutputDetail,
  Settings,
} from './types'
