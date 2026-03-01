export function createPortalContainer(): HTMLElement {
  const container = document.createElement('div')
  container.id = '__va-portal'
  container.setAttribute('data-agentation-vue', '')
  document.body.appendChild(container)
  return container
}

export function destroyPortalContainer(el: HTMLElement) {
  el.remove()
}
