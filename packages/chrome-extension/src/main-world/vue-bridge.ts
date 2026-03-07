const REQUEST_EVENT = 'agentation:detect-vue:request'
const RESPONSE_EVENT = 'agentation:detect-vue:response'

interface VueInstance {
  parent?: VueInstance
  type?: { name?: string, __name?: string, __file?: string }
  $parent?: VueInstance
  $options?: { name?: string, _componentTag?: string, __file?: string }
}

declare global {
  interface Window {
    __agentationVueBridgeInstalled?: boolean
  }
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
