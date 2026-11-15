import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers/auth.helper';

test.describe('End-to-End: Apps & Integrations Marketplace Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should render the Apps Marketplace studio with tabs and search', async ({ page }) => {
    await page.goto('/apps');

    // Verify main header
    const heading = page.locator('h1, h2').filter({ hasText: /Apps & Integrations/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Verify tabs: Explore Apps / Marketplace, Installed Apps, Dispatch Logs
    const exploreTab = page.locator('button:has-text("Explore Apps"), button:has-text("Marketplace")').first();
    await expect(exploreTab).toBeVisible();

    // Verify search bar
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('should filter apps by category pills', async ({ page }) => {
    await page.goto('/apps');

    // Click on Email category pill
    const emailPill = page.locator('button:has-text("Email")').first();
    if (await emailPill.isVisible()) {
      await emailPill.click();

      // Verify Mailgun or Mailbox card is displayed
      const mailgunCard = page.locator('text=Mailgun').first();
      await expect(mailgunCard).toBeVisible({ timeout: 10000 });
    }

    // Click on WhatsApp category pill
    const whatsappPill = page.locator('button:has-text("WhatsApp")').first();
    if (await whatsappPill.isVisible()) {
      await whatsappPill.click();

      // Verify Wati card is displayed
      const watiCard = page.locator('text=Wati').first();
      await expect(watiCard).toBeVisible({ timeout: 10000 });
    }
  });

  test('should open configuration modal for an app and close it', async ({ page }) => {
    await page.goto('/apps');

    // Click Configure or Install App on one of the visible apps (e.g. Razorpay or Mailgun)
    const actionBtn = page.locator('button:has-text("Configure"), button:has-text("Install App")').first();
    await expect(actionBtn).toBeVisible({ timeout: 15000 });
    await actionBtn.click();

    // Modal dialog should be visible with credentials section
    const credentialsTitle = page.locator('text=Provider Credentials');
    await expect(credentialsTitle).toBeVisible({ timeout: 15000 });

    // Verify "Test Connection" button is present
    const testConnectionBtn = page.locator('button:has-text("Test Connection")');
    await expect(testConnectionBtn).toBeVisible();

    // Close the modal
    const closeBtn = page.locator('button:has(.lucide-x)').first();
    await closeBtn.click();
    await expect(credentialsTitle).not.toBeVisible({ timeout: 5000 });
  });
});

