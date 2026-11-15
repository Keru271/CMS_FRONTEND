import { Page, expect } from '@playwright/test';

export const TEST_ADMIN_CREDENTIALS = {
  email: 'admin@cms.com',
  password: 'Admin123!@#',
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Perform login through the actual browser UI form
 */
export async function loginViaUI(
  page: Page,
  email = TEST_ADMIN_CREDENTIALS.email,
  password = TEST_ADMIN_CREDENTIALS.password,
) {
  await page.goto('/login');

  // Ensure login form is rendered
  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await expect(emailInput).toBeVisible({ timeout: 15000 });
  await expect(passwordInput).toBeVisible();

  // Fill in credentials
  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Submit form
  await submitButton.click();

  // Wait for redirect to dashboard or onboarding
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
}

/**
 * Fast session bootstrap using direct backend authentication.
 * Seeds localStorage before navigating to any protected route.
 */
export async function setupAuthenticatedSession(
  page: Page,
  credentials = TEST_ADMIN_CREDENTIALS,
) {
  // Request token from Fastify backend
  const res = await page.request.post(`${API_BASE_URL}/users/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  const body = await res.json();
  const token = body.accessToken;

  // Retrieve user profile to find their active store
  let activeStoreId: string | null = null;
  let storeName = 'OmniStore Demo';
  let currency = 'USD';

  if (token) {
    const profileRes = await page.request.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (profileRes.ok()) {
      const profile = await profileRes.json();
      if (profile.stores && profile.stores.length > 0) {
        activeStoreId = profile.stores[0].id;
        storeName = profile.stores[0].name;
        currency = profile.stores[0].currency || 'USD';
      }
    }
  }

  // Pre-seed localStorage before page loads
  await page.addInitScript(
    ({ authToken, storeId, name, curr }) => {
      if (authToken) {
        localStorage.setItem('auth_token', authToken);
      }
      if (storeId) {
        localStorage.setItem('active_store_id', storeId);
      }
      localStorage.setItem(
        'wendr_cms_cookie_consent',
        JSON.stringify({
          necessary: true,
          analytics: true,
          functional: true,
          timestamp: new Date().toISOString(),
        }),
      );
      localStorage.setItem(
        'merchant_session',
        JSON.stringify({
          merchant: {
            email: 'admin@cms.com',
            firstName: 'Master',
            lastName: 'Admin',
            role: 'ADMIN',
            permissions: {
              canManageProducts: true,
              canManageInventory: true,
              canManageOrders: true,
              canManageCustomers: true,
              canManageThemes: true,
              canManageSettings: true,
              canManagePayments: true,
              canManageLogistics: true,
              canManageAnalytics: true,
            },
          },
          store: storeId
            ? {
                id: storeId,
                storeName: name,
                currency: curr,
                status: 'ACTIVE',
              }
            : null,
        }),
      );
    },
    { authToken: token, storeId: activeStoreId, name: storeName, curr: currency },
  );

  return { token, activeStoreId };
}

