const HASH_CLASS_PATTERNS = [
  /^[a-z]+-[a-zA-Z0-9]{5,}$/,
  /^css-[a-z0-9]+$/,
  /^_[a-zA-Z0-9]{6,}$/,
  /^__/,
  /^svelte-/,
  /^emotion-/,
]

function isHashClass(cls: string): boolean {
  return HASH_CLASS_PATTERNS.some(p => p.test(cls))
}

function getMeaningfulClasses(el: Element): string[] {
  return Array.from(el.classList).filter(c => !isHashClass(c) && !c.startsWith('__va-'))
}

function bubbleSvg(el: Element): Element {
  if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) {
    const svg = el.closest('svg')
    if (svg) return svg
  }
  return el
}

export function generateSelector(el: Element): string {
  el = bubbleSvg(el)

  if (el.id && document.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1) {
    return `#${el.id}`
  }

  const tag = el.tagName.toLowerCase()
  const classes = getMeaningfulClasses(el)

  if (classes.length > 0) {
    const selector = `${tag}.${classes.join('.')}`
    if (document.querySelectorAll(selector).length === 1) {
      return selector
    }

    const parent = el.parentElement
    if (parent) {
      const parentTag = parent.tagName.toLowerCase()
      const parentClasses = getMeaningfulClasses(parent)
      let parentSelector = parentTag
      if (parentClasses.length > 0) {
        parentSelector = `${parentTag}.${parentClasses[0]}`
      }
      const full = `${parentSelector} > ${selector}`
      if (document.querySelectorAll(full).length === 1) {
        return full
      }
    }
  }

  const parent = el.parentElement
  if (parent) {
    const siblings = Array.from(parent.children)
    const index = siblings.indexOf(el) + 1
    const parentSelector = parent === document.body ? 'body' : generateSelector(parent)
    return `${parentSelector} > ${tag}:nth-child(${index})`
  }

  return tag
}

export function getElementName(el: Element): string {
  el = bubbleSvg(el)
  const tag = el.tagName.toLowerCase()

  const textTags = ['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'span', 'p']
  if (textTags.includes(tag)) {
    const text = (el.textContent || '').trim()
    if (text.length > 0) {
      const truncated = text.length > 30 ? text.slice(0, 30) + '...' : text
      return `"${truncated}" ${tag}`
    }
  }

  if (tag === 'img') {
    const alt = el.getAttribute('alt')
    if (alt) return `img[alt="${alt}"]`
  }

  if (tag === 'input') {
    const placeholder = el.getAttribute('placeholder')
    if (placeholder) return `input[placeholder="${placeholder}"]`
    const type = el.getAttribute('type') || 'text'
    return `input[type="${type}"]`
  }

  const classes = getMeaningfulClasses(el)
  if (classes.length > 0) {
    return `${tag}.${classes.join('.')}`
  }

  return `<${tag}>`
}

export function getElementPath(el: Element): string {
  el = bubbleSvg(el)
  const parts: string[] = []
  let current: Element | null = el

  while (current && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase()
    const classes = getMeaningfulClasses(current)
    if (current.id) {
      parts.unshift(`${tag}#${current.id}`)
      break
    } else if (classes.length > 0) {
      parts.unshift(`${tag}.${classes.join('.')}`)
    } else {
      parts.unshift(tag)
    }
    current = current.parentElement
  }

  return parts.join(' > ')
}
