import { ref } from 'vue-demi'

export function useAnimationPause() {
  const isPaused = ref(false)
  let styleEl: HTMLStyleElement | null = null

  function pause() {
    if (styleEl) return

    styleEl = document.createElement('style')
    styleEl.setAttribute('data-agentation-pause', '')
    styleEl.textContent = `
      *, *::before, *::after {
        animation-play-state: paused !important;
        transition: none !important;
      }
    `
    document.head.appendChild(styleEl)

    document.querySelectorAll('video').forEach(v => v.pause())

    isPaused.value = true
  }

  function resume() {
    if (styleEl) {
      styleEl.remove()
      styleEl = null
    }

    document.querySelectorAll('video').forEach(v => {
      v.play().catch(() => {})
    })

    isPaused.value = false
  }

  function toggle() {
    if (isPaused.value) {
      resume()
    } else {
      pause()
    }
  }

  function cleanup() {
    if (isPaused.value) resume()
  }

  return { isPaused, toggle, pause, resume, cleanup }
}
