/**
 * OmniStore Multi-Tenant Storefront URL Resolver
 *
 * Resolves the storefront URL for any store according to the following precedence:
 * 1. Store's configured custom domain (e.g. "nova-horizon-goods.onlinestore.io" or "aurafit.miordr.store")
 * 2. Next.js environment storefront base URL (process.env.NEXT_PUBLIC_STOREFRONT_URL), excluding obsolete static demo URLs
 * 3. In browser environments: current window origin when deployed on a public host
 * 4. Local development fallback: "http://localhost:3001"
 *
 * Automatically attaches store identification query parameters (`storeSlug`, `storeId`) when using a multi-tenant base URL,
 * so Edge middleware in storefront-frontend immediately recognizes the tenant and persists session cookies.
 */

export interface StorefrontTarget {
  slug?: string | null;
  customDomain?: string | null;
  id?: string | null;
  name?: string | null;
}

/**
 * Retrieves user-configured storefront URL stored in localStorage (if any)
 */
export function getStoredStorefrontUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('omnistore_custom_storefront_url') || '';
  } catch {
    return '';
  }
}

/**
 * Persists a user-configured storefront URL in localStorage and dispatches a change event
 */
export function setStoredStorefrontUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem('omnistore_custom_storefront_url');
    } else {
      let clean = url.trim();
      if (!/^https?:\/\//i.test(clean)) {
        clean = `http://${clean}`;
      }
      localStorage.setItem('omnistore_custom_storefront_url', clean);
    }
    window.dispatchEvent(new Event('storefront-url-changed'));
  } catch {}
}

export function getStorefrontUrl(
  store?: StorefrontTarget | null,
  path: string = '',
  queryParams?: Record<string, string | number | boolean | undefined | null>,
): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  // 1. Prioritize verified/configured custom domain if available on the store
  const rawCustomDomain = store?.customDomain?.trim();
  if (rawCustomDomain) {
    const cleanDomain = rawCustomDomain
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');

    let url = `https://${cleanDomain}${cleanPath}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const search = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          search.set(k, String(v));
        }
      });
      const qs = search.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    return url;
  }

  // 2. Base storefront URL resolution
  let baseUrl = '';

  // 2.1 Check user-configured storefront URL stored in localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('omnistore_custom_storefront_url');
      if (stored && stored.trim()) {
        baseUrl = stored.trim();
      }
    } catch {}
  }

  // 2.2 Next.js environment storefront base URL (excluding obsolete static demo URLs)
  if (!baseUrl) {
    baseUrl = (process.env.NEXT_PUBLIC_STOREFRONT_URL || '').trim();
    if (baseUrl.includes('serene-croissant-868f08.netlify.app')) {
      baseUrl = '';
    }
  }

  // 2.3 Browser public host resolution (GUARD against setting baseUrl to CMS origin!)
  if (!baseUrl && typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    const isCmsHost =
      host.startsWith('cms-') ||
      host.startsWith('cms.') ||
      host.includes('-cms.') ||
      host.includes('.cms.') ||
      host.includes('admin');

    // Only adopt window.location.origin if it is NOT the CMS dashboard domain itself
    if (!isCmsHost && host !== 'localhost' && host !== '127.0.0.1') {
      baseUrl = window.location.origin;
    }
  }

  // 2.4 Default development fallback (port 3001 for storefront-frontend)
  if (!baseUrl) {
    baseUrl = 'http://localhost:3001';
  }

  baseUrl = baseUrl.replace(/\/+$/, '');
  let fullUrl = `${baseUrl}${cleanPath}`;

  // Multi-tenant store parameter propagation
  const search = new URLSearchParams();
  if (store?.slug) {
    search.set('storeSlug', store.slug);
  }
  if (store?.id) {
    search.set('storeId', store.id);
  }
  if (queryParams) {
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        search.set(k, String(v));
      }
    });
  }

  const queryString = search.toString();
  if (queryString) {
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
  }

  return fullUrl;
}

/**
 * Returns a user-friendly display string for the store URL (e.g. without protocol)
 */
export function formatStorefrontDisplay(url: string): string {
  return url.replace(/^https?:\/\//i, '');
}
