import type { Annotation, OutputDetail } from '../types'

export function formatAnnotations(
  annotations: Annotation[],
  detail: OutputDetail,
  pageUrl: string,
): string {
  const shortUrl = pageUrl.replace(/^https?:\/\//, '')
  const lines: string[] = []

  lines.push(`## Feedback — ${shortUrl}`)
  lines.push('')

  if (detail === 'forensic') {
    const viewport = typeof window !== 'undefined'
      ? `${window.innerWidth}x${window.innerHeight}`
      : 'unknown'
    const userAgent = typeof navigator !== 'undefined'
      ? navigator.userAgent
      : 'unknown'
    const dpr = typeof window !== 'undefined'
      ? String(window.devicePixelRatio)
      : 'unknown'

    lines.push('### Environment')
    lines.push(`- **Viewport:** ${viewport}`)
    lines.push(`- **URL:** ${pageUrl}`)
    lines.push(`- **User Agent:** ${userAgent}`)
    lines.push(`- **Timestamp:** ${new Date().toISOString()}`)
    lines.push(`- **Device Pixel Ratio:** ${dpr}`)
    lines.push('')
  }

  for (let i = 0; i < annotations.length; i++) {
    const ann = annotations[i]
    const num = i + 1

    // Title
    if (ann.selectedText) {
      lines.push(`### ${num}. "${ann.selectedText}" (selected text)`)
    }
    else if (ann.isMultiSelect) {
      lines.push(`### ${num}. Multi-selection (${ann.elements?.length || 0} elements)`)
    }
    else if (ann.isAreaSelect) {
      lines.push(`### ${num}. Area selection`)
    }
    else {
      lines.push(`### ${num}. \`${ann.element}\` — ${ann.elementPath}`)
    }

    if (ann.comment)
      lines.push(`- **Comment:** ${ann.comment}`)

    if (ann.selectedText) {
      lines.push(`- **In element:** \`${ann.element}\` — ${ann.elementPath}`)
    }

    if (ann.isMultiSelect && ann.elements) {
      lines.push(`- **Elements:**`)
      for (const el of ann.elements) {
        lines.push(`  - \`${el.element}\` — ${el.elementPath}`)
      }
    }

    if (ann.isAreaSelect && ann.area) {
      lines.push(`- **Area:** x: ${Math.round(ann.area.x)}, y: ${Math.round(ann.area.y)}, width: ${Math.round(ann.area.width)}, height: ${Math.round(ann.area.height)}`)
    }

    if ((ann.isAreaSelect || ann.isMultiSelect) && ann.elementPath) {
      lines.push(`- **Selection path:** ${ann.elementPath}`)
    }

    if ((ann.isAreaSelect || ann.isMultiSelect) && ann.boundingBox) {
      const b = ann.boundingBox
      lines.push(`- **Selection box:** x: ${Math.round(b.x)}, y: ${Math.round(b.y)}, width: ${Math.round(b.width)}, height: ${Math.round(b.height)}`)
    }

    // Component tree — always shown
    if (ann.vueComponents) {
      lines.push(`- **Components:** ${ann.vueComponents}`)
    }

    // Path — for non-multi/area, when it adds info beyond the title
    if (!ann.isMultiSelect && !ann.isAreaSelect && !ann.selectedText) {
      if (ann.elementPath) {
        lines.push(`- **Path:** ${ann.elementPath}`)
      }
    }

    if (ann.nearbyElements) {
      lines.push(`- **Nearby:** ${ann.nearbyElements}`)
    }
    if (ann.nearbyText && !ann.selectedText) {
      lines.push(`- **Context:** ${ann.nearbyText}`)
    }

    // Forensic-only fields
    if (detail === 'forensic') {
      if (ann.fullPath) {
        lines.push(`- **Full path:** ${ann.fullPath}`)
      }
      if (ann.cssClasses) {
        lines.push(`- **CSS classes:** ${ann.cssClasses}`)
      }
      if (ann.boundingBox) {
        const b = ann.boundingBox
        lines.push(`- **Bounding box:** x: ${Math.round(b.x)}, y: ${Math.round(b.y)}, width: ${Math.round(b.width)}, height: ${Math.round(b.height)}`)
      }
      if (ann.computedStyles) {
        lines.push(`- **Computed styles:**`)
        for (const line of ann.computedStyles.split('\n')) {
          lines.push(`  - ${line}`)
        }
      }
      if (ann.accessibility) {
        lines.push(`- **Accessibility:** ${ann.accessibility}`)
      }
    }

    lines.push('')
  }

  return lines.join('\n')
}

export function useOutputFormatter() {
  return { formatAnnotations }
}
