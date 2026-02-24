import { test, expect, type Page } from '@playwright/test'

/**
 * Dashboard Smoke Tests
 *
 * NOTE: These tests require an authenticated session. 
 * Clerk does not support test users natively in the same way 
 * as email/password backends. A common pattern is to use a
 * stored authentication state (see Playwright's `storageState`).
 *
 * For now, these tests validate the UI structure of the dashboard
 * when intercepting the auth check via `page.addInitScript` or 
 * when using a pre-seeded `storageState` file.
 *
 * FUTURE: 
 * - Add a Playwright global setup that logs in a real test account 
 *   and saves the Clerk session to `e2e/.auth/user.json`.
 * - Then use `storageState: 'e2e/.auth/user.json'` in the test config.
 */

test.describe('Dashboard (unauthenticated)', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
        await page.goto('/dashboard')
        await expect(page).toHaveURL(/auth|login/, { timeout: 10_000 })
    })
})

/**
 * Authenticated Dashboard Tests
 *
 * These tests use a stored authentication state.
 * Run the global setup to generate the auth state first:
 *   npx playwright test --project=setup (not configured yet)
 *
 * Once storageState is configured, uncomment the test.use block.
 */
// test.describe('Dashboard (authenticated)', () => {
//     test.use({ storageState: 'e2e/.auth/user.json' })
//
//     test('should display the project dashboard', async ({ page }) => {
//         await page.goto('/dashboard')
//         await expect(page.getByRole('heading', { name: /projects|dashboard/i })).toBeVisible()
//     })
//
//     test('should show a create project button', async ({ page }) => {
//         await page.goto('/dashboard')
//         const createBtn = page.getByRole('button', { name: /new project|create/i })
//         await expect(createBtn).toBeVisible()
//     })
// })
