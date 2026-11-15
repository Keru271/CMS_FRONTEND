import { test, expect } from '@playwright/test';
import { loginViaUI, TEST_ADMIN_CREDENTIALS } from './helpers/auth.helper';

test.describe('End-to-End: Authentication Flow', () => {
  test('should render the login page with all UI elements', async ({ page }) => {
    await page.goto('/login');

    // Verify page header
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('p')).toContainText('Enter your email & password');

    // Verify inputs and submit button
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('Login');

    // Verify Sign up link
    const signUpLink = page.locator('a[href="/register"]');
    await expect(signUpLink).toBeVisible();
  });

  test('should show validation errors when submitted empty', async ({ page }) => {
    await page.goto('/login');

    // Click submit without entering values
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for Yup error message
    const emailError = page.locator('text=Email address is required');
    await expect(emailError).toBeVisible();
  });

  test('should display error banner on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[name="email"]').fill('wrong_user@example.com');
    await page.locator('input[name="password"]').fill('WrongPassword123!');
    await page.locator('button[type="submit"]').click();

    // Fastify backend returns 400 with "Email is not registered..."
    const errorBanner = page.locator('.text-red-600, .text-red-500, .text-red-400');
    await expect(errorBanner.first()).toBeVisible({ timeout: 10000 });
  });

  test('should toggle password visibility on click', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('Secret123!');

    // Initially type is password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    const toggleButton = page.locator('button[aria-label="Show password"]');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should navigate between login and register views', async ({ page }) => {
    await page.goto('/login');

    // Click Sign up button/link
    const signUpLink = page.locator('a[href="/register"]').first();
    await signUpLink.click();

    await page.waitForURL('**/register');
    await expect(page.locator('h1')).toContainText('Create Merchant Account');

    // Navigate back to Sign in
    const signInLink = page.locator('a[href="/login"]').first();
    await signInLink.click();

    await page.waitForURL('**/login');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should successfully log in and access dashboard', async ({ page }) => {
    await loginViaUI(page, TEST_ADMIN_CREDENTIALS.email, TEST_ADMIN_CREDENTIALS.password);

    // Verify redirected to dashboard or onboarding
    expect(page.url()).not.toContain('/login');

    // Header or sidebar should be visible
    const aside = page.locator('aside');
    await expect(aside.first()).toBeVisible({ timeout: 15000 });
  });

  test('should successfully log out and redirect to login page', async ({ page }) => {
    await loginViaUI(page, TEST_ADMIN_CREDENTIALS.email, TEST_ADMIN_CREDENTIALS.password);

    // Open user profile dropdown in header
    const userProfileTrigger = page.locator('button:has(.w-6.h-6.rounded-lg)');
    await expect(userProfileTrigger.first()).toBeVisible({ timeout: 15000 });
    await userProfileTrigger.first().click();

    // Click Sign Out
    const signOutButton = page.locator('button:has-text("Sign Out")');
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();

    // Should redirect back to /login
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Welcome back');
  });
});

