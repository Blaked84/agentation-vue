<script setup lang="ts">
import type { Annotation, BoundingBox, Settings } from './types'
import { isVue2 as _isVue2, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue-demi'
import AgentationToolbar from './components/AgentationToolbar.vue'
import AnnotationInput from './components/AnnotationInput.vue'
import AnnotationMarker from './components/AnnotationMarker.vue'
import ElementHighlight from './components/ElementHighlight.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { useAnimationPause } from './composables/useAnimationPause'
import { useAnnotations } from './composables/useAnnotations'
import { useAreaSelect } from './composables/useAreaSelect'
import { useElementDetection } from './composables/useElementDetection'
import { useInteractionMode } from './composables/useInteractionMode'
import { useMarkerPositions } from './composables/useMarkerPositions'
import { useMultiSelect } from './composables/useMultiSelect'
import { useOutputFormatter } from './composables/useOutputFormatter'
import { useSettings } from './composables/useSettings'
import { useTextSelection } from './composables/useTextSelection'
import { copyToClipboard } from './utils/clipboard'
import { isFixed as checkIsFixed, detectVueComponents, getAccessibilityInfo, getComputedStylesSummary, getNearbyElements } from './utils/dom-inspector'
import { createPortalContainer, destroyPortalContainer } from './utils/portal'
import { getElementName, getElementPath } from './utils/selectors'

const props = withDefaults(defineProps<{
  outputDetail?: string
  markerColor?: string
  copyToClipboardProp?: boolean
  blockPageInteractions?: boolean
  pageUrl?: string
  theme?: 'light' | 'dark' | 'auto'
}>(), {
  copyToClipboardProp: true,
})

const emit = defineEmits<{
  annotationAdd: [annotation: Annotation]
  annotationDelete: [annotation: Annotation]
  annotationUpdate: [annotation: Annotation]
  annotationsClear: [annotations: Annotation[]]
  copy: [markdown: string]
}>()

// Refs
const rootEl = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)
const toolbarRef = ref<any>(null)

// Core composables
const { settings } = useSettings()
const { mode, transition } = useInteractionMode()
const { annotations, addAnnotation, removeAnnotation, clearAnnotations } = useAnnotations()
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
const pendingTextSelection = ref<{ text: string, element: Element } | null>(null)
const settingsOpen = ref(false)
const copyFeedback = ref(false)

// Portal setup (Vue 2.7 compat)
let portalContainer: HTMLElement | null = null
const isVue2 = _isVue2 || false

const PassThrough = defineComponent({
  render() {
    return this.$slots.default?.() || null
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
    settings.outputDetail = v as any
}, { immediate: true })
watch(() => props.markerColor, (v) => {
  if (v)
    settings.markerColor = v
}, { immediate: true })
watch(() => props.theme, (v) => {
  if (v)
    settings.theme = v
}, { immediate: true })

// Event handlers
function onActivate() {
  transition('inspect')
}

function onDeactivate() {
  transition('idle')
  clearHighlight()
  settingsOpen.value = false
}

function onOverlayMouseMove(e: MouseEvent) {
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
  if (multiSelect.onMouseDown(e))
    return
  areaSelect.onMouseDown(e)
}

function onOverlayMouseUp(e: MouseEvent) {
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
    pendingComponentChain.value = undefined
    pendingTarget.value = textResult.anchorElement
    pendingTextSelection.value = {
      text: textResult.selectedText,
      element: textResult.anchorElement,
    }
    transition('input-open')
    return
  }

  // Normal click annotation
  const el = getElementUnderOverlay(e)
  if (!el || el.closest('[data-agentation-vue]'))
    return

  pendingPosition.value = { x: e.clientX, y: e.clientY }
  pendingElementName.value = getElementName(el)
  pendingComponentChain.value = settings.showComponentTree ? detectVueComponents(el) : undefined
  pendingTarget.value = el
  pendingTextSelection.value = null
  transition('input-open')
}

function onOverlayWheel(_e: WheelEvent) {
  const overlay = overlayEl.value
  if (!overlay)
    return
  overlay.style.pointerEvents = 'none'
  requestAnimationFrame(() => {
    if (overlay)
      overlay.style.pointerEvents = ''
  })
}

function onInputAdd(comment: string) {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const detail = settings.outputDetail

  const url = props.pageUrl || window.location.href

  if (mode.value === 'input-open' && multiSelect.selectedElements.value.length > 0) {
    // Multi-select annotation
    const elements = multiSelect.selectedElements.value.map(el => ({
      element: el.tagName.toLowerCase(),
      elementPath: getElementPath(el),
      cssClasses: Array.from(el.classList).join(' '),
      boundingBox: (() => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y, width: r.width, height: r.height }
      })(),
    }))

    const ann = addAnnotation({
      x: pendingPosition.value!.x / window.innerWidth * 100,
      y: pendingPosition.value!.y + scrollTop,
      comment,
      url,
      element: 'multi',
      elementPath: '',
      isMultiSelect: true,
      elements,
    })
    emit('annotationAdd', ann)
    multiSelect.reset()
  }
  else if (mode.value === 'input-open' && areaSelect.areaRect.value) {
    // Area annotation
    const area = { ...areaSelect.areaRect.value! }
    const ann = addAnnotation({
      x: area.x / window.innerWidth * 100,
      y: area.y + scrollTop,
      comment,
      url,
      element: 'area',
      elementPath: '',
      isAreaSelect: true,
      area,
      nearbyElements: getNearbyElements(document.elementFromPoint(area.x + area.width / 2, area.y + area.height / 2) || document.body),
    })
    emit('annotationAdd', ann)
    areaSelect.reset()
  }
  else if (pendingTextSelection.value) {
    // Text selection annotation
    const el = pendingTextSelection.value.element
    const ann = addAnnotation({
      x: pendingPosition.value!.x / window.innerWidth * 100,
      y: pendingPosition.value!.y + scrollTop,
      comment,
      url,
      element: el.tagName.toLowerCase(),
      elementPath: getElementPath(el),
      selectedText: pendingTextSelection.value.text,
      vueComponents: settings.showComponentTree ? detectVueComponents(el, detail === 'forensic') : undefined,
      _targetRef: new WeakRef(el),
    })
    emit('annotationAdd', ann)
    pendingTextSelection.value = null
  }
  else if (pendingTarget.value) {
    // Element click annotation
    const el = pendingTarget.value
    const rect = el.getBoundingClientRect()
    const fixed = checkIsFixed(el)

    const ann = addAnnotation({
      x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
      y: fixed ? rect.top + rect.height / 2 : rect.top + rect.height / 2 + scrollTop,
      comment,
      url,
      element: el.tagName.toLowerCase(),
      elementPath: getElementPath(el),
      isFixed: fixed,
      _targetRef: new WeakRef(el),
      vueComponents: settings.showComponentTree ? detectVueComponents(el, detail === 'forensic') : undefined,
      nearbyElements: getNearbyElements(el),
      boundingBox: detail === 'forensic' ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined,
      cssClasses: detail === 'forensic' ? Array.from(el.classList).join(' ') : undefined,
      computedStyles: detail === 'forensic' ? getComputedStylesSummary(el) : undefined,
      accessibility: detail === 'forensic' ? getAccessibilityInfo(el) : undefined,
    })
    emit('annotationAdd', ann)
  }

  pendingPosition.value = null
  pendingTarget.value = null
  pendingComponentChain.value = undefined
  transition('inspect')
}

function onInputCancel() {
  pendingPosition.value = null
  pendingTarget.value = null
  pendingComponentChain.value = undefined
  pendingTextSelection.value = null
  multiSelect.reset()
  areaSelect.reset()
  transition('inspect')
}

async function onCopy() {
  const url = props.pageUrl || window.location.href
  const markdown = formatAnnotations(annotations.value, settings.outputDetail, url)
  const success = await copyToClipboard(markdown)
  if (success) {
    copyFeedback.value = true
    setTimeout(() => {
      copyFeedback.value = false
    }, 2000)
    emit('copy', markdown)
    if (settings.clearAfterCopy) {
      const cleared = clearAnnotations()
      emit('annotationsClear', cleared)
    }
  }
}

function onClear() {
  const cleared = clearAnnotations()
  emit('annotationsClear', cleared)
}

function onMarkerClick(ann: Annotation) {
  // For now, just remove the annotation
  const removed = removeAnnotation(ann.id)
  if (removed)
    emit('annotationDelete', removed)
}

function onToggleArea(value: boolean) {
  if (value) {
    areaSelect.isAreaMode.value = true
  }
  else {
    areaSelect.isAreaMode.value = false
  }
}

function onSettingsUpdate(updates: Partial<Settings>) {
  Object.assign(settings, updates)
}

function selectionRectStyle(rect: BoundingBox) {
  return {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }
}

// Escape key handler
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (mode.value === 'input-open') {
      onInputCancel()
    }
    else if (mode.value !== 'idle') {
      onDeactivate()
      if (toolbarRef.value) {
        toolbarRef.value.expanded = false
      }
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <component :is="portalWrapper" v-bind="portalProps">
    <div ref="rootEl" data-agentation-vue :data-va-theme="settings.theme !== 'auto' ? settings.theme : undefined">
      <!-- Intercept overlay -->
      <div
        v-if="mode !== 'idle'"
        ref="overlayEl"
        class="__va-intercept"
        :class="{ '__va-intercept--input-open': mode === 'input-open' }"
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
        :style="selectionRectStyle(multiSelect.selectionRect.value)"
      />
      <div
        v-if="areaSelect.areaRect.value"
        class="__va-selection-rect"
        :style="selectionRectStyle(areaSelect.areaRect.value)"
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
        :color="settings.markerColor"
        @click="onMarkerClick(ann)"
      />

      <!-- Annotation input -->
      <AnnotationInput
        v-if="mode === 'input-open' && pendingPosition"
        :position="pendingPosition"
        :element-name="pendingElementName"
        :component-chain="pendingComponentChain"
        @add="onInputAdd"
        @cancel="onInputCancel"
      />

      <!-- Settings panel -->
      <SettingsPanel
        v-if="settingsOpen"
        :settings="settings"
        @update="onSettingsUpdate"
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
        @activate="onActivate"
        @deactivate="onDeactivate"
        @copy="onCopy"
        @clear="onClear"
        @toggle-pause="animPause.toggle"
        @toggle-area="onToggleArea"
        @open-settings="settingsOpen = !settingsOpen"
      />
    </div>
  </component>
</template>
