import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useFocusKeeper } from '../../src/composables/useFocusKeeper'

const Harness = defineComponent({
  setup() {
    const target = ref<HTMLElement | null>(null)
    useFocusKeeper(target)
    return () =>
      h('div', { 'data-agentation-vue': '' }, [
        h('input', { 'ref': target, 'class': 'keeper-target', 'data-agentation-vue': '' }),
        h('input', { 'class': 'inside-sibling', 'data-agentation-vue': '' }),
      ])
  },
})

async function flushRecovery() {
  await new Promise(resolve =>
    requestAnimationFrame(() => setTimeout(resolve, 0)),
  )
}

describe('useFocusKeeper', () => {
  it('reclaims focus when an outside element steals it', async () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    await nextTick()

    const target = wrapper.get('.keeper-target').element as HTMLInputElement
    target.focus()
    expect(document.activeElement).toBe(target)

    const thief = document.createElement('input')
    document.body.appendChild(thief)
    thief.focus()
    expect(document.activeElement).toBe(thief)

    await flushRecovery()
    expect(document.activeElement).toBe(target)

    thief.remove()
    wrapper.unmount()
  })

  it('does not fight focus moving within the agentation tree', async () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    await nextTick()

    const target = wrapper.get('.keeper-target').element as HTMLInputElement
    const sibling = wrapper.get('.inside-sibling').element as HTMLInputElement
    target.focus()
    sibling.focus()

    await flushRecovery()
    expect(document.activeElement).toBe(sibling)

    wrapper.unmount()
  })

  it('stops reclaiming after unmount', async () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    await nextTick()

    const target = wrapper.get('.keeper-target').element as HTMLInputElement
    target.focus()
    wrapper.unmount()

    const thief = document.createElement('input')
    document.body.appendChild(thief)
    thief.focus()

    await flushRecovery()
    expect(document.activeElement).toBe(thief)

    thief.remove()
  })
})
