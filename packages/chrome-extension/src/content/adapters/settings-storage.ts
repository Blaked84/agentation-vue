import { CachedChromeStorageAdapter } from './chrome-storage'

const SETTINGS_KEY = 'agentation-vue-settings'

export async function createSettingsStorageAdapter() {
  const adapter = new CachedChromeStorageAdapter(chrome.storage.sync)
  await adapter.hydrate([SETTINGS_KEY])
  return adapter
}
