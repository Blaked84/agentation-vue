import { guardAttributes } from '../../src/utils/attribute-guard'

async function flushMutations() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('guardAttributes', () => {
  it('strips inert and aria-hidden already present', () => {
    const el = document.createElement('div')
    el.setAttribute('inert', '')
    el.setAttribute('aria-hidden', 'true')

    const stop = guardAttributes(el)

    expect(el.hasAttribute('inert')).toBe(false)
    expect(el.hasAttribute('aria-hidden')).toBe(false)
    stop()
  })

  it('strips inert and aria-hidden applied later by modal libraries', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const stop = guardAttributes(el)

    el.setAttribute('inert', '')
    el.setAttribute('aria-hidden', 'true')
    await flushMutations()

    expect(el.hasAttribute('inert')).toBe(false)
    expect(el.hasAttribute('aria-hidden')).toBe(false)

    stop()
    el.remove()
  })

  it('leaves other attributes alone and stops observing after cleanup', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const stop = guardAttributes(el)

    el.setAttribute('data-custom', 'x')
    await flushMutations()
    expect(el.getAttribute('data-custom')).toBe('x')

    stop()
    el.setAttribute('inert', '')
    await flushMutations()
    expect(el.hasAttribute('inert')).toBe(true)
    el.remove()
  })
})
