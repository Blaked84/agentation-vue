<script setup lang="ts">
import type { IconName } from '../icons'
import { icons } from '../icons'

defineProps<{ name: IconName }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="icons[name]"
  />
</template>
