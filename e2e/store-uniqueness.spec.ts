import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, API_BASE_URL, TEST_ADMIN_CREDENTIALS } from './helpers/auth.helper';

test.describe('End-to-End: Store Name Uniqueness Enforcement', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Acquire admin token for API assertions
    const res = await request.post(`${API_BASE_URL}/users/login`, {
      data: {
        email: TEST_ADMIN_CREDENTIALS.email,
        password: TEST_ADMIN_CREDENTIALS.password,
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    authToken = data.accessToken;
  });

  test('backend rejects creating a store with an identical existing name (HTTP 400)', async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/stores`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: 'OmniStore Demo',
        slug: `omnistore-demo-unique-${Date.now()}`,
        currency: 'INR',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Store name is already taken. Please choose another one.');
  });

  test('backend rejects creating a store with a case-insensitive duplicate name (HTTP 400)', async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/stores`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: '  omnistore demo  ',
        slug: `omnistore-demo-ci-${Date.now()}`,
        currency: 'INR',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Store name is already taken. Please choose another one.');
  });

  test('backend rejects updating store setup to another existing store name (HTTP 400)', async ({ request }) => {
    // Fetch all stores to pick two distinct stores
    const storesRes = await request.get(`${API_BASE_URL}/stores`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(storesRes.ok()).toBeTruthy();
    const stores = await storesRes.json();
    expect(stores.length).toBeGreaterThanOrEqual(2);

    const targetStore = stores.find((s: any) => s.name === 'OmniStore Demo') || stores[0];
    const otherStore = stores.find((s: any) => s.id !== targetStore.id);
    expect(otherStore).toBeDefined();

    // Try to rename otherStore to targetStore's name
    const updateRes = await request.put(`${API_BASE_URL}/stores/setup`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'x-store-id': otherStore.id,
      },
      data: {
        name: targetStore.name,
      },
    });

    expect(updateRes.status()).toBe(400);
    const body = await updateRes.json();
    expect(body.message).toBe('Store name is already taken. Please choose another one.');
  });

  test('backend permits updating store setup with the store\'s current name without conflict', async ({ request }) => {
    const storesRes = await request.get(`${API_BASE_URL}/stores`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const stores = await storesRes.json();
    const store = stores[0];

    // Keeping its own name during setup save should succeed
    const updateRes = await request.put(`${API_BASE_URL}/stores/setup`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'x-store-id': store.id,
      },
      data: {
        name: store.name,
        contactEmail: 'admin@cms.com',
      },
    });

    expect(updateRes.ok()).toBeTruthy();
  });

  test('UI Create Store modal displays validation error when submitting duplicate store name', async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/dashboard');

    // Click the active store trigger in header
    const storeMenuTrigger = page.locator('header button').filter({ hasText: /Store|OmniStore/i }).first();
    await expect(storeMenuTrigger).toBeVisible({ timeout: 15000 });
    await storeMenuTrigger.click();

    // Click "New" button in dropdown to open Create Store modal
    const newStoreBtn = page.locator('button:has-text("New"), button:has-text("+")').first();
    await expect(newStoreBtn).toBeVisible({ timeout: 5000 });
    await newStoreBtn.click();

    // Verify modal is open
    const modalHeading = page.locator('h3:has-text("Add New Store to Portfolio")');
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    // Fill in duplicate store name and unique slug
    const nameInput = page.getByPlaceholder(/Aura Artisan/i);
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('OmniStore Demo');

    // Custom slug to ensure conflict is specifically on name
    const slugInput = page.getByPlaceholder('aura-artisan');
    await expect(slugInput).toBeVisible({ timeout: 5000 });
    await slugInput.fill(`omnistore-custom-${Date.now()}`);

    // Submit form
    const createBtn = page.getByRole('button', { name: /Launch & Switch to Store/i });
    await createBtn.click();

    // Assert that the exact duplicate store name error message is displayed
    const errorBanner = page.locator('text=Store name is already taken. Please choose another one.');
    await expect(errorBanner).toBeVisible({ timeout: 10000 });
  });
});
