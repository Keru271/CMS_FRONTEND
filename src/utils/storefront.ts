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
  let baseUrl = (process.env.NEXT_PUBLIC_STOREFRONT_URL || '').trim();

  // Guard against any hardcoded obsolete static demo deployments
  if (baseUrl.includes('serene-croissant-868f08.netlify.app')) {
    baseUrl = '';
  }

  // If in browser on a production/custom domain and no storefront URL was explicitly provided
  if (!baseUrl && typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      baseUrl = window.location.origin;
    }
  }

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
