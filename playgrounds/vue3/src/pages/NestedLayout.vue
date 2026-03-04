<script setup lang="ts">
import { ref } from 'vue'
import MocButton from '../components/moc/MocButton.vue'
import MocCard from '../components/moc/MocCard.vue'
import MocPanel from '../components/moc/MocPanel.vue'
import MocSection from '../components/moc/MocSection.vue'
import MocWidget from '../components/moc/MocWidget.vue'

const sidebarCollapsed = ref(false)
const modalOpen = ref(false)
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Nested Layout
    </h1>
    <p class="page-desc">
      Test annotations in complex stacking contexts, overflow hidden, and modals.
    </p>

    <div class="layout-demo">
      <div class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
        <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '>' : '<' }}
        </button>
        <div v-if="!sidebarCollapsed" class="sidebar-content">
          <div class="sidebar-item">
            Dashboard
          </div>
          <div class="sidebar-item">
            Analytics
          </div>
          <div class="sidebar-item">
            Settings
          </div>
        </div>
      </div>

      <div class="main-content">
        <MocSection title="Deeply Nested Components">
          <MocPanel title="Panel wrapper">
            <MocWidget label="Widget level">
              <MocCard title="Overflow: hidden container">
                <p class="card-copy">
                  Content inside an overflow:hidden parent. Annotations should still work via portal.
                </p>
                <MocButton class="test-overflow-btn" variant="primary">
                  Button in overflow
                </MocButton>
                <div class="overflow-long-text">
                  This text extends beyond the container boundaries but is clipped.
                  Try annotating elements inside this container.
                </div>
              </MocCard>
            </MocWidget>
          </MocPanel>
        </MocSection>

        <div class="stacking-demo">
          <h3>Stacking Contexts</h3>
          <div class="stack-layer stack-layer-1">
            Layer 1 (z-index: 1)
          </div>
          <div class="stack-layer stack-layer-2">
            Layer 2 (z-index: 10)
          </div>
          <div class="stack-layer stack-layer-3">
            Layer 3 (z-index: 100)
          </div>
        </div>

        <div class="transform-container">
          <MocPanel title="Transform Panel">
            <MocWidget label="Nested widget">
              <MocCard title="Transform Context">
                <p class="card-copy">
                  This box has a CSS transform applied. Elements inside create a new stacking context.
                </p>
                <MocButton variant="secondary">
                  Inside transform
                </MocButton>
              </MocCard>
            </MocWidget>
          </MocPanel>
        </div>

        <MocButton variant="primary" @click="modalOpen = true">
          Open Modal
        </MocButton>
      </div>
    </div>

    <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false">
      <div class="modal">
        <h3 class="modal-title">
          Modal Dialog
        </h3>
        <p class="modal-body">
          This modal has a backdrop and high z-index. Annotations should work inside.
        </p>
        <div class="modal-actions">
          <MocButton variant="secondary" @click="modalOpen = false">
            Cancel
          </MocButton>
          <MocButton variant="primary" @click="modalOpen = false">
            Confirm
          </MocButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 800px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 24px; }
.layout-demo { display: flex; gap: 16px; margin-bottom: 24px; }
.sidebar { width: 180px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; transition: width 200ms; flex-shrink: 0; }
.sidebar--collapsed { width: 48px; }
.sidebar-toggle { background: none; border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 8px; cursor: pointer; margin-bottom: 12px; }
.sidebar-item { padding: 8px; border-radius: 4px; font-size: 13px; cursor: pointer; }
.sidebar-item:hover { background: #e5e7eb; }
.main-content { flex: 1; display: flex; flex-direction: column; gap: 24px; }
.overflow-container { overflow: hidden; max-height: 210px; border: 1px solid #e5e7eb; border-radius: 8px; }
.card-copy { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
.overflow-long-text { font-size: 12px; color: #9ca3af; margin-top: 12px; }
.stacking-demo { position: relative; height: 120px; }
.stacking-demo h3 { font-size: 15px; margin-bottom: 8px; }
.stack-layer { position: absolute; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.stack-layer-1 { top: 30px; left: 0; z-index: 1; background: #dbeafe; color: #1e40af; }
.stack-layer-2 { top: 50px; left: 60px; z-index: 10; background: #dcfce7; color: #166534; }
.stack-layer-3 { top: 40px; left: 120px; z-index: 100; background: #fef3c7; color: #92400e; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 12px; padding: 24px; width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.modal-title { font-size: 18px; margin-bottom: 12px; }
.modal-body { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
</style>
