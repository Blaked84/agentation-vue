import { generateSelector, getElementName, getElementPath } from '../../src/utils/selectors'

// jsdom doesn't provide CSS.escape — polyfill it
if (typeof globalThis.CSS === 'undefined') {
  (globalThis as any).CSS = { escape: (s: string) => s.replace(/([#.:[\]()>+~=^$*!|/\\])/g, '\\$1') }
} else if (!CSS.escape) {
  CSS.escape = (s: string) => s.replace(/([#.:[\]()>+~=^$*!|/\\])/g, '\\$1')
}

let container: HTMLDivElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  container.remove()
})

describe('generateSelector', () => {
  it('returns #id when element has a unique ID', () => {
    container.innerHTML = '<button id="myid">Click</button>'
    const el = container.querySelector('#myid')!
    expect(generateSelector(el)).toBe('#myid')
  })

  it('returns tag.class selector when classes are unique in document', () => {
    container.innerHTML = '<div class="sidebar primary">content</div>'
    const el = container.querySelector('.sidebar')!
    expect(generateSelector(el)).toBe('div.sidebar.primary')
  })

  it('filters out hash classes and keeps only meaningful classes', () => {
    container.innerHTML = '<span class="badge css-abc123 _foobar123456">text</span>'
    const el = container.querySelector('.badge')!
    expect(generateSelector(el)).toBe('span.badge')
  })

  it('falls back to parent > child when class selector is ambiguous across parents', () => {
    container.innerHTML = `
      <nav class="menu">
        <a class="link">One</a>
      </nav>
      <footer>
        <a class="link">Two</a>
      </footer>
    `
    const target = container.querySelector('nav .link')!
    const result = generateSelector(target)
    expect(result).toBe('nav.menu > a.link')
  })

  it('falls back to nth-child when element has no classes or ID', () => {
    container.innerHTML = '<div></div><div></div><div></div>'
    const el = container.children[1] as Element
    const result = generateSelector(el)
    expect(result).toMatch(/> div:nth-child\(2\)$/)
  })

  it('bubbles SVG child elements up to the parent <svg>', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = 'my-svg'
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    svg.appendChild(circle)
    container.appendChild(svg)

    expect(generateSelector(circle)).toBe('#my-svg')
  })

  it('filters out __va- prefixed classes', () => {
    container.innerHTML = '<div class="card __va-tooltip">content</div>'
    const el = container.querySelector('.card')!
    expect(generateSelector(el)).toBe('div.card')
  })
})

describe('getElementName', () => {
  it('returns quoted text and tag for a button with text', () => {
    container.innerHTML = '<button>Click Me</button>'
    const el = container.querySelector('button')!
    expect(getElementName(el)).toBe('"Click Me" button')
  })

  it('truncates text longer than 30 characters', () => {
    const longText = 'This is a very long button label that exceeds thirty characters easily'
    container.innerHTML = `<button>${longText}</button>`
    const el = container.querySelector('button')!
    expect(getElementName(el)).toBe(`"${longText.slice(0, 30)}..." button`)
  })

  it('falls through to class/tag fallback for an empty button', () => {
    container.innerHTML = '<button class="submit-btn"></button>'
    const el = container.querySelector('button')!
    expect(getElementName(el)).toBe('button.submit-btn')
  })

  it('returns img[alt="..."] for an image with alt text', () => {
    container.innerHTML = '<img alt="logo" />'
    const el = container.querySelector('img')!
    expect(getElementName(el)).toBe('img[alt="logo"]')
  })

  it('returns input[placeholder="..."] for an input with placeholder', () => {
    container.innerHTML = '<input placeholder="Search..." />'
    const el = container.querySelector('input')!
    expect(getElementName(el)).toBe('input[placeholder="Search..."]')
  })

  it('returns input[type="email"] for a typed input', () => {
    container.innerHTML = '<input type="email" />'
    const el = container.querySelector('input')!
    expect(getElementName(el)).toBe('input[type="email"]')
  })

  it('returns input[type="text"] for an input with no attributes', () => {
    container.innerHTML = '<input />'
    const el = container.querySelector('input')!
    expect(getElementName(el)).toBe('input[type="text"]')
  })

  it('returns tag.classes for a div with meaningful classes', () => {
    container.innerHTML = '<div class="sidebar">content</div>'
    const el = container.querySelector('.sidebar')!
    expect(getElementName(el)).toBe('div.sidebar')
  })

  it('returns <tag> for an element with no classes or special attributes', () => {
    container.innerHTML = '<section>content</section>'
    const el = container.querySelector('section')!
    expect(getElementName(el)).toBe('<section>')
  })
})

describe('getElementPath', () => {
  it('builds a path through nested elements', () => {
    container.innerHTML = '<main><div>content</div></main>'
    const el = container.querySelector('div')!
    const result = getElementPath(el)
    expect(result).toContain('main > div')
  })

  it('stops at an element with an ID', () => {
    container.innerHTML = '<div id="app"><span>text</span></div>'
    const el = container.querySelector('span')!
    expect(getElementPath(el)).toBe('div#app > span')
  })

  it('includes meaningful classes in path segments', () => {
    container.innerHTML = '<nav class="main-nav"><ul class="menu"><li>item</li></ul></nav>'
    const el = container.querySelector('li')!
    const result = getElementPath(el)
    expect(result).toContain('nav.main-nav')
    expect(result).toContain('ul.menu')
    expect(result).toContain('li')
  })

  it('excludes hash classes from path segments', () => {
    container.innerHTML = '<div class="wrapper css-x7f9a2"><p class="_abc123456 content">text</p></div>'
    const el = container.querySelector('p')!
    const result = getElementPath(el)
    expect(result).toContain('div.wrapper')
    expect(result).toContain('p.content')
    expect(result).not.toContain('css-x7f9a2')
    expect(result).not.toContain('_abc123456')
  })
})
