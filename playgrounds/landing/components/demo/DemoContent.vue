<template>
  <div class="p-5">
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-6 w-6 rounded bg-gray-200" />
        <div class="h-3 w-28 rounded bg-gray-300" />
      </div>
      <div class="flex gap-2">
        <div class="h-2.5 w-14 rounded bg-gray-200" />
        <div class="h-2.5 w-14 rounded bg-gray-200" />
      </div>
    </div>

    <!-- 2 small cards with buttons -->
    <div class="mt-5 grid grid-cols-2 gap-3">
      <!-- Card 1 — target for annotation -->
      <div class="rounded-lg border border-gray-100 p-3">
        <div class="h-2 w-14 rounded bg-gray-200" />
        <div class="mt-2 h-3 w-20 rounded bg-gray-300" />
        <button
          data-demo-target
          class="mt-3 h-6 w-full rounded-md bg-gray-200 transition-colors hover:bg-gray-300"
        />
      </div>
      <!-- Card 2 -->
      <div class="rounded-lg border border-gray-100 p-3">
        <div class="h-2 w-10 rounded bg-gray-200" />
        <div class="mt-2 h-3 w-16 rounded bg-gray-300" />
        <div class="mt-3 h-6 w-full rounded-md bg-gray-200" />
      </div>
    </div>

    <!-- Large central card -->
    <div class="mt-4 rounded-lg border border-gray-100 p-4">
      <div class="h-2.5 w-24 rounded bg-gray-300" />
      <div class="mt-3 h-2 w-full rounded bg-gray-200" />
      <div class="mt-2 h-2 w-4/5 rounded bg-gray-200" />
      <div class="mt-2 h-2 w-3/5 rounded bg-gray-200" />
    </div>
  </div>
</template>
