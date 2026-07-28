import type { Annotation } from '../../src/types'

const STORAGE_KEY = 'agentation-vue-annotations'

function makeAnnotation(overrides: Partial<Annotation> = {}): Omit<Annotation, 'id' | 'timestamp'> {
  return {
    x: 50,
    y: 200,
    comment: 'Test',
    element: 'button',
    elementPath: 'body > button',
    ...overrides,
  }
}

const storage = new Map<string, string>()

beforeAll(() => {
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
    clear: () => { storage.clear() },
  })
})

let useAnnotations: typeof import('../../src/composables/useAnnotations').useAnnotations
let setAnnotationStorage: typeof import('../../src/composables/useAnnotations').setAnnotationStorage
let resetAnnotationStorage: typeof import('../../src/composables/useAnnotations').resetAnnotationStorage
let setAnnotationScope: typeof import('../../src/composables/useAnnotations').setAnnotationScope

beforeEach(async () => {
  storage.clear()
  vi.resetModules()
  const mod = await import('../../src/composables/useAnnotations')
  useAnnotations = mod.useAnnotations
  setAnnotationStorage = mod.setAnnotationStorage
  resetAnnotationStorage = mod.resetAnnotationStorage
  setAnnotationScope = mod.setAnnotationScope
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('useAnnotations', () => {
  it('starts with empty annotations when sessionStorage is empty', () => {
    const { annotations } = useAnnotations()
    expect(annotations.value).toEqual([])
  })

  it('addAnnotation assigns id and timestamp', () => {
    const { addAnnotation } = useAnnotations()
    const result = addAnnotation(makeAnnotation())

    expect(result.id).toBe('1')
    expect(typeof result.timestamp).toBe('number')
    expect(result.timestamp).toBeGreaterThan(0)
  })

  it('addAnnotation increments counter across calls', () => {
    const { addAnnotation } = useAnnotations()
    const first = addAnnotation(makeAnnotation({ comment: 'First' }))
    const second = addAnnotation(makeAnnotation({ comment: 'Second' }))

    expect(first.id).toBe('1')
    expect(second.id).toBe('2')
  })

  it('addAnnotation persists to sessionStorage', () => {
    const { addAnnotation } = useAnnotations()
    addAnnotation(makeAnnotation())

    const raw = storage.get(STORAGE_KEY)
    expect(raw).toBeDefined()

    // Default scope is 'domain-port', so the store key is the origin, not the full href.
    const parsed = JSON.parse(raw!)
    const scoped = parsed[new URL(window.location.href).origin]
    expect(Array.isArray(scoped)).toBe(true)
    expect(scoped).toHaveLength(1)
    expect(scoped[0].comment).toBe('Test')
  })

  it('serialization strips _targetRef from stored JSON', () => {
    const { addAnnotation } = useAnnotations()
    addAnnotation(makeAnnotation({
      _targetRef: new WeakRef(document.createElement('div')),
    }))

    const raw = storage.get(STORAGE_KEY)
    expect(raw).toBeDefined()

    // Default scope is 'domain-port', so the store key is the origin, not the full href.
    const parsed = JSON.parse(raw!)
    const scoped = parsed[new URL(window.location.href).origin]
    expect(scoped[0]).not.toHaveProperty('_targetRef')
  })

  it('removeAnnotation removes by id and updates the list', () => {
    const { addAnnotation, removeAnnotation, annotations } = useAnnotations()
    const first = addAnnotation(makeAnnotation({ comment: 'First' }))
    addAnnotation(makeAnnotation({ comment: 'Second' }))

    removeAnnotation(first.id)

    expect(annotations.value).toHaveLength(1)
    expect(annotations.value[0].comment).toBe('Second')
  })

  it('removeAnnotation returns the removed annotation', () => {
    const { addAnnotation, removeAnnotation } = useAnnotations()
    const added = addAnnotation(makeAnnotation({ comment: 'To remove' }))

    const removed = removeAnnotation(added.id)

    expect(removed).toBeDefined()
    expect(removed!.id).toBe(added.id)
    expect(removed!.comment).toBe('To remove')
  })

  it('removeAnnotation returns undefined for nonexistent id', () => {
    const { addAnnotation, removeAnnotation, annotations } = useAnnotations()
    addAnnotation(makeAnnotation())

    const result = removeAnnotation('nonexistent')

    expect(result).toBeUndefined()
    expect(annotations.value).toHaveLength(1)
  })

  it('updateAnnotation merges partial updates', () => {
    const { addAnnotation, updateAnnotation } = useAnnotations()
    const added = addAnnotation(makeAnnotation({ comment: 'Original', x: 10, y: 20 }))

    updateAnnotation(added.id, { comment: 'Updated' })

    expect(added.comment).toBe('Updated')
    expect(added.x).toBe(10)
    expect(added.y).toBe(20)
    expect(added.element).toBe('button')
  })

  it('updateAnnotation returns the updated annotation', () => {
    const { addAnnotation, updateAnnotation } = useAnnotations()
    const added = addAnnotation(makeAnnotation())

    const result = updateAnnotation(added.id, { comment: 'Changed' })

    expect(result).toBeDefined()
    expect(result!.comment).toBe('Changed')
    expect(result!.id).toBe(added.id)
  })

  it('updateAnnotation returns undefined for nonexistent id', () => {
    const { addAnnotation, updateAnnotation } = useAnnotations()
    addAnnotation(makeAnnotation())

    const result = updateAnnotation('nonexistent', { comment: 'Nope' })

    expect(result).toBeUndefined()
  })

  it('clearAnnotations returns cleared items and resets counter', () => {
    const { addAnnotation, clearAnnotations, annotations } = useAnnotations()
    addAnnotation(makeAnnotation({ comment: 'A' }))
    addAnnotation(makeAnnotation({ comment: 'B' }))
    addAnnotation(makeAnnotation({ comment: 'C' }))

    const cleared = clearAnnotations()

    expect(cleared).toHaveLength(3)
    expect(cleared.map(a => a.comment)).toEqual(['A', 'B', 'C'])
    expect(annotations.value).toHaveLength(0)

    const next = addAnnotation(makeAnnotation({ comment: 'After clear' }))
    expect(next.id).toBe('1')
  })

  it('loads pre-existing annotations from sessionStorage', async () => {
    const preExisting: Annotation[] = [
      { id: '1', x: 10, y: 20, comment: 'Loaded', element: 'div', elementPath: 'body > div', timestamp: 1000 },
      { id: '2', x: 30, y: 40, comment: 'Also loaded', element: 'span', elementPath: 'body > span', timestamp: 2000 },
    ]
    // Default scope is 'domain-port', so pre-existing annotations must be keyed by origin.
    storage.set(STORAGE_KEY, JSON.stringify({
      [new URL(window.location.href).origin]: preExisting,
    }))

    vi.resetModules()
    const mod = await import('../../src/composables/useAnnotations')
    const { annotations, addAnnotation } = mod.useAnnotations()

    expect(annotations.value).toHaveLength(2)
    expect(annotations.value[0].comment).toBe('Loaded')
    expect(annotations.value[1].comment).toBe('Also loaded')

    const next = addAnnotation(makeAnnotation({ comment: 'New' }))
    expect(next.id).toBe('3')
  })

  it('"domain" scope: different ports and different paths/query/hash on the same hostname share annotations', () => {
    setAnnotationScope('domain')
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://ex.com:3000/a?q=1')
    addAnnotation(makeAnnotation({ comment: 'Port 3000' }))
    expect(annotations.value).toHaveLength(1)

    // Different port, different path, different query/hash -- still shares under 'domain'.
    setScopeUrl('https://ex.com:4000/b#h')
    expect(annotations.value).toHaveLength(1)
    expect(annotations.value[0].comment).toBe('Port 3000')
  })

  it('"domain" scope does not share annotations across different hostnames', () => {
    setAnnotationScope('domain')
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://ex.com:3000/a')
    addAnnotation(makeAnnotation({ comment: 'Ex' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://other.com:3000/a')
    expect(annotations.value).toEqual([])
  })

  it('keeps annotation.url as the full page URL under "domain" scope (schema compliance)', () => {
    setAnnotationScope('domain')
    const { addAnnotation } = useAnnotations('https://ex.com:3000/a?q=1#h')
    const result = addAnnotation(makeAnnotation())

    expect(result.url).toBe('https://ex.com:3000/a?q=1#h')
  })

  it('defaults to "domain-port" scope: annotations persist across different paths/query/hash on the same origin', () => {
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://example.com:3000/a?x=1')
    addAnnotation(makeAnnotation({ comment: 'Page A' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://example.com:3000/b#frag')
    expect(annotations.value).toHaveLength(1)
    expect(annotations.value[0].comment).toBe('Page A')
  })

  it('"domain-port" scope (default) key includes the port: different ports do not share annotations', () => {
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://example.com:3000/a')
    addAnnotation(makeAnnotation({ comment: 'Port 3000' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://example.com:4000/a')
    expect(annotations.value).toEqual([])
  })

  it('"domain-port" scope (default) never shares annotations across different origins', () => {
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://example.com/a')
    addAnnotation(makeAnnotation({ comment: 'Example' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://other-domain.com/a')
    expect(annotations.value).toEqual([])
  })

  it('keeps annotation.url as the full page URL under "domain-port" scope (schema compliance)', () => {
    const { addAnnotation } = useAnnotations('https://example.com:3000/a?x=1#frag')
    const result = addAnnotation(makeAnnotation())

    expect(result.url).toBe('https://example.com:3000/a?x=1#frag')
  })

  it('setAnnotationScope switches strategy at runtime and re-scopes accordingly', () => {
    const { addAnnotation, annotations, setAnnotationScope } = useAnnotations('https://example.com/a')
    addAnnotation(makeAnnotation({ comment: 'Domain-port scoped' }))
    expect(annotations.value).toHaveLength(1)

    // Switching to 'path' re-keys off origin+pathname ('https://example.com/a'), which has
    // no data stored under it yet (the annotation above was saved under the origin key).
    setAnnotationScope('path')
    expect(annotations.value).toEqual([])

    // Switching back to 'domain-port' re-keys off the origin and finds the annotation again.
    setAnnotationScope('domain-port')
    expect(annotations.value).toHaveLength(1)
    expect(annotations.value[0].comment).toBe('Domain-port scoped')
  })

  it('"path" scope: annotations persist across different query/hash on the same origin+pathname', () => {
    setAnnotationScope('path')
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://ex.com:3000/dashboard?tab=1')
    addAnnotation(makeAnnotation({ comment: 'Dashboard' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://ex.com:3000/dashboard?tab=2#section')
    expect(annotations.value).toHaveLength(1)
    expect(annotations.value[0].comment).toBe('Dashboard')
  })

  it('"path" scope does not carry annotations over to a different pathname on the same origin', () => {
    setAnnotationScope('path')
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://ex.com:3000/dashboard')
    addAnnotation(makeAnnotation({ comment: 'Dashboard' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://ex.com:3000/settings')
    expect(annotations.value).toEqual([])
  })

  it('"path" scope never shares annotations across different origins/ports', () => {
    setAnnotationScope('path')
    const { addAnnotation, annotations, setScopeUrl } = useAnnotations('https://ex.com:3000/dashboard')
    addAnnotation(makeAnnotation({ comment: 'Dashboard' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://ex.com:4000/dashboard')
    expect(annotations.value).toEqual([])

    setScopeUrl('https://other.com:3000/dashboard')
    expect(annotations.value).toEqual([])
  })

  it('keeps annotation.url as the full page URL under "path" scope (schema compliance)', () => {
    setAnnotationScope('path')
    const { addAnnotation } = useAnnotations('https://ex.com:3000/dashboard?tab=1#section')
    const result = addAnnotation(makeAnnotation())

    expect(result.url).toBe('https://ex.com:3000/dashboard?tab=1#section')
  })

  it('clearAnnotations only affects the current scope key, leaving other scopes intact', () => {
    const { addAnnotation, annotations, setScopeUrl, clearAnnotations } = useAnnotations('https://origin-a.com/page')
    addAnnotation(makeAnnotation({ comment: 'Origin A' }))
    expect(annotations.value).toHaveLength(1)

    setScopeUrl('https://origin-b.com/page')
    addAnnotation(makeAnnotation({ comment: 'Origin B' }))
    expect(annotations.value).toHaveLength(1)

    clearAnnotations()
    expect(annotations.value).toEqual([])

    const raw = storage.get(STORAGE_KEY)
    const parsed = JSON.parse(raw!)
    expect(parsed[new URL('https://origin-b.com/page').origin]).toBeUndefined()
    expect(parsed[new URL('https://origin-a.com/page').origin]).toHaveLength(1)
    expect(parsed[new URL('https://origin-a.com/page').origin][0].comment).toBe('Origin A')

    setScopeUrl('https://origin-a.com/page')
    expect(annotations.value).toHaveLength(1)
    expect(annotations.value[0].comment).toBe('Origin A')
  })

  it('supports overriding the storage adapter', () => {
    const customStorage = new Map<string, string>()
    setAnnotationStorage({
      getItem: key => customStorage.get(key) ?? null,
      setItem: (key, value) => { customStorage.set(key, value) },
    })

    const { addAnnotation } = useAnnotations()
    addAnnotation(makeAnnotation({ comment: 'Custom storage' }))

    const raw = customStorage.get(STORAGE_KEY)
    expect(raw).toBeDefined()
    expect(storage.get(STORAGE_KEY)).toBeUndefined()
  })

  it('resetAnnotationStorage restores the default adapter', () => {
    setAnnotationStorage({
      getItem: () => null,
      setItem: () => {},
    })

    resetAnnotationStorage()

    const { addAnnotation } = useAnnotations()
    addAnnotation(makeAnnotation({ comment: 'Default restored' }))

    expect(storage.get(STORAGE_KEY)).toBeDefined()
  })
})
