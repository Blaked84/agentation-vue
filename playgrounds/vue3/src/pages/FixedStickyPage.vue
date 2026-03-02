<script setup lang="ts">
import MocButton from '../components/moc/MocButton.vue'
import MocCard from '../components/moc/MocCard.vue'
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Fixed & Sticky Elements
    </h1>
    <p class="page-desc">
      Test annotations on fixed/sticky positioned elements. Scroll down to see sticky behavior.
    </p>

    <div class="sticky-header">
      <span>Sticky Header</span>
      <MocButton variant="outline" size="sm">
        Action
      </MocButton>
    </div>

    <div class="fixed-sidebar">
      <div class="fixed-sidebar-item">
        Home
      </div>
      <div class="fixed-sidebar-item">
        Docs
      </div>
      <div class="fixed-sidebar-item">
        API
      </div>
    </div>

    <div class="scroll-content">
      <section v-for="i in 8" :key="i" class="content-section">
        <h2>Section {{ i }}</h2>
        <p>This is content for section {{ i }}. Scroll to see the sticky header track its position.</p>
        <MocCard :title="`Card in Section ${i}`">
          <p class="card-desc">
            Some content inside this card that can be annotated.
          </p>
          <template #footer>
            <MocButton variant="primary" size="sm">
              Click me
            </MocButton>
          </template>
        </MocCard>
      </section>
    </div>

    <button class="fab">
      +
    </button>
  </div>
</template>

<style scoped>
.page { max-width: 700px; padding-bottom: 100px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 24px; }
.sticky-header { position: sticky; top: 0; background: white; border-bottom: 1px solid #e5e7eb; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 10; font-weight: 600; font-size: 14px; margin-bottom: 24px; }
.fixed-sidebar { position: fixed; left: 240px; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 5; }
.fixed-sidebar-item { padding: 6px 12px; font-size: 12px; cursor: pointer; border-radius: 4px; }
.fixed-sidebar-item:hover { background: #f5f5f5; }
.scroll-content { display: flex; flex-direction: column; gap: 32px; margin-left: 80px; }
.content-section h2 { font-size: 18px; margin-bottom: 8px; }
.content-section p { font-size: 14px; color: #6b7280; margin-bottom: 12px; }
.card-desc { margin-bottom: 0; }
.fab { position: fixed; bottom: 80px; right: 80px; width: 48px; height: 48px; border-radius: 50%; background: #FF5C00; color: white; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(255,92,0,0.4); z-index: 5; display: flex; align-items: center; justify-content: center; }
.fab:hover { transform: scale(1.1); }
</style>
