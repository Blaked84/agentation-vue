<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

// --- Native <dialog> demo ---
const nativeDialog = ref<HTMLDialogElement | null>(null)

function openNativeDialog() {
  nativeDialog.value?.showModal()
}

function closeNativeDialog() {
  nativeDialog.value?.close()
}

// --- Focus-trap modal demo (simulates Vuetify / Element Plus behavior) ---
const trapOpen = ref(false)
const trapInput = ref<HTMLInputElement | null>(null)
const trapModal = ref<HTMLElement | null>(null)

function onTrapFocusIn(e: FocusEvent) {
  if (!trapOpen.value || !trapModal.value)
    return
  if (e.target instanceof Node && trapModal.value.contains(e.target))
    return
  trapInput.value?.focus()
}

function openTrapModal() {
  trapOpen.value = true
  document.addEventListener('focusin', onTrapFocusIn)
  requestAnimationFrame(() => trapInput.value?.focus())
}

function closeTrapModal() {
  trapOpen.value = false
  document.removeEventListener('focusin', onTrapFocusIn)
}

// --- body pointer-events lock demo (simulates reka-ui / Radix behavior) ---
const lockOpen = ref(false)

function openLockModal() {
  lockOpen.value = true
  document.body.style.pointerEvents = 'none'
}

function closeLockModal() {
  lockOpen.value = false
  document.body.style.removeProperty('pointer-events')
}

onBeforeUnmount(() => {
  closeTrapModal()
  closeLockModal()
})
</script>

<template>
  <div class="page">
    <h1>Modals &amp; Dialogs</h1>
    <p class="hint">
      Each modal flavor below used to break annotation input focus. Open one,
      activate inspect mode, then annotate an element inside the modal — you
      should be able to type in the comment field.
    </p>

    <section class="demo-section">
      <h2>Native &lt;dialog&gt; (showModal)</h2>
      <p>Everything outside the dialog becomes inert and the dialog paints in the top layer.</p>
      <button type="button" @click="openNativeDialog">
        Open native dialog
      </button>
      <dialog ref="nativeDialog" class="demo-dialog">
        <h3>Native modal dialog</h3>
        <p>Try annotating this paragraph or the input below.</p>
        <input type="text" placeholder="A field inside the dialog">
        <button type="button" @click="closeNativeDialog">
          Close
        </button>
      </dialog>
    </section>

    <section class="demo-section">
      <h2>Focus-trap modal</h2>
      <p>Pulls focus back into the modal whenever it lands elsewhere (Vuetify, Element Plus, focus-trap).</p>
      <button type="button" @click="openTrapModal">
        Open focus-trap modal
      </button>
      <!-- No Teleport: the page is shared with the Vue 2.7 playground -->
      <div v-if="trapOpen" class="demo-overlay">
        <div ref="trapModal" class="demo-modal">
          <h3>Focus-trapped modal</h3>
          <p>Focus is forced back to the field below when it escapes.</p>
          <input ref="trapInput" type="text" placeholder="Trapped field">
          <button type="button" @click="closeTrapModal">
            Close
          </button>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>Pointer-events lock modal</h2>
      <p>Sets <code>pointer-events: none</code> on <code>body</code> while open (reka-ui, Radix, Vaul).</p>
      <button type="button" @click="openLockModal">
        Open pointer-lock modal
      </button>
      <div v-if="lockOpen" class="demo-overlay">
        <div class="demo-modal demo-modal--unlocked">
          <h3>Pointer-locked page</h3>
          <p>The rest of the page ignores the pointer while this is open.</p>
          <input type="text" placeholder="A field inside the modal">
          <button type="button" @click="closeLockModal">
            Close
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hint {
  color: #666;
  font-size: 14px;
}

.demo-section {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.demo-section h2 {
  font-size: 16px;
}

.demo-section p {
  font-size: 13px;
  color: #666;
}

.demo-section button {
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f7f7f7;
  cursor: pointer;
  font-size: 13px;
}

.demo-dialog {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 24px;
  max-width: 360px;
}

.demo-dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
}

.demo-dialog h3,
.demo-modal h3 {
  margin-bottom: 8px;
}

.demo-dialog input,
.demo-modal input {
  display: block;
  width: 100%;
  margin: 12px 0;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.demo-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.demo-modal {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.demo-modal button {
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f7f7f7;
  cursor: pointer;
}

/* Keep the pointer-lock modal itself interactive, like Radix does */
.demo-modal--unlocked {
  pointer-events: auto;
}
</style>
