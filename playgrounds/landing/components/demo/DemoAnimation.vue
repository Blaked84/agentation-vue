<script setup lang="ts">
import type { DemoStopPhase } from '../../composables/useDemoChoreography'

const props = defineProps<{
  /** If set, stop the animation at this phase and hold the frame. */
  stopAtPhase?: DemoStopPhase
}>()

const containerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const {
  phase,
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
} = useDemoChoreography(containerRef, contentRef, { stopAtPhase: props.stopAtPhase })
</script>

<template>
  <div ref="containerRef" class="relative" :data-demo-phase="phase">
    <!--
      Both windows are FIXED in position — no translate transitions.
      Browser: offset (-20px, -20px) from content center.
      Terminal: offset (+20px, +20px) from content center.
      Same size (content area = container - 40px each axis).
      Swap = z-index + opacity only. No movement → no layout shift.
    -->
    <div class="relative mx-auto w-full p-5 md:w-5/6">
      <!-- Terminal: fixed at (+20, +20), peeks bottom-right when behind -->
      <div
        class="absolute top-5 left-5 bottom-5 right-5"
        style="transform: translate(20px, 20px);"
        :style="{
          zIndex: terminalActive ? 20 : 10,
          opacity: terminalActive ? 1 : 0.7,
          transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }"
      >
        <DemoTerminal class="h-full" :text="terminalText" :active="terminalActive" />
      </div>

      <!-- Browser: fixed at (-20, -20), peeks top-left when behind -->
      <div
        style="position: relative; transform: translate(-20px, -20px);"
        :style="{
          zIndex: terminalActive ? 10 : 20,
          opacity: terminalActive ? 0.7 : 1,
          transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }"
      >
        <DemoBrowser url="your-app.dev">
          <div ref="contentRef" class="relative">
            <DemoContent />
            <DemoHighlight
              :visible="highlightVisible"
              :rect="highlightRect ?? undefined"
              chain="App > Dashboard > StatsCard > ActionButton"
            />
            <DemoPopup
              :visible="popupVisible"
              :text="popupText"
              :position="popupPosition"
            />
            <DemoMarkerFake
              :visible="markerVisible"
              :pending="markerPending"
              :position="markerPosition"
              :number="1"
            />
          </div>
        </DemoBrowser>
        <DemoToolbarFake
          :expanded="toolbarExpanded"
          :annotation-count="annotationCount"
        />
      </div>
    </div>

    <!-- Fake cursor (absolute over entire containerRef) -->
    <DemoCursor
      :x="cursorX"
      :y="cursorY"
      :type="cursorType"
      :visible="cursorVisible"
      :clicking="cursorClicking"
    />
  </div>
</template>
