import { CMSProduct, CMSOrder, CMSCategory, DashboardStats, MerchantOnboardingData } from '@/src/types';

export interface ChatAction {
  id: string;
  label: string;
  type: 'NAVIGATE' | 'OPEN_PRODUCT_MODAL' | 'COPY_TEXT' | 'PREFILL_PROMPT';
  payload: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
  isThinking?: boolean;
}

export interface StoreContextData {
  products: CMSProduct[];
  orders: CMSOrder[];
  categories: CMSCategory[];
  stats: DashboardStats | null;
  merchantData: MerchantOnboardingData | null;
  currentPath: string;
  userRole?: string;
}

class AIAssistantService {
  /**
   * Generates a context-aware response based on the store's active state and merchant's inquiry.
   */
  public async generateResponse(
    userMessage: string,
    context: StoreContextData,
    history: ChatMessage[] = []
  ): Promise<{ content: string; actions?: ChatAction[] }> {
    // Artificial small delay for natural conversational feel
    await new Promise((resolve) => setTimeout(resolve, 400));

    const msg = userMessage.toLowerCase().trim();
    const { products = [], orders = [], categories = [], merchantData, stats, currentPath } = context;
    const storeName = merchantData?.store?.storeName || 'Your Store';

    // 1. GREETING & GENERAL WELCOME
    if (
      msg === 'hi' ||
      msg === 'hello' ||
      msg === 'hey' ||
      msg.includes('who are you') ||
      msg.includes('what can you do') ||
      msg.includes('help me')
    ) {
      return {
        content: `👋 **Hello! I'm your Statamic Store Copilot.**\n\nI can assist you with real-time analytics, inventory management, copywriting, and instant navigation.\n\n### 🚀 Quick things you can ask:\n- *"How is my store performing today?"*\n- *"Which products are low on stock?"*\n- *"Show me unfulfilled orders"*\n- *"Write a product description for [Item Name]"*\n- *"Generate an SEO meta description"*\n- *"How do I configure custom domains or taxes?"*`,
        actions: [
          { id: '1', label: '📊 Store Overview', type: 'PREFILL_PROMPT', payload: 'Give me a store overview' },
          { id: '2', label: '⚠️ Low Stock Alert', type: 'PREFILL_PROMPT', payload: 'Which products are low on stock?' },
          { id: '3', label: '📦 Unfulfilled Orders', type: 'PREFILL_PROMPT', payload: 'Show unfulfilled orders' },
          { id: '4', label: '➕ Add New Product', type: 'OPEN_PRODUCT_MODAL', payload: '' },
        ],
      };
    }

    // 2. STORE OVERVIEW & METRICS
    if (
      msg.includes('overview') ||
      msg.includes('performance') ||
      msg.includes('metrics') ||
      msg.includes('summary') ||
      msg.includes('stats') ||
      msg.includes('revenue') ||
      msg.includes('sales')
    ) {
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const paidOrders = orders.filter((o) => (o.paymentStatus || '').toLowerCase() === 'paid').length;
      const pendingOrders = orders.filter((o) => ['pending', 'processing', 'unfulfilled'].includes((o.orderStatus || '').toLowerCase())).length;
      const lowStockCount = products.filter((p) => (p.inventory ?? p.stockQuantity ?? 0) <= 5).length;

      return {
        content: `### 📊 Store Performance Summary for **${storeName}**\n\n` +
          `| Metric | Value | Status |\n` +
          `| :--- | :--- | :--- |\n` +
          `| 📦 **Total Catalog Products** | **${products.length} items** | ${products.length > 0 ? 'Active' : 'No items yet'} |\n` +
          `| 🛍️ **Total Orders** | **${orders.length} orders** | ${paidOrders} paid |\n` +
          `| 💵 **Total Gross Sales** | **$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | Recorded |\n` +
          `| ⏳ **Pending Fulfillment** | **${pendingOrders} orders** | ${pendingOrders > 0 ? '⚠️ Action needed' : 'All clear'} |\n` +
          `| ⚠️ **Low Stock Alert (≤5 units)** | **${lowStockCount} items** | ${lowStockCount > 0 ? 'Restock suggested' : 'Healthy stock'} |\n` +
          `| 📁 **Categories** | **${categories.length} active** | Organized |\n\n` +
          `Would you like to review pending orders or restock low-inventory items?`,
        actions: [
          { id: 'view_orders', label: '📦 View Orders', type: 'NAVIGATE', payload: '/orders' },
          { id: 'view_products', label: '📦 View Inventory', type: 'NAVIGATE', payload: '/products' },
          { id: 'view_analytics', label: '📈 Analytics Studio', type: 'NAVIGATE', payload: '/analytics' },
        ],
      };
    }

    // 3. LOW STOCK / INVENTORY ALERTS
    if (
      msg.includes('low stock') ||
      msg.includes('inventory') ||
      msg.includes('out of stock') ||
      msg.includes('restock') ||
      msg.includes('stock alert')
    ) {
      const lowStockProducts = products.filter((p) => (p.inventory ?? p.stockQuantity ?? 0) <= 5);

      if (lowStockProducts.length === 0) {
        return {
          content: `✅ **Great news!** All your products have healthy inventory levels (more than 5 units in stock across **${products.length} products**).\n\nKeep monitoring sales velocity during promotional campaigns!`,
          actions: [
            { id: 'prods', label: '📦 View All Products', type: 'NAVIGATE', payload: '/products' },
            { id: 'new_prod', label: '➕ Add New Item', type: 'OPEN_PRODUCT_MODAL', payload: '' },
          ],
        };
      }

      const list = lowStockProducts
        .slice(0, 8)
        .map((p) => {
          const qty = p.inventory ?? p.stockQuantity ?? 0;
          const statusIcon = qty === 0 ? '🔴 **OUT OF STOCK**' : `🟡 **${qty} left**`;
          return `- **${p.name}** (SKU: \`${p.sku || 'N/A'}\`) — ${statusIcon} · Price: $${p.price?.toFixed(2) || '0.00'}`;
        })
        .join('\n');

      return {
        content: `⚠️ **Found ${lowStockProducts.length} product(s) needing replenishment:**\n\n${list}\n\n${
          lowStockProducts.length > 8 ? `*...and ${lowStockProducts.length - 8} more in your catalog.*` : ''
        }\n\nClick below to open the Product Studio to adjust inventory counts.`,
        actions: [
          { id: 'manage_stock', label: '📦 Manage Products', type: 'NAVIGATE', payload: '/products' },
          { id: 'create_prod', label: '➕ Add New Product', type: 'OPEN_PRODUCT_MODAL', payload: '' },
        ],
      };
    }

    // 4. ORDERS & FULFILLMENT
    if (
      msg.includes('order') ||
      msg.includes('fulfillment') ||
      msg.includes('shipping status') ||
      msg.includes('unfulfilled') ||
      msg.includes('pending')
    ) {
      const pendingOrders = orders.filter((o) =>
        ['pending', 'processing', 'unfulfilled'].includes((o.orderStatus || '').toLowerCase())
      );

      if (orders.length === 0) {
        return {
          content: `📦 **No orders have been recorded yet.**\n\nTo test customer checkouts, ensure your store products are published and payment gateways are active!`,
          actions: [
            { id: 'goto_orders', label: 'Go to Orders Studio', type: 'NAVIGATE', payload: '/orders' },
            { id: 'goto_payments', label: 'Setup Payment Gateways', type: 'NAVIGATE', payload: '/payments' },
          ],
        };
      }

      if (pendingOrders.length === 0) {
        return {
          content: `🎉 **All caught up!** You have **0 pending orders** awaiting fulfillment out of **${orders.length} total orders**.\n\nAll existing orders are confirmed, shipped, or delivered.`,
          actions: [
            { id: 'goto_orders', label: 'View All Orders', type: 'NAVIGATE', payload: '/orders' },
          ],
        };
      }

      const sampleList = pendingOrders
        .slice(0, 5)
        .map(
          (o) =>
            `- **Order #${o.orderNumber || o.id.slice(0, 8)}** by *${o.customerName || 'Customer'}* — **$${o.totalAmount?.toFixed(2) || '0.00'}** (${o.orderStatus || 'Pending'})`
        )
        .join('\n');

      return {
        content: `📦 **You have ${pendingOrders.length} order(s) awaiting processing or shipment:**\n\n${sampleList}\n\n${
          pendingOrders.length > 5 ? `*...plus ${pendingOrders.length - 5} more pending orders.*` : ''
        }\n\nHead over to Orders Studio to mark items fulfilled, enter carrier tracking numbers, or print packing slips.`,
        actions: [
          { id: 'open_orders', label: '🚚 Open Orders Studio', type: 'NAVIGATE', payload: '/orders' },
          { id: 'shipping_settings', label: '📦 Shipping Rates', type: 'NAVIGATE', payload: '/shipping' },
        ],
      };
    }

    // 5. PRODUCT DESCRIPTION / COPYWRITING GENERATOR
    if (
      msg.includes('write') ||
      msg.includes('description') ||
      msg.includes('copy') ||
      msg.includes('generate text') ||
      msg.includes('bullet points')
    ) {
      // Extract possible product name
      const cleaned = userMessage
        .replace(/write (a )?(catchy |compelling )?(product )?description for/i, '')
        .replace(/generate (a )?description for/i, '')
        .replace(/copy for/i, '')
        .trim();

      const targetTitle = cleaned.length > 2 && cleaned.length < 50 ? cleaned : 'Modern Minimalist Essentials';

      return {
        content: `✨ **Generated Product Copy for "${targetTitle}":**\n\n` +
          `### 🏷️ Headline Hook\n` +
          `*Elevate everyday moments with unmatched craftsmanship, designed for effortless elegance and enduring quality.*\n\n` +
          `### 📝 Story Paragraph\n` +
          `Crafted with meticulous attention to detail, the **${targetTitle}** seamlessly merges contemporary aesthetic with daily utility. Built from premium-grade materials, it offers unmatched durability without compromising on tactile softness and refined luxury. Perfect for the discerning lifestyle.\n\n` +
          `### 💎 Key Feature Highlights\n` +
          `- **Premium Sourced Materials:** Engineered for longevity and comfortable daily wear/use.\n` +
          `- **Timeless Silhouette:** Neutral, versatile tone that complements any aesthetic.\n` +
          `- **Sustainable Precision:** Thoughtfully fabricated with eco-conscious manufacturing practices.\n` +
          `- **Worry-Free Warranty:** Backed by our 100% satisfaction guarantee and seamless 30-day returns.\n\n` +
          `*Feel free to copy this directly into your Product Studio description!*`,
        actions: [
          {
            id: 'copy_desc',
            label: '📋 Copy Description',
            type: 'COPY_TEXT',
            payload: `Crafted with meticulous attention to detail, the ${targetTitle} seamlessly merges contemporary aesthetic with daily utility. Built from premium-grade materials, it offers unmatched durability without compromising on tactile softness and refined luxury.`,
          },
          { id: 'open_prod_modal', label: '➕ Add as New Product', type: 'OPEN_PRODUCT_MODAL', payload: '' },
        ],
      };
    }

    // 6. SEO META GENERATOR
    if (
      msg.includes('seo') ||
      msg.includes('meta title') ||
      msg.includes('meta description') ||
      msg.includes('search engine')
    ) {
      return {
        content: `🔍 **SEO Recommendations for ${storeName}:**\n\n` +
          `### 🏷️ Recommended Meta Title (55/60 chars)\n` +
          `\`${storeName} — Premium Curated Collection & Modern Essentials\`\n\n` +
          `### 📄 Recommended Meta Description (152/160 chars)\n` +
          `\`Discover handcrafted luxury and sustainably made essentials at ${storeName}. Enjoy fast express shipping, secure checkout, and exclusive seasonal offers.\`\n\n` +
          `### 💡 Key SEO Best Practices for CMS:\n` +
          `1. **Image Alt Tags:** Always add descriptive alt tags when uploading gallery assets.\n` +
          `2. **Custom URL Slugs:** Keep product slugs short and lowercase (e.g. \`/products/leather-tote-bag\`).\n` +
          `3. **OpenGraph Tags:** Configure social share preview images in the SEO Governance Studio.`,
        actions: [
          { id: 'goto_seo', label: '🔍 Open SEO Governance', type: 'NAVIGATE', payload: '/seo' },
          { id: 'goto_domains', label: '🌐 Manage Custom Domain', type: 'NAVIGATE', payload: '/domains' },
        ],
      };
    }

    // 7. MARKETING & DISCOUNT CAMPAIGNS
    if (
      msg.includes('discount') ||
      msg.includes('promo') ||
      msg.includes('coupon') ||
      msg.includes('sale') ||
      msg.includes('marketing') ||
      msg.includes('campaign')
    ) {
      return {
        content: `🏷️ **High-Converting Promo Campaign Ideas for ${storeName}:**\n\n` +
          `1. **Flash Weekend Sale (\`FLASH20\`):**\n` +
          `   - **Offer:** 20% off all orders over $75.\n` +
          `   - **Urgency:** Active for 48 hours only.\n\n` +
          `2. **VIP Welcome Incentive (\`WELCOME15\`):**\n` +
          `   - **Offer:** 15% off first purchase for new registered customers.\n` +
          `   - **Rule:** One usage per customer account.\n\n` +
          `3. **Tiered Free Shipping Promotion:**\n` +
          `   - Automatically apply free priority shipping for carts above $100 to increase Average Order Value (AOV).\n\n` +
          `You can generate and activate these coupon codes in the **Discount Studio**!`,
        actions: [
          { id: 'discounts_nav', label: '🏷️ Open Discount Studio', type: 'NAVIGATE', payload: '/discounts' },
          { id: 'marketing_nav', label: '📢 Marketing & Banners', type: 'NAVIGATE', payload: '/marketing' },
          { id: 'loyalty_nav', label: '⭐ Loyalty Rewards', type: 'NAVIGATE', payload: '/loyalty' },
        ],
      };
    }

    // 8. HOW-TO & CONFIGURATION GUIDES
    if (msg.includes('domain') || msg.includes('dns') || msg.includes('cname')) {
      return {
        content: `🌐 **How to Connect a Custom Domain:**\n\n` +
          `1. Go to **Domains & DNS** in the sidebar.\n` +
          `2. Click **Add Custom Domain** (e.g. \`www.yourstore.com\`).\n` +
          `3. In your registrar (GoDaddy, Namecheap, Cloudflare), add:\n` +
          `   - **Type:** \`CNAME\` | **Name:** \`www\` | **Target:** \`cname.statamic.store\`\n` +
          `   - **Type:** \`A\` | **Name:** \`@\` | **Target:** \`76.76.21.21\`\n` +
          `4. SSL certificates are provisioned automatically within 15 minutes.`,
        actions: [
          { id: 'nav_domains', label: '🌐 Go to Domains Studio', type: 'NAVIGATE', payload: '/domains' },
        ],
      };
    }

    if (msg.includes('payment') || msg.includes('stripe') || msg.includes('gateway') || msg.includes('payout')) {
      return {
        content: `💳 **Setting Up Payment Gateways:**\n\n` +
          `Statamic CMS supports multiple payment providers:\n` +
          `- **Stripe:** Direct credit/debit card processing, Apple Pay, Google Pay.\n` +
          `- **Razorpay / PayPal:** Fast one-touch international checkouts.\n` +
          `- **Cash on Delivery (COD):** Set minimum order thresholds and extra verification if required.\n\n` +
          `Configure API keys, webhooks, and test modes in the Payment Studio.`,
        actions: [
          { id: 'nav_payments', label: '💳 Payment Studio', type: 'NAVIGATE', payload: '/payments' },
          { id: 'nav_tax', label: '🧾 Tax Settings', type: 'NAVIGATE', payload: '/tax' },
        ],
      };
    }

    if (msg.includes('theme') || msg.includes('color') || msg.includes('layout') || msg.includes('styling')) {
      return {
        content: `🎨 **Storefront Theme & Customization:**\n\n` +
          `You can customize your storefront aesthetics in **Theme Studio**:\n` +
          `- Change primary accent colors, fonts, and dark/light modes.\n` +
          `- Reorder hero banners, featured collections, and promotional ribbons.\n` +
          `- Live preview changes before publishing to your live customer storefront.`,
        actions: [
          { id: 'nav_themes', label: '🎨 Open Theme Studio', type: 'NAVIGATE', payload: '/themes' },
          { id: 'nav_pages', label: '📄 Page Builder', type: 'NAVIGATE', payload: '/pages' },
        ],
      };
    }

    if (msg.includes('team') || msg.includes('role') || msg.includes('permission') || msg.includes('staff')) {
      return {
        content: `👥 **Team Members & Staff Roles:**\n\n` +
          `Control granular access for your organization:\n` +
          `- **OWNER / ADMIN:** Full access to all stores, financial payouts, and billing.\n` +
          `- **MANAGER:** Access to products, orders, discounts, marketing, and customers.\n` +
          `- **STOCK_CHECKER:** Limited to product inventory and category management.\n` +
          `- **FULFILLMENT:** Access to order fulfillment, shipping labels, and logistics.\n` +
          `- **SUPPORT:** Access to customer records, reviews, and order inquiries.`,
        actions: [
          { id: 'nav_team', label: '👥 Team Management', type: 'NAVIGATE', payload: '/team' },
        ],
      };
    }

    // 9. NAVIGATION REQUESTS
    if (msg.includes('go to') || msg.includes('navigate to') || msg.includes('open')) {
      if (msg.includes('product')) {
        return {
          content: 'Taking you to **Product Studio**...',
          actions: [{ id: 'nav_p', label: '📦 Open Products', type: 'NAVIGATE', payload: '/products' }],
        };
      }
      if (msg.includes('order')) {
        return {
          content: 'Taking you to **Orders Studio**...',
          actions: [{ id: 'nav_o', label: '🚚 Open Orders', type: 'NAVIGATE', payload: '/orders' }],
        };
      }
      if (msg.includes('customer')) {
        return {
          content: 'Taking you to **Customer Studio**...',
          actions: [{ id: 'nav_c', label: '👥 Open Customers', type: 'NAVIGATE', payload: '/customers' }],
        };
      }
      if (msg.includes('setting') || msg.includes('setup')) {
        return {
          content: 'Opening **Store Setup & Settings**...',
          actions: [{ id: 'nav_s', label: '⚙️ Open Store Setup', type: 'NAVIGATE', payload: '/store-setup' }],
        };
      }
      if (msg.includes('discount')) {
        return {
          content: 'Opening **Discount Studio**...',
          actions: [{ id: 'nav_d', label: '🏷️ Open Discounts', type: 'NAVIGATE', payload: '/discounts' }],
        };
      }
    }

    // 10. DEFAULT INTELLIGENT FALLBACK
    return {
      content: `I've analyzed your store data (**${products.length} products**, **${orders.length} orders** in *${storeName}*).\n\n` +
        `Here are common tasks I can help you with immediately:\n` +
        `- 📊 **Store Analytics:** *"Give me a sales & order summary"*\n` +
        `- ⚠️ **Inventory:** *"Show products low on stock"*\n` +
        `- 📦 **Fulfillment:** *"Show pending orders"*\n` +
        `- ✍️ **AI Copywriting:** *"Write a product description for Summer Linen Shirt"*\n` +
        `- 🔍 **SEO Optimization:** *"Generate SEO tags for my homepage"*\n` +
        `- 🚀 **Store Setup:** *"How to connect Stripe or custom domains"*`,
      actions: [
        { id: '1', label: '📊 Store Overview', type: 'PREFILL_PROMPT', payload: 'Give me a store overview' },
        { id: '2', label: '⚠️ Low Stock', type: 'PREFILL_PROMPT', payload: 'Which products are low on stock?' },
        { id: '3', label: '➕ Add Product', type: 'OPEN_PRODUCT_MODAL', payload: '' },
        { id: '4', label: '🏷️ Create Discount', type: 'NAVIGATE', payload: '/discounts' },
      ],
    };
  }

  /**
   * Returns suggested prompt chips tailored to the current CMS route
   */
  public getContextualSuggestions(pathname: string): string[] {
    if (pathname.startsWith('/products') || pathname.startsWith('/categories')) {
      return [
        'Which products are low on stock?',
        'Write a compelling description for a new item',
        'How many total products are published?',
        'Help me structure product categories',
      ];
    }
    if (pathname.startsWith('/orders') || pathname.startsWith('/shipping')) {
      return [
        'Show unfulfilled orders',
        'Total sales revenue summary',
        'How do I add tracking numbers?',
        'Configure shipping zones',
      ];
    }
    if (pathname.startsWith('/discounts') || pathname.startsWith('/marketing')) {
      return [
        'Suggest high-converting promo code ideas',
        'How to create a 20% flash sale coupon',
        'Tips to increase Average Order Value',
      ];
    }
    if (pathname.startsWith('/seo') || pathname.startsWith('/domains')) {
      return [
        'Generate SEO meta title and description',
        'How to configure DNS records for custom domain',
        'Best practices for product image alt tags',
      ];
    }
    if (pathname.startsWith('/themes') || pathname.startsWith('/pages')) {
      return [
        'How to customize storefront colors and fonts',
        'Add a new landing page',
        'Preview theme on mobile view',
      ];
    }

    // Default general suggestions
    return [
      'Give me a store overview',
      'Which products are low on stock?',
      'Show unfulfilled orders',
      'Write a catchy product description',
      'Suggest marketing promo campaign',
    ];
  }
}

export const aiAssistantService = new AIAssistantService();
