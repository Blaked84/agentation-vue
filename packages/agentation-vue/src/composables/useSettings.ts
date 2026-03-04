import type { Settings } from '../types'
import { reactive, watch } from 'vue-demi'

const STORAGE_KEY = 'agentation-vue-settings'

const defaults: Settings = {
  outputDetail: 'standard',
  markerColor: '#42B883',
  blockPageInteractions: false,
  autoHideToolbar: false,
  toolbarPlacement: 'bottom-right',
  clearAfterCopy: false,
  showComponentTree: true,
  theme: 'auto',
  activationKey: 'Shift',
}

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored)
      return { ...defaults, ...JSON.parse(stored) }
  }
  catch {}
  return { ...defaults }
}

const settings = reactive<Settings>(loadSettings())

watch(
  () => ({ ...settings }),
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }
    catch {}
  },
)

export function useSettings() {
  function resetSettings() {
    Object.assign(settings, defaults)
  }

  return { settings, resetSettings }
}
