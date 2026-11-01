import { defineConfig, devices } from '@playwright/test';

// Journey recordings: every test runs with video, trace and screenshots, and is
// named after the journey or rule it proves ("J3: pay with coins at checkout").
// Set BASE_URL to test a deployed preview; otherwise the app is started with
// E2E_START_COMMAND (default `npm run dev`) on E2E_PORT (default 3000).
const port = process.env.E2E_PORT ?? '3000';
const baseURL = process.env.BASE_URL || `http://localhost:${port}`;

export default defineConfig({
  testDir: './journeys',
  outputDir: './report/files',
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: './report/html', open: 'never' }],
    ['json', { outputFile: './report/results.json' }],
  ],
  use: { baseURL, video: 'on', trace: 'on', screenshot: 'on' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: process.env.E2E_START_COMMAND ?? 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
