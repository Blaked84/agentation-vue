let vueDetectionAvailable: boolean | null = null

const DEFAULT_STYLE_VALUES = new Set([
  'none',
  'normal',
  'auto',
  '0px',
  'rgba(0, 0, 0, 0)',
  'transparent',
  'static',
  'visible',
])

const TEXT_ELEMENTS = new Set([
  'p',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'label',
  'li',
  'td',
  'th',
  'blockquote',
  'figcaption',
  'caption',
  'legend',
  'dt',
  'dd',
  'pre',
  'code',
  'em',
  'strong',
  'b',
  'i',
  'a',
  'time',
  'cite',
  'q',
])

const FORM_INPUT_ELEMENTS = new Set(['input', 'textarea', 'select'])
const MEDIA_ELEMENTS = new Set(['img', 'video', 'canvas', 'svg'])
const CONTAINER_ELEMENTS = new Set([
  'div',
  'section',
  'article',
  'nav',
  'header',
  'footer',
  'aside',
  'main',
  'ul',
  'ol',
  'form',
  'fieldset',
])

interface VueInstance {
  // Vue 3
  parent?: VueInstance
  type?: { name?: string, __name?: string, __file?: string }
  // Vue 2
  $parent?: VueInstance
  $options?: { name?: string, _componentTag?: string, __file?: string }
}

function getComponentFromElement(el: Element): VueInstance | null {
  const v2 = (el as any).__vue__
  if (v2)
    return v2 as VueInstance

  const v3 = (el as any).__vueParentComponent
  if (v3)
    return v3 as VueInstance

  // Walk up DOM to find nearest component
  let current = el.parentElement
  while (current && current !== document.body) {
    const v2p = (current as any).__vue__
    if (v2p)
      return v2p as VueInstance
    const v3p = (current as any).__vueParentComponent
    if (v3p)
      return v3p as VueInstance
    current = current.parentElement
  }
  return null
}

function inferNameFromFile(filePath: string): string | null {
  const file = filePath.split('/').pop()
  if (!file)
    return null
  return file.replace(/\.vue$/, '')
}

function getInstanceName(inst: VueInstance, includeFile?: boolean): string | null {
  // Vue 2 path (prefer this when available: Vue 2.7 instances can also expose a partial `type`)
  if (inst.$options) {
    const name = inst.$options.name || inst.$options._componentTag || inferNameFromFile(inst.$options.__file || '')
    if (name) {
      if (includeFile && inst.$options.__file) {
        const file = inst.$options.__file.split('/').pop()
        return `${name} (${file})`
      }
      return name
    }
  }

  // Vue 3 path
  if (inst.type) {
    const name = inst.type.name || inst.type.__name || inferNameFromFile(inst.type.__file || '')
    if (!name)
      return null
    if (includeFile && inst.type.__file) {
      const file = inst.type.__file.split('/').pop()
      return `${name} (${file})`
    }
    return name
  }
  return null
}

function walkComponentChain(inst: VueInstance, includeFile?: boolean): string[] {
  const chain: string[] = []
  let current: VueInstance | undefined = inst
  let depth = 0

  while (current && depth < 20) {
    const name = getInstanceName(current, includeFile)
    if (name && !name.startsWith('_') && !/^App(?:\s*\(|$)/.test(name))
      chain.push(name)
    current = current.$parent || current.parent
    depth++
  }

  return chain.reverse() // root → leaf order
}

export function detectVueComponents(el: Element, includeFile = false): string | undefined {
  if (vueDetectionAvailable === false)
    return undefined

  const inst = getComponentFromElement(el)
  if (inst) {
    vueDetectionAvailable = true
    const chain = walkComponentChain(inst, includeFile)
    return chain.length > 0 ? chain.join(' > ') : undefined
  }

  if (vueDetectionAvailable === null) {
    vueDetectionAvailable = false
    return undefined
  }

  return undefined
}

export function isFixed(el: Element): boolean {
  let current: Element | null = el
  while (current && current !== document.body) {
    const position = getComputedStyle(current).position
    if (position === 'fixed' || position === 'sticky')
      return true
    current = current.parentElement
  }
  return false
}

export function getNearbyElements(el: Element, maxCount = 3): string {
  const nearby: string[] = []
  const parent = el.parentElement
  if (!parent)
    return ''

  for (const sibling of Array.from(parent.children)) {
    if (sibling === el)
      continue
    const tag = sibling.tagName.toLowerCase()
    const cls = Array.from(sibling.classList)
      .filter(c => !c.startsWith('__va-'))
      .slice(0, 2)
      .join('.')
    const name = cls ? `${tag}.${cls}` : tag
    nearby.push(`\`${name}\``)
    if (nearby.length >= maxCount)
      break
  }

  return nearby.join(', ')
}

export function getNearbyText(el: Element, maxLen = 140): string | undefined {
  const ownText = (el.textContent || '').replace(/\s+/g, ' ').trim()
  if (ownText.length >= 2) {
    return ownText.length > maxLen ? `${ownText.slice(0, maxLen)}...` : ownText
  }

  const parentText = (el.parentElement?.textContent || '').replace(/\s+/g, ' ').trim()
  if (parentText.length >= 2) {
    return parentText.length > maxLen ? `${parentText.slice(0, maxLen)}...` : parentText
  }

  return undefined
}
export function getRelevantComputedStyles(el: Element): Record<string, string> {
  const style = getComputedStyle(el)
  const tag = el.tagName.toLowerCase()
  const result: Record<string, string> = {}

  let properties: string[]
  if (TEXT_ELEMENTS.has(tag)) {
    properties = ['color', 'font-size', 'font-weight', 'font-family', 'line-height']
  }
  else if (tag === 'button' || (tag === 'a' && el.getAttribute('role') === 'button')) {
    properties = ['background-color', 'color', 'padding', 'border-radius', 'font-size']
  }
  else if (FORM_INPUT_ELEMENTS.has(tag)) {
    properties = ['background-color', 'color', 'padding', 'border-radius', 'font-size']
  }
  else if (MEDIA_ELEMENTS.has(tag)) {
    properties = ['width', 'height', 'object-fit', 'border-radius', 'background']
  }
  else if (CONTAINER_ELEMENTS.has(tag)) {
    properties = ['display', 'gap', 'padding', 'margin', 'background-color', 'border-radius']
  }
  else {
    properties = ['color', 'font-size', 'margin', 'padding', 'background-color']
  }

  for (const prop of properties) {
    const value = style.getPropertyValue(prop).trim()
    if (value && !DEFAULT_STYLE_VALUES.has(value))
      result[prop] = value
  }

  return result
}

export function getComputedStylesSummary(el: Element): string {
  const style = getComputedStyle(el)
  const props = [
    'display',
    'padding',
    'margin',
    'background-color',
    'color',
    'border-radius',
    'font-size',
    'font-weight',
    'width',
    'height',
    'position',
    'z-index',
    'opacity',
    'transition',
    'transform',
  ]
  return props
    .map(p => `${p}: ${style.getPropertyValue(p)}`)
    .filter((line) => {
      const [prop, val] = line.split(': ')
      if (!val)
        return false
      if (DEFAULT_STYLE_VALUES.has(val))
        return false
      if (['1', '400'].includes(val))
        return false
      if (prop === 'display' && val === 'block')
        return false
      if (prop === 'display' && val === 'inline')
        return false
      return true
    })
    .join('\n')
}

export function getAccessibilityInfo(el: Element): string | undefined {
  const parts: string[] = []
  const role = el.getAttribute('role')
  if (role)
    parts.push(`role="${role}"`)

  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith('aria-')) {
      parts.push(`${attr.name}="${attr.value}"`)
    }
  }

  return parts.length > 0 ? parts.join(', ') : undefined
}
