<script setup lang="ts">
import type { LandingIconName } from '../icons'
import { landingIcons } from '../icons'

defineProps<{ name: LandingIconName }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="landingIcons[name]"
  />
</template>
