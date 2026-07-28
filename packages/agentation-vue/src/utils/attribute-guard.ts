const GUARDED_ATTRS = ['inert', 'aria-hidden']

/**
 * Modal libraries (Headless UI, Radix ports, aria-hidden utilities) mark every
 * `body` child except their own dialog as inert/aria-hidden, which blocks all
 * interaction with the annotation UI. Strip those attributes whenever they are
 * applied to library containers.
 */
export function guardAttributes(el: HTMLElement): () => void {
  const strip = () => {
    for (const attr of GUARDED_ATTRS) {
      if (el.hasAttribute(attr))
        el.removeAttribute(attr)
    }
  }
  strip()
  const observer = new MutationObserver(strip)
  observer.observe(el, { attributes: true, attributeFilter: GUARDED_ATTRS })
  return () => observer.disconnect()
}
