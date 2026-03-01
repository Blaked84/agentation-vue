<script setup lang="ts">
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Iframes
    </h1>
    <p class="page-desc">
      Test iframe handling. The iframe element itself is annotatable, but internal content is not.
    </p>

    <section class="section">
      <h2>Same-origin iframe (srcdoc)</h2>
      <iframe
        class="test-iframe iframe-same-origin"
        srcdoc="<html><body style='font-family:sans-serif;padding:16px'><h3>Same-origin iframe</h3><p>This content is inside an iframe.</p><button>Button inside iframe</button></body></html>"
        width="100%"
        height="150"
      />
    </section>

    <section class="section">
      <h2>Cross-origin iframe</h2>
      <iframe
        class="test-iframe iframe-cross-origin"
        src="https://example.com"
        width="100%"
        height="200"
        sandbox
      />
    </section>

    <section class="section">
      <h2>Known Limitation</h2>
      <div class="info-box">
        <p><strong>elementFromPoint()</strong> does not traverse iframe boundaries.</p>
        <p>You can annotate the iframe element itself (e.g., <code>&lt;iframe.test-iframe&gt;</code>), but you cannot click individual elements inside the iframe.</p>
        <p>This is a browser security limitation, not a bug.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { max-width: 700px; }
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-desc { color: #666; margin-bottom: 32px; }
.section { margin-bottom: 32px; }
.section h2 { font-size: 18px; margin-bottom: 12px; }
.test-iframe { border: 1px solid #e5e7eb; border-radius: 8px; display: block; }
.info-box { padding: 16px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; }
.info-box p { font-size: 13px; color: #92400e; margin-bottom: 8px; }
.info-box p:last-child { margin-bottom: 0; }
.info-box code { background: #fef3c7; padding: 2px 4px; border-radius: 3px; font-size: 12px; }
</style>
