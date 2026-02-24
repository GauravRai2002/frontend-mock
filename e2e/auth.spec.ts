import { test, expect } from '@playwright/test'

/**
 * Landing Page Smoke Tests
 * Verifies the public landing page renders correctly.
 */
test.describe('Landing Page', () => {
    test('should load the landing page with hero heading', async ({ page }) => {
        await page.goto('/')
        await expect(page.getByRole('heading', { name: /mock apis in/i })).toBeVisible()
    })

    test('should have a Get Started CTA', async ({ page }) => {
        await page.goto('/')
        const cta = page.getByRole('button', { name: /start building free|get started/i }).first()
        await expect(cta).toBeVisible()
    })

    test('should have a how-it-works section', async ({ page }) => {
        await page.goto('/')
        await expect(page.getByText(/three steps/i)).toBeVisible()
    })
})

/**
 * Authentication Flow Tests
 * Verifies the login and signup pages render and accept input correctly.
 */
test.describe('Authentication', () => {
    test('should render the login page', async ({ page }) => {
        await page.goto('/auth/login')
        await expect(page.getByRole('heading', { name: /sign in to mockbird/i })).toBeVisible()
        await expect(page.getByLabel(/email address/i)).toBeVisible()
        await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('should keep the sign in button disabled when fields are empty', async ({ page }) => {
        await page.goto('/auth/login')
        const submitButton = page.getByRole('button', { name: /sign in/i })
        await expect(submitButton).toBeDisabled()
    })

    test('should enable sign in button when credentials are filled', async ({ page }) => {
        await page.goto('/auth/login')
        await page.getByLabel(/email address/i).fill('test@example.com')
        await page.getByLabel(/password/i).fill('password123')
        const submitButton = page.getByRole('button', { name: /sign in/i })
        await expect(submitButton).toBeEnabled()
    })

    test('should navigate to signup page when clicking sign up', async ({ page }) => {
        await page.goto('/auth/login')
        await page.getByRole('button', { name: /sign up/i }).click()
        await expect(page).toHaveURL(/.*signup/)
    })

    test('should render the signup page', async ({ page }) => {
        await page.goto('/auth/signup')
        await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()
    })

    test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
        await page.goto('/dashboard')
        // Clerk or middleware should redirect to auth
        await expect(page).toHaveURL(/.*login|.*auth/)
    })
})
