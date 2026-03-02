import type { InteractionMode } from '../types'
import { ref } from 'vue-demi'

export function useInteractionMode() {
  const mode = ref<InteractionMode>('idle')

  const allowedTransitions: Record<InteractionMode, InteractionMode[]> = {
    'idle': ['inspect'],
    'inspect': ['idle', 'input-open', 'multi-selecting', 'area-selecting'],
    'multi-selecting': ['input-open', 'inspect'],
    'area-selecting': ['input-open', 'inspect'],
    'input-open': ['inspect', 'idle'],
  }

  function transition(to: InteractionMode): boolean {
    if (allowedTransitions[mode.value]?.includes(to)) {
      mode.value = to
      return true
    }
    console.warn(`[agentation-vue] Invalid transition: ${mode.value} → ${to}`)
    return false
  }

  return { mode, transition }
}
