import { createServer } from 'node:net'
import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const vueVersion = process.env.VUE_VERSION || '3'
const preferredPort = vueVersion === '2' ? 3001 : 3000
const devCommand = vueVersion === '2' ? 'pnpm dev:vue2' : 'pnpm dev:vue3'

async function findFreePort(preferred: number): Promise<number> {
  const tryBind = (p: number) => new Promise<boolean>((resolve) => {
    const srv = createServer()
    srv.once('error', () => resolve(false))
    srv.listen(p, '127.0.0.1', () => srv.close(() => resolve(true)))
  })
  if (await tryBind(preferred))
    return preferred
  return new Promise((resolve) => {
    const srv = createServer()
    srv.listen(0, '127.0.0.1', () => {
      const p = (srv.address() as { port: number }).port
      srv.close(() => resolve(p))
    })
  })
}

const envPort = process.env.PORT
  ? Number(process.env.PORT)
  : process.env.PWT_E2E_PORT
    ? Number(process.env.PWT_E2E_PORT)
    : undefined
const port = envPort ?? (process.env.CI ? preferredPort : await findFreePort(preferredPort))
if (!envPort)
  process.env.PWT_E2E_PORT = String(port)

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
    env: { PORT: String(port) },
  },
})
