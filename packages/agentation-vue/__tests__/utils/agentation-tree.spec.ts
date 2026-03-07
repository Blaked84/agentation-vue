import { getDeepActiveElement, isInsideAgentationTree } from '../../src/utils/agentation-tree'

describe('agentation-tree helpers', () => {
  it('detects nodes inside the Agentation tree directly', () => {
    const host = document.createElement('div')
    host.setAttribute('data-agentation-vue', '')
    const child = document.createElement('button')
    host.appendChild(child)
    document.body.appendChild(host)

    expect(isInsideAgentationTree(child)).toBe(true)

    host.remove()
  })

  it('detects nodes inside the Agentation tree through a composed path', () => {
    const host = document.createElement('div')
    host.setAttribute('data-agentation-vue', '')
    const child = document.createElement('button')

    const event = {
      composedPath: () => [child, host, document.body, document, window],
    } as unknown as Event

    expect(isInsideAgentationTree(host, event)).toBe(true)
  })

  it('resolves the deepest active element across open shadow roots', () => {
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    shadowRoot.appendChild(input)
    document.body.appendChild(host)

    input.focus()

    expect(getDeepActiveElement()).toBe(input)

    host.remove()
  })
})
