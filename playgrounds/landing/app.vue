<script setup lang="ts">
const isDesktop = ref(false)

onMounted(() => {
  const mq = window.matchMedia('(min-width: 768px)')
  isDesktop.value = mq.matches
  mq.addEventListener('change', e => isDesktop.value = e.matches)
})
</script>

<template>
  <NuxtPage />
  <ClientOnly>
    <template v-if="isDesktop">
      <agentation-vue />
      <LandingTryIt />
    </template>
  </ClientOnly>
</template>
