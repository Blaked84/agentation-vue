const STORAGE_KEY = 'agentation-vue-settings'

const storage = new Map<string, string>()

beforeAll(() => {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
    clear: () => { storage.clear() },
  })
})

let useSettings: typeof import('../../src/composables/useSettings').useSettings
let setSettingsStorage: typeof import('../../src/composables/useSettings').setSettingsStorage
let resetSettingsStorage: typeof import('../../src/composables/useSettings').resetSettingsStorage

beforeEach(async () => {
  storage.clear()
  vi.resetModules()
  const mod = await import('../../src/composables/useSettings')
  useSettings = mod.useSettings
  setSettingsStorage = mod.setSettingsStorage
  resetSettingsStorage = mod.resetSettingsStorage
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('useSettings', () => {
  it('loads defaults when storage is empty', () => {
    const { settings } = useSettings()

    expect(settings.outputDetail).toBe('standard')
    expect(settings.markerColor).toBe('#42B883')
    expect(settings.theme).toBe('auto')
  })

  it('persists changes to storage', async () => {
    const { settings } = useSettings()
    settings.theme = 'dark'

    await Promise.resolve()

    expect(JSON.parse(storage.get(STORAGE_KEY)!)).toMatchObject({
      theme: 'dark',
    })
  })

  it('supports overriding the storage adapter', async () => {
    const customStorage = new Map<string, string>()
    setSettingsStorage({
      getItem: key => customStorage.get(key) ?? null,
      setItem: (key, value) => { customStorage.set(key, value) },
    })

    const { settings } = useSettings()
    settings.theme = 'light'

    await Promise.resolve()

    expect(customStorage.get(STORAGE_KEY)).toBeDefined()
    expect(storage.get(STORAGE_KEY)).toBeUndefined()
  })

  it('resetSettingsStorage restores the default adapter', async () => {
    setSettingsStorage({
      getItem: () => null,
      setItem: () => {},
    })

    resetSettingsStorage()

    const { settings } = useSettings()
    settings.theme = 'dark'

    await Promise.resolve()

    expect(storage.get(STORAGE_KEY)).toBeDefined()
  })
})
