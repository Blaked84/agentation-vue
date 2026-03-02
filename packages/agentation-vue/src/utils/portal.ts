import { VA_DATA_ATTR } from '../constants'

export function createPortalContainer(): HTMLElement {
  const container = document.createElement('div')
  container.id = '__va-portal'
  container.setAttribute(VA_DATA_ATTR, '')
  document.body.appendChild(container)
  return container
}

export function destroyPortalContainer(el: HTMLElement) {
  el.remove()
}
