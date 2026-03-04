<script setup lang="ts">
withDefaults(defineProps<{
  x?: number
  y?: number
  type?: 'pointer' | 'crosshair' | 'ibeam'
  clicking?: boolean
  visible?: boolean
}>(), {
  x: 0,
  y: 0,
  type: 'pointer',
  clicking: false,
  visible: true,
})
</script>

<template>
  <div
    class="pointer-events-none absolute z-50"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.15s ease',
      opacity: visible ? 1 : 0,
      transform: clicking ? 'scale(0.85)' : 'scale(1)',
    }"
  >
    <!-- macOS Pointer cursor -->
    <svg
      v-if="type === 'pointer'"
      width="13"
      height="19"
      viewBox="0 0 13 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 0.5L0.5 14.28L3.64 11.14L6.14 17.14L8.36 16.14L5.86 10.14L10.14 9.64L0.5 0.5Z"
        fill="black"
        stroke="white"
        stroke-width="1"
        stroke-linejoin="round"
      />
    </svg>

    <!-- macOS Crosshair cursor -->
    <svg
      v-else-if="type === 'crosshair'"
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="margin-left: -10px; margin-top: -10px"
    >
      <!-- White halo for contrast -->
      <line x1="10.5" y1="0" x2="10.5" y2="8.5" stroke="white" stroke-width="3" stroke-linecap="round" />
      <line x1="10.5" y1="12.5" x2="10.5" y2="21" stroke="white" stroke-width="3" stroke-linecap="round" />
      <line x1="0" y1="10.5" x2="8.5" y2="10.5" stroke="white" stroke-width="3" stroke-linecap="round" />
      <line x1="12.5" y1="10.5" x2="21" y2="10.5" stroke="white" stroke-width="3" stroke-linecap="round" />
      <!-- Black cross -->
      <line x1="10.5" y1="0" x2="10.5" y2="8.5" stroke="black" stroke-width="1.2" stroke-linecap="round" />
      <line x1="10.5" y1="12.5" x2="10.5" y2="21" stroke="black" stroke-width="1.2" stroke-linecap="round" />
      <line x1="0" y1="10.5" x2="8.5" y2="10.5" stroke="black" stroke-width="1.2" stroke-linecap="round" />
      <line x1="12.5" y1="10.5" x2="21" y2="10.5" stroke="black" stroke-width="1.2" stroke-linecap="round" />
    </svg>

    <!-- macOS I-beam cursor -->
    <svg
      v-else
      width="10"
      height="18"
      viewBox="0 0 10 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="margin-left: -5px; margin-top: -9px"
    >
      <!-- White halo -->
      <path d="M1.5 1C3 1 4 2.5 5 4L5 14C4 15.5 3 17 1.5 17" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M8.5 1C7 1 6 2.5 5 4L5 14C6 15.5 7 17 8.5 17" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <!-- Black strokes -->
      <path d="M1.5 1C3 1 4 2.5 5 4L5 14C4 15.5 3 17 1.5 17" stroke="black" stroke-width="1.1" stroke-linecap="round" fill="none" />
      <path d="M8.5 1C7 1 6 2.5 5 4L5 14C6 15.5 7 17 8.5 17" stroke="black" stroke-width="1.1" stroke-linecap="round" fill="none" />
    </svg>
  </div>
</template>
