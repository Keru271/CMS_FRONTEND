import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers/auth.helper';

test.describe('End-to-End: Dashboard & Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should load the dashboard with store overview and header', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify main navigation sidebar exists
    const sidebar = page.locator('aside');
    await expect(sidebar.first()).toBeVisible({ timeout: 15000 });

    // Verify admin header exists with store name and search
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify spotlight search button is rendered
    const searchBtn = page.locator('button[title*="Search"]');
    await expect(searchBtn.first()).toBeVisible();
  });

  test('should navigate to Products page from sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on Products in the sidebar
    const productsNav = page.locator('button:has-text("Products"), a[href="/products"]');
    await productsNav.first().click();

    await page.waitForURL('**/products', { timeout: 15000 });
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Product/i }).first()).toBeVisible();
  });

  test('should navigate to Orders page from sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    const ordersNav = page.locator('button:has-text("Orders"), a[href="/orders"]');
    await ordersNav.first().click();

    await page.waitForURL('**/orders', { timeout: 15000 });
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Order/i }).first()).toBeVisible();
  });

  test('should navigate to Customers page from sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    const customersNav = page.locator('button:has-text("Customers"), a[href="/customers"]');
    await customersNav.first().click();

    await page.waitForURL('**/customers', { timeout: 15000 });
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Customer/i }).first()).toBeVisible();
  });

  test('should expand Store Management and navigate to Apps & Integrations', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on Store Management section header to expand the accordion if collapsed
    const managementHeader = page.locator('button:has-text("Store Management")');
    if (await managementHeader.isVisible()) {
      await managementHeader.click();
    }

    const appsNav = page.locator('button:has-text("Apps & Integrations"), a[href="/apps"]');
    await expect(appsNav.first()).toBeVisible({ timeout: 10000 });
    await appsNav.first().click();

    await page.waitForURL('**/apps', { timeout: 15000 });
    await expect(page.locator('h1, h2').filter({ hasText: /Apps & Integrations/i }).first()).toBeVisible();
  });

  test('should open Spotlight search modal and close with Escape', async ({ page }) => {
    await page.goto('/dashboard');

    // Trigger search
    const searchTrigger = page.locator('button[title*="Search"]').first();
    await searchTrigger.click();

    // Verify Spotlight search modal appears
    const modalInput = page.locator('input[placeholder*="Search studios, products"]');
    await expect(modalInput).toBeVisible({ timeout: 5000 });

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(modalInput).not.toBeVisible({ timeout: 5000 });
  });
});

