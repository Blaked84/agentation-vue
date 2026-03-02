import {
  getAccessibilityInfo,
  getComputedStylesSummary,
  getNearbyElements,
  isFixed,
} from '../../src/utils/dom-inspector'

// ---------------------------------------------------------------------------
// detectVueComponents — dynamic import per test to reset module-level cache
// ---------------------------------------------------------------------------
describe('detectVueComponents', () => {
  let detectVueComponents: typeof import('../../src/utils/dom-inspector').detectVueComponents
  let container: HTMLElement

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../../src/utils/dom-inspector')
    detectVueComponents = mod.detectVueComponents
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('detects Vue 3 component chain via __vueParentComponent', () => {
    const el = document.createElement('button')
    container.appendChild(el)
    ;(el as any).__vueParentComponent = {
      type: { name: 'MyButton' },
      parent: {
        type: { name: 'App' },
      },
    }

    expect(detectVueComponents(el)).toBe('App > MyButton')
  })

  it('falls back to __name for Vue 3 components', () => {
    const el = document.createElement('div')
    container.appendChild(el)
    ;(el as any).__vueParentComponent = {
      type: { __name: 'FooBar' },
    }

    expect(detectVueComponents(el)).toBe('FooBar')
  })

  it('falls back to __file for Vue 3 components', () => {
    const el = document.createElement('div')
    container.appendChild(el)
    ;(el as any).__vueParentComponent = {
      type: { __file: '/src/components/Widget.vue' },
    }

    expect(detectVueComponents(el)).toBe('Widget')
  })

  it('includes file path when includeFile is true', () => {
    const el = document.createElement('div')
    container.appendChild(el)
    ;(el as any).__vueParentComponent = {
      type: { name: 'Widget', __file: '/src/Widget.vue' },
    }

    expect(detectVueComponents(el, true)).toBe('Widget (Widget.vue)')
  })

  it('detects Vue 2 component chain via __vue__', () => {
    const el = document.createElement('span')
    container.appendChild(el)
    ;(el as any).__vue__ = {
      $options: { name: 'LegacyBtn' },
      $parent: {
        $options: { name: 'Root' },
      },
    }

    expect(detectVueComponents(el)).toBe('Root > LegacyBtn')
  })

  it('returns undefined when no Vue instance is found', () => {
    const el = document.createElement('div')
    container.appendChild(el)

    expect(detectVueComponents(el)).toBeUndefined()
  })

  it('walks up the DOM to find a Vue component on a parent element', () => {
    const parent = document.createElement('div')
    const child = document.createElement('span')
    parent.appendChild(child)
    container.appendChild(parent)

    ;(parent as any).__vueParentComponent = {
      type: { name: 'Wrapper' },
    }

    expect(detectVueComponents(child)).toBe('Wrapper')
  })

  it('filters out components whose names start with _', () => {
    const el = document.createElement('div')
    container.appendChild(el)
    ;(el as any).__vueParentComponent = {
      type: { name: 'Visible' },
      parent: {
        type: { name: '_internal' },
        parent: {
          type: { name: 'App' },
        },
      },
    }

    expect(detectVueComponents(el)).toBe('App > Visible')
  })
})

// ---------------------------------------------------------------------------
// isFixed
// ---------------------------------------------------------------------------
describe('isFixed', () => {
  let container: HTMLElement
  let spy: any

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    spy?.mockRestore()
  })

  it('returns true when the element itself has position: fixed', () => {
    const el = document.createElement('div')
    container.appendChild(el)

    spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((target) => {
      const styles: Record<string, string> = {}
      if (target === el)
        styles.position = 'fixed'
      else styles.position = 'static'
      return styles as unknown as CSSStyleDeclaration
    })

    expect(isFixed(el)).toBe(true)
  })

  it('returns true when a parent element has position: sticky', () => {
    const parent = document.createElement('div')
    const child = document.createElement('span')
    parent.appendChild(child)
    container.appendChild(parent)

    spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((target) => {
      const styles: Record<string, string> = {}
      if (target === parent)
        styles.position = 'sticky'
      else styles.position = 'static'
      return styles as unknown as CSSStyleDeclaration
    })

    expect(isFixed(child)).toBe(true)
  })

  it('returns false when all ancestors are position: static', () => {
    const el = document.createElement('div')
    container.appendChild(el)

    spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      return { position: 'static' } as unknown as CSSStyleDeclaration
    })

    expect(isFixed(el)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getNearbyElements
// ---------------------------------------------------------------------------
describe('getNearbyElements', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('returns sibling names as backtick-quoted, comma-separated strings', () => {
    const parent = document.createElement('div')
    const target = document.createElement('span')
    const sib1 = document.createElement('p')
    const sib2 = document.createElement('a')
    sib2.classList.add('link')

    parent.appendChild(sib1)
    parent.appendChild(target)
    parent.appendChild(sib2)
    container.appendChild(parent)

    const result = getNearbyElements(target)
    expect(result).toBe('`p`, `a.link`')
  })

  it('respects the maxCount parameter', () => {
    const parent = document.createElement('ul')
    const target = document.createElement('li')
    parent.appendChild(target)

    for (let i = 0; i < 5; i++) {
      const li = document.createElement('li')
      li.classList.add(`item-${i}`)
      parent.appendChild(li)
    }
    container.appendChild(parent)

    const result = getNearbyElements(target, 2)
    const items = result.split(', ')
    expect(items).toHaveLength(2)
  })

  it('filters out classes starting with __va-', () => {
    const parent = document.createElement('div')
    const target = document.createElement('div')
    const sibling = document.createElement('div')
    sibling.classList.add('__va-overlay', 'real-class')

    parent.appendChild(target)
    parent.appendChild(sibling)
    container.appendChild(parent)

    const result = getNearbyElements(target)
    expect(result).toBe('`div.real-class`')
    expect(result).not.toContain('__va-')
  })

  it('returns empty string when element has no parent', () => {
    const detached = document.createElement('div')
    expect(getNearbyElements(detached)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// getComputedStylesSummary
// ---------------------------------------------------------------------------
describe('getComputedStylesSummary', () => {
  let container: HTMLElement
  let spy: any

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    spy?.mockRestore()
  })

  it('returns non-default properties and filters out defaults', () => {
    const el = document.createElement('div')
    container.appendChild(el)

    const styleValues: Record<string, string> = {
      'display': 'flex',
      'padding': '10px',
      'margin': '0px',
      'background-color': 'rgba(0, 0, 0, 0)',
      'color': 'rgb(255, 0, 0)',
      'border-radius': 'none',
      'font-size': '16px',
      'font-weight': '400',
      'width': 'auto',
      'height': 'auto',
      'position': 'static',
      'z-index': 'auto',
      'opacity': '1',
      'transition': 'none',
      'transform': 'none',
    }

    spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      return {
        getPropertyValue: (prop: string) => styleValues[prop] ?? '',
      } as unknown as CSSStyleDeclaration
    })

    const result = getComputedStylesSummary(el)

    expect(result).toContain('display: flex')
    expect(result).toContain('padding: 10px')
    expect(result).toContain('color: rgb(255, 0, 0)')
    expect(result).toContain('font-size: 16px')

    expect(result).not.toContain('margin')
    expect(result).not.toContain('background-color')
    expect(result).not.toContain('border-radius')
    expect(result).not.toContain('font-weight')
    expect(result).not.toContain('width')
    expect(result).not.toContain('height')
    expect(result).not.toContain('position')
    expect(result).not.toContain('z-index')
    expect(result).not.toContain('opacity')
    expect(result).not.toContain('transition')
    expect(result).not.toContain('transform')
  })
})

// ---------------------------------------------------------------------------
// getAccessibilityInfo
// ---------------------------------------------------------------------------
describe('getAccessibilityInfo', () => {
  it('returns role attribute when present', () => {
    const el = document.createElement('nav')
    el.setAttribute('role', 'navigation')

    expect(getAccessibilityInfo(el)).toBe('role="navigation"')
  })

  it('includes aria-* attributes', () => {
    const el = document.createElement('button')
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', 'Close')
    el.setAttribute('aria-expanded', 'false')

    const result = getAccessibilityInfo(el)!
    expect(result).toContain('role="button"')
    expect(result).toContain('aria-label="Close"')
    expect(result).toContain('aria-expanded="false"')
  })

  it('returns undefined when no accessibility attributes are present', () => {
    const el = document.createElement('div')
    el.setAttribute('class', 'box')
    el.setAttribute('id', 'main')

    expect(getAccessibilityInfo(el)).toBeUndefined()
  })
})
