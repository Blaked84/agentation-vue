<script setup lang="ts">
import type { Annotation, OutputDetail, Settings } from './types'
import { isVue2 as _isVue2, computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue-demi'
import AgentationToolbar from './components/AgentationToolbar.vue'
import AnnotationInput from './components/AnnotationInput.vue'
import AnnotationMarker from './components/AnnotationMarker.vue'
import ElementHighlight from './components/ElementHighlight.vue'
import SettingsPopover from './components/SettingsPopover.vue'
import { useAnimationPause } from './composables/useAnimationPause'
import { useAnnotations } from './composables/useAnnotations'
import { useAreaSelect } from './composables/useAreaSelect'
import { useElementDetection } from './composables/useElementDetection'
import { useInteractionMode } from './composables/useInteractionMode'
import { useMarkerPositions } from './composables/useMarkerPositions'
import { useMultiSelect } from './composables/useMultiSelect'
import { useOutputFormatter } from './composables/useOutputFormatter'
import { useSettings } from './composables/useSettings'
import { useKeyboardShortcuts, DEFAULT_SHORTCUT_CONFIG } from './composables/useKeyboardShortcuts'
import type { KeyboardShortcutConfig } from './composables/useKeyboardShortcuts'
import { useTextSelection } from './composables/useTextSelection'
import { VA_DATA_ATTR_SELECTOR } from './constants'
import { copyToClipboard } from './utils/clipboard'
import { isFixed as checkIsFixed, detectVueComponents, getAccessibilityInfo, getComputedStylesSummary, getNearbyElements, getNearbyText, getRelevantComputedStyles } from './utils/dom-inspector'
import { createPortalContainer, destroyPortalContainer } from './utils/portal'
import { getElementName, getElementPath } from './utils/selectors'
import { boundingBoxToStyle } from './utils/style'

const props = withDefaults(defineProps<{
  outputDetail?: OutputDetail
  markerColor?: string
  copyToClipboard?: boolean
  blockPageInteractions?: boolean
  autoHideToolbar?: boolean
  pageUrl?: string
  theme?: 'light' | 'dark' | 'auto'
  activationKey?: 'none' | 'Meta' | 'Alt' | 'Shift'
}>(), {
  copyToClipboard: true,
})

const emit = defineEmits<{
  'annotation-add': [annotation: Annotation]
  'annotation-delete': [annotation: Annotation]
  'annotation-update': [annotation: Annotation]
  'annotations-clear': [annotations: Annotation[]]
  'copy': [markdown: string]
}>()

const HISTORY_CHANGE_EVENT = 'va:history-change'

interface VaWindow extends Window {
  __vaHistoryPatched?: boolean
}

function getCurrentUrl() {
  return typeof window !== 'undefined' ? window.location.href : ''
}

function patchHistoryEvents() {
  const win = window as VaWindow
  if (win.__vaHistoryPatched)
    return
  win.__vaHistoryPatched = true

  const originalPushState = win.history.pushState.bind(win.history)
  const originalReplaceState = win.history.replaceState.bind(win.history)

  win.history.pushState = function (...args: Parameters<History['pushState']>) {
    originalPushState(...args)
    win.dispatchEvent(new Event(HISTORY_CHANGE_EVENT))
  }

  win.history.replaceState = function (...args: Parameters<History['replaceState']>) {
    originalReplaceState(...args)
    win.dispatchEvent(new Event(HISTORY_CHANGE_EVENT))
  }
}

// Refs
const rootEl = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)
const toolbarRef = ref<any>(null)
const currentUrl = ref(props.pageUrl || getCurrentUrl())

// Core composables
const { settings } = useSettings()
const { mode, transition } = useInteractionMode()
const { annotations, addAnnotation, removeAnnotation, updateAnnotation, clearAnnotations, setScopeUrl } = useAnnotations(currentUrl.value)
const { hoveredRect, hoveredName, hoveredComponentChain, onMouseMove, clearHighlight, getElementUnderOverlay, cleanup: cleanupDetection } = useElementDetection(overlayEl, () => settings.showComponentTree)
const textSelection = useTextSelection(mode)
const multiSelect = useMultiSelect(mode, transition)
const areaSelect = useAreaSelect(mode, transition)
const animPause = useAnimationPause()
const { recalculatePositions: _recalculatePositions } = useMarkerPositions(annotations)
const { formatAnnotations } = useOutputFormatter()

// Local state
const pendingPosition = ref<{ x: number, y: number } | null>(null)
const pendingElementName = ref('')
const pendingTarget = ref<Element | null>(null)
const pendingComponentChain = ref<string | undefined>()
const pendingComputedStyles = ref<Record<string, string> | undefined>()
const pendingTextSelection = ref<{ text: string, element: Element, rect: { x: number, y: number, width: number, height: number } } | null>(null)
const editingAnnotation = ref<Annotation | null>(null)
const settingsOpen = ref(false)
const settingsAnchorEl = ref<HTMLElement | null>(null)
const copyFeedback = ref(false)
const toolbarDragging = ref(false)
const DRAG_END_SUPPRESSION_MS = 500
const SETTINGS_CLOSE_SUPPRESSION_MS = 220
let suppressInteractionsUntil = 0
const effectiveBlockPageInteractions = computed(() => props.blockPageInteractions ?? settings.blockPageInteractions)
const rootStyle = computed(() => {
  const hex = settings.markerColor
  if (!hex)
    return undefined
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return {
    '--va-accent': hex,
    '--va-accent-rgb': `${r}, ${g}, ${b}`,
  } as Record<string, string>
})
const resolvedUrl = computed(() => currentUrl.value)
const pendingMarkerX = computed(() => {
  if (!pendingPosition.value)
    return 0
  return (pendingPosition.value.x / window.innerWidth) * 100
})
const pendingMarkerY = computed(() => {
  if (!pendingPosition.value)
    return 0
  return pendingPosition.value.y + (window.scrollY || document.documentElement.scrollTop)
})
const pendingIsSelection = computed(() => (
  mode.value === 'input-open'
  && !editingAnnotation.value
  && (multiSelect.selectedElements.value.length > 0 || !!areaSelect.areaRect.value)
))

// Portal setup (Vue 2.7 compat)
let portalContainer: HTMLElement | null = null
const isVue2 = _isVue2

const PassThrough = defineComponent({
  render() {
    // eslint-disable-next-line vue/require-slots-as-functions -- Vue 2: $slots.default is VNode[], not a function
    const slot = this.$slots.default
    return (typeof slot === 'function' ? slot() : slot?.[0]) || null
  },
})

const portalWrapper = isVue2 ? PassThrough : 'Teleport'
const portalProps = isVue2 ? {} : { to: 'body' }

onMounted(() => {
  if (isVue2 && rootEl.value) {
    portalContainer = createPortalContainer()
    portalContainer.appendChild(rootEl.value)
  }
})

onBeforeUnmount(() => {
  animPause.cleanup()
  cleanupDetection()
  if (portalContainer) {
    destroyPortalContainer(portalContainer)
  }
})

// Apply prop overrides to settings
watch(() => props.outputDetail, (v) => {
  if (v)
    settings.outputDetail = v
}, { immediate: true })
watch(() => props.markerColor, (v) => {
  if (v)
    settings.markerColor = v
}, { immediate: true })
watch(() => props.theme, (v) => {
  if (v)
    settings.theme = v
}, { immediate: true })
watch(() => props.blockPageInteractions, (v) => {
  if (v)
    settings.blockPageInteractions = v
}, { immediate: true })
watch(() => props.autoHideToolbar, (v) => {
  if (v)
    settings.autoHideToolbar = v
}, { immediate: true })
watch(() => props.pageUrl, (url) => {
  syncUrlScope(url || getCurrentUrl())
}, { immediate: true })
watch(() => props.activationKey, (v) => {
  if (v !== undefined) settings.activationKey = v
}, { immediate: true })

// Event handlers
function onActivate() {
  transition('inspect')
}

function onDeactivate() {
  transition('idle')
  clearHighlight()
  closeSettings(false)
}

function onOverlayMouseMove(e: MouseEvent) {
  if (isInteractionLocked())
    return
  if (mode.value === 'inspect') {
    onMouseMove(e)
  }
  else if (mode.value === 'multi-selecting') {
    multiSelect.onMouseMove(e)
  }
  else if (mode.value === 'area-selecting') {
    areaSelect.onMouseMove(e)
  }
}

function onOverlayMouseDown(e: MouseEvent) {
  if (isInteractionLocked())
    return
  if (multiSelect.onMouseDown(e))
    return
  areaSelect.onMouseDown(e)
}

function onOverlayMouseUp(e: MouseEvent) {
  if (isInteractionLocked())
    return
  if (mode.value === 'multi-selecting') {
    multiSelect.onMouseUp()
    if (multiSelect.selectedElements.value.length > 0) {
      const elements = multiSelect.selectedElements.value
      const rect = multiSelect.selectionRect.value
      pendingPosition.value = rect
        ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
        : { x: e.clientX, y: e.clientY }
      pendingElementName.value = `${elements.length} elements selected`
      pendingComponentChain.value = undefined
      pendingComputedStyles.value = undefined
      pendingTarget.value = null
      transition('input-open')
    }
    else {
      multiSelect.reset()
      transition('inspect')
    }
    return
  }

  if (mode.value === 'area-selecting') {
    areaSelect.onMouseUp()
    const rect = areaSelect.areaRect.value
    if (rect && rect.width > 10 && rect.height > 10) {
      pendingPosition.value = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
      pendingElementName.value = 'Area selection'
      pendingComponentChain.value = undefined
      pendingComputedStyles.value = undefined
      pendingTarget.value = null
      transition('input-open')
    }
    else {
      areaSelect.reset()
      transition('inspect')
    }
    return
  }

  if (mode.value !== 'inspect')
    return

  // Check for text selection first
  const textResult = textSelection.checkTextSelection(e)
  if (textResult) {
    pendingPosition.value = {
      x: textResult.rect.left + textResult.rect.width / 2,
      y: textResult.rect.bottom,
    }
    pendingElementName.value = `"${textResult.selectedText.slice(0, 30)}"`
    pendingComponentChain.value = getVueComponents(textResult.anchorElement)
    pendingComputedStyles.value = getRelevantComputedStyles(textResult.anchorElement)
    pendingTarget.value = textResult.anchorElement
    pendingTextSelection.value = {
      text: textResult.selectedText,
      element: textResult.anchorElement,
      rect: {
        x: textResult.rect.x,
        y: textResult.rect.y,
        width: textResult.rect.width,
        height: textResult.rect.height,
      },
    }
    transition('input-open')
    return
  }

  // Normal click annotation
  const el = getElementUnderOverlay(e)
  if (!el || el.closest(VA_DATA_ATTR_SELECTOR))
    return

  pendingPosition.value = { x: e.clientX, y: e.clientY }
  pendingElementName.value = getElementName(el)
  pendingComponentChain.value = settings.showComponentTree ? detectVueComponents(el) : undefined
  pendingComputedStyles.value = getRelevantComputedStyles(el)
  pendingTarget.value = el
  pendingTextSelection.value = null
  transition('input-open')
}

function onOverlayWheel(_e: WheelEvent) {
  if (isInteractionLocked())
    return
  const overlay = overlayEl.value
  if (!overlay)
    return
  const previousPointerEvents = overlay.style.pointerEvents
  overlay.style.pointerEvents = 'none'
  requestAnimationFrame(() => {
    if (overlay)
      overlay.style.pointerEvents = previousPointerEvents
  })
}

function getElementAtPointThroughOverlay(x: number, y: number): Element | null {
  const overlay = overlayEl.value
  if (!overlay)
    return document.elementFromPoint(x, y)

  const previousPointerEvents = overlay.style.pointerEvents
  overlay.style.pointerEvents = 'none'
  const el = document.elementFromPoint(x, y)
  overlay.style.pointerEvents = previousPointerEvents
  return el
}

function shouldUseDocumentFallbackEvents() {
  return mode.value === 'inspect' && !effectiveBlockPageInteractions.value && !isInteractionLocked()
}

function lockInteractionsTemporarily(durationMs: number) {
  suppressInteractionsUntil = Math.max(suppressInteractionsUntil, Date.now() + durationMs)
}

function isInteractionLocked() {
  return settingsOpen.value || toolbarDragging.value || Date.now() < suppressInteractionsUntil
}

function closeSettings(lockInteractions = true) {
  if (!settingsOpen.value)
    return
  settingsOpen.value = false
  if (lockInteractions)
    lockInteractionsTemporarily(SETTINGS_CLOSE_SUPPRESSION_MS)
}

function syncUrlScope(nextUrl: string) {
  if (!nextUrl || currentUrl.value === nextUrl)
    return
  currentUrl.value = nextUrl
  setScopeUrl(nextUrl)
}

function syncUrlScopeFromWindow() {
  if (props.pageUrl)
    return
  syncUrlScope(getCurrentUrl())
}

function onToolbarDragStart() {
  toolbarDragging.value = true
}

function onToolbarDragEnd() {
  toolbarDragging.value = false
  // Ignore trailing mouseup/click compatibility events right after drag release.
  lockInteractionsTemporarily(DRAG_END_SUPPRESSION_MS)
}

function onDocumentMouseMove(e: MouseEvent) {
  if (!shouldUseDocumentFallbackEvents())
    return
  onOverlayMouseMove(e)
}

function onDocumentMouseDown(e: MouseEvent) {
  if (!shouldUseDocumentFallbackEvents())
    return
  onOverlayMouseDown(e)
}

function onDocumentMouseUp(e: MouseEvent) {
  if (!shouldUseDocumentFallbackEvents())
    return
  onOverlayMouseUp(e)
}

function onDocumentWheel(e: WheelEvent) {
  if (!shouldUseDocumentFallbackEvents())
    return
  onOverlayWheel(e)
}

function getVueComponents(el: Element): string | undefined {
  return settings.showComponentTree
    ? detectVueComponents(el, settings.outputDetail === 'forensic')
    : undefined
}

function resetPendingState() {
  pendingPosition.value = null
  pendingTarget.value = null
  pendingComponentChain.value = undefined
  pendingComputedStyles.value = undefined
  pendingTextSelection.value = null
  editingAnnotation.value = null
}

function onInputAdd(comment: string) {
  if (editingAnnotation.value) {
    onInputSave(comment)
    return
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const detail = settings.outputDetail
  const url = resolvedUrl.value

  if (mode.value === 'input-open' && multiSelect.selectedElements.value.length > 0) {
    // Multi-select annotation
    const selected = multiSelect.selectedElements.value
    const elements = selected.map(el => ({
      element: el.tagName.toLowerCase(),
      elementPath: getElementPath(el),
      cssClasses: Array.from(el.classList).join(' '),
      boundingBox: (() => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y, width: r.width, height: r.height }
      })(),
    }))
    const firstElement = selected[0]!
    const selectionBox = elements.reduce(
      (acc, el) => {
        const box = el.boundingBox!
        acc.left = Math.min(acc.left, box.x)
        acc.top = Math.min(acc.top, box.y)
        acc.right = Math.max(acc.right, box.x + box.width)
        acc.bottom = Math.max(acc.bottom, box.y + box.height)
        return acc
      },
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
    )
    const boundingBox = {
      x: selectionBox.left,
      y: selectionBox.top,
      width: selectionBox.right - selectionBox.left,
      height: selectionBox.bottom - selectionBox.top,
    }

    const ann = addAnnotation({
      x: pendingPosition.value!.x / window.innerWidth * 100,
      y: pendingPosition.value!.y + scrollTop,
      comment,
      url,
      element: 'multi',
      elementPath: `region at (${Math.round(boundingBox.x)}, ${Math.round(boundingBox.y)})`,
      isMultiSelect: true,
      elements,
      boundingBox,
      vueComponents: getVueComponents(firstElement),
      nearbyElements: getNearbyElements(firstElement),
      nearbyText: getNearbyText(firstElement),
      cssClasses: detail === 'forensic' ? Array.from(firstElement.classList).join(' ') : undefined,
      fullPath: detail === 'forensic' ? getElementPath(firstElement) : undefined,
      computedStyles: detail === 'forensic' ? getComputedStylesSummary(firstElement) : undefined,
      accessibility: detail === 'forensic' ? getAccessibilityInfo(firstElement) : undefined,
    })
    emit('annotation-add', ann)
    multiSelect.reset()
  }
  else if (mode.value === 'input-open' && areaSelect.areaRect.value) {
    // Area annotation
    const area = { ...areaSelect.areaRect.value! }
    const centerX = area.x + area.width / 2
    const centerY = area.y + area.height / 2
    const centerElement = getElementAtPointThroughOverlay(centerX, centerY) || document.body
    const ann = addAnnotation({
      x: centerX / window.innerWidth * 100,
      y: centerY + scrollTop,
      comment,
      url,
      element: 'area',
      elementPath: `region at (${Math.round(area.x)}, ${Math.round(area.y)})`,
      isAreaSelect: true,
      area,
      boundingBox: area,
      vueComponents: getVueComponents(centerElement),
      nearbyElements: getNearbyElements(centerElement),
      nearbyText: getNearbyText(centerElement),
      cssClasses: detail === 'forensic' ? Array.from(centerElement.classList).join(' ') : undefined,
      fullPath: detail === 'forensic' ? getElementPath(centerElement) : undefined,
      computedStyles: detail === 'forensic' ? getComputedStylesSummary(centerElement) : undefined,
      accessibility: detail === 'forensic' ? getAccessibilityInfo(centerElement) : undefined,
    })
    emit('annotation-add', ann)
    areaSelect.reset()
  }
  else if (pendingTextSelection.value) {
    // Text selection annotation
    const { element: el, rect, text } = pendingTextSelection.value
    const ann = addAnnotation({
      x: pendingPosition.value!.x / window.innerWidth * 100,
      y: pendingPosition.value!.y + scrollTop,
      comment,
      url,
      element: el.tagName.toLowerCase(),
      elementPath: getElementPath(el),
      selectedText: text,
      boundingBox: rect,
      vueComponents: getVueComponents(el),
      nearbyElements: getNearbyElements(el),
      nearbyText: getNearbyText(el),
      cssClasses: detail === 'forensic' ? Array.from(el.classList).join(' ') : undefined,
      fullPath: detail === 'forensic' ? getElementPath(el) : undefined,
      computedStyles: detail === 'forensic' ? getComputedStylesSummary(el) : undefined,
      accessibility: detail === 'forensic' ? getAccessibilityInfo(el) : undefined,
      _targetRef: new WeakRef(el),
    })
    emit('annotation-add', ann)
  }
  else if (pendingTarget.value) {
    // Element click annotation
    const el = pendingTarget.value
    const rect = el.getBoundingClientRect()
    const fixed = checkIsFixed(el)

    const ann = addAnnotation({
      x: pendingPosition.value!.x / window.innerWidth * 100,
      y: fixed ? pendingPosition.value!.y : pendingPosition.value!.y + scrollTop,
      comment,
      url,
      element: el.tagName.toLowerCase(),
      elementPath: getElementPath(el),
      isFixed: fixed,
      _targetRef: new WeakRef(el),
      vueComponents: getVueComponents(el),
      nearbyElements: getNearbyElements(el),
      nearbyText: getNearbyText(el),
      boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      cssClasses: detail === 'forensic' ? Array.from(el.classList).join(' ') : undefined,
      fullPath: detail === 'forensic' ? getElementPath(el) : undefined,
      computedStyles: detail === 'forensic' ? getComputedStylesSummary(el) : undefined,
      accessibility: detail === 'forensic' ? getAccessibilityInfo(el) : undefined,
    })
    emit('annotation-add', ann)
  }

  resetPendingState()
  transition('inspect')
}

function onInputCancel() {
  resetPendingState()
  multiSelect.reset()
  areaSelect.reset()
  transition('inspect')
}

async function onCopy() {
  const markdown = formatAnnotations(annotations.value, settings.outputDetail, resolvedUrl.value)

  if (props.copyToClipboard !== false) {
    const success = await copyToClipboard(markdown)
    if (!success)
      return
    copyFeedback.value = true
    setTimeout(() => {
      copyFeedback.value = false
    }, 2000)
  }

  emit('copy', markdown)
  if (settings.clearAfterCopy) {
    const cleared = clearAnnotations()
    emit('annotations-clear', cleared)
  }
}

function onClear() {
  const cleared = clearAnnotations()
  emit('annotations-clear', cleared)
}

function onMarkerClick(ann: Annotation) {
  // Open the annotation popup for editing
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const markerX = (ann.x / 100) * window.innerWidth
  const markerY = ann.isFixed ? ann.y : ann.y - scrollTop

  editingAnnotation.value = ann
  pendingPosition.value = { x: markerX, y: markerY }
  pendingElementName.value = getElementName(ann._targetRef?.deref() || document.createElement(ann.element))
  pendingComponentChain.value = ann.vueComponents
  pendingComputedStyles.value = ann.computedStyles
    ? Object.fromEntries(ann.computedStyles.split('\n').filter(Boolean).map((line) => {
        const idx = line.indexOf(':')
        return idx > -1 ? [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] : [line, '']
      }))
    : ann._targetRef?.deref()
      ? getRelevantComputedStyles(ann._targetRef.deref()!)
      : undefined
  pendingTextSelection.value = null
  pendingTarget.value = ann._targetRef?.deref() || null
  transition('input-open')
}

function onInputDelete() {
  if (!editingAnnotation.value)
    return
  const removed = removeAnnotation(editingAnnotation.value.id)
  if (removed)
    emit('annotation-delete', removed)
  resetPendingState()
  transition('inspect')
}

function onInputSave(comment: string) {
  if (!editingAnnotation.value)
    return
  const updated = updateAnnotation(editingAnnotation.value.id, { comment })
  if (updated)
    emit('annotation-update', updated)
  resetPendingState()
  transition('inspect')
}

function onToggleArea(value: boolean) {
  areaSelect.isAreaMode.value = value
}

function onToolbarPlacementUpdate(value: Settings['toolbarPlacement']) {
  settings.toolbarPlacement = value
}

function onSettingsUpdate(updates: Partial<Settings>) {
  Object.assign(settings, updates)
}

function onOpenSettings(anchorEl: HTMLElement | null) {
  if (settingsOpen.value && settingsAnchorEl.value === anchorEl) {
    closeSettings()
    return
  }
  settingsAnchorEl.value = anchorEl
  settingsOpen.value = true
}

// Keyboard shortcut manager
const shortcutConfig = computed<KeyboardShortcutConfig>(() => ({
  ...DEFAULT_SHORTCUT_CONFIG,
  doubleTap: {
    ...DEFAULT_SHORTCUT_CONFIG.doubleTap,
    enabled: settings.activationKey !== 'none',
    key: settings.activationKey !== 'none' ? settings.activationKey : DEFAULT_SHORTCUT_CONFIG.doubleTap.key,
  },
}))

useKeyboardShortcuts({
  mode,
  settingsOpen,
  toolbarDragging,
  toolbarRef,
  isInteractionLocked,
  config: shortcutConfig,
  actions: {
    activate: onActivate,
    deactivate: onDeactivate,
    elementSelect: () => onToggleArea(false),
    areaSelect: () => onToggleArea(true),
    pauseAnimations: () => animPause.toggle(),
    copy: () => onCopy(),
    clear: () => onClear(),
    openSettings: () => onOpenSettings(null),
    inputCancel: () => onInputCancel(),
    closeSettings: () => closeSettings(),
  },
})

onMounted(() => {
  patchHistoryEvents()
  window.addEventListener(HISTORY_CHANGE_EVENT, syncUrlScopeFromWindow)
  window.addEventListener('popstate', syncUrlScopeFromWindow)
  window.addEventListener('hashchange', syncUrlScopeFromWindow)
  document.addEventListener('mousemove', onDocumentMouseMove, true)
  document.addEventListener('mousedown', onDocumentMouseDown, true)
  document.addEventListener('mouseup', onDocumentMouseUp, true)
  document.addEventListener('wheel', onDocumentWheel, { passive: true, capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener(HISTORY_CHANGE_EVENT, syncUrlScopeFromWindow)
  window.removeEventListener('popstate', syncUrlScopeFromWindow)
  window.removeEventListener('hashchange', syncUrlScopeFromWindow)
  document.removeEventListener('mousemove', onDocumentMouseMove, true)
  document.removeEventListener('mousedown', onDocumentMouseDown, true)
  document.removeEventListener('mouseup', onDocumentMouseUp, true)
  document.removeEventListener('wheel', onDocumentWheel, true)
})
</script>

<template>
  <component :is="portalWrapper" v-bind="portalProps">
    <div ref="rootEl" data-agentation-vue :data-va-theme="settings.theme !== 'auto' ? settings.theme : undefined" :style="rootStyle">
      <!-- Intercept overlay -->
      <div
        v-if="mode !== 'idle'"
        ref="overlayEl"
        class="__va-intercept"
        :class="{ '__va-intercept--input-open': mode === 'input-open' }"
        :style="mode === 'inspect' && !effectiveBlockPageInteractions ? { pointerEvents: 'none' } : undefined"
        @mousemove="onOverlayMouseMove"
        @mousedown="onOverlayMouseDown"
        @mouseup="onOverlayMouseUp"
        @wheel.passive="onOverlayWheel"
      />

      <!-- Hover highlight -->
      <ElementHighlight
        :rect="hoveredRect"
        :element-name="hoveredName"
        :component-chain="hoveredComponentChain"
        :visible="mode === 'inspect' && !!hoveredRect"
      />

      <!-- Selection rectangle (multi or area) -->
      <div
        v-if="multiSelect.selectionRect.value"
        class="__va-selection-rect"
        :style="boundingBoxToStyle(multiSelect.selectionRect.value)"
      />
      <div
        v-if="areaSelect.areaRect.value"
        class="__va-selection-rect"
        :style="boundingBoxToStyle(areaSelect.areaRect.value)"
      />

      <!-- Annotation markers -->
      <AnnotationMarker
        v-for="(ann, i) in annotations"
        :key="ann.id"
        :number="i + 1"
        :x="ann.x"
        :y="ann.y"
        :is-fixed="ann.isFixed"
        :is-stale="!ann._targetRef?.deref() && !!ann._targetRef"
        :is-selection="!!(ann.isAreaSelect || ann.isMultiSelect)"
        @click="onMarkerClick(ann)"
      />

      <!-- Pending marker (unsaved annotation) -->
      <AnnotationMarker
        v-if="mode === 'input-open' && pendingPosition && !editingAnnotation"
        :number="annotations.length + 1"
        :x="pendingMarkerX"
        :y="pendingMarkerY"
        :is-pending="true"
        :is-selection="pendingIsSelection"
      />

      <!-- Annotation input -->
      <AnnotationInput
        v-if="mode === 'input-open' && pendingPosition"
        :position="pendingPosition"
        :element-name="pendingElementName"
        :component-chain="pendingComponentChain"
        :computed-styles="pendingComputedStyles"
        :initial-comment="editingAnnotation?.comment"
        :is-editing="!!editingAnnotation"
        @add="onInputAdd"
        @cancel="onInputCancel"
        @delete="onInputDelete"
      />

      <!-- Settings panel -->
      <SettingsPopover
        :open="settingsOpen"
        :anchor-el="settingsAnchorEl"
        :settings="settings"
        @update="onSettingsUpdate"
        @close="closeSettings()"
      />

      <!-- Copy feedback -->
      <div v-if="copyFeedback" class="__va-copy-feedback">
        Copied!
      </div>

      <!-- Toolbar -->
      <AgentationToolbar
        ref="toolbarRef"
        :mode="mode"
        :annotation-count="annotations.length"
        :is-paused="animPause.isPaused.value"
        :is-area-mode="areaSelect.isAreaMode.value"
        :auto-hide-enabled="settings.autoHideToolbar"
        :placement="settings.toolbarPlacement"
        @activate="onActivate"
        @deactivate="onDeactivate"
        @copy="onCopy"
        @clear="onClear"
        @toggle-pause="animPause.toggle"
        @toggle-area="onToggleArea"
        @update:placement="onToolbarPlacementUpdate"
        @open-settings="onOpenSettings"
        @drag-start="onToolbarDragStart"
        @drag-end="onToolbarDragEnd"
      />
    </div>
  </component>
</template>
