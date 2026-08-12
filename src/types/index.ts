export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'active' | 'draft' | 'archived';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded' | 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CMSOrderItem {
  productId: string;
  productName: string;
  sku?: string;
  image?: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface CMSOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  subtotalAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  currency?: string;
  paymentStatus: PaymentStatus | string;
  orderStatus: OrderStatus | string;
  fulfillmentStatus?: string;
  itemsCount: number;
  createdAt: string;
  items?: CMSOrderItem[];
  shippingAddress?: OrderShippingAddress;
  carrier?: string | null;
  trackingNumber?: string | null;
  cancellationReason?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  notes?: OrderNote[];
}

export interface CMSProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  inventory: number;
}

export interface CMSProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  image?: string;
  sku: string;
  price: number;
  originalPrice?: number | null;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  taxRate?: number | null;
  taxable?: boolean;
  isTaxInclusive?: boolean;
  inventory: number;
  stockQuantity: number;
  weight?: number | null;
  dimensions?: string | null;
  variants?: CMSProductVariant[];
  sizeOptions?: string[];
  colorOptions?: string[];
  material?: string | null;
  tags?: string[];
  brandName?: string | null;
  categoryName?: string | null;
  category: string;
  collectionName?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: ProductStatus | string;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  images?: string[];
  image?: string;
  sku: string;
  category?: string;
  price: number | string;
  originalPrice?: number | string;
  compareAtPrice?: number | string;
  costPrice?: number | string;
  taxRate?: number | string;
  taxable?: boolean;
  isTaxInclusive?: boolean;
  inventory?: number | string;
  stockQuantity?: number | string;
  weight?: number | string;
  dimensions?: string;
  sizeOptions?: string[];
  colorOptions?: string[];
  material?: string;
  tags?: string;
  brandName?: string;
  categoryName?: string;
  collectionName?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: ProductStatus | string;
}

export interface BrandData {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  status: string;
  productCount?: number;
  createdAt?: string;
}

export interface BrandFormData {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  status?: string;
}

export type CollectionType = 'MANUAL' | 'AUTOMATIC';
export type RuleField = 'title' | 'category' | 'brand' | 'tag' | 'price' | 'inventory' | 'compareAtPrice';
export type RuleOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'is_set' | 'is_not_set';

export interface CollectionRule {
  id?: string;
  field: RuleField | string;
  operator: RuleOperator | string;
  value: string;
}

export interface CollectionData {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  type?: CollectionType | string;
  rules?: CollectionRule[];
  ruleMatch?: 'ALL' | 'ANY' | string;
  manualProductIds?: string[];
  featured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  productCount?: number;
  createdAt?: string;
}

export interface CollectionFormData {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  type?: string;
  rules?: CollectionRule[];
  ruleMatch?: string;
  manualProductIds?: string[];
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductReviewData {
  id: string;
  productId: string;
  productName?: string;
  userName: string;
  userEmail?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  createdAt: string;
}

export interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount: number;
  description?: string;
  createdAt?: string;
}

export interface InventoryHealthMetrics {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  noImagesProducts: number;
  noPriceProducts: number;
  noInventoryProducts: number;
}

export interface CustomerAnalyticsMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  repeatPurchaseRate: number;
  topCustomers: { name: string; email: string; orders: number; totalSpent: number }[];
}

export interface StoreFunnelMetrics {
  visitors: number;
  sessions: number;
  pageViews: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  conversionRate: number;
}

export interface MarketingAnalyticsMetrics {
  activeDiscounts: number;
  couponUsage: number;
  abandonedCartsCount: number;
  abandonedCartsValue: number;
  emailCampaignsCount: number;
  referralOrdersCount: number;
}

export interface PaymentAnalyticsMetrics {
  successfulAmount: number;
  failedAmount: number;
  pendingAmount: number;
  refundsAmount: number;
  breakdown: {
    razorpay: number;
    stripe: number;
    cod: number;
    upi: number;
  };
}

export interface ShippingOperationsMetrics {
  awaitingShipment: number;
  shipped: number;
  delivered: number;
  failedDeliveries: number;
  returns: number;
  rto: number;
  shippingCostTotal: number;
}

export interface OnboardingChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  actionUrl?: string;
}

export interface OnboardingProgressData {
  percentage: number;
  items: OnboardingChecklistItem[];
}

export interface DashboardStats {
  // Top-level KPI cards
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  conversionRate: number;
  refundsTotal: number;
  pendingPaymentsTotal: number;
  lowStockCount: number;
  revenueGrowth: number;
  ordersGrowth: number;

  // Analytics sub-structures
  inventoryHealth?: InventoryHealthMetrics;
  customerAnalytics?: CustomerAnalyticsMetrics;
  storeFunnel?: StoreFunnelMetrics;
  marketingSummary?: MarketingAnalyticsMetrics;
  paymentMetrics?: PaymentAnalyticsMetrics;
  shippingOperations?: ShippingOperationsMetrics;
  onboardingProgress?: OnboardingProgressData;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MerchantUser {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password?: string;
}

export interface StoreDetails {
  storeName: string;
  tagline?: string;
  category?: string;
  currency: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface StoreSetupData {
  id?: string;
  name: string;
  slug: string;
  logo?: string | null;
  favicon?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZip?: string | null;
  addressCountry?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  socialLinkedin?: string | null;
  socialYoutube?: string | null;
  socialTiktok?: string | null;
  socialPinterest?: string | null;
  customDomain?: string | null;
  domainStatus?: string;
  currency: string;
  language: string;
  timezone: string;
}

export interface ThemeConfigData {
  activeTemplateSlug: string;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  themeBackgroundColor: string;
  themeTextColor: string;
  themeAccentColor: string;
  themeHeadingFont: string;
  themeBodyFont: string;
  themeFontSize: string;
  themeBorderRadius: string;
  themeButtonStyle: string;
  themeLayoutWidth: string;
  headerStyle: string;
  headerSticky: boolean;
  headerAnnouncement: string;
  headerShowSearch: boolean;
  headerShowCurrency: boolean;
  footerStyle: string;
  footerCopyright: string;
  footerShowSocial: boolean;
  footerShowNewsletter: boolean;
  footerShowPaymentBadges: boolean;
}

export type PageType = 'SYSTEM' | 'POLICY' | 'BRAND' | 'CUSTOM';
export type PageStatus = 'PUBLISHED' | 'DRAFT';

export interface CMSPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  pageType: PageType | string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: PageStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  pageType: PageType | string;
  metaTitle?: string;
  metaDescription?: string;
  status: PageStatus | string;
}

export interface StoreTemplate {
  id: string;
  slug?: string;
  name: string;
  tagline: string;
  description: string;
  previewImage: string;
  accentColor: string;
  badge: string;
  features: string[];
}

export interface StoreIndustryCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface MerchantOnboardingData {
  merchant: MerchantUser;
  store?: StoreDetails;
  selectedTemplate?: StoreTemplate;
  firstProduct?: ProductFormData;
}

export interface BackendUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  verificationToken?: string | null;
  createdAt?: string;
  stores?: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    status: string;
  }[];
}

export interface CheckEmailResponse {
  available: boolean;
  message: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  verificationToken?: string | null;
}

export interface VerifyEmailResponse {
  message: string;
  emailVerified: boolean;
}

export interface MegaMenuConfig {
  bannerImage?: string;
  headline?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface CMSMenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank' | string;
  isMegaMenu?: boolean;
  megaMenuConfig?: MegaMenuConfig;
  children?: CMSMenuItem[];
}

export interface CMSMenuData {
  id: string;
  title: string;
  handle: string;
  location: 'HEADER' | 'FOOTER' | 'MOBILE' | string;
  items: CMSMenuItem[];
  itemsJson?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  requiresVerification?: boolean;
  accessToken?: string;
  email?: string;
  verificationToken?: string | null;
  message?: string;
}

export interface ResendCodeResponse {
  message: string;
  email: string;
  verificationToken?: string | null;
}

export type CustomerGroup = 'NEW' | 'RETURNING' | 'VIP' | 'WHOLESALE';

export interface CustomerAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CustomerNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CMSCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  group: CustomerGroup | string;
  tags: string[];
  address?: CustomerAddress;
  acceptsMarketing: boolean;
  acceptsSMSMarketing?: boolean;
  notes?: CustomerNote[];
  totalOrders: number;
  totalSpent: number;
  avatarUrl?: string;
  createdAt: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
export type DiscountMethod = 'COUPON_CODE' | 'AUTOMATIC';
export type DiscountAppliesTo = 'ALL' | 'PRODUCTS' | 'COLLECTIONS';
export type DiscountCustomerEligibility = 'ALL' | 'GROUPS' | 'SPECIFIC';

export interface CMSDiscount {
  id: string;
  title: string;
  code?: string | null;
  discountType: DiscountType | string;
  method: DiscountMethod | string;
  value: number;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  getDiscountPercent?: number | null;
  minOrderAmount?: number | null;
  appliesTo: DiscountAppliesTo | string;
  targetIds?: string[];
  customerEligibility: DiscountCustomerEligibility | string;
  targetCustomers?: string[];
  usageLimit?: number | null;
  usageCount: number;
  oncePerCustomer: boolean;
  startDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'DRAFT' | string;
  createdAt?: string;
}

export type ShippingRateType = 'FLAT' | 'FREE' | 'WEIGHT_BASED' | 'PRICE_BASED';

export interface ShippingRate {
  id: string;
  name: string;
  type: ShippingRateType | string;
  price: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  minOrderPrice?: number;
  maxOrderPrice?: number;
}

export interface CMSShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface CMSShippingProvider {
  id: string;
  name: string;
  carrierCode: 'FEDEX' | 'DHL' | 'UPS' | 'USPS' | string;
  trackingUrl: string;
  isActive: boolean;
  apiKey?: string;
}

export interface HsnSacCode {
  id: string;
  code: string;
  description: string;
  taxRate: number;
  type: 'HSN' | 'SAC';
}

export interface CMSTaxRegion {
  id: string;
  name: string;
  country: string;
  taxName: 'GST' | 'VAT' | 'Sales Tax' | string;
  taxNumber?: string | null;
  standardRate: number;
  reducedRate?: number | null;
  isTaxInclusive: boolean;
  hsnSacCodes?: HsnSacCode[];
}

export type MarketingChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'CAMPAIGN';

export interface CMSMarketingCampaign {
  id: string;
  title: string;
  channel: MarketingChannel | string;
  status: 'ACTIVE' | 'SENT' | 'DRAFT' | 'SCHEDULED' | string;
  targetSegment: string;
  subject?: string | null;
  body?: string | null;
  sentCount: number;
  clickCount: number;
  conversionCount: number;
  revenueTotal: number;
  scheduledAt?: string | null;
  createdAt?: string;
}

export interface CMSPixelConfig {
  ga4MeasurementId?: string | null;
  metaPixelId?: string | null;
  tikTokPixelId?: string | null;
  pinterestTagId?: string | null;
  isGa4Active?: boolean;
  isMetaActive?: boolean;
  isTikTokActive?: boolean;
  isPinterestActive?: boolean;
}

export interface AbandonedCartData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemsCount: number;
  cartSubtotal: number;
  abandonedAt: string;
  status: 'ABANDONED' | 'RECOVERED' | 'EMAIL_SENT';
  recoveryDiscountCode?: string;
}


