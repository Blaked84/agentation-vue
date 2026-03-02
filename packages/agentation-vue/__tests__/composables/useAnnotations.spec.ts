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

beforeEach(async () => {
  storage.clear()
  vi.resetModules()
  const mod = await import('../../src/composables/useAnnotations')
  useAnnotations = mod.useAnnotations
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

    const parsed = JSON.parse(raw!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].comment).toBe('Test')
  })

  it('serialization strips _targetRef from stored JSON', () => {
    const { addAnnotation } = useAnnotations()
    addAnnotation(makeAnnotation({
      _targetRef: new WeakRef(document.createElement('div')),
    }))

    const raw = storage.get(STORAGE_KEY)
    expect(raw).toBeDefined()

    const parsed = JSON.parse(raw!)
    expect(parsed[0]).not.toHaveProperty('_targetRef')
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
    storage.set(STORAGE_KEY, JSON.stringify(preExisting))

    vi.resetModules()
    const mod = await import('../../src/composables/useAnnotations')
    const { annotations, addAnnotation } = mod.useAnnotations()

    expect(annotations.value).toHaveLength(2)
    expect(annotations.value[0].comment).toBe('Loaded')
    expect(annotations.value[1].comment).toBe('Also loaded')

    const next = addAnnotation(makeAnnotation({ comment: 'New' }))
    expect(next.id).toBe('3')
  })
})
