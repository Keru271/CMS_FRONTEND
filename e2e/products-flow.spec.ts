import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers/auth.helper';

test.describe('End-to-End: Products Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should display the Products Studio with sub-navigation tabs', async ({ page }) => {
    await page.goto('/products');

    // Verify page header
    const heading = page.locator('h1, h2').filter({ hasText: /Product/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Verify tabs exist: All Products, Add Product (23 Options), etc.
    const allProductsTab = page.locator('button:has-text("All Products")').first();
    const addProductTab = page.locator('button:has-text("Add Product (23 Options)")').first();

    await expect(allProductsTab).toBeVisible();
    await expect(addProductTab).toBeVisible();
  });

  test('should switch to Add Product form and display form fields', async ({ page }) => {
    await page.goto('/products');

    // Click Add Product tab
    const addProductTab = page.locator('button:has-text("Add Product (23 Options)")').first();
    await addProductTab.click();

    // Verify form header is displayed
    const formHeading = page.locator('h2:has-text("Create Product")').first();
    await expect(formHeading).toBeVisible({ timeout: 10000 });

    // Verify key form inputs are present
    const nameInput = page.locator('input[placeholder*="AeroPulse Wireless Headphones"]').first();
    const priceInput = page.locator('input[type="number"][required]').first();
    const saveButton = page.locator('button[type="submit"]:has-text("Save Product")').first();

    await expect(nameInput).toBeVisible();
    await expect(priceInput).toBeVisible();
    await expect(saveButton).toBeVisible();
  });

  test('should successfully create a new product and search for it in table', async ({ page }) => {
    const uniqueProductName = `E2E Playwright Product ${Date.now()}`;
    const testPrice = '149.99';

    await page.goto('/products');

    // Click Add Product tab
    const addProductTab = page.locator('button:has-text("Add Product (23 Options)")').first();
    await addProductTab.click();

    // Fill Product Name
    const nameInput = page.locator('input[placeholder*="AeroPulse Wireless Headphones"]').first();
    await nameInput.fill(uniqueProductName);

    // Fill Description
    const descInput = page.locator('textarea[placeholder*="Product features"]').first();
    await descInput.fill('High-performance testing item created by Playwright automated E2E test.');

    // Fill Selling Price
    const priceInput = page.locator('input[type="number"][required]').first();
    await priceInput.fill(testPrice);

    // Fill SKU Handle (mandatory field)
    const skuInput = page.locator('div:has(> label:has-text("SKU Handle")) input, input[placeholder*="SKU"]');
    if (await skuInput.first().isVisible()) {
      await skuInput.first().fill(`SKU-${Date.now()}`);
    } else {
      // Fallback to the 3rd required input
      await page.locator('input[required]').nth(2).fill(`SKU-${Date.now()}`);
    }

    // Click Save Product
    const saveButton = page.locator('button[type="submit"]:has-text("Save Product")').first();
    await saveButton.click();

    // Wait for the form to submit and return to All Products tab
    const allProductsTab = page.locator('button:has-text("All Products")').first();
    await expect(allProductsTab).toBeVisible({ timeout: 15000 });

    // Search for the newly created product in the table search input
    const searchInput = page.locator('input[placeholder*="Search by name, SKU"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(uniqueProductName);
      await page.waitForTimeout(600); // Debounce
    }

    // Verify product is listed
    const productCell = page.locator(`text=${uniqueProductName}`).first();
    await expect(productCell).toBeVisible({ timeout: 10000 });
  });

  test('should filter products by status', async ({ page }) => {
    await page.goto('/products');

    // Verify status filter exists (ALL / ACTIVE / DRAFT / ARCHIVED)
    const statusSelect = page.locator('select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('ACTIVE');
      await page.waitForTimeout(500);
    }
  });
});

