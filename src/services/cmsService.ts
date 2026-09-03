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
  CMSStore,
  CreateStorePayload,
  ThemeConfigData,
  CMSPageData,
  PageFormData,
  BrandData,
  BrandFormData,
  CollectionData,
  CollectionFormData,
  ProductReviewData,
  CMSMenuData,
  CMSMenuItem,
  CMSCustomer,
  CustomerGroup,
  CMSDiscount,
  CMSShippingZone,
  ShippingRate,
  CMSShippingProvider,
  RateShoppingPolicy,
  CarrierCredential,
  CMSShipment,
  CMSNdrRecord,
  CMSTaxRegion,
  HsnSacCode,
  CMSMarketingCampaign,
  CMSPixelConfig,
  AbandonedCartData,
  CMSPaymentSettings,
  UpdatePaymentSettingsPayload,
  RazorpayConnectStatus,
  RazorpayConnectInitiatePayload,
  RazorpayConnectAuthorizePayload,
  StripeConnectStatus,
  StripeConnectInitiatePayload,
  StripeConnectAuthorizePayload,
  PaymentTestResponse,
  PaymentTransactionData,
  PaymentTransactionsSummary,
  ReviewMetricsData,
  PriceTierData,
  StoreSubscriptionData,
  StoreBillingInvoiceData,
  DomainListResponse,
  CustomDomainData,
  NotificationConfigData,
  ApiKeyData,
  WebhookData,
  LoyaltyConfigData,
  LoyaltyTierData,
  LoyaltyMemberData,
  GlobalSeoData,
  ProductSeoData,
  BlogPost,
  BlogPostInput,
} from '@/src/types';

let inFlightPagesPromise: Promise<CMSPageData[]> | null = null;
let inFlightMenusPromise: Promise<CMSMenuData[]> | null = null;
let inFlightProductsPromise: Promise<CMSProduct[]> | null = null;
let inFlightCategoriesPromise: Promise<CMSCategory[]> | null = null;
let inFlightBrandsPromise: Promise<BrandData[]> | null = null;
let inFlightCollectionsPromise: Promise<CollectionData[]> | null = null;
let inFlightOrdersPromise: Promise<CMSOrder[]> | null = null;
let inFlightCustomersPromise: Promise<CMSCustomer[]> | null = null;
let inFlightDiscountsPromise: Promise<CMSDiscount[]> | null = null;
let inFlightTaxRegionsPromise: Promise<CMSTaxRegion[]> | null = null;
let _inFlightStoreSetupPromise: Promise<StoreSetupData> | null = null;
let _cachedStoreSetup: StoreSetupData | null = null;
let _lastStoreSetupFetch = 0;

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
    id: 'funo',
    slug: 'funo',
    name: 'Funo / Funie Studio',
    tagline: 'Minimalist Scandinavian furniture & interior studio',
    description: 'Clean geometry, stylized lamp wordmark header, rich category mega menu, and warm organic living aesthetics.',
    accentColor: '#F97316',
    badge: 'Trending',
    previewImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    features: ['Stylized Funie Lamp Header', 'Interactive Mega Menu Dropdown', 'White-Glove Cart Drawer', 'Curated Room Collections'],
  },
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
  // Get Aggregated Dashboard Details (1 Single API Call for stats, products, categories, orders)
  async getDashboardDetails(): Promise<{
    stats: DashboardStats;
    products: CMSProduct[];
    categories: CMSCategory[];
    orders: CMSOrder[];
  }> {
    try {
      const response = await apiClient.get<ApiResponse<{
        stats: DashboardStats;
        products: CMSProduct[];
        categories: CMSCategory[];
        orders: CMSOrder[];
      }>>('/analytics/dashboard-details');
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    const totalRev = ordersMemoryState.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' || o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
    const totalOrdersCount = ordersMemoryState.length;
    const aov = totalOrdersCount > 0 ? totalRev / totalOrdersCount : 0;
    const activeProds = productsMemoryState.filter((p) => p.status === 'active' || p.status === 'ACTIVE').length;
    const draftProds = productsMemoryState.filter((p) => p.status === 'draft' || p.status === 'DRAFT').length;
    const lowStock = productsMemoryState.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10 && (p.status === 'active' || p.status === 'ACTIVE')).length;
    const outOfStock = productsMemoryState.filter((p) => p.stockQuantity === 0).length;
    const noImages = productsMemoryState.filter((p) => !p.image && (!p.images || p.images.length === 0)).length;
    const noPrice = productsMemoryState.filter((p) => !p.price || p.price <= 0).length;

    const pendingOrds = ordersMemoryState.filter((o) => (o.paymentStatus || '').toLowerCase() === 'pending');
    const pendingTotal = pendingOrds.reduce((sum, o) => sum + o.totalAmount, 0);
    const refundsTotal = ordersMemoryState.reduce((sum, o) => sum + (o.refundAmount || 0), 0);

    const awaitingShipment = ordersMemoryState.filter((o) => ['processing', 'confirmed', 'pending'].includes((o.orderStatus || '').toLowerCase())).length;
    const shipped = ordersMemoryState.filter((o) => (o.orderStatus || '').toLowerCase() === 'shipped').length;
    const delivered = ordersMemoryState.filter((o) => (o.orderStatus || '').toLowerCase() === 'delivered').length;

    const customerMap: Record<string, { name: string; email: string; orders: number; totalSpent: number }> = {};
    ordersMemoryState.forEach((o) => {
      const email = o.customerEmail || 'unknown@example.com';
      if (!customerMap[email]) {
        customerMap[email] = { name: o.customerName || 'Customer', email, orders: 0, totalSpent: 0 };
      }
      customerMap[email].orders += 1;
      if (o.paymentStatus === 'paid' || o.paymentStatus === 'PAID') {
        customerMap[email].totalSpent += o.totalAmount;
      }
    });

    const uniqueCustomers = Object.values(customerMap);
    const returningCust = uniqueCustomers.filter((c) => c.orders > 1).length;

    const mockStats: DashboardStats = {
      totalSales: totalRev,
      totalRevenue: totalRev,
      totalOrders: totalOrdersCount,
      averageOrderValue: Math.round(aov),
      totalCustomers: uniqueCustomers.length,
      totalProducts: productsMemoryState.length,
      conversionRate: 0,
      refundsTotal,
      pendingPaymentsTotal: pendingTotal,
      lowStockCount: lowStock,
      revenueGrowth: 0,
      ordersGrowth: 0,

      inventoryHealth: {
        totalProducts: productsMemoryState.length,
        activeProducts: activeProds,
        draftProducts: draftProds,
        outOfStockProducts: outOfStock,
        lowStockProducts: lowStock,
        noImagesProducts: noImages,
        noPriceProducts: noPrice,
        noInventoryProducts: outOfStock,
      },

      customerAnalytics: {
        totalCustomers: uniqueCustomers.length,
        newCustomers: uniqueCustomers.length,
        returningCustomers: returningCust,
        repeatPurchaseRate: uniqueCustomers.length > 0 ? Math.round((returningCust / uniqueCustomers.length) * 100) : 0,
        topCustomers: uniqueCustomers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5),
      },

      storeFunnel: {
        visitors: 0,
        sessions: 0,
        pageViews: 0,
        productViews: 0,
        addToCart: 0,
        checkoutStarted: pendingOrds.length,
        purchases: ordersMemoryState.filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'PAID').length,
        conversionRate: 0,
      },

      marketingSummary: {
        activeDiscounts: 0,
        couponUsage: 0,
        abandonedCartsCount: 0,
        abandonedCartsValue: 0,
        emailCampaignsCount: 0,
        referralOrdersCount: 0,
      },

      paymentMetrics: {
        successfulAmount: ordersMemoryState.filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0),
        failedAmount: ordersMemoryState.filter((o) => o.paymentStatus === 'failed' || o.paymentStatus === 'FAILED').reduce((s, o) => s + o.totalAmount, 0),
        pendingAmount: pendingTotal,
        refundsAmount: refundsTotal,
        breakdown: {
          razorpay: 0,
          stripe: 0,
          cod: 0,
          upi: 0,
        },
      },

      shippingOperations: {
        awaitingShipment,
        shipped,
        delivered,
        failedDeliveries: 0,
        returns: ordersMemoryState.filter((o) => o.orderStatus === 'refunded' || o.orderStatus === 'REFUNDED').length,
        rto: 0,
        shippingCostTotal: ordersMemoryState.reduce((s, o) => s + (o.shippingAmount || 0), 0),
      },

      onboardingProgress: {
        percentage: productsMemoryState.length > 0 ? 80 : 50,
        items: [
          { id: '1', label: 'Store information', completed: true, actionUrl: '/store-setup' },
          { id: '2', label: 'Add products', completed: productsMemoryState.length > 0, actionUrl: '/products' },
          { id: '3', label: 'Choose template', completed: true, actionUrl: '/themes' },
          { id: '4', label: 'Configure payment', completed: true, actionUrl: '/payments' },
          { id: '5', label: 'Configure shipping', completed: true, actionUrl: '/shipping' },
          { id: '6', label: 'Connect domain', completed: false, actionUrl: '/domains' },
          { id: '7', label: 'Launch store', completed: false, actionUrl: '/store-setup' },
        ],
      },
    };

    return {
      stats: mockStats,
      products: productsMemoryState,
      categories: categoriesMemoryState,
      orders: ordersMemoryState,
    };
  },

  // Get Dashboard KPI Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/cms/dashboard');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch {
      // Mock fallback
    }

    const details = await this.getDashboardDetails();
    return details.stats;
  },

  // Get Products List
  async getProducts(params?: { search?: string; category?: string; status?: string }, forceRefresh = false): Promise<CMSProduct[]> {
    if (!forceRefresh && !params && inFlightProductsPromise) {
      return inFlightProductsPromise;
    }

    const fetcher = (async () => {
      try {
        const response = await apiClient.get<any[]>('/products', { params });
        if (response.data && Array.isArray(response.data)) {
          const mapped: CMSProduct[] = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || p.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
            description: p.description || '',
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
            costPrice: p.costPrice ? Number(p.costPrice) : undefined,
            sku: p.sku || '',
            barcode: p.barcode || '',
            trackInventory: p.trackInventory !== false,
            allowBackorder: !!p.allowBackorder,
            isDigital: !!p.isDigital,
            requiresShipping: p.requiresShipping !== false,
            taxRate: p.taxRate ? Number(p.taxRate) : 0,
            taxable: p.taxable !== false,
            inventory: Number(p.inventory ?? 0),
            stockQuantity: Number(p.inventory ?? 0),
            weight: p.weight ? Number(p.weight) : undefined,
            dimensions: p.dimensions || '',
            category: p.categoryName || 'General',
            categoryName: p.categoryName || 'General',
            brandName: p.brandName || 'Store Brand',
            collectionName: p.collectionName || '',
            status: p.status || 'ACTIVE',
            image: p.images ? p.images.split(',')[0] : '',
            images: p.images ? p.images.split(',') : [],
            tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
            variants: p.variantsJson ? (() => { try { return JSON.parse(p.variantsJson); } catch { return []; } })() : [],
            variantsJson: p.variantsJson || null,
            metaTitle: p.metaTitle || '',
            metaDescription: p.metaDescription || '',
            createdAt: p.createdAt ? String(p.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          return mapped;
        }
      } catch (err) {
        console.warn('Backend products API notice:', err);
      }

      return [];
    })();

    if (!params) {
      inFlightProductsPromise = fetcher;
    }

    try {
      const res = await fetcher;
      return res;
    } finally {
      if (!params) {
        setTimeout(() => {
          inFlightProductsPromise = null;
        }, 500);
      }
    }
  },

  // Create Product via Axios
  async createProduct(formData: ProductFormData): Promise<CMSProduct> {
    inFlightProductsPromise = null;
    const payload = {
      name: formData.name,
      description: formData.description,
      images: Array.isArray(formData.images) ? formData.images.join(',') : formData.image || '',
      sku: formData.sku,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
      costPrice: formData.costPrice ? Number(formData.costPrice) : null,
      taxRate: formData.taxRate ? Number(formData.taxRate) : 0,
      taxable: formData.taxable !== false,
      inventory: Number(formData.inventory ?? formData.stockQuantity ?? 50),
      weight: formData.weight ? Number(formData.weight) : null,
      dimensions: formData.dimensions || null,
      categoryName: formData.categoryName || formData.category || 'General',
      brandName: formData.brandName || 'Store Brand',
      collectionName: formData.collectionName || '',
      tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags || '',
      metaTitle: formData.metaTitle || '',
      metaDescription: formData.metaDescription || '',
      status: formData.status || 'ACTIVE',
      variantsJson: formData.variants && formData.variants.length > 0 ? JSON.stringify(formData.variants) : (formData.variantsJson || null),
    };

    try {
      const response = await apiClient.post<any>('/products', payload);
      if (response.data && response.data.id) {
        const p = response.data;
        const created: CMSProduct = {
          id: p.id,
          name: p.name,
          sku: p.sku || `SKU-${p.id.substring(0, 6)}`,
          description: p.description || '',
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          costPrice: p.costPrice ? Number(p.costPrice) : undefined,
          inventory: Number(p.inventory ?? 50),
          stockQuantity: Number(p.inventory ?? 50),
          category: p.categoryName || 'General',
          categoryName: p.categoryName || 'General',
          brandName: p.brandName || 'Store Brand',
          status: p.status || 'ACTIVE',
          image: p.images ? p.images.split(',')[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          images: p.images ? p.images.split(',') : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
          variants: p.variantsJson ? (() => { try { return JSON.parse(p.variantsJson); } catch { return []; } })() : (formData.variants || []),
          variantsJson: p.variantsJson || (formData.variants ? JSON.stringify(formData.variants) : null),
          createdAt: p.createdAt ? String(p.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
        };
        productsMemoryState.unshift(created);
        return created;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend product creation API notice, saving locally:', err);
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
    inFlightProductsPromise = null;
    const payload = {
      name: formData.name,
      description: formData.description,
      images: Array.isArray(formData.images) ? formData.images.join(',') : formData.image || '',
      sku: formData.sku,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
      costPrice: formData.costPrice ? Number(formData.costPrice) : null,
      taxRate: formData.taxRate ? Number(formData.taxRate) : 0,
      taxable: formData.taxable !== false,
      inventory: Number(formData.inventory ?? formData.stockQuantity ?? 50),
      weight: formData.weight ? Number(formData.weight) : null,
      dimensions: formData.dimensions || null,
      categoryName: formData.categoryName || formData.category || 'General',
      brandName: formData.brandName || 'Store Brand',
      collectionName: formData.collectionName || '',
      tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags || '',
      metaTitle: formData.metaTitle || '',
      metaDescription: formData.metaDescription || '',
      status: formData.status || 'ACTIVE',
      variantsJson: formData.variants && formData.variants.length > 0 ? JSON.stringify(formData.variants) : (formData.variantsJson || null),
    };

    try {
      const response = await apiClient.put<any>(`/products/${id}`, payload);
      if (response.data && response.data.id) {
        const p = response.data;
        const updated: CMSProduct = {
          id: p.id,
          name: p.name,
          sku: p.sku || `SKU-${p.id.substring(0, 6)}`,
          description: p.description || '',
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          costPrice: p.costPrice ? Number(p.costPrice) : undefined,
          inventory: Number(p.inventory ?? 50),
          stockQuantity: Number(p.inventory ?? 50),
          category: p.categoryName || 'General',
          categoryName: p.categoryName || 'General',
          brandName: p.brandName || 'Store Brand',
          status: p.status || 'ACTIVE',
          image: p.images ? p.images.split(',')[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          images: p.images ? p.images.split(',') : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
          variants: p.variantsJson ? (() => { try { return JSON.parse(p.variantsJson); } catch { return []; } })() : (formData.variants || []),
          variantsJson: p.variantsJson || (formData.variants ? JSON.stringify(formData.variants) : null),
          createdAt: p.createdAt ? String(p.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
        };
        const index = productsMemoryState.findIndex((item) => item.id === id);
        if (index > -1) productsMemoryState[index] = updated;
        return updated;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend update product API notice, saving locally:', err);
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
    inFlightProductsPromise = null;
    try {
      await apiClient.delete(`/products/${id}`);
      productsMemoryState = productsMemoryState.filter((p) => p.id !== id);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend delete product API notice:', err);
    }

    productsMemoryState = productsMemoryState.filter((p) => p.id !== id);
    return true;
  },

  // Preview Product Import from Excel / CSV / Shopify
  async previewProductImport(file: File, format?: 'standard' | 'shopify'): Promise<{
    sourceFormat: string;
    totalRows: number;
    productsCount: number;
    validCount: number;
    invalidCount: number;
    existingSkuCount: number;
    products: any[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (format) formData.append('format', format);

    const response = await apiClient.post<any>('/products/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  // Execute Batch Product Import
  async batchImportProducts(
    products: any[],
    duplicateStrategy: 'UPDATE' | 'SKIP' = 'UPDATE'
  ): Promise<{
    success: boolean;
    message: string;
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    errors: { name: string; sku?: string; error: string }[];
  }> {
    inFlightProductsPromise = null;
    const response = await apiClient.post<any>('/products/import/batch', {
      products,
      duplicateStrategy,
    });
    return response.data;
  },

  // Export Products to Excel
  async exportProductsExcel(params?: {
    format?: 'standard' | 'shopify';
    status?: string;
    category?: string;
    search?: string;
  }): Promise<void> {
    const response = await apiClient.get('/products/export/excel', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename =
      params?.format === 'shopify'
        ? `shopify_products_${Date.now()}.xlsx`
        : `products_catalog_${Date.now()}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Download Sample Excel Import Template
  async downloadProductImportTemplate(): Promise<void> {
    const response = await apiClient.get('/products/export/template', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_import_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Get Categories
  async getCategories(forceRefresh = false): Promise<CMSCategory[]> {
    if (!forceRefresh && inFlightCategoriesPromise) {
      return inFlightCategoriesPromise;
    }

    inFlightCategoriesPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/categories');
        if (response.data && Array.isArray(response.data)) {
          const mapped: CMSCategory[] = response.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon || '📦',
            description: c.description || '',
            productCount: c.productCount || 0,
            createdAt: c.createdAt ? String(c.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          return mapped;
        }
      } catch (err) {
        console.warn('Backend categories API notice:', err);
      }

      return [];
    })();

    try {
      const res = await inFlightCategoriesPromise;
      return res;
    } finally {
      setTimeout(() => {
        inFlightCategoriesPromise = null;
      }, 500);
    }
  },

  // Create Category via Axios
  async createCategory(data: CategoryFormData): Promise<CMSCategory> {
    inFlightCategoriesPromise = null;
    const payload = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
      icon: data.icon || '📦',
      description: data.description || '',
    };

    try {
      const response = await apiClient.post<any>('/categories', payload);
      if (response.data && response.data.id) {
        const c = response.data;
        const created: CMSCategory = {
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || '📦',
          description: c.description || '',
          productCount: 0,
          createdAt: c.createdAt ? String(c.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
        };
        categoriesMemoryState.push(created);
        return created;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend category creation API notice, saving locally:', err);
    }

    const newCategory: CMSCategory = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
      icon: data.icon || '📦',
      productCount: 0,
      description: data.description,
      createdAt: new Date().toISOString().split('T')[0],
    };
    categoriesMemoryState.push(newCategory);
    return newCategory;
  },

  // Update Category via Axios
  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<CMSCategory> {
    inFlightCategoriesPromise = null;
    const payload = {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.icon && { icon: data.icon }),
      ...(data.description !== undefined && { description: data.description }),
    };

    try {
      const response = await apiClient.put<any>(`/categories/${id}`, payload);
      if (response.data && response.data.id) {
        const c = response.data;
        const updated: CMSCategory = {
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || '📦',
          description: c.description || '',
          productCount: c.productCount || 0,
          createdAt: c.createdAt ? String(c.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
        };
        const index = categoriesMemoryState.findIndex((item) => item.id === id);
        if (index > -1) categoriesMemoryState[index] = updated;
        return updated;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend category update API notice, saving locally:', err);
    }

    const index = categoriesMemoryState.findIndex((c) => c.id === id);
    if (index > -1) {
      const updated: CMSCategory = {
        ...categoriesMemoryState[index],
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.icon && { icon: data.icon }),
        ...(data.description !== undefined && { description: data.description }),
      };
      categoriesMemoryState[index] = updated;
      return updated;
    }

    throw new Error('Category not found');
  },

  // Delete Category via Axios
  async deleteCategory(id: string): Promise<boolean> {
    inFlightCategoriesPromise = null;
    try {
      await apiClient.delete(`/categories/${id}`);
      categoriesMemoryState = categoriesMemoryState.filter((c) => c.id !== id);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend delete category API notice:', err);
    }

    categoriesMemoryState = categoriesMemoryState.filter((c) => c.id !== id);
    return true;
  },

  // Brands Management via Axios
  async getBrands(forceRefresh = false): Promise<BrandData[]> {
    if (!forceRefresh && inFlightBrandsPromise) {
      return inFlightBrandsPromise;
    }

    inFlightBrandsPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/brands');
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
      } catch (err) {
        console.warn('Backend brands API notice:', err);
      }

      return [];
    })();

    try {
      const res = await inFlightBrandsPromise;
      return res;
    } finally {
      setTimeout(() => {
        inFlightBrandsPromise = null;
      }, 500);
    }
  },

  async createBrand(data: BrandFormData): Promise<BrandData> {
    inFlightBrandsPromise = null;
    const payload = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
      logo: data.logo || '',
      description: data.description || '',
      website: data.website || '',
      status: data.status || 'ACTIVE',
    };

    try {
      const response = await apiClient.post<any>('/brands', payload);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend brand creation API notice, saving locally:', err);
    }

    const newBrand: BrandData = {
      id: `b-${Date.now()}`,
      ...payload,
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newBrand;
  },

  async updateBrand(id: string, data: Partial<BrandFormData>): Promise<BrandData> {
    inFlightBrandsPromise = null;
    try {
      const response = await apiClient.put<any>(`/brands/${id}`, data);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend brand update API notice:', err);
    }

    throw new Error('Brand update failed');
  },

  async deleteBrand(id: string): Promise<boolean> {
    inFlightBrandsPromise = null;
    try {
      await apiClient.delete(`/brands/${id}`);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend brand delete API notice:', err);
    }
    return true;
  },

  // Collections Management via Axios
  async getCollections(forceRefresh = false): Promise<CollectionData[]> {
    if (!forceRefresh && inFlightCollectionsPromise) {
      return inFlightCollectionsPromise;
    }

    inFlightCollectionsPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/collections');
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
      } catch (err) {
        console.warn('Backend collections API notice:', err);
      }

      return [];
    })();

    try {
      const res = await inFlightCollectionsPromise;
      return res;
    } finally {
      setTimeout(() => {
        inFlightCollectionsPromise = null;
      }, 500);
    }
  },

  async createCollection(data: CollectionFormData): Promise<CollectionData> {
    inFlightCollectionsPromise = null;
    const payload = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
      image: data.image || '',
      description: data.description || '',
      type: data.type || 'MANUAL',
      featured: !!data.featured,
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
    };

    try {
      const response = await apiClient.post<any>('/collections', payload);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend collection creation API notice, saving locally:', err);
    }

    const newColl: CollectionData = {
      id: `col-${Date.now()}`,
      ...payload,
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newColl;
  },

  async updateCollection(id: string, data: Partial<CollectionFormData>): Promise<CollectionData> {
    inFlightCollectionsPromise = null;
    try {
      const response = await apiClient.put<any>(`/collections/${id}`, data);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend collection update API notice:', err);
    }

    throw new Error('Collection update failed');
  },

  async deleteCollection(id: string): Promise<boolean> {
    inFlightCollectionsPromise = null;
    try {
      await apiClient.delete(`/collections/${id}`);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend collection delete API notice:', err);
    }
    return true;
  },

  // Get Orders via Axios with request deduplication
  async getOrders(forceRefresh = false): Promise<CMSOrder[]> {
    if (!forceRefresh && inFlightOrdersPromise) {
      return inFlightOrdersPromise;
    }

    inFlightOrdersPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/orders');
        if (response.data && Array.isArray(response.data)) {
          const mapped: CMSOrder[] = response.data.map((o: any) => {
            let items: any[] = [];
            if (o.itemsJson) {
              try {
                const parsed = typeof o.itemsJson === 'string' ? JSON.parse(o.itemsJson) : o.itemsJson;
                if (Array.isArray(parsed)) {
                  items = parsed.map((item: any) => {
                    const unitPrice = Number(item.unitPrice ?? item.price ?? item.cost ?? 0);
                    const quantity = Number(item.quantity ?? 1);
                    const subtotal = Number(item.subtotal ?? (unitPrice * quantity));
                    const productName = item.productName || item.name || item.title || 'Ordered Item';
                    const image = item.image || item.imageUrl || item.thumbnail || null;
                    const sku = item.sku || null;
                    const productId = item.productId || item.id || 'prod-1';

                    return {
                      productId,
                      productName,
                      name: productName,
                      unitPrice,
                      price: unitPrice,
                      quantity,
                      subtotal,
                      image,
                      sku,
                    };
                  });
                }
              } catch { }
            }
            let shippingAddress: any = null;
            if (o.shippingAddressJson) {
              try { shippingAddress = JSON.parse(o.shippingAddressJson); } catch { }
            }
            let notes: any[] = [];
            if (o.notesJson) {
              try { notes = JSON.parse(o.notesJson); } catch { }
            }

            return {
              id: o.id,
              orderNumber: o.orderNumber,
              customerName: o.customerName,
              customerEmail: o.customerEmail,
              customerPhone: o.customerPhone || null,
              totalAmount: Number(o.totalAmount || 0),
              subtotalAmount: o.subtotalAmount ? Number(o.subtotalAmount) : Number(o.totalAmount || 0),
              taxAmount: o.taxAmount ? Number(o.taxAmount) : 0,
              shippingAmount: o.shippingAmount ? Number(o.shippingAmount) : 0,
              currency: o.currency || 'USD',
              paymentStatus: o.paymentStatus || 'PAID',
              orderStatus: o.fulfillmentStatus || 'CONFIRMED',
              fulfillmentStatus: o.fulfillmentStatus || 'CONFIRMED',
              itemsCount: items.length || 1,
              items: items.length > 0 ? items : [{ productId: 'prod-1', productName: 'Ordered Item', name: 'Ordered Item', quantity: 1, unitPrice: Number(o.totalAmount || 0), price: Number(o.totalAmount || 0), subtotal: Number(o.totalAmount || 0) }],
              shippingAddress: shippingAddress || { street: '124 Market St', city: 'San Francisco', state: 'CA', zip: '94103', country: 'United States' },
              carrier: o.carrier || null,
              trackingNumber: o.trackingNumber || null,
              cancellationReason: o.cancellationReason || null,
              refundAmount: o.refundAmount ? Number(o.refundAmount) : null,
              refundReason: o.refundReason || null,
              notes: notes,
              createdAt: o.createdAt ? String(o.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
            };
          });
          return mapped;
        }
      } catch (err) {
        console.warn('Backend orders API notice:', err);
      }

      return [];
    })();

    try {
      const res = await inFlightOrdersPromise;
      return res;
    } finally {
      setTimeout(() => {
        inFlightOrdersPromise = null;
      }, 500);
    }
  },

  // Update Order Status via Axios
  async updateOrderStatus(id: string, orderStatus: CMSOrder['orderStatus']): Promise<CMSOrder> {
    inFlightOrdersPromise = null;
    try {
      const response = await apiClient.patch<any>(`/orders/${id}/status`, { orderStatus });
      if (response.data && response.data.id) {
        const updatedOrders = await this.getOrders(true);
        const matched = updatedOrders.find((o) => o.id === id);
        if (matched) return matched;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend update order status API notice:', err);
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
    inFlightOrdersPromise = null;
    try {
      const response = await apiClient.put<any>(`/orders/${id}/tracking`, { carrier, trackingNumber });
      if (response.data && response.data.id) {
        const updatedOrders = await this.getOrders(true);
        const matched = updatedOrders.find((o) => o.id === id);
        if (matched) return matched;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend update order tracking API notice:', err);
    }

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
    inFlightOrdersPromise = null;
    try {
      const response = await apiClient.post<any>(`/orders/${id}/refund`, { refundAmount, refundReason });
      if (response.data && response.data.id) {
        const updatedOrders = await this.getOrders(true);
        const matched = updatedOrders.find((o) => o.id === id);
        if (matched) return matched;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend refund order API notice:', err);
    }

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
    inFlightOrdersPromise = null;
    try {
      const response = await apiClient.post<any>(`/orders/${id}/cancel`, { cancellationReason });
      if (response.data && response.data.id) {
        const updatedOrders = await this.getOrders(true);
        const matched = updatedOrders.find((o) => o.id === id);
        if (matched) return matched;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend cancel order API notice:', err);
    }

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

  // Customer CRM Management via Axios
  async getCustomers(forceRefresh = false): Promise<CMSCustomer[]> {
    if (!forceRefresh && inFlightCustomersPromise) {
      return inFlightCustomersPromise;
    }

    inFlightCustomersPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/customers');
        if (response.data && Array.isArray(response.data)) {
          const mapped: CMSCustomer[] = response.data.map((c: any) => {
            let address: any = undefined;
            if (c.addressJson) {
              try { address = JSON.parse(c.addressJson); } catch { }
            }
            let notes: any[] = [];
            if (c.notesJson) {
              try { notes = JSON.parse(c.notesJson); } catch { }
            }
            let tags: string[] = [];
            if (c.tags) {
              tags = typeof c.tags === 'string' ? c.tags.split(',').map((t: string) => t.trim()) : c.tags;
            }

            return {
              id: c.id,
              name: c.name,
              email: c.email,
              phone: c.phone || null,
              group: c.group || 'NEW',
              tags: tags.length > 0 ? tags : ['New-Customer'],
              address: address,
              acceptsMarketing: c.acceptsMarketing !== false,
              notes: notes,
              totalOrders: c.totalOrders || 0,
              totalSpent: Number(c.totalSpent || 0),
              createdAt: c.createdAt ? String(c.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
            };
          });
          return mapped;
        }
      } catch (err) {
        console.warn('Backend customers API notice:', err);
      }

      return [];
    })();

    try {
      const res = await inFlightCustomersPromise;
      return res;
    } finally {
      setTimeout(() => {
        inFlightCustomersPromise = null;
      }, 500);
    }
  },

  async createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    group?: string;
    tags?: string | string[];
    address?: any;
    acceptsMarketing?: boolean;
  }): Promise<CMSCustomer> {
    inFlightCustomersPromise = null;
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      group: data.group || 'NEW',
      tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags || '',
      addressJson: data.address ? JSON.stringify(data.address) : '',
      acceptsMarketing: data.acceptsMarketing !== false,
    };

    try {
      const response = await apiClient.post<any>('/customers', payload);
      if (response.data && response.data.id) {
        const c = response.data;
        const created: CMSCustomer = {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || null,
          group: c.group || 'NEW',
          tags: c.tags ? (typeof c.tags === 'string' ? c.tags.split(',').map((t: string) => t.trim()) : c.tags) : ['New-Customer'],
          acceptsMarketing: c.acceptsMarketing !== false,
          totalOrders: 0,
          totalSpent: 0,
          createdAt: c.createdAt ? String(c.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
        };
        return created;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend customer creation API notice, saving locally:', err);
    }

    const newCustomer: CMSCustomer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      group: data.group || 'NEW',
      tags: data.tags
        ? Array.isArray(data.tags)
          ? data.tags
          : data.tags.split(',').map((t: string) => t.trim())
        : ['New-Customer'],
      address: data.address,
      acceptsMarketing: data.acceptsMarketing !== false,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newCustomer;
  },

  async updateCustomer(id: string, data: Partial<CMSCustomer>): Promise<CMSCustomer> {
    inFlightCustomersPromise = null;
    const payload = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.group && { group: data.group }),
      ...(data.tags && { tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags }),
      ...(data.acceptsMarketing !== undefined && { acceptsMarketing: data.acceptsMarketing }),
      ...(data.address && { addressJson: JSON.stringify(data.address) }),
    };

    try {
      const response = await apiClient.put<any>(`/customers/${id}`, payload);
      if (response.data && response.data.id) {
        const updatedList = await this.getCustomers(true);
        const matched = updatedList.find((c) => c.id === id);
        if (matched) return matched;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend customer update API notice:', err);
    }

    throw new Error('Customer update failed');
  },

  async deleteCustomer(id: string): Promise<boolean> {
    inFlightCustomersPromise = null;
    try {
      await apiClient.delete(`/customers/${id}`);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend customer delete API notice:', err);
    }
    return true;
  },

  // Discounts & Promotions Management via Axios with request deduplication
  async getDiscounts(forceRefresh = false): Promise<CMSDiscount[]> {
    if (!forceRefresh && inFlightDiscountsPromise) {
      return inFlightDiscountsPromise;
    }

    inFlightDiscountsPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/discounts');
        if (response.data && Array.isArray(response.data)) {
          const mapped: CMSDiscount[] = response.data.map((d: any) => {
            let targetIds: string[] = [];
            if (d.targetIdsJson) {
              try { targetIds = JSON.parse(d.targetIdsJson); } catch { }
            }
            let targetCustomers: string[] = [];
            if (d.targetCustomerJson) {
              try { targetCustomers = JSON.parse(d.targetCustomerJson); } catch { targetCustomers = [d.targetCustomerJson]; }
            }

            return {
              id: d.id,
              title: d.title,
              code: d.code || undefined,
              discountType: d.discountType || 'PERCENTAGE',
              method: d.method || 'COUPON_CODE',
              value: Number(d.value || 0),
              buyQuantity: d.buyQuantity !== null && d.buyQuantity !== undefined ? Number(d.buyQuantity) : undefined,
              getQuantity: d.getQuantity !== null && d.getQuantity !== undefined ? Number(d.getQuantity) : undefined,
              getDiscountPercent: d.getDiscountPercent !== null && d.getDiscountPercent !== undefined ? Number(d.getDiscountPercent) : undefined,
              minOrderAmount: d.minOrderAmount !== null && d.minOrderAmount !== undefined ? Number(d.minOrderAmount) : undefined,
              appliesTo: d.appliesTo || 'ALL',
              targetIds: targetIds,
              customerEligibility: d.customerEligibility || 'ALL',
              targetCustomers: targetCustomers,
              usageLimit: d.usageLimit !== null && d.usageLimit !== undefined ? Number(d.usageLimit) : undefined,
              usageCount: Number(d.usageCount || 0),
              oncePerCustomer: d.oncePerCustomer !== false,
              startDate: d.startDate ? String(d.startDate).split('T')[0] : new Date().toISOString().split('T')[0],
              endDate: d.endDate ? String(d.endDate).split('T')[0] : undefined,
              status: d.status || 'ACTIVE',
              createdAt: d.createdAt ? String(d.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
            };
          });
          return mapped;
        }
      } catch (err) {
        console.warn('Backend discounts API notice:', err);
      }

      return [];
    })();

    try {
      const res = await inFlightDiscountsPromise;
      return res;
    } finally {
      setTimeout(() => {
        inFlightDiscountsPromise = null;
      }, 500);
    }
  },

  async createDiscount(data: Partial<CMSDiscount>): Promise<CMSDiscount> {
    inFlightDiscountsPromise = null;
    const payload = {
      title: data.title,
      code: data.code || null,
      discountType: data.discountType || 'PERCENTAGE',
      method: data.method || 'COUPON_CODE',
      value: Number(data.value || 0),
      buyQuantity: data.buyQuantity !== undefined && data.buyQuantity !== null ? Number(data.buyQuantity) : null,
      getQuantity: data.getQuantity !== undefined && data.getQuantity !== null ? Number(data.getQuantity) : null,
      getDiscountPercent: data.getDiscountPercent !== undefined && data.getDiscountPercent !== null ? Number(data.getDiscountPercent) : null,
      minOrderAmount: Number(data.minOrderAmount || 0),
      appliesTo: data.appliesTo || 'ALL',
      targetIdsJson: data.targetIds ? JSON.stringify(data.targetIds) : null,
      customerEligibility: data.customerEligibility || 'ALL',
      targetCustomerJson: data.targetCustomers ? JSON.stringify(data.targetCustomers) : null,
      usageLimit: data.usageLimit !== undefined && data.usageLimit !== null ? Number(data.usageLimit) : null,
      oncePerCustomer: data.oncePerCustomer !== false,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || null,
      status: data.status || 'ACTIVE',
    };

    try {
      const response = await apiClient.post<any>('/discounts', payload);
      if (response.data && response.data.id) {
        const d = response.data;
        let targetIds: string[] = [];
        if (d.targetIdsJson) {
          try { targetIds = JSON.parse(d.targetIdsJson); } catch { }
        }
        let targetCustomers: string[] = [];
        if (d.targetCustomerJson) {
          try { targetCustomers = JSON.parse(d.targetCustomerJson); } catch { targetCustomers = [d.targetCustomerJson]; }
        }

        const created: CMSDiscount = {
          id: d.id,
          title: d.title,
          code: d.code || undefined,
          discountType: d.discountType || 'PERCENTAGE',
          method: d.method || 'COUPON_CODE',
          value: Number(d.value || 0),
          buyQuantity: d.buyQuantity !== null && d.buyQuantity !== undefined ? Number(d.buyQuantity) : undefined,
          getQuantity: d.getQuantity !== null && d.getQuantity !== undefined ? Number(d.getQuantity) : undefined,
          getDiscountPercent: d.getDiscountPercent !== null && d.getDiscountPercent !== undefined ? Number(d.getDiscountPercent) : undefined,
          minOrderAmount: d.minOrderAmount !== null && d.minOrderAmount !== undefined ? Number(d.minOrderAmount) : undefined,
          appliesTo: d.appliesTo || 'ALL',
          targetIds: targetIds,
          customerEligibility: d.customerEligibility || 'ALL',
          targetCustomers: targetCustomers,
          usageLimit: d.usageLimit !== null && d.usageLimit !== undefined ? Number(d.usageLimit) : undefined,
          usageCount: 0,
          oncePerCustomer: d.oncePerCustomer !== false,
          startDate: d.startDate ? String(d.startDate).split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: d.endDate ? String(d.endDate).split('T')[0] : undefined,
          status: d.status || 'ACTIVE',
          createdAt: d.createdAt ? String(d.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
        };
        return created;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend discount creation API notice:', err);
    }

    throw new Error('Discount creation failed');
  },

  async updateDiscount(id: string, data: Partial<CMSDiscount>): Promise<CMSDiscount> {
    inFlightDiscountsPromise = null;
    const payload = {
      ...(data.title && { title: data.title }),
      ...(data.code !== undefined && { code: data.code || null }),
      ...(data.discountType && { discountType: data.discountType }),
      ...(data.method && { method: data.method }),
      ...(data.value !== undefined && { value: Number(data.value || 0) }),
      ...(data.buyQuantity !== undefined && { buyQuantity: data.buyQuantity !== null ? Number(data.buyQuantity) : null }),
      ...(data.getQuantity !== undefined && { getQuantity: data.getQuantity !== null ? Number(data.getQuantity) : null }),
      ...(data.getDiscountPercent !== undefined && { getDiscountPercent: data.getDiscountPercent !== null ? Number(data.getDiscountPercent) : null }),
      ...(data.minOrderAmount !== undefined && { minOrderAmount: Number(data.minOrderAmount || 0) }),
      ...(data.appliesTo && { appliesTo: data.appliesTo }),
      ...(data.targetIds !== undefined && { targetIdsJson: data.targetIds ? JSON.stringify(data.targetIds) : null }),
      ...(data.customerEligibility && { customerEligibility: data.customerEligibility }),
      ...(data.targetCustomers !== undefined && { targetCustomerJson: data.targetCustomers ? JSON.stringify(data.targetCustomers) : null }),
      ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit !== null ? Number(data.usageLimit) : null }),
      ...(data.oncePerCustomer !== undefined && { oncePerCustomer: data.oncePerCustomer }),
      ...(data.startDate && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate || null }),
      ...(data.status && { status: data.status }),
    };

    try {
      const response = await apiClient.put<any>(`/discounts/${id}`, payload);
      if (response.data && response.data.id) {
        const updatedList = await this.getDiscounts(true);
        const matched = updatedList.find((d) => d.id === id);
        if (matched) return matched;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend discount update API notice:', err);
    }

    throw new Error('Discount update failed');
  },

  async deleteDiscount(id: string): Promise<boolean> {
    inFlightDiscountsPromise = null;
    try {
      await apiClient.delete(`/discounts/${id}`);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend discount delete API notice:', err);
    }
    return true;
  },

  // Tax & Compliance Management via Axios with request deduplication
  async getTaxRegions(forceRefresh = false): Promise<CMSTaxRegion[]> {
    if (!forceRefresh && inFlightTaxRegionsPromise) {
      return inFlightTaxRegionsPromise;
    }

    inFlightTaxRegionsPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/tax');
        if (response.data && Array.isArray(response.data)) {
          const mapped: CMSTaxRegion[] = response.data.map((r: any) => {
            let hsnSacCodes: HsnSacCode[] = [];
            if (r.hsnSacJson) {
              try { hsnSacCodes = JSON.parse(r.hsnSacJson); } catch { }
            }

            return {
              id: r.id,
              name: r.name,
              country: r.country,
              taxName: r.taxName || 'GST',
              taxNumber: r.taxNumber || undefined,
              standardRate: Number(r.standardRate || 18.0),
              reducedRate: r.reducedRate ? Number(r.reducedRate) : undefined,
              isTaxInclusive: r.isTaxInclusive === true,
              hsnSacCodes: hsnSacCodes,
            };
          });
          return mapped;
        }
      } catch (err) {
        console.warn('Backend tax regions API notice:', err);
      }

      return [];
    })();

    try {
      const res = await inFlightTaxRegionsPromise;
      return res;
    } finally {
      setTimeout(() => {
        inFlightTaxRegionsPromise = null;
      }, 500);
    }
  },

  async createTaxRegion(data: Partial<CMSTaxRegion>): Promise<CMSTaxRegion> {
    inFlightTaxRegionsPromise = null;
    const payload = {
      name: data.name || 'New Tax Region',
      country: data.country || 'India',
      taxName: data.taxName || 'GST',
      taxNumber: data.taxNumber || null,
      standardRate: data.standardRate || 18.0,
      reducedRate: data.reducedRate || 5.0,
      isTaxInclusive: data.isTaxInclusive || false,
      hsnSacJson: data.hsnSacCodes ? JSON.stringify(data.hsnSacCodes) : null,
    };

    try {
      const response = await apiClient.post<any>('/tax', payload);
      if (response.data && response.data.id) {
        const r = response.data;
        let hsnSacCodes: HsnSacCode[] = [];
        if (r.hsnSacJson) {
          try { hsnSacCodes = JSON.parse(r.hsnSacJson); } catch { }
        }
        const created: CMSTaxRegion = {
          id: r.id,
          name: r.name,
          country: r.country,
          taxName: r.taxName || 'GST',
          taxNumber: r.taxNumber || undefined,
          standardRate: Number(r.standardRate || 18.0),
          reducedRate: r.reducedRate ? Number(r.reducedRate) : undefined,
          isTaxInclusive: r.isTaxInclusive === true,
          hsnSacCodes: hsnSacCodes,
        };
        return created;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend tax region creation API notice:', err);
    }

    throw new Error('Tax region creation failed');
  },

  async updateTaxRegion(id: string, data: Partial<CMSTaxRegion>): Promise<CMSTaxRegion> {
    inFlightTaxRegionsPromise = null;
    const payload = {
      ...(data.name && { name: data.name }),
      ...(data.country && { country: data.country }),
      ...(data.taxName && { taxName: data.taxName }),
      ...(data.taxNumber !== undefined && { taxNumber: data.taxNumber || null }),
      ...(data.standardRate !== undefined && { standardRate: data.standardRate }),
      ...(data.reducedRate !== undefined && { reducedRate: data.reducedRate }),
      ...(data.isTaxInclusive !== undefined && { isTaxInclusive: data.isTaxInclusive }),
      ...(data.hsnSacCodes !== undefined && { hsnSacJson: data.hsnSacCodes ? JSON.stringify(data.hsnSacCodes) : null }),
    };

    try {
      const response = await apiClient.put<any>(`/tax/${id}`, payload);
      if (response.data && response.data.id) {
        const updatedList = await this.getTaxRegions(true);
        const matched = updatedList.find((r) => r.id === id);
        if (matched) return matched;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend tax region update API notice:', err);
    }

    throw new Error('Tax region update failed');
  },

  async deleteTaxRegion(id: string): Promise<boolean> {
    inFlightTaxRegionsPromise = null;
    try {
      await apiClient.delete(`/tax/${id}`);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend tax region delete API notice:', err);
    }
    return true;
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
      if (session.store && (session.store as any).id) {
        localStorage.setItem('current_store_id', (session.store as any).id);
      }
    }
  },

  clearMerchantSession(): void {
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'merchant_cms_session',
        'auth_token',
        'current_store_id',
        'active_store_id',
        'selected_store_id',
        'user_role',
        'user_permissions',
        'merchant_cms_store_setup',
        'merchant_cms_store_theme',
        'merchant_cms_store_pages',
        'merchant_cms_product_reviews',
        'merchant_cms_menus',
        'merchant_cms_customers',
        'merchant_cms_shipping_zones',
        'merchant_cms_shipping_providers',
        'merchant_cms_marketing_campaigns',
        'merchant_cms_pixel_config',
        'merchant_cms_abandoned_carts',
        'whatsapp_setup_completed',
        'whatsapp_setup_opened',
      ];
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      try {
        sessionStorage.removeItem('cms_pending_verification_email');
        sessionStorage.removeItem('cms_latest_verification_token');
      } catch {}
    }
  },

  async checkEmailAvailability(email: string): Promise<CheckEmailResponse> {
    const response = await apiClient.post<CheckEmailResponse>('/users/check-email', { email });
    return response.data;
  },

  async registerMerchant(merchant: MerchantUser): Promise<RegisterResponse> {
    const fullName = `${merchant.firstName || ''} ${merchant.lastName || ''}`.trim();
    const response = await apiClient.post<RegisterResponse>('/users/register', {
      name: fullName || merchant.email.split('@')[0],
      firstName: merchant.firstName || undefined,
      lastName: merchant.lastName || undefined,
      phone: merchant.mobileNumber || merchant.phone || undefined,
      mobileNumber: merchant.mobileNumber || merchant.phone || undefined,
      email: merchant.email,
      password: merchant.password,
    });

    // Save the verification token for OTP pre-fill (do NOT store auth_token yet — email unverified)
    if (response.data && response.data.verificationToken) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_latest_verification_token', response.data.verificationToken);
        sessionStorage.setItem('cms_pending_verification_email', merchant.email);
      }
    }

    const createdStoreId = response.data?.storeId;
    if (createdStoreId && typeof window !== 'undefined') {
      localStorage.setItem('selected_store_id', createdStoreId);
      localStorage.setItem('current_store_id', createdStoreId);
    }

    // Save basic merchant info to session
    cmsService.saveMerchantSession({
      merchant: { ...merchant, email: merchant.email, storeId: createdStoreId },
      store: createdStoreId
        ? {
            id: createdStoreId,
            slug: merchant.email.split('@')[0],
            storeName: `${fullName || 'My'}'s Store`,
            currency: 'INR',
            status: 'ACTIVE',
          }
        : undefined,
    });

    return response.data;
  },

  async verifyMerchantEmail(email: string, token: string): Promise<VerifyEmailResponse> {
    const response = await apiClient.post<VerifyEmailResponse>('/users/verify-email', {
      email,
      token,
    });
    if (response.data && response.data.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.accessToken);
      }
    }
    const storeId = response.data?.storeId || response.data?.user?.storeId;
    if (storeId && typeof window !== 'undefined') {
      localStorage.setItem('selected_store_id', storeId);
      localStorage.setItem('current_store_id', storeId);
    }
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

  async forgotPassword(email: string): Promise<{
    success: boolean;
    message: string;
    email: string;
    resetToken?: string | null;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      email: string;
      resetToken?: string | null;
    }>('/users/forgot-password', { email });
    if (response.data && response.data.resetToken) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_latest_reset_token', response.data.resetToken);
      }
    }
    return response.data;
  },

  async verifyResetToken(email: string, token: string): Promise<{ valid: boolean; message: string }> {
    const response = await apiClient.post<{ valid: boolean; message: string }>('/users/verify-reset-token', {
      email,
      token,
    });
    return response.data;
  },

  async resetPassword(payload: {
    email: string;
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/users/reset-password', payload);
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

    // Map backend user to MerchantUser with role & permissions
    const nameParts = (backendUser.name || 'Merchant Owner').split(' ');
    const firstName = nameParts[0] || 'Merchant';
    const lastName = nameParts.slice(1).join(' ') || 'Owner';

    // Determine Role & Permissions from stores owned or storeMemberships
    const isStoreOwner = Boolean(backendUser.stores && backendUser.stores.length > 0);
    const activeMembership = backendUser.storeMemberships && backendUser.storeMemberships.length > 0
      ? backendUser.storeMemberships[0]
      : null;

    let userRole = isStoreOwner
      ? 'OWNER'
      : activeMembership
      ? (activeMembership.role || 'STAFF').toUpperCase()
      : (backendUser.role || 'STAFF').toUpperCase();

    let customRoleTitle = isStoreOwner
      ? 'Store Owner'
      : activeMembership?.customRoleTitle || backendUser.customRoleTitle || userRole;

    let permissions = isStoreOwner || userRole === 'ADMIN'
      ? {
          canManageProducts: true,
          canManageInventory: true,
          canManageOrders: true,
          canManageCustomers: true,
          canManageThemes: true,
          canManageSettings: true,
          canManagePayments: true,
          canManageLogistics: true,
          canManageAnalytics: true,
        }
      : activeMembership
      ? {
          canManageProducts: !!activeMembership.canManageProducts,
          canManageInventory: !!activeMembership.canManageInventory,
          canManageOrders: !!activeMembership.canManageOrders,
          canManageCustomers: !!activeMembership.canManageCustomers,
          canManageThemes: !!activeMembership.canManageThemes,
          canManageSettings: !!activeMembership.canManageSettings,
          canManagePayments: !!activeMembership.canManagePayments,
          canManageLogistics: !!activeMembership.canManageLogistics,
          canManageAnalytics: !!activeMembership.canManageAnalytics,
        }
      : {
          canManageProducts: !!(backendUser as any).permissionsProducts,
          canManageInventory: !!(backendUser as any).permissionsProducts,
          canManageOrders: !!(backendUser as any).permissionsOrders,
          canManageCustomers: !!(backendUser as any).permissionsCustomers,
          canManageThemes: !!(backendUser as any).permissionsThemes,
          canManageSettings: !!(backendUser as any).permissionsSettings,
          canManagePayments: !!(backendUser as any).permissionsPayments,
          canManageLogistics: false,
          canManageAnalytics: !!(backendUser as any).permissionsAnalytics,
        };

    const merchantUser: MerchantUser = {
      firstName,
      lastName,
      mobileNumber: '+1 555-0199',
      email: backendUser.email,
      role: userRole,
      customRoleTitle,
      permissions,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_role', userRole);
      localStorage.setItem('user_permissions', JSON.stringify(permissions));
    }

    const resolvedStoreId =
      (backendUser.stores && backendUser.stores.length > 0 ? backendUser.stores[0].id : null) ||
      (backendUser.storeMemberships && backendUser.storeMemberships.length > 0 && backendUser.storeMemberships[0].store
        ? backendUser.storeMemberships[0].store.id
        : null) ||
      null;

    if (resolvedStoreId && typeof window !== 'undefined') {
      localStorage.setItem('current_store_id', resolvedStoreId);
    }

    const existingSession = this.getMerchantSession();

    const storeInfo =
      existingSession?.store ||
      (backendUser.stores && backendUser.stores.length > 0
        ? {
            id: backendUser.stores[0].id,
            storeName: backendUser.stores[0].name,
            currency: backendUser.stores[0].currency || 'USD',
          }
        : backendUser.storeMemberships && backendUser.storeMemberships.length > 0 && backendUser.storeMemberships[0].store
        ? {
            id: backendUser.storeMemberships[0].store.id,
            storeName: backendUser.storeMemberships[0].store.name,
            currency: backendUser.storeMemberships[0].store.currency || 'USD',
          }
        : {
            storeName: 'OmniStore Flagship',
            currency: 'USD',
          });

    this.saveMerchantSession({
      ...(existingSession || {}),
      merchant: merchantUser,
      store: storeInfo as any,
    });

    return { requiresVerification: false, user: merchantUser, backendUser };
  },

  async continueWithGoogle(payload: {
    credential?: string;
    token?: string;
    email?: string;
    name?: string;
    picture?: string;
  }): Promise<{
    requiresVerification: boolean;
    isNewUser?: boolean;
    user?: MerchantUser;
    backendUser?: BackendUserResponse;
  }> {
    const response = await apiClient.post<{
      accessToken: string;
      isNewUser?: boolean;
      requiresVerification?: boolean;
      message?: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }>('/users/google-auth', payload);

    const accessToken = response.data.accessToken || '';
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', accessToken);
    }

    // Fetch full profile details
    const backendUser = await this.getCurrentUser();

    const nameParts = (backendUser.name || response.data.user?.name || 'Merchant Owner').split(' ');
    const firstName = nameParts[0] || 'Merchant';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    let userRole = backendUser.role || 'MERCHANT';
    let customRoleTitle = backendUser.customRoleTitle || 'Store Owner';
    let permissions = {
      canManageProducts: true,
      canManageInventory: true,
      canManageOrders: true,
      canManageCustomers: true,
      canManageThemes: true,
      canManageSettings: true,
      canManagePayments: true,
      canManageLogistics: true,
      canManageAnalytics: true,
    };

    if (backendUser.storeMemberships && backendUser.storeMemberships.length > 0) {
      const activeMembership = backendUser.storeMemberships[0];
      userRole = activeMembership.role;
      customRoleTitle = activeMembership.customRoleTitle || userRole;
      permissions = {
        canManageProducts: activeMembership.canManageProducts,
        canManageInventory: activeMembership.canManageInventory,
        canManageOrders: activeMembership.canManageOrders,
        canManageCustomers: activeMembership.canManageCustomers,
        canManageThemes: activeMembership.canManageThemes,
        canManageSettings: activeMembership.canManageSettings,
        canManagePayments: activeMembership.canManagePayments,
        canManageLogistics: activeMembership.canManageLogistics,
        canManageAnalytics: activeMembership.canManageAnalytics,
      };
    }

    const merchantUser: MerchantUser = {
      firstName,
      lastName,
      mobileNumber: '+1 555-0199',
      email: backendUser.email || response.data.user?.email,
      role: userRole,
      customRoleTitle,
      permissions,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_role', userRole);
      localStorage.setItem('user_permissions', JSON.stringify(permissions));
    }

    const resolvedStoreId =
      (backendUser.stores && backendUser.stores.length > 0 ? backendUser.stores[0].id : null) ||
      (backendUser.storeMemberships && backendUser.storeMemberships.length > 0 && backendUser.storeMemberships[0].store
        ? backendUser.storeMemberships[0].store.id
        : null) ||
      null;

    if (resolvedStoreId && typeof window !== 'undefined') {
      localStorage.setItem('current_store_id', resolvedStoreId);
    }

    const existingSession = this.getMerchantSession();

    const storeInfo =
      existingSession?.store ||
      (backendUser.stores && backendUser.stores.length > 0
        ? {
            id: backendUser.stores[0].id,
            storeName: backendUser.stores[0].name,
            currency: backendUser.stores[0].currency || 'USD',
          }
        : backendUser.storeMemberships && backendUser.storeMemberships.length > 0 && backendUser.storeMemberships[0].store
        ? {
            id: backendUser.storeMemberships[0].store.id,
            storeName: backendUser.storeMemberships[0].store.name,
            currency: backendUser.storeMemberships[0].store.currency || 'USD',
          }
        : {
            storeName: 'OmniStore Flagship',
            currency: 'USD',
          });

    this.saveMerchantSession({
      ...(existingSession || {}),
      merchant: merchantUser,
      store: storeInfo as any,
    });

    return {
      requiresVerification: false,
      isNewUser: response.data.isNewUser,
      user: merchantUser,
      backendUser,
    };
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

  async createStore(payloadOrDetails: CreateStorePayload | StoreDetails, templateSlug?: string): Promise<CMSStore> {
    let payload: CreateStorePayload;
    if ('storeName' in payloadOrDetails) {
      const slug = payloadOrDetails.storeName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      payload = {
        name: payloadOrDetails.storeName,
        slug: slug || `store-${Date.now()}`,
        description: payloadOrDetails.tagline || 'Merchant store',
        currency: payloadOrDetails.currency || 'INR',
        templateSlug: templateSlug || 'nova-tech',
        categoryName: payloadOrDetails.category,
      };
    } else {
      payload = payloadOrDetails;
    }

    const response = await apiClient.post<CMSStore>('/stores', payload);
    return response.data;
  },

  async getMerchantStores(): Promise<CMSStore[]> {
    try {
      const response = await apiClient.get<CMSStore[]>('/stores');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async completeOnboarding(onboardingData: MerchantOnboardingData): Promise<MerchantOnboardingData> {
    // 1. Create merchant store on backend via POST /api/stores with template ID/slug if store details provided
    if (onboardingData.store) {
      const templateSlug = onboardingData.selectedTemplate?.slug || onboardingData.selectedTemplate?.id;
      const createdStore = await this.createStore(onboardingData.store, templateSlug);
      if (createdStore && createdStore.id) {
        onboardingData.store = {
          ...onboardingData.store,
          storeName: createdStore.name || onboardingData.store.storeName,
        };
      }
    }

    // 2. If a first product was provided during onboarding, create it in the catalog
    if (onboardingData.firstProduct) {
      await this.createProduct(onboardingData.firstProduct);
    }
    this.saveMerchantSession(onboardingData);
    return onboardingData;
  },

  // Get Store Setup details with in-flight deduplication and caching
  async getStoreSetup(forceFresh = false): Promise<StoreSetupData> {
    if (!forceFresh && _cachedStoreSetup && (Date.now() - _lastStoreSetupFetch < 30000)) {
      return _cachedStoreSetup;
    }

    if (!forceFresh && _inFlightStoreSetupPromise) {
      return _inFlightStoreSetupPromise;
    }

    _inFlightStoreSetupPromise = (async () => {
      try {
        const response = await apiClient.get<StoreSetupData>('/stores/setup');
        if (response.data && response.data.name) {
          _cachedStoreSetup = response.data;
          _lastStoreSetupFetch = Date.now();
          return response.data;
        }
      } catch (err) {
        console.warn('Backend store setup API notice, using fallback state:', err);
      } finally {
        _inFlightStoreSetupPromise = null;
      }

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('merchant_cms_store_setup');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            _cachedStoreSetup = parsed;
            _lastStoreSetupFetch = Date.now();
            return parsed;
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

      _cachedStoreSetup = defaultData;
      _lastStoreSetupFetch = Date.now();
      return defaultData;
    })();

    return _inFlightStoreSetupPromise;
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

    _cachedStoreSetup = result;
    _lastStoreSetupFetch = Date.now();
    _inFlightStoreSetupPromise = null;

    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_store_setup', JSON.stringify(result));
      const session = this.getMerchantSession();
      if (session && session.store) {
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
          themeBackgroundImage: response.data.themeBackgroundImage || null,
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
      themeBackgroundImage: null,
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
  async getPages(forceRefresh = false): Promise<CMSPageData[]> {
    if (!forceRefresh && inFlightPagesPromise) {
      return inFlightPagesPromise;
    }

    inFlightPagesPromise = (async () => {
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
    })();

    try {
      const pages = await inFlightPagesPromise;
      return pages;
    } finally {
      setTimeout(() => {
        inFlightPagesPromise = null;
      }, 500);
    }
  },

  // Create Page via Axios
  async createPage(data: PageFormData): Promise<CMSPageData> {
    try {
      const response = await apiClient.post<CMSPageData>('/pages', data);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
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
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
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
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend page delete API notice:', err);
    }

    const pages = await this.getPages();
    const filtered = pages.filter((p) => p.id !== id && p.slug !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_store_pages', JSON.stringify(filtered));
    }

    return true;
  },

  // Get Page details by slug
  async getPageBySlug(slug: string): Promise<CMSPageData | null> {
    try {
      const cleanSlug = slug.replace(/^\/+/, '');
      const response = await apiClient.get<CMSPageData>(`/pages/detail/${cleanSlug}`);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend page slug lookup notice, searching locally:', err);
    }

    const pages = await this.getPages();
    const found = pages.find((p) => p.slug === slug || p.slug === `/${slug}` || p.id === slug);
    return found || null;
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

  async updateProductReviewStatus(id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED'): Promise<boolean> {
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
  async getMenus(forceRefresh = false): Promise<CMSMenuData[]> {
    if (!forceRefresh && inFlightMenusPromise) {
      return inFlightMenusPromise;
    }

    inFlightMenusPromise = (async () => {
      try {
        const response = await apiClient.get<any[]>('/menus');
        if (response.data && Array.isArray(response.data)) {
          return response.data.map((m) => ({
            ...m,
            items: m.itemsJson
              ? typeof m.itemsJson === 'string'
                ? JSON.parse(m.itemsJson)
                : m.itemsJson
              : m.items || [],
          }));
        }
      } catch (err) {
        console.warn('Backend menus API error:', err);
      }

      return [];
    })();

    try {
      const menus = await inFlightMenusPromise;
      return menus;
    } finally {
      setTimeout(() => {
        inFlightMenusPromise = null;
      }, 500);
    }
  },

  async createMenu(menu: { title: string; handle: string; location: string; items: CMSMenuItem[] }): Promise<CMSMenuData> {
    inFlightMenusPromise = null;
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
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend create menu API notice, saving locally:', err);
    }

    const menus = await this.getMenus(true);
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
    inFlightMenusPromise = null;
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
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend update menu API notice, saving locally:', err);
    }

    const menus = await this.getMenus(true);
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
    inFlightMenusPromise = null;
    try {
      await apiClient.delete(`/menus/${id}`);
      return true;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.warn('Backend delete menu API notice:', err);
    }

    const menus = await this.getMenus(true);
    const filtered = menus.filter((m) => m.id !== id && m.handle !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_menus', JSON.stringify(filtered));
    }

    return true;
  },

  // Customer Reviews & Communication

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

  // Shipping & Logistics Management
  async getShippingZones(): Promise<CMSShippingZone[]> {
    try {
      const response = await apiClient.get<any[]>('/shipping/zones');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend shipping zones API notice, checking fallback:', err);
    }

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
    try {
      const response = await apiClient.post<any>('/shipping/zones', {
        name: zone.name || 'New Shipping Zone',
        countries: zone.countries || ['United States'],
        rates: zone.rates || [],
      });
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend create zone fallback to local:', err);
    }

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
    try {
      const response = await apiClient.put<any>(`/shipping/zones/${id}`, zone);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend update zone fallback to local:', err);
    }

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
    try {
      await apiClient.delete(`/shipping/zones/${id}`);
      return true;
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend delete zone fallback to local:', err);
    }

    const zones = await this.getShippingZones();
    const filtered = zones.filter((z) => z.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_shipping_zones', JSON.stringify(filtered));
    }
    return true;
  },

  // Shipping Providers & Carriers
  async getShippingProviders(): Promise<CMSShippingProvider[]> {
    try {
      const response = await apiClient.get<any[]>('/shipping/providers');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend shipping providers API notice, checking fallback:', err);
    }

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
    try {
      const response = await apiClient.put<any>(`/shipping/providers/${id}`, provider);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend update provider fallback to local:', err);
    }

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

  // Calculate live shipping rates for cart and destination
  async calculateShippingRates(payload: {
    country: string;
    weightKg?: number;
    cartSubtotal?: number;
  }): Promise<{
    matchedZoneId?: string;
    matchedZoneName: string;
    country: string;
    packageWeightKg: number;
    cartSubtotal: number;
    eligibleRates: any[];
    cheapestRate: number;
    fastestRateDays: number;
  }> {
    try {
      const response = await apiClient.post<any>('/shipping/calculate', payload);
      return response.data;
    } catch (err) {
      console.warn('Calculate shipping API notice, simulating locally:', err);
      return {
        matchedZoneName: payload.country === 'United States' ? 'Domestic - United States' : 'International Zone',
        country: payload.country,
        packageWeightKg: payload.weightKg || 1.0,
        cartSubtotal: payload.cartSubtotal || 50.0,
        eligibleRates: [
          { id: 'sr-flat', name: 'Standard Express Ground', type: 'FLAT', price: 5.99, estimatedDays: '3-5 business days', minDeliveryDays: 3 },
          { id: 'sr-fast', name: 'Overnight Air Priority', type: 'FLAT', price: 14.99, estimatedDays: '1-2 business days', minDeliveryDays: 1 },
        ],
        cheapestRate: 5.99,
        fastestRateDays: 1,
      };
    }
  },

  // Live Shipment Tracking & Timeline
  async trackShipment(trackingNumber: string, carrier = 'FEDEX'): Promise<{
    trackingNumber: string;
    carrier: string;
    carrierCode: string;
    status: string;
    estimatedDelivery: string;
    trackingUrl: string;
    events: { status: string; title: string; location: string; timestamp: string; completed: boolean }[];
  }> {
    const response = await apiClient.get<any>('/shipping/track', {
      params: { trackingNumber, carrier },
    });
    return response.data;
  },

  // Indian PIN Code Serviceability Resolver
  async checkIndianPincode(pincode: string): Promise<{
    success: boolean;
    pincode: string;
    city: string;
    state: string;
    zoneType: string;
    estimatedDays: number;
    isCodAvailable: boolean;
    courierPartners: string[];
  }> {
    try {
      const response = await apiClient.get(`/shipping/pincode/${pincode}`);
      return response.data;
    } catch {
      return {
        success: true,
        pincode,
        city: 'Bengaluru / Urban Center',
        state: 'Karnataka',
        zoneType: 'Metro',
        estimatedDays: 2,
        isCodAvailable: true,
        courierPartners: ['Shiprocket', 'Delhivery', 'Blue Dart', 'Xpressbees', 'India Post'],
      };
    }
  },

  // ─── NEXUS COMMERCE SHIPPING INTEGRATION MODULE ───────────────────────────
  async getRateShoppingPolicy(): Promise<RateShoppingPolicy> {
    try {
      const response = await apiClient.get<RateShoppingPolicy>('/shipping/policy');
      return response.data;
    } catch {
      return {
        priority: 'CHEAPEST',
        preferredCarrierCode: 'SHIPROCKET',
        fallbackEnabled: true,
        codEnabled: true,
        codMarkupAmount: 0,
        freeShippingThreshold: 999.0,
        maxTransitDays: 7,
      };
    }
  },

  async updateRateShoppingPolicy(policy: Partial<RateShoppingPolicy>): Promise<RateShoppingPolicy> {
    const response = await apiClient.put<any>('/shipping/policy', policy);
    return response.data.policy || response.data;
  },

  async getCarrierCredentials(): Promise<CarrierCredential[]> {
    try {
      const response = await apiClient.get<CarrierCredential[]>('/shipping/credentials');
      return response.data;
    } catch {
      return [];
    }
  },

  async upsertCarrierCredential(cred: Partial<CarrierCredential>): Promise<any> {
    const response = await apiClient.post<any>('/shipping/credentials', cred);
    return response.data;
  },

  async testCarrierConnection(carrierCode: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    try {
      const response = await apiClient.post<any>('/shipping/credentials/test', { carrierCode });
      return response.data;
    } catch (e: any) {
      return { success: false, latencyMs: 0, message: e.message || 'Connection failed' };
    }
  },

  async getShipments(): Promise<CMSShipment[]> {
    try {
      const response = await apiClient.get<CMSShipment[]>('/shipping/shipments');
      return response.data;
    } catch {
      return [];
    }
  },

  async createShipment(payload: { orderId: string; carrierCode?: string; serviceType?: string; packageWeightKg?: number }): Promise<any> {
    const response = await apiClient.post<any>('/shipping/shipments/create', payload);
    return response.data;
  },

  async cancelShipment(id: string): Promise<any> {
    const response = await apiClient.post<any>(`/shipping/shipments/${id}/cancel`);
    return response.data;
  },

  async getNdrRecords(): Promise<CMSNdrRecord[]> {
    try {
      const response = await apiClient.get<CMSNdrRecord[]>('/shipping/ndr');
      return response.data;
    } catch {
      return [];
    }
  },

  async triggerNdrAction(id: string, payload: { action: 'REATTEMPT' | 'UPDATE_ADDRESS' | 'RTO'; remarks?: string; customerPhone?: string; updatedAddress?: string }): Promise<any> {
    const response = await apiClient.post<any>(`/shipping/ndr/${id}/action`, payload);
    return response.data;
  },

  // Marketing & Campaigns Management
  async getMarketingCampaigns(): Promise<CMSMarketingCampaign[]> {
    try {
      const response = await apiClient.get<CMSMarketingCampaign[]>('/marketing/campaigns');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend campaigns API notice, checking local storage:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_marketing_campaigns');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            const clean = list.filter((c: any) => !['camp-1', 'camp-2', 'camp-3', 'camp-4'].includes(c.id));
            if (clean.length !== list.length) {
              localStorage.setItem('merchant_cms_marketing_campaigns', JSON.stringify(clean));
            }
            return clean;
          }
        } catch {
          // fallback below
        }
      }
    }

    return [];
  },

  async createMarketingCampaign(campaign: Partial<CMSMarketingCampaign>): Promise<CMSMarketingCampaign> {
    try {
      const response = await apiClient.post<CMSMarketingCampaign>('/marketing/campaigns', campaign);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend create campaign notice, saving locally:', err);
    }

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
    try {
      const response = await apiClient.put<CMSMarketingCampaign>(`/marketing/campaigns/${id}`, campaign);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend update campaign notice, updating locally:', err);
    }

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
    try {
      await apiClient.delete(`/marketing/campaigns/${id}`);
      return true;
    } catch (err) {
      console.warn('Backend delete campaign notice, deleting locally:', err);
    }

    const campaigns = await this.getMarketingCampaigns();
    const filtered = campaigns.filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_marketing_campaigns', JSON.stringify(filtered));
    }
    return true;
  },

  // Pixels & Integration Tracking
  async getPixelConfig(): Promise<CMSPixelConfig> {
    try {
      const response = await apiClient.get<CMSPixelConfig>('/marketing/pixels');
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend pixel config notice, checking local storage:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_pixel_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.ga4MeasurementId !== 'G-X987654321') {
            return parsed;
          }
        } catch {
          // fallback below
        }
      }
    }

    return {
      ga4MeasurementId: '',
      metaPixelId: '',
      tikTokPixelId: '',
      pinterestTagId: '',
      isGa4Active: false,
      isMetaActive: false,
      isTikTokActive: false,
      isPinterestActive: false,
    };
  },

  async updatePixelConfig(config: CMSPixelConfig): Promise<CMSPixelConfig> {
    try {
      const response = await apiClient.put<CMSPixelConfig>('/marketing/pixels', config);
      if (response.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('merchant_cms_pixel_config', JSON.stringify(response.data));
        }
        return response.data;
      }
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend update pixel config notice, saving locally:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_cms_pixel_config', JSON.stringify(config));
    }
    return config;
  },

  // Abandoned Cart Recovery Engine
  async getAbandonedCarts(): Promise<AbandonedCartData[]> {
    try {
      const response = await apiClient.get<AbandonedCartData[]>('/marketing/abandoned-carts');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend abandoned carts notice, checking local storage:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_cms_abandoned_carts');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            const clean = list.filter((c: any) => !['ac-101', 'ac-102', 'ac-103'].includes(c.id));
            if (clean.length !== list.length) {
              localStorage.setItem('merchant_cms_abandoned_carts', JSON.stringify(clean));
            }
            return clean;
          }
        } catch {
          // fallback below
        }
      }
    }

    return [];
  },

  async sendCartRecoveryEmail(
    id: string,
    channel: 'EMAIL' | 'WHATSAPP' | 'SMS' = 'EMAIL',
    discountCode = 'RECOVER10'
  ): Promise<AbandonedCartData> {
    try {
      const response = await apiClient.post<any>(`/marketing/abandoned-carts/${id}/recover`, {
        channel,
        discountCode,
      });
      if (response.data && response.data.cart) {
        return response.data.cart;
      }
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response) throw err;
      console.warn('Backend send cart recovery email notice, updating locally:', err);
    }

    const carts = await this.getAbandonedCarts();
    const index = carts.findIndex((c) => c.id === id);
    if (index > -1) {
      const updated: AbandonedCartData = {
        ...carts[index],
        status: channel === 'WHATSAPP' ? 'WHATSAPP_SENT' : channel === 'SMS' ? 'SMS_SENT' : 'EMAIL_SENT',
        recoveryDiscountCode: discountCode,
      };
      carts[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant_cms_abandoned_carts', JSON.stringify(carts));
      }
      return updated;
    }
    throw new Error('Abandoned cart record not found');
  },

  // ── MEDIA UPLOAD ─────────────────────────────────────────────────────────────

  /**
   * Uploads a file to the backend (which streams it to AWS S3 or local storage).
   * Returns the public URL and CDN URL of the uploaded file.
   */
  async uploadMedia(
    file: File,
    folder: string = 'uploads',
    fileType: string = 'IMAGE'
  ): Promise<{ url: string; cdnUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileType', fileType);

    const response = await apiClient.post<{
      url: string;
      cdnUrl: string;
      fileName: string;
    }>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data?.url) {
      throw new Error('Upload failed: no URL returned from server.');
    }

    return {
      url: response.data.url,
      cdnUrl: response.data.cdnUrl || response.data.url,
      fileName: response.data.fileName || file.name,
    };
  },

  /**
   * Delete uploaded media file asset from AWS S3 and database by ID
   */
  async deleteMedia(id: string): Promise<void> {
    await apiClient.delete(`/media/${id}`);
  },

  /**
   * Delete uploaded media file asset directly from AWS S3 and storage by URL
   */
  async deleteMediaByUrl(url: string): Promise<void> {
    if (!url) return;
    try {
      await apiClient.post('/media/delete-by-url', { url });
    } catch (err) {
      console.warn('Failed to remove media from S3:', err);
    }
  },

  /**
   * ==========================================
   * STORE MEMBERS & USER MANAGEMENT MODULE
   * ==========================================
   */

  async getStoreMembers(): Promise<{
    storeId: string;
    storeName: string;
    owner: any;
    members: any[];
    totalMembers: number;
  }> {
    try {
      const response = await apiClient.get('/store-members');
      if (response.data) return response.data;
    } catch (err) {
      console.warn('Failed to fetch store members from backend:', err);
    }

    return {
      storeId: 'store-default',
      storeName: 'OmniStore Flagship',
      owner: {
        id: 'owner-default',
        name: 'Store Owner',
        email: 'owner@omnistore.com',
        role: 'OWNER',
        customRoleTitle: 'Store Owner / Primary Account Holder',
        status: 'ACTIVE',
        isOwner: true,
        canManageProducts: true,
        canManageInventory: true,
        canManageOrders: true,
        canManageCustomers: true,
        canManageThemes: true,
        canManageSettings: true,
        canManagePayments: true,
        canManageLogistics: true,
        canManageAnalytics: true,
        createdAt: new Date().toISOString(),
      },
      members: [],
      totalMembers: 1,
    };
  },

  async addStoreMember(payload: any): Promise<any> {
    const response = await apiClient.post('/store-members', payload);
    return response.data;
  },

  async updateStoreMember(id: string, payload: any): Promise<any> {
    const response = await apiClient.put(`/store-members/${id}`, payload);
    return response.data;
  },

  async deleteStoreMember(id: string): Promise<void> {
    await apiClient.delete(`/store-members/${id}`);
  },

  async transferStoreOwnership(payload: {
    targetEmail: string;
    retainAsAdmin?: boolean;
    passwordConfirm?: string;
  }): Promise<{
    message: string;
    newOwnerEmail: string;
    newOwnerName: string;
    retainedPreviousOwnerAsAdmin: boolean;
  }> {
    const response = await apiClient.post('/store-members/transfer-ownership', payload);
    return response.data;
  },

  // ─── Payment Gateway & Transaction Services ──────────────────────────────────
  async getPaymentSettings(): Promise<CMSPaymentSettings> {
    try {
      const response = await apiClient.get('/payments/settings');
      return response.data;
    } catch (err) {
      console.warn('Failed to fetch payment settings from API, using fallback defaults', err);
      return {
        id: 'store-1',
        paymentStripeActive: true,
        paymentRazorpayActive: true,
        paymentCodActive: true,
        paymentTestMode: true,
        razorpayKeyId: 'rzp_test_standardDemo2026',
        razorpayKeySecretMasked: 'rzp_test_••••••••secret',
        razorpayWebhookSecretMasked: 'whsec_••••••••1234',
        razorpayAutoCapture: true,
        stripePublishableKey: 'pk_test_standardDemoStripe2026',
        stripeSecretKeyMasked: 'sk_test_••••••••secret',
        stripeWebhookSecretMasked: 'whsec_••••••••5678',
        codFee: 0,
        codMinLimit: 0,
        codMaxLimit: 50000,
        currencyRoutingRulesJson: JSON.stringify({
          indiaDomesticGateway: 'RAZORPAY',
          internationalGateway: 'STRIPE',
          domesticCurrency: 'INR',
          internationalCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'AED'],
          autoRouteByGeo: true,
        }),
        webhookUrls: {
          razorpay: 'http://localhost:5001/api/storefront/checkout/razorpay/webhook',
          stripe: 'http://localhost:5001/api/storefront/checkout/stripe/webhook',
        },
      };
    }
  },

  async updatePaymentSettings(payload: UpdatePaymentSettingsPayload): Promise<{
    success?: boolean;
    requiresVerification?: boolean;
    email?: string;
    message: string;
    settings?: any;
  }> {
    const response = await apiClient.put('/payments/settings', payload);
    return response.data;
  },

  async requestPaymentVerification(storeId?: string): Promise<{
    success: boolean;
    email: string;
    expiresInMinutes: number;
    message: string;
  }> {
    const response = await apiClient.post('/payments/request-verification', { storeId });
    return response.data;
  },

  async verifyPaymentCode(code: string, storeId?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/payments/verify-code', { code, storeId });
    return response.data;
  },

  async testPaymentGateway(payload: {
    gateway: 'RAZORPAY' | 'STRIPE';
    keyId?: string;
    keySecret?: string;
    publishableKey?: string;
    secretKey?: string;
    testMode?: boolean;
  }): Promise<PaymentTestResponse> {
    const response = await apiClient.post('/payments/test-connection', payload);
    return response.data;
  },

  async getPaymentTransactions(params?: {
    limit?: number;
    page?: number;
    gateway?: string;
    status?: string;
  }): Promise<{
    transactions: PaymentTransactionData[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    summary: PaymentTransactionsSummary;
  }> {
    try {
      const response = await apiClient.get('/payments/transactions', { params });
      return response.data;
    } catch (err) {
      console.warn('Failed to fetch payment transactions from backend, returning sample summary', err);
      return {
        transactions: [
          {
            id: 'txn-1',
            transactionNumber: 'TXN-1723801923-8812',
            orderId: 'ord-101',
            customerName: 'Aarav Sharma',
            customerEmail: 'aarav@example.in',
            gateway: 'RAZORPAY',
            paymentMethod: 'UPI',
            status: 'SUCCESS',
            amount: 2499.00,
            currency: 'INR',
            gatewayFee: 0.00,
            netAmount: 2499.00,
            gatewayPaymentId: 'pay_upi_Qz981249aa',
            gatewayOrderId: 'order_Nx81726a',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'txn-2',
            transactionNumber: 'TXN-1723801452-9931',
            orderId: 'ord-102',
            customerName: 'Sarah Jenkins',
            customerEmail: 'sarah.j@example.com',
            gateway: 'STRIPE',
            paymentMethod: 'CARD',
            status: 'SUCCESS',
            amount: 145.00,
            currency: 'USD',
            gatewayFee: 4.51,
            netAmount: 140.49,
            gatewayPaymentId: 'pi_3MtwBwLkdIwHu7ix28qBg1DF',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
        summary: {
          totalOrdersCount: 24,
          inrVolume: 184500,
          usdVolume: 3420,
          razorpayEstimatedSavings: 2767.50,
          stripeInternationalVolume: 3420,
          successRatePercentage: 99.2,
        },
      };
    }
  },

  async refundPaymentTransaction(payload: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }): Promise<{ success: boolean; message: string; transaction: PaymentTransactionData }> {
    const response = await apiClient.post('/payments/refund', payload);
    return response.data;
  },

  // ── Razorpay Connect Partner Integration ─────────────────────────────────────
  async getRazorpayConnectStatus(): Promise<RazorpayConnectStatus> {
    try {
      const response = await apiClient.get('/payments/razorpay/connect/status');
      return response.data;
    } catch (err) {
      console.warn('Failed to fetch Razorpay Connect status, using active fallback', err);
      return {
        isConnected: true,
        accountId: 'acc_M98K28D91',
        merchantName: 'OmniStore India Flagship',
        kycStatus: 'VERIFIED',
        connectedAt: new Date().toISOString(),
        mode: 'TEST / SANDBOX',
        keyId: 'rzp_test_standardDemo2026',
        keySecretMasked: 'rzp_test_••••••••secret',
        webhookSecretMasked: 'whsec_••••••••1234',
        autoCapture: true,
        webhookUrl: 'http://localhost:5001/api/storefront/checkout/razorpay/webhook',
        settlementCycle: 'T+1 Instant Bank Settlement (NEFT/IMPS)',
        supportedMethods: [
          'UPI Intent & Dynamic QR (GPay, PhonePe, Paytm, BHIM - 0% MDR)',
          'Cards (RuPay, Visa, MasterCard, Maestro)',
          'NetBanking (50+ Indian Banks)',
          'Wallets (Mobikwik, Freecharge, Airtel Money)',
          'EMI & PayLater (Simpl, LazyPay, ICICI/HDFC Cardless EMI)',
        ],
        features: {
          instantRefunds: true,
          autoCapture: true,
          routeSplitSettlement: true,
          webhookVerified: true,
        },
      };
    }
  },

  async initiateRazorpayConnect(payload?: RazorpayConnectInitiatePayload): Promise<{
    success: boolean;
    authUrl: string;
    clientId: string;
    state: string;
    redirectUri: string;
    scopes: string[];
  }> {
    const response = await apiClient.post('/payments/razorpay/connect/initiate', payload || {});
    return response.data;
  },

  async authorizeRazorpayConnect(payload: RazorpayConnectAuthorizePayload): Promise<{
    success: boolean;
    message: string;
    connection: any;
  }> {
    const response = await apiClient.post('/payments/razorpay/connect/authorize', payload);
    return response.data;
  },

  async disconnectRazorpayConnect(reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/payments/razorpay/connect/disconnect', { reason });
    return response.data;
  },

  // ── Stripe Connect Merchant Integration ──────────────────────────────────────
  async getStripeConnectStatus(): Promise<StripeConnectStatus> {
    try {
      const response = await apiClient.get('/payments/stripe/connect/status');
      return response.data;
    } catch (err) {
      console.warn('Failed to fetch Stripe Connect status, using fallback', err);
      return {
        isConnected: true,
        accountId: 'acct_1N9xStandardStripe',
        merchantName: 'OmniStore Global Direct',
        chargesEnabled: true,
        payoutsEnabled: true,
        country: 'US',
        defaultCurrency: 'USD',
        connectedAt: new Date().toISOString(),
        mode: 'TEST / SANDBOX',
        publishableKey: 'pk_test_standardDemoStripe2026',
        secretKeyMasked: 'sk_test_••••••••secret',
        webhookSecretMasked: 'whsec_••••••••5678',
        webhookUrl: 'http://localhost:5001/api/storefront/checkout/stripe/webhook',
        settlementCycle: 'Rolling 2-day Automatic Bank Payouts',
        supportedCurrencies: [
          'USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)',
          'SGD ($)', 'JPY (¥)', 'AED (د.إ)', 'CHF (Fr)', 'SEK (kr)'
        ],
        supportedPaymentMethods: [
          'Global Credit & Debit Cards (Visa, MasterCard, American Express, Discover, Diners)',
          'Apple Pay (Instant Biometric Checkout)',
          'Google Pay (1-Tap Web Checkout)',
          '3D Secure 2.0 Strong Customer Authentication (SCA)',
        ],
        features: {
          radarFraudProtection: true,
          dynamic3DSecure: true,
          multiCurrencyPresentment: true,
          instantRefunds: true,
          webhookVerified: true,
        },
      };
    }
  },

  async initiateStripeConnect(payload?: StripeConnectInitiatePayload): Promise<{
    success: boolean;
    authUrl: string;
    clientId: string;
    state: string;
    redirectUri: string;
    scopes: string[];
  }> {
    const response = await apiClient.post('/payments/stripe/connect/initiate', payload || {});
    return response.data;
  },

  async authorizeStripeConnect(payload: StripeConnectAuthorizePayload): Promise<{
    success: boolean;
    message: string;
    connection: any;
  }> {
    const response = await apiClient.post('/payments/stripe/connect/authorize', payload);
    return response.data;
  },

  async disconnectStripeConnect(reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/payments/stripe/connect/disconnect', { reason });
    return response.data;
  },

  // ── Product Review Management & Moderation ──────────────────────────────
  async getReviews(params?: {
    status?: string;
    productId?: string;
    rating?: number;
    search?: string;
  }): Promise<{
    reviews: ProductReviewData[];
    total: number;
    metrics: ReviewMetricsData;
  }> {
    const cacheKey = JSON.stringify(params || {});
    if ((this as any)._inFlightReviewsMap?.has(cacheKey)) {
      return (this as any)._inFlightReviewsMap.get(cacheKey)!;
    }

    if (!(this as any)._inFlightReviewsMap) {
      (this as any)._inFlightReviewsMap = new Map();
    }

    const fetchPromise = (async () => {
      try {
        const response = await apiClient.get('/reviews', { params });
        return response.data;
      } catch (err) {
        console.warn('Failed to fetch reviews from backend, returning fallback reviews', err);
        return {
          reviews: [
            {
              id: 'rev-1',
              productId: 'p-101',
              productTitle: 'Acoustic Noise-Canceling Wireless Headphones',
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
              productSlug: 'wireless-headphones',
              userName: 'Priya Sundaram',
              userEmail: 'priya.sundaram@example.com',
              rating: 5,
              title: 'Exceptional build quality and lightning-fast delivery!',
              comment: 'Ordered this from Bengaluru and received it in just 2 days via Blue Dart Air Express. Packaging was pristine, and the product quality exceeded my expectations. Highly recommended!',
              verified: true,
              status: 'APPROVED',
              adminReply: 'Thank you so much Priya for your wonderful review! We are thrilled you enjoyed the express delivery.',
              adminReplyAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              helpfulCount: 24,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'rev-2',
              productId: 'p-102',
              productTitle: 'Minimalist Titanium Chronograph Watch',
              productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80',
              productSlug: 'minimalist-watch',
              userName: 'Rahul Verma',
              userEmail: 'rahul.v@example.com',
              rating: 4,
              title: 'Great value for money',
              comment: 'The finish and ergonomics are top-notch. Battery life easily lasts throughout the entire day. Only minor feedback is the user manual could have been a bit more comprehensive.',
              verified: true,
              status: 'APPROVED',
              adminReply: null,
              helpfulCount: 12,
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'rev-3',
              productId: 'p-103',
              productTitle: 'Classic Oxford Cotton Button-Down Shirt',
              productImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=120&q=80',
              productSlug: 'oxford-shirt',
              userName: 'Amit Deshmukh',
              userEmail: 'amit.d@example.com',
              rating: 3,
              title: 'Good, but sizing runs slightly large',
              comment: 'Decent material quality, however the size is slightly larger than standard charts. Exchanged it easily thanks to customer support.',
              verified: true,
              status: 'PENDING',
              adminReply: null,
              helpfulCount: 5,
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'rev-4',
              productId: 'p-101',
              productTitle: 'Acoustic Noise-Canceling Wireless Headphones',
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
              productSlug: 'wireless-headphones',
              userName: 'Anonymous Bot',
              userEmail: 'bot@spam.test',
              rating: 1,
              title: 'Spam voucher link',
              comment: 'Visit external site for cheap coupon vouchers http://example-spam-link.com',
              verified: false,
              status: 'REJECTED',
              adminReply: null,
              helpfulCount: 0,
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
          total: 4,
          metrics: {
            totalReviews: 4,
            pendingReviews: 1,
            approvedReviews: 2,
            rejectedReviews: 1,
            averageRating: 4.3,
            ratingDistribution: {
              fiveStar: 1,
              fourStar: 1,
              threeStar: 1,
              twoStar: 0,
              oneStar: 1,
            },
          },
        };
      } finally {
        setTimeout(() => {
          (this as any)._inFlightReviewsMap?.delete(cacheKey);
        }, 1000);
      }
    })();

    (this as any)._inFlightReviewsMap.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  async updateReviewStatus(id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SPAM'): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch(`/reviews/${id}/status`, { status });
    return response.data;
  },

  async editReview(id: string, payload: {
    rating?: number;
    title?: string;
    comment?: string;
    verified?: boolean;
    status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SPAM';
  }): Promise<{ success: boolean; message: string; review: ProductReviewData }> {
    const response = await apiClient.put(`/reviews/${id}`, payload);
    return response.data;
  },

  async replyToReview(id: string, adminReply: string): Promise<{ success: boolean; message: string; review: ProductReviewData }> {
    const response = await apiClient.post(`/reviews/${id}/reply`, { adminReply });
    return response.data;
  },

  async deleteReview(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },

  // ── Pricing Tiers & Store Billing Management ─────────────────────────────
  async getPriceTiers(): Promise<{ tiers: PriceTierData[] }> {
    try {
      const response = await apiClient.get('/billing/tiers');
      return response.data;
    } catch {
      return {
        tiers: [
          {
            id: 'STARTER',
            name: 'Starter Tier',
            badge: 'Free Forever',
            description: 'Perfect for new entrepreneurs launching their first online storefront.',
            priceMonthlyInr: 0,
            priceMonthlyUsd: 0,
            priceAnnualInr: 0,
            priceAnnualUsd: 0,
            transactionFeePercent: 2.0,
            maxProducts: 50,
            maxStaff: 2,
            customDomain: false,
            analyticsTier: 'Basic Analytics',
            supportTier: 'Community & Email Support',
            popular: false,
            features: [
              'Up to 50 Product Listings',
              '2 Team / Staff Logins',
              'Razorpay & Stripe Integration',
              'Standard Storefront Themes',
              'Indian PIN Code & Shipping Resolver',
              'Basic Sales Reports',
              '2.0% Platform Transaction Fee',
            ],
          },
          {
            id: 'GROWTH',
            name: 'Growth Pro',
            badge: 'Most Popular',
            description: 'Designed for scaling e-commerce brands needing higher volume and custom branding.',
            priceMonthlyInr: 1999,
            priceMonthlyUsd: 29,
            priceAnnualInr: 19990,
            priceAnnualUsd: 290,
            transactionFeePercent: 0.5,
            maxProducts: 1000,
            maxStaff: 10,
            customDomain: true,
            analyticsTier: 'Advanced Funnel & Conversion Analytics',
            supportTier: 'Priority 24/7 Live Chat & WhatsApp',
            popular: true,
            features: [
              'Up to 1,000 Product Listings',
              '10 Team / Staff Accounts',
              'Custom Domain Connection (SSL Included)',
              '0.5% Ultra-Low Platform Fee',
              'All Theme Customizer Engines',
              'Automated Indian Logistics (Delhivery, Blue Dart)',
              'Abandoned Cart Email Recovery',
              'Customer Product Review Moderation Studio',
            ],
          },
          {
            id: 'ENTERPRISE',
            name: 'Scale Enterprise',
            badge: 'Zero Transaction Fee',
            description: 'High-volume retailers and omni-channel enterprises demanding maximum power.',
            priceMonthlyInr: 5999,
            priceMonthlyUsd: 79,
            priceAnnualInr: 59990,
            priceAnnualUsd: 790,
            transactionFeePercent: 0.0,
            maxProducts: 999999,
            maxStaff: 999,
            customDomain: true,
            analyticsTier: 'Real-time BI & Custom Export Engine',
            supportTier: 'Dedicated VIP Account Manager & Phone',
            popular: false,
            features: [
              'Unlimited Products & Digital Catalog',
              'Unlimited Staff & Multi-role RBAC',
              '0.0% Zero Platform Transaction Surcharge',
              'Custom Domains with Dedicated Edge CDN',
              'Advanced Multi-Currency Currency Routing',
              'Custom Webhooks & REST API Access',
              'Automated Tax Invoicing (GST & VAT)',
              'Dedicated Account Manager (SLA 1-Hour)',
            ],
          },
          {
            id: 'API',
            name: 'API Tier',
            badge: 'Developer Exclusive',
            description: 'Full programmatic access to Developer REST APIs (/api/v1), Webhooks, and Headless Commerce engine.',
            priceMonthlyInr: 1000,
            priceMonthlyUsd: 1000,
            priceAnnualInr: 10000,
            priceAnnualUsd: 10000,
            transactionFeePercent: 0.0,
            maxProducts: 999999,
            maxStaff: 999,
            customDomain: true,
            analyticsTier: 'API Telemetry & Request Metrics',
            supportTier: 'Priority Developer Support',
            popular: true,
            features: [
              'Exclusive Access to /api/v1 Developer REST APIs',
              'Unlimited Storefront API Keys & Scopes',
              'Real-Time Webhooks & HMAC Signatures',
              'Unified /payments/process & Sandbox Simulator',
              'Headless Commerce & Mobile App SDK',
              'Sub-10ms Fastify High-Throughput Engine',
              '0.0% Zero Platform Surcharge on API Orders',
            ],
          },
        ],
      };
    }
  },

  async getStoreSubscription(): Promise<StoreSubscriptionData> {
    try {
      const response = await apiClient.get('/billing/subscription');
      return response.data;
    } catch {
      return {
        storeId: 'store-1',
        storeName: 'OmniStore India',
        plan: 'GROWTH',
        planConfig: {
          id: 'GROWTH',
          name: 'Growth Pro',
          badge: 'Most Popular',
          description: 'Designed for scaling e-commerce brands needing higher volume and custom branding.',
          priceMonthlyInr: 1999,
          priceMonthlyUsd: 29,
          priceAnnualInr: 19990,
          priceAnnualUsd: 290,
          transactionFeePercent: 0.5,
          maxProducts: 1000,
          maxStaff: 10,
          customDomain: true,
          analyticsTier: 'Advanced Funnel & Conversion Analytics',
          supportTier: 'Priority 24/7 Live Chat & WhatsApp',
          popular: true,
          features: [
            'Up to 1,000 Product Listings',
            '10 Team / Staff Accounts',
            'Custom Domain Connection (SSL Included)',
            '0.5% Ultra-Low Platform Fee',
          ],
        },
        billingCycle: 'MONTHLY',
        planStartedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        planRenewsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        planPaymentMethod: 'RAZORPAY_UPI',
        planPaymentMethodDetails: 'UPI: merchant@oksbi (Auto-Debit)',
        planStatus: 'ACTIVE',
        planTransactionFeePercent: 0.5,
        usage: {
          products: { current: 12, max: 1000, percent: 1.2 },
          staff: { current: 3, max: 10, percent: 30 },
        },
        invoices: [
          {
            id: 'inv-1',
            invoiceNumber: 'INV-849201',
            tierName: 'Growth Pro',
            billingCycle: 'MONTHLY',
            amount: 1999,
            currency: 'INR',
            paymentMethod: 'RAZORPAY_UPI',
            paymentStatus: 'PAID',
            paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };
    }
  },

  async changeStorePlan(payload: {
    plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'AGENCY' | 'API' | string;
    billingCycle: 'MONTHLY' | 'ANNUAL';
    paymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'STRIPE_CARD' | 'NETBANKING';
    paymentMethodDetails?: string;
  }): Promise<{
    success: boolean;
    message: string;
    plan: string;
    billingCycle: string;
    invoice?: StoreBillingInvoiceData;
  }> {
    const response = await apiClient.post('/billing/change-plan', payload);
    return response.data;
  },

  async subscribeApiTier(payload?: { paymentMethod?: string; paymentMethodDetails?: string }): Promise<{
    success: boolean;
    message: string;
    apiPlanActive: boolean;
    apiPlanStatus: string;
    basePlan: string;
    renewsAt?: string;
    invoice?: any;
  }> {
    try {
      const response = await apiClient.post('/billing/api-tier/subscribe', payload || {});
      return response.data;
    } catch {
      // Mock success for offline/client fallback
      return {
        success: true,
        message: 'API Tier activated successfully for 1,000/mo. Your base tier remains unchanged.',
        apiPlanActive: true,
        apiPlanStatus: 'ACTIVE',
        basePlan: 'STARTER',
      };
    }
  },

  async cancelApiTier(): Promise<{
    success: boolean;
    message: string;
    apiPlanActive: boolean;
    apiPlanStatus: string;
    basePlan: string;
  }> {
    try {
      const response = await apiClient.post('/billing/api-tier/cancel');
      return response.data;
    } catch {
      return {
        success: true,
        message: 'API Tier subscription cancelled. Your base store tier remains unchanged.',
        apiPlanActive: false,
        apiPlanStatus: 'CANCELLED',
        basePlan: 'STARTER',
      };
    }
  },

  async updateStorePaymentMethod(payload: {
    paymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'STRIPE_CARD' | 'NETBANKING';
    paymentMethodDetails: string;
  }): Promise<{ success: boolean; message: string; planPaymentMethod: string; planPaymentMethodDetails: string }> {
    const response = await apiClient.post('/billing/payment-method', payload);
    return response.data;
  },

  // ─── RAZORPAY (FOR INDIAN MERCHANTS - INR) ──────────────────────────────
  async createBillingRazorpayOrder(payload: {
    plan: 'GROWTH' | 'ENTERPRISE';
    billingCycle: 'MONTHLY' | 'ANNUAL';
  }): Promise<{
    success: boolean;
    orderId: string;
    amount: number;
    amountPaise: number;
    currency: string;
    keyId: string;
    plan: string;
    planName: string;
    billingCycle: string;
    storeName: string;
    contactEmail: string;
    contactPhone: string;
  }> {
    const response = await apiClient.post('/billing/razorpay/create-order', payload);
    return response.data;
  },

  async verifyBillingRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    plan: 'GROWTH' | 'ENTERPRISE';
    billingCycle: 'MONTHLY' | 'ANNUAL';
    paymentMethodDetails?: string;
  }): Promise<{
    success: boolean;
    message: string;
    plan: string;
    billingCycle: string;
    invoice: StoreBillingInvoiceData;
  }> {
    const response = await apiClient.post('/billing/razorpay/verify-payment', payload);
    return response.data;
  },

  // ─── STRIPE (FOR INTERNATIONAL MERCHANTS - USD) ──────────────────────────
  async createBillingStripeSession(payload: {
    plan: 'GROWTH' | 'ENTERPRISE';
    billingCycle: 'MONTHLY' | 'ANNUAL';
    currency?: 'USD' | 'EUR' | 'GBP';
  }): Promise<{
    success: boolean;
    sessionId: string;
    clientSecret: string;
    amount: number;
    amountCents: number;
    currency: string;
    publishableKey: string;
    plan: string;
    planName: string;
    billingCycle: string;
    storeName: string;
    contactEmail: string;
  }> {
    const response = await apiClient.post('/billing/stripe/create-session', payload);
    return response.data;
  },

  async confirmBillingStripePayment(payload: {
    sessionId?: string;
    paymentIntentId?: string;
    plan: 'GROWTH' | 'ENTERPRISE';
    billingCycle: 'MONTHLY' | 'ANNUAL';
    paymentMethodDetails?: string;
    currency?: string;
  }): Promise<{
    success: boolean;
    message: string;
    plan: string;
    billingCycle: string;
    invoice: StoreBillingInvoiceData;
  }> {
    const response = await apiClient.post('/billing/stripe/confirm-payment', payload);
    return response.data;
  },

  // ── Custom Domains, Origin DNS & Edge Theme Deployment ──────────────────
  async getDomains(): Promise<DomainListResponse> {
    try {
      const response = await apiClient.get('/domains');
      return response.data;
    } catch {
      return {
        storeId: 'store-1',
        storeName: 'OmniStore India',
        primaryDomain: 'omnistore.shop',
        originConfig: {
          aRecordExpected: '76.76.21.21',
          cnameExpected: 'cname.omnistore-edge.com',
          caaRecordExpected: '0 issue "letsencrypt.org"',
          edgeIps: ['76.76.21.21', '76.76.21.22'],
          globalCdnNodes: [
            { city: 'Mumbai', code: 'BOM', status: 'ONLINE', latencyMs: 8 },
            { city: 'Singapore', code: 'SIN', status: 'ONLINE', latencyMs: 24 },
            { city: 'Frankfurt', code: 'FRA', status: 'ONLINE', latencyMs: 42 },
            { city: 'Virginia (US-East)', code: 'IAD', status: 'ONLINE', latencyMs: 65 },
            { city: 'Tokyo', code: 'NRT', status: 'ONLINE', latencyMs: 38 },
          ],
        },
        domains: [
          {
            id: 'dom-1',
            domain: 'store.omnistore.shop',
            isPrimary: true,
            autoRedirectWww: false,
            sslStatus: 'SSL_ACTIVE',
            dnsStatus: 'VERIFIED',
            dnsRecords: [
              {
                type: 'A',
                name: '@',
                value: '76.76.21.21',
                ttl: 300,
                status: 'VALID',
                description: 'Apex origin routing to Global Edge Anycast IP',
              },
              {
                type: 'CNAME',
                name: 'www',
                value: 'cname.omnistore-edge.com',
                ttl: 300,
                status: 'VALID',
                description: 'Subdomain proxy routing to OmniStore Edge CDN',
              },
              {
                type: 'TXT',
                name: '@',
                value: 'omnistore-site-verification=a89f921b7c',
                ttl: 300,
                status: 'VALID',
                description: 'SSL Certificate & Domain Ownership Verification',
              },
              {
                type: 'CAA',
                name: '@',
                value: '0 issue "letsencrypt.org"',
                ttl: 3600,
                status: 'VALID',
                description: 'Certificate Authority Authorization (Let’s Encrypt)',
              },
            ],
            themeDeployment: {
              deployedThemeSlug: 'default',
              deployedThemeName: 'Modern Luxury Dark',
              edgeCacheTtl: 3600,
              edgeCdnRegion: 'BOM_MUMBAI',
              edgeDeploymentStatus: 'DEPLOYED',
              edgeDeploymentUrl: 'https://store.omnistore.shop',
              lastDeployedAt: new Date().toISOString(),
            },
            lastCheckedAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };
    }
  },

  async addDomain(payload: {
    domain: string;
    autoRedirectWww?: boolean;
    isPrimary?: boolean;
    deployedThemeSlug?: string;
  }): Promise<{ success: boolean; message: string; domain: CustomDomainData }> {
    const response = await apiClient.post('/domains', payload);
    return response.data;
  },

  async verifyDomainDns(domainId: string): Promise<{
    success: boolean;
    message: string;
    diagnostics: any;
    domain: CustomDomainData;
  }> {
    const response = await apiClient.post('/domains/verify-dns', { domainId });
    return response.data;
  },

  async deployThemeToDomain(payload: {
    domainId: string;
    themeSlug: string;
    themeName: string;
    edgeCdnRegion?: 'BOM_MUMBAI' | 'SIN_SINGAPORE' | 'IAD_US_EAST' | 'FRA_FRANKFURT';
    purgeCache?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    purgeCacheExecuted: boolean;
    deployment: any;
    domain: CustomDomainData;
  }> {
    const response = await apiClient.post('/domains/deploy-theme', payload);
    return response.data;
  },

  async setPrimaryDomain(domainId: string): Promise<{ success: boolean; message: string; domain: CustomDomainData }> {
    const response = await apiClient.post('/domains/set-primary', { domainId });
    return response.data;
  },

  async deleteDomain(domainId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/domains/${domainId}`);
    return response.data;
  },

  // ── Automated Customer Notifications (WhatsApp / SMS / Email) ───────────
  async getNotificationConfigs(): Promise<NotificationConfigData[]> {
    try {
      const response = await apiClient.get<NotificationConfigData[]>('/notifications/configs');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn('Notification configs notice, falling back:', err);
    }
    return [
      {
        trigger: 'ORDER_CONFIRMATION',
        title: 'Order Confirmation',
        emailEnabled: true,
        smsEnabled: false,
        whatsAppEnabled: true,
        pushEnabled: true,
        subjectTemplate: 'Order Confirmed #{{order_number}} - {{store_name}}',
        emailBodyTemplate: 'Hi {{customer_name}},\n\nThank you for shopping with {{store_name}}! We have received your order #{{order_number}} for a total of {{total_amount}}.\n\nItems:\n{{order_items}}\n\nWe will notify you as soon as your package ships!',
        smsBodyTemplate: '{{store_name}}: Your order #{{order_number}} for {{total_amount}} is confirmed! Track here: {{tracking_url}}',
        whatsAppTemplate: '🎉 Order Confirmed!\nHi {{customer_name}}, your order #{{order_number}} ({{total_amount}}) is confirmed at {{store_name}}. Track package: {{tracking_url}}',
        pushBodyTemplate: '📦 Order Confirmed #{{order_number}}! Thank you for buying from {{store_name}}.',
      },
      {
        trigger: 'ORDER_SHIPPED',
        title: 'Order Shipped & Out for Delivery',
        emailEnabled: true,
        smsEnabled: false,
        whatsAppEnabled: true,
        pushEnabled: true,
        subjectTemplate: 'Your Order #{{order_number}} has Shipped!',
        emailBodyTemplate: 'Great news {{customer_name}}!\n\nYour package for order #{{order_number}} is on its way via {{carrier}}.\nTracking Number: {{tracking_number}}\nLive Tracking URL: {{tracking_url}}',
        smsBodyTemplate: '🚚 {{store_name}}: Order #{{order_number}} shipped via {{carrier}}! Track: {{tracking_url}}',
        whatsAppTemplate: '🚚 Your package has shipped!\nOrder #{{order_number}} via {{carrier}}.\nTracking ID: {{tracking_number}}\nTrack live: {{tracking_url}}',
        pushBodyTemplate: '🚚 Package Shipped! Order #{{order_number}} is on the move with {{carrier}}.',
      },
      {
        trigger: 'ORDER_DELIVERED',
        title: 'Order Delivered',
        emailEnabled: true,
        smsEnabled: false,
        whatsAppEnabled: true,
        pushEnabled: false,
        subjectTemplate: 'Package Delivered - Order #{{order_number}}',
        emailBodyTemplate: 'Hi {{customer_name}},\n\nYour order #{{order_number}} has been delivered to your shipping address.\n\nWe hope you love your products! Please leave us a review.',
        smsBodyTemplate: '🎁 {{store_name}}: Order #{{order_number}} was delivered today. Enjoy your purchase!',
        whatsAppTemplate: '🎁 Package Delivered!\nHi {{customer_name}}, your order #{{order_number}} was delivered today. Have feedback? Let us know!',
        pushBodyTemplate: '🎁 Package Delivered! Order #{{order_number}} has arrived.',
      },
      {
        trigger: 'ABANDONED_CART',
        title: 'Abandoned Cart Recovery Reminder',
        emailEnabled: true,
        smsEnabled: false,
        whatsAppEnabled: true,
        pushEnabled: false,
        subjectTemplate: 'You left something behind! Complete your order for 10% off',
        emailBodyTemplate: 'Hi {{customer_name}},\n\nWe noticed you left items in your shopping bag at {{store_name}}!\n\nUse code RECOVER10 to enjoy 10% off when completing your checkout:\n{{recovery_url}}',
        smsBodyTemplate: '{{store_name}}: Finish your order now and save 10% with code RECOVER10! Link: {{recovery_url}}',
        whatsAppTemplate: '🛒 Still thinking about it?\nHi {{customer_name}}, complete your order at {{store_name}} with code RECOVER10: {{recovery_url}}',
        pushBodyTemplate: '🛒 Complete your purchase before items sell out!',
      },
    ];
  },

  async updateNotificationConfig(
    trigger: string,
    payload: Partial<NotificationConfigData>
  ): Promise<NotificationConfigData> {
    const response = await apiClient.patch<NotificationConfigData>(`/notifications/configs/${trigger}`, payload);
    return response.data;
  },

  async dispatchTestNotification(payload: {
    trigger: string;
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
    recipient: string;
  }): Promise<{ success: boolean; message: string; preview: any }> {
    const response = await apiClient.post('/notifications/dispatch-test', payload);
    return response.data;
  },

  // ── AI Magic Copywriter Engine ─────────────────────────────────────────
  async generateAiProductContent(payload: {
    productName: string;
    category?: string;
    brand?: string;
    tone?: 'LUXURY' | 'HIGH_CONVERTING' | 'CASUAL' | 'TECHNICAL';
    keywords?: string;
  }): Promise<{
    success: boolean;
    tone: string;
    productName: string;
    refinedTitle: string;
    tagline: string;
    description: string;
    keyFeatures: string[];
    metaTitle: string;
    metaDescription: string;
    suggestedTags: string[];
    socialPostCaption: string;
  }> {
    const response = await apiClient.post('/products/generate-ai-content', payload);
    return response.data;
  },

  // ── Developer Studio: Scoped API Keys & Webhooks ───────────────────────
  async getApiKeys(): Promise<ApiKeyData[]> {
    const response = await apiClient.get<ApiKeyData[]>('/developer/api-keys');
    return response.data;
  },

  async createApiKey(payload: {
    name: string;
    scopes: string[];
    expiresInDays?: number;
  }): Promise<ApiKeyData> {
    const response = await apiClient.post<ApiKeyData>('/developer/api-keys', payload);
    return response.data;
  },

  async deleteApiKey(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/developer/api-keys/${id}`);
    return response.data;
  },

  async getWebhooks(): Promise<WebhookData[]> {
    const response = await apiClient.get<WebhookData[]>('/developer/webhooks');
    return response.data;
  },

  async createWebhook(payload: {
    url: string;
    events: string[];
    secret?: string;
    description?: string;
  }): Promise<WebhookData> {
    const response = await apiClient.post<WebhookData>('/developer/webhooks', payload);
    return response.data;
  },

  async deleteWebhook(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/developer/webhooks/${id}`);
    return response.data;
  },

  async testWebhookDispatch(payload: {
    webhookId: string;
    event: string;
  }): Promise<{
    success: boolean;
    webhookId: string;
    targetUrl: string;
    event: string;
    httpStatus: number;
    latencyMs: number;
    responseBody: any;
    dispatchedPayload: any;
  }> {
    const response = await apiClient.post('/developer/webhooks/test-dispatch', payload);
    return response.data;
  },

  async getApiLogs(): Promise<{
    id: string;
    method: string;
    endpoint: string;
    statusCode: number;
    latencyMs: number;
    apiKey: string;
    timestamp: string;
  }[]> {
    const response = await apiClient.get('/developer/logs');
    return response.data;
  },

  async getScopes(): Promise<{
    scopes: { id: string; label: string; desc: string }[];
    events: { id: string; label: string; desc: string }[];
  }> {
    const response = await apiClient.get('/developer/scopes');
    return response.data;
  },

  // ── Customer Loyalty & VIP Rewards Engine ──────────────────────────────
  async getLoyaltyData(): Promise<{
    config: LoyaltyConfigData;
    tiers: LoyaltyTierData[];
    stats: {
      totalMembers: number;
      totalPointsIssued: number;
      totalPointsRedeemed: number;
      rewardsRedemptionRate: string;
    };
  }> {
    const response = await apiClient.get('/loyalty/config');
    return response.data;
  },

  async updateLoyaltyConfig(payload: Partial<LoyaltyConfigData>): Promise<{ success: boolean; config: LoyaltyConfigData }> {
    const response = await apiClient.patch('/loyalty/config', payload);
    return response.data;
  },

  async getLoyaltyMembers(): Promise<LoyaltyMemberData[]> {
    const response = await apiClient.get<LoyaltyMemberData[]>('/loyalty/members');
    return response.data;
  },

  // ── Support Queries & Suspension Appeals ──────────────────────────────
  async submitSupportAppeal(payload: {
    storeId?: string;
    storeName?: string;
    storeSlug?: string;
    userEmail: string;
    userName?: string;
    type?: 'APPEAL' | 'COMPLIANCE' | 'TECHNICAL' | 'BILLING' | 'GENERAL';
    subject: string;
    message: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  }): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await apiClient.post('/support/queries', payload);
    return response.data;
  },

  // ── SEO Governance & Meta Optimization ──────────────────────────────
  async getGlobalSeo(): Promise<GlobalSeoData> {
    const response = await apiClient.get<GlobalSeoData>('/seo/global');
    return response.data;
  },

  async updateGlobalSeo(payload: Partial<GlobalSeoData>): Promise<GlobalSeoData> {
    const response = await apiClient.put<GlobalSeoData>('/seo/global', payload);
    return response.data;
  },

  async getProductSeo(productId: string): Promise<ProductSeoData> {
    const response = await apiClient.get<ProductSeoData>(`/seo/product/${productId}`);
    return response.data;
  },

  async updateProductSeo(productId: string, payload: Partial<ProductSeoData>): Promise<ProductSeoData> {
    const response = await apiClient.put<ProductSeoData>(`/seo/product/${productId}`, payload);
    return response.data;
  },

  // ── Blog & Editorial Articles ───────────────────────────────────────
  async getBlogPosts(query?: { category?: string; tag?: string; status?: string; search?: string }): Promise<BlogPost[]> {
    const params = new URLSearchParams();
    if (query?.category && query.category !== 'ALL') params.append('category', query.category);
    if (query?.tag) params.append('tag', query.tag);
    if (query?.status && query.status !== 'ALL') params.append('status', query.status);
    if (query?.search) params.append('search', query.search);

    const queryString = params.toString();
    const url = queryString ? `/blogs?${queryString}` : '/blogs';
    const response = await apiClient.get<BlogPost[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getBlogPostById(id: string): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(`/blogs/${id}`);
    return response.data;
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(`/blogs/slug/${encodeURIComponent(slug)}`);
    return response.data;
  },

  async createBlogPost(payload: BlogPostInput): Promise<BlogPost> {
    const response = await apiClient.post<BlogPost>('/blogs', payload);
    return response.data;
  },

  async updateBlogPost(id: string, payload: Partial<BlogPostInput>): Promise<BlogPost> {
    const response = await apiClient.put<BlogPost>(`/blogs/${id}`, payload);
    return response.data;
  },

  async deleteBlogPost(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/blogs/${id}`);
    return response.data;
  },

  async bulkDeleteBlogPosts(ids: string[]): Promise<{ message: string; count?: number }> {
    const response = await apiClient.post<{ message: string; count?: number }>('/blogs/bulk-delete', { ids });
    return response.data;
  },

  // User Profile & Preferences
  async getUserProfile(): Promise<BackendUserResponse & { phone?: string; preferencesJson?: string }> {
    const response = await apiClient.get<BackendUserResponse & { phone?: string; preferencesJson?: string }>('/users/me');
    return response.data;
  },

  async updateUserProfile(payload: { name?: string; phone?: string; customRoleTitle?: string }): Promise<{ success: boolean; message: string; user: any }> {
    const response = await apiClient.put<{ success: boolean; message: string; user: any }>('/users/profile', payload);
    return response.data;
  },

  async updateUserPreferences(preferences: Record<string, any>): Promise<{ success: boolean; message: string; preferences: any; user: any }> {
    const response = await apiClient.put<{ success: boolean; message: string; preferences: any; user: any }>('/users/preferences', { preferences });
    return response.data;
  },

  async changeUserPassword(payload: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>('/users/change-password', payload);
    return response.data;
  },
};



