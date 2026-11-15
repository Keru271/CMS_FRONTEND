import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers/auth.helper';

test.describe('End-to-End: Orders & Customers Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should render Orders Studio with status filters and search bar', async ({ page }) => {
    await page.goto('/orders');

    // Verify page header
    const heading = page.locator('h1, h2').filter({ hasText: /Order/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Verify status filter pills are visible (ALL, PENDING, etc.)
    const allPill = page.locator('button:has-text("ALL")').first();
    await expect(allPill).toBeVisible();

    // Verify search input
    const searchInput = page.locator('input[placeholder*="Search Order #"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('ORD-1001');
    await expect(searchInput).toHaveValue('ORD-1001');
  });

  test('should render Customers Studio with search and customer tabs', async ({ page }) => {
    await page.goto('/customers');

    // Verify page header
    const heading = page.locator('h1, h2').filter({ hasText: /Customer/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Verify search input is present
    const searchInput = page.locator('input[placeholder*="Search by customer name"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Alex');
    await expect(searchInput).toHaveValue('Alex');
  });
});

