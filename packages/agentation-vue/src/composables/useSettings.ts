import { reactive, watch } from 'vue-demi'
import type { Settings } from '../types'

const STORAGE_KEY = 'agentation-vue-settings'

const defaults: Settings = {
  outputDetail: 'standard',
  markerColor: '#FF5C00',
  blockPageInteractions: false,
  clearAfterCopy: false,
  showComponentTree: true,
  theme: 'auto',
}

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaults, ...JSON.parse(stored) }
  } catch {}
  return { ...defaults }
}

export function useSettings() {
  const settings = reactive<Settings>(loadSettings())

  watch(
    () => ({ ...settings }),
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch {}
    },
    { deep: true },
  )

  function resetSettings() {
    Object.assign(settings, defaults)
  }

  return { settings, resetSettings }
}
