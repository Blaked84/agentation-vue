import { VA_DATA_ATTR_SELECTOR } from '../constants'

function isElement(node: unknown): node is Element {
  return typeof Element !== 'undefined' && node instanceof Element
}

function hasAgentationAncestor(node: unknown): boolean {
  return isElement(node) && !!node.closest(VA_DATA_ATTR_SELECTOR)
}

export function isInsideAgentationTree(target: EventTarget | null, event?: Event): boolean {
  if (hasAgentationAncestor(target))
    return true

  if (!event || typeof event.composedPath !== 'function')
    return false

  return event.composedPath().some(hasAgentationAncestor)
}

export function getDeepActiveElement(root: Document | ShadowRoot = document): Element | null {
  let activeElement = root.activeElement

  while (activeElement && activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement
  }

  return activeElement
}
