import type { Ref } from 'vue-demi'
import { onBeforeUnmount, onMounted, ref } from 'vue-demi'
import { PEEK_HOLD_DURATION_MS } from '../constants'

export interface UsePeekModeOptions {
  peekKey: () => string
  enabled: () => boolean
  isInputOpen: () => boolean
  onActivate: () => void
  onDeactivate: () => void
}

export function usePeekMode(options: UsePeekModeOptions) {
  const isCharging = ref(false)
  const isActive = ref(false)
  let holdTimer: ReturnType<typeof setTimeout> | null = null
  let exitTimer: ReturnType<typeof setTimeout> | null = null
  let listenerAttached = false

  function clearHoldTimer() {
    if (holdTimer) {
      clearTimeout(holdTimer)
      holdTimer = null
    }
  }

  function clearExitTimer() {
    if (exitTimer) {
      clearTimeout(exitTimer)
      exitTimer = null
    }
  }

  function clearTimers() {
    clearHoldTimer()
    clearExitTimer()
  }

  function resetAll() {
    clearTimers()
    const wasActive = isActive.value
    isCharging.value = false
    isActive.value = false
    if (wasActive)
      options.onDeactivate()
  }

  function deactivate() {
    clearExitTimer()
    isActive.value = false
    options.onDeactivate()
  }

  function scheduleExit() {
    clearExitTimer()
    exitTimer = setTimeout(() => {
      exitTimer = null
      deactivate()
    }, PEEK_HOLD_DURATION_MS)
  }

  function matchesKey(e: KeyboardEvent): boolean {
    const key = options.peekKey()
    if (key === 'none')
      return false
    return e.key === key
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.repeat)
      return
    if (isCharging.value && !matchesKey(e)) {
      clearHoldTimer()
      isCharging.value = false
      return
    }
    if (!matchesKey(e))
      return

    // Re-pressing the peek key while exit timer is running → cancel exit, stay active
    if (isActive.value && exitTimer) {
      clearExitTimer()
      return
    }

    if (!options.enabled())
      return
    if (isCharging.value || isActive.value)
      return

    isCharging.value = true
    holdTimer = setTimeout(() => {
      holdTimer = null
      isCharging.value = false
      isActive.value = true
      options.onActivate()
    }, PEEK_HOLD_DURATION_MS)
  }

  function onKeyUp(e: KeyboardEvent) {
    if (!matchesKey(e))
      return

    clearHoldTimer()
    isCharging.value = false

    if (isActive.value) {
      if (options.isInputOpen()) {
        // Input is open — don't exit now, scheduleExit will be called after submit
        return
      }
      deactivate()
    }
  }

  function onBlurOrVisibility() {
    resetAll()
  }

  function attach() {
    if (listenerAttached)
      return
    listenerAttached = true
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    window.addEventListener('blur', onBlurOrVisibility)
    document.addEventListener('visibilitychange', onBlurOrVisibility)
  }

  function detach() {
    if (!listenerAttached)
      return
    listenerAttached = false
    window.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('keyup', onKeyUp, true)
    window.removeEventListener('blur', onBlurOrVisibility)
    document.removeEventListener('visibilitychange', onBlurOrVisibility)
    resetAll()
  }

  onMounted(attach)
  onBeforeUnmount(detach)

  return {
    isCharging: isCharging as Ref<boolean>,
    isActive: isActive as Ref<boolean>,
    deactivate,
    scheduleExit,
  }
}
