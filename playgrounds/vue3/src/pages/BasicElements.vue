<script setup lang="ts">
import MocButton from '../components/moc/MocButton.vue'
import MocCard from '../components/moc/MocCard.vue'
import MocSection from '../components/moc/MocSection.vue'
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Basic Elements
    </h1>
    <p class="page-desc">
      Test basic element selection, hover highlights, and CSS selector generation.
    </p>

    <MocSection title="Buttons">
      <div class="btn-group">
        <MocButton class="test-submit" variant="primary">
          Submit
        </MocButton>
        <MocButton class="test-cancel" variant="secondary">
          Cancel
        </MocButton>
        <MocButton class="test-delete" variant="danger">
          Delete
        </MocButton>
        <MocButton variant="outline" disabled>
          Disabled
        </MocButton>
      </div>
    </MocSection>

    <MocSection title="Links">
      <nav class="link-list">
        <a href="/about" class="link">About</a>
        <a href="/pricing" class="link">Pricing</a>
        <a href="https://example.com" class="link link-external" target="_blank">External Link</a>
      </nav>
    </MocSection>

    <MocSection title="Images">
      <div class="image-grid">
        <img alt="avatar" class="avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23ccc'%3E%3Crect width='80' height='80' rx='40'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%23999' font-size='14'%3EAV%3C/text%3E%3C/svg%3E">
        <img alt="banner" class="banner-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' fill='%23e5e5e5'%3E%3Crect width='200' height='100' rx='8'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%23999' font-size='14'%3EBanner%3C/text%3E%3C/svg%3E">
      </div>
    </MocSection>

    <MocSection title="Form">
      <form class="form" @submit.prevent>
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input id="email" type="email" class="form-input" placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input id="password" type="password" class="form-input" placeholder="Enter password">
        </div>
        <div class="form-group">
          <label for="message" class="form-label">Message</label>
          <textarea id="message" class="form-textarea" placeholder="Type your message..." rows="3" />
        </div>
        <MocButton type="submit" variant="primary">
          Send
        </MocButton>
      </form>
    </MocSection>

    <MocSection title="Text Content">
      <p class="quote-text">
        The quick brown fox jumps over the lazy dog. This text can be selected to test
        the text selection annotation feature. Try selecting a few words and see what happens.
      </p>
      <p class="body-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
      </p>
    </MocSection>

    <MocSection title="Headings">
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    </MocSection>

    <MocSection title="Cards">
      <div class="card-grid">
        <MocCard title="Feature One">
          This is a card with some content inside.
        </MocCard>
        <MocCard title="Feature Two">
          Another card with different content.
        </MocCard>
        <MocCard title="Feature Three">
          And a third card for good measure.
        </MocCard>
      </div>
    </MocSection>
  </div>
</template>

<style scoped>
.page { max-width: 700px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 32px; }
.btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
.link-list { display: flex; gap: 16px; }
.link { color: #3B82F6; font-size: 14px; }
.link-external { color: #8B5CF6; }
.image-grid { display: flex; gap: 16px; align-items: center; }
.avatar { width: 80px; height: 80px; border-radius: 50%; }
.banner-img { border-radius: 8px; }
.form { display: flex; flex-direction: column; gap: 16px; max-width: 400px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 13px; font-weight: 500; color: #374151; }
.form-input, .form-textarea { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #3B82F6; }
.quote-text { font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 16px; }
.body-text { font-size: 14px; line-height: 1.6; color: #6b7280; }
.card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
</style>
