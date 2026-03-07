import type { Settings, StorageAdapter } from '../types'
import { reactive, watch } from 'vue-demi'

const STORAGE_KEY = 'agentation-vue-settings'

const fallbackSettingsStorage: StorageAdapter = {
  getItem(key) {
    return localStorage.getItem(key)
  },
  setItem(key, value) {
    localStorage.setItem(key, value)
  },
}

let settingsStorage: StorageAdapter = fallbackSettingsStorage

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
    const stored = settingsStorage.getItem(STORAGE_KEY)
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
      settingsStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }
    catch {}
  },
)

export function setSettingsStorage(adapter: StorageAdapter) {
  settingsStorage = adapter
  Object.assign(settings, loadSettings())
}

export function resetSettingsStorage() {
  settingsStorage = fallbackSettingsStorage
  Object.assign(settings, loadSettings())
}

export function useSettings() {
  function resetSettings() {
    Object.assign(settings, defaults)
  }

  return { settings, resetSettings }
}
