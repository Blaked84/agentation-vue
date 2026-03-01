<template>
  <span class="__va-comp-chain" :class="`__va-comp-chain--${variant}`">
    <span v-for="comp in components" :key="comp" class="__va-comp">
      <span class="__va-comp-bracket">&lt;</span>{{ comp }}<span class="__va-comp-bracket">&gt;</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue-demi'

const props = withDefaults(defineProps<{
  chain: string
  variant?: 'dark' | 'light'
}>(), {
  variant: 'light',
})

const components = computed(() => props.chain.split(' > '))
</script>
