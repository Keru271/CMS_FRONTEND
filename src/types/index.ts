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
  name?: string;
  sku?: string;
  image?: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
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
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  inventory: number;
  image?: string;
  options?: Record<string, string>;
  size?: string;
  color?: string;
  material?: string;
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
  variantsJson?: string | null;
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
  variants?: CMSProductVariant[];
  variantsJson?: string | null;
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
  productTitle?: string;
  productName?: string;
  productImage?: string;
  productSlug?: string;
  userName: string;
  userEmail?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SPAM';
  adminReply?: string | null;
  adminReplyAt?: string | null;
  helpfulCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewMetricsData {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export interface ReviewsApiResponse {
  reviews: ProductReviewData[];
  total: number;
  metrics: ReviewMetricsData;
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
  totalSales?: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  conversionRate: number;
  todaySales?: number;
  todayOrders?: number;
  refundsTotal?: number;
  pendingPaymentsTotal?: number;
  lowStockCount?: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  pipeline?: { pending: number; processing: number; shipped: number; readyForPickup: number };
  healthAlerts?: { outOfStock: number; lowStock: number; unfulfilledHighValue: number; uncapturedPayments: number };
  revenueTrend?: { date: string; revenue: number; orders: number }[];
  salesByChannel?: { channel: string; percentage: number; revenue: number }[];
  topProducts?: any[];
  salesForecast?: any;

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
  role?: StoreMemberRole | string;
  customRoleTitle?: string | null;
  permissions?: {
    canManageProducts?: boolean;
    canManageInventory?: boolean;
    canManageOrders?: boolean;
    canManageCustomers?: boolean;
    canManageThemes?: boolean;
    canManageSettings?: boolean;
    canManagePayments?: boolean;
    canManageLogistics?: boolean;
    canManageAnalytics?: boolean;
  };
}

export interface StoreDetails {
  id?: string;
  slug?: string;
  storeName: string;
  tagline?: string;
  category?: string;
  currency: string;
  status?: string;
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

export interface CMSStore {
  id: string;
  name: string;
  slug: string;
  currency: string;
  status: string;
  description?: string | null;
  logoUrl?: string | null;
  activeTemplateSlug?: string | null;
  template?: {
    name: string;
    slug: string;
  } | null;
  createdAt?: string;
}

export interface CreateStorePayload {
  name: string;
  slug: string;
  description?: string;
  currency?: string;
  templateId?: string;
  templateSlug?: string;
  categoryId?: string;
  categoryName?: string;
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
  customRoleTitle?: string | null;
  emailVerified: boolean;
  verificationToken?: string | null;
  createdAt?: string;
  stores?: CMSStore[];
  storeMemberships?: {
    id: string;
    storeId: string;
    role: string;
    customRoleTitle?: string;
    status: string;
    canManageProducts: boolean;
    canManageInventory: boolean;
    canManageOrders: boolean;
    canManageCustomers: boolean;
    canManageThemes: boolean;
    canManageSettings: boolean;
    canManagePayments: boolean;
    canManageLogistics: boolean;
    canManageAnalytics: boolean;
    store?: CMSStore;
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

export interface RateShoppingPolicy {
  id?: string;
  priority: 'CHEAPEST' | 'FASTEST' | 'PREFERRED';
  preferredCarrierCode: string;
  fallbackEnabled: boolean;
  codEnabled: boolean;
  codMarkupAmount: number;
  freeShippingThreshold: number;
  maxTransitDays: number;
}

export interface CarrierCredential {
  id?: string;
  carrierCode: string;
  carrierName: string;
  apiKey?: string;
  apiSecret?: string;
  accountNumber?: string;
  endpointUrl?: string;
  sandboxMode: boolean;
  isActive: boolean;
  settingsJson?: string;
}

export interface CMSShipment {
  id: string;
  orderId: string;
  orderNumber: string;
  providerId: string;
  carrierCode: string;
  carrierName: string;
  serviceType: string;
  serviceName?: string;
  awbNumber: string;
  trackingStatus: 'MANIFESTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RTO' | 'CANCELLED' | string;
  shippingLabelUrl?: string;
  shippingCost: number;
  codAmount: number;
  isCod: boolean;
  packageWeightKg: number;
  originPincode?: string;
  destinationPincode?: string;
  destinationCity?: string;
  destinationState?: string;
  estimatedDelivery?: string;
  timelineJson?: string;
  createdAt: string;
}

export interface CMSNdrRecord {
  id: string;
  shipmentId: string;
  orderId: string;
  orderNumber: string;
  awbNumber: string;
  carrierCode: string;
  carrierName: string;
  attemptCount: number;
  failureReason: string;
  ndrStatus: 'PENDING' | 'REATTEMPT_REQUESTED' | 'RESOLVED' | 'RTO_REQUESTED' | string;
  customerPhone?: string;
  customerAddressJson?: string;
  actionHistoryJson?: string;
  lastAttemptAt: string;
  createdAt: string;
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
  items?: { name: string; quantity: number; price: number; image?: string }[];
  cartSubtotal: number;
  abandonedAt: string;
  status: 'ABANDONED' | 'RECOVERED' | 'EMAIL_SENT' | 'WHATSAPP_SENT' | 'SMS_SENT' | string;
  recoveryDiscountCode?: string;
  recoveryToken?: string;
  recoveryUrl?: string;
}

export type StoreMemberRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'STOCK_CHECKER'
  | 'FULFILLMENT'
  | 'SUPPORT'
  | 'EDITOR'
  | 'CUSTOM'
  | 'STAFF';

export interface CMSStoreMember {
  id: string;
  storeId: string;
  userId?: string | null;
  name: string;
  email: string;
  role: StoreMemberRole | string;
  customRoleTitle?: string | null;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | string;
  isOwner?: boolean;
  canManageProducts: boolean;
  canManageInventory: boolean;
  canManageOrders: boolean;
  canManageCustomers: boolean;
  canManageThemes: boolean;
  canManageSettings: boolean;
  canManagePayments: boolean;
  canManageLogistics: boolean;
  canManageAnalytics: boolean;
  invitedAt?: string;
  acceptedAt?: string | null;
  createdAt: string;
}

export interface CreateStoreMemberPayload {
  name: string;
  email: string;
  role: StoreMemberRole | string;
  customRoleTitle?: string;
  status?: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  canManageProducts?: boolean;
  canManageInventory?: boolean;
  canManageOrders?: boolean;
  canManageCustomers?: boolean;
  canManageThemes?: boolean;
  canManageSettings?: boolean;
  canManagePayments?: boolean;
  canManageLogistics?: boolean;
  canManageAnalytics?: boolean;
}

export interface TransferOwnershipPayload {
  targetEmail: string;
  retainAsAdmin?: boolean;
  passwordConfirm?: string;
}

// ─── Payment Gateway & Transaction Types ─────────────────────────────────────
export interface CMSPaymentSettings {
  id: string;
  paymentStripeActive: boolean;
  paymentRazorpayActive: boolean;
  paymentCodActive: boolean;
  paymentTestMode: boolean;
  razorpayKeyId?: string | null;
  razorpayKeySecretMasked?: string | null;
  razorpayWebhookSecretMasked?: string | null;
  razorpayAutoCapture?: boolean;
  stripePublishableKey?: string | null;
  stripeSecretKeyMasked?: string | null;
  stripeWebhookSecretMasked?: string | null;
  codFee?: number;
  codMinLimit?: number;
  codMaxLimit?: number;
  currencyRoutingRulesJson?: string | null;
  webhookUrls: {
    razorpay: string;
    stripe: string;
  };
}

export interface UpdatePaymentSettingsPayload {
  paymentStripeActive?: boolean;
  paymentRazorpayActive?: boolean;
  paymentCodActive?: boolean;
  paymentTestMode?: boolean;
  razorpayKeyId?: string | null;
  razorpayKeySecret?: string | null;
  razorpayWebhookSecret?: string | null;
  razorpayAutoCapture?: boolean;
  stripePublishableKey?: string | null;
  stripeSecretKey?: string | null;
  stripeWebhookSecret?: string | null;
  codFee?: number;
  codMinLimit?: number;
  codMaxLimit?: number;
  currencyRoutingRulesJson?: string | null;
  verificationCode?: string;
}

export interface PaymentVerificationResponse {
  requiresVerification?: boolean;
  success?: boolean;
  email?: string;
  expiresInMinutes?: number;
  message?: string;
  settings?: CMSPaymentSettings;
}

export interface RazorpayConnectStatus {
  isConnected: boolean;
  accountId?: string | null;
  merchantName?: string | null;
  kycStatus?: 'VERIFIED' | 'PENDING' | 'UNDER_REVIEW' | 'NOT_STARTED' | string | null;
  connectedAt?: string | null;
  mode: string;
  keyId?: string | null;
  keySecretMasked?: string | null;
  webhookSecretMasked?: string | null;
  autoCapture: boolean;
  webhookUrl: string;
  settlementCycle: string;
  supportedMethods: string[];
  features: {
    instantRefunds: boolean;
    autoCapture: boolean;
    routeSplitSettlement: boolean;
    webhookVerified: boolean;
  };
}

export interface RazorpayConnectInitiatePayload {
  redirectUri?: string;
  testMode?: boolean;
}

export interface RazorpayConnectAuthorizePayload {
  authCode?: string;
  keyId?: string;
  keySecret?: string;
  merchantName?: string;
  accountId?: string;
  testMode?: boolean;
  autoCapture?: boolean;
}

export interface StripeConnectStatus {
  isConnected: boolean;
  accountId?: string | null;
  merchantName?: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  country: string;
  defaultCurrency: string;
  connectedAt?: string | null;
  mode: string;
  publishableKey?: string | null;
  secretKeyMasked?: string | null;
  webhookSecretMasked?: string | null;
  webhookUrl: string;
  settlementCycle: string;
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  features: {
    radarFraudProtection: boolean;
    dynamic3DSecure: boolean;
    multiCurrencyPresentment: boolean;
    instantRefunds: boolean;
    webhookVerified: boolean;
  };
}

export interface StripeConnectInitiatePayload {
  redirectUri?: string;
  testMode?: boolean;
}

export interface StripeConnectAuthorizePayload {
  authCode?: string;
  publishableKey?: string;
  secretKey?: string;
  merchantName?: string;
  accountId?: string;
  country?: string;
  testMode?: boolean;
}

export interface PaymentTransactionData {
  id: string;
  transactionNumber: string;
  orderId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  gateway: 'RAZORPAY' | 'STRIPE' | 'COD' | string;
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED' | string;
  amount: number;
  currency: string;
  gatewayFee: number;
  netAmount: number;
  gatewayPaymentId?: string | null;
  gatewayOrderId?: string | null;
  refundAmount?: number;
  refundReason?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface PaymentTestResponse {
  success: boolean;
  gateway: 'RAZORPAY' | 'STRIPE';
  mode: string;
  message: string;
  supportedCurrencies: string[];
  features: string[];
}

export interface PaymentTransactionsSummary {
  totalOrdersCount: number;
  inrVolume: number;
  usdVolume: number;
  razorpayEstimatedSavings: number;
  stripeInternationalVolume: number;
  successRatePercentage: number;
}

// ── Price Tiers & Store Billing Types ──────────────────────────────────────
export interface PriceTierData {
  id: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  name: string;
  badge: string;
  description: string;
  priceMonthlyInr: number;
  priceMonthlyUsd: number;
  priceAnnualInr: number;
  priceAnnualUsd: number;
  transactionFeePercent: number;
  maxProducts: number;
  maxStaff: number;
  customDomain: boolean;
  analyticsTier: string;
  supportTier: string;
  popular: boolean;
  features: string[];
}

export interface StoreBillingInvoiceData {
  id: string;
  invoiceNumber: string;
  tierName: string;
  billingCycle: 'MONTHLY' | 'ANNUAL' | string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | string;
  paidAt: string;
}

export interface StoreSubscriptionData {
  storeId: string;
  storeName: string;
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE' | string;
  planConfig: PriceTierData;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  planStartedAt: string;
  planRenewsAt: string;
  planPaymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'STRIPE_CARD' | 'NETBANKING' | string;
  planPaymentMethodDetails: string;
  planStatus: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED' | string;
  planTransactionFeePercent: number;
  usage: {
    products: {
      current: number;
      max: number;
      percent: number;
    };
    staff: {
      current: number;
      max: number;
      percent: number;
    };
  };
  invoices: StoreBillingInvoiceData[];
}

// ── Custom Domains, Origin DNS & Edge Theme Deployment Types ──────────────
export interface DnsRecordData {
  type: 'A' | 'CNAME' | 'TXT' | 'CAA' | string;
  name: string;
  value: string;
  ttl: number;
  status: 'VALID' | 'PENDING' | 'ERROR';
  description: string;
}

export interface ThemeDeploymentData {
  deployedThemeSlug: string;
  deployedThemeName: string;
  edgeCacheTtl: number;
  edgeCdnRegion: string;
  edgeDeploymentStatus: 'DEPLOYED' | 'DEPLOYING' | 'OUTDATED' | 'ERROR' | string;
  edgeDeploymentUrl: string;
  lastDeployedAt: string;
}

export interface CustomDomainData {
  id: string;
  domain: string;
  isPrimary: boolean;
  autoRedirectWww: boolean;
  sslStatus: 'SSL_ACTIVE' | 'PENDING_VALIDATION' | 'ISSUING_CERTIFICATE' | 'ERROR' | string;
  dnsStatus: 'VERIFIED' | 'PENDING' | 'PROPAGATING' | 'MISCONFIGURED' | string;
  dnsRecords: DnsRecordData[];
  themeDeployment: ThemeDeploymentData;
  lastCheckedAt: string;
  createdAt: string;
}

export interface DomainListResponse {
  storeId: string;
  storeName: string;
  primaryDomain: string;
  originConfig: {
    aRecordExpected: string;
    cnameExpected: string;
    caaRecordExpected: string;
    edgeIps: string[];
    globalCdnNodes: {
      city: string;
      code: string;
      status: string;
      latencyMs: number;
    }[];
  };
  domains: CustomDomainData[];
}

export interface NotificationConfigData {
  trigger: string;
  title: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsAppEnabled: boolean;
  pushEnabled: boolean;
  subjectTemplate: string;
  emailBodyTemplate: string;
  smsBodyTemplate: string;
  whatsAppTemplate: string;
  pushBodyTemplate: string;
}

export interface ApiKeyData {
  id: string;
  name: string;
  keyMasked: string;
  fullKey?: string;
  scopes: string[];
  lastUsedAt: string;
  createdAt: string;
}

export interface WebhookData {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED' | string;
  successRate: string;
  totalDispatches: number;
  createdAt: string;
}

export interface LoyaltyTierData {
  id: string;
  name: string;
  minSpend: number;
  multiplier: number;
  perks: string[];
  badgeColor: string;
}

export interface LoyaltyConfigData {
  isEnabled: boolean;
  pointsPerHundredSpent: number;
  pointRedemptionValueInCurrency: number;
  welcomeBonusPoints: number;
  reviewBonusPoints: number;
  minPointsToRedeem: number;
}

export interface LoyaltyMemberData {
  id: string;
  customerName: string;
  email: string;
  tier: string;
  totalSpent: number;
  pointsBalance: number;
  pointsRedeemed: number;
  joinedAt: string;
}

export interface GlobalSeoData {
  seoSiteTitle?: string | null;
  seoMetaDescription?: string | null;
  seoCanonicalUrl?: string | null;
  seoOgTitle?: string | null;
  seoOgDescription?: string | null;
  seoOgImage?: string | null;
  seoRobotsTxt?: string | null;
  seoStructuredDataJson?: string | null;
}

export interface ProductSeoData {
  id: string;
  name: string;
  description?: string;
  price: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  urlSlug?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  structuredDataJson?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  author?: string | null;
  featuredImage?: string | null;
  category?: string | null;
  tags?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  relatedProductIds?: string | null;
  storeId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  author?: string | null;
  featuredImage?: string | null;
  category?: string | null;
  tags?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  relatedProductIds?: string | null;
  storeId?: string | null;
}








