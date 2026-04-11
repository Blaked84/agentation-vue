const MENTION_REGEX = /@\[(\d+)\]/g

export interface MentionCandidate {
  id: string
  displayNumber: number
  commentPreview: string
}

export function createMentionChipHTML(id: string, displayNumber: number): string {
  return `<span contenteditable="false" class="__va-mention" data-mention-id="${id}">@${displayNumber}</span>`
}

export function createDeletedMentionChipHTML(id: string): string {
  return `<span contenteditable="false" class="__va-mention __va-mention--deleted" data-mention-id="${id}">@?</span>`
}

export function serializeMentions(el: HTMLElement): string {
  let result = ''
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || ''
    }
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      if (element.classList.contains('__va-mention') && element.dataset.mentionId) {
        result += `@[${element.dataset.mentionId}]`
      }
      else if (element.tagName === 'BR') {
        result += '\n'
      }
      else {
        // Handle browser-generated wrappers (Chrome wraps lines in <div>)
        const inner = serializeMentions(element)
        if (element.tagName === 'DIV' && result.length > 0 && !result.endsWith('\n'))
          result += '\n'
        result += inner
      }
    }
  }
  return result
}

export function hydrateMentions(
  text: string,
  annotations: { id: string, displayNumber: number }[],
): string {
  const lookup = new Map(annotations.map(a => [a.id, a.displayNumber]))

  return escapeHTML(text).replace(
    /@\[(\d+)\]/g,
    (_, id) => {
      const displayNumber = lookup.get(id)
      if (displayNumber != null)
        return createMentionChipHTML(id, displayNumber)
      return createDeletedMentionChipHTML(id)
    },
  )
}

export function extractMentionIds(text: string): string[] {
  return [...new Set(Array.from(text.matchAll(MENTION_REGEX), m => m[1]))]
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
