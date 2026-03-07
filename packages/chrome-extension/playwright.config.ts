import process from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'html',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm exec vite ./tests/fixtures --host 127.0.0.1 --port 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
