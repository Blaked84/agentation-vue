<script setup lang="ts">
const visible = ref(true)
const dismissed = ref(false)

function dismiss() {
  visible.value = false
  dismissed.value = true
  document.removeEventListener('pointerdown', onPointerDown, true)
}

function onPointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.__va-toolbar'))
    return
  // In Nuxt SSR, Vue's <Teleport to="body"> renders inside a <teleport> element
  // within #__nuxt. The real toolbar has a <teleport> ancestor; the demo fake doesn't.
  if (target.closest('teleport')) {
    dismiss()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
})
</script>

<template>
  <Transition name="hint">
    <!--
      FAB is at bottom:20px right:20px, size 42px.
      FAB right edge = 20px from viewport right.
      We align this container's right edge to the same 20px
      so the hint stacks directly above the FAB.
      Arrow tip is at SVG x=29 in a 50px-wide SVG:
        50 - 29 = 21px from SVG right = 20 + 21 = 41px from viewport right
        = FAB horizontal center ✓
      Container bottom = 60px so tip lands near FAB top (62px from bottom).
    -->
    <div
      v-if="visible && !dismissed"
      class="pointer-events-none fixed"
      style="bottom: 60px; right: 35px; z-index: 2147483640;"
    >
      <!-- "try it!" right-aligned so it sits above the FAB -->
      <p
        style="font-family: 'Caveat', cursive; font-size: 22px; line-height: 1;
               color: #42b883; text-align: right; margin: 0 0 4px 0;"
      >
        try it!
      </p>

      <!--
        SVG 50×40, arrow from (20,2) curving to tip at (29,36).
        display:block + margin-left:auto flushes SVG right edge
        to container right edge (= 20px from viewport right).
      -->
      <svg
        width="50"
        height="40"
        viewBox="0 0 50 40"
        fill="none"
        style="display: block; margin-left: auto;"
      >
        <!-- Shaft: curves gently down to tip at (29,36) -->
        <path
          d="M20 2 C16 13, 25 24, 29 36"
          stroke="#42b883"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
        <!-- Left wing: from tip going back upper-left -->
        <path
          d="M29 36 L21 31"
          stroke="#42b883"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
        <!-- Right wing: from tip going back upper-right (slightly shorter for hand-drawn asymmetry) -->
        <path
          d="M29 36 L32 29"
          stroke="#42b883"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
      </svg>
    </div>
  </Transition>
</template>

<style scoped>
.hint-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.hint-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hint-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.hint-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
