import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers/auth.helper';

test.describe('End-to-End: AI Website Generator (Stitch Style Studio & Website Builder Options)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should load the Stitch-style AI website generator studio on /ai-builder', async ({ page }) => {
    await page.goto('/ai-builder');

    // Verify Project Title or Storefront Title is displayed in header
    const projectTitle = page.locator('header h1, header').filter({ hasText: /Storefront/ });
    await expect(projectTitle.first()).toBeVisible({ timeout: 15000 });

    // Verify Typography badge "Aa"
    const typoBadge = page.locator('header').filter({ hasText: 'Aa' });
    await expect(typoBadge.first()).toBeVisible();

    // Verify Global Viewport Switchers in Header
    await expect(page.locator('header button:has-text("Desktop")').first()).toBeVisible();
    await expect(page.locator('header button:has-text("Tablet")').first()).toBeVisible();
    await expect(page.locator('header button:has-text("Mobile")').first()).toBeVisible();

    // Verify Header Action Buttons
    const publishBtn = page.locator('header button:has-text("Publish Store")');
    await expect(publishBtn).toBeVisible();

    const exportBtn = page.locator('header button:has-text("Export")');
    await expect(exportBtn).toBeVisible();

    const shareBtn = page.locator('header button:has-text("Share")');
    await expect(shareBtn).toBeVisible();

    // Verify initial zoom scale is 100% in draggable area
    const zoomIndicator = page.locator('button:has-text("100%")');
    await expect(zoomIndicator.first()).toBeVisible();

    // Verify draggable surface has 100% scale (scale(1))
    const surface = page.locator('#canvas-surface-area');
    await expect(surface).toHaveAttribute('style', /scale\(1\)/);
  });

  test('should render multi-page website artboards horizontally on infinite dot canvas', async ({ page }) => {
    await page.goto('/ai-builder');

    // Verify core eCommerce website page artboards matching the chosen template flow
    await expect(page.locator('text=1. Home Storefront').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=2. Products Catalog').first()).toBeVisible();
    await expect(page.locator('text=3. Product Details (PDP)').first()).toBeVisible();
    await expect(page.locator('text=4. Cart & Express Checkout').first()).toBeVisible();
    await expect(page.locator('text=5. Brand Story & Atelier').first()).toBeVisible();
    await expect(page.locator('text=6. Customer Reviews & Social Proof').first()).toBeVisible();
    await expect(page.locator('text=7. Interactive 3D / Lookbook').first()).toBeVisible();
    await expect(page.locator('text=8. Order Confirmed & Live Tracking').first()).toBeVisible();
  });

  test('should display floating AI Vision Copilot panel with DOUGH TIME prompt & website suggestion chips', async ({ page }) => {
    await page.goto('/ai-builder');

    // Verify Active Prompt Bubble from screenshot
    const promptBubble = page.locator('text=Apply DOUGH TIME style to the 8 Aurafit screens');
    await expect(promptBubble.first()).toBeVisible({ timeout: 15000 });

    // Verify Pages counter (8 Pages created)
    const screensCounter = page.locator('text=8 Pages created');
    await expect(screensCounter.first()).toBeVisible();

    // Verify suggestion pills
    const shadowSuggestion = page.locator('text=Adjust the claymorphism shadow intensity or softness');
    await expect(shadowSuggestion.first()).toBeVisible();

    const desktopSuggestion = page.locator('text=Switch all pages to Desktop 1440px website layout');
    await expect(desktopSuggestion.first()).toBeVisible();

    // Verify prompt input placeholder
    const inputPlaceholder = page.locator('input[placeholder="What would you like to change or create?"]');
    await expect(inputPlaceholder).toBeVisible();

    // Verify Balanced mode selector
    const balancedMode = page.locator('button:has-text("Balanced")');
    await expect(balancedMode.first()).toBeVisible();
  });

  test('should toggle between Desktop 1440px website view and Mobile view', async ({ page }) => {
    await page.goto('/ai-builder');

    // Click Desktop button in top header
    const desktopBtn = page.locator('header button:has-text("Desktop (1440px)")');
    await expect(desktopBtn).toBeVisible({ timeout: 15000 });
    await desktopBtn.click();

    // Verify browser chrome address bar appears on canvas with 1440 x 900 tag
    await expect(page.locator('text=1440 × 900').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=storefront.com').first()).toBeVisible({ timeout: 5000 });

    // Switch back to Mobile
    const mobileBtn = page.locator('header button:has-text("Mobile (375px)")');
    await mobileBtn.click();
    await expect(page.locator('text=9:41').first()).toBeVisible({ timeout: 5000 });
  });

  test('should open Website Section Builder Inspector when clicking Sections button', async ({ page }) => {
    await page.goto('/ai-builder');

    // Click Sections button on first screen artboard
    const sectionsBtn = page.locator('button:has-text("Sections")').first();
    await expect(sectionsBtn).toBeVisible({ timeout: 15000 });
    await sectionsBtn.click();

    // Verify Section Inspector Drawer opens
    const drawerHeading = page.locator('text=Website Section Builder');
    await expect(drawerHeading).toBeVisible({ timeout: 5000 });

    // Verify Section Blocks list
    await expect(page.locator('text=High-Fashion Silhouettes').first()).toBeVisible();

    // Verify "Add Block" button
    const addBlockBtn = page.locator('button:has-text("Add Block")').first();
    await expect(addBlockBtn).toBeVisible();
    await addBlockBtn.click();

    // Verify Add Section Modal opens with templates
    await expect(page.locator('h2:has-text("Add Website Section Block")')).toBeVisible({ timeout: 5000 });
  });

  test('should open Publish Storefront modal and trigger live deployment', async ({ page }) => {
    await page.goto('/ai-builder');

    // Click Publish Store button in header
    const publishBtn = page.locator('header button:has-text("Publish Store")');
    await expect(publishBtn).toBeVisible({ timeout: 15000 });
    await publishBtn.click();

    // Verify Publish Modal appears
    await expect(page.locator('h2:has-text("Publish Website to Live Store")')).toBeVisible({ timeout: 5000 });

    // Click "Publish Storefront Now" button
    const deployBtn = page.locator('button:has-text("Publish Storefront Now")');
    await expect(deployBtn).toBeVisible();
    await deployBtn.click();

    // Verify Success state appears
    await expect(page.locator('text=Storefront is Published & Live!')).toBeVisible({ timeout: 8000 });
  });

  test('should open interactive Prototype Viewer modal when clicking Play button', async ({ page }) => {
    await page.goto('/ai-builder');

    // Click Play button in header
    const playBtn = page.locator('header button[title="Launch Interactive Prototype"]');
    await expect(playBtn).toBeVisible({ timeout: 15000 });
    await playBtn.click();

    // Verify Prototype Modal appears
    const protoViewer = page.locator('text=Live Storefront Prototype');
    await expect(protoViewer).toBeVisible({ timeout: 5000 });

    // Close prototype
    const closeBtn = page.locator('button[title="Close Prototype"]');
    await closeBtn.click();
    await expect(protoViewer).not.toBeVisible();
  });

  test('should open Export modal with Next.js code when clicking Export button', async ({ page }) => {
    await page.goto('/ai-builder');

    const exportBtn = page.locator('header button:has-text("Export")');
    await expect(exportBtn).toBeVisible({ timeout: 15000 });
    await exportBtn.click();

    // Verify Export modal title
    const exportHeading = page.locator('h3').filter({ hasText: /Export/ });
    await expect(exportHeading.first()).toBeVisible({ timeout: 5000 });

    // Verify download button
    const downloadBtn = page.locator('button:has-text("Download File")');
    await expect(downloadBtn).toBeVisible();
  });

  test('should allow switching storefront template from dropdown and update all artboards', async ({ page }) => {
    await page.goto('/ai-builder');

    // 1. Locate template selector dropdown button in header
    const templateDropdownBtn = page.locator('header button[title="Switch eCommerce Storefront Template"]');
    await expect(templateDropdownBtn).toBeVisible({ timeout: 15000 });

    // 2. Click to open template selector dropdown
    await templateDropdownBtn.click();

    // 3. Verify dropdown lists available templates
    await expect(page.locator('text=Storefront Template').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/\\d+ Available/').first()).toBeVisible();
    await expect(page.locator('button:has-text("Funo / Funie Studio")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Velvet Haute Couture")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Artisan Craft & Studio")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Northvale Technical Outdoor")').first()).toBeVisible();

    // 4. Click Velvet Haute Couture template
    await page.locator('button:has-text("Velvet Haute Couture")').first().click();

    // 5. Verify header reflects Velvet Haute Couture
    await expect(templateDropdownBtn).toContainText('Velvet Haute Couture', { timeout: 5000 });

    // 6. Verify canvas renders Velvet Haute Couture content
    await expect(page.locator('text=VELVET COUTURE').first()).toBeVisible({ timeout: 5000 });
  });

  test('should allow switching to Northvale Technical Outdoor template and render outdoor storefront', async ({ page }) => {
    await page.goto('/ai-builder');

    // 1. Locate template selector dropdown button in header
    const templateDropdownBtn = page.locator('header button[title="Switch eCommerce Storefront Template"]');
    await expect(templateDropdownBtn).toBeVisible({ timeout: 15000 });

    // 2. Click to open template selector dropdown
    await templateDropdownBtn.click();

    // 3. Verify Northvale Technical Outdoor is listed
    const northvaleOption = page.locator('button:has-text("Northvale Technical Outdoor")').first();
    await expect(northvaleOption).toBeVisible({ timeout: 5000 });
    await northvaleOption.click();

    // 4. Verify header button now shows Northvale Technical Outdoor
    await expect(templateDropdownBtn).toContainText('Northvale Technical Outdoor', { timeout: 5000 });

    // 5. Verify Screen 1 (Home) renders Northvale brand & headline
    await expect(page.locator('text=NORTHVALE').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Built for the quiet distance.').first()).toBeVisible();

    // 6. Verify Screen 3 (PDP) renders Trail Runner Lite
    await expect(page.locator('text=Trail Runner Lite').first()).toBeVisible();
    await expect(page.locator('text=Add to Bag - $199').first()).toBeVisible();

    // 7. Verify Screen 2 (Catalog) renders Field-tested essentials
    await expect(page.locator('text=Field-tested essentials, quietly organized.').first()).toBeVisible();
  });
});
