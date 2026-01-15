import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 順次実行してリソース競合を回避
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // バックエンドAPI
      command: 'pnpm --filter @ato/backend dev',
      cwd: '../../../',
      url: 'http://localhost:8787/health',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
    },
    {
      // フロントエンド
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
    },
  ],
})
