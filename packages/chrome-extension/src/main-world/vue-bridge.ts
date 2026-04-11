const REQUEST_EVENT = 'agentation:detect-vue:request'
const RESPONSE_EVENT = 'agentation:detect-vue:response'
const HOST_ID = '__agentation-ext-host'
const EXPANDED_TOOLBAR_SELECTOR = '.__va-toolbar.__va-toolbar--expanded'
const SHORTCUT_BUTTON_LABELS: Record<string, string> = {
  v: 'Element selector',
  a: 'Area selection',
  p: 'Pause animations',
  c: 'Copy annotations',
  backspace: 'Clear annotations',
  escape: 'Minimize',
  settings: 'Settings',
}

interface VueInstance {
  parent?: VueInstance
  type?: { name?: string, __name?: string, __file?: string }
  $parent?: VueInstance
  $options?: { name?: string, _componentTag?: string, __file?: string }
}

type ShortcutScope = 'closed' | 'settings' | 'input' | 'open'

declare global {
  interface Window {
    __agentationVueBridgeInstalled?: boolean
  }
}

const suppressedKeyUps = new Set<string>()
const suppressedKeyPresses = new Set<string>()

function getAgentationShadowRoot(): ShadowRoot | null {
  return document.getElementById(HOST_ID)?.shadowRoot ?? null
}

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key.toLowerCase()
}

function getDeepActiveElement(root: Document | ShadowRoot = document): Element | null {
  const activeElement = root.activeElement
  if (!activeElement)
    return null
  if (activeElement instanceof HTMLElement && activeElement.shadowRoot)
    return getDeepActiveElement(activeElement.shadowRoot) ?? activeElement
  return activeElement
}

function isInsideAgentationTree(target: EventTarget | null): boolean {
  const shadowRoot = getAgentationShadowRoot()
  return !!shadowRoot && target instanceof Node && shadowRoot.contains(target)
}

function isForeignEditable(): boolean {
  const active = getDeepActiveElement()
  if (!active)
    return false
  const tag = active.tagName.toLowerCase()
  const isEditable = tag === 'input' || tag === 'textarea'
    || (active as HTMLElement).isContentEditable
  if (!isEditable)
    return false
  return !isInsideAgentationTree(active)
}

function getToolbarButton(shadowRoot: ShadowRoot, normalizedKey: string): HTMLButtonElement | null {
  const label = SHORTCUT_BUTTON_LABELS[normalizedKey]
  if (!label)
    return null

  const button = shadowRoot.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement | null
  if (!button)
    return null

  return button.disabled ? null : button
}

function getShortcutScope(shadowRoot: ShadowRoot): ShortcutScope {
  if (shadowRoot.querySelector('.__va-input'))
    return 'input'
  if (shadowRoot.querySelector('.__va-settings'))
    return 'settings'
  if (shadowRoot.querySelector(EXPANDED_TOOLBAR_SELECTOR))
    return 'open'
  return 'closed'
}

function getShortcutTarget(shadowRoot: ShadowRoot, normalizedKey: string): HTMLButtonElement | null {
  const scope = getShortcutScope(shadowRoot)

  if (scope === 'input') {
    if (normalizedKey !== 'escape')
      return null
    const inputCancelButton = shadowRoot.querySelector('.__va-input .__va-btn--secondary') as HTMLButtonElement | null
    return inputCancelButton && !inputCancelButton.disabled ? inputCancelButton : null
  }

  if (scope === 'settings') {
    return normalizedKey === 'escape' ? getToolbarButton(shadowRoot, 'settings') : null
  }

  if (scope !== 'open')
    return null

  return getToolbarButton(shadowRoot, normalizedKey)
}

function getShortcutTargetFromEvent(event: KeyboardEvent): HTMLButtonElement | null {
  if (event.metaKey || event.ctrlKey || event.altKey)
    return null
  if (isForeignEditable())
    return null
  const shadowRoot = getAgentationShadowRoot()
  if (!shadowRoot)
    return null
  return getShortcutTarget(shadowRoot, normalizeKey(event.key))
}

function consumeShortcutEvent(event: KeyboardEvent, suppressKeyUp = false) {
  event.preventDefault()
  event.stopImmediatePropagation()
  event.stopPropagation()
  if (suppressKeyUp) {
    suppressedKeyUps.add(normalizeKey(event.key))
    suppressedKeyPresses.add(normalizeKey(event.key))
  }
}

function onShortcutKeyDown(event: KeyboardEvent) {
  if (event.repeat)
    return
  const target = getShortcutTargetFromEvent(event)
  if (!target)
    return
  consumeShortcutEvent(event, true)
  target.click()
}

function onShortcutKeyUp(event: KeyboardEvent) {
  const normalizedKey = normalizeKey(event.key)
  if (!suppressedKeyUps.has(normalizedKey))
    return

  suppressedKeyUps.delete(normalizedKey)
  suppressedKeyPresses.delete(normalizedKey)
  consumeShortcutEvent(event)
}

function onShortcutKeyPress(event: KeyboardEvent) {
  const normalizedKey = normalizeKey(event.key)
  if (!suppressedKeyPresses.has(normalizedKey))
    return

  suppressedKeyPresses.delete(normalizedKey)
  consumeShortcutEvent(event)
}

function clearSuppressedKeyUps() {
  suppressedKeyUps.clear()
  suppressedKeyPresses.clear()
}

function inferNameFromFile(filePath: string): string | null {
  const file = filePath.split('/').pop()
  return file ? file.replace(/\.vue$/, '') : null
}

function getInstanceName(instance: VueInstance, includeFile: boolean): string | null {
  if (instance.$options) {
    const name = instance.$options.name || instance.$options._componentTag || inferNameFromFile(instance.$options.__file || '')
    if (!name)
      return null
    if (includeFile && instance.$options.__file) {
      return `${name} (${instance.$options.__file.split('/').pop()})`
    }
    return name
  }

  if (!instance.type)
    return null

  const name = instance.type.name || instance.type.__name || inferNameFromFile(instance.type.__file || '')
  if (!name)
    return null

  if (includeFile && instance.type.__file) {
    return `${name} (${instance.type.__file.split('/').pop()})`
  }

  return name
}

function getComponentFromElement(el: Element): VueInstance | null {
  const directVue2 = (el as Element & { __vue__?: VueInstance }).__vue__
  if (directVue2)
    return directVue2

  const directVue3 = (el as Element & { __vueParentComponent?: VueInstance }).__vueParentComponent
  if (directVue3)
    return directVue3

  let current = el.parentElement
  while (current && current !== document.body) {
    const vue2 = (current as Element & { __vue__?: VueInstance }).__vue__
    if (vue2)
      return vue2

    const vue3 = (current as Element & { __vueParentComponent?: VueInstance }).__vueParentComponent
    if (vue3)
      return vue3

    current = current.parentElement
  }

  return null
}

function walkComponentChain(instance: VueInstance, includeFile: boolean): string[] {
  const chain: string[] = []
  let current: VueInstance | undefined = instance
  let depth = 0

  while (current && depth < 20) {
    const name = getInstanceName(current, includeFile)
    if (name && !name.startsWith('_') && !/^App(?:\s*\(|$)/.test(name))
      chain.push(name)
    current = current.$parent || current.parent
    depth++
  }

  return chain.reverse()
}

function detectVueChainAtPoint(x: number, y: number, includeFile: boolean): string | undefined {
  const target = document.elementFromPoint(x, y)
  if (!target)
    return undefined

  const instance = getComponentFromElement(target)
  if (!instance)
    return undefined

  const chain = walkComponentChain(instance, includeFile)
  return chain.length > 0 ? chain.join(' > ') : undefined
}

if (!window.__agentationVueBridgeInstalled) {
  window.__agentationVueBridgeInstalled = true
  window.addEventListener('keydown', onShortcutKeyDown, true)
  window.addEventListener('keypress', onShortcutKeyPress, true)
  window.addEventListener('keyup', onShortcutKeyUp, true)
  window.addEventListener('blur', clearSuppressedKeyUps)
  document.addEventListener('visibilitychange', clearSuppressedKeyUps)

  document.addEventListener(REQUEST_EVENT, (event) => {
    const customEvent = event as CustomEvent<{ requestId: string, x: number, y: number, includeFile?: boolean }>
    const { requestId, x, y, includeFile = false } = customEvent.detail

    document.dispatchEvent(new CustomEvent(RESPONSE_EVENT, {
      detail: {
        requestId,
        chain: detectVueChainAtPoint(x, y, includeFile),
      },
    }))
  })
}

export {}
