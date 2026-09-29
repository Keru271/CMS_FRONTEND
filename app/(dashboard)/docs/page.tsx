'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Key,
  Globe,
  Package,
  Layers,
  Search,
  ShoppingCart,
  Zap,
  User,
  CreditCard,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  BookOpen,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Hash,
  Menu,
  X,
  Webhook,
  Lock,
  GitBranch,
  Activity,
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
  GET: 'bg-[#32D74B]/15 text-[#32D74B] border border-[#32D74B]/30',
  POST: 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30',
  PATCH: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  DELETE: 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30',
  PUT: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
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
            theme: {
              activeTemplate: 'nova',
              primaryColor: '#6366f1',
              secondaryColor: '#8b5cf6',
              accentColor: '#a78bfa',
            },
            social_links: {
              facebook: 'https://facebook.com/store',
              instagram: 'https://instagram.com/store',
            },
            seo: {
              title: 'My Fashion Store',
              description: 'Shop the latest trends.',
              ogImage: 'https://cdn.example.com/og.jpg',
            },
            announcement: 'Free shipping on orders above ₹999!',
          },
        },
        responseFields: [
          { field: 'data.id', type: 'string', desc: 'Unique store identifier' },
          { field: 'data.name', type: 'string', desc: 'Store display name' },
          {
            field: 'data.currency',
            type: 'string',
            desc: 'ISO 4217 currency code (e.g. INR, USD)',
          },
          { field: 'data.theme', type: 'object', desc: 'Active template slug and brand colors' },
          { field: 'data.social_links', type: 'object', desc: 'Social media profile URLs' },
          {
            field: 'data.announcement',
            type: 'string | null',
            desc: 'Header announcement banner text',
          },
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
          {
            name: 'search / q',
            type: 'string',
            desc: 'Full-text search across name, description, brand, SKU, tags',
          },
          {
            name: 'category',
            type: 'string',
            desc: 'Filter by category name (case-insensitive contains)',
          },
          { name: 'collection', type: 'string', desc: 'Filter by collection name' },
          { name: 'brand', type: 'string', desc: 'Filter by brand name' },
          { name: 'minPrice', type: 'number', desc: 'Minimum price filter (inclusive)' },
          { name: 'maxPrice', type: 'number', desc: 'Maximum price filter (inclusive)' },
          {
            name: 'availability',
            type: '"in_stock" | "out_of_stock"',
            desc: 'Filter by stock availability',
          },
          {
            name: 'sort',
            type: '"newest" | "price_asc" | "price_desc" | "name"',
            desc: 'Sort order. Default: newest',
          },
          { name: 'page', type: 'number', desc: 'Page number (1-indexed). Default: 1' },
          { name: 'limit', type: 'number', desc: 'Results per page (max 100). Default: 20' },
        ],
        successExample: {
          data: [
            {
              id: 'prod_abc',
              name: 'AeroPulse Headphones',
              slug: 'aeropulse-headphones',
              price: 2499,
              compare_at_price: 3499,
              image: 'https://cdn.example.com/prod1.jpg',
              inventory: 50,
              available: true,
              brand: 'AeroBrand',
              category: 'Electronics',
              collection: 'Best Sellers',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 142,
            total_pages: 8,
            has_next: true,
            has_prev: false,
          },
        },
        responseFields: [
          { field: 'data', type: 'Product[]', desc: 'Array of product objects' },
          { field: 'data[].id', type: 'string', desc: 'Unique product identifier' },
          { field: 'data[].price', type: 'number', desc: 'Current selling price' },
          {
            field: 'data[].compare_at_price',
            type: 'number | null',
            desc: 'Original price for strikethrough display',
          },
          { field: 'data[].available', type: 'boolean', desc: 'True if inventory > 0' },
          {
            field: 'data[].variants',
            type: 'Variant[]',
            desc: 'Product variant options (color, size, etc.)',
          },
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
          {
            name: 'id',
            type: 'string',
            required: true,
            desc: 'Product ID or urlSlug (both accepted)',
          },
        ],
        successExample: {
          data: {
            id: 'prod_abc',
            name: 'AeroPulse Headphones',
            slug: 'aeropulse-headphones',
            price: 2499,
            compare_at_price: 3499,
            sku: 'APH-001',
            image: 'https://cdn.example.com/prod1.jpg',
            images: ['https://cdn.example.com/p1.jpg', 'https://cdn.example.com/p2.jpg'],
            inventory: 50,
            available: true,
            brand: 'AeroBrand',
            category: 'Electronics',
            tags: ['wireless', 'premium', 'noise-cancelling'],
            variants: [
              { id: 'var_1', name: 'Black', price: 2499, inventory: 30 },
              { id: 'var_2', name: 'White', price: 2499, inventory: 20 },
            ],
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
            {
              id: 'col_001',
              name: 'Summer Collection',
              slug: 'summer-collection',
              description: 'Light and breezy.',
              image: 'https://cdn.example.com/col1.jpg',
              created_at: '2026-01-01T00:00:00Z',
            },
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
        successExample: {
          data: {
            id: 'col_001',
            name: 'Summer Collection',
            slug: 'summer-collection',
            image: 'https://cdn.example.com/col1.jpg',
          },
        },
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
          {
            name: 'sort',
            type: '"newest" | "price_asc" | "price_desc" | "name"',
            desc: 'Sort order',
          },
          { name: 'page', type: 'number', desc: 'Page number. Default: 1' },
          { name: 'limit', type: 'number', desc: 'Results per page (max 100). Default: 20' },
        ],
        successExample: {
          collection: { id: 'col_001', name: 'Summer Collection', slug: 'summer-collection' },
          data: [{ id: 'prod_abc', name: 'Linen Shirt', price: 1299, available: true }],
          pagination: {
            page: 1,
            limit: 20,
            total: 24,
            total_pages: 2,
            has_next: true,
            has_prev: false,
          },
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
          products: [
            {
              id: 'prod_abc',
              name: 'AeroPulse Headphones',
              slug: 'aeropulse-headphones',
              price: 2499,
              image: 'https://cdn.example.com/p.jpg',
              available: true,
            },
          ],
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
          data: {
            id: 'cart_internal_id',
            cart_id: 'cart_a1b2c3d4e5f6',
            items: [],
            item_count: 0,
            subtotal: 0,
            currency: 'INR',
            created_at: '2026-08-30T10:00:00Z',
            updated_at: '2026-08-30T10:00:00Z',
          },
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
        pathParams: [
          {
            name: 'id',
            type: 'string',
            required: true,
            desc: 'Cart ID (cart_id from Create Cart response)',
          },
        ],
        successExample: {
          data: {
            cart_id: 'cart_a1b2c3d4e5f6',
            items: [
              {
                id: 'item_001',
                productId: 'prod_abc',
                name: 'AeroPulse Headphones',
                price: 2499,
                quantity: 1,
                image: 'https://cdn.example.com/p.jpg',
                totalPrice: 2499,
                isOutOfStock: false,
              },
            ],
            item_count: 1,
            subtotal: 2499,
            currency: 'INR',
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
          {
            name: 'variant_id',
            type: 'string',
            desc: 'Variant ID (required if product has variants)',
          },
          { name: 'quantity', type: 'number', desc: 'Quantity to add. Default: 1' },
          {
            name: 'options',
            type: 'object',
            desc: 'Custom options key-value map (e.g. { "gift_wrap": "true" })',
          },
        ],
        successExample: {
          data: {
            cart_id: 'cart_a1b2c3d4e5f6',
            items: [
              {
                id: 'item_001',
                productId: 'prod_abc',
                variantId: 'var_1',
                name: 'AeroPulse Headphones - Black',
                price: 2499,
                quantity: 2,
                totalPrice: 4998,
              },
            ],
            item_count: 2,
            subtotal: 4998,
            currency: 'INR',
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
          {
            name: 'itemId',
            type: 'string',
            required: true,
            desc: 'Item ID (from cart items array)',
          },
        ],
        bodyParams: [
          {
            name: 'quantity',
            type: 'number',
            required: true,
            desc: 'New quantity. Set to 0 to remove item.',
          },
        ],
        successExample: {
          data: { cart_id: 'cart_a1b2c3d4e5f6', items: [], item_count: 0, subtotal: 0 },
        },
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
        successExample: {
          data: { cart_id: 'cart_a1b2c3d4e5f6', items: [], item_count: 0, subtotal: 0 },
        },
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
          {
            name: 'cart_id',
            type: 'string',
            required: true,
            desc: 'Cart ID from POST /api/v1/cart',
          },
          {
            name: 'customer.email',
            type: 'string',
            required: true,
            desc: 'Customer email address',
          },
          { name: 'customer.name', type: 'string', desc: 'Customer full name' },
          { name: 'customer.phone', type: 'string', desc: 'Customer phone number' },
          { name: 'shipping_address.city', type: 'string', required: true, desc: 'Shipping city' },
          {
            name: 'shipping_address.postal_code',
            type: 'string',
            required: true,
            desc: 'Postal / ZIP code',
          },
          { name: 'shipping_address.state', type: 'string', desc: 'State / Province' },
          {
            name: 'shipping_address.country',
            type: 'string',
            desc: 'Country name. Default: India',
          },
          { name: 'coupon_code', type: 'string', desc: 'Optional discount coupon code' },
          { name: 'shipping_method', type: 'string', desc: 'Shipping method ID' },
          { name: 'notes', type: 'string', desc: 'Order notes from customer' },
        ],
        successExample: {
          data: {
            checkout_id: 'chk_a1b2c3d4e5f6g7h8',
            cart_id: 'cart_a1b2c3d4e5f6',
            status: 'PENDING',
            customer: {
              email: 'user@example.com',
              name: 'Ananya Sharma',
              phone: '+91 98765 43210',
            },
            shipping_address: {
              city: 'Chennai',
              state: 'Tamil Nadu',
              country: 'India',
              postal_code: '600001',
            },
            pricing: {
              subtotal: 4998,
              shipping: 0,
              tax: 899.64,
              discount: 0,
              grand_total: 5897.64,
              currency: 'INR',
            },
            payment_gateways: {
              razorpay: {
                enabled: true,
                key_id: 'rzp_live_xxx',
                order_id: 'order_abc123',
                amount_paisa: 589764,
                currency: 'INR',
              },
              stripe: {
                enabled: true,
                publishable_key: 'pk_live_xxx',
                currency: 'inr',
                amount_cents: 589764,
              },
              cod: { enabled: true, label: 'Cash on Delivery', max_order_amount: 10000 },
            },
            items: [
              {
                product_id: 'prod_abc',
                name: 'AeroPulse Headphones',
                quantity: 2,
                price: 2499,
                total: 4998,
              },
            ],
            expires_at: '2026-08-30T10:30:00Z',
          },
        },
        errorExample: {
          error: 'Out of Stock',
          message: 'Only 1 unit(s) of "AeroPulse Headphones" are available.',
        },
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
        pathParams: [
          {
            name: 'id',
            type: 'string',
            required: true,
            desc: 'Checkout ID from POST /api/v1/checkout',
          },
        ],
        successExample: {
          checkout_id: 'chk_a1b2c3d4e5f6g7h8',
          status: 'PENDING',
          message:
            'Checkout sessions are ephemeral. Complete payment and listen for the checkout.completed webhook.',
          next_steps: {
            razorpay: 'Initialize Razorpay.js with key_id and order_id',
            stripe: 'Use publishable_key to create a PaymentIntent',
            cod: 'Submit order with payment_method: "cod"',
            webhook: 'Subscribe to checkout.completed via Developer → Webhooks',
          },
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
              razorpay: {
                enabled: true,
                key_id: 'rzp_live_xxx',
                currencies: ['INR'],
                supported_instruments: ['UPI', 'CARDS', 'NETBANKING'],
              },
              stripe: {
                enabled: true,
                publishable_key: 'pk_live_xxx',
                currencies: ['USD', 'EUR', 'INR'],
                supported_instruments: ['CREDIT_CARD', 'APPLE_PAY'],
              },
              cod: { enabled: true, label: 'Cash on Delivery', max_order_amount: 10000, fee: 0 },
              developer_simulator: {
                enabled: true,
                label: 'Developer Sandbox Simulator',
                supported_scenarios: ['SUCCESS', 'INSUFFICIENT_FUNDS', 'CARD_DECLINED'],
              },
            },
          },
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
          {
            name: 'cart_id',
            type: 'string',
            required: true,
            desc: 'Shopping cart token containing items',
          },
          {
            name: 'payment_method',
            type: '"RAZORPAY" | "STRIPE" | "COD" | "DEVELOPER_SIMULATOR"',
            required: true,
            desc: 'Selected payment method',
          },
          { name: 'customer.email', type: 'string', required: true, desc: 'Customer email' },
          { name: 'customer.name', type: 'string', required: true, desc: 'Customer name' },
          {
            name: 'shipping_address.line1',
            type: 'string',
            required: true,
            desc: 'Street address',
          },
          { name: 'shipping_address.city', type: 'string', required: true, desc: 'City' },
          {
            name: 'shipping_address.postal_code',
            type: 'string',
            required: true,
            desc: 'Postal code',
          },
          {
            name: 'payment_details',
            type: 'object',
            desc: 'Gateway verification payload or simulation settings',
          },
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
            created_at: '2026-08-30T13:20:00.000Z',
          },
          customer: { name: 'Ananya Sharma', email: 'ananya@example.com' },
        },
        errorExample: {
          error: 'Out of Stock',
          message: 'Only 1 unit(s) of "AeroPulse Headphones" are available in stock.',
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
        pathParams: [
          { name: 'id', type: 'string', required: true, desc: 'Order number or order ID' },
        ],
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
            item_count: 1,
          },
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
          {
            name: 'scenario',
            type: '"SUCCESS" | "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "GATEWAY_TIMEOUT"',
            desc: 'Test scenario (Default: SUCCESS)',
          },
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
            data: { transactionId: 'sim_txn_1725024000_9a8b', status: 'PAID' },
          },
        },
        errorExample: {
          error: 'Payment Failed',
          code: 'card_declined',
          decline_code: 'insufficient_funds',
          message: 'The card has insufficient funds to complete the purchase.',
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
          {
            name: 'email',
            type: 'string',
            required: true,
            desc: 'Customer email address (must be unique)',
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            desc: 'Account password (min 8 chars recommended)',
          },
          { name: 'phone', type: 'string', desc: 'Customer phone number (optional)' },
        ],
        successExample: {
          data: {
            id: 'cust_abc123',
            name: 'Ananya Sharma',
            email: 'ananya@example.com',
            phone: '+91 98765 43210',
            created_at: '2026-08-30T10:00:00Z',
          },
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
          data: {
            id: 'cust_abc123',
            name: 'Ananya Sharma',
            email: 'ananya@example.com',
            phone: '+91 98765 43210',
          },
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
        desc: "Returns the authenticated customer's own profile. Requires a valid customer_token from login or register.",
        auth: 'both',
        successExample: {
          data: {
            id: 'cust_abc123',
            name: 'Ananya Sharma',
            email: 'ananya@example.com',
            phone: '+91 98765 43210',
            group: 'VIP',
            default_address: {
              city: 'Chennai',
              state: 'Tamil Nadu',
              country: 'India',
              postal_code: '600001',
            },
            order_count: 8,
            total_spent: 24999,
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
        desc: "Updates the authenticated customer's name, phone, or default shipping address. All fields are optional — only provide fields to update.",
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
          data: {
            id: 'cust_abc123',
            name: 'Ananya Sharma',
            email: 'ananya@example.com',
            phone: '+91 98765 43210',
            default_address: { city: 'Mumbai', country: 'India' },
            updated_at: '2026-08-30T10:00:00Z',
          },
          message: 'Profile updated successfully.',
        },
      },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const AuthBadge = ({ auth }: { auth?: string }) => {
  if (!auth) return null;
  if (auth === 'both')
    return (
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
          <Key className="w-3 h-3" /> X-Storefront-Key
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/30">
          <Lock className="w-3 h-3" /> customer_token
        </span>
      </div>
    );
  if (auth === 'customer_token')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/30">
        <Lock className="w-3 h-3" /> Customer Token
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
      <Key className="w-3 h-3" /> X-Storefront-Key
    </span>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<string>('get-store');
  const [activeTab, setActiveTab] = useState<
    Record<string, 'response' | 'request' | 'curl' | 'js'>
  >({});
  const [copied, setCopied] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allEndpoints = SECTIONS.flatMap((s) => s.endpoints);
  const currentEndpoint = allEndpoints.find((e) => e.id === activeEndpoint) ?? allEndpoints[0];

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getTab = (id: string): 'response' | 'request' | 'curl' | 'js' => {
    return activeTab[id] || 'response';
  };

  const setTab = (id: string, tab: 'response' | 'request' | 'curl' | 'js') => {
    setActiveTab((prev) => ({ ...prev, [id]: tab }));
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredSections = SECTIONS.map((sec) => ({
    ...sec,
    endpoints: sec.endpoints.filter(
      (ep) =>
        !q ||
        ep.title.toLowerCase().includes(q) ||
        ep.path.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q) ||
        ep.desc.toLowerCase().includes(q),
    ),
  })).filter((sec) => sec.endpoints.length > 0 || !q);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header Banner Card ── */}
      <div className="bg-[#1E1E1E] border border-[#2C2C2E] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">
                REST API Documentation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-mono font-bold border border-[#00E5FF]/30">
                v1 REST
              </span>
              <span className="text-xs font-mono text-[#32D74B] flex items-center gap-1.5 bg-[#32D74B]/10 px-2.5 py-0.5 rounded-full border border-[#32D74B]/30 font-semibold">
                <Activity className="w-3 h-3 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-xs text-[#98989D] mt-1 leading-relaxed">
              Explore public storefront endpoints, parameters, JSON response schemas, and event webhooks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/developer"
            className="px-3.5 py-2 rounded-xl bg-[#161616] hover:bg-[#252525] text-xs font-mono text-[#98989D] hover:text-white border border-[#2C2C2E] transition flex items-center gap-2"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#00E5FF]" />
            Developer Studio
          </a>
        </div>
      </div>

      {/* ── Two Column Layout (Navigator + Main Detail) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigator Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-4">
          <div className="bg-[#1E1E1E] border border-[#2C2C2E] rounded-2xl p-4 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-4 shadow-lg">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#98989D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter endpoints..."
                className="w-full pl-8 pr-3 py-2 bg-[#161616] border border-[#2C2C2E] focus:border-[#00E5FF] rounded-xl text-xs text-white placeholder-[#98989D] outline-none font-mono transition"
              />
            </div>

            <nav className="space-y-4">
              {/* Guides */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#98989D]">
                  Getting Started
                </div>
                <button
                  onClick={() => setActiveEndpoint('__auth')}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition border ${
                    activeEndpoint === '__auth'
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30 font-semibold shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                      : 'text-[#98989D] hover:text-white hover:bg-[#252525] border-transparent'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0 text-[#00E5FF]" />
                  <span>Authentication Guide</span>
                </button>
                <button
                  onClick={() => setActiveEndpoint('__webhooks')}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition border ${
                    activeEndpoint === '__webhooks'
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30 font-semibold shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                      : 'text-[#98989D] hover:text-white hover:bg-[#252525] border-transparent'
                  }`}
                >
                  <Webhook className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                  <span>Webhook Events</span>
                </button>
                <button
                  onClick={() => setActiveEndpoint('__errors')}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition border ${
                    activeEndpoint === '__errors'
                      ? 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/30 font-semibold shadow-[0_0_12px_rgba(255,69,58,0.1)]'
                      : 'text-[#98989D] hover:text-white hover:bg-[#252525] border-transparent'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#FF453A]" />
                  <span>Error Code Reference</span>
                </button>
              </div>

              {/* Endpoint Sections */}
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#98989D]">
                      <Icon className="w-3 h-3 text-[#00E5FF]" />
                      {section.label}
                    </div>
                    <div className="space-y-1">
                      {section.endpoints.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => setActiveEndpoint(ep.id)}
                          className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition border ${
                            activeEndpoint === ep.id
                              ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30 font-semibold shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                              : 'text-[#98989D] hover:text-white hover:bg-[#252525] border-transparent'
                          }`}
                        >
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_STYLES[ep.method] || ''}`}
                          >
                            {ep.method}
                          </span>
                          <span className="truncate">{ep.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Documentation Panel */}
        <main className="lg:col-span-8 xl:col-span-9 bg-[#1E1E1E] border border-[#2C2C2E] rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl min-w-0">
          {/* ── Auth Guide ─────────────────────────────────────────────────────── */}
          {activeEndpoint === '__auth' && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00E5FF] mb-2 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Authentication
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mb-2">
                  Authenticating API Requests
                </h1>
                <p className="text-[#98989D] text-sm leading-relaxed">
                  The Storefront REST API uses scoped client keys and optional customer JWT tokens depending on the endpoint security profile.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#2C2C2E] bg-[#181818] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#00E5FF] font-bold text-sm">
                      <Key className="w-4 h-4" /> Storefront API Key
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                      Public Client Key
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="font-mono text-xs bg-[#121212] border border-[#2C2C2E] rounded-xl p-4 text-[#32D74B]">
                      X-Storefront-Key: pk_live_YOUR_KEY
                    </div>
                    <p className="text-xs text-[#98989D] leading-relaxed">
                      Keys are prefixed with <code className="text-[#00E5FF] font-mono">pk_live_</code> (production) or <code className="text-[#00E5FF] font-mono">pk_test_</code> (testing). Generate and configure your keys in{' '}
                      <a href="/developer" className="text-[#00E5FF] hover:underline font-semibold">
                        Developer Studio → API Keys
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#2C2C2E] bg-[#181818] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                      <Lock className="w-4 h-4" /> Customer JWT Token (for /customers/me)
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/30">
                      Bearer Token
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="font-mono text-xs bg-[#121212] border border-[#2C2C2E] rounded-xl p-4 text-violet-300">
                      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </div>
                    <p className="text-xs text-[#98989D] leading-relaxed">
                      Obtained from <code className="text-[#00E5FF] font-mono">POST /api/v1/customers/login</code> or <code className="text-[#00E5FF] font-mono">POST /api/v1/customers</code>. Session tokens expire in 7 days.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#3A1C1C] border-l-4 border-[#FF453A] p-5 flex gap-3.5">
                  <AlertCircle className="w-5 h-5 text-[#FF453A] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[#FF453A]">
                      Never expose merchant administrative secret keys
                    </div>
                    <p className="text-xs text-[#98989D] leading-relaxed">
                      The <code className="text-white font-mono">X-Storefront-Key</code> is a scoped public client key — safe to bundle in storefront web apps. Never place your CMS merchant administrative tokens into client-side bundles.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white">Complete Request Example</h3>
                  <div className="rounded-2xl bg-[#161616] border border-[#2C2C2E] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#181818] border-b border-[#2C2C2E]">
                      <span className="text-xs text-[#98989D] font-mono">cURL Terminal</span>
                      <button
                        onClick={() =>
                          copy(
                            `curl "${BASE_URL}/api/v1/products" \\\n  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
                            'auth-curl',
                          )
                        }
                        className="text-xs text-[#98989D] hover:text-[#00E5FF] flex items-center gap-1.5 transition font-mono"
                      >
                        {copied === 'auth-curl' ? (
                          <Check className="w-3.5 h-3.5 text-[#32D74B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied === 'auth-curl' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-[#32D74B] overflow-x-auto leading-relaxed">{`curl "${BASE_URL}/api/v1/products" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Webhook Events ─────────────────────────────────────────────────── */}
          {activeEndpoint === '__webhooks' && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400 mb-2 flex items-center gap-2">
                  <Webhook className="w-3.5 h-3.5" /> Webhooks
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mb-2">
                  Webhook Event Reference
                </h1>
                <p className="text-[#98989D] text-sm leading-relaxed">
                  Subscribe to real-time asynchronous store events in{' '}
                  <a href="/developer" className="text-[#00E5FF] hover:underline font-semibold">
                    Developer Studio → Webhooks
                  </a>
                  . Your server endpoint receives a signed HTTP POST request with an event payload.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                <div className="bg-[#181818] px-5 py-3 border-b border-[#2C2C2E] text-xs font-mono font-bold text-[#98989D] uppercase tracking-wider grid grid-cols-3">
                  <span>Event Topic</span>
                  <span>Group</span>
                  <span>Description</span>
                </div>
                {[
                  {
                    event: 'checkout.completed',
                    group: 'Order',
                    desc: 'Customer completes checkout and payment is captured',
                  },
                  {
                    event: 'payment.completed',
                    group: 'Order',
                    desc: 'Payment verified and captured by payment gateway',
                  },
                  {
                    event: 'order.confirmed',
                    group: 'Order',
                    desc: 'Order confirmed and accepted by the merchant',
                  },
                  {
                    event: 'order.fulfilled',
                    group: 'Order',
                    desc: 'All items packed and ready for dispatch',
                  },
                  {
                    event: 'order.shipped',
                    group: 'Order',
                    desc: 'Tracking number assigned — order dispatched',
                  },
                  {
                    event: 'order.delivered',
                    group: 'Order',
                    desc: 'Order delivered to the customer',
                  },
                  {
                    event: 'order.cancelled',
                    group: 'Order',
                    desc: 'Order cancelled before or after fulfillment',
                  },
                  {
                    event: 'product.updated',
                    group: 'Catalog',
                    desc: 'Product details or pricing changed — sync your cache',
                  },
                  {
                    event: 'inventory.updated',
                    group: 'Catalog',
                    desc: 'Stock level changed — sync inventory counts',
                  },
                  {
                    event: 'collection.updated',
                    group: 'Catalog',
                    desc: 'Collection updated — refresh your listings',
                  },
                ].map((ev) => (
                  <div
                    key={ev.event}
                    className="grid grid-cols-3 gap-4 px-5 py-3.5 border-b border-[#2C2C2E] hover:bg-[#252525] transition items-center text-xs"
                  >
                    <code className="font-mono font-bold text-[#00E5FF]">{ev.event}</code>
                    <div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          ev.group === 'Order'
                            ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ev.group}
                      </span>
                    </div>
                    <span className="text-[#98989D]">{ev.desc}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Sample Payload — checkout.completed</h3>
                <div className="rounded-2xl bg-[#161616] border border-[#2C2C2E] overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2.5 bg-[#181818] border-b border-[#2C2C2E]">
                    <span className="text-xs text-[#98989D] font-mono">application/json</span>
                    <button
                      onClick={() =>
                        copy(
                          JSON.stringify(
                            {
                              event: 'checkout.completed',
                              timestamp: '2026-08-30T10:00:00Z',
                              data: {
                                orderNumber: 'ORD-98214',
                                totalAmount: 4999,
                                currency: 'INR',
                              },
                            },
                            null,
                            2,
                          ),
                          'wh-payload',
                        )
                      }
                      className="text-xs text-[#98989D] hover:text-[#00E5FF] flex items-center gap-1.5 transition font-mono"
                    >
                      {copied === 'wh-payload' ? (
                        <Check className="w-3.5 h-3.5 text-[#32D74B]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    {JSON.stringify(
                      {
                        event: 'checkout.completed',
                        timestamp: '2026-08-30T10:00:00Z',
                        data: {
                          checkoutId: 'chk_a1b2c3',
                          orderNumber: 'ORD-98214',
                          totalAmount: 4999.0,
                          currency: 'INR',
                          paymentStatus: 'PAID',
                          customer: { name: 'Ananya Sharma', email: 'ananya@example.com' },
                          shippingAddress: {
                            city: 'Chennai',
                            state: 'Tamil Nadu',
                            country: 'India',
                          },
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>

              <div className="rounded-2xl bg-[#161616] border border-[#2C2C2E] p-5 space-y-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#32D74B]" /> Webhook Signature Verification
                </div>
                <p className="text-xs text-[#98989D] leading-relaxed">
                  Every webhook HTTP POST includes an <code className="text-[#00E5FF] font-mono">X-Webhook-Secret</code> header. Always verify that this matches your registered endpoint secret token to prevent spoofed triggers.
                </p>
              </div>
            </div>
          )}

          {/* ── Error Codes ────────────────────────────────────────────────────── */}
          {activeEndpoint === '__errors' && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF453A] mb-2 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Reference
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mb-2">
                  HTTP Error Codes & Responses
                </h1>
                <p className="text-[#98989D] text-sm leading-relaxed">
                  All error responses return standard HTTP status codes and a consistent JSON payload structure.
                </p>
              </div>

              <div className="rounded-2xl bg-[#161616] border border-[#2C2C2E] p-5 font-mono text-xs leading-relaxed">
                <span className="text-[#98989D]">{'{'}</span>
                <br />
                <span className="text-[#98989D] ml-4">"error": </span>
                <span className="text-[#FF453A]">"Not Found"</span>
                <span className="text-[#98989D]">,</span>
                <br />
                <span className="text-[#98989D] ml-4">"message": </span>
                <span className="text-amber-400">"Product 'abc' not found."</span>
                <br />
                <span className="text-[#98989D]">{'}'}</span>
              </div>

              <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                <div className="bg-[#181818] px-5 py-3 border-b border-[#2C2C2E] grid grid-cols-4 text-xs font-mono font-bold text-[#98989D] uppercase tracking-wider">
                  <span>HTTP Status</span>
                  <span>Error Field</span>
                  <span>When it occurs</span>
                  <span>Resolution</span>
                </div>
                {[
                  {
                    status: '200 OK',
                    error: '—',
                    when: 'Request succeeded',
                    fix: 'Read the data field payload',
                  },
                  {
                    status: '201 Created',
                    error: '—',
                    when: 'Resource created successfully',
                    fix: 'Read the returned entity in data',
                  },
                  {
                    status: '400 Bad Request',
                    error: '"Bad Request" / "Out of Stock"',
                    when: 'Missing required parameters, validation failure, OOS',
                    fix: 'Inspect message field for exact validation errors',
                  },
                  {
                    status: '401 Unauthorized',
                    error: '"Unauthorized"',
                    when: 'Missing or invalid API key / customer token',
                    fix: 'Provide valid X-Storefront-Key or Bearer token',
                  },
                  {
                    status: '403 Forbidden',
                    error: '"Forbidden"',
                    when: 'Tier limit exceeded or scope disallowed',
                    fix: 'Upgrade plan or verify API key permissions',
                  },
                  {
                    status: '404 Not Found',
                    error: '"Not Found"',
                    when: 'Resource ID or slug does not exist in store',
                    fix: 'Verify the identifier is active and exists',
                  },
                  {
                    status: '409 Conflict',
                    error: '"Conflict"',
                    when: 'Email address already registered',
                    fix: 'Prompt customer to login instead',
                  },
                  {
                    status: '503 Service Unavailable',
                    error: '"Service Unavailable"',
                    when: 'No active store found for the API key',
                    fix: 'Ensure your store is in ACTIVE status in Settings',
                  },
                  {
                    status: '500 Internal Error',
                    error: '"Internal Server Error"',
                    when: 'Unexpected server exception',
                    fix: 'Retry with exponential backoff',
                  },
                ].map((row) => (
                  <div
                    key={row.status}
                    className="grid grid-cols-4 gap-3 px-5 py-3.5 border-b border-[#2C2C2E] hover:bg-[#252525] transition text-xs items-start"
                  >
                    <code
                      className={`font-mono font-bold ${
                        row.status.includes('200') || row.status.includes('201')
                          ? 'text-[#32D74B]'
                          : row.status.includes('4')
                            ? 'text-amber-400'
                            : 'text-[#FF453A]'
                      }`}
                    >
                      {row.status}
                    </code>
                    <code className="font-mono text-[#98989D] text-[11px]">{row.error}</code>
                    <span className="text-[#98989D]">{row.when}</span>
                    <span className="text-white">{row.fix}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Endpoint Detail ─────────────────────────────────────────────────── */}
          {activeEndpoint !== '__auth' &&
            activeEndpoint !== '__webhooks' &&
            activeEndpoint !== '__errors' &&
            currentEndpoint && (
              <div className="space-y-8">
                {/* Breadcrumb Category */}
                {SECTIONS.map((s) => {
                  const found = s.endpoints.find((e) => e.id === currentEndpoint.id);
                  if (!found) return null;
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#00E5FF]"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                      <ChevronRight className="w-3 h-3 text-[#98989D]" />
                      <span className="text-[#98989D] font-normal">{currentEndpoint.title}</span>
                    </div>
                  );
                })}

                {/* Title + Desc */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mb-2">
                    {currentEndpoint.title}
                  </h1>
                  <p className="text-[#98989D] text-sm leading-relaxed">{currentEndpoint.desc}</p>
                </div>

                {/* Method + Path Box */}
                <div className="rounded-2xl bg-[#161616] border border-[#2C2C2E] overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#2C2C2E]">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg font-mono ${METHOD_STYLES[currentEndpoint.method]}`}
                    >
                      {currentEndpoint.method}
                    </span>
                    <code className="font-mono text-white text-xs sm:text-sm flex-1 min-w-[200px]">
                      {BASE_URL}
                      {currentEndpoint.path}
                    </code>
                    <button
                      onClick={() => copy(`${BASE_URL}${currentEndpoint.path}`, 'path')}
                      className="text-[#98989D] hover:text-[#00E5FF] hover:bg-[#252525] p-1.5 rounded-lg border border-[#2C2C2E] transition"
                      title="Copy URL"
                    >
                      {copied === 'path' ? (
                        <Check className="w-4 h-4 text-[#32D74B]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-3 bg-[#181818]">
                    <span className="text-xs text-[#98989D] font-mono">Authentication:</span>
                    <AuthBadge auth={currentEndpoint.auth} />
                  </div>
                </div>

                {/* Parameters Section */}
                {(currentEndpoint.pathParams ||
                  currentEndpoint.queryParams ||
                  currentEndpoint.bodyParams) && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold text-white font-sans">Parameters</h2>

                    {currentEndpoint.pathParams && (
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-bold text-[#98989D] uppercase tracking-wider">
                          Path Parameters
                        </div>
                        <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                          {currentEndpoint.pathParams.map((p, i) => (
                            <div
                              key={p.name}
                              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 py-3 text-xs ${
                                i < currentEndpoint.pathParams!.length - 1
                                  ? 'border-b border-[#2C2C2E]'
                                  : ''
                              } hover:bg-[#252525] transition`}
                            >
                              <code className="text-[#00E5FF] font-mono font-bold sm:w-32 shrink-0">
                                {p.name}
                              </code>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#98989D] font-mono">
                                    {p.type}
                                  </span>
                                  {p.required && (
                                    <span className="text-[10px] font-mono font-bold text-[#FF453A] bg-[#FF453A]/15 border border-[#FF453A]/30 px-1.5 py-0.2 rounded">
                                      required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#98989D]">{p.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentEndpoint.queryParams && (
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-bold text-[#98989D] uppercase tracking-wider">
                          Query Parameters
                        </div>
                        <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                          {currentEndpoint.queryParams.map((p, i) => (
                            <div
                              key={p.name}
                              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 py-3 text-xs ${
                                i < currentEndpoint.queryParams!.length - 1
                                  ? 'border-b border-[#2C2C2E]'
                                  : ''
                              } hover:bg-[#252525] transition`}
                            >
                              <code className="text-[#00E5FF] font-mono font-bold sm:w-36 shrink-0">
                                {p.name}
                              </code>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#98989D] font-mono">
                                    {p.type}
                                  </span>
                                  {p.required && (
                                    <span className="text-[10px] font-mono font-bold text-[#FF453A] bg-[#FF453A]/15 border border-[#FF453A]/30 px-1.5 py-0.2 rounded">
                                      required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#98989D]">{p.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentEndpoint.bodyParams && (
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-bold text-[#98989D] uppercase tracking-wider flex items-center gap-2">
                          Body Parameters{' '}
                          <span className="text-[11px] text-[#98989D] font-normal">
                            (application/json)
                          </span>
                        </div>
                        <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                          {currentEndpoint.bodyParams.map((p, i) => (
                            <div
                              key={p.name}
                              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 py-3 text-xs ${
                                i < currentEndpoint.bodyParams!.length - 1
                                  ? 'border-b border-[#2C2C2E]'
                                  : ''
                              } hover:bg-[#252525] transition`}
                            >
                              <code className="text-amber-400 font-mono font-bold sm:w-48 shrink-0">
                                {p.name}
                              </code>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#98989D] font-mono">
                                    {p.type}
                                  </span>
                                  {p.required && (
                                    <span className="text-[10px] font-mono font-bold text-[#FF453A] bg-[#FF453A]/15 border border-[#FF453A]/30 px-1.5 py-0.2 rounded">
                                      required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#98989D]">{p.desc}</p>
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
                  <div className="space-y-3">
                    <h2 className="text-base font-bold text-white font-sans">Response Fields</h2>
                    <div className="rounded-2xl border border-[#2C2C2E] bg-[#161616] overflow-hidden">
                      <div className="grid grid-cols-3 px-4 py-3 bg-[#181818] border-b border-[#2C2C2E] text-xs font-mono font-bold uppercase tracking-wider text-[#98989D]">
                        <span>Field</span>
                        <span>Type</span>
                        <span>Description</span>
                      </div>
                      {currentEndpoint.responseFields.map((rf, i) => (
                        <div
                          key={rf.field}
                          className={`grid grid-cols-3 gap-3 px-4 py-3 text-xs ${
                            i < currentEndpoint.responseFields!.length - 1
                              ? 'border-b border-[#2C2C2E]'
                              : ''
                          } hover:bg-[#252525] transition`}
                        >
                          <code className="font-mono text-[#32D74B] font-semibold">{rf.field}</code>
                          <code className="font-mono text-[#98989D]">{rf.type}</code>
                          <span className="text-[#98989D]">{rf.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Examples */}
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-white font-sans">Code Examples</h2>

                  {/* Tabs */}
                  <div className="flex gap-2 border-b border-[#2C2C2E] pb-2 overflow-x-auto">
                    {[
                      { key: 'response', label: '✅ Success Response', always: true },
                      {
                        key: 'request',
                        label: '❌ Error Response',
                        always: !!currentEndpoint.errorExample,
                      },
                      { key: 'curl', label: 'cURL', always: !!currentEndpoint.curlExample },
                      { key: 'js', label: 'JavaScript / Node', always: !!currentEndpoint.jsExample },
                    ]
                      .filter((t) => t.always)
                      .map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setTab(currentEndpoint.id, tab.key as any)}
                          className={`px-3 py-2 text-xs font-mono font-bold rounded-xl transition whitespace-nowrap border ${
                            getTab(currentEndpoint.id) === tab.key
                              ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30 shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                              : 'text-[#98989D] hover:text-white hover:bg-[#252525] border-transparent'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                  </div>

                  <div className="rounded-2xl bg-[#161616] border border-[#2C2C2E] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#181818] border-b border-[#2C2C2E]">
                      <span className="text-xs text-[#98989D] font-mono">
                        {getTab(currentEndpoint.id) === 'response'
                          ? '200 OK / 201 Created Schema'
                          : getTab(currentEndpoint.id) === 'request'
                            ? '4xx / 5xx Error Schema'
                            : getTab(currentEndpoint.id) === 'curl'
                              ? 'cURL Shell Snippet'
                              : 'JavaScript / TypeScript Fetch'}
                      </span>
                      <button
                        onClick={() => {
                          const tab = getTab(currentEndpoint.id);
                          const content =
                            tab === 'response'
                              ? JSON.stringify(currentEndpoint.successExample, null, 2)
                              : tab === 'request'
                                ? JSON.stringify(currentEndpoint.errorExample, null, 2)
                                : tab === 'curl'
                                  ? currentEndpoint.curlExample || ''
                                  : currentEndpoint.jsExample || '';
                          copy(content, `${currentEndpoint.id}-${tab}`);
                        }}
                        className="text-xs text-[#98989D] hover:text-[#00E5FF] flex items-center gap-1.5 transition font-mono"
                      >
                        {copied === `${currentEndpoint.id}-${getTab(currentEndpoint.id)}` ? (
                          <Check className="w-3.5 h-3.5 text-[#32D74B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        Copy
                      </button>
                    </div>
                    <pre
                      className={`p-5 text-xs font-mono overflow-x-auto leading-relaxed max-h-96 ${
                        getTab(currentEndpoint.id) === 'response'
                          ? 'text-[#32D74B]'
                          : getTab(currentEndpoint.id) === 'request'
                            ? 'text-[#FF453A]'
                            : 'text-slate-200'
                      }`}
                    >
                      {getTab(currentEndpoint.id) === 'response'
                        ? JSON.stringify(currentEndpoint.successExample, null, 2)
                        : getTab(currentEndpoint.id) === 'request'
                          ? JSON.stringify(currentEndpoint.errorExample || {}, null, 2)
                          : getTab(currentEndpoint.id) === 'curl'
                            ? currentEndpoint.curlExample || '# No cURL example for this endpoint'
                            : currentEndpoint.jsExample || '// No JS example for this endpoint'}
                    </pre>
                  </div>
                </div>

                {/* Prev / Next */}
                <div className="flex items-center justify-between pt-6 border-t border-[#2C2C2E]">
                  {(() => {
                    const idx = allEndpoints.findIndex((e) => e.id === currentEndpoint.id);
                    const prev = allEndpoints[idx - 1];
                    const next = allEndpoints[idx + 1];
                    return (
                      <>
                        <div>
                          {prev && (
                            <button
                              onClick={() => setActiveEndpoint(prev.id)}
                              className="flex items-center gap-2.5 text-xs text-[#98989D] hover:text-[#00E5FF] transition group"
                            >
                              <ArrowRight className="w-4 h-4 rotate-180 text-[#98989D] group-hover:text-[#00E5FF]" />
                              <div className="text-left">
                                <div className="text-[10px] uppercase font-mono tracking-wider text-[#98989D]">
                                  Previous
                                </div>
                                <div className="font-bold text-white group-hover:text-[#00E5FF]">
                                  {prev.title}
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                        <div>
                          {next && (
                            <button
                              onClick={() => setActiveEndpoint(next.id)}
                              className="flex items-center gap-2.5 text-xs text-[#98989D] hover:text-[#00E5FF] transition group"
                            >
                              <div className="text-right">
                                <div className="text-[10px] uppercase font-mono tracking-wider text-[#98989D]">
                                  Next
                                </div>
                                <div className="font-bold text-white group-hover:text-[#00E5FF]">
                                  {next.title}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#98989D] group-hover:text-[#00E5FF]" />
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
