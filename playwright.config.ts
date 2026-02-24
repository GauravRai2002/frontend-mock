import { defineConfig, devices } from '@playwright/test'

/**
 * MockBird Playwright E2E Configuration
 *
 * Runs the Next.js dev server automatically before tests.
 * Tests live in the `e2e/` directory.
 *
 * Run locally:
 *   npx playwright test
 *
 * Run with UI mode (interactive):
 *   npx playwright test --ui
 */
export default defineConfig({
    testDir: './e2e',

    // Maximum time one test can run
    timeout: 30_000,

    // Re-run failed tests 1 time (useful in CI)
    retries: process.env.CI ? 1 : 0,

    // Report in terminal + generate HTML report
    reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],

    // Shared settings for all tests
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',

        // Capture screenshot on failure
        screenshot: 'only-on-failure',

        // Capture trace on first retry (helps debugging in CI)
        trace: 'on-first-retry',
    },

    // Run in Chromium only by default. Add Firefox/WebKit if needed.
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Automatically start the Next.js dev server before running tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI, // Reuse local server in dev, always fresh in CI
        timeout: 120_000,
    },
})
