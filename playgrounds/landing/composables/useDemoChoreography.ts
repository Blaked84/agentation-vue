import type { Ref } from 'vue'

class DemoAbortError extends Error {
  constructor() { super('DemoAbort') }
}

export function useDemoChoreography(
  containerRef: Ref<HTMLElement | null>,
  contentRef: Ref<HTMLElement | null>,
) {
  const cursorX = ref(0)
  const cursorY = ref(0)
  const cursorType = ref<'pointer' | 'crosshair' | 'ibeam'>('pointer')
  const cursorVisible = ref(false)
  const cursorClicking = ref(false)

  const toolbarExpanded = ref(false)
  const annotationCount = ref(0)

  const highlightVisible = ref(false)
  const highlightRect = ref<{ x: number, y: number, width: number, height: number } | null>(null)

  const popupVisible = ref(false)
  const popupText = ref('')
  const popupPosition = ref({ x: 0, y: 0 })

  const markerVisible = ref(false)
  const markerPending = ref(false)
  const markerPosition = ref({ x: 0, y: 0 })

  const terminalText = ref('')
  const terminalActive = ref(false)

  let abortController: AbortController | null = null
  let running = false

  function delay(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(resolve, ms)
      abortController?.signal.addEventListener('abort', () => {
        clearTimeout(id)
        reject(new DemoAbortError())
      }, { once: true })
    })
  }

  /** Position relative to the root container — for cursor (absolute at container level) */
  function getRelativeRect(selector: string) {
    const container = containerRef.value
    if (!container)
      return null
    const el = container.querySelector(selector)
    if (!el)
      return null
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    return {
      x: elRect.left - containerRect.left,
      y: elRect.top - containerRect.top,
      width: elRect.width,
      height: elRect.height,
      centerX: elRect.left - containerRect.left + elRect.width / 2,
      centerY: elRect.top - containerRect.top + elRect.height / 2,
    }
  }

  /** Position relative to the browser content area — for highlight, popup, marker */
  function getContentRelativeRect(selector: string) {
    const content = contentRef.value
    if (!content)
      return null
    const el = content.querySelector(selector)
    if (!el)
      return null
    const contentRect = content.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    return {
      x: elRect.left - contentRect.left,
      y: elRect.top - contentRect.top,
      width: elRect.width,
      height: elRect.height,
      centerX: elRect.left - contentRect.left + elRect.width / 2,
      centerY: elRect.top - contentRect.top + elRect.height / 2,
    }
  }

  function resetState() {
    cursorVisible.value = false
    cursorClicking.value = false
    cursorType.value = 'pointer'
    toolbarExpanded.value = false
    annotationCount.value = 0
    highlightVisible.value = false
    highlightRect.value = null
    popupVisible.value = false
    popupText.value = ''
    markerVisible.value = false
    markerPending.value = false
    terminalText.value = ''
    terminalActive.value = false
  }

  async function typeText(target: Ref<string>, text: string, charDelay = 30) {
    for (let i = 0; i <= text.length; i++) {
      target.value = text.slice(0, i)
      await delay(charDelay)
    }
  }

  async function click() {
    cursorClicking.value = true
    await delay(150)
    cursorClicking.value = false
  }

  const terminalOutput = `## Annotation 1 — button
**Comment:** "This button needs a primary color"
**Element:** \`button\`
**Path:** \`body > main > div > button\`
**Vue:** \`App > Dashboard > StatsCard > ActionButton\`
**Nearby:** Stats cards, header bar`

  async function runCycle() {
    // 1. IDLE — cursor appears at rest
    resetState()
    cursorX.value = 60
    cursorY.value = 80
    cursorVisible.value = true
    await delay(600)

    // 2. TOOLBAR-CLICK — cursor moves to toolbar toggle
    const toggleRect = getRelativeRect('[data-demo-toolbar-toggle]')
    if (toggleRect) {
      cursorX.value = toggleRect.centerX
      cursorY.value = toggleRect.centerY
    }
    await delay(400)
    await click()
    toolbarExpanded.value = true
    await delay(400)

    // 3. CURSOR-MOVE — cursor to "Create Report" button, crosshair
    // Container-relative for cursor
    const targetRect = getRelativeRect('[data-demo-target]')
    // Content-relative for overlays
    const targetContentRect = getContentRelativeRect('[data-demo-target]')

    cursorType.value = 'crosshair'
    if (targetRect) {
      cursorX.value = targetRect.centerX
      cursorY.value = targetRect.centerY
    }
    await delay(450)

    // 4. ELEMENT-HOVER — highlight around button (content-relative)
    if (targetContentRect) {
      highlightRect.value = {
        x: targetContentRect.x - 3,
        y: targetContentRect.y - 3,
        width: targetContentRect.width + 6,
        height: targetContentRect.height + 6,
      }
    }
    highlightVisible.value = true
    await delay(350)

    // 5. ELEMENT-CLICK → pending marker appears at click point (center of element)
    await click()
    if (targetContentRect) {
      markerPosition.value = {
        x: targetContentRect.centerX,
        y: targetContentRect.centerY,
      }
    }
    markerPending.value = true
    markerVisible.value = true
    highlightVisible.value = false
    await delay(200)

    // 6. POPUP-APPEAR — annotation input near button (content-relative)
    if (targetContentRect) {
      popupPosition.value = {
        x: targetContentRect.x,
        y: targetContentRect.y + targetContentRect.height + 12,
      }
    }
    popupVisible.value = true
    await delay(350)

    // 7. TEXT-TYPING — cursor moves to input area (container-relative)
    cursorType.value = 'ibeam'
    if (targetRect) {
      cursorX.value = targetRect.x + 120
      cursorY.value = targetRect.y + targetRect.height + 64
    }
    await delay(200)
    await typeText(popupText, 'This button needs a primary color', 25)
    await delay(250)

    // 8. SUBMIT — click "Add" button (container-relative for cursor)
    cursorType.value = 'pointer'
    const submitRect = getRelativeRect('[data-demo-submit-btn]')
    if (submitRect) {
      cursorX.value = submitRect.centerX
      cursorY.value = submitRect.centerY
    }
    await delay(300)
    await click()
    annotationCount.value = 1
    markerPending.value = false
    await delay(300)

    // 10. POPUP-CLOSE
    popupVisible.value = false
    await delay(250)

    // 11. CURSOR-COPY — cursor to copy button (container-relative)
    const copyRect = getRelativeRect('[data-demo-copy-btn]')
    if (copyRect) {
      cursorX.value = copyRect.centerX
      cursorY.value = copyRect.centerY
    }
    await delay(400)

    // 12. COPY-CLICK → terminal activates, cursor hides
    await click()
    cursorVisible.value = false
    terminalActive.value = true
    await delay(300)

    // 13. TERMINAL-TYPE — fast markdown streaming (2ms/char)
    await typeText(terminalText, terminalOutput, 2)
    await delay(200)

    // 14. HOLD — user reads the result
    await delay(4000)

    // 15. RESET — fade out everything
    cursorVisible.value = false
    await delay(200)
    terminalActive.value = false
    markerVisible.value = false
    toolbarExpanded.value = false
    annotationCount.value = 0
    await delay(400)
    terminalText.value = ''
    await delay(400)
  }

  async function startLoop() {
    running = true
    // eslint-disable-next-line no-unmodified-loop-condition -- `running` is set to false in stopLoop() called externally
    while (running) {
      abortController = new AbortController()
      try {
        await runCycle()
      }
      catch (e) {
        if (e instanceof DemoAbortError) {
          continue
        }
        throw e
      }
    }
  }

  function stop() {
    running = false
    abortController?.abort()
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop()
      resetState()
    }
    else {
      startLoop()
    }
  }

  onMounted(() => {
    setTimeout(() => startLoop(), 800)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return {
    cursorX,
    cursorY,
    cursorType,
    cursorVisible,
    cursorClicking,
    toolbarExpanded,
    annotationCount,
    highlightVisible,
    highlightRect,
    popupVisible,
    popupText,
    popupPosition,
    markerVisible,
    markerPending,
    markerPosition,
    terminalText,
    terminalActive,
  }
}
