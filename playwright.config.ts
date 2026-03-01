import { defineConfig, devices } from '@playwright/test'

const vueVersion = process.env.VUE_VERSION || '3'
const port = vueVersion === '2' ? 3001 : 3000
const devCommand = vueVersion === '2' ? 'pnpm dev:vue2' : 'pnpm dev:vue3'

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: `vue${vueVersion}-chromium`,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: devCommand,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
