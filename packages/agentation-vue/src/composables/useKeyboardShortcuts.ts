import type { ComputedRef, Ref } from 'vue-demi'
import type { InteractionMode } from '../types'
import { onBeforeUnmount, onMounted, watch } from 'vue-demi'
import { getDeepActiveElement, isInsideAgentationTree } from '../utils/agentation-tree'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShortcutAction
  = | 'activate'
    | 'element-select'
    | 'area-select'
    | 'pause-animations'
    | 'copy'
    | 'clear'
    | 'settings'
    | 'minimize'

export interface DoubleTapConfig {
  enabled: boolean
  key: string
  thresholdMs: number
}

export interface KeyboardShortcutConfig {
  enabledWhenClosed: boolean
  priorityWhenOpen: boolean
  doubleTap: DoubleTapConfig
  keymap: Partial<Record<ShortcutAction, string>>
  conflictPolicy: 'ignore-editables' | 'always-capture'
}

export interface ShortcutActionHandlers {
  activate: () => void
  deactivate: () => void
  elementSelect: () => void
  areaSelect: () => void
  pauseAnimations: () => void
  copy: () => void
  clear: () => void
  openSettings: () => void
  inputCancel: () => void
  closeSettings: () => void
}

export interface UseKeyboardShortcutsOptions {
  mode: Ref<InteractionMode>
  settingsOpen: Ref<boolean>
  toolbarDragging: Ref<boolean>
  toolbarRef: Ref<{ expanded: boolean } | null>
  isInteractionLocked: () => boolean
  config: ComputedRef<KeyboardShortcutConfig>
  actions: ShortcutActionHandlers
}

export interface KeyboardShortcutState {
  cleanup: () => void
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_KEYMAP: Record<ShortcutAction, string> = {
  'activate': '',
  'element-select': 'v',
  'area-select': 'a',
  'pause-animations': 'p',
  'copy': 'c',
  'clear': 'Backspace',
  'settings': '',
  'minimize': 'Escape',
}

export const DEFAULT_SHORTCUT_CONFIG: KeyboardShortcutConfig = {
  enabledWhenClosed: true,
  priorityWhenOpen: true,
  doubleTap: { enabled: true, key: 'Shift', thresholdMs: 280 },
  keymap: {},
  conflictPolicy: 'ignore-editables',
}

// ---------------------------------------------------------------------------
// Browser-reserved combos blacklist
// ---------------------------------------------------------------------------

const BROWSER_BLACKLIST = new Set([
  'Meta+l',
  'Meta+t',
  'Meta+w',
  'Meta+r',
  'Meta+n',
  'Meta+q',
  'Meta+Shift+t',
  'Meta+Shift+n',
  'Control+l',
  'Control+t',
  'Control+w',
  'Control+r',
  'Control+n',
  'Control+q',
  'Control+Shift+t',
  'Control+Shift+n',
  'Meta+c',
  'Meta+v',
  'Meta+x',
  'Meta+a',
  'Meta+z',
  'Control+c',
  'Control+v',
  'Control+x',
  'Control+a',
  'Control+z',
])

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

type ShortcutScope = 'closed' | 'settings' | 'input' | 'open'

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): KeyboardShortcutState {
  const { mode, settingsOpen, toolbarRef, isInteractionLocked, actions } = options

  let lastActivationKeyUpTime = 0
  let listenerAttached = false
  let mergedKeymap = { ...DEFAULT_KEYMAP, ...options.config.value.keymap }
  const suppressedKeyUps = new Set<string>()

  // Rebuild keymap when config changes
  watch(options.config, (cfg) => {
    mergedKeymap = { ...DEFAULT_KEYMAP, ...cfg.keymap }
  })

  // --- Helpers ---

  function cfg(): KeyboardShortcutConfig {
    return options.config.value
  }

  function getCurrentScope(): ShortcutScope {
    if (mode.value === 'idle' && (!toolbarRef.value || !toolbarRef.value.expanded)) {
      return 'closed'
    }
    if (settingsOpen.value) {
      return 'settings'
    }
    if (mode.value === 'input-open') {
      return 'input'
    }
    return 'open'
  }

  function isForeignEditable(): boolean {
    const active = getDeepActiveElement()
    if (!active)
      return false
    const tag = active.tagName.toLowerCase()
    const isEditable = tag === 'input' || tag === 'textarea'
      || (active as HTMLElement).isContentEditable
    if (!isEditable)
      return false
    return !isInsideAgentationTree(active)
  }

  function isBrowserCombo(e: KeyboardEvent): boolean {
    if (!e.metaKey && !e.ctrlKey)
      return false
    const parts: string[] = []
    if (e.metaKey)
      parts.push('Meta')
    if (e.ctrlKey)
      parts.push('Control')
    if (e.shiftKey)
      parts.push('Shift')
    parts.push(e.key)
    return BROWSER_BLACKLIST.has(parts.join('+'))
  }

  function findActionForKey(key: string): ShortcutAction | null {
    const normalized = key.toLowerCase()
    for (const [action, mappedKey] of Object.entries(mergedKeymap)) {
      if (!mappedKey)
        continue
      if (mappedKey.toLowerCase() === normalized || mappedKey === key) {
        return action as ShortcutAction
      }
    }
    return null
  }

  function executeAction(action: ShortcutAction): void {
    switch (action) {
      case 'element-select':
        actions.elementSelect()
        break
      case 'area-select':
        actions.areaSelect()
        break
      case 'pause-animations':
        actions.pauseAnimations()
        break
      case 'copy':
        actions.copy()
        break
      case 'clear':
        actions.clear()
        break
      case 'settings':
        actions.openSettings()
        break
      case 'minimize':
        actions.deactivate()
        if (toolbarRef.value)
          toolbarRef.value.expanded = false
        break
    }
  }

  function normalizeKey(key: string): string {
    return key.length === 1 ? key.toLowerCase() : key
  }

  // --- Consume helper ---

  function consume(e: KeyboardEvent, suppressKeyUp = false): void {
    e.preventDefault()
    e.stopImmediatePropagation()
    e.stopPropagation()
    if (suppressKeyUp)
      suppressedKeyUps.add(normalizeKey(e.key))
  }

  // --- Main keydown handler (capture phase) ---

  function onKeyDown(e: KeyboardEvent): void {
    if (e.repeat)
      return
    if (isBrowserCombo(e))
      return

    const hasModifier = e.metaKey || e.ctrlKey || e.altKey
    const scope = getCurrentScope()

    // --- CLOSED scope ---
    if (scope === 'closed') {
      // No single-key shortcuts when closed (only double-tap handled in keyup)
      return
    }

    // --- SETTINGS sub-scope ---
    if (scope === 'settings') {
      if (e.key === 'Escape') {
        consume(e, true)
        actions.closeSettings()
      }
      return
    }

    // --- INPUT sub-scope ---
    if (scope === 'input') {
      if (e.key === 'Escape') {
        consume(e, true)
        actions.inputCancel()
      }
      return
    }

    // --- OPEN scope (inspect, multi-selecting, area-selecting) ---

    if (cfg().conflictPolicy === 'ignore-editables' && isForeignEditable())
      return
    if (isInteractionLocked())
      return

    // Direct shortcut matching (no modifier combos)
    if (hasModifier)
      return

    const action = findActionForKey(e.key)
    if (!action)
      return

    if (cfg().priorityWhenOpen) {
      consume(e, true)
    }

    executeAction(action)
  }

  // --- Double-tap activation key detection (keyup handler) ---

  function onKeyUp(e: KeyboardEvent): void {
    const normalizedKey = normalizeKey(e.key)
    if (suppressedKeyUps.has(normalizedKey)) {
      suppressedKeyUps.delete(normalizedKey)
      consume(e)
      return
    }

    const { doubleTap } = cfg()
    if (!doubleTap.enabled)
      return
    if (e.key !== doubleTap.key)
      return
    if (e.repeat)
      return

    const now = Date.now()
    const delta = now - lastActivationKeyUpTime
    lastActivationKeyUpTime = now

    if (delta < doubleTap.thresholdMs && delta > 50) {
      lastActivationKeyUpTime = 0
      const scope = getCurrentScope()
      if (scope === 'closed') {
        actions.activate()
        if (toolbarRef.value)
          toolbarRef.value.expanded = true
      }
      else if (scope === 'open') {
        actions.deactivate()
        if (toolbarRef.value)
          toolbarRef.value.expanded = false
      }
    }
  }

  // --- Reset on blur/visibility ---

  function onBlurOrVisibility(): void {
    lastActivationKeyUpTime = 0
    suppressedKeyUps.clear()
  }

  // --- Lifecycle ---

  function attach(): void {
    if (listenerAttached)
      return
    listenerAttached = true
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    window.addEventListener('blur', onBlurOrVisibility)
    document.addEventListener('visibilitychange', onBlurOrVisibility)
  }

  function detach(): void {
    if (!listenerAttached)
      return
    listenerAttached = false
    window.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('keyup', onKeyUp, true)
    window.removeEventListener('blur', onBlurOrVisibility)
    document.removeEventListener('visibilitychange', onBlurOrVisibility)
  }

  onMounted(attach)
  onBeforeUnmount(detach)

  return { cleanup: detach }
}
