import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node server.js',
    port: 4173,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI
  }
});
