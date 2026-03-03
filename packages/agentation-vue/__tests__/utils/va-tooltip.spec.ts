import { vaTooltipDirective } from '../../src/directives/vaTooltip'

const directive = vaTooltipDirective as any

function bind(el: HTMLElement, value: unknown) {
  if (directive.beforeMount) {
    directive.beforeMount(el, { value })
    return
  }
  directive.bind(el, { value })
}

function update(el: HTMLElement, value: unknown) {
  if (directive.updated) {
    directive.updated(el, { value })
    return
  }
  directive.componentUpdated(el, { value })
}

function unbind(el: HTMLElement) {
  if (directive.unmounted) {
    directive.unmounted(el)
    return
  }
  directive.unbind(el)
}

function hover(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent('mouseenter'))
}

function leave(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent('mouseleave'))
}

describe('vaTooltipDirective', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('shows and hides a custom tooltip from string binding', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)

    bind(button, { text: 'Copy annotations', showDelay: 0 })
    hover(button)

    const tooltip = document.querySelector('.__va-tooltip') as HTMLElement | null
    expect(tooltip).not.toBeNull()
    expect(tooltip?.textContent).toContain('Copy annotations')
    expect(button.getAttribute('aria-label')).toBe('Copy annotations')

    leave(button)
    expect(document.querySelector('.__va-tooltip')).toBeNull()
  })

  it('renders a shortcut badge when provided', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)

    bind(button, { text: 'Copy feedback', shortcut: 'C', showDelay: 0 })
    hover(button)

    const shortcut = document.querySelector('.__va-tooltip-shortcut') as HTMLElement | null
    expect(shortcut?.textContent).toBe('C')
  })

  it('updates content and placement when the binding changes', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)

    bind(button, { text: 'Copy annotations', showDelay: 0 })
    hover(button)
    update(button, { text: 'Clear annotations', shortcut: 'Backspace', placement: 'bottom', showDelay: 0 })

    const tooltip = document.querySelector('.__va-tooltip') as HTMLElement | null
    expect(tooltip?.textContent).toContain('Clear annotations')
    expect(tooltip?.getAttribute('data-placement')).toBe('bottom')
    expect(tooltip?.textContent).toContain('Backspace')
  })

  it('does not show when host element is disabled', () => {
    const button = document.createElement('button')
    button.disabled = true
    document.body.appendChild(button)

    bind(button, { text: 'Copy annotations', showDelay: 0 })
    hover(button)

    expect(document.querySelector('.__va-tooltip')).toBeNull()

    button.disabled = false
    hover(button)
    expect(document.querySelector('.__va-tooltip')).not.toBeNull()
  })

  it('cleans tooltip and listeners on unbind', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)

    bind(button, { text: 'Settings', showDelay: 0 })
    hover(button)
    expect(document.querySelector('.__va-tooltip')).not.toBeNull()

    unbind(button)
    expect(document.querySelector('.__va-tooltip')).toBeNull()
    expect(button.hasAttribute('aria-label')).toBe(false)
  })

  it('waits for the default show delay before rendering', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)

    bind(button, 'Delayed tooltip')
    hover(button)

    expect(document.querySelector('.__va-tooltip')).toBeNull()
    vi.advanceTimersByTime(299)
    expect(document.querySelector('.__va-tooltip')).toBeNull()
    vi.advanceTimersByTime(1)
    expect(document.querySelector('.__va-tooltip')).not.toBeNull()
  })
})
