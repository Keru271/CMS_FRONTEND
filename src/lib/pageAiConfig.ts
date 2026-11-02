export interface PageAiContext {
  pageKey: string;
  pageTitle: string;
  specialistRole: string;
  buttonLabel: string;
  badge: string;
  welcomeMessage: string;
  suggestions: {
    label: string;
    prompt: string;
  }[];
}

export const PAGE_AI_REGISTRY: Record<string, PageAiContext> = {
  products: {
    pageKey: 'products',
    pageTitle: 'Products & Inventory',
    specialistRole: 'Catalog Specialist & Merchandising AI',
    buttonLabel: 'Catalog AI',
    badge: '📦 Catalog Copilot',
    welcomeMessage: '👋 **Catalog Specialist AI here!** I can help you draft high-converting SEO product titles & descriptions, audit low stock levels, recommend bundles, or optimize your pricing tiers.',
    suggestions: [
      { label: '📝 Write SEO Product Description', prompt: 'Write a persuasive, SEO-optimized product title and bullet-point description for our new item.' },
      { label: '⚠️ Audit Low Stock Risks', prompt: 'Check all products and highlight any items that are critically low in stock or out of stock.' },
      { label: '🏷️ Recommend Pricing Strategy', prompt: 'Analyze our current product prices and suggest optimal tier adjustments to maximize profit margins.' },
      { label: '🏖️ Create Seasonal Collection', prompt: 'Suggest a high-converting seasonal collection bundle from our top catalog items.' },
    ],
  },
  orders: {
    pageKey: 'orders',
    pageTitle: 'Orders & Fulfillment',
    specialistRole: 'Fulfillment & Logistics Intelligence AI',
    buttonLabel: 'Orders AI',
    badge: '🚚 Fulfillment AI',
    welcomeMessage: '👋 **Orders & Fulfillment AI active!** I monitor order volume, shipping delays, fulfillment velocity, and customer support ticket risks.',
    suggestions: [
      { label: '📦 Identify Unfulfilled Orders', prompt: 'Which orders are currently pending fulfillment and need immediate packing/dispatch?' },
      { label: '✉️ Draft Customer Shipping Update', prompt: 'Draft a polite, brand-aligned email to customers whose order delivery is experiencing delays.' },
      { label: '📊 Analyze Return & Cancellation Rates', prompt: 'Review our recent order statuses and identify why cancellations or refunds occurred.' },
      { label: '⚡ Calculate Fulfillment Velocity', prompt: 'What is our average order fulfillment turnaround time and where are the bottlenecks?' },
    ],
  },
  customers: {
    pageKey: 'customers',
    pageTitle: 'Customer CRM & Loyalty',
    specialistRole: 'Customer Retention & VIP Strategist AI',
    buttonLabel: 'Customers AI',
    badge: '👥 CRM Strategist',
    welcomeMessage: '👋 **Customer CRM AI ready!** I analyze repeat purchase frequency, high-value VIP segments, churn risk patterns, and audience marketing consent.',
    suggestions: [
      { label: '👑 Segment Top 10% VIP Buyers', prompt: 'Show me our top 10% VIP customers by total spend and suggest an exclusive appreciation perk.' },
      { label: '📉 Identify Inactive Churn Risks', prompt: 'Identify customers who have not ordered in over 60 days and draft a win-back discount offer.' },
      { label: '💬 Draft High-Converting SMS Campaign', prompt: 'Draft a punchy, 160-character promotional SMS for our opt-in marketing subscribers.' },
      { label: '🎯 Recommend Personalized Loyalty Perks', prompt: 'What personalized loyalty rewards would drive highest repeat order rates for returning customers?' },
    ],
  },
  categories: {
    pageKey: 'categories',
    pageTitle: 'Collections & Categories',
    specialistRole: 'Information Architecture & Taxonomy AI',
    buttonLabel: 'Taxonomy AI',
    badge: '🗂️ Taxonomy AI',
    welcomeMessage: '👋 **Taxonomy AI active!** I help structure collections, subcategories, brand catalogs, and navigational hierarchy for maximum search discoverability.',
    suggestions: [
      { label: '🛍️ Suggest Trending Collection Themes', prompt: 'Suggest 4 new trending collection themes based on our catalog taxonomy.' },
      { label: '🗂️ Audit Category Navigation Flow', prompt: 'Review our store category hierarchy and suggest improvements for mobile browsing.' },
      { label: '🔍 Optimize Category Meta Tags', prompt: 'Generate Google-optimized title tags and meta descriptions for all our top category landing pages.' },
    ],
  },
  discounts: {
    pageKey: 'discounts',
    pageTitle: 'Promotions & Coupons',
    specialistRole: 'Promotions & Margin Optimization AI',
    buttonLabel: 'Promotions AI',
    badge: '🎟️ Promotions AI',
    welcomeMessage: '👋 **Promotions & Margin AI standing by!** Let us calculate flash sales, BOGO promotions, free shipping thresholds, and discount code ROI.',
    suggestions: [
      { label: '⚡ Create Weekend Flash Sale', prompt: 'Recommend a high-urgency weekend flash sale discount code structure (e.g. FLASH20) with minimum order value.' },
      { label: '🛡️ Audit Margin Protection', prompt: 'Check discount rules to ensure we do not lose money after factoring product unit costs and shipping.' },
      { label: '🎁 Suggest BOGO Tiered Promotion', prompt: 'Design a Buy-One-Get-One (BOGO) promotion structure for our fastest moving catalog items.' },
    ],
  },
  themes: {
    pageKey: 'themes',
    pageTitle: 'Storefront Visual Design',
    specialistRole: 'Theme Stylist & Brand Designer AI',
    buttonLabel: 'Theme Stylist',
    badge: '🎨 Design Stylist',
    welcomeMessage: '👋 **Storefront Stylist AI ready!** I help tune color palettes, typography pairings, hero announcements, and responsive section layouts.',
    suggestions: [
      { label: '🎨 Suggest Luxury Color Palette', prompt: 'Recommend a modern, sophisticated color palette (primary, background, accent) for our store.' },
      { label: '✨ Write Catchy Announcement Bar', prompt: 'Write 3 punchy, high-urgency announcement bar slogans for our store header.' },
      { label: '📱 Mobile UX Optimization Tips', prompt: 'What design and spacing adjustments will increase checkout conversions on mobile devices?' },
    ],
  },
  seo: {
    pageKey: 'seo',
    pageTitle: 'SEO & SERP Optimization',
    specialistRole: 'Organic Search & Indexing AI',
    buttonLabel: 'SEO Copilot',
    badge: '🌐 SEO Copilot',
    welcomeMessage: '👋 **SEO Copilot online!** I inspect title tags, OpenGraph social cards, JSON-LD structured data schemas, canonical URLs, and sitemaps.',
    suggestions: [
      { label: '🔎 Complete Storefront SEO Audit', prompt: 'Perform an exhaustive audit of our store meta title, description, schema markup, and keyword density.' },
      { label: '📈 Generate High-Intent Keywords', prompt: 'Generate a list of high-intent transactional search keywords to target in our store niche.' },
      { label: '🏷️ Draft JSON-LD Schema Snippet', prompt: 'Generate standard schema.org Product and Organization JSON-LD markup for our store.' },
    ],
  },
  shipping: {
    pageKey: 'shipping',
    pageTitle: 'Shipping & Delivery Logistics',
    specialistRole: 'Courier & Logistics Optimizer AI',
    buttonLabel: 'Logistics AI',
    badge: '📦 Logistics AI',
    welcomeMessage: '👋 **Shipping & Delivery AI active!** I can help you configure courier zones, calculate profitable free-shipping thresholds, and reduce transit times.',
    suggestions: [
      { label: '🚚 Optimize Free Shipping Threshold', prompt: 'Calculate the optimal free shipping cart threshold based on our average order value to boost cart size.' },
      { label: '📍 Audit Regional Shipping Zones', prompt: 'Review our domestic and international shipping rate zones and suggest rate adjustments.' },
    ],
  },
  '3d': {
    pageKey: '3d',
    pageTitle: '3D AR Model Studio',
    specialistRole: 'Spatial 3D & Photogrammetry AI',
    buttonLabel: '3D Studio AI',
    badge: '🧊 3D Spatial AI',
    welcomeMessage: '👋 **3D Spatial AI ready!** I assist with multi-angle photo guidelines, Gaussian splatting, mesh decimation, and AR QuickLook optimization.',
    suggestions: [
      { label: '📸 Photo Angle Guidelines Checklist', prompt: 'What lighting and photo angle guidelines guarantee the highest quality 3D model reconstruction?' },
      { label: '⚡ Optimize GLB/USDZ for Fast Web Loading', prompt: 'How do I decimate model textures and geometry to ensure under 5MB file sizes for instant mobile AR?' },
    ],
  },
  analytics: {
    pageKey: 'analytics',
    pageTitle: 'Store Analytics & KPIs',
    specialistRole: 'Executive Revenue & Conversion AI',
    buttonLabel: 'Analytics AI',
    badge: '📊 Analytics AI',
    welcomeMessage: '👋 **Executive Analytics AI online!** I provide deep-dive diagnostics on conversion rates, revenue trends, customer lifetime value, and marketing ROI.',
    suggestions: [
      { label: '📈 Executive Performance Briefing', prompt: 'Summarize our store key performance indicators (sales, orders, AOV, conversion rate) and identify our top growth vector.' },
      { label: '💡 Identify Checkout Abandonment Causes', prompt: 'Why are visitors dropping off before checkout completion and what 3 fixes will increase conversions?' },
    ],
  },
  settings: {
    pageKey: 'settings',
    pageTitle: 'Store Governance & Security',
    specialistRole: 'Store Operations & Compliance AI',
    buttonLabel: 'Settings AI',
    badge: '⚙️ Operations AI',
    welcomeMessage: '👋 **Store Operations AI here!** I assist with payment gateway configuration, staff roles, multi-currency settings, and store security.',
    suggestions: [
      { label: '🔒 Store Security Checklist', prompt: 'Give me a security and access governance checklist to protect our merchant account and customer data.' },
      { label: '💳 Payment Gateway Best Practices', prompt: 'What payment gateway fallback configuration minimizes failed transactions for international shoppers?' },
    ],
  },
  dashboard: {
    pageKey: 'dashboard',
    pageTitle: 'Command Center',
    specialistRole: 'Master Store Intelligence AI',
    buttonLabel: 'Store AI',
    badge: '⚡ Store Copilot',
    welcomeMessage: '👋 **Master Store Intelligence Copilot ready!** I monitor all sales, inventory levels, customer activity, and marketing automations across your store.',
    suggestions: [
      { label: '✨ What should I improve today?', prompt: 'What should I improve today to increase sales and streamline operations?' },
      { label: '🏆 Show Best-Selling Products', prompt: 'Show me my best-selling products and calculate their revenue contribution.' },
      { label: '📉 Why did sales fluctuate recently?', prompt: 'Analyze recent store revenue trends and explain any fluctuations.' },
      { label: '🚀 Launch Weekend Marketing Campaign', prompt: 'Draft a comprehensive weekend promotion with email, SMS, and discount coupon code.' },
    ],
  },
};

export function getPageAiContext(pathname: string): PageAiContext {
  const clean = (pathname || '').toLowerCase();
  
  if (clean.includes('/product')) return PAGE_AI_REGISTRY.products;
  if (clean.includes('/order')) return PAGE_AI_REGISTRY.orders;
  if (clean.includes('/customer')) return PAGE_AI_REGISTRY.customers;
  if (clean.includes('/categor') || clean.includes('/collection')) return PAGE_AI_REGISTRY.categories;
  if (clean.includes('/discount')) return PAGE_AI_REGISTRY.discounts;
  if (clean.includes('/theme')) return PAGE_AI_REGISTRY.themes;
  if (clean.includes('/seo')) return PAGE_AI_REGISTRY.seo;
  if (clean.includes('/shipping')) return PAGE_AI_REGISTRY.shipping;
  if (clean.includes('/3d')) return PAGE_AI_REGISTRY['3d'];
  if (clean.includes('/analytics')) return PAGE_AI_REGISTRY.analytics;
  if (clean.includes('/setting') || clean.includes('/tax') || clean.includes('/payment') || clean.includes('/preference')) return PAGE_AI_REGISTRY.settings;
  
  return PAGE_AI_REGISTRY.dashboard;
}

export function openPageAiChatbot(pathname: string, customPrompt?: string) {
  if (typeof window === 'undefined') return;
  const ctx = getPageAiContext(pathname);
  
  const event = new CustomEvent('open-cms-copilot', {
    detail: {
      prompt: customPrompt,
      pageContext: ctx,
    },
  });
  window.dispatchEvent(event);
}
