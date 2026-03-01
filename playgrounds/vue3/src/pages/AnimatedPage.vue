<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const jsOffset = ref(0)
let animId: number | null = null
let direction = 1

function animate() {
  jsOffset.value += direction * 1.5
  if (jsOffset.value > 200)
    direction = -1
  if (jsOffset.value < 0)
    direction = 1
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  animId = requestAnimationFrame(animate)
})
onBeforeUnmount(() => {
  if (animId)
    cancelAnimationFrame(animId)
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Animated Page
    </h1>
    <p class="page-desc">
      Test the animation pause feature with CSS animations, transitions, and video.
    </p>

    <section class="section">
      <h2>CSS Keyframe Animations</h2>
      <div class="anim-row">
        <div class="spinner">
          Spin
        </div>
        <div class="bouncer">
          Bounce
        </div>
        <div class="pulser">
          Pulse
        </div>
      </div>
    </section>

    <section class="section">
      <h2>CSS Transitions</h2>
      <p class="transition-hint">
        Hover over these elements:
      </p>
      <div class="anim-row">
        <div class="hover-scale">
          Scale
        </div>
        <div class="hover-rotate">
          Rotate
        </div>
        <div class="hover-color">
          Color
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Video</h2>
      <video class="test-video" width="320" height="180" autoplay muted loop playsinline>
        <source src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p" type="video/mp4">
        Your browser does not support video.
      </video>
      <p class="video-note">
        Video element (pause feature should freeze it)
      </p>
    </section>

    <section class="section">
      <h2>JS Animation</h2>
      <div class="js-anim-container">
        <div class="js-animated-box" :style="{ transform: `translateX(${jsOffset}px)` }">
          JS Animated
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { max-width: 700px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 32px; }
.section { margin-bottom: 32px; }
.section h2 { font-size: 18px; margin-bottom: 12px; }
.anim-row { display: flex; gap: 24px; align-items: center; }
.spinner { width: 60px; height: 60px; border-radius: 8px; background: #3B82F6; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; animation: spin 2s linear infinite; }
.bouncer { width: 60px; height: 60px; border-radius: 8px; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; animation: bounce 1s ease-in-out infinite; }
.pulser { width: 60px; height: 60px; border-radius: 50%; background: #F59E0B; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; animation: pulse 1.5s ease-in-out infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } }
.transition-hint { font-size: 13px; color: #9ca3af; margin-bottom: 12px; }
.hover-scale, .hover-rotate, .hover-color { width: 80px; height: 80px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 300ms ease; }
.hover-scale { background: #EDE9FE; color: #7C3AED; }
.hover-scale:hover { transform: scale(1.3); }
.hover-rotate { background: #FEE2E2; color: #DC2626; }
.hover-rotate:hover { transform: rotate(15deg); }
.hover-color { background: #D1FAE5; color: #059669; }
.hover-color:hover { background: #059669; color: white; }
.test-video { border-radius: 8px; background: #000; display: block; margin-bottom: 8px; }
.video-note { font-size: 12px; color: #9ca3af; }
.js-anim-container { height: 60px; background: #f5f5f5; border-radius: 8px; overflow: hidden; position: relative; }
.js-animated-box { width: 100px; height: 60px; background: #FF5C00; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; border-radius: 8px; }
</style>
