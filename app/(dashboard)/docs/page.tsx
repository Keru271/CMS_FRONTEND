'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Code2, Key, Globe, Package, Layers, Search, ShoppingCart, Zap, User, CreditCard,
  ChevronRight, Copy, Check, Terminal, BookOpen, Shield, ArrowRight,
  CheckCircle2, AlertCircle, ExternalLink, Hash, Menu, X, Webhook,
  Lock, GitBranch, Activity,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Param {
  name: string;
  type: string;
  required?: boolean;
  desc: string;
}

interface ResponseField {
  field: string;
  type: string;
  desc: string;
}

interface EndpointDoc {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  title: string;
  desc: string;
  auth?: 'storefront_key' | 'customer_token' | 'both';
  queryParams?: Param[];
  bodyParams?: Param[];
  pathParams?: Param[];
  successExample: object;
  errorExample?: object;
  responseFields?: ResponseField[];
  curlExample?: string;
  jsExample?: string;
}

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  endpoints: EndpointDoc[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_API_URL || 'http://localhost:5002';

const METHOD_STYLES: Record<string, string> = {
  GET:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  POST:   'bg-blue-100 text-blue-700 border border-blue-200',
  PATCH:  'bg-amber-100 text-amber-700 border border-amber-200',
  DELETE: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const SECTIONS: Section[] = [
  {
    id: 'store',
    label: 'Store',
    icon: Globe,
    color: 'text-blue-600',
    endpoints: [
      {
        id: 'get-store',
        method: 'GET',
        path: '/api/v1/store',
        title: 'Get Store Info',
        desc: 'Returns public-facing store metadata including name, currency, logo, social links, theme, and SEO settings. Safe to expose in any public storefront.',
        auth: 'storefront_key',
        successExample: {
          data: {
            id: 'store_abc123',
            name: 'My Fashion Store',
            slug: 'my-fashion-store',
            logo: 'https://cdn.example.com/logo.png',
            description: 'Premium fashion for everyone.',
            currency: 'INR',
            language: 'en',
            country: 'IN',
            contact: { email: 'hello@store.com', phone: '+91 98765 43210' },
            theme: { activeTemplate: 'nova', primaryColor: '#6366f1', secondaryColor: '#8b5cf6', accentColor: '#a78bfa' },
            social_links: { facebook: 'https://facebook.com/store', instagram: 'https://instagram.com/store' },
            seo: { title: 'My Fashion Store', description: 'Shop the latest trends.', ogImage: 'https://cdn.example.com/og.jpg' },
            announcement: 'Free shipping on orders above ₹999!',
          },
        },
        responseFields: [
          { field: 'data.id', type: 'string', desc: 'Unique store identifier' },
          { field: 'data.name', type: 'string', desc: 'Store display name' },
          { field: 'data.currency', type: 'string', desc: 'ISO 4217 currency code (e.g. INR, USD)' },
          { field: 'data.theme', type: 'object', desc: 'Active template slug and brand colors' },
          { field: 'data.social_links', type: 'object', desc: 'Social media profile URLs' },
          { field: 'data.announcement', type: 'string | null', desc: 'Header announcement banner text' },
        ],
        curlExample: `curl "${BASE_URL}/api/v1/store" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/store', {
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY' }
});
const { data } = await res.json();
console.log(data.name, data.currency);`,
      },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    color: 'text-emerald-600',
    endpoints: [
      {
        id: 'list-products',
        method: 'GET',
        path: '/api/v1/products',
        title: 'List Products',
        desc: 'Returns a paginated list of active products. Supports full-text search, filtering by category/collection/brand/price, availability filtering, and multiple sort orders.',
        auth: 'storefront_key',
        queryParams: [
          { name: 'search / q', type: 'string', desc: 'Full-text search across name, description, brand, SKU, tags' },
          { name: 'category', type: 'string', desc: 'Filter by category name (case-insensitive contains)' },
          { name: 'collection', type: 'string', desc: 'Filter by collection name' },
          { name: 'brand', type: 'string', desc: 'Filter by brand name' },
          { name: 'minPrice', type: 'number', desc: 'Minimum price filter (inclusive)' },
          { name: 'maxPrice', type: 'number', desc: 'Maximum price filter (inclusive)' },
          { name: 'availability', type: '"in_stock" | "out_of_stock"', desc: 'Filter by stock availability' },
          { name: 'sort', type: '"newest" | "price_asc" | "price_desc" | "name"', desc: 'Sort order. Default: newest' },
          { name: 'page', type: 'number', desc: 'Page number (1-indexed). Default: 1' },
          { name: 'limit', type: 'number', desc: 'Results per page (max 100). Default: 20' },
        ],
        successExample: {
          data: [
            { id: 'prod_abc', name: 'AeroPulse Headphones', slug: 'aeropulse-headphones', price: 2499, compare_at_price: 3499, image: 'https://cdn.example.com/prod1.jpg', inventory: 50, available: true, brand: 'AeroBrand', category: 'Electronics', collection: 'Best Sellers' },
          ],
          pagination: { page: 1, limit: 20, total: 142, total_pages: 8, has_next: true, has_prev: false },
        },
        responseFields: [
          { field: 'data', type: 'Product[]', desc: 'Array of product objects' },
          { field: 'data[].id', type: 'string', desc: 'Unique product identifier' },
          { field: 'data[].price', type: 'number', desc: 'Current selling price' },
          { field: 'data[].compare_at_price', type: 'number | null', desc: 'Original price for strikethrough display' },
          { field: 'data[].available', type: 'boolean', desc: 'True if inventory > 0' },
          { field: 'data[].variants', type: 'Variant[]', desc: 'Product variant options (color, size, etc.)' },
          { field: 'pagination.total', type: 'number', desc: 'Total number of matching products' },
          { field: 'pagination.has_next', type: 'boolean', desc: 'Whether there are more pages' },
        ],
        curlExample: `curl "${BASE_URL}/api/v1/products?collection=shirts&sort=price_asc&limit=12" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
        jsExample: `const res = await fetch(
  '${BASE_URL}/api/v1/products?search=headphones&availability=in_stock&limit=10',
  { headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY' } }
);
const { data, pagination } = await res.json();
console.log(\`Found \${pagination.total} products\`);`,
      },
      {
        id: 'get-product',
        method: 'GET',
        path: '/api/v1/products/:id',
        title: 'Get Product',
        desc: 'Returns a single product by its ID or URL slug. Includes full variant list, images array, and tax information.',
        auth: 'storefront_key',
        pathParams: [
          { name: 'id', type: 'string', required: true, desc: 'Product ID or urlSlug (both accepted)' },
        ],
        successExample: {
          data: {
            id: 'prod_abc', name: 'AeroPulse Headphones', slug: 'aeropulse-headphones',
            price: 2499, compare_at_price: 3499, sku: 'APH-001',
            image: 'https://cdn.example.com/prod1.jpg',
            images: ['https://cdn.example.com/p1.jpg', 'https://cdn.example.com/p2.jpg'],
            inventory: 50, available: true, brand: 'AeroBrand', category: 'Electronics',
            tags: ['wireless', 'premium', 'noise-cancelling'],
            variants: [{ id: 'var_1', name: 'Black', price: 2499, inventory: 30 }, { id: 'var_2', name: 'White', price: 2499, inventory: 20 }],
            tax: { taxable: true, rate: 18 },
            created_at: '2026-01-15T10:30:00Z',
          },
        },
        errorExample: { error: 'Not Found', message: 'Product "aeropulse-headphones" not found.' },
        curlExample: `# Lookup by ID or slug
curl "${BASE_URL}/api/v1/products/aeropulse-headphones" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
      },
    ],
  },
  {
    id: 'collections',
    label: 'Collections',
    icon: Layers,
    color: 'text-violet-600',
    endpoints: [
      {
        id: 'list-collections',
        method: 'GET',
        path: '/api/v1/collections',
        title: 'List Collections',
        desc: 'Returns all store collections. Use to build navigation menus, collection grids, or category pages.',
        auth: 'storefront_key',
        successExample: {
          data: [
            { id: 'col_001', name: 'Summer Collection', slug: 'summer-collection', description: 'Light and breezy.', image: 'https://cdn.example.com/col1.jpg', created_at: '2026-01-01T00:00:00Z' },
          ],
          total: 12,
        },
      },
      {
        id: 'get-collection',
        method: 'GET',
        path: '/api/v1/collections/:id',
        title: 'Get Collection',
        desc: 'Returns a single collection by its ID or slug.',
        auth: 'storefront_key',
        pathParams: [{ name: 'id', type: 'string', required: true, desc: 'Collection ID or slug' }],
        successExample: { data: { id: 'col_001', name: 'Summer Collection', slug: 'summer-collection', image: 'https://cdn.example.com/col1.jpg' } },
        errorExample: { error: 'Not Found', message: 'Collection "summer-collection" not found.' },
      },
      {
        id: 'collection-products',
        method: 'GET',
        path: '/api/v1/collections/:id/products',
        title: 'Collection Products',
        desc: 'Returns all products belonging to a specific collection. Supports sorting and pagination.',
        auth: 'storefront_key',
        pathParams: [{ name: 'id', type: 'string', required: true, desc: 'Collection ID or slug' }],
        queryParams: [
          { name: 'sort', type: '"newest" | "price_asc" | "price_desc" | "name"', desc: 'Sort order' },
          { name: 'page', type: 'number', desc: 'Page number. Default: 1' },
          { name: 'limit', type: 'number', desc: 'Results per page (max 100). Default: 20' },
        ],
        successExample: {
          collection: { id: 'col_001', name: 'Summer Collection', slug: 'summer-collection' },
          data: [{ id: 'prod_abc', name: 'Linen Shirt', price: 1299, available: true }],
          pagination: { page: 1, limit: 20, total: 24, total_pages: 2, has_next: true, has_prev: false },
        },
        curlExample: `curl "${BASE_URL}/api/v1/collections/summer-collection/products?sort=price_asc&limit=12" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
      },
    ],
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    color: 'text-sky-600',
    endpoints: [
      {
        id: 'search',
        method: 'GET',
        path: '/api/v1/search',
        title: 'Search',
        desc: 'Full-text search across products, collections, and categories simultaneously. Returns grouped results perfect for search dropdowns and instant search UIs.',
        auth: 'storefront_key',
        queryParams: [
          { name: 'q / search', type: 'string', required: true, desc: 'Search query string' },
          { name: 'limit', type: 'number', desc: 'Max product results (max 50). Default: 10' },
          { name: 'page', type: 'number', desc: 'Page number for product results. Default: 1' },
        ],
        successExample: {
          query: 'wireless headphones',
          products: [{ id: 'prod_abc', name: 'AeroPulse Headphones', slug: 'aeropulse-headphones', price: 2499, image: 'https://cdn.example.com/p.jpg', available: true }],
          collections: [{ id: 'col_002', name: 'Audio Gear', slug: 'audio-gear' }],
          categories: [{ id: 'cat_001', name: 'Electronics', slug: 'electronics' }],
          total: 3,
        },
        curlExample: `curl "${BASE_URL}/api/v1/search?q=wireless+headphones&limit=5" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
        jsExample: `// Instant search with debounce
const search = async (query) => {
  const res = await fetch(
    \`${BASE_URL}/api/v1/search?q=\${encodeURIComponent(query)}&limit=5\`,
    { headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY' } }
  );
  const { products, collections, categories } = await res.json();
  return { products, collections, categories };
};`,
      },
    ],
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: ShoppingCart,
    color: 'text-orange-600',
    endpoints: [
      {
        id: 'create-cart',
        method: 'POST',
        path: '/api/v1/cart',
        title: 'Create Cart',
        desc: 'Creates a new empty cart session. Returns a cart_id (also called cartToken) that identifies this cart. Store this on the client side (localStorage or cookie).',
        auth: 'storefront_key',
        successExample: {
          data: { id: 'cart_internal_id', cart_id: 'cart_a1b2c3d4e5f6', items: [], item_count: 0, subtotal: 0, currency: 'INR', created_at: '2026-08-30T10:00:00Z', updated_at: '2026-08-30T10:00:00Z' },
        },
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/cart', {
  method: 'POST',
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY', 'Content-Type': 'application/json' }
});
const { data } = await res.json();
localStorage.setItem('cart_id', data.cart_id); // persist across sessions`,
      },
      {
        id: 'get-cart',
        method: 'GET',
        path: '/api/v1/cart/:id',
        title: 'Get Cart',
        desc: 'Returns the current cart state with real-time stock validation. Out-of-stock items are flagged with isOutOfStock: true.',
        auth: 'storefront_key',
        pathParams: [{ name: 'id', type: 'string', required: true, desc: 'Cart ID (cart_id from Create Cart response)' }],
        successExample: {
          data: {
            cart_id: 'cart_a1b2c3d4e5f6',
            items: [{ id: 'item_001', productId: 'prod_abc', name: 'AeroPulse Headphones', price: 2499, quantity: 1, image: 'https://cdn.example.com/p.jpg', totalPrice: 2499, isOutOfStock: false }],
            item_count: 1, subtotal: 2499, currency: 'INR',
          },
        },
        errorExample: { error: 'Not Found', message: 'Cart "cart_xyz" not found.' },
      },
      {
        id: 'add-cart-item',
        method: 'POST',
        path: '/api/v1/cart/:id/items',
        title: 'Add Item to Cart',
        desc: 'Adds a product (optionally with a specific variant) to the cart. If the item already exists, its quantity is incremented. Stock is validated before adding.',
        auth: 'storefront_key',
        pathParams: [{ name: 'id', type: 'string', required: true, desc: 'Cart ID' }],
        bodyParams: [
          { name: 'product_id', type: 'string', required: true, desc: 'Product ID to add' },
          { name: 'variant_id', type: 'string', desc: 'Variant ID (required if product has variants)' },
          { name: 'quantity', type: 'number', desc: 'Quantity to add. Default: 1' },
          { name: 'options', type: 'object', desc: 'Custom options key-value map (e.g. { "gift_wrap": "true" })' },
        ],
        successExample: {
          data: {
            cart_id: 'cart_a1b2c3d4e5f6',
            items: [{ id: 'item_001', productId: 'prod_abc', variantId: 'var_1', name: 'AeroPulse Headphones - Black', price: 2499, quantity: 2, totalPrice: 4998 }],
            item_count: 2, subtotal: 4998, currency: 'INR',
          },
        },
        errorExample: { error: 'Out of Stock', message: '"AeroPulse Headphones" is out of stock.' },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/cart/cart_a1b2c3d4e5f6/items" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"product_id":"prod_abc","variant_id":"var_1","quantity":2}'`,
        jsExample: `const res = await fetch(\`${BASE_URL}/api/v1/cart/\${cartId}/items\`, {
  method: 'POST',
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 'prod_abc',
    variant_id: 'var_1', // omit if no variants
    quantity: 2
  })
});
const { data } = await res.json();`,
      },
      {
        id: 'update-cart-item',
        method: 'PATCH',
        path: '/api/v1/cart/:id/items/:itemId',
        title: 'Update Cart Item',
        desc: 'Updates the quantity of an existing cart item. Set quantity to 0 to remove the item.',
        auth: 'storefront_key',
        pathParams: [
          { name: 'id', type: 'string', required: true, desc: 'Cart ID' },
          { name: 'itemId', type: 'string', required: true, desc: 'Item ID (from cart items array)' },
        ],
        bodyParams: [
          { name: 'quantity', type: 'number', required: true, desc: 'New quantity. Set to 0 to remove item.' },
        ],
        successExample: { data: { cart_id: 'cart_a1b2c3d4e5f6', items: [], item_count: 0, subtotal: 0 } },
        errorExample: { error: 'Not Found', message: 'Item "item_001" not found in cart.' },
      },
      {
        id: 'remove-cart-item',
        method: 'DELETE',
        path: '/api/v1/cart/:id/items/:itemId',
        title: 'Remove Cart Item',
        desc: 'Removes a specific item from the cart entirely.',
        auth: 'storefront_key',
        pathParams: [
          { name: 'id', type: 'string', required: true, desc: 'Cart ID' },
          { name: 'itemId', type: 'string', required: true, desc: 'Item ID to remove' },
        ],
        successExample: { data: { cart_id: 'cart_a1b2c3d4e5f6', items: [], item_count: 0, subtotal: 0 } },
      },
    ],
  },
  {
    id: 'checkout',
    label: 'Checkout',
    icon: Zap,
    color: 'text-rose-600',
    endpoints: [
      {
        id: 'create-checkout',
        method: 'POST',
        path: '/api/v1/checkout',
        title: 'Create Checkout Session',
        desc: 'Validates cart inventory, calculates final pricing (subtotal, shipping, tax, discounts, grand total), and returns payment gateway configurations. Merchant credentials are never exposed — only public keys/order IDs required for client-side SDK initialization.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'cart_id', type: 'string', required: true, desc: 'Cart ID from POST /api/v1/cart' },
          { name: 'customer.email', type: 'string', required: true, desc: 'Customer email address' },
          { name: 'customer.name', type: 'string', desc: 'Customer full name' },
          { name: 'customer.phone', type: 'string', desc: 'Customer phone number' },
          { name: 'shipping_address.city', type: 'string', required: true, desc: 'Shipping city' },
          { name: 'shipping_address.postal_code', type: 'string', required: true, desc: 'Postal / ZIP code' },
          { name: 'shipping_address.state', type: 'string', desc: 'State / Province' },
          { name: 'shipping_address.country', type: 'string', desc: 'Country name. Default: India' },
          { name: 'coupon_code', type: 'string', desc: 'Optional discount coupon code' },
          { name: 'shipping_method', type: 'string', desc: 'Shipping method ID' },
          { name: 'notes', type: 'string', desc: 'Order notes from customer' },
        ],
        successExample: {
          data: {
            checkout_id: 'chk_a1b2c3d4e5f6g7h8',
            cart_id: 'cart_a1b2c3d4e5f6',
            status: 'PENDING',
            customer: { email: 'user@example.com', name: 'Ananya Sharma', phone: '+91 98765 43210' },
            shipping_address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', postal_code: '600001' },
            pricing: { subtotal: 4998, shipping: 0, tax: 899.64, discount: 0, grand_total: 5897.64, currency: 'INR' },
            payment_gateways: {
              razorpay: { enabled: true, key_id: 'rzp_live_xxx', order_id: 'order_abc123', amount_paisa: 589764, currency: 'INR' },
              stripe: { enabled: true, publishable_key: 'pk_live_xxx', currency: 'inr', amount_cents: 589764 },
              cod: { enabled: true, label: 'Cash on Delivery', max_order_amount: 10000 },
            },
            items: [{ product_id: 'prod_abc', name: 'AeroPulse Headphones', quantity: 2, price: 2499, total: 4998 }],
            expires_at: '2026-08-30T10:30:00Z',
          },
        },
        errorExample: { error: 'Out of Stock', message: 'Only 1 unit(s) of "AeroPulse Headphones" are available.' },
        jsExample: `// 1. Create checkout session
const res = await fetch('${BASE_URL}/api/v1/checkout', {
  method: 'POST',
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cart_id: cartId,
    customer: { email: 'user@example.com', name: 'Ananya Sharma' },
    shipping_address: { city: 'Chennai', postal_code: '600001', state: 'Tamil Nadu' },
    coupon_code: 'SAVE10'
  })
});
const { data } = await res.json();

// 2a. Razorpay (India)
const rzp = new Razorpay({
  key: data.payment_gateways.razorpay.key_id,
  order_id: data.payment_gateways.razorpay.order_id,
  amount: data.payment_gateways.razorpay.amount_paisa,
  currency: 'INR',
  handler: (response) => console.log('Payment success', response)
});
rzp.open();

// 2b. Stripe (International)
const stripe = Stripe(data.payment_gateways.stripe.publishable_key);
// ... create PaymentIntent client-side`,
      },
      {
        id: 'get-checkout',
        method: 'GET',
        path: '/api/v1/checkout/:id',
        title: 'Get Checkout Status',
        desc: 'Returns the current status of a checkout session and next-steps guide for each supported payment gateway.',
        auth: 'storefront_key',
        pathParams: [{ name: 'id', type: 'string', required: true, desc: 'Checkout ID from POST /api/v1/checkout' }],
        successExample: {
          checkout_id: 'chk_a1b2c3d4e5f6g7h8',
          status: 'PENDING',
          message: 'Checkout sessions are ephemeral. Complete payment and listen for the checkout.completed webhook.',
          next_steps: { razorpay: 'Initialize Razorpay.js with key_id and order_id', stripe: 'Use publishable_key to create a PaymentIntent', cod: 'Submit order with payment_method: "cod"', webhook: 'Subscribe to checkout.completed via Developer → Webhooks' },
        },
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    color: 'text-purple-600',
    endpoints: [
      {
        id: 'get-payment-methods',
        method: 'GET',
        path: '/api/v1/payments/methods',
        title: 'Get Payment Methods',
        desc: 'Returns active payment gateways and public client configurations (Razorpay, Stripe, COD, Developer Simulator) configured for the store. Secret keys are never exposed.',
        auth: 'storefront_key',
        successExample: {
          data: {
            currency: 'INR',
            test_mode: false,
            gateways: {
              razorpay: { enabled: true, key_id: 'rzp_live_xxx', currencies: ['INR'], supported_instruments: ['UPI', 'CARDS', 'NETBANKING'] },
              stripe: { enabled: true, publishable_key: 'pk_live_xxx', currencies: ['USD', 'EUR', 'INR'], supported_instruments: ['CREDIT_CARD', 'APPLE_PAY'] },
              cod: { enabled: true, label: 'Cash on Delivery', max_order_amount: 10000, fee: 0 },
              developer_simulator: { enabled: true, label: 'Developer Sandbox Simulator', supported_scenarios: ['SUCCESS', 'INSUFFICIENT_FUNDS', 'CARD_DECLINED'] }
            }
          }
        },
        curlExample: `curl "${BASE_URL}/api/v1/payments/methods" \\\n  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/payments/methods', {
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY' }
});
const { data } = await res.json();
console.log('Available gateways:', Object.keys(data.gateways));`,
      },
      {
        id: 'process-payment',
        method: 'POST',
        path: '/api/v1/payments/process',
        title: 'Process Payment & Finalize Order',
        desc: 'Unified endpoint for completing payments and creating orders. Supports Razorpay verification, Stripe confirmation, Cash on Delivery, or Developer Sandbox simulation. Performs stock checks, database inventory decrement, transaction logging, and customer upsert.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'cart_id', type: 'string', required: true, desc: 'Shopping cart token containing items' },
          { name: 'payment_method', type: '"RAZORPAY" | "STRIPE" | "COD" | "DEVELOPER_SIMULATOR"', required: true, desc: 'Selected payment method' },
          { name: 'customer.email', type: 'string', required: true, desc: 'Customer email' },
          { name: 'customer.name', type: 'string', required: true, desc: 'Customer name' },
          { name: 'shipping_address.line1', type: 'string', required: true, desc: 'Street address' },
          { name: 'shipping_address.city', type: 'string', required: true, desc: 'City' },
          { name: 'shipping_address.postal_code', type: 'string', required: true, desc: 'Postal code' },
          { name: 'payment_details', type: 'object', desc: 'Gateway verification payload or simulation settings' },
        ],
        successExample: {
          success: true,
          message: 'Payment verified and order created successfully.',
          order: {
            id: 'ord_9a8b7c6d',
            order_number: 'ORD-82914-4921',
            status: 'CONFIRMED',
            payment_status: 'PAID',
            payment_method: 'RAZORPAY',
            transaction_id: 'pay_Q2W3E4R5T6',
            total_amount: 4998,
            currency: 'INR',
            created_at: '2026-08-30T13:20:00.000Z'
          },
          customer: { name: 'Ananya Sharma', email: 'ananya@example.com' }
        },
        errorExample: {
          error: 'Out of Stock',
          message: 'Only 1 unit(s) of "AeroPulse Headphones" are available in stock.'
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/payments/process" \\\n  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"cart_id":"cart_xxx","payment_method":"DEVELOPER_SIMULATOR","customer":{"name":"Ananya","email":"ananya@example.com"},"shipping_address":{"line1":"Flat 4B","city":"Chennai","postal_code":"600001"}}'`,
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/payments/process', {
  method: 'POST',
  headers: {
    'X-Storefront-Key': 'pk_live_YOUR_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cart_id: cartId,
    payment_method: 'COD',
    customer: { name: 'Rohan Patel', email: 'rohan@example.com' },
    shipping_address: { line1: '123 MG Road', city: 'Bangalore', postal_code: '560001' }
  })
});
const { order } = await res.json();
console.log('Order created:', order.order_number);`,
      },
      {
        id: 'get-payment-status',
        method: 'GET',
        path: '/api/v1/payments/:id',
        title: 'Get Payment Status',
        desc: 'Look up the payment and fulfillment status of an order using its orderNumber (e.g. ORD-82914-4921) or UUID.',
        auth: 'storefront_key',
        pathParams: [{ name: 'id', type: 'string', required: true, desc: 'Order number or order ID' }],
        successExample: {
          data: {
            order_number: 'ORD-82914-4921',
            order_id: 'ord_9a8b7c6d',
            payment_status: 'PAID',
            fulfillment_status: 'CONFIRMED',
            total_amount: 4998,
            currency: 'INR',
            payment_method: 'RAZORPAY',
            transaction_id: 'pay_Q2W3E4R5T6',
            item_count: 1
          }
        },
        errorExample: { error: 'Not Found', message: 'Order "ORD-INVALID" not found.' },
      },
      {
        id: 'simulate-payment',
        method: 'POST',
        path: '/api/v1/payments/simulate',
        title: 'Developer Sandbox Simulator',
        desc: 'Test authorization flows, failure handling, decline scenarios, and webhook payloads without live gateway accounts.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'amount', type: 'number', required: true, desc: 'Amount to simulate' },
          { name: 'scenario', type: '"SUCCESS" | "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "GATEWAY_TIMEOUT"', desc: 'Test scenario (Default: SUCCESS)' },
          { name: 'currency', type: 'string', desc: 'Currency code. Default: INR' },
        ],
        successExample: {
          success: true,
          scenario: 'SUCCESS',
          transaction_id: 'sim_txn_1725024000_9a8b',
          authorization_code: 'AUTH_821940',
          amount: 2499,
          currency: 'INR',
          card: { brand: 'Visa', last4: '4242' },
          webhook_payload_preview: {
            event: 'payment.completed',
            data: { transactionId: 'sim_txn_1725024000_9a8b', status: 'PAID' }
          }
        },
        errorExample: {
          error: 'Payment Failed',
          code: 'card_declined',
          decline_code: 'insufficient_funds',
          message: 'The card has insufficient funds to complete the purchase.'
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/payments/simulate" \\\n  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"amount":2499,"scenario":"SUCCESS"}'`,
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: User,
    color: 'text-teal-600',
    endpoints: [
      {
        id: 'register-customer',
        method: 'POST',
        path: '/api/v1/customers',
        title: 'Register Customer',
        desc: 'Creates a new customer account for your store. Returns a customer_token (JWT) that the customer can use for subsequent authenticated requests.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'name', type: 'string', required: true, desc: 'Customer full name' },
          { name: 'email', type: 'string', required: true, desc: 'Customer email address (must be unique)' },
          { name: 'password', type: 'string', required: true, desc: 'Account password (min 8 chars recommended)' },
          { name: 'phone', type: 'string', desc: 'Customer phone number (optional)' },
        ],
        successExample: {
          data: { id: 'cust_abc123', name: 'Ananya Sharma', email: 'ananya@example.com', phone: '+91 98765 43210', created_at: '2026-08-30T10:00:00Z' },
          customer_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          message: 'Account created successfully.',
        },
        errorExample: { error: 'Conflict', message: 'An account with this email already exists.' },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/customers" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Ananya Sharma","email":"ananya@example.com","password":"secure123"}'`,
      },
      {
        id: 'login-customer',
        method: 'POST',
        path: '/api/v1/customers/login',
        title: 'Customer Login',
        desc: 'Authenticates a customer and returns a customer_token. Include this token as a Bearer token in subsequent requests to /api/v1/customers/me.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'email', type: 'string', required: true, desc: 'Customer email address' },
          { name: 'password', type: 'string', required: true, desc: 'Account password' },
        ],
        successExample: {
          customer_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          data: { id: 'cust_abc123', name: 'Ananya Sharma', email: 'ananya@example.com', phone: '+91 98765 43210' },
        },
        errorExample: { error: 'Unauthorized', message: 'Invalid email or password.' },
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/customers/login', {
  method: 'POST',
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ananya@example.com', password: 'secure123' })
});
const { customer_token, data } = await res.json();

// Store token for authenticated requests
localStorage.setItem('customer_token', customer_token);`,
      },
      {
        id: 'get-me',
        method: 'GET',
        path: '/api/v1/customers/me',
        title: 'Get My Profile',
        desc: 'Returns the authenticated customer\'s own profile. Requires a valid customer_token from login or register.',
        auth: 'both',
        successExample: {
          data: {
            id: 'cust_abc123', name: 'Ananya Sharma', email: 'ananya@example.com',
            phone: '+91 98765 43210', group: 'VIP',
            default_address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', postal_code: '600001' },
            order_count: 8, total_spent: 24999,
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        errorExample: { error: 'Unauthorized', message: 'Customer authentication required.' },
        curlExample: `curl "${BASE_URL}/api/v1/customers/me" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Authorization: Bearer CUSTOMER_TOKEN"`,
      },
      {
        id: 'update-me',
        method: 'PATCH',
        path: '/api/v1/customers/me',
        title: 'Update My Profile',
        desc: 'Updates the authenticated customer\'s name, phone, or default shipping address. All fields are optional — only provide fields to update.',
        auth: 'both',
        bodyParams: [
          { name: 'name', type: 'string', desc: 'New display name' },
          { name: 'phone', type: 'string', desc: 'New phone number' },
          { name: 'default_address.line1', type: 'string', desc: 'Address line 1' },
          { name: 'default_address.city', type: 'string', desc: 'City' },
          { name: 'default_address.state', type: 'string', desc: 'State / Province' },
          { name: 'default_address.country', type: 'string', desc: 'Country' },
          { name: 'default_address.postal_code', type: 'string', desc: 'Postal code' },
        ],
        successExample: {
          data: { id: 'cust_abc123', name: 'Ananya Sharma', email: 'ananya@example.com', phone: '+91 98765 43210', default_address: { city: 'Mumbai', country: 'India' }, updated_at: '2026-08-30T10:00:00Z' },
          message: 'Profile updated successfully.',
        },
      },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const AuthBadge = ({ auth }: { auth?: string }) => {
  if (!auth) return null;
  if (auth === 'both') return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <Key className="w-3 h-3" /> X-Storefront-Key
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
        <Lock className="w-3 h-3" /> customer_token
      </span>
    </div>
  );
  if (auth === 'customer_token') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
      <Lock className="w-3 h-3" /> Customer Token
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
      <Key className="w-3 h-3" /> X-Storefront-Key
    </span>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<string>('get-store');
  const [activeTab, setActiveTab] = useState<Record<string, 'response' | 'request' | 'curl' | 'js'>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endpointRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allEndpoints = SECTIONS.flatMap(s => s.endpoints);
  const currentEndpoint = allEndpoints.find(e => e.id === activeEndpoint) ?? allEndpoints[0];

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getTab = (id: string): 'response' | 'request' | 'curl' | 'js' => {
    return activeTab[id] || 'response';
  };

  const setTab = (id: string, tab: 'response' | 'request' | 'curl' | 'js') => {
    setActiveTab(prev => ({ ...prev, [id]: tab }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-white text-sm hidden sm:block">Shoppify</span>
              <span className="text-slate-500 hidden sm:block">/</span>
              <span className="font-bold text-slate-300 text-sm">Developer API Docs</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black border border-indigo-500/30">
              v1
            </span>
            <a
              href="/developer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
            >
              <GitBranch className="w-3.5 h-3.5" /> Dashboard
            </a>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar */}
        <aside className={`fixed inset-y-14 left-0 z-30 w-64 bg-slate-950 border-r border-white/10 overflow-y-auto transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="p-4 space-y-1">
            {/* Auth Section */}
            <div className="mb-4">
              <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Authentication</div>
              <button
                onClick={() => { setActiveEndpoint('__auth'); setSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${activeEndpoint === '__auth' ? 'bg-indigo-600/20 text-indigo-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Auth Guide</span>
              </button>
            </div>

            {/* Endpoint Sections */}
            {SECTIONS.map(section => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    <Icon className={`w-3 h-3 ${section.color}`} />
                    {section.label}
                  </div>
                  {section.endpoints.map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => { setActiveEndpoint(ep.id); setSidebarOpen(false); }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition group ${activeEndpoint === ep.id ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${METHOD_STYLES[ep.method] || ''} !bg-opacity-20`}
                        style={{ background: ep.method === 'GET' ? 'rgba(16,185,129,0.15)' : ep.method === 'POST' ? 'rgba(59,130,246,0.15)' : ep.method === 'PATCH' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: ep.method === 'GET' ? '#10b981' : ep.method === 'POST' ? '#60a5fa' : ep.method === 'PATCH' ? '#fbbf24' : '#f87171' }}
                      >
                        {ep.method}
                      </span>
                      <span className="truncate text-xs">{ep.title}</span>
                    </button>
                  ))}
                </div>
              );
            })}

            {/* Webhooks */}
            <div className="mb-4">
              <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Webhooks</div>
              <button
                onClick={() => { setActiveEndpoint('__webhooks'); setSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${activeEndpoint === '__webhooks' ? 'bg-violet-600/20 text-violet-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Webhook className="w-3.5 h-3.5 shrink-0" />
                <span>Event Reference</span>
              </button>
            </div>

            {/* Errors */}
            <div>
              <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Reference</div>
              <button
                onClick={() => { setActiveEndpoint('__errors'); setSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${activeEndpoint === '__errors' ? 'bg-rose-600/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Error Codes</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Backdrop */}
        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">

          {/* ── Auth Guide ─────────────────────────────────────────────────────── */}
          {activeEndpoint === '__auth' && (
            <div className="p-6 sm:p-10 max-w-4xl space-y-10">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Authentication</div>
                <h1 className="text-3xl font-black text-white mb-3">Authenticating API Requests</h1>
                <p className="text-slate-400 leading-relaxed">The Shoppify Developer API uses two types of credentials depending on the endpoint type.</p>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="bg-indigo-900/30 px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold">
                      <Key className="w-4 h-4" /> Storefront API Key
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Required on every request. Send as a request header.</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="font-mono text-sm bg-slate-900 rounded-xl p-4 text-emerald-300">
                      X-Storefront-Key: pk_live_YOUR_KEY
                    </div>
                    <p className="text-xs text-slate-400">Keys are prefixed with <code className="text-indigo-300">pk_live_</code> (production) or <code className="text-indigo-300">pk_test_</code> (testing). Generate keys in <a href="/developer" className="text-indigo-400 underline">Developer → API Keys</a>.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="bg-teal-900/30 px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-teal-300 font-bold">
                      <Lock className="w-4 h-4" /> Customer Token (for /customers/me)
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Additional header for customer-authenticated endpoints.</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="font-mono text-sm bg-slate-900 rounded-xl p-4 text-teal-300">
                      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </div>
                    <p className="text-xs text-slate-400">Obtained from <code className="text-teal-300">POST /api/v1/customers/login</code> or <code className="text-teal-300">POST /api/v1/customers</code> (register). JWT expires in 7 days.</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-900/20 border border-amber-500/20 p-5 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-amber-300 mb-1">Never expose secret keys</div>
                    <p className="text-xs text-slate-400">The <code className="text-amber-300">X-Storefront-Key</code> is a public client key — safe to use in browser/mobile apps. Never use your CMS merchant JWT in client-side code.</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white mb-3">Complete Request Example</h3>
                  <div className="rounded-xl bg-slate-900 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/10">
                      <span className="text-xs text-slate-400 font-mono">cURL</span>
                      <button onClick={() => copy(`curl "${BASE_URL}/api/v1/products" \\\n  -H "X-Storefront-Key: pk_live_YOUR_KEY"`, 'auth-curl')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copied === 'auth-curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied === 'auth-curl' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 text-sm font-mono text-emerald-300 overflow-x-auto">{`curl "${BASE_URL}/api/v1/products" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Webhook Events ─────────────────────────────────────────────────── */}
          {activeEndpoint === '__webhooks' && (
            <div className="p-6 sm:p-10 max-w-4xl space-y-8">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-violet-400 mb-2">Webhooks</div>
                <h1 className="text-3xl font-black text-white mb-3">Webhook Event Reference</h1>
                <p className="text-slate-400 leading-relaxed">Subscribe to real-time store events in <a href="/developer" className="text-violet-400 underline">Developer → Webhooks</a>. Your endpoint receives a signed POST request with the event payload.</p>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-slate-900 px-5 py-3 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wide grid grid-cols-3">
                  <span>Event</span><span>Group</span><span>Description</span>
                </div>
                {[
                  { event: 'checkout.completed', group: 'Order', desc: 'Customer completes checkout and payment is captured' },
                  { event: 'payment.completed', group: 'Order', desc: 'Payment verified and captured by payment gateway' },
                  { event: 'order.confirmed', group: 'Order', desc: 'Order confirmed and accepted by the merchant' },
                  { event: 'order.fulfilled', group: 'Order', desc: 'All items packed and ready for dispatch' },
                  { event: 'order.shipped', group: 'Order', desc: 'Tracking number assigned — order dispatched' },
                  { event: 'order.delivered', group: 'Order', desc: 'Order delivered to the customer' },
                  { event: 'order.cancelled', group: 'Order', desc: 'Order cancelled before or after fulfillment' },
                  { event: 'product.updated', group: 'Catalog', desc: 'Product details or pricing changed — sync your cache' },
                  { event: 'inventory.updated', group: 'Catalog', desc: 'Stock level changed — sync inventory counts' },
                  { event: 'collection.updated', group: 'Catalog', desc: 'Collection updated — refresh your listings' },
                ].map(ev => (
                  <div key={ev.event} className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/5 transition items-center">
                    <code className="text-xs font-mono font-bold text-violet-300">{ev.event}</code>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full w-fit ${ev.group === 'Order' ? 'bg-blue-900/40 text-blue-300' : 'bg-amber-900/40 text-amber-300'}`}>{ev.group}</span>
                    <span className="text-xs text-slate-400">{ev.desc}</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-bold text-white mb-3">Sample Payload — checkout.completed</h3>
                <div className="rounded-xl bg-slate-900 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-white/10">
                    <span className="text-xs text-slate-400 font-mono">application/json</span>
                    <button onClick={() => copy(JSON.stringify({ event: 'checkout.completed', timestamp: '2026-08-30T10:00:00Z', data: { orderNumber: 'ORD-98214', totalAmount: 4999, currency: 'INR' } }, null, 2), 'wh-payload')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {copied === 'wh-payload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">{JSON.stringify({ event: 'checkout.completed', timestamp: '2026-08-30T10:00:00Z', data: { checkoutId: 'chk_a1b2c3', orderNumber: 'ORD-98214', totalAmount: 4999.00, currency: 'INR', paymentStatus: 'PAID', customer: { name: 'Ananya Sharma', email: 'ananya@example.com' }, shippingAddress: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' } } }, null, 2)}</pre>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/50 border border-white/10 p-5 space-y-2">
                <div className="text-sm font-bold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Signature Verification</div>
                <p className="text-xs text-slate-400">Every webhook POST includes a <code className="text-emerald-300">X-Webhook-Secret</code> header. Verify this matches your endpoint secret to prevent spoofed requests.</p>
              </div>
            </div>
          )}

          {/* ── Error Codes ────────────────────────────────────────────────────── */}
          {activeEndpoint === '__errors' && (
            <div className="p-6 sm:p-10 max-w-4xl space-y-8">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-rose-400 mb-2">Reference</div>
                <h1 className="text-3xl font-black text-white mb-3">Error Codes</h1>
                <p className="text-slate-400 leading-relaxed">All error responses follow a consistent JSON structure.</p>
              </div>

              <div className="rounded-xl bg-slate-900 p-5 font-mono text-sm">
                <span className="text-slate-500">{'{'}</span><br />
                <span className="text-slate-400 ml-4">"error": </span><span className="text-amber-300">"Not Found"</span><span className="text-slate-400">,</span><br />
                <span className="text-slate-400 ml-4">"message": </span><span className="text-amber-300">"Product 'abc' not found."</span><br />
                <span className="text-slate-500">{'}'}</span>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-slate-900 px-5 py-3 border-b border-white/10 grid grid-cols-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>HTTP Status</span><span>error field</span><span>When it occurs</span><span>Fix</span>
                </div>
                {[
                  { status: '200 OK', error: '—', when: 'Request succeeded', fix: 'Read the data field' },
                  { status: '201 Created', error: '—', when: 'Resource created successfully', fix: 'Read the data field' },
                  { status: '400 Bad Request', error: '"Bad Request" / "Out of Stock"', when: 'Missing required fields, validation failure, OOS', fix: 'Check the message field for specific guidance' },
                  { status: '401 Unauthorized', error: '"Unauthorized"', when: 'Missing or invalid API key / customer token', fix: 'Provide X-Storefront-Key header' },
                  { status: '403 Forbidden', error: '"Forbidden"', when: 'Plan feature not available', fix: 'Upgrade plan in Billing' },
                  { status: '404 Not Found', error: '"Not Found"', when: 'Resource ID or slug does not exist', fix: 'Verify the ID/slug is correct' },
                  { status: '409 Conflict', error: '"Conflict"', when: 'Email already registered', fix: 'Use login endpoint instead' },
                  { status: '503 Service Unavailable', error: '"Service Unavailable"', when: 'No active store found for the API key', fix: 'Ensure your store is ACTIVE in Settings' },
                  { status: '500 Internal Error', error: '"Internal Server Error"', when: 'Unexpected server error', fix: 'Retry with exponential backoff, report if persistent' },
                ].map(row => (
                  <div key={row.status} className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-white/5 hover:bg-white/5 transition text-xs items-start">
                    <code className={`font-mono font-bold ${row.status.includes('200') || row.status.includes('201') ? 'text-emerald-400' : row.status.includes('4') ? 'text-amber-400' : 'text-rose-400'}`}>{row.status}</code>
                    <code className="font-mono text-slate-300 text-[11px]">{row.error}</code>
                    <span className="text-slate-400">{row.when}</span>
                    <span className="text-slate-300">{row.fix}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Endpoint Detail ─────────────────────────────────────────────────── */}
          {activeEndpoint !== '__auth' && activeEndpoint !== '__webhooks' && activeEndpoint !== '__errors' && currentEndpoint && (
            <div className="p-6 sm:p-10 max-w-4xl">
              {/* Section breadcrumb */}
              {SECTIONS.map(s => {
                const found = s.endpoints.find(e => e.id === currentEndpoint.id);
                if (!found) return null;
                const Icon = s.icon;
                return (
                  <div key={s.id} className={`flex items-center gap-1.5 text-xs font-bold mb-4 ${s.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span className="text-slate-400 font-normal">{currentEndpoint.title}</span>
                  </div>
                );
              })}

              {/* Title + Badge */}
              <div className="flex flex-wrap items-start gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{currentEndpoint.title}</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">{currentEndpoint.desc}</p>
                </div>
              </div>

              {/* Method + Path */}
              <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden mb-8">
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg font-mono ${METHOD_STYLES[currentEndpoint.method]}`}>{currentEndpoint.method}</span>
                  <code className="font-mono text-slate-200 text-sm flex-1">{BASE_URL}{currentEndpoint.path}</code>
                  <button onClick={() => copy(`${BASE_URL}${currentEndpoint.path}`, 'path')} className="text-slate-500 hover:text-white transition">
                    {copied === 'path' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">Auth:</span>
                  <AuthBadge auth={currentEndpoint.auth} />
                </div>
              </div>

              {/* Parameters */}
              {(currentEndpoint.pathParams || currentEndpoint.queryParams || currentEndpoint.bodyParams) && (
                <div className="mb-8 space-y-4">
                  <h2 className="text-base font-black text-white">Parameters</h2>

                  {currentEndpoint.pathParams && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Path Parameters</div>
                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        {currentEndpoint.pathParams.map((p, i) => (
                          <div key={p.name} className={`flex gap-4 px-4 py-3 ${i < currentEndpoint.pathParams!.length - 1 ? 'border-b border-white/5' : ''}`}>
                            <code className="text-indigo-300 font-mono text-xs font-bold w-28 shrink-0 mt-0.5">{p.name}</code>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] text-slate-400 font-mono">{p.type}</span>
                                {p.required && <span className="text-[10px] font-black text-rose-400 bg-rose-900/30 px-1.5 rounded">required</span>}
                              </div>
                              <p className="text-xs text-slate-400">{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentEndpoint.queryParams && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Query Parameters</div>
                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        {currentEndpoint.queryParams.map((p, i) => (
                          <div key={p.name} className={`flex gap-4 px-4 py-3 ${i < currentEndpoint.queryParams!.length - 1 ? 'border-b border-white/5' : ''}`}>
                            <code className="text-sky-300 font-mono text-xs font-bold w-36 shrink-0 mt-0.5">{p.name}</code>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] text-slate-400 font-mono">{p.type}</span>
                                {p.required && <span className="text-[10px] font-black text-rose-400 bg-rose-900/30 px-1.5 rounded">required</span>}
                              </div>
                              <p className="text-xs text-slate-400">{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentEndpoint.bodyParams && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Body Parameters <span className="normal-case font-normal text-slate-500">(application/json)</span></div>
                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        {currentEndpoint.bodyParams.map((p, i) => (
                          <div key={p.name} className={`flex gap-4 px-4 py-3 ${i < currentEndpoint.bodyParams!.length - 1 ? 'border-b border-white/5' : ''}`}>
                            <code className="text-amber-300 font-mono text-xs font-bold w-48 shrink-0 mt-0.5">{p.name}</code>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] text-slate-400 font-mono">{p.type}</span>
                                {p.required && <span className="text-[10px] font-black text-rose-400 bg-rose-900/30 px-1.5 rounded">required</span>}
                              </div>
                              <p className="text-xs text-slate-400">{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Response Fields */}
              {currentEndpoint.responseFields && (
                <div className="mb-8">
                  <h2 className="text-base font-black text-white mb-3">Response Fields</h2>
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="grid grid-cols-3 px-4 py-2.5 bg-slate-900/50 border-b border-white/10 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      <span>Field</span><span>Type</span><span>Description</span>
                    </div>
                    {currentEndpoint.responseFields.map((rf, i) => (
                      <div key={rf.field} className={`grid grid-cols-3 gap-3 px-4 py-3 ${i < currentEndpoint.responseFields!.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition`}>
                        <code className="text-xs font-mono text-emerald-300">{rf.field}</code>
                        <code className="text-xs font-mono text-slate-400">{rf.type}</code>
                        <span className="text-xs text-slate-400">{rf.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Examples */}
              <div className="mb-8">
                <h2 className="text-base font-black text-white mb-3">Examples</h2>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-white/10 mb-0">
                  {[
                    { key: 'response', label: '✅ Success Response', always: true },
                    { key: 'request', label: '❌ Error Response', always: !!currentEndpoint.errorExample },
                    { key: 'curl', label: 'cURL', always: !!currentEndpoint.curlExample },
                    { key: 'js', label: 'JavaScript', always: !!currentEndpoint.jsExample },
                  ].filter(t => t.always).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setTab(currentEndpoint.id, tab.key as any)}
                      className={`px-3 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${getTab(currentEndpoint.id) === tab.key ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-b-xl rounded-tr-xl bg-slate-900 overflow-hidden border border-t-0 border-white/10">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50 border-b border-white/10">
                    <span className="text-xs text-slate-500 font-mono">
                      {getTab(currentEndpoint.id) === 'response' ? '200 OK / 201 Created' :
                       getTab(currentEndpoint.id) === 'request' ? '4xx / 5xx Error' :
                       getTab(currentEndpoint.id) === 'curl' ? 'Terminal' : 'JavaScript / TypeScript'}
                    </span>
                    <button
                      onClick={() => {
                        const tab = getTab(currentEndpoint.id);
                        const content = tab === 'response' ? JSON.stringify(currentEndpoint.successExample, null, 2)
                          : tab === 'request' ? JSON.stringify(currentEndpoint.errorExample, null, 2)
                          : tab === 'curl' ? (currentEndpoint.curlExample || '')
                          : (currentEndpoint.jsExample || '');
                        copy(content, `${currentEndpoint.id}-${tab}`);
                      }}
                      className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition"
                    >
                      {copied === `${currentEndpoint.id}-${getTab(currentEndpoint.id)}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <pre className={`p-5 text-xs font-mono overflow-x-auto leading-relaxed max-h-96 ${
                    getTab(currentEndpoint.id) === 'response' ? 'text-emerald-300' :
                    getTab(currentEndpoint.id) === 'request' ? 'text-rose-300' :
                    'text-slate-200'
                  }`}>
                    {getTab(currentEndpoint.id) === 'response' ? JSON.stringify(currentEndpoint.successExample, null, 2)
                      : getTab(currentEndpoint.id) === 'request' ? JSON.stringify(currentEndpoint.errorExample || {}, null, 2)
                      : getTab(currentEndpoint.id) === 'curl' ? (currentEndpoint.curlExample || '# No cURL example for this endpoint')
                      : (currentEndpoint.jsExample || '// No JS example for this endpoint')}
                  </pre>
                </div>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                {(() => {
                  const idx = allEndpoints.findIndex(e => e.id === currentEndpoint.id);
                  const prev = allEndpoints[idx - 1];
                  const next = allEndpoints[idx + 1];
                  return (
                    <>
                      <div>
                        {prev && (
                          <button onClick={() => setActiveEndpoint(prev.id)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            <div className="text-left">
                              <div className="text-[10px] uppercase tracking-wide text-slate-600">Previous</div>
                              <div className="font-bold">{prev.title}</div>
                            </div>
                          </button>
                        )}
                      </div>
                      <div>
                        {next && (
                          <button onClick={() => setActiveEndpoint(next.id)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
                            <div className="text-right">
                              <div className="text-[10px] uppercase tracking-wide text-slate-600">Next</div>
                              <div className="font-bold">{next.title}</div>
                            </div>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
