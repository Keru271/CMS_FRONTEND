import apiClient from '@/src/lib/axios';
import {
  CMSProduct,
  CMSCategory,
  CMSOrder,
  DashboardStats,
  ProductFormData,
  CategoryFormData,
  ApiResponse,
  MerchantUser,
  StoreDetails,
  StoreTemplate,
  MerchantOnboardingData,
  CheckEmailResponse,
  RegisterResponse,
  VerifyEmailResponse,
  LoginResponse,
  BackendUserResponse,
  ResendCodeResponse,
  StoreIndustryCategory,
  StoreSetupData,
  ThemeConfigData,
  CMSPageData,
  PageFormData,
  BrandData,
  CollectionData,
  ProductReviewData,
  CMSMenuData,
  CMSMenuItem,
  CMSCustomer,
  CustomerGroup,
  CMSDiscount,
  CMSShippingZone,
  ShippingRate,
  CMSShippingProvider,
  CMSTaxRegion,
  HsnSacCode,
  CMSMarketingCampaign,
  CMSPixelConfig,
  AbandonedCartData,
} from '@/src/types';

export const DEFAULT_STORE_CATEGORIES: StoreIndustryCategory[] = [
  { id: 'cat-1', name: 'Fashion & Apparel', slug: 'fashion-apparel', icon: '👗', description: 'Clothing, luxury garments, footwear and apparel.' },
  { id: 'cat-2', name: 'Tech & Electronics', slug: 'tech-electronics', icon: '💻', description: 'Smartphones, gadgets, software merch and electronics.' },
  { id: 'cat-3', name: 'Home Decor & Living', slug: 'home-living', icon: '🏠', description: 'Furniture, ceramics, lighting and living space decor.' },
  { id: 'cat-4', name: 'Beauty & Skincare', slug: 'beauty-skincare', icon: '✨', description: 'Organic cosmetics, remedies and body care products.' },
  { id: 'cat-5', name: 'Artisanal & Gourmet Food', slug: 'gourmet-food', icon: '☕', description: 'Specialty coffee beans, chocolates and organic treats.' },
  { id: 'cat-6', name: 'Fitness & Outdoor', slug: 'fitness-outdoor', icon: '🏋️', description: 'Gym equipment, sportswear and outdoor gear.' },
  { id: 'cat-7', name: 'Books & Stationery', slug: 'books-stationery', icon: '📚', description: 'Publications, journals and creative supplies.' },
];

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: 'nova-tech',
    name: 'Nova Tech & Minimal',
    tagline: 'High-tech, sleek contrast interface',
    description: 'Engineered for modern electronics, SaaS merch, and gadgets with crisp grid layouts and dark-mode accents.',
    accentColor: '#3B82F6',
    badge: 'Bestseller',
    previewImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    features: ['Dark Mode Adaptive', 'High-Res Specs Table', 'Express Drawer Checkout', 'Interactive Sticky Header'],
  },
  {
    id: 'velvet-luxury',
    name: 'Velvet Haute Couture',
    tagline: 'Elegant editorial layouts with serif typography',
    description: 'Designed for high-end fashion, luxury accessories, and premium apparel with immersive Lookbook showcases.',
    accentColor: '#EC4899',
    badge: 'Luxury',
    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    features: ['Editorial Lookbook', 'Size & Color Variant Selector', 'Full-screen Video Banner', 'VIP Customer Tier Badges'],
  },
  {
    id: 'artisan-craft',
    name: 'Artisan Craft & Studio',
    tagline: 'Warm organic tones for handcrafted goods',
    description: 'Perfect for handcrafted ceramics, coffee beans, home living decor, and sustainable artisan products.',
    accentColor: '#F59E0B',
    badge: 'Trending',
    previewImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    features: ['Maker Story Section', 'Subscription & Auto-Ship', 'Eco-Impact Score Badge', 'Customer Photo Gallery'],
  },
  {
    id: 'pulse-streetwear',
    name: 'Pulse Urban Streetwear',
    tagline: 'Bold typography, neon accents & fast drops',
    description: 'Tailored for drop-model apparel, sneakers, streetwear brands, and vibrant high-energy modern retail.',
    accentColor: '#8B5CF6',
    badge: 'New',
    previewImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    features: ['Limited Drop Countdown Timer', 'Insta-Story Reels Carousel', 'Sticky Quick Buy Bar', 'Social Proof Toast Alerts'],
  },
  {
    id: 'botanica-wellness',
    name: 'Botanica Pure Skincare',
    tagline: 'Clean pastel aesthetics for wellness & cosmetics',
    description: 'Soothing layout crafted for organic skincare, cosmetics, supplements, and holistic wellness remedies.',
    accentColor: '#10B981',
    badge: 'Popular',
    previewImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    features: ['Skin Routine Quiz', 'Clean Label Ingredients Guide', 'Auto-Replenish Subscribe', 'Before & After Slider'],
  },
];


// Mock CMS Data catalog
export const INITIAL_PRODUCTS: CMSProduct[] = [
  {
    id: 'prod-101',
    name: 'AeroPulse Wireless Headphones',
    sku: 'AUDIO-AERO-01',
    description: 'Active noise cancellation headphones with 40-hour battery life.',
    price: 199.99,
    originalPrice: 249.99,
    compareAtPrice: 249.99,
    costPrice: 85.0,
    inventory: 45,
    stockQuantity: 45,
    category: 'Electronics',
    categoryName: 'Tech & Electronics',
    brandName: 'AeroTech Lab',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    tags: ['Audio', 'Wireless'],
    createdAt: '2026-07-20',
  },
  {
    id: 'prod-102',
    name: 'Lumix Horizon Smart Fitness Watch',
    sku: 'WEAR-LUMIX-02',
    description: 'AMOLED screen fitness tracking smartwatch with heart rate & SPO2 sensors.',
    price: 149.50,
    originalPrice: 179.99,
    compareAtPrice: 179.99,
    costPrice: 60.0,
    inventory: 8,
    stockQuantity: 8,
    category: 'Electronics',
    categoryName: 'Tech & Electronics',
    brandName: 'Lumix Crafted',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
    tags: ['Fitness', 'Smartwatch'],
    createdAt: '2026-07-22',
  },
  {
    id: 'prod-103',
    name: 'UrbanCraft Minimalist Canvas Backpack',
    sku: 'BAG-URBAN-03',
    description: 'Water-resistant eco canvas backpack with padded 15.6" laptop compartment.',
    price: 68.00,
    originalPrice: 85.00,
    compareAtPrice: 85.00,
    costPrice: 28.0,
    inventory: 120,
    stockQuantity: 120,
    category: 'Fashion',
    categoryName: 'Fashion & Apparel',
    brandName: 'Velvet Atelier',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
    tags: ['Travel', 'Eco'],
    createdAt: '2026-07-25',
  },
  {
    id: 'prod-104',
    name: 'Nordic Mechanical Walnut Keyboard',
    sku: 'KEY-NORDIC-04',
    description: 'Custom hot-swappable mechanical keyboard with solid walnut chassis.',
    price: 175.00,
    originalPrice: 210.00,
    compareAtPrice: 210.00,
    costPrice: 75.0,
    inventory: 3,
    stockQuantity: 3,
    category: 'Electronics',
    categoryName: 'Tech & Electronics',
    brandName: 'AeroTech Lab',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
    tags: ['Mechanical', 'Workspace'],
    createdAt: '2026-07-28',
  },
  {
    id: 'prod-105',
    name: 'Minimalist Ceramic Coffee Dripper',
    sku: 'HOME-CERAMIC-05',
    description: 'Handcrafted stoneware pour-over dripper with thermal carafe.',
    price: 42.00,
    inventory: 0,
    stockQuantity: 0,
    category: 'Home & Living',
    categoryName: 'Home Decor & Living',
    brandName: 'Botanica Elements',
    status: 'ARCHIVED',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
    tags: ['Coffee', 'Kitchen'],
    createdAt: '2026-08-01',
  },
];

export const INITIAL_CATEGORIES: CMSCategory[] = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', productCount: 14, description: 'Gadgets, audio, and personal hardware' },
  { id: 'cat-2', name: 'Fashion', slug: 'fashion', productCount: 8, description: 'Apparel, bags, and accessories' },
  { id: 'cat-3', name: 'Home & Living', slug: 'home-living', productCount: 11, description: 'Kitchenware, lighting, and decor' },
];

export const INITIAL_ORDERS: CMSOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-98421',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    customerPhone: '+1 (555) 234-5678',
    totalAmount: 349.49,
    subtotalAmount: 299.99,
    taxAmount: 24.50,
    shippingAmount: 25.00,
    currency: 'USD',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    fulfillmentStatus: 'SHIPPED',
    itemsCount: 2,
    carrier: 'FedEx Express',
    trackingNumber: 'TRK-88912344-FEDEX',
    createdAt: '2026-08-05 14:22',
    shippingAddress: {
      name: 'Sarah Jenkins',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      country: 'United States',
    },
    items: [
      { productId: 'prod-101', productName: 'AeroPulse Wireless Headphones', sku: 'AUDIO-AERO-01', variant: 'Matte Black', quantity: 1, unitPrice: 199.99, subtotal: 199.99 },
      { productId: 'prod-103', productName: 'UrbanCraft Minimalist Backpack', sku: 'BAG-URBAN-03', variant: 'Navy Blue', quantity: 1, unitPrice: 99.99, subtotal: 99.99 },
    ],
    notes: [
      { id: 'n-1', author: 'Store Admin', text: 'Customer requested signature on delivery via FedEx.', createdAt: '2026-08-05 15:00' },
    ],
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-98422',
    customerName: 'Michael Chen',
    customerEmail: 'mchen@example.com',
    customerPhone: '+1 (555) 876-5432',
    totalAmount: 149.50,
    subtotalAmount: 135.00,
    taxAmount: 14.50,
    shippingAmount: 0.00,
    currency: 'USD',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    fulfillmentStatus: 'DELIVERED',
    itemsCount: 1,
    carrier: 'DHL Express',
    trackingNumber: 'DHL-449102-US',
    createdAt: '2026-08-05 11:15',
    shippingAddress: {
      name: 'Michael Chen',
      street: '120 Market Street, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States',
    },
    items: [
      { productId: 'prod-102', productName: 'Lumix Horizon Smart Fitness Watch', sku: 'WEAR-LUMIX-02', variant: 'Space Gray', quantity: 1, unitPrice: 149.50, subtotal: 149.50 },
    ],
    notes: [
      { id: 'n-2', author: 'Support Agent', text: 'Package left at front desk reception.', createdAt: '2026-08-07 10:30' },
    ],
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-98423',
    customerName: 'Emma Watson',
    customerEmail: 'emma.w@example.com',
    customerPhone: '+44 20 7946 0912',
    totalAmount: 175.00,
    subtotalAmount: 155.00,
    taxAmount: 20.00,
    shippingAmount: 0.00,
    currency: 'USD',
    paymentStatus: 'PAID',
    orderStatus: 'CONFIRMED',
    fulfillmentStatus: 'CONFIRMED',
    itemsCount: 1,
    createdAt: '2026-08-06 09:40',
    shippingAddress: {
      name: 'Emma Watson',
      street: '10 Downing Street',
      city: 'London',
      state: 'Greater London',
      zip: 'SW1A 2AA',
      country: 'United Kingdom',
    },
    items: [
      { productId: 'prod-104', productName: 'Nordic Mechanical Walnut Keyboard', sku: 'KEY-NORDIC-04', variant: 'Brown Switches', quantity: 1, unitPrice: 175.00, subtotal: 175.00 },
    ],
    notes: [],
  },
  {
    id: 'ord-1004',
    orderNumber: 'ORD-98424',
    customerName: 'David Miller',
    customerEmail: 'david.m@example.com',
    customerPhone: '+1 (555) 432-1098',
    totalAmount: 212.00,
    subtotalAmount: 195.00,
    taxAmount: 17.00,
    shippingAmount: 0.00,
    currency: 'USD',
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    fulfillmentStatus: 'PROCESSING',
    itemsCount: 2,
    createdAt: '2026-08-07 08:12',
    shippingAddress: {
      name: 'David Miller',
      street: '55 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zip: '33139',
      country: 'United States',
    },
    items: [
      { productId: 'prod-101', productName: 'AeroPulse Wireless Headphones', sku: 'AUDIO-AERO-01', variant: 'White', quantity: 1, unitPrice: 170.00, subtotal: 170.00 },
      { productId: 'prod-105', productName: 'Ceramic Coffee Dripper', sku: 'HOME-CERAMIC-05', variant: 'Stoneware Gray', quantity: 1, unitPrice: 42.00, subtotal: 42.00 },
    ],
    notes: [],
  },
  {
    id: 'ord-1005',
    orderNumber: 'ORD-98425',
    customerName: 'Sophia Loren',
    customerEmail: 'sophia.l@example.com',
    totalAmount: 85.00,
    subtotalAmount: 75.00,
    taxAmount: 10.00,
    shippingAmount: 0.00,
    currency: 'USD',
    paymentStatus: 'PENDING',
    orderStatus: 'PENDING',
    fulfillmentStatus: 'UNFULFILLED',
    itemsCount: 1,
    createdAt: '2026-08-08 16:05',
    shippingAddress: {
      name: 'Sophia Loren',
      street: '42 Via Roma',
      city: 'Rome',
      state: 'RM',
      zip: '00184',
      country: 'Italy',
    },
    items: [
      { productId: 'prod-103', productName: 'UrbanCraft Minimalist Canvas Backpack', sku: 'BAG-URBAN-03', variant: 'Forest Green', quantity: 1, unitPrice: 85.00, subtotal: 85.00 },
    ],
    notes: [],
  },
  {
    id: 'ord-1006',
    orderNumber: 'ORD-98426',
    customerName: 'Robert Johnson',
    customerEmail: 'robert.j@example.com',
    totalAmount: 199.99,
    subtotalAmount: 199.99,
    taxAmount: 0.00,
    shippingAmount: 0.00,
    currency: 'USD',
    paymentStatus: 'FAILED',
    orderStatus: 'CANCELLED',
    fulfillmentStatus: 'CANCELLED',
    cancellationReason: 'Payment authorization declined by card issuing bank.',
    itemsCount: 1,
    createdAt: '2026-08-04 18:30',
    items: [
      { productId: 'prod-101', productName: 'AeroPulse Wireless Headphones', sku: 'AUDIO-AERO-01', quantity: 1, unitPrice: 199.99, subtotal: 199.99 },
    ],
    notes: [
      { id: 'n-3', author: 'System Bot', text: 'Automated cancellation due to failed payment check.', createdAt: '2026-08-04 18:35' },
    ],
  },
  {
    id: 'ord-1007',
    orderNumber: 'ORD-98427',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@example.com',
    totalAmount: 149.50,
    subtotalAmount: 149.50,
    taxAmount: 0.00,
    shippingAmount: 0.00,
    currency: 'USD',
    paymentStatus: 'REFUNDED',
    orderStatus: 'REFUNDED',
    fulfillmentStatus: 'CANCELLED',
    refundAmount: 149.50,
    refundReason: 'Customer requested size exchange / order return.',
    itemsCount: 1,
    createdAt: '2026-08-02 11:20',
    items: [
      { productId: 'prod-102', productName: 'Lumix Horizon Smart Fitness Watch', sku: 'WEAR-LUMIX-02', quantity: 1, unitPrice: 149.50, subtotal: 149.50 },
    ],
    notes: [
      { id: 'n-4', author: 'Store Manager', text: 'Full refund $149.50 issued to original credit card.', createdAt: '2026-08-03 09:10' },
    ],
  },
];

let productsMemoryState = [...INITIAL_PRODUCTS];
let categoriesMemoryState = [...INITIAL_CATEGORIES];
let ordersMemoryState = [...INITIAL_ORDERS];

export const cmsService = {
  // Get Dashboard KPI Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/cms/dashboard-stats');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    const totalRev = ordersMemoryState.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
    const lowStock = productsMemoryState.filter((p) => p.stockQuantity < 10 && p.status === 'active').length;

    return {
      totalRevenue: totalRev + 12840.50,
      totalOrders: ordersMemoryState.length + 154,
      totalProducts: productsMemoryState.length,
      lowStockCount: lowStock,
      revenueGrowth: 14.8,
      ordersGrowth: 8.2,
    };
  },

  // Get Products List
  async getProducts(params?: { search?: string; category?: string; status?: string }): Promise<CMSProduct[]> {
    try {
      const response = await apiClient.get<ApiResponse<CMSProduct[]>>('/cms/products', { params });
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    let filtered = [...productsMemoryState];

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
    }

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }

    return filtered;
  },

  // Create Product via Axios
  async createProduct(formData: ProductFormData): Promise<CMSProduct> {
    try {
      const response = await apiClient.post<ApiResponse<CMSProduct>>('/cms/products', formData);
      if (response.data && response.data.data) {
        productsMemoryState.unshift(response.data.data);
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    const newProduct: CMSProduct = {
      id: `prod-${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      taxRate: formData.taxRate ? Number(formData.taxRate) : 0,
      taxable: formData.taxable !== false,
      inventory: Number(formData.inventory ?? formData.stockQuantity ?? 50),
      stockQuantity: Number(formData.stockQuantity ?? formData.inventory ?? 50),
      weight: formData.weight ? Number(formData.weight) : undefined,
      dimensions: formData.dimensions || '',
      category: formData.category || formData.categoryName || 'General',
      categoryName: formData.categoryName || formData.category || 'General',
      brandName: formData.brandName || 'Store Brand',
      collectionName: formData.collectionName || '',
      status: formData.status || 'ACTIVE',
      image: formData.image || (formData.images && formData.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      images: formData.images || [formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      tags: formData.tags ? (Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map((t) => t.trim())) : [],
      metaTitle: formData.metaTitle || '',
      metaDescription: formData.metaDescription || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    productsMemoryState.unshift(newProduct);
    return newProduct;
  },

  // Update Product via Axios
  async updateProduct(id: string, formData: ProductFormData): Promise<CMSProduct> {
    try {
      const response = await apiClient.put<ApiResponse<CMSProduct>>(`/cms/products/${id}`, formData);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    const index = productsMemoryState.findIndex((p) => p.id === id);
    if (index > -1) {
      const updated: CMSProduct = {
        ...productsMemoryState[index],
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        taxRate: formData.taxRate ? Number(formData.taxRate) : 0,
        taxable: formData.taxable !== false,
        inventory: Number(formData.inventory ?? formData.stockQuantity ?? 50),
        stockQuantity: Number(formData.stockQuantity ?? formData.inventory ?? 50),
        weight: formData.weight ? Number(formData.weight) : undefined,
        dimensions: formData.dimensions || '',
        category: formData.category || formData.categoryName || productsMemoryState[index].category,
        categoryName: formData.categoryName || formData.category || productsMemoryState[index].categoryName,
        brandName: formData.brandName || productsMemoryState[index].brandName,
        collectionName: formData.collectionName || productsMemoryState[index].collectionName,
        status: formData.status || productsMemoryState[index].status,
        image: formData.image || (formData.images && formData.images[0]) || productsMemoryState[index].image,
        images: formData.images || [formData.image || productsMemoryState[index].image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        tags: formData.tags ? (Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map((t) => t.trim())) : productsMemoryState[index].tags,
        metaTitle: formData.metaTitle || productsMemoryState[index].metaTitle,
        metaDescription: formData.metaDescription || productsMemoryState[index].metaDescription,
      };
      productsMemoryState[index] = updated;
      return updated;
    }

    throw new Error('Product not found');
  },

  // Delete Product via Axios
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/cms/products/${id}`);
    } catch {
      // Mock fallback
    }

    productsMemoryState = productsMemoryState.filter((p) => p.id !== id);
    return true;
  },

  // Get Categories
  async getCategories(): Promise<CMSCategory[]> {
    try {
      const response = await apiClient.get<ApiResponse<CMSCategory[]>>('/cms/categories');
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }
    return categoriesMemoryState;
  },

  // Create Category via Axios
  async createCategory(data: CategoryFormData): Promise<CMSCategory> {
    try {
      const response = await apiClient.post<ApiResponse<CMSCategory>>('/cms/categories', data);
      if (response.data && response.data.data) {
        categoriesMemoryState.push(response.data.data);
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    const newCategory: CMSCategory = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      productCount: 0,
      description: data.description,
    };
    categoriesMemoryState.push(newCategory);
    return newCategory;
  },

  // Get Orders
  async getOrders(): Promise<CMSOrder[]> {
    try {
      const response = await apiClient.get<ApiResponse<CMSOrder[]>>('/cms/orders');
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }
    return ordersMemoryState;
  },

  // Update Order Status via Axios
  async updateOrderStatus(id: string, orderStatus: CMSOrder['orderStatus']): Promise<CMSOrder> {
    try {
      const response = await apiClient.patch<ApiResponse<CMSOrder>>(`/cms/orders/${id}/status`, { orderStatus });
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    const index = ordersMemoryState.findIndex((o) => o.id === id);
    if (index > -1) {
      ordersMemoryState[index] = { ...ordersMemoryState[index], orderStatus, fulfillmentStatus: orderStatus as string };
      return ordersMemoryState[index];
    }
    throw new Error('Order not found');
  },

  // Update Order Tracking & Carrier
  async updateOrderTracking(id: string, carrier: string, trackingNumber: string): Promise<CMSOrder> {
    const index = ordersMemoryState.findIndex((o) => o.id === id);
    if (index > -1) {
      ordersMemoryState[index] = {
        ...ordersMemoryState[index],
        carrier,
        trackingNumber,
        orderStatus: 'SHIPPED',
        fulfillmentStatus: 'SHIPPED',
      };
      return ordersMemoryState[index];
    }
    throw new Error('Order not found');
  },

  // Refund Order
  async refundOrder(id: string, refundAmount: number, refundReason: string): Promise<CMSOrder> {
    const index = ordersMemoryState.findIndex((o) => o.id === id);
    if (index > -1) {
      const isFull = refundAmount >= ordersMemoryState[index].totalAmount;
      ordersMemoryState[index] = {
        ...ordersMemoryState[index],
        paymentStatus: isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        orderStatus: isFull ? 'REFUNDED' : ordersMemoryState[index].orderStatus,
        refundAmount,
        refundReason,
        notes: [
          ...(ordersMemoryState[index].notes || []),
          {
            id: `n-${Date.now()}`,
            author: 'Store Admin',
            text: `Issued ${isFull ? 'full' : 'partial'} refund of $${refundAmount.toFixed(2)}. Reason: ${refundReason}`,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
        ],
      };
      return ordersMemoryState[index];
    }
    throw new Error('Order not found');
  },

  // Cancel Order
  async cancelOrder(id: string, cancellationReason: string): Promise<CMSOrder> {
    const index = ordersMemoryState.findIndex((o) => o.id === id);
    if (index > -1) {
      ordersMemoryState[index] = {
        ...ordersMemoryState[index],
        orderStatus: 'CANCELLED',
        fulfillmentStatus: 'CANCELLED',
        cancellationReason,
        notes: [
          ...(ordersMemoryState[index].notes || []),
          {
            id: `n-${Date.now()}`,
            author: 'Store Admin',
            text: `Order cancelled. Reason: ${cancellationReason}`,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
        ],
      };
      return ordersMemoryState[index];
    }
    throw new Error('Order not found');
  },

  // Add Order Note
  async addOrderNote(id: string, noteText: string, author: string = 'Store Staff'): Promise<CMSOrder> {
    const index = ordersMemoryState.findIndex((o) => o.id === id);
    if (index > -1) {
      const newNote = {
        id: `n-${Date.now()}`,
        author,
        text: noteText,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      ordersMemoryState[index] = {
        ...ordersMemoryState[index],
        notes: [...(ordersMemoryState[index].notes || []), newNote],
      };
      return ordersMemoryState[index];
    }
    throw new Error('Order not found');
  },

  // Merchant & Store Onboarding Services
  getMerchantSession(): MerchantOnboardingData | null {
    if (typeof window === 'undefined') return null;
    const dataStr = localStorage.getItem('merchant_cms_session');
    if (!dataStr) return null;
    try {
      return JSON.parse(dataStr);
    } catch {
      return null;
    }
  },

  saveMerchantSession(session: MerchantOnboardingData): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_session', JSON.stringify(session));
    }
  },

  clearMerchantSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('merchant_cms_session');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('cms_pending_verification_email');
      sessionStorage.removeItem('cms_latest_verification_token');
    }
  },

  async checkEmailAvailability(email: string): Promise<CheckEmailResponse> {
    const response = await apiClient.post<CheckEmailResponse>('/users/check-email', { email });
    return response.data;
  },

  async registerMerchant(merchant: MerchantUser): Promise<RegisterResponse> {
    const fullName = `${merchant.firstName} ${merchant.lastName}`.trim();
    const response = await apiClient.post<RegisterResponse>('/users/register', {
      name: fullName || 'Merchant User',
      email: merchant.email,
      password: merchant.password,
    });

    if (response.data && response.data.verificationToken) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_latest_verification_token', response.data.verificationToken);
      }
    }

    return response.data;
  },

  async verifyMerchantEmail(email: string, token: string): Promise<VerifyEmailResponse> {
    const response = await apiClient.post<VerifyEmailResponse>('/users/verify-email', {
      email,
      token,
    });
    return response.data;
  },

  async resendVerificationCode(email: string): Promise<ResendCodeResponse> {
    const response = await apiClient.post<ResendCodeResponse>('/users/resend-code', { email });
    if (response.data && response.data.verificationToken) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_latest_verification_token', response.data.verificationToken);
      }
    }
    return response.data;
  },

  async loginMerchant(
    email: string,
    password?: string
  ): Promise<{
    requiresVerification: boolean;
    email?: string;
    verificationToken?: string | null;
    user?: MerchantUser;
    backendUser?: BackendUserResponse;
  }> {
    const response = await apiClient.post<LoginResponse>('/users/login', {
      email,
      password: password || '',
    });

    if (response.data.requiresVerification) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_pending_verification_email', response.data.email || email);
        if (response.data.verificationToken) {
          sessionStorage.setItem('cms_latest_verification_token', response.data.verificationToken);
        }
      }
      return {
        requiresVerification: true,
        email: response.data.email || email,
        verificationToken: response.data.verificationToken,
      };
    }

    const accessToken = response.data.accessToken || '';
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', accessToken);
    }

    // Fetch full profile details
    const backendUser = await this.getCurrentUser();

    // Map backend user to MerchantUser
    const nameParts = (backendUser.name || 'Merchant Owner').split(' ');
    const firstName = nameParts[0] || 'Merchant';
    const lastName = nameParts.slice(1).join(' ') || 'Owner';

    const merchantUser: MerchantUser = {
      firstName,
      lastName,
      mobileNumber: '+1 555-0199',
      email: backendUser.email,
    };

    // Update existing local session state
    const existingSession = this.getMerchantSession();
    if (existingSession) {
      this.saveMerchantSession({
        ...existingSession,
        merchant: merchantUser,
      });
    }

    return { requiresVerification: false, user: merchantUser, backendUser };
  },

  async getCurrentUser(): Promise<BackendUserResponse> {
    const response = await apiClient.get<BackendUserResponse>('/users/me');
    return response.data;
  },

  async getStoreTemplates(): Promise<StoreTemplate[]> {
    try {
      const response = await apiClient.get<any[]>('/templates');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((tmpl) => {
          let features: string[] = [];
          if (typeof tmpl.features === 'string') {
            try {
              features = JSON.parse(tmpl.features);
            } catch {
              features = tmpl.features.split(',');
            }
          } else if (Array.isArray(tmpl.features)) {
            features = tmpl.features;
          }

          return {
            id: tmpl.id || tmpl.slug,
            slug: tmpl.slug,
            name: tmpl.name,
            tagline: tmpl.tagline || '',
            description: tmpl.description || '',
            previewImage: tmpl.previewImage || STORE_TEMPLATES[0].previewImage,
            accentColor: tmpl.accentColor || '#3B82F6',
            badge: tmpl.badge || '',
            features,
          };
        });
      }
    } catch (err) {
      console.warn('Backend templates API notice, using fallback templates:', err);
    }
    return STORE_TEMPLATES;
  },

  async getStoreCategories(): Promise<StoreIndustryCategory[]> {
    try {
      const response = await apiClient.get<StoreIndustryCategory[]>('/categories');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend categories API notice, using fallback categories:', err);
    }
    return DEFAULT_STORE_CATEGORIES;
  },

  async createStore(storeDetails: StoreDetails, templateSlug?: string): Promise<any> {
    const slug = storeDetails.storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const payload = {
      name: storeDetails.storeName,
      slug: slug || `store-${Date.now()}`,
      description: storeDetails.tagline || 'Merchant store',
      currency: storeDetails.currency || 'USD',
      templateSlug: templateSlug || 'nova-tech',
      categoryName: storeDetails.category,
    };

    try {
      const response = await apiClient.post('/stores', payload);
      return response.data;
    } catch (err: any) {
      console.warn('Backend store creation API notice:', err.response?.data?.message || err.message);
      return null;
    }
  },

  async getMerchantStores(): Promise<any[]> {
    try {
      const response = await apiClient.get('/stores');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async completeOnboarding(onboardingData: MerchantOnboardingData): Promise<MerchantOnboardingData> {
    // 1. Create merchant store on backend via POST /api/stores with template ID/slug
    const templateSlug = onboardingData.selectedTemplate?.slug || onboardingData.selectedTemplate?.id;
    const createdStore = await this.createStore(onboardingData.store, templateSlug);
    if (createdStore && createdStore.id) {
      onboardingData.store = {
        ...onboardingData.store,
        storeName: createdStore.name || onboardingData.store.storeName,
      };
    }

    // 2. If a first product was provided during onboarding, create it in the catalog
    if (onboardingData.firstProduct) {
      await this.createProduct(onboardingData.firstProduct);
    }
    this.saveMerchantSession(onboardingData);
    return onboardingData;
  },

  // Get Store Setup details
  async getStoreSetup(): Promise<StoreSetupData> {
    try {
      const response = await apiClient.get<StoreSetupData>('/stores/setup');
      if (response.data && response.data.name) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend store setup API notice, using fallback state:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_store_setup');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const session = this.getMerchantSession();
    const defaultData: StoreSetupData = {
      name: session?.store?.storeName || 'OmniStore Retail',
      slug: (session?.store?.storeName || 'omnistore-retail')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      favicon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=64&q=80',
      description: 'Official flagship online storefront offering premium products with fast global shipping.',
      contactEmail: session?.merchant?.email || 'support@omnistore.com',
      contactPhone: session?.merchant?.mobileNumber || '+1 (555) 019-2834',
      addressStreet: '742 Evergreen Terrace, Suite 100',
      addressCity: 'San Francisco',
      addressState: 'CA',
      addressZip: '94107',
      addressCountry: 'United States',
      socialFacebook: 'https://facebook.com/omnistore',
      socialInstagram: 'https://instagram.com/omnistore',
      socialTwitter: 'https://twitter.com/omnistore',
      socialLinkedin: 'https://linkedin.com/company/omnistore',
      socialYoutube: 'https://youtube.com/@omnistore',
      socialTiktok: 'https://tiktok.com/@omnistore',
      socialPinterest: 'https://pinterest.com/omnistore',
      customDomain: 'shop.omnistore.com',
      domainStatus: 'ACTIVE',
      currency: session?.store?.currency || 'USD',
      language: 'en-US',
      timezone: 'America/New_York',
    };

    return defaultData;
  },

  // Update Store Setup details
  async updateStoreSetup(data: StoreSetupData): Promise<StoreSetupData> {
    let result = data;
    try {
      const response = await apiClient.put<StoreSetupData>('/stores/setup', data);
      if (response.data && response.data.name) {
        result = response.data;
      }
    } catch (err) {
      console.warn('Backend store setup update notice, persisting locally:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_store_setup', JSON.stringify(result));
      const session = this.getMerchantSession();
      if (session) {
        session.store.storeName = result.name;
        session.store.currency = result.currency;
        if (result.contactEmail) session.store.supportEmail = result.contactEmail;
        if (result.contactPhone) session.store.supportPhone = result.contactPhone;
        this.saveMerchantSession(session);
      }
    }

    return result;
  },

  // Get Store Theme & Active Template configuration
  async getStoreTheme(): Promise<ThemeConfigData> {
    try {
      const response = await apiClient.get<any>('/stores/theme');
      if (response.data) {
        return {
          activeTemplateSlug: response.data.activeTemplateSlug || 'nova-tech',
          themePrimaryColor: response.data.themePrimaryColor || '#3B82F6',
          themeSecondaryColor: response.data.themeSecondaryColor || '#64748B',
          themeBackgroundColor: response.data.themeBackgroundColor || '#FFFFFF',
          themeTextColor: response.data.themeTextColor || '#0F172A',
          themeAccentColor: response.data.themeAccentColor || '#EC4899',
          themeHeadingFont: response.data.themeHeadingFont || 'Inter',
          themeBodyFont: response.data.themeBodyFont || 'Inter',
          themeFontSize: response.data.themeFontSize || 'md',
          themeBorderRadius: response.data.themeBorderRadius || 'md',
          themeButtonStyle: response.data.themeButtonStyle || 'solid',
          themeLayoutWidth: response.data.themeLayoutWidth || 'standard',
          headerStyle: response.data.headerStyle || 'left-aligned',
          headerSticky: response.data.headerSticky !== false,
          headerAnnouncement: response.data.headerAnnouncement || '🚀 Free shipping on orders over $50!',
          headerShowSearch: response.data.headerShowSearch !== false,
          headerShowCurrency: response.data.headerShowCurrency !== false,
          footerStyle: response.data.footerStyle || 'multi-column',
          footerCopyright: response.data.footerCopyright || '© 2026 OmniStore. All rights reserved.',
          footerShowSocial: response.data.footerShowSocial !== false,
          footerShowNewsletter: response.data.footerShowNewsletter !== false,
          footerShowPaymentBadges: response.data.footerShowPaymentBadges !== false,
        };
      }
    } catch (err) {
      console.warn('Backend store theme API notice, using local fallback:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_store_theme');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }

    const session = this.getMerchantSession();
    const activeSlug = session?.selectedTemplate?.slug || session?.selectedTemplate?.id || 'nova-tech';

    const defaultTheme: ThemeConfigData = {
      activeTemplateSlug: activeSlug,
      themePrimaryColor: session?.selectedTemplate?.accentColor || '#3B82F6',
      themeSecondaryColor: '#64748B',
      themeBackgroundColor: '#FFFFFF',
      themeTextColor: '#0F172A',
      themeAccentColor: '#EC4899',
      themeHeadingFont: 'Inter',
      themeBodyFont: 'Inter',
      themeFontSize: 'md',
      themeBorderRadius: 'md',
      themeButtonStyle: 'solid',
      themeLayoutWidth: 'standard',
      headerStyle: 'left-aligned',
      headerSticky: true,
      headerAnnouncement: '🚀 Special Launch Deal: Enjoy 15% OFF your first order with code WELCOME15!',
      headerShowSearch: true,
      headerShowCurrency: true,
      footerStyle: 'multi-column',
      footerCopyright: `© ${new Date().getFullYear()} ${session?.store?.storeName || 'OmniStore'}. All rights reserved.`,
      footerShowSocial: true,
      footerShowNewsletter: true,
      footerShowPaymentBadges: true,
    };

    return defaultTheme;
  },

  // Update Store Theme Configuration
  async updateStoreTheme(data: ThemeConfigData): Promise<ThemeConfigData> {
    let result = data;
    try {
      const response = await apiClient.put<any>('/stores/theme', data);
      if (response.data) {
        result = { ...data, activeTemplateSlug: response.data.activeTemplateSlug || data.activeTemplateSlug };
      }
    } catch (err) {
      console.warn('Backend theme update API notice, persisting locally:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_store_theme', JSON.stringify(result));
    }

    return result;
  },

  // Publish / Activate Store Layout Template
  async publishTemplate(templateSlug: string): Promise<boolean> {
    try {
      await apiClient.post('/stores/publish-template', { templateSlug });
    } catch (err) {
      console.warn('Backend publish template API notice:', err);
    }

    if (typeof window !== 'undefined') {
      const templates = await this.getStoreTemplates();
      const matched = templates.find((t) => t.slug === templateSlug || t.id === templateSlug);
      if (matched) {
        const session = this.getMerchantSession();
        if (session) {
          session.selectedTemplate = matched;
          this.saveMerchantSession(session);
        }
      }

      const existingTheme = await this.getStoreTheme();
      existingTheme.activeTemplateSlug = templateSlug;
      localStorage.setItem('merchant_cms_store_theme', JSON.stringify(existingTheme));
    }

    return true;
  },

  // Get Store Pages List
  async getPages(): Promise<CMSPageData[]> {
    try {
      const response = await apiClient.get<CMSPageData[]>('/pages');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend pages API notice, using memory fallback:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_store_pages');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultPages: CMSPageData[] = [
      { id: 'pg-1', title: 'Home', slug: '/', content: '<h1>Welcome to OmniStore</h1><p>Discover our curated collection of premium goods.</p>', pageType: 'SYSTEM', metaTitle: 'OmniStore | Official Flagship Store', metaDescription: 'Shop high quality products with express shipping.', status: 'PUBLISHED' },
      { id: 'pg-2', title: 'Products Catalog', slug: '/products', content: '<h1>Product Catalog</h1><p>Browse all available products.</p>', pageType: 'SYSTEM', metaTitle: 'All Products | OmniStore', metaDescription: 'Browse our complete catalog of electronics and fashion.', status: 'PUBLISHED' },
      { id: 'pg-3', title: 'Collections', slug: '/collections', content: '<h1>Featured Collections</h1><p>Explore curated product groupings.</p>', pageType: 'SYSTEM', metaTitle: 'Collections | OmniStore', metaDescription: 'Explore curated product collections.', status: 'PUBLISHED' },
      { id: 'pg-4', title: 'Product Details Showcase', slug: '/product/[id]', content: '<h1>Product Details</h1><p>High-resolution gallery, specs, and reviews.</p>', pageType: 'SYSTEM', metaTitle: 'Product Details | OmniStore', metaDescription: 'Product specifications and buyer reviews.', status: 'PUBLISHED' },
      { id: 'pg-5', title: 'Shopping Cart', slug: '/cart', content: '<h1>Shopping Cart</h1><p>Review items before checking out.</p>', pageType: 'SYSTEM', metaTitle: 'Shopping Cart | OmniStore', metaDescription: 'View items in your cart.', status: 'PUBLISHED' },
      { id: 'pg-6', title: 'Checkout Flow', slug: '/checkout', content: '<h1>Secure Checkout</h1><p>Enter shipping details and payment info.</p>', pageType: 'SYSTEM', metaTitle: 'Checkout | OmniStore', metaDescription: 'Complete your order securely.', status: 'PUBLISHED' },
      { id: 'pg-7', title: 'Page Not Found (404)', slug: '/404', content: '<h1>404 - Page Not Found</h1><p>The requested page could not be located.</p>', pageType: 'SYSTEM', metaTitle: '404 Not Found | OmniStore', metaDescription: 'Page not found.', status: 'PUBLISHED' },
      { id: 'pg-8', title: 'About Us', slug: '/pages/about', content: '<h2>Our Brand Story</h2><p>OmniStore delivers sustainable, premium quality merchandise directly to customers worldwide.</p>', pageType: 'BRAND', metaTitle: 'About Us | OmniStore', metaDescription: 'Learn about our story and mission.', status: 'PUBLISHED' },
      { id: 'pg-9', title: 'Contact Us', slug: '/pages/contact', content: '<h2>Contact Support</h2><p>Reach out to support@omnistore.com or call +1 555-019-2834.</p>', pageType: 'BRAND', metaTitle: 'Contact Us | OmniStore', metaDescription: 'Get in touch with customer support.', status: 'PUBLISHED' },
      { id: 'pg-10', title: 'Frequently Asked Questions (FAQ)', slug: '/pages/faq', content: '<h2>FAQ & Help Center</h2><p>Answers regarding shipping, returns, and orders.</p>', pageType: 'BRAND', metaTitle: 'FAQ | OmniStore', metaDescription: 'Frequently asked questions and support answers.', status: 'PUBLISHED' },
      { id: 'pg-11', title: 'Privacy Policy', slug: '/policies/privacy-policy', content: '<h2>Privacy Policy</h2><p>We respect customer data privacy and protection rules.</p>', pageType: 'POLICY', metaTitle: 'Privacy Policy | OmniStore', metaDescription: 'Privacy policy and cookie guidelines.', status: 'PUBLISHED' },
      { id: 'pg-12', title: 'Terms & Conditions', slug: '/policies/terms-and-conditions', content: '<h2>Terms of Service</h2><p>Terms and conditions governing store usage.</p>', pageType: 'POLICY', metaTitle: 'Terms & Conditions | OmniStore', metaDescription: 'Store terms of service.', status: 'PUBLISHED' },
      { id: 'pg-13', title: 'Shipping Policy', slug: '/policies/shipping-policy', content: '<h2>Shipping Policy</h2><p>Orders dispatched within 24-48 hours with full tracking.</p>', pageType: 'POLICY', metaTitle: 'Shipping Policy | OmniStore', metaDescription: 'Shipping rates and delivery timelines.', status: 'PUBLISHED' },
      { id: 'pg-14', title: 'Refund Policy', slug: '/policies/refund-policy', content: '<h2>Refund & Return Policy</h2><p>30-day money-back return policy on unused items.</p>', pageType: 'POLICY', metaTitle: 'Refund Policy | OmniStore', metaDescription: 'Returns and refund rules.', status: 'PUBLISHED' },
      { id: 'pg-15', title: 'Summer Lookbook 2026', slug: '/pages/summer-lookbook-2026', content: '<h2>Summer Apparel Drop</h2><p>Explore exclusive summer styles.</p>', pageType: 'CUSTOM', metaTitle: 'Summer Lookbook | OmniStore', metaDescription: 'Explore seasonal fashion drops.', status: 'PUBLISHED' },
    ];

    return defaultPages;
  },

  // Create Page via Axios
  async createPage(data: PageFormData): Promise<CMSPageData> {
    try {
      const response = await apiClient.post<CMSPageData>('/pages', data);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend page creation API notice, saving locally:', err);
    }

    const pages = await this.getPages();
    const newPage: CMSPageData = {
      id: `pg-${Date.now()}`,
      title: data.title,
      slug: data.slug,
      content: data.content,
      pageType: data.pageType || 'CUSTOM',
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || '',
      status: data.status || 'PUBLISHED',
      createdAt: new Date().toISOString(),
    };
    pages.unshift(newPage);

    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_store_pages', JSON.stringify(pages));
    }

    return newPage;
  },

  // Update Page via Axios
  async updatePage(id: string, data: PageFormData): Promise<CMSPageData> {
    try {
      const response = await apiClient.put<CMSPageData>(`/pages/${id}`, data);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend page update API notice, saving locally:', err);
    }

    const pages = await this.getPages();
    const index = pages.findIndex((p) => p.id === id || p.slug === id);
    if (index > -1) {
      const updated: CMSPageData = {
        ...pages[index],
        title: data.title,
        slug: data.slug,
        content: data.content,
        pageType: data.pageType || pages[index].pageType,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        status: data.status || pages[index].status,
        updatedAt: new Date().toISOString(),
      };
      pages[index] = updated;

      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_store_pages', JSON.stringify(pages));
      }
      return updated;
    }

    throw new Error('Page not found');
  },

  // Delete Page via Axios
  async deletePage(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/pages/${id}`);
    } catch (err) {
      console.warn('Backend page delete API notice:', err);
    }

    const pages = await this.getPages();
    const filtered = pages.filter((p) => p.id !== id && p.slug !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_store_pages', JSON.stringify(filtered));
    }

    return true;
  },

  // Brands Management
  async getBrands(): Promise<BrandData[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_brands');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultBrands: BrandData[] = [
      { id: 'b-1', name: 'AeroTech Lab', slug: 'aerotech-lab', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80', description: 'Next-gen audio & acoustic engineering.', website: 'https://aerotechlab.com', status: 'ACTIVE', productCount: 14 },
      { id: 'b-2', name: 'Velvet Atelier', slug: 'velvet-atelier', logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=200&q=80', description: 'Haute couture luxury apparel & leather goods.', website: 'https://velvetatelier.com', status: 'ACTIVE', productCount: 22 },
      { id: 'b-3', name: 'Lumix Crafted', slug: 'lumix-crafted', logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80', description: 'Minimalist smart wearable devices.', website: 'https://lumixcrafted.com', status: 'ACTIVE', productCount: 8 },
      { id: 'b-4', name: 'Botanica Elements', slug: 'botanica-elements', logo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80', description: '100% organic skincare & aromatherapy oils.', website: 'https://botanicaelements.com', status: 'ACTIVE', productCount: 18 },
    ];

    return defaultBrands;
  },

  async createBrand(brand: Partial<BrandData>): Promise<BrandData> {
    const brands = await this.getBrands();
    const newBrand: BrandData = {
      id: `b-${Date.now()}`,
      name: brand.name || 'New Brand',
      slug: brand.slug || `brand-${Date.now()}`,
      logo: brand.logo || null,
      description: brand.description || '',
      website: brand.website || '',
      status: 'ACTIVE',
      productCount: 0,
    };
    brands.unshift(newBrand);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_brands', JSON.stringify(brands));
    }
    return newBrand;
  },

  // Collections Management
  async getCollections(): Promise<CollectionData[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_collections');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultCollections: CollectionData[] = [
      {
        id: 'c-1',
        name: 'Best Sellers 2026',
        slug: 'best-sellers-2026',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
        description: 'Top rated customer favorites of the season.',
        type: 'AUTOMATIC',
        rules: [{ field: 'tag', operator: 'contains', value: 'bestseller' }],
        ruleMatch: 'ALL',
        featured: true,
        productCount: 12,
      },
      {
        id: 'c-2',
        name: 'Summer Essentials',
        slug: 'summer-essentials',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
        description: 'Lightweight garments and outdoor audio gear.',
        type: 'AUTOMATIC',
        rules: [{ field: 'tag', operator: 'contains', value: 'summer' }],
        ruleMatch: 'ANY',
        featured: true,
        productCount: 9,
      },
      {
        id: 'c-3',
        name: 'Limited Drops',
        slug: 'limited-drops',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
        description: 'Exclusive numbered capsule releases.',
        type: 'MANUAL',
        manualProductIds: ['prod-101', 'prod-104'],
        featured: false,
        productCount: 4,
      },
    ];

    return defaultCollections;
  },

  async createCollection(collection: Partial<CollectionData>): Promise<CollectionData> {
    const collections = await this.getCollections();
    const newColl: CollectionData = {
      id: `c-${Date.now()}`,
      name: collection.name || 'New Collection',
      slug: collection.slug || `collection-${Date.now()}`,
      image: collection.image || null,
      description: collection.description || '',
      type: collection.type || 'MANUAL',
      rules: collection.rules || [],
      ruleMatch: collection.ruleMatch || 'ALL',
      manualProductIds: collection.manualProductIds || [],
      featured: collection.featured || false,
      productCount: 0,
    };
    collections.unshift(newColl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_collections', JSON.stringify(collections));
    }
    return newColl;
  },

  async updateCollection(id: string, collection: Partial<CollectionData>): Promise<CollectionData> {
    const collections = await this.getCollections();
    const index = collections.findIndex((c) => c.id === id);
    if (index > -1) {
      const updated: CollectionData = {
        ...collections[index],
        ...collection,
      };
      collections[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_collections', JSON.stringify(collections));
      }
      return updated;
    }
    throw new Error('Collection not found');
  },

  // Product Reviews Moderation
  async getProductReviews(): Promise<ProductReviewData[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_product_reviews');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultReviews: ProductReviewData[] = [
      { id: 'rev-1', productId: 'p-1', productName: 'AeroPulse Wireless ANC Headphones', userName: 'Sarah Jenkins', userEmail: 'sarah.j@example.com', rating: 5, title: 'Incredible Active Noise Cancellation!', comment: 'Sound stage is wide and battery life easily lasts 35+ hours of flight time.', verified: true, status: 'APPROVED', createdAt: '2026-08-05' },
      { id: 'rev-2', productId: 'p-2', productName: 'Velvet Haute Silk Trench Coat', userName: 'Alexander Wright', userEmail: 'alex.w@example.com', rating: 5, title: 'Superb Craftsmanship & Stitching', comment: 'Fit is tailored perfectly. The silk lining feels ultra luxurious.', verified: true, status: 'APPROVED', createdAt: '2026-08-03' },
      { id: 'rev-3', productId: 'p-3', productName: 'Lumix Smart Fitness Watch', userName: 'Marcus Vance', userEmail: 'm.vance@example.com', rating: 4, title: 'Great AMOLED display & heart rate accuracy', comment: 'Pairing with iOS was seamless. Battery lasts 6 full days on standard use.', verified: true, status: 'APPROVED', createdAt: '2026-08-01' },
      { id: 'rev-4', productId: 'p-4', productName: 'Botanica Herbal Facial Serum', userName: 'Elena Rostova', userEmail: 'elena.r@example.com', rating: 5, title: 'Gentle on sensitive skin!', comment: 'Saw noticeable glow after just 3 days. Subtle natural lavender scent.', verified: true, status: 'PENDING', createdAt: '2026-08-07' },
    ];

    return defaultReviews;
  },

  async updateReviewStatus(id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED'): Promise<boolean> {
    const reviews = await this.getProductReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index > -1) {
      reviews[index].status = status;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_product_reviews', JSON.stringify(reviews));
      }
      return true;
    }
    return false;
  },

  // Navigation Menus Management
  async getMenus(): Promise<CMSMenuData[]> {
    try {
      const response = await apiClient.get<any[]>('/menus');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((m) => ({
          ...m,
          items: m.itemsJson ? JSON.parse(m.itemsJson) : [],
        }));
      }
    } catch (err) {
      console.warn('Backend menus API notice, using memory fallback:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_menus');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultMenus: CMSMenuData[] = [
      {
        id: 'm-1',
        title: 'Header Navigation Menu',
        handle: 'header-menu',
        location: 'HEADER',
        items: [
          { id: 'item-1', label: 'Home', url: '/', target: '_self' },
          {
            id: 'item-2',
            label: 'Shop',
            url: '/products',
            target: '_self',
            isMegaMenu: true,
            megaMenuConfig: {
              bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
              headline: 'New Summer Drop 2026',
              buttonLabel: 'Shop All Apparel',
              buttonUrl: '/collections/summer-essentials',
            },
            children: [
              { id: 'item-2-1', label: 'Men', url: '/collections/men', target: '_self' },
              { id: 'item-2-2', label: 'Women', url: '/collections/women', target: '_self' },
              { id: 'item-2-3', label: 'Kids', url: '/collections/kids', target: '_self' },
            ],
          },
          { id: 'item-3', label: 'About', url: '/pages/about', target: '_self' },
          { id: 'item-4', label: 'Contact', url: '/pages/contact', target: '_self' },
        ],
      },
      {
        id: 'm-2',
        title: 'Footer Quick Links Menu',
        handle: 'footer-menu',
        location: 'FOOTER',
        items: [
          { id: 'f-1', label: 'About Us', url: '/pages/about', target: '_self' },
          { id: 'f-2', label: 'Customer Support', url: '/pages/contact', target: '_self' },
          { id: 'f-3', label: 'FAQ', url: '/pages/faq', target: '_self' },
          { id: 'f-4', label: 'Privacy Policy', url: '/policies/privacy-policy', target: '_self' },
          { id: 'f-5', label: 'Terms & Conditions', url: '/policies/terms-and-conditions', target: '_self' },
          { id: 'f-6', label: 'Shipping Policy', url: '/policies/shipping-policy', target: '_self' },
          { id: 'f-7', label: 'Refund Policy', url: '/policies/refund-policy', target: '_self' },
        ],
      },
    ];

    return defaultMenus;
  },

  async createMenu(menu: { title: string; handle: string; location: string; items: CMSMenuItem[] }): Promise<CMSMenuData> {
    const payload = {
      ...menu,
      itemsJson: JSON.stringify(menu.items),
    };

    try {
      const response = await apiClient.post<any>('/menus', payload);
      if (response.data && response.data.id) {
        return {
          ...response.data,
          items: menu.items,
        };
      }
    } catch (err) {
      console.warn('Backend create menu API notice, saving locally:', err);
    }

    const menus = await this.getMenus();
    const newMenu: CMSMenuData = {
      id: `m-${Date.now()}`,
      title: menu.title,
      handle: menu.handle,
      location: menu.location,
      items: menu.items,
      createdAt: new Date().toISOString(),
    };
    menus.unshift(newMenu);

    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_menus', JSON.stringify(menus));
    }

    return newMenu;
  },

  async updateMenu(id: string, menu: { title?: string; handle?: string; location?: string; items?: CMSMenuItem[] }): Promise<CMSMenuData> {
    const payload: any = { ...menu };
    if (menu.items) {
      payload.itemsJson = JSON.stringify(menu.items);
    }

    try {
      const response = await apiClient.put<any>(`/menus/${id}`, payload);
      if (response.data && response.data.id) {
        return {
          ...response.data,
          items: menu.items || JSON.parse(response.data.itemsJson || '[]'),
        };
      }
    } catch (err) {
      console.warn('Backend update menu API notice, saving locally:', err);
    }

    const menus = await this.getMenus();
    const index = menus.findIndex((m) => m.id === id || m.handle === id);
    if (index > -1) {
      const updated: CMSMenuData = {
        ...menus[index],
        ...menu,
        items: menu.items || menus[index].items,
        updatedAt: new Date().toISOString(),
      };
      menus[index] = updated;

      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_menus', JSON.stringify(menus));
      }
      return updated;
    }

    throw new Error('Menu not found');
  },

  async deleteMenu(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/menus/${id}`);
    } catch (err) {
      console.warn('Backend delete menu API notice:', err);
    }

    const menus = await this.getMenus();
    const filtered = menus.filter((m) => m.id !== id && m.handle !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_menus', JSON.stringify(filtered));
    }

    return true;
  },

  // Customers CRM Management
  async getCustomers(): Promise<CMSCustomer[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_customers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultCustomers: CMSCustomer[] = [
      {
        id: 'cust-101',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 234-5678',
        group: 'VIP',
        tags: ['VIP', 'High-Spender', 'Newsletter'],
        totalOrders: 5,
        totalSpent: 1840.50,
        acceptsMarketing: true,
        acceptsSMSMarketing: true,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        createdAt: '2025-11-12',
        address: {
          name: 'Sarah Jenkins',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          zip: '62704',
          country: 'United States',
        },
        notes: [
          { id: 'cn-1', author: 'Store Manager', text: 'Granted VIP 15% discount perk on all high-value apparel orders.', createdAt: '2026-01-15' },
        ],
      },
      {
        id: 'cust-102',
        name: 'Michael Chen',
        email: 'mchen@example.com',
        phone: '+1 (555) 876-5432',
        group: 'RETURNING',
        tags: ['Repeat-Buyer', 'Tech-Enthusiast'],
        totalOrders: 3,
        totalSpent: 480.00,
        acceptsMarketing: true,
        acceptsSMSMarketing: false,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        createdAt: '2026-01-20',
        address: {
          name: 'Michael Chen',
          street: '120 Market Street, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'United States',
        },
        notes: [
          { id: 'cn-2', author: 'Support Staff', text: 'Customer inquired about upcoming keyboard restock.', createdAt: '2026-02-01' },
        ],
      },
      {
        id: 'cust-103',
        name: 'Emma Watson',
        email: 'emma.w@example.com',
        phone: '+44 20 7946 0912',
        group: 'NEW',
        tags: ['New-Customer', 'UK-Customer'],
        totalOrders: 1,
        totalSpent: 175.00,
        acceptsMarketing: false,
        acceptsSMSMarketing: false,
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        createdAt: '2026-08-06',
        address: {
          name: 'Emma Watson',
          street: '10 Downing Street',
          city: 'London',
          state: 'Greater London',
          zip: 'SW1A 2AA',
          country: 'United Kingdom',
        },
        notes: [],
      },
      {
        id: 'cust-104',
        name: 'David Miller (Pacific Outfitter Corp)',
        email: 'david.m@example.com',
        phone: '+1 (555) 432-1098',
        group: 'WHOLESALE',
        tags: ['Wholesale', 'B2B-Partner', 'Tax-Exempt'],
        totalOrders: 8,
        totalSpent: 3450.00,
        acceptsMarketing: true,
        acceptsSMSMarketing: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        createdAt: '2025-09-01',
        address: {
          name: 'Pacific Outfitter Corp',
          street: '55 Ocean Drive, Warehouse 4B',
          city: 'Miami',
          state: 'FL',
          zip: '33139',
          country: 'United States',
        },
        notes: [
          { id: 'cn-3', author: 'B2B Sales Desk', text: 'Verified wholesale reseller certificate and tax exemption ID #FL-99218.', createdAt: '2025-09-02' },
        ],
      },
      {
        id: 'cust-105',
        name: 'Sophia Loren',
        email: 'sophia.l@example.com',
        phone: '+39 06 69812',
        group: 'NEW',
        tags: ['New-Customer', 'International'],
        totalOrders: 1,
        totalSpent: 85.00,
        acceptsMarketing: true,
        acceptsSMSMarketing: false,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        createdAt: '2026-08-08',
        address: {
          name: 'Sophia Loren',
          street: '42 Via Roma',
          city: 'Rome',
          state: 'RM',
          zip: '00184',
          country: 'Italy',
        },
        notes: [],
      },
    ];

    return defaultCustomers;
  },

  async createCustomer(customer: Partial<CMSCustomer>): Promise<CMSCustomer> {
    const customers = await this.getCustomers();
    const newCust: CMSCustomer = {
      id: `cust-${Date.now()}`,
      name: customer.name || 'New Customer',
      email: customer.email || `customer-${Date.now()}@example.com`,
      phone: customer.phone || '',
      group: customer.group || 'NEW',
      tags: customer.tags || ['New-Customer'],
      address: customer.address || {
        name: customer.name || 'New Customer',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States',
      },
      acceptsMarketing: customer.acceptsMarketing !== false,
      acceptsSMSMarketing: customer.acceptsSMSMarketing || false,
      totalOrders: 0,
      totalSpent: 0.0,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.email || Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      notes: [],
    };

    customers.unshift(newCust);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_customers', JSON.stringify(customers));
    }
    return newCust;
  },

  async updateCustomer(id: string, customer: Partial<CMSCustomer>): Promise<CMSCustomer> {
    const customers = await this.getCustomers();
    const index = customers.findIndex((c) => c.id === id || c.email === id);
    if (index > -1) {
      const updated: CMSCustomer = {
        ...customers[index],
        ...customer,
      };
      customers[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_customers', JSON.stringify(customers));
      }
      return updated;
    }
    throw new Error('Customer not found');
  },

  async addCustomerNote(id: string, noteText: string, author: string = 'Store Staff'): Promise<CMSCustomer> {
    const customers = await this.getCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index > -1) {
      const newNote = {
        id: `cn-${Date.now()}`,
        author,
        text: noteText,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      const updated: CMSCustomer = {
        ...customers[index],
        notes: [...(customers[index].notes || []), newNote],
      };
      customers[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_customers', JSON.stringify(customers));
      }
      return updated;
    }
    throw new Error('Customer not found');
  },

  async toggleMarketingConsent(id: string, type: 'EMAIL' | 'SMS'): Promise<CMSCustomer> {
    const customers = await this.getCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index > -1) {
      const updated: CMSCustomer = {
        ...customers[index],
        acceptsMarketing: type === 'EMAIL' ? !customers[index].acceptsMarketing : customers[index].acceptsMarketing,
        acceptsSMSMarketing: type === 'SMS' ? !customers[index].acceptsSMSMarketing : customers[index].acceptsSMSMarketing,
      };
      customers[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_customers', JSON.stringify(customers));
      }
      return updated;
    }
    throw new Error('Customer not found');
  },

  // Discounts & Promotions Management
  async getDiscounts(): Promise<CMSDiscount[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_discounts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultDiscounts: CMSDiscount[] = [
      {
        id: 'disc-1',
        title: 'Summer Flash Sale 20% OFF',
        code: 'SUMMER2026',
        discountType: 'PERCENTAGE',
        method: 'COUPON_CODE',
        value: 20,
        minOrderAmount: 50.0,
        appliesTo: 'ALL',
        customerEligibility: 'ALL',
        usageLimit: 100,
        usageCount: 24,
        oncePerCustomer: true,
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        status: 'ACTIVE',
      },
      {
        id: 'disc-2',
        title: 'New Customer Welcome Voucher',
        code: 'WELCOME10',
        discountType: 'FIXED_AMOUNT',
        method: 'COUPON_CODE',
        value: 10,
        minOrderAmount: 30.0,
        appliesTo: 'ALL',
        customerEligibility: 'GROUPS',
        targetCustomers: ['NEW'],
        usageLimit: 500,
        usageCount: 88,
        oncePerCustomer: true,
        startDate: '2026-01-01',
        status: 'ACTIVE',
      },
      {
        id: 'disc-3',
        title: 'Automatic Free Express Shipping on Orders over $75',
        code: null,
        discountType: 'FREE_SHIPPING',
        method: 'AUTOMATIC',
        value: 0,
        minOrderAmount: 75.0,
        appliesTo: 'ALL',
        customerEligibility: 'ALL',
        usageCount: 142,
        oncePerCustomer: false,
        startDate: '2026-05-01',
        status: 'ACTIVE',
      },
      {
        id: 'disc-4',
        title: 'Buy 2 Audio Products Get 1 Free',
        code: 'BUY2GET1FREE',
        discountType: 'BUY_X_GET_Y',
        method: 'COUPON_CODE',
        value: 0,
        buyQuantity: 2,
        getQuantity: 1,
        getDiscountPercent: 100,
        minOrderAmount: 0,
        appliesTo: 'PRODUCTS',
        targetIds: ['prod-101', 'prod-104'],
        customerEligibility: 'ALL',
        usageLimit: 50,
        usageCount: 12,
        oncePerCustomer: true,
        startDate: '2026-07-01',
        endDate: '2026-09-01',
        status: 'ACTIVE',
      },
      {
        id: 'disc-5',
        title: 'Exclusive VIP 25% Reward',
        code: 'VIP25OFF',
        discountType: 'PERCENTAGE',
        method: 'COUPON_CODE',
        value: 25,
        minOrderAmount: 100.0,
        appliesTo: 'ALL',
        customerEligibility: 'GROUPS',
        targetCustomers: ['VIP'],
        usageLimit: 200,
        usageCount: 45,
        oncePerCustomer: true,
        startDate: '2026-01-01',
        status: 'ACTIVE',
      },
    ];

    return defaultDiscounts;
  },

  async createDiscount(discount: Partial<CMSDiscount>): Promise<CMSDiscount> {
    const discounts = await this.getDiscounts();
    const newDisc: CMSDiscount = {
      id: `disc-${Date.now()}`,
      title: discount.title || 'New Discount',
      code: discount.method === 'COUPON_CODE' ? (discount.code || `PROMO${Date.now()}`).toUpperCase() : null,
      discountType: discount.discountType || 'PERCENTAGE',
      method: discount.method || 'COUPON_CODE',
      value: Number(discount.value || 0),
      buyQuantity: discount.buyQuantity ? Number(discount.buyQuantity) : null,
      getQuantity: discount.getQuantity ? Number(discount.getQuantity) : null,
      getDiscountPercent: discount.getDiscountPercent ? Number(discount.getDiscountPercent) : null,
      minOrderAmount: discount.minOrderAmount ? Number(discount.minOrderAmount) : 0,
      appliesTo: discount.appliesTo || 'ALL',
      targetIds: discount.targetIds || [],
      customerEligibility: discount.customerEligibility || 'ALL',
      targetCustomers: discount.targetCustomers || [],
      usageLimit: discount.usageLimit ? Number(discount.usageLimit) : null,
      usageCount: 0,
      oncePerCustomer: discount.oncePerCustomer !== false,
      startDate: discount.startDate || new Date().toISOString().split('T')[0],
      endDate: discount.endDate || null,
      status: discount.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    discounts.unshift(newDisc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_discounts', JSON.stringify(discounts));
    }
    return newDisc;
  },

  async updateDiscount(id: string, discount: Partial<CMSDiscount>): Promise<CMSDiscount> {
    const discounts = await this.getDiscounts();
    const index = discounts.findIndex((d) => d.id === id);
    if (index > -1) {
      const updated: CMSDiscount = {
        ...discounts[index],
        ...discount,
      };
      discounts[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_discounts', JSON.stringify(discounts));
      }
      return updated;
    }
    throw new Error('Discount not found');
  },

  async deleteDiscount(id: string): Promise<boolean> {
    const discounts = await this.getDiscounts();
    const filtered = discounts.filter((d) => d.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_discounts', JSON.stringify(filtered));
    }
    return true;
  },

  // Shipping & Logistics Management
  async getShippingZones(): Promise<CMSShippingZone[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_shipping_zones');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultZones: CMSShippingZone[] = [
      {
        id: 'sz-1',
        name: 'Domestic - United States',
        countries: ['United States', 'Puerto Rico', 'Guam'],
        rates: [
          { id: 'sr-101', name: 'Standard Ground Shipping', type: 'FLAT', price: 5.99, minDeliveryDays: 3, maxDeliveryDays: 5 },
          { id: 'sr-102', name: 'Express Air Overnight', type: 'FLAT', price: 14.99, minDeliveryDays: 1, maxDeliveryDays: 2 },
          { id: 'sr-103', name: 'Free Economy Shipping (Orders $75+)', type: 'FREE', price: 0, minDeliveryDays: 4, maxDeliveryDays: 7, minOrderPrice: 75.0 },
          { id: 'sr-104', name: 'Heavy Package Freight (2kg - 10kg)', type: 'WEIGHT_BASED', price: 12.50, minDeliveryDays: 3, maxDeliveryDays: 6, minWeightKg: 2.0, maxWeightKg: 10.0 },
        ],
      },
      {
        id: 'sz-2',
        name: 'North America (Canada & Mexico)',
        countries: ['Canada', 'Mexico'],
        rates: [
          { id: 'sr-201', name: 'Cross-Border Standard', type: 'FLAT', price: 12.00, minDeliveryDays: 5, maxDeliveryDays: 8 },
          { id: 'sr-202', name: 'Free International Over $150', type: 'FREE', price: 0, minDeliveryDays: 5, maxDeliveryDays: 8, minOrderPrice: 150.0 },
        ],
      },
      {
        id: 'sz-3',
        name: 'European Union & UK',
        countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
        rates: [
          { id: 'sr-301', name: 'EU Priority Parcel', type: 'PRICE_BASED', price: 15.00, minDeliveryDays: 7, maxDeliveryDays: 10, minOrderPrice: 0, maxOrderPrice: 99.99 },
          { id: 'sr-302', name: 'EU Premium Expedited', type: 'FLAT', price: 24.99, minDeliveryDays: 3, maxDeliveryDays: 5 },
        ],
      },
    ];

    return defaultZones;
  },

  async createShippingZone(zone: Partial<CMSShippingZone>): Promise<CMSShippingZone> {
    const zones = await this.getShippingZones();
    const newZone: CMSShippingZone = {
      id: `sz-${Date.now()}`,
      name: zone.name || 'New Shipping Zone',
      countries: zone.countries || ['United States'],
      rates: zone.rates || [
        { id: `sr-${Date.now()}`, name: 'Standard Rate', type: 'FLAT', price: 9.99, minDeliveryDays: 3, maxDeliveryDays: 5 },
      ],
    };
    zones.push(newZone);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_shipping_zones', JSON.stringify(zones));
    }
    return newZone;
  },

  async updateShippingZone(id: string, zone: Partial<CMSShippingZone>): Promise<CMSShippingZone> {
    const zones = await this.getShippingZones();
    const index = zones.findIndex((z) => z.id === id);
    if (index > -1) {
      const updated: CMSShippingZone = {
        ...zones[index],
        ...zone,
      };
      zones[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_shipping_zones', JSON.stringify(zones));
      }
      return updated;
    }
    throw new Error('Shipping zone not found');
  },

  async deleteShippingZone(id: string): Promise<boolean> {
    const zones = await this.getShippingZones();
    const filtered = zones.filter((z) => z.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_shipping_zones', JSON.stringify(filtered));
    }
    return true;
  },

  // Shipping Providers & Carriers
  async getShippingProviders(): Promise<CMSShippingProvider[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_shipping_providers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultProviders: CMSShippingProvider[] = [
      { id: 'sp-1', name: 'FedEx Express', carrierCode: 'FEDEX', trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr={TRACKING_NUMBER}', isActive: true },
      { id: 'sp-2', name: 'DHL Express International', carrierCode: 'DHL', trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB={TRACKING_NUMBER}', isActive: true },
      { id: 'sp-3', name: 'UPS Ground Services', carrierCode: 'UPS', trackingUrl: 'https://www.ups.com/track?tracknum={TRACKING_NUMBER}', isActive: true },
      { id: 'sp-4', name: 'USPS Priority Mail', carrierCode: 'USPS', trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels={TRACKING_NUMBER}', isActive: true },
    ];

    return defaultProviders;
  },

  async updateShippingProvider(id: string, provider: Partial<CMSShippingProvider>): Promise<CMSShippingProvider> {
    const providers = await this.getShippingProviders();
    const index = providers.findIndex((p) => p.id === id);
    if (index > -1) {
      const updated: CMSShippingProvider = {
        ...providers[index],
        ...provider,
      };
      providers[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_shipping_providers', JSON.stringify(providers));
      }
      return updated;
    }
    throw new Error('Provider not found');
  },

  // Tax Regions & GST Management
  async getTaxRegions(): Promise<CMSTaxRegion[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_tax_regions');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultTaxRegions: CMSTaxRegion[] = [
      {
        id: 'tr-1',
        name: 'India (GST / IGST / CGST / SGST)',
        country: 'India',
        taxName: 'GST',
        taxNumber: '27AABCU9603R1ZM',
        standardRate: 18.0,
        reducedRate: 5.0,
        isTaxInclusive: false,
        hsnSacCodes: [
          { id: 'hsn-101', code: '61091000', description: 'Cotton T-Shirts & Knitted Apparel', taxRate: 12.0, type: 'HSN' },
          { id: 'hsn-102', code: '85183000', description: 'Headphones, Earphones & Audio Accessories', taxRate: 18.0, type: 'HSN' },
          { id: 'sac-103', code: '998313', description: 'IT Software Development & Digital Services', taxRate: 18.0, type: 'SAC' },
          { id: 'hsn-104', code: '49011010', description: 'Printed Educational Books & Journals', taxRate: 0.0, type: 'HSN' },
        ],
      },
      {
        id: 'tr-2',
        name: 'United States (State Sales Tax)',
        country: 'United States',
        taxName: 'Sales Tax',
        taxNumber: 'US-98765432',
        standardRate: 8.875,
        reducedRate: 4.0,
        isTaxInclusive: false,
        hsnSacCodes: [],
      },
      {
        id: 'tr-3',
        name: 'European Union & UK (VAT / One-Stop-Shop)',
        country: 'European Union',
        taxName: 'VAT',
        taxNumber: 'EU99988210',
        standardRate: 20.0,
        reducedRate: 7.0,
        isTaxInclusive: true,
        hsnSacCodes: [
          { id: 'hsn-201', code: 'VAT-STD', description: 'Standard VAT Goods Rate', taxRate: 20.0, type: 'HSN' },
          { id: 'hsn-202', code: 'VAT-RED', description: 'Reduced Food & Essential Goods', taxRate: 7.0, type: 'HSN' },
        ],
      },
    ];

    return defaultTaxRegions;
  },

  async createTaxRegion(region: Partial<CMSTaxRegion>): Promise<CMSTaxRegion> {
    const regions = await this.getTaxRegions();
    const newRegion: CMSTaxRegion = {
      id: `tr-${Date.now()}`,
      name: region.name || 'New Tax Region',
      country: region.country || 'United States',
      taxName: region.taxName || 'GST',
      taxNumber: region.taxNumber || '',
      standardRate: Number(region.standardRate || 18.0),
      reducedRate: Number(region.reducedRate || 5.0),
      isTaxInclusive: region.isTaxInclusive || false,
      hsnSacCodes: region.hsnSacCodes || [],
    };

    regions.push(newRegion);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_tax_regions', JSON.stringify(regions));
    }
    return newRegion;
  },

  async updateTaxRegion(id: string, region: Partial<CMSTaxRegion>): Promise<CMSTaxRegion> {
    const regions = await this.getTaxRegions();
    const index = regions.findIndex((r) => r.id === id);
    if (index > -1) {
      const updated: CMSTaxRegion = {
        ...regions[index],
        ...region,
      };
      regions[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_tax_regions', JSON.stringify(regions));
      }
      return updated;
    }
    throw new Error('Tax region not found');
  },

  async deleteTaxRegion(id: string): Promise<boolean> {
    const regions = await this.getTaxRegions();
    const filtered = regions.filter((r) => r.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_tax_regions', JSON.stringify(filtered));
    }
    return true;
  },

  // Marketing & Campaigns Management
  async getMarketingCampaigns(): Promise<CMSMarketingCampaign[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_marketing_campaigns');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultCampaigns: CMSMarketingCampaign[] = [
      {
        id: 'camp-1',
        title: 'Summer Mega Sale Blast 2026',
        channel: 'EMAIL',
        status: 'SENT',
        targetSegment: 'All Subscribers (1,240)',
        subject: '☀️ Summer Sale Starts Today: Enjoy Up to 40% OFF!',
        body: 'Explore summer apparel, headphones, and luxury accessories with exclusive promo code SUMMER2026.',
        sentCount: 1240,
        clickCount: 342,
        conversionCount: 45,
        revenueTotal: 3850.00,
        createdAt: '2026-08-01',
      },
      {
        id: 'camp-2',
        title: 'VIP High Spenders Exclusive Pass',
        channel: 'SMS',
        status: 'SENT',
        targetSegment: 'VIP Customers (280)',
        subject: 'Exclusive VIP Reward',
        body: 'Hi VIP Member! Claim your secret 25% reward voucher VIP25OFF on your next checkout.',
        sentCount: 280,
        clickCount: 112,
        conversionCount: 28,
        revenueTotal: 2450.00,
        createdAt: '2026-08-03',
      },
      {
        id: 'camp-3',
        title: 'New Audio Drops & Headphone Collection',
        channel: 'WHATSAPP',
        status: 'SENT',
        targetSegment: 'Tech Enthusiasts (450)',
        subject: 'New Drop Alert',
        body: 'Check out our newly restocked noise-cancelling wireless headphones with 1-click order support.',
        sentCount: 450,
        clickCount: 185,
        conversionCount: 32,
        revenueTotal: 1980.00,
        createdAt: '2026-08-05',
      },
      {
        id: 'camp-4',
        title: 'Abandoned Checkout Web Push Notification',
        channel: 'PUSH',
        status: 'ACTIVE',
        targetSegment: 'Cart Abandoners',
        subject: 'You left something in your bag!',
        body: 'Complete your purchase now and receive Free Express Shipping on your order.',
        sentCount: 190,
        clickCount: 64,
        conversionCount: 14,
        revenueTotal: 1120.00,
        createdAt: '2026-08-07',
      },
    ];

    return defaultCampaigns;
  },

  async createMarketingCampaign(campaign: Partial<CMSMarketingCampaign>): Promise<CMSMarketingCampaign> {
    const campaigns = await this.getMarketingCampaigns();
    const newCamp: CMSMarketingCampaign = {
      id: `camp-${Date.now()}`,
      title: campaign.title || 'New Marketing Broadcast',
      channel: campaign.channel || 'EMAIL',
      status: campaign.status || 'SENT',
      targetSegment: campaign.targetSegment || 'All Customers',
      subject: campaign.subject || '',
      body: campaign.body || '',
      sentCount: campaign.channel === 'EMAIL' ? 1240 : 450,
      clickCount: Math.floor(Math.random() * 200) + 50,
      conversionCount: Math.floor(Math.random() * 40) + 5,
      revenueTotal: Math.floor(Math.random() * 2000) + 500,
      createdAt: new Date().toISOString().split('T')[0],
    };

    campaigns.unshift(newCamp);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_marketing_campaigns', JSON.stringify(campaigns));
    }
    return newCamp;
  },

  async updateMarketingCampaign(id: string, campaign: Partial<CMSMarketingCampaign>): Promise<CMSMarketingCampaign> {
    const campaigns = await this.getMarketingCampaigns();
    const index = campaigns.findIndex((c) => c.id === id);
    if (index > -1) {
      const updated: CMSMarketingCampaign = {
        ...campaigns[index],
        ...campaign,
      };
      campaigns[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_marketing_campaigns', JSON.stringify(campaigns));
      }
      return updated;
    }
    throw new Error('Campaign not found');
  },

  async deleteMarketingCampaign(id: string): Promise<boolean> {
    const campaigns = await this.getMarketingCampaigns();
    const filtered = campaigns.filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_marketing_campaigns', JSON.stringify(filtered));
    }
    return true;
  },

  // Pixels & Integration Tracking
  async getPixelConfig(): Promise<CMSPixelConfig> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_pixel_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    return {
      ga4MeasurementId: 'G-X987654321',
      metaPixelId: '123456789012345',
      tikTokPixelId: 'C1234567890123456789',
      pinterestTagId: '2612345678901',
      isGa4Active: true,
      isMetaActive: true,
      isTikTokActive: true,
      isPinterestActive: false,
    };
  },

  async updatePixelConfig(config: CMSPixelConfig): Promise<CMSPixelConfig> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_pixel_config', JSON.stringify(config));
    }
    return config;
  },

  // Abandoned Cart Recovery Engine
  async getAbandonedCarts(): Promise<AbandonedCartData[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_abandoned_carts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback below
        }
      }
    }

    const defaultAbandoned: AbandonedCartData[] = [
      {
        id: 'ac-101',
        customerName: 'Jessica Alba',
        customerEmail: 'jessica.a@example.com',
        customerPhone: '+1 (555) 345-6789',
        itemsCount: 2,
        cartSubtotal: 185.00,
        abandonedAt: '2 hours ago',
        status: 'ABANDONED',
        recoveryDiscountCode: 'RECOVER10',
      },
      {
        id: 'ac-102',
        customerName: 'Robert Downey Jr',
        customerEmail: 'rdj@example.com',
        customerPhone: '+1 (555) 987-6543',
        itemsCount: 4,
        cartSubtotal: 340.00,
        abandonedAt: '5 hours ago',
        status: 'ABANDONED',
        recoveryDiscountCode: 'RECOVER10',
      },
      {
        id: 'ac-103',
        customerName: 'Taylor Swift',
        customerEmail: 'taylor.s@example.com',
        customerPhone: '+1 (555) 123-4567',
        itemsCount: 1,
        cartSubtotal: 95.00,
        abandonedAt: '1 day ago',
        status: 'EMAIL_SENT',
        recoveryDiscountCode: 'WELCOME10',
      },
    ];

    return defaultAbandoned;
  },

  async sendCartRecoveryEmail(id: string): Promise<AbandonedCartData> {
    const carts = await this.getAbandonedCarts();
    const index = carts.findIndex((c) => c.id === id);
    if (index > -1) {
      const updated: AbandonedCartData = {
        ...carts[index],
        status: 'EMAIL_SENT',
      };
      carts[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_abandoned_carts', JSON.stringify(carts));
      }
      return updated;
    }
    throw new Error('Cart not found');
  },
};


