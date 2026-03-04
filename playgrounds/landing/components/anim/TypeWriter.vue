<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  speed?: number
  delay?: number
}>(), {
  speed: 30,
  delay: 0,
})

const displayed = ref('')
const showCursor = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < props.text.length) {
        displayed.value = props.text.slice(0, i + 1)
        i++
      }
      else {
        clearInterval(interval)
        setTimeout(() => { showCursor.value = false }, 1000)
      }
    }, props.speed)
  }, props.delay)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <span class="font-mono">
    {{ displayed }}<span
      v-if="showCursor"
      class="inline-block w-[2px] h-[1em] bg-ember-500 ml-0.5 align-middle animate-typing"
    />
  </span>
</template>
