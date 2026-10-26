const { defineConfig } = require('@playwright/test');
if (process.env.ZOO_LIVE_BASE_URL) throw Error('Use playwright.live.config.cjs for public post-deployment checks, not the 29-test candidate suite');
const core = /core\.spec\.js/;
// Four browser/device combinations, not a wasteful full cartesian matrix.
const mobile = { viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const desktop = { viewport: { width: 1280, height: 900 }, screen: { width: 1280, height: 900 }, deviceScaleFactor: 1 };
module.exports = defineConfig({
  testDir: './tests',
  outputDir: './artifacts/test-results',
  timeout: 90_000,
  globalTimeout: 10 * 60_000,
  expect: { timeout: 8_000 },
  workers: 2,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0, // First failures remain failures; no paid rerun is silently hidden.
  reporter: [['list'], ['json', { outputFile: './artifacts/results.json' }], ['html', { outputFolder: './artifacts/report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173/',
    locale: 'zh-CN', timezoneId: 'UTC', colorScheme: 'light',
    reducedMotion: 'reduce', serviceWorkers: 'block',
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
    video: 'off', actionTimeout: 8_000, navigationTimeout: 15_000,
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', ...desktop }, testMatch: [/core\.spec\.js/, /edges\.spec\.js/, /assets\.spec\.js/, /desktop-layout\.spec\.js/, /baseline\.spec\.js/] },
    { name: 'chromium-mobile', use: { browserName: 'chromium', ...mobile }, testMatch: [core, /mobile-layout\.spec\.js/] },
    { name: 'webkit-desktop', use: { browserName: 'webkit', ...desktop }, testMatch: core },
    { name: 'webkit-mobile', use: { browserName: 'webkit', ...mobile }, testMatch: core },
  ],
  webServer: {
    command: 'node scripts/serve.cjs', cwd: __dirname,
    url: 'http://127.0.0.1:4173', reuseExistingServer: false,
    timeout: 15_000, stdout: 'pipe', stderr: 'pipe',
  },
  metadata: {
    scope: 'Candidate validation on runner loopback before deployment; anonymous synthetic answers only',
    mobileLimit: 'Mobile viewport/touch emulation in desktop Linux engines, not real iOS/Android hardware',
    textResizeLimit: 'Explicit 200% text-resize fixture, not native browser/device zoom or OS font scaling',
  },
});
