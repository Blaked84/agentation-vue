import type { Ref } from 'vue-demi'
import { onBeforeUnmount, onMounted } from 'vue-demi'

const MODAL_OPEN_EVENT = 'va:modal-open'

interface VaWindow extends Window {
  __vaDialogPatched?: boolean
}

function isDialogElement(target: unknown): target is HTMLDialogElement {
  return (
    typeof HTMLDialogElement !== 'undefined'
    && target instanceof HTMLDialogElement
  )
}

function patchShowModal() {
  if (typeof window === 'undefined' || typeof HTMLDialogElement === 'undefined')
    return
  const win = window as VaWindow
  if (win.__vaDialogPatched)
    return
  const originalShowModal = HTMLDialogElement.prototype.showModal
  if (typeof originalShowModal !== 'function')
    return
  win.__vaDialogPatched = true

  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    originalShowModal.call(this)
    this.dispatchEvent(new CustomEvent(MODAL_OPEN_EVENT, { bubbles: true }))
  }
}

function isOpenModalDialog(el: Element): el is HTMLDialogElement {
  if (!isDialogElement(el) || !el.open)
    return false
  try {
    return el.matches(':modal')
  }
  catch {
    return false
  }
}

/**
 * `dialog.showModal()` paints the dialog in the top layer (above any z-index)
 * and makes every node outside it inert. The library UI lives under `body`,
 * so it would be invisible and impossible to interact with — typing in the
 * annotation input included. While a modal dialog is open, the root element
 * is re-hosted inside that dialog; document-relative marker coordinates keep
 * working because the root is pinned at the document origin via scroll offsets.
 */
export function useModalDialogHost(rootEl: Ref<HTMLElement | null>) {
  const modalStack: HTMLDialogElement[] = []
  let homeParent: ParentNode | null = null
  let currentHost: HTMLDialogElement | null = null
  let removalObserver: MutationObserver | null = null
  let offsetRafId: number | null = null

  function topModal(): HTMLDialogElement | null {
    for (let i = modalStack.length - 1; i >= 0; i--) {
      const dialog = modalStack[i]!
      if (dialog.isConnected && dialog.open)
        return dialog
      modalStack.splice(i, 1)
    }
    return null
  }

  function updateOffsets() {
    const el = rootEl.value
    if (!el || !currentHost)
      return
    el.style.top = `${-(window.scrollY || document.documentElement.scrollTop)}px`
    el.style.left = `${-(window.scrollX || document.documentElement.scrollLeft)}px`
    el.style.width = `${window.innerWidth}px`
  }

  function scheduleOffsetUpdate() {
    if (offsetRafId !== null)
      return
    offsetRafId = requestAnimationFrame(() => {
      offsetRafId = null
      updateOffsets()
    })
  }

  function hostIn(dialog: HTMLDialogElement) {
    const el = rootEl.value
    if (!el)
      return
    if (!homeParent)
      homeParent = el.parentNode
    dialog.appendChild(el)
    el.classList.add('__va-root--in-dialog')
    currentHost = dialog
    updateOffsets()
    window.addEventListener('scroll', scheduleOffsetUpdate, { passive: true })
    window.addEventListener('resize', scheduleOffsetUpdate, { passive: true })
    // A dialog can leave the DOM without firing `close` (v-if, route change)
    removalObserver = new MutationObserver(() => {
      if (currentHost && !currentHost.isConnected)
        sync()
    })
    removalObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  }

  function unhost() {
    const el = rootEl.value
    currentHost = null
    removalObserver?.disconnect()
    removalObserver = null
    window.removeEventListener('scroll', scheduleOffsetUpdate)
    window.removeEventListener('resize', scheduleOffsetUpdate)
    if (offsetRafId !== null) {
      cancelAnimationFrame(offsetRafId)
      offsetRafId = null
    }
    if (!el)
      return
    el.classList.remove('__va-root--in-dialog')
    el.style.removeProperty('top')
    el.style.removeProperty('left')
    el.style.removeProperty('width')
    const home = homeParent?.isConnected ? homeParent : document.body
    home.appendChild(el)
  }

  function sync() {
    const target = topModal()
    if (target === currentHost)
      return
    if (currentHost)
      unhost()
    if (target)
      hostIn(target)
  }

  function onModalOpen(e: Event) {
    if (!isDialogElement(e.target))
      return
    const index = modalStack.indexOf(e.target)
    if (index !== -1)
      modalStack.splice(index, 1)
    modalStack.push(e.target)
    sync()
  }

  function onDialogClose(e: Event) {
    if (!isDialogElement(e.target))
      return
    const index = modalStack.indexOf(e.target)
    if (index === -1)
      return
    modalStack.splice(index, 1)
    sync()
  }

  onMounted(() => {
    patchShowModal()
    document.addEventListener(MODAL_OPEN_EVENT, onModalOpen)
    // `close` does not bubble; a capture listener on document still sees it
    document.addEventListener('close', onDialogClose, true)
    // Pick up modal dialogs opened before the library mounted
    for (const dialog of Array.from(document.querySelectorAll('dialog[open]'))) {
      if (isOpenModalDialog(dialog))
        modalStack.push(dialog)
    }
    sync()
  })

  onBeforeUnmount(() => {
    document.removeEventListener(MODAL_OPEN_EVENT, onModalOpen)
    document.removeEventListener('close', onDialogClose, true)
    if (currentHost)
      unhost()
  })
}
