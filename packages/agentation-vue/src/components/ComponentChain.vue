<script setup lang="ts">
import { computed, ref } from 'vue-demi'

const props = withDefaults(defineProps<{
  chain: string
  variant?: 'dark' | 'light'
  truncate?: 'none' | 'auto' | 'leaf'
}>(), {
  variant: 'light',
  truncate: 'none',
})

const TRUNCATE_THRESHOLD = 4

const components = computed(() => props.chain.split(' > '))
const shouldTruncate = computed(() => components.value.length >= TRUNCATE_THRESHOLD)

// For 'auto' mode: first + ellipsis + last 2
const autoTruncated = computed(() => {
  if (!shouldTruncate.value) return components.value
  const all = components.value
  return [all[0], null, all[all.length - 2], all[all.length - 1]] as (string | null)[]
})

// For 'leaf' mode
const leafExpanded = ref(false)
</script>

<template>
  <!-- Mode: 'auto' — automatic breadcrumb collapse for hover labels -->
  <span
    v-if="truncate === 'auto'"
    class="__va-comp-chain"
    :class="`__va-comp-chain--${variant}`"
  >
    <template v-if="shouldTruncate">
      <span
        v-for="(comp, i) in autoTruncated"
        :key="i"
        :class="comp === null ? '__va-comp-ellipsis' : '__va-comp'"
      >
        <template v-if="comp === null">&hellip;</template>
        <template v-else><span class="__va-comp-bracket">&lt;</span>{{ comp }}<span class="__va-comp-bracket">&gt;</span></template>
      </span>
    </template>
    <template v-else>
      <span v-for="comp in components" :key="comp" class="__va-comp">
        <span class="__va-comp-bracket">&lt;</span>{{ comp }}<span class="__va-comp-bracket">&gt;</span>
      </span>
    </template>
  </span>

  <!-- Mode: 'leaf' — collapsed breadcrumb with click-to-expand -->
  <span
    v-else-if="truncate === 'leaf'"
    class="__va-comp-chain"
    :class="[
      `__va-comp-chain--${variant}`,
      shouldTruncate ? '__va-comp-chain--collapsible' : '',
    ]"
    @click.stop="shouldTruncate ? (leafExpanded = !leafExpanded) : undefined"
  >
    <template v-if="!shouldTruncate || leafExpanded">
      <span v-for="comp in components" :key="comp" class="__va-comp">
        <span class="__va-comp-bracket">&lt;</span>{{ comp }}<span class="__va-comp-bracket">&gt;</span>
      </span>
    </template>
    <template v-else>
      <span
        v-for="(comp, i) in autoTruncated"
        :key="i"
        :class="comp === null ? '__va-comp-ellipsis' : '__va-comp'"
      >
        <template v-if="comp === null">&hellip;</template>
        <template v-else><span class="__va-comp-bracket">&lt;</span>{{ comp }}<span class="__va-comp-bracket">&gt;</span></template>
      </span>
    </template>
  </span>

  <!-- Mode: 'none' (default) — full chain -->
  <span
    v-else
    class="__va-comp-chain"
    :class="`__va-comp-chain--${variant}`"
  >
    <span v-for="comp in components" :key="comp" class="__va-comp">
      <span class="__va-comp-bracket">&lt;</span>{{ comp }}<span class="__va-comp-bracket">&gt;</span>
    </span>
  </span>
</template>
