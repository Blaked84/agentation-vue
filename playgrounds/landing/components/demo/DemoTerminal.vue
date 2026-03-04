<script setup lang="ts">
const props = withDefaults(defineProps<{
  text?: string
  active?: boolean
}>(), {
  text: '',
  active: false,
})

const isTyping = computed(() => props.active && props.text.length > 0)
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden rounded-xl shadow-va-deep">
    <!-- Window chrome -->
    <div class="flex shrink-0 items-center gap-2 bg-[#2a2a2a] px-4 py-2.5">
      <div class="flex gap-1.5">
        <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span class="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>
    </div>

    <!-- Terminal body -->
    <div class="flex-1 bg-[#1e1e1e] px-5 pb-5 pt-4">
      <!-- Claude Code header -->
      <div class="mb-4 flex items-center gap-3">
        <!-- Claude logo -->
        <svg class="shrink-0" width="50" height="32" viewBox="0 0 126 82" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Head top -->
          <path d="M105 0H21V16.2H105V0Z" fill="#D77757" />
          <!-- Left ear -->
          <path d="M35 16.2H21V32.4H35V16.2Z" fill="#D77757" />
          <!-- Right ear -->
          <path d="M105 16.2H91V32.4H105V16.2Z" fill="#D77757" />
          <!-- Face background -->
          <rect x="35" y="14.7" width="56" height="29.5" fill="#1e1e1e" />
          <!-- Snout -->
          <path d="M84 14.7H42V36.8H84V14.7Z" fill="#D77757" />
          <!-- Body -->
          <path d="M119 32.4H7V48.6H119V32.4Z" fill="#D77757" />
          <!-- Belly -->
          <path d="M105 48.6H21V64.8H105V48.6Z" fill="#D77757" />
          <!-- Legs -->
          <path d="M35 64.8H28V81H35V64.8Z" fill="#D77757" />
          <path d="M49 64.8H42V81H49V64.8Z" fill="#D77757" />
          <path d="M84 64.8H77V81H84V64.8Z" fill="#D77757" />
          <path d="M98 64.8H91V81H98V64.8Z" fill="#D77757" />
        </svg>
        <div>
          <div class="font-mono text-[13px] text-[#d4d4d4]">
            <span class="font-semibold">Claude Code</span>
            <span class="ml-1 text-[#888]">v2.1.66</span>
          </div>
          <div class="font-mono text-[11px] text-[#888]">
            Opus 4.6 · Claude Max
          </div>
        </div>
      </div>

      <!-- Separator -->
      <div class="mb-4 h-px bg-[#333]" />

      <!-- Prompt + output -->
      <div class="flex gap-2">
        <span class="select-none font-mono text-sm leading-relaxed text-[#d4d4d4]">›</span>
        <div class="flex-1 min-w-0">
          <pre v-if="text" class="m-0 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#d4d4d4]">{{ text }}</pre>
          <span
            v-if="isTyping"
            class="inline-block h-[14px] w-[7px] translate-y-[1px] bg-[#d4d4d4] animate-typing"
          />
          <span
            v-if="!text"
            class="inline-block h-[14px] w-[7px] bg-[#d4d4d4] animate-typing"
          />
        </div>
      </div>
    </div>
  </div>
</template>
