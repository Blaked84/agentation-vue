import type { StorageAdapter } from '@agentation-vue-src/types'

function storageGet(storageArea: chrome.storage.StorageArea, keys: string[]) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    storageArea.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      resolve(items)
    })
  })
}

function storageSet(storageArea: chrome.storage.StorageArea, values: Record<string, string>) {
  return new Promise<void>((resolve, reject) => {
    storageArea.set(values, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      resolve()
    })
  })
}

export class CachedChromeStorageAdapter implements StorageAdapter {
  private readonly cache = new Map<string, string>()

  constructor(private readonly storageArea: chrome.storage.StorageArea) {}

  async hydrate(keys: string[]) {
    const stored = await storageGet(this.storageArea, keys)
    for (const key of keys) {
      const value = stored[key]
      if (typeof value === 'string')
        this.cache.set(key, value)
      else
        this.cache.delete(key)
    }
  }

  getItem(key: string): string | null {
    return this.cache.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value)
    void storageSet(this.storageArea, { [key]: value })
  }
}
