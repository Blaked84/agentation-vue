<template>
  <div class="page">
    <h1 class="page-title">Basic Elements</h1>
    <p class="page-desc">Test basic element selection, hover highlights, and CSS selector generation.</p>

    <section class="section">
      <h2>Buttons</h2>
      <div class="btn-group">
        <button class="test-submit btn btn-primary">Submit</button>
        <button class="test-cancel btn btn-secondary">Cancel</button>
        <button class="test-delete btn btn-danger">Delete</button>
        <button class="btn btn-outline" disabled>Disabled</button>
      </div>
    </section>

    <section class="section">
      <h2>Links</h2>
      <nav class="link-list">
        <a href="/about" class="link">About</a>
        <a href="/pricing" class="link">Pricing</a>
        <a href="https://example.com" class="link link-external" target="_blank">External Link</a>
      </nav>
    </section>

    <section class="section">
      <h2>Images</h2>
      <div class="image-grid">
        <img alt="avatar" class="avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23ccc'%3E%3Crect width='80' height='80' rx='40'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%23999' font-size='14'%3EAV%3C/text%3E%3C/svg%3E" />
        <img alt="banner" class="banner-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' fill='%23e5e5e5'%3E%3Crect width='200' height='100' rx='8'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%23999' font-size='14'%3EBanner%3C/text%3E%3C/svg%3E" />
      </div>
    </section>

    <section class="section">
      <h2>Form</h2>
      <form class="form" @submit.prevent>
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input id="email" type="email" class="form-input" placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input id="password" type="password" class="form-input" placeholder="Enter password" />
        </div>
        <div class="form-group">
          <label for="message" class="form-label">Message</label>
          <textarea id="message" class="form-textarea" placeholder="Type your message..." rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Send</button>
      </form>
    </section>

    <section class="section">
      <h2>Text Content</h2>
      <p class="quote-text">
        The quick brown fox jumps over the lazy dog. This text can be selected to test
        the text selection annotation feature. Try selecting a few words and see what happens.
      </p>
      <p class="body-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
      </p>
    </section>

    <section class="section">
      <h2>Headings</h2>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    </section>

    <section class="section">
      <h2>Cards</h2>
      <div class="card-grid">
        <div class="card">
          <div class="card-header">Feature One</div>
          <div class="card-body">This is a card with some content inside.</div>
        </div>
        <div class="card">
          <div class="card-header">Feature Two</div>
          <div class="card-body">Another card with different content.</div>
        </div>
        <div class="card">
          <div class="card-header">Feature Three</div>
          <div class="card-body">And a third card for good measure.</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page { max-width: 700px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 32px; }
.section { margin-bottom: 32px; }
.section h2 { font-size: 18px; margin-bottom: 12px; color: #333; }
.btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
.btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; border: none; font-weight: 500; transition: all 150ms; }
.btn-primary { background: #3B82F6; color: white; }
.btn-primary:hover { background: #2563EB; }
.btn-secondary { background: #6B7280; color: white; }
.btn-danger { background: #EF4444; color: white; }
.btn-outline { background: transparent; border: 1px solid #d1d5db; color: #6b7280; }
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
.card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.card-header { padding: 12px 16px; background: #f9fafb; font-weight: 600; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
.card-body { padding: 16px; font-size: 13px; color: #6b7280; }
</style>
