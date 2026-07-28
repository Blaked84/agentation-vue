import type { Annotation } from '../../src/types'
import {
  resolveAnnotationTarget,
  shouldRenderAnnotationMarker,
} from '../../src/utils/annotation-target'

function makeAnnotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: '1',
    x: 50,
    y: 200,
    comment: 'Test',
    element: 'button',
    elementPath: '.target',
    timestamp: 1,
    url: 'https://example.com/source',
    ...overrides,
  }
}

describe('annotation targets', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('resolves a valid selector and rebuilds the internal target reference', () => {
    const target = document.createElement('button')
    target.className = 'target'
    document.body.appendChild(target)
    const annotation = makeAnnotation()

    expect(resolveAnnotationTarget(annotation)).toBe(target)
    expect(annotation._targetRef?.deref()).toBe(target)
  })

  it('ignores selectors that resolve inside Agentation UI', () => {
    document.body.innerHTML = `
      <div data-agentation-vue>
        <button class="target"></button>
      </div>
    `
    const annotation = makeAnnotation()

    expect(resolveAnnotationTarget(annotation)).toBeNull()
    expect(annotation._targetRef).toBeUndefined()
  })

  it('handles invalid selectors without throwing', () => {
    const annotation = makeAnnotation({ elementPath: '[invalid' })

    expect(() => resolveAnnotationTarget(annotation)).not.toThrow()
    expect(resolveAnnotationTarget(annotation)).toBeNull()
  })

  it('renders current-page and resolvable foreign markers, but not unresolved foreign markers', () => {
    const annotation = makeAnnotation()

    expect(shouldRenderAnnotationMarker(annotation, annotation.url!, false)).toBe(true)
    expect(shouldRenderAnnotationMarker(annotation, 'https://example.com/other', false)).toBe(false)

    const target = document.createElement('button')
    document.body.appendChild(target)
    annotation._targetRef = new WeakRef(target)

    expect(shouldRenderAnnotationMarker(annotation, 'https://example.com/other', true)).toBe(true)
  })
})
