import { createServer } from 'node:net'
import process from 'node:process'
import { defineConfig } from '@playwright/test'

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
  : process.env.PWT_CHROME_EXT_PORT
    ? Number(process.env.PWT_CHROME_EXT_PORT)
    : undefined
const port = envPort ?? (process.env.CI ? 3000 : await findFreePort(3000))
if (!envPort)
  process.env.PWT_CHROME_EXT_PORT = String(port)

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: process.env.CI ? 'html' : 'line',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `pnpm exec vite ./tests/fixtures --host 127.0.0.1 --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
