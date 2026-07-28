import type { Annotation } from '../../src/types'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import {
  isTargetCenterClipped,
  useMarkerPositions,
} from '../../src/composables/useMarkerPositions'

describe('isTargetCenterClipped', () => {
  const targetRect = {
    top: 100,
    right: 200,
    bottom: 140,
    left: 100,
  }

  it('keeps a target visible when its center is inside every clipping ancestor', () => {
    expect(isTargetCenterClipped(targetRect, [
      { top: 80, right: 220, bottom: 130, left: 80 },
      { top: 90, right: 180, bottom: 150, left: 90 },
    ])).toBe(false)
  })

  it('clips a partially visible target when its center is outside the intersection', () => {
    expect(isTargetCenterClipped(targetRect, [
      { top: 80, right: 220, bottom: 119, left: 80 },
    ])).toBe(true)
  })

  it('clips a target when nested ancestor intersections do not overlap its center', () => {
    expect(isTargetCenterClipped(targetRect, [
      { top: 80, right: 220, bottom: 135, left: 80 },
      { top: 125, right: 220, bottom: 160, left: 80 },
    ])).toBe(true)
  })
})

describe('useMarkerPositions', () => {
  const rafCallbacks: FrameRequestCallback[] = []

  beforeEach(() => {
    document.body.innerHTML = ''
    rafCallbacks.length = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafCallbacks.push(callback)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushAnimationFrames() {
    const callbacks = rafCallbacks.splice(0)
    callbacks.forEach(callback => callback(0))
  }

  it('resolves and positions a target that mounts after the initial re-anchor', async () => {
    const annotations = ref<Annotation[]>([{
      id: 'late-target',
      x: 0,
      y: 0,
      comment: 'Lazy route target',
      element: 'h1',
      elementPath: '.late-target',
      timestamp: 1,
    }])
    let markerPositions: ReturnType<typeof useMarkerPositions> | undefined
    const host = defineComponent({
      setup() {
        markerPositions = useMarkerPositions(annotations)
        return () => h('div')
      },
    })
    const wrapper = mount(host, { attachTo: document.body })

    await nextTick()
    await nextTick()
    flushAnimationFrames()
    expect(markerPositions?.targetStates.value.has('late-target')).toBe(false)

    const target = document.createElement('h1')
    target.className = 'late-target'
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 20,
      y: 120,
      top: 120,
      right: 120,
      bottom: 140,
      left: 20,
      width: 100,
      height: 20,
      toJSON: () => ({}),
    })
    document.body.appendChild(target)

    // A retry pass is what re-attempts resolution for ids the negative
    // cache already marked unresolved (e.g. triggered by a ResizeObserver
    // callback or the annotations watcher in production).
    markerPositions?.recalculatePositions(true)
    flushAnimationFrames()

    expect(markerPositions?.targetStates.value.has('late-target')).toBe(true)
    expect(annotations.value[0].y).toBe(130)

    const targetStates = markerPositions?.targetStates.value
    markerPositions?.recalculatePositions()
    flushAnimationFrames()
    expect(markerPositions?.targetStates.value).toBe(targetStates)

    wrapper.unmount()
  })

  it('re-attempts resolution on a plain recalculation once the retry interval elapsed', async () => {
    const annotations = ref<Annotation[]>([{
      id: 'silent-mount',
      x: 0,
      y: 0,
      comment: 'Target mounting without an #app resize',
      element: 'h1',
      elementPath: '.silent-mount',
      timestamp: 1,
    }])
    let markerPositions: ReturnType<typeof useMarkerPositions> | undefined
    const host = defineComponent({
      setup() {
        markerPositions = useMarkerPositions(annotations)
        return () => h('div')
      },
    })
    const wrapper = mount(host, { attachTo: document.body })

    await nextTick()
    await nextTick()
    flushAnimationFrames()
    expect(markerPositions?.targetStates.value.has('silent-mount')).toBe(false)

    const target = document.createElement('h1')
    target.className = 'silent-mount'
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 20,
      y: 120,
      top: 120,
      right: 120,
      bottom: 140,
      left: 20,
      width: 100,
      height: 20,
      toJSON: () => ({}),
    })
    document.body.appendChild(target)

    // No retry trigger fires (no #app resize, no annotations change): a plain
    // scroll-driven pass within the interval must stay cheap and skip it.
    markerPositions?.recalculatePositions()
    flushAnimationFrames()
    expect(markerPositions?.targetStates.value.has('silent-mount')).toBe(false)

    // Once the interval elapsed, the same plain pass sweeps the cache again.
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000)
    markerPositions?.recalculatePositions()
    flushAnimationFrames()

    expect(markerPositions?.targetStates.value.has('silent-mount')).toBe(true)
    expect(annotations.value[0].y).toBe(130)

    wrapper.unmount()
  })

  it('recalculates an anchored marker for non-bubbling inner-container scroll', async () => {
    const scroller = document.createElement('div')
    const target = document.createElement('button')
    target.className = 'target'
    scroller.appendChild(target)
    document.body.appendChild(scroller)

    let targetTop = 120
    vi.spyOn(target, 'getBoundingClientRect').mockImplementation(() => ({
      x: 20,
      y: targetTop,
      top: targetTop,
      right: 120,
      bottom: targetTop + 20,
      left: 20,
      width: 100,
      height: 20,
      toJSON: () => ({}),
    }))

    const annotations = ref<Annotation[]>([{
      id: '1',
      x: 0,
      y: 0,
      comment: 'Nested target',
      element: 'button',
      elementPath: '.target',
      timestamp: 1,
      _targetRef: new WeakRef(target),
    }])
    const host = defineComponent({
      setup() {
        useMarkerPositions(annotations)
        return () => h('div')
      },
    })
    const wrapper = mount(host, { attachTo: document.body })

    await nextTick()
    await nextTick()
    flushAnimationFrames()
    expect(annotations.value[0].y).toBe(130)

    targetTop = 40
    scroller.dispatchEvent(new Event('scroll', { bubbles: false }))
    flushAnimationFrames()

    expect(annotations.value[0].y).toBe(50)
    wrapper.unmount()
  })
})
