import type { Annotation } from '../../src/types'
import { formatAnnotations, useOutputFormatter } from '../../src/composables/useOutputFormatter'

const baseAnnotation: Annotation = {
  id: 'ann-1',
  x: 50,
  y: 200,
  comment: 'This button needs better contrast',
  element: 'button',
  elementPath: 'body > main > div.container > button.cta',
  timestamp: 1709312400000,
  vueComponents: 'App > RouterView > HomePage',
  nearbyElements: 'input.search, span.label',
}

describe('formatAnnotations', () => {
  it('strips protocol from the URL in the header', () => {
    const output = formatAnnotations([], 'standard', 'https://example.com/page')
    expect(output).toContain('## Feedback — example.com/page')
    expect(output).not.toContain('https://')
  })

  it('formats a standard annotation with element, path, comment, components, and nearby', () => {
    const output = formatAnnotations([baseAnnotation], 'standard', 'https://example.com')

    expect(output).toContain('### 1. `button` — body > main > div.container > button.cta')
    expect(output).toContain('- **Comment:** This button needs better contrast')
    expect(output).toContain('- **Components:** App > RouterView > HomePage')
    expect(output).toContain('- **Path:** body > main > div.container > button.cta')
    expect(output).toContain('- **Nearby:** input.search, span.label')
  })

  it('formats a selected-text annotation with quoted title and "In element" line', () => {
    const ann: Annotation = {
      ...baseAnnotation,
      selectedText: 'Lorem ipsum',
    }
    const output = formatAnnotations([ann], 'standard', 'https://example.com')

    expect(output).toContain('### 1. "Lorem ipsum" (selected text)')
    expect(output).toContain('- **In element:** `button` — body > main > div.container > button.cta')
    expect(output).not.toContain('- **Path:**')
  })

  it('formats a multi-select annotation with element count and listed elements', () => {
    const ann: Annotation = {
      ...baseAnnotation,
      isMultiSelect: true,
      elements: [
        { element: 'button', elementPath: 'body > button.primary' },
        { element: 'a', elementPath: 'body > a.link' },
        { element: 'input', elementPath: 'body > input.field' },
      ],
    }
    const output = formatAnnotations([ann], 'standard', 'https://example.com')

    expect(output).toContain('### 1. Multi-selection (3 elements)')
    expect(output).toContain('- **Elements:**')
    expect(output).toContain('  - `button` — body > button.primary')
    expect(output).toContain('  - `a` — body > a.link')
    expect(output).toContain('  - `input` — body > input.field')
    expect(output).not.toContain('- **Path:**')
  })

  it('formats an area-select annotation with rounded dimensions', () => {
    const ann: Annotation = {
      ...baseAnnotation,
      isAreaSelect: true,
      area: { x: 10.7, y: 20.3, width: 300.9, height: 150.1 },
    }
    const output = formatAnnotations([ann], 'standard', 'https://example.com')

    expect(output).toContain('### 1. Area selection')
    expect(output).toContain('- **Area:** x: 11, y: 20, width: 301, height: 150')
    expect(output).not.toContain('- **Path:**')
  })

  it('excludes forensic fields when detail is standard', () => {
    const ann: Annotation = {
      ...baseAnnotation,
      cssClasses: 'cta primary large',
      boundingBox: { x: 100, y: 200, width: 300, height: 50 },
      computedStyles: 'color: red\nfont-size: 16px',
      accessibility: 'role=button, aria-label="Submit"',
    }
    const output = formatAnnotations([ann], 'standard', 'https://example.com')

    expect(output).not.toContain('**CSS classes:**')
    expect(output).not.toContain('**Bounding box:**')
    expect(output).not.toContain('**Computed styles:**')
    expect(output).not.toContain('**Accessibility:**')
  })

  it('includes forensic fields when detail is forensic', () => {
    const ann: Annotation = {
      ...baseAnnotation,
      cssClasses: 'cta primary large',
      boundingBox: { x: 100.4, y: 200.6, width: 300.2, height: 50.8 },
      computedStyles: 'color: red\nfont-size: 16px',
      accessibility: 'role=button, aria-label="Submit"',
    }
    const output = formatAnnotations([ann], 'forensic', 'https://example.com')

    expect(output).toContain('- **CSS classes:** cta primary large')
    expect(output).toContain('- **Bounding box:** x: 100, y: 201, width: 300, height: 51')
    expect(output).toContain('- **Computed styles:**')
    expect(output).toContain('  - color: red')
    expect(output).toContain('  - font-size: 16px')
    expect(output).toContain('- **Accessibility:** role=button, aria-label="Submit"')
  })

  it('numbers multiple annotations sequentially', () => {
    const annotations: Annotation[] = [
      { ...baseAnnotation, id: 'ann-1', comment: 'First' },
      { ...baseAnnotation, id: 'ann-2', comment: 'Second' },
      { ...baseAnnotation, id: 'ann-3', comment: 'Third' },
    ]
    const output = formatAnnotations(annotations, 'standard', 'https://example.com')

    expect(output).toContain('### 1. `button`')
    expect(output).toContain('### 2. `button`')
    expect(output).toContain('### 3. `button`')
    expect(output).toContain('- **Comment:** First')
    expect(output).toContain('- **Comment:** Second')
    expect(output).toContain('- **Comment:** Third')
  })

  it('returns only the header for an empty annotations array', () => {
    const output = formatAnnotations([], 'standard', 'https://example.com')

    expect(output).toContain('## Feedback — example.com')
    expect(output).not.toContain('###')
    expect(output).not.toContain('**Comment:**')
  })
})

describe('useOutputFormatter', () => {
  it('returns an object containing the formatAnnotations function', () => {
    const result = useOutputFormatter()

    expect(result).toHaveProperty('formatAnnotations')
    expect(result.formatAnnotations).toBe(formatAnnotations)
  })
})
