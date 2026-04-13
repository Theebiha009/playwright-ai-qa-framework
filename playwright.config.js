import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/playwright/html-report', open: 'never' }]
  ],
  outputDir: "reports/playwright/test-results",
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  }
});