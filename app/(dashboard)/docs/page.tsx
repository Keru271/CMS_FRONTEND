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
  FolderTree,
  Tag,
  Gift,
  Truck,
  Heart,
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
  GET: 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30 rounded-[4px]',
  POST: 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 rounded-[4px]',
  PATCH: 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30 rounded-[4px]',
  DELETE: 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/30 rounded-[4px]',
  PUT: 'bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30 rounded-[4px]',
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
    id: 'categories',
    label: 'Categories',
    icon: FolderTree,
    color: 'text-[#22D3EE]',
    endpoints: [
      {
        id: 'list-categories',
        method: 'GET',
        path: '/api/v1/categories',
        title: 'List Categories',
        desc: 'Returns a list of all active categories in the store. Includes category hierarchy with parent_id, slug, image, and description. Ideal for category grids, breadcrumbs, and catalog navigation.',
        auth: 'storefront_key',
        successExample: {
          data: [
            {
              id: 'cat_electronics',
              name: 'Electronics',
              slug: 'electronics',
              description: 'Audio, mobile accessories, and gadgets.',
              image: 'https://cdn.example.com/cat_electronics.jpg',
              parent_id: null,
              created_at: '2026-01-10T10:00:00Z',
            },
            {
              id: 'cat_headphones',
              name: 'Headphones',
              slug: 'headphones',
              description: 'Wireless and wired audio gear.',
              image: 'https://cdn.example.com/cat_headphones.jpg',
              parent_id: 'cat_electronics',
              created_at: '2026-01-12T14:30:00Z',
            },
          ],
          total: 8,
        },
        responseFields: [
          { field: 'data[].id', type: 'string', desc: 'Category unique identifier' },
          { field: 'data[].name', type: 'string', desc: 'Category display name' },
          { field: 'data[].slug', type: 'string', desc: 'URL-friendly slug' },
          { field: 'data[].description', type: 'string | null', desc: 'Category description' },
          { field: 'data[].image', type: 'string | null', desc: 'Hero image URL' },
          { field: 'data[].parent_id', type: 'string | null', desc: 'Parent category ID for nested subcategories' },
          { field: 'total', type: 'number', desc: 'Total number of categories' },
        ],
        curlExample: `curl "${BASE_URL}/api/v1/categories" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/categories', {
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY' }
});
const { data, total } = await res.json();
console.log(\`Fetched \${total} categories\`);`,
      },
      {
        id: 'get-category',
        method: 'GET',
        path: '/api/v1/categories/:id',
        title: 'Get Category',
        desc: 'Fetches details of a specific category using either its UUID ID or its URL-friendly slug.',
        auth: 'storefront_key',
        pathParams: [
          { name: 'id', type: 'string', required: true, desc: 'Category unique identifier or URL slug' },
        ],
        successExample: {
          data: {
            id: 'cat_headphones',
            name: 'Headphones',
            slug: 'headphones',
            description: 'Wireless and wired audio gear.',
            image: 'https://cdn.example.com/cat_headphones.jpg',
            parent_id: 'cat_electronics',
            created_at: '2026-01-12T14:30:00Z',
            updated_at: '2026-02-15T09:20:00Z',
          },
        },
        errorExample: {
          error: 'Not Found',
          message: 'Category "headphones" not found.',
        },
        curlExample: `curl "${BASE_URL}/api/v1/categories/headphones" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/categories/headphones', {
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY' }
});
const { data } = await res.json();`,
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
  {
    id: 'discounts',
    label: 'Discounts',
    icon: Tag,
    color: 'text-[#FBBF24]',
    endpoints: [
      {
        id: 'validate-discount',
        method: 'POST',
        path: '/api/v1/discounts/validate',
        title: 'Validate Coupon / Discount',
        desc: 'Validates a coupon code against the cart subtotal, checks start/end date eligibility, per-customer and overall usage caps, and minimum purchase thresholds. Computes total savings.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'code', type: 'string', required: true, desc: 'Discount coupon code string (e.g. SUMMER25)' },
          { name: 'cartSubtotal', type: 'number', required: true, desc: 'Current cart subtotal before discounts' },
          { name: 'productIds', type: 'string[]', desc: 'Array of product UUIDs currently in the cart' },
          { name: 'customerGroup', type: 'string', desc: 'Optional customer tier group (e.g. VIP, WHOLESALE)' },
        ],
        successExample: {
          valid: true,
          discount: {
            id: 'disc_9a8b7c',
            title: 'Summer Splash 20%',
            code: 'SUMMER25',
            discountType: 'PERCENTAGE',
            value: 20,
            freeShipping: false,
          },
          savings: 499.8,
          newSubtotal: 1999.2,
          message: 'Coupon code applied: 20% off!',
        },
        errorExample: {
          valid: false,
          message: 'Minimum order subtotal of ₹2500 required for this coupon',
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/discounts/validate" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code":"SUMMER25","cartSubtotal":2499,"productIds":["prod_abc"]}'`,
        jsExample: `const res = await fetch('${BASE_URL}/api/v1/discounts/validate', {
  method: 'POST',
  headers: { 'X-Storefront-Key': 'pk_live_YOUR_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'SUMMER25', cartSubtotal: 2499 })
});
const result = await res.json();
if (result.valid) {
  console.log(\`Discount applied: Saved ₹\${result.savings}\`);
}`,
      },
      {
        id: 'automatic-discounts',
        method: 'GET',
        path: '/api/v1/discounts/automatic',
        title: 'List Automatic Discounts',
        desc: 'Fetches all currently running automatic store discounts that do not require entering a code (e.g. Buy X Get Y, volume tiers, seasonal sitewide markdowns).',
        auth: 'storefront_key',
        successExample: {
          discounts: [
            {
              id: 'disc_auto_festive',
              title: 'Festive Flash 10% Off',
              discountType: 'PERCENTAGE',
              value: 10,
              minOrderAmount: 999,
              appliesTo: 'ALL',
            },
          ],
        },
        curlExample: `curl "${BASE_URL}/api/v1/discounts/automatic" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
      },
    ],
  },
  {
    id: 'gift-cards',
    label: 'Gift Cards',
    icon: Gift,
    color: 'text-[#A78BFA]',
    endpoints: [
      {
        id: 'check-gift-card',
        method: 'POST',
        path: '/api/v1/gift-cards/check-balance',
        title: 'Check Gift Card Balance',
        desc: 'Looks up a digital gift card by its alphanumeric redemption code and returns remaining balance, currency, active status, and expiry date.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'code', type: 'string', required: true, desc: '16-character gift card redemption code' },
        ],
        successExample: {
          valid: true,
          card: {
            code: 'GIFT-8921-4820-9124',
            balance: 1500,
            initialValue: 2000,
            currency: 'INR',
            expiresAt: '2027-12-31T23:59:59Z',
            recipientName: 'Vikram Mehta',
          },
        },
        errorExample: {
          valid: false,
          message: 'Gift card not found. Please verify the code and try again.',
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/gift-cards/check-balance" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code":"GIFT-8921-4820-9124"}'`,
      },
      {
        id: 'apply-gift-card',
        method: 'POST',
        path: '/api/v1/gift-cards/apply',
        title: 'Apply Gift Card to Order',
        desc: 'Deducts order total against the gift card balance during checkout and returns applied amount, remaining gift card balance, and remaining order payable balance.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'code', type: 'string', required: true, desc: 'Gift card code' },
          { name: 'orderTotal', type: 'number', required: true, desc: 'Total payable amount before gift card' },
        ],
        successExample: {
          success: true,
          appliedAmount: 1500,
          remainingBalance: 0,
          newTotal: 999,
          cardCode: 'GIFT-8921-4820-9124',
        },
        errorExample: {
          valid: false,
          message: 'This gift card has no remaining balance.',
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/gift-cards/apply" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code":"GIFT-8921-4820-9124","orderTotal":2499}'`,
      },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: Truck,
    color: 'text-[#4ADE80]',
    endpoints: [
      {
        id: 'check-serviceability',
        method: 'POST',
        path: '/api/v1/shipping/serviceability',
        title: 'Check Pincode Serviceability',
        desc: 'Checks if an address or pincode is serviceable by integrated logistics carriers (Shiprocket, Delhivery, Bluedart, etc.) and whether Cash on Delivery (COD) is available.',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'pincode', type: 'string', required: true, desc: 'Postal PIN code or ZIP code' },
          { name: 'country', type: 'string', desc: 'Country name (Default: India)' },
          { name: 'weightKg', type: 'number', desc: 'Estimated parcel dead weight in kg (Default: 0.5)' },
          { name: 'cod', type: 'boolean', desc: 'Whether Cash on Delivery is requested' },
        ],
        successExample: {
          success: true,
          serviceable: true,
          codAvailable: true,
          city: 'Bangalore',
          state: 'Karnataka',
          estimatedDays: 2,
          providers: [
            { provider: 'Delhivery Surface', serviceable: true, codAvailable: true, estimatedDays: 2 },
            { provider: 'BlueDart Air Express', serviceable: true, codAvailable: true, estimatedDays: 1 },
          ],
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/shipping/serviceability" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pincode":"560001","cod":true}'`,
      },
      {
        id: 'shipping-quotes',
        method: 'POST',
        path: '/api/v1/shipping/quotes',
        title: 'Get Live Rate Quotes',
        desc: 'Fetches real-time comparative courier rate quotes for checkout shipping options (Standard Ground, Express Air, Overnight).',
        auth: 'storefront_key',
        bodyParams: [
          { name: 'destination.pincode', type: 'string', required: true, desc: 'Delivery pincode' },
          { name: 'destination.city', type: 'string', desc: 'Destination city' },
          { name: 'destination.state', type: 'string', desc: 'Destination state' },
          { name: 'parcel.weightKg', type: 'number', desc: 'Weight in kg' },
        ],
        successExample: {
          quotes: [
            { id: 'rate_standard', name: 'Standard Surface (3-5 days)', rate: 60, estimatedDays: 4 },
            { id: 'rate_express', name: 'Priority Air Express (1-2 days)', rate: 140, estimatedDays: 1 },
          ],
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/shipping/quotes" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"destination":{"pincode":"600001","city":"Chennai"}}'`,
      },
      {
        id: 'track-shipment',
        method: 'GET',
        path: '/api/v1/shipping/track/:awb',
        title: 'Live Shipment Tracking',
        desc: 'Fetches current dispatch status, live checkpoint milestones, current hub location, and estimated delivery date using the Air Waybill (AWB) tracking number.',
        auth: 'storefront_key',
        pathParams: [
          { name: 'awb', type: 'string', required: true, desc: 'Air Waybill or courier consignment number' },
        ],
        successExample: {
          success: true,
          awb: 'AWB9821402914',
          carrier: 'DELHIVERY',
          status: 'IN_TRANSIT',
          currentLocation: 'Chennai Processing Hub',
          estimatedDelivery: '2026-10-31',
          milestones: [
            { status: 'MANIFESTED', location: 'Warehouse Bangalore', timestamp: '2026-10-28T09:00:00Z' },
            { status: 'PICKED_UP', location: 'Warehouse Bangalore', timestamp: '2026-10-28T14:30:00Z' },
            { status: 'IN_TRANSIT', location: 'Chennai Processing Hub', timestamp: '2026-10-29T02:15:00Z' },
          ],
        },
        curlExample: `curl "${BASE_URL}/api/v1/shipping/track/AWB9821402914" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
      },
    ],
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Heart,
    color: 'text-[#F87171]',
    endpoints: [
      {
        id: 'get-wishlist',
        method: 'GET',
        path: '/api/v1/wishlist',
        title: 'Get Customer Wishlist',
        desc: 'Retrieves the saved wishlist items for the authenticated customer or specified customer email.',
        auth: 'both',
        queryParams: [
          { name: 'email', type: 'string', desc: 'Customer email (if not using customer_token Bearer header)' },
        ],
        successExample: {
          wishlist: [
            {
              id: 'prod_abc',
              name: 'AeroPulse Headphones',
              slug: 'aeropulse-headphones',
              price: 2499,
              image: 'https://cdn.example.com/p1.jpg',
              available: true,
            },
          ],
          total: 1,
        },
        curlExample: `curl "${BASE_URL}/api/v1/wishlist" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Authorization: Bearer CUSTOMER_TOKEN"`,
      },
      {
        id: 'add-wishlist',
        method: 'POST',
        path: '/api/v1/wishlist/add',
        title: 'Add to Wishlist',
        desc: 'Saves a product to the customer wishlist.',
        auth: 'both',
        bodyParams: [
          { name: 'productId', type: 'string', required: true, desc: 'Product UUID to add to wishlist' },
          { name: 'email', type: 'string', desc: 'Customer email (if not authenticated via Bearer token)' },
        ],
        successExample: {
          success: true,
          message: 'Product added to wishlist',
          count: 2,
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/wishlist/add" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Authorization: Bearer CUSTOMER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"productId":"prod_abc"}'`,
      },
      {
        id: 'remove-wishlist',
        method: 'POST',
        path: '/api/v1/wishlist/remove',
        title: 'Remove from Wishlist',
        desc: 'Removes a specific product from the customer wishlist.',
        auth: 'both',
        bodyParams: [
          { name: 'productId', type: 'string', required: true, desc: 'Product UUID to remove' },
          { name: 'email', type: 'string', desc: 'Customer email' },
        ],
        successExample: {
          success: true,
          message: 'Product removed from wishlist',
          count: 1,
        },
        curlExample: `curl -X POST "${BASE_URL}/api/v1/wishlist/remove" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Authorization: Bearer CUSTOMER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"productId":"prod_abc"}'`,
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
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
          <Key className="w-3 h-3" /> X-Storefront-Key
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30">
          <Lock className="w-3 h-3" /> customer_token
        </span>
      </div>
    );
  if (auth === 'customer_token')
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30">
        <Lock className="w-3 h-3" /> Customer Token
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
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
      <div className="bg-[#1E293B] border border-[#334155] rounded-[8px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[4px] bg-[#0F172A] border border-[#334155] flex items-center justify-center text-[#4ADE80] shrink-0 shadow-[0_0_12px_rgba(74,222,128,0.12)]">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] font-mono tracking-tight">
                REST API Documentation
              </h1>
              <span className="px-2 py-0.5 rounded-[4px] bg-[#22D3EE]/10 text-[#22D3EE] text-xs font-mono font-semibold border border-[#22D3EE]/30">
                v1 REST
              </span>
              <span className="text-xs font-mono text-[#4ADE80] flex items-center gap-1.5 bg-[#4ADE80]/10 px-2 py-0.5 rounded-[4px] border border-[#4ADE80]/30 font-semibold shadow-[0_0_8px_rgba(74,222,128,0.1)]">
                <Activity className="w-3 h-3 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 font-sans">
              Explore public storefront endpoints, parameters, JSON response schemas, and event webhooks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/developer"
            className="px-3 py-1.5 rounded-[4px] bg-[#0F172A] hover:bg-[#334155] text-xs font-mono text-[#94A3B8] hover:text-[#F1F5F9] border border-[#334155] transition flex items-center gap-2 shadow-sm"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#22D3EE]" />
            Developer Studio
          </a>
        </div>
      </div>

      {/* ── Two Column Layout (Navigator + Main Detail) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigator Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-[8px] p-3.5 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter endpoints..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0F172A] border border-[#334155] focus:border-[#4ADE80] rounded-[4px] text-xs text-[#F1F5F9] placeholder-[#64748B] outline-none font-mono transition focus:shadow-[0_0_10px_rgba(74,222,128,0.15)]"
              />
            </div>

            <nav className="space-y-4">
              {/* Guides */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                  Getting Started
                </div>
                <button
                  onClick={() => setActiveEndpoint('__auth')}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-mono transition border ${
                    activeEndpoint === '__auth'
                      ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30 font-semibold shadow-[0_0_10px_rgba(74,222,128,0.12)]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155] border-transparent'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0 text-[#22D3EE]" />
                  <span>Authentication Guide</span>
                </button>
                <button
                  onClick={() => setActiveEndpoint('__webhooks')}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-mono transition border ${
                    activeEndpoint === '__webhooks'
                      ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30 font-semibold shadow-[0_0_10px_rgba(74,222,128,0.12)]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155] border-transparent'
                  }`}
                >
                  <Webhook className="w-3.5 h-3.5 shrink-0 text-[#A78BFA]" />
                  <span>Webhook Events</span>
                </button>
                <button
                  onClick={() => setActiveEndpoint('__errors')}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-mono transition border ${
                    activeEndpoint === '__errors'
                      ? 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/40 font-semibold shadow-[0_0_10px_rgba(248,113,113,0.15)]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155] border-transparent'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#F87171]" />
                  <span>Error Code Reference</span>
                </button>
              </div>

              {/* Endpoint Sections */}
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                      <Icon className="w-3 h-3 text-[#22D3EE]" />
                      {section.label}
                    </div>
                    <div className="space-y-1">
                      {section.endpoints.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => setActiveEndpoint(ep.id)}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-[4px] text-xs font-mono transition border ${
                            activeEndpoint === ep.id
                              ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30 font-semibold shadow-[0_0_10px_rgba(74,222,128,0.12)]'
                              : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155] border-transparent'
                          }`}
                        >
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[3px] shrink-0 ${METHOD_STYLES[ep.method] || ''}`}
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
        <main className="lg:col-span-8 xl:col-span-9 bg-[#1E293B] border border-[#334155] rounded-[8px] p-6 sm:p-8 space-y-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-w-0">
          {/* ── Auth Guide ─────────────────────────────────────────────────────── */}
          {activeEndpoint === '__auth' && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] mb-2 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Authentication
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] font-mono mb-2 tracking-tight">
                  Authenticating API Requests
                </h1>
                <p className="text-[#94A3B8] text-sm leading-relaxed font-sans">
                  The Storefront REST API uses scoped client keys and optional customer JWT tokens depending on the endpoint security profile.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#334155] bg-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#22D3EE] font-mono font-bold text-sm">
                      <Key className="w-4 h-4" /> Storefront API Key
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
                      Public Client Key
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="font-mono text-xs bg-[#0F172A] border border-[#334155] rounded-[4px] p-3 text-[#4ADE80]">
                      X-Storefront-Key: pk_live_YOUR_KEY
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
                      Keys are prefixed with <code className="text-[#22D3EE] font-mono">pk_live_</code> (production) or <code className="text-[#22D3EE] font-mono">pk_test_</code> (testing). Generate and configure your keys in{' '}
                      <a href="/developer" className="text-[#22D3EE] hover:underline font-mono font-semibold">
                        Developer Studio → API Keys
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#334155] bg-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#A78BFA] font-mono font-bold text-sm">
                      <Lock className="w-4 h-4" /> Customer JWT Token (for /customers/me)
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30">
                      Bearer Token
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="font-mono text-xs bg-[#0F172A] border border-[#334155] rounded-[4px] p-3 text-[#A78BFA]">
                      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
                      Obtained from <code className="text-[#22D3EE] font-mono">POST /api/v1/customers/login</code> or <code className="text-[#22D3EE] font-mono">POST /api/v1/customers</code>. Session tokens expire in 7 days.
                    </p>
                  </div>
                </div>

                <div className="rounded-[6px] bg-[#F87171]/10 border-l-4 border-[#F87171] border-y border-r border-[#F87171]/20 p-4 flex gap-3.5">
                  <AlertCircle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-sm font-mono font-bold text-[#F87171]">
                      Never expose merchant administrative secret keys
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
                      The <code className="text-[#F1F5F9] font-mono">X-Storefront-Key</code> is a scoped public client key — safe to bundle in storefront web apps. Never place your CMS merchant administrative tokens into client-side bundles.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-mono font-bold text-[#F1F5F9]">Complete Request Example</h3>
                  <div className="rounded-[6px] bg-[#0F172A] border border-[#334155] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#1E293B] border-b border-[#334155]">
                      <span className="text-xs text-[#64748B] font-mono">cURL Terminal</span>
                      <button
                        onClick={() =>
                          copy(
                            `curl "${BASE_URL}/api/v1/products" \\\n  -H "X-Storefront-Key: pk_live_YOUR_KEY"`,
                            'auth-curl',
                          )
                        }
                        className="text-xs text-[#94A3B8] hover:text-[#4ADE80] flex items-center gap-1.5 transition font-mono hover:bg-[#0F172A] px-2 py-1 rounded-[4px] border border-transparent hover:border-[#334155]"
                      >
                        {copied === 'auth-curl' ? (
                          <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied === 'auth-curl' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-[#4ADE80] overflow-x-auto leading-relaxed">{`curl "${BASE_URL}/api/v1/products" \\
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
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#A78BFA] mb-2 flex items-center gap-2">
                  <Webhook className="w-3.5 h-3.5" /> Webhooks
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] font-mono mb-2 tracking-tight">
                  Webhook Event Reference
                </h1>
                <p className="text-[#94A3B8] text-sm leading-relaxed font-sans">
                  Subscribe to real-time asynchronous store events in{' '}
                  <a href="/developer" className="text-[#22D3EE] hover:underline font-mono font-semibold">
                    Developer Studio → Webhooks
                  </a>
                  . Your server endpoint receives a signed HTTP POST request with an event payload.
                </p>
              </div>

              <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                <div className="bg-[#1E293B] px-5 py-2.5 border-b border-[#334155] text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider grid grid-cols-3">
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
                    className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-[#1E293B] hover:bg-[#1E293B]/50 transition items-center text-xs"
                  >
                    <code className="font-mono font-bold text-[#22D3EE]">{ev.event}</code>
                    <div>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[4px] ${
                          ev.group === 'Order'
                            ? 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30'
                            : 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30'
                        }`}
                      >
                        {ev.group}
                      </span>
                    </div>
                    <span className="text-[#94A3B8] font-sans">{ev.desc}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-mono font-bold text-[#F1F5F9]">Sample Payload — checkout.completed</h3>
                <div className="rounded-[6px] bg-[#0F172A] border border-[#334155] overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2 bg-[#1E293B] border-b border-[#334155]">
                    <span className="text-xs text-[#64748B] font-mono">application/json</span>
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
                      className="text-xs text-[#94A3B8] hover:text-[#4ADE80] flex items-center gap-1.5 transition font-mono hover:bg-[#0F172A] px-2 py-1 rounded-[4px] border border-transparent hover:border-[#334155]"
                    >
                      {copied === 'wh-payload' ? (
                        <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#F1F5F9] overflow-x-auto leading-relaxed">
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

              <div className="rounded-[6px] bg-[#0F172A] border border-[#334155] p-5 space-y-2">
                <div className="text-sm font-mono font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#4ADE80]" /> Webhook Signature Verification
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
                  Every webhook HTTP POST includes an <code className="text-[#22D3EE] font-mono">X-Webhook-Secret</code> header. Always verify that this matches your registered endpoint secret token to prevent spoofed triggers.
                </p>
              </div>
            </div>
          )}

          {/* ── Error Codes ────────────────────────────────────────────────────── */}
          {activeEndpoint === '__errors' && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#F87171] mb-2 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Reference
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] font-mono mb-2 tracking-tight">
                  HTTP Error Codes & Responses
                </h1>
                <p className="text-[#94A3B8] text-sm leading-relaxed font-sans">
                  All error responses return standard HTTP status codes and a consistent JSON payload structure.
                </p>
              </div>

              <div className="rounded-[6px] bg-[#0F172A] border border-[#334155] p-4 font-mono text-xs leading-relaxed">
                <span className="text-[#64748B]">{'{'}</span>
                <br />
                <span className="text-[#94A3B8] ml-4">"error": </span>
                <span className="text-[#F87171]">"Not Found"</span>
                <span className="text-[#64748B]">,</span>
                <br />
                <span className="text-[#94A3B8] ml-4">"message": </span>
                <span className="text-[#FBBF24]">"Product 'abc' not found."</span>
                <br />
                <span className="text-[#64748B]">{'}'}</span>
              </div>

              <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                <div className="bg-[#1E293B] px-5 py-2.5 border-b border-[#334155] grid grid-cols-4 text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
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
                    className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-[#1E293B] hover:bg-[#1E293B]/50 transition text-xs items-start"
                  >
                    <code
                      className={`font-mono font-bold ${
                        row.status.includes('200') || row.status.includes('201')
                          ? 'text-[#4ADE80]'
                          : row.status.includes('4')
                            ? 'text-[#FBBF24]'
                            : 'text-[#F87171]'
                      }`}
                    >
                      {row.status}
                    </code>
                    <code className="font-mono text-[#94A3B8] text-[11px]">{row.error}</code>
                    <span className="text-[#94A3B8] font-sans">{row.when}</span>
                    <span className="text-[#F1F5F9] font-sans">{row.fix}</span>
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
                      className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#22D3EE]"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                      <ChevronRight className="w-3 h-3 text-[#64748B]" />
                      <span className="text-[#94A3B8] font-normal">{currentEndpoint.title}</span>
                    </div>
                  );
                })}

                {/* Title + Desc */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] font-mono mb-2 tracking-tight">
                    {currentEndpoint.title}
                  </h1>
                  <p className="text-[#94A3B8] text-sm leading-relaxed font-sans">{currentEndpoint.desc}</p>
                </div>

                {/* Method + Path Box */}
                <div className="rounded-[6px] bg-[#0F172A] border border-[#334155] overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 p-3.5 border-b border-[#334155]">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-[4px] font-mono ${METHOD_STYLES[currentEndpoint.method]}`}
                    >
                      {currentEndpoint.method}
                    </span>
                    <code className="font-mono text-[#F1F5F9] text-xs sm:text-sm flex-1 min-w-[200px]">
                      {BASE_URL}
                      {currentEndpoint.path}
                    </code>
                    <button
                      onClick={() => copy(`${BASE_URL}${currentEndpoint.path}`, 'path')}
                      className="text-[#94A3B8] hover:text-[#4ADE80] hover:bg-[#1E293B] p-1.5 rounded-[4px] border border-[#334155] transition"
                      title="Copy URL"
                    >
                      {copied === 'path' ? (
                        <Check className="w-4 h-4 text-[#4ADE80]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="px-4 py-2.5 flex items-center gap-3 bg-[#1E293B]/60">
                    <span className="text-xs text-[#64748B] font-mono">Authentication:</span>
                    <AuthBadge auth={currentEndpoint.auth} />
                  </div>
                </div>

                {/* Parameters Section */}
                {(currentEndpoint.pathParams ||
                  currentEndpoint.queryParams ||
                  currentEndpoint.bodyParams) && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold text-[#F1F5F9] font-mono">Parameters</h2>

                    {currentEndpoint.pathParams && (
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
                          Path Parameters
                        </div>
                        <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                          {currentEndpoint.pathParams.map((p, i) => (
                            <div
                              key={p.name}
                              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 py-3 text-xs ${
                                i < currentEndpoint.pathParams!.length - 1
                                  ? 'border-b border-[#1E293B]'
                                  : ''
                              } hover:bg-[#1E293B]/50 transition`}
                            >
                              <code className="text-[#22D3EE] font-mono font-bold sm:w-32 shrink-0">
                                {p.name}
                              </code>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#94A3B8] font-mono">
                                    {p.type}
                                  </span>
                                  {p.required && (
                                    <span className="text-[10px] font-mono font-bold text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/30 px-1.5 py-0.5 rounded-[4px]">
                                      required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#94A3B8] font-sans">{p.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentEndpoint.queryParams && (
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
                          Query Parameters
                        </div>
                        <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                          {currentEndpoint.queryParams.map((p, i) => (
                            <div
                              key={p.name}
                              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 py-3 text-xs ${
                                i < currentEndpoint.queryParams!.length - 1
                                  ? 'border-b border-[#1E293B]'
                                  : ''
                              } hover:bg-[#1E293B]/50 transition`}
                            >
                              <code className="text-[#22D3EE] font-mono font-bold sm:w-36 shrink-0">
                                {p.name}
                              </code>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#94A3B8] font-mono">
                                    {p.type}
                                  </span>
                                  {p.required && (
                                    <span className="text-[10px] font-mono font-bold text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/30 px-1.5 py-0.5 rounded-[4px]">
                                      required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#94A3B8] font-sans">{p.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentEndpoint.bodyParams && (
                      <div className="space-y-2">
                        <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-2">
                          Body Parameters{' '}
                          <span className="text-[11px] text-[#64748B] font-mono font-normal">
                            (application/json)
                          </span>
                        </div>
                        <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                          {currentEndpoint.bodyParams.map((p, i) => (
                            <div
                              key={p.name}
                              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 py-3 text-xs ${
                                i < currentEndpoint.bodyParams!.length - 1
                                  ? 'border-b border-[#1E293B]'
                                  : ''
                              } hover:bg-[#1E293B]/50 transition`}
                            >
                              <code className="text-[#FBBF24] font-mono font-bold sm:w-48 shrink-0">
                                {p.name}
                              </code>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#94A3B8] font-mono">
                                    {p.type}
                                  </span>
                                  {p.required && (
                                    <span className="text-[10px] font-mono font-bold text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/30 px-1.5 py-0.5 rounded-[4px]">
                                      required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#94A3B8] font-sans">{p.desc}</p>
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
                    <h2 className="text-base font-bold text-[#F1F5F9] font-mono">Response Fields</h2>
                    <div className="rounded-[6px] border border-[#334155] bg-[#0F172A] overflow-hidden">
                      <div className="grid grid-cols-3 px-4 py-2.5 bg-[#1E293B] border-b border-[#334155] text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
                        <span>Field</span>
                        <span>Type</span>
                        <span>Description</span>
                      </div>
                      {currentEndpoint.responseFields.map((rf, i) => (
                        <div
                          key={rf.field}
                          className={`grid grid-cols-3 gap-3 px-4 py-3 text-xs ${
                            i < currentEndpoint.responseFields!.length - 1
                              ? 'border-b border-[#1E293B]'
                              : ''
                          } hover:bg-[#1E293B]/50 transition`}
                        >
                          <code className="font-mono text-[#4ADE80] font-semibold">{rf.field}</code>
                          <code className="font-mono text-[#22D3EE] text-[11px]">{rf.type}</code>
                          <span className="text-[#94A3B8] font-sans">{rf.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Examples */}
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-[#F1F5F9] font-mono">Code Examples</h2>

                  {/* Tabs */}
                  <div className="flex gap-2 border-b border-[#334155] pb-2 overflow-x-auto">
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
                          className={`px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] transition whitespace-nowrap border ${
                            getTab(currentEndpoint.id) === tab.key
                              ? 'bg-[#4ADE80]/15 text-[#4ADE80] border-[#4ADE80]/40 shadow-[0_0_10px_rgba(74,222,128,0.12)]'
                              : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155] border-transparent'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                  </div>

                  <div className="rounded-[6px] bg-[#0F172A] border border-[#334155] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#1E293B] border-b border-[#334155]">
                      <span className="text-xs text-[#64748B] font-mono">
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
                        className="text-xs text-[#94A3B8] hover:text-[#4ADE80] flex items-center gap-1.5 transition font-mono hover:bg-[#0F172A] px-2 py-1 rounded-[4px] border border-transparent hover:border-[#334155]"
                      >
                        {copied === `${currentEndpoint.id}-${getTab(currentEndpoint.id)}` ? (
                          <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        Copy
                      </button>
                    </div>
                    <pre
                      className={`p-4 text-xs font-mono overflow-x-auto leading-relaxed max-h-96 ${
                        getTab(currentEndpoint.id) === 'response'
                          ? 'text-[#4ADE80]'
                          : getTab(currentEndpoint.id) === 'request'
                            ? 'text-[#F87171]'
                            : 'text-[#F1F5F9]'
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
                <div className="flex items-center justify-between pt-6 border-t border-[#334155]">
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
                              className="flex items-center gap-2.5 text-xs text-[#94A3B8] hover:text-[#4ADE80] transition group"
                            >
                              <ArrowRight className="w-4 h-4 rotate-180 text-[#64748B] group-hover:text-[#4ADE80]" />
                              <div className="text-left">
                                <div className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">
                                  Previous
                                </div>
                                <div className="font-mono font-bold text-[#F1F5F9] group-hover:text-[#4ADE80]">
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
                              className="flex items-center gap-2.5 text-xs text-[#94A3B8] hover:text-[#4ADE80] transition group"
                            >
                              <div className="text-right">
                                <div className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">
                                  Next
                                </div>
                                <div className="font-mono font-bold text-[#F1F5F9] group-hover:text-[#4ADE80]">
                                  {next.title}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#4ADE80]" />
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
