import { CachedChromeStorageAdapter } from './chrome-storage'

const ANNOTATIONS_KEY = 'agentation-vue-annotations'

export async function createAnnotationStorageAdapter() {
  const adapter = new CachedChromeStorageAdapter(chrome.storage.session)
  await adapter.hydrate([ANNOTATIONS_KEY])
  return adapter
}
