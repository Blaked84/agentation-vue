export type VaTooltipPlacement = 'top' | 'bottom'

export interface VaTooltipOptions {
  text: string
  shortcut?: string
  placement?: VaTooltipPlacement
  offset?: number
  showDelay?: number
  disabled?: boolean
}

export type VaTooltipValue = string | VaTooltipOptions | null | undefined

interface NormalizedTooltipOptions {
  text: string
  shortcut?: string
  placement: VaTooltipPlacement
  offset: number
  showDelay: number
}

interface DirectiveBindingLike {
  value: VaTooltipValue
}

interface TooltipState {
  value: NormalizedTooltipOptions | null
  tooltipEl: HTMLDivElement | null
  ownsAriaLabel: boolean
  showTimer: ReturnType<typeof setTimeout> | null
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
  onPointerDown: () => void
  onKeyDown: (event: KeyboardEvent) => void
  onWindowReposition: () => void
}

const TOOLTIP_STATE_KEY = '__vaTooltipState' as const
const TOOLTIP_MARGIN = 8
const DEFAULT_OFFSET = 12
const DEFAULT_SHOW_DELAY = 300

type TooltipHostElement = HTMLElement & {
  [TOOLTIP_STATE_KEY]?: TooltipState
}

function normalizeTooltipValue(value: VaTooltipValue): NormalizedTooltipOptions | null {
  if (!value)
    return null

  if (typeof value === 'string') {
    const text = value.trim()
    if (!text)
      return null
    return {
      text,
      placement: 'top',
      offset: DEFAULT_OFFSET,
      showDelay: DEFAULT_SHOW_DELAY,
    }
  }

  if (typeof value !== 'object')
    return null

  if (value.disabled)
    return null

  const text = typeof value.text === 'string' ? value.text.trim() : ''
  if (!text)
    return null

  const shortcut = typeof value.shortcut === 'string' ? value.shortcut.trim() : undefined
  const placement = value.placement === 'bottom' ? 'bottom' : 'top'
  const offset = Number.isFinite(value.offset) ? Math.max(4, Number(value.offset)) : DEFAULT_OFFSET
  const showDelay = Number.isFinite(value.showDelay) ? Math.max(0, Number(value.showDelay)) : DEFAULT_SHOW_DELAY

  return {
    text,
    shortcut: shortcut || undefined,
    placement,
    offset,
    showDelay,
  }
}

function getState(el: TooltipHostElement): TooltipState | undefined {
  return el[TOOLTIP_STATE_KEY]
}

function isHostDisabled(el: TooltipHostElement): boolean {
  if ('disabled' in el)
    return Boolean((el as HTMLButtonElement).disabled)
  return false
}

function getTooltipContainer(el: TooltipHostElement): Node {
  const root = el.getRootNode()
  if (root instanceof ShadowRoot)
    return root
  return document.body
}

function createTooltipElement(value: NormalizedTooltipOptions): HTMLDivElement {
  const tooltipEl = document.createElement('div')
  tooltipEl.className = '__va-tooltip'
  tooltipEl.setAttribute('role', 'tooltip')

  updateTooltipContent(tooltipEl, value)
  return tooltipEl
}

function updateTooltipContent(tooltipEl: HTMLDivElement, value: NormalizedTooltipOptions) {
  tooltipEl.innerHTML = ''
  tooltipEl.setAttribute('data-placement', value.placement)

  const labelEl = document.createElement('span')
  labelEl.className = '__va-tooltip-label'
  labelEl.textContent = value.text
  tooltipEl.appendChild(labelEl)

  if (value.shortcut) {
    const shortcutEl = document.createElement('kbd')
    shortcutEl.className = '__va-tooltip-shortcut'
    shortcutEl.textContent = value.shortcut
    tooltipEl.appendChild(shortcutEl)
  }

  const arrowEl = document.createElement('span')
  arrowEl.className = '__va-tooltip-arrow'
  arrowEl.setAttribute('aria-hidden', 'true')
  tooltipEl.appendChild(arrowEl)
}

function positionTooltip(el: TooltipHostElement) {
  const state = getState(el)
  if (!state?.value || !state.tooltipEl)
    return

  const tooltipEl = state.tooltipEl
  const hostRect = el.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  tooltipEl.style.left = '0px'
  tooltipEl.style.top = '0px'

  const tooltipRect = tooltipEl.getBoundingClientRect()
  let placement: VaTooltipPlacement = state.value.placement
  let top = placement === 'top'
    ? hostRect.top - tooltipRect.height - state.value.offset
    : hostRect.bottom + state.value.offset

  if (placement === 'top' && top < TOOLTIP_MARGIN) {
    placement = 'bottom'
    top = hostRect.bottom + state.value.offset
  }
  else if (placement === 'bottom' && top + tooltipRect.height > viewportHeight - TOOLTIP_MARGIN) {
    placement = 'top'
    top = hostRect.top - tooltipRect.height - state.value.offset
  }

  const centeredLeft = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2
  const maxLeft = Math.max(TOOLTIP_MARGIN, viewportWidth - tooltipRect.width - TOOLTIP_MARGIN)
  const left = Math.min(Math.max(centeredLeft, TOOLTIP_MARGIN), maxLeft)
  const maxTop = Math.max(TOOLTIP_MARGIN, viewportHeight - tooltipRect.height - TOOLTIP_MARGIN)

  tooltipEl.setAttribute('data-placement', placement)
  tooltipEl.style.left = `${Math.round(left)}px`
  tooltipEl.style.top = `${Math.round(Math.min(Math.max(top, TOOLTIP_MARGIN), maxTop))}px`
}

function attachWindowListeners(el: TooltipHostElement) {
  const state = getState(el)
  if (!state)
    return
  window.addEventListener('scroll', state.onWindowReposition, true)
  window.addEventListener('resize', state.onWindowReposition, { passive: true })
}

function detachWindowListeners(el: TooltipHostElement) {
  const state = getState(el)
  if (!state)
    return
  window.removeEventListener('scroll', state.onWindowReposition, true)
  window.removeEventListener('resize', state.onWindowReposition)
}

function clearShowTimer(el: TooltipHostElement) {
  const state = getState(el)
  if (!state?.showTimer)
    return
  clearTimeout(state.showTimer)
  state.showTimer = null
}

function showTooltipNow(el: TooltipHostElement) {
  const state = getState(el)
  if (!state?.value || isHostDisabled(el))
    return

  if (!state.tooltipEl)
    state.tooltipEl = createTooltipElement(state.value)
  else
    updateTooltipContent(state.tooltipEl, state.value)

  const container = getTooltipContainer(el)
  if (state.tooltipEl.parentNode !== container)
    container.appendChild(state.tooltipEl)

  positionTooltip(el)
  state.tooltipEl.classList.add('__va-tooltip--visible')
  attachWindowListeners(el)
}

function scheduleShowTooltip(el: TooltipHostElement) {
  const state = getState(el)
  if (!state?.value || isHostDisabled(el))
    return

  clearShowTimer(el)
  if (state.value.showDelay <= 0) {
    showTooltipNow(el)
    return
  }

  state.showTimer = setTimeout(() => {
    state.showTimer = null
    showTooltipNow(el)
  }, state.value.showDelay)
}

function hideTooltip(el: TooltipHostElement) {
  const state = getState(el)
  if (!state)
    return

  clearShowTimer(el)
  if (!state.tooltipEl)
    return

  detachWindowListeners(el)
  state.tooltipEl.classList.remove('__va-tooltip--visible')
  state.tooltipEl.remove()
}

function syncAriaLabel(el: TooltipHostElement) {
  const state = getState(el)
  if (!state)
    return

  if (!state.value && state.ownsAriaLabel) {
    el.removeAttribute('aria-label')
    state.ownsAriaLabel = false
    return
  }

  if (!state.value)
    return

  if (!el.hasAttribute('aria-label')) {
    el.setAttribute('aria-label', state.value.text)
    state.ownsAriaLabel = true
  }
  else if (state.ownsAriaLabel) {
    el.setAttribute('aria-label', state.value.text)
  }
}

function updateTooltipValue(el: TooltipHostElement, value: VaTooltipValue) {
  const state = getState(el)
  if (!state)
    return

  state.value = normalizeTooltipValue(value)
  syncAriaLabel(el)

  if (!state.value) {
    hideTooltip(el)
    return
  }

  if (state.tooltipEl) {
    updateTooltipContent(state.tooltipEl, state.value)
    positionTooltip(el)
  }
}

function bindTooltip(el: TooltipHostElement, binding: DirectiveBindingLike) {
  if (getState(el)) {
    updateTooltipValue(el, binding.value)
    return
  }

  const state: TooltipState = {
    value: null,
    tooltipEl: null,
    ownsAriaLabel: false,
    showTimer: null,
    onMouseEnter: () => scheduleShowTooltip(el),
    onMouseLeave: () => hideTooltip(el),
    onFocus: () => scheduleShowTooltip(el),
    onBlur: () => hideTooltip(el),
    onPointerDown: () => hideTooltip(el),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        hideTooltip(el)
    },
    onWindowReposition: () => positionTooltip(el),
  }
  el[TOOLTIP_STATE_KEY] = state

  el.addEventListener('mouseenter', state.onMouseEnter)
  el.addEventListener('mouseleave', state.onMouseLeave)
  el.addEventListener('focus', state.onFocus, true)
  el.addEventListener('blur', state.onBlur, true)
  el.addEventListener('pointerdown', state.onPointerDown)
  el.addEventListener('keydown', state.onKeyDown)

  updateTooltipValue(el, binding.value)
}

function unbindTooltip(el: TooltipHostElement) {
  const state = getState(el)
  if (!state)
    return

  hideTooltip(el)

  el.removeEventListener('mouseenter', state.onMouseEnter)
  el.removeEventListener('mouseleave', state.onMouseLeave)
  el.removeEventListener('focus', state.onFocus, true)
  el.removeEventListener('blur', state.onBlur, true)
  el.removeEventListener('pointerdown', state.onPointerDown)
  el.removeEventListener('keydown', state.onKeyDown)

  if (state.ownsAriaLabel)
    el.removeAttribute('aria-label')

  delete el[TOOLTIP_STATE_KEY]
}

export const vaTooltipDirective = {
  beforeMount(el: HTMLElement, binding: DirectiveBindingLike) {
    bindTooltip(el as TooltipHostElement, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBindingLike) {
    updateTooltipValue(el as TooltipHostElement, binding.value)
  },
  unmounted(el: HTMLElement) {
    unbindTooltip(el as TooltipHostElement)
  },
  bind(el: HTMLElement, binding: DirectiveBindingLike) {
    bindTooltip(el as TooltipHostElement, binding)
  },
  componentUpdated(el: HTMLElement, binding: DirectiveBindingLike) {
    updateTooltipValue(el as TooltipHostElement, binding.value)
  },
  unbind(el: HTMLElement) {
    unbindTooltip(el as TooltipHostElement)
  },
}

export default vaTooltipDirective
