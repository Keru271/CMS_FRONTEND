import { StorefrontTheme, StorefrontSection } from './storefrontTemplates';

function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getContrastColor(hexColor: string): string {
  if (!hexColor) return '#000000';
  const clean = hexColor.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 0;
    g = parseInt(clean[1] + clean[1], 16) || 0;
    b = parseInt(clean[2] + clean[2], 16) || 0;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 0;
    g = parseInt(clean.substring(2, 4), 16) || 0;
    b = parseInt(clean.substring(4, 6), 16) || 0;
  }
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? '#000000' : '#FFFFFF';
}

export function isColorDark(hexColor: string): boolean {
  if (!hexColor) return false;
  const clean = hexColor.replace('#', '');
  let r = 255, g = 255, b = 255;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 255;
    g = parseInt(clean[1] + clean[1], 16) || 255;
    b = parseInt(clean[2] + clean[2], 16) || 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 255;
    g = parseInt(clean.substring(2, 4), 16) || 255;
    b = parseInt(clean.substring(4, 6), 16) || 255;
  }
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

export function enforceThemeContrast(theme: StorefrontTheme): StorefrontTheme {
  const bg = theme.background || '#FFFFFF';
  const bgDark = isColorDark(bg);
  const textDark = isColorDark(theme.textColor || (bgDark ? '#F8FAFC' : '#0F172A'));

  let safeTextColor = theme.textColor;
  let safeTextMuted = theme.textMuted;
  let safeCardBg = theme.cardBg;
  let safeBorder = theme.border;

  if (bgDark) {
    if (textDark) safeTextColor = '#F8FAFC';
    if (!safeTextMuted || isColorDark(safeTextMuted)) safeTextMuted = '#94A3B8';
    if (!safeCardBg || !isColorDark(safeCardBg)) safeCardBg = '#12141F';
    if (!safeBorder) safeBorder = '#1E2438';
  } else {
    // Light background (like #EAEDED, #FFFFFF, #F8FAFC)
    if (!textDark) safeTextColor = '#0F172A';
    if (!safeTextMuted || !isColorDark(safeTextMuted)) safeTextMuted = '#565959';
    if (!safeCardBg || isColorDark(safeCardBg)) safeCardBg = '#FFFFFF';
    if (!safeBorder) safeBorder = '#D5D9D9';
  }

  return {
    ...theme,
    textColor: safeTextColor,
    textMuted: safeTextMuted,
    cardBg: safeCardBg,
    border: safeBorder,
  };
}

export function renderStorefrontHtml({
  brandName,
  tagline,
  theme,
  sections,
  inspectMode = true,
  activePage = 'home',
  selectedProduct = null,
  logo,
  currency = 'USD',
  contactEmail,
  contactPhone,
  address,
  socialLinks,
}: {
  brandName: string;
  tagline: string;
  theme: StorefrontTheme;
  sections: StorefrontSection[];
  inspectMode?: boolean;
  activePage?: string;
  selectedProduct?: any;
  logo?: string;
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: Record<string, string>;
}): string {
  const headingFont = theme.headingFont || 'Plus Jakarta Sans';
  const bodyFont = theme.bodyFont || 'Inter';
  const isDark = isColorDark(theme.background);
  const accentContrast = getContrastColor(theme.accent);

  const currencySymbol =
    currency === 'INR' || currency?.toLowerCase().includes('inr')
      ? '₹'
      : currency === 'EUR'
      ? '€'
      : currency === 'GBP'
      ? '£'
      : '$';

  const storeContext = {
    logo,
    currency,
    currencySymbol,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
  };

  // Safe contrast calculation: NEVER allow light text on light bg or dark text on dark bg!
  let safeTextColor = theme.textColor || (isDark ? '#F8FAFC' : '#0F172A');
  let safeTextMuted = theme.textMuted || (isDark ? '#94A3B8' : '#565959');
  const textColorDark = isColorDark(safeTextColor);

  if (!isDark && !textColorDark) {
    // Background is light, but textColor is also light (e.g. #F8FAFC on #EAEDED)!
    safeTextColor = '#0F172A';
    safeTextMuted = '#4B5563';
  } else if (isDark && textColorDark) {
    // Background is dark, but textColor is dark
    safeTextColor = '#F8FAFC';
    safeTextMuted = '#94A3B8';
  }

  const safeTheme: StorefrontTheme = {
    ...theme,
    textColor: safeTextColor,
    textMuted: safeTextMuted,
  };

  // Extract catalog products from sections or default fallback
  const prodSec = sections.find((s) => s.type === 'products');
  const prodsContent = (prodSec?.contentJson?.products as any[]) || [];
  const allProducts = prodsContent.length > 0 ? prodsContent : [
    {
      id: 'p-1',
      name: `${brandName} Signature Watch Obsidian`,
      category: 'Timepieces',
      price: 320,
      comparePrice: 450,
      badge: 'BESTSELLER',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
      description: 'Forged aircraft-grade titanium casing with anti-reflective sapphire crystal glass and quick-release quick-lock mechanism.',
    },
    {
      id: 'p-2',
      name: 'Lumina Spatial Acoustic Dial',
      category: 'Audio',
      price: 450,
      comparePrice: 580,
      badge: 'NEW DROP',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop',
      description: 'Bespoke planar drivers with ultra-dense magnetic enclosure tuned for crystal clear acoustic separation and spatial imaging.',
    },
    {
      id: 'p-3',
      name: 'Tuscan Saddle Leather Folio',
      category: 'Leathercraft',
      price: 145,
      comparePrice: 195,
      badge: 'HANDMADE',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop',
      description: 'Hand-stitched full grain vegetable tanned hide from Santa Croce with burnished edges and solid brass hardware.',
    },
    {
      id: 'p-4',
      name: 'Solstice Polarized Clip-On',
      category: 'Optics',
      price: 190,
      comparePrice: 240,
      badge: 'SELLING FAST',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop',
      description: 'Japanese cellulose acetate with 100% UVA/UVB protection and hydrophobic anti-scratch coating.',
    },
  ];

  const currentPdpProduct = selectedProduct || allProducts[0];

  // Header & Announcement & Footer persistence across all pages
  const headerSection = sections.find(
    (s) => s.type === 'marketplace_header' || s.type === 'header' || s.id === 'marketplace_header' || s.id === 'header'
  );
  const announcementSection = sections.find((s) => s.type === 'announcement');
  const footerSection = sections.find((s) => s.type === 'footer');

  const headerHtml = [
    announcementSection && announcementSection.enabled ? renderSectionHtml(announcementSection, safeTheme, brandName, tagline, isDark, currencySymbol, storeContext) : '',
    headerSection && headerSection.enabled ? renderSectionHtml(headerSection, safeTheme, brandName, tagline, isDark, currencySymbol, storeContext) : '',
  ].filter(Boolean).join('\n');

  const footerHtml = footerSection && footerSection.enabled
    ? renderSectionHtml(footerSection, safeTheme, brandName, tagline, isDark, currencySymbol, storeContext)
    : '';

  let bodyContentHtml = '';

  if (activePage === 'products') {
    const cats = (prodSec?.contentJson?.categories as string[]) || ['All', ...Array.from(new Set(allProducts.map((p: any) => p.category).filter(Boolean)))];
    bodyContentHtml = headerHtml + '\n' + renderProductsListingPage(allProducts, cats, safeTheme, brandName, isDark, currencySymbol) + '\n' + footerHtml;
  } else if (activePage === 'pdp') {
    bodyContentHtml = headerHtml + '\n' + renderProductDescriptionPage(currentPdpProduct, allProducts, safeTheme, brandName, isDark, currencySymbol, contactPhone) + '\n' + footerHtml;
  } else if (activePage === 'story') {
    bodyContentHtml = headerHtml + '\n' + renderStoryPage(brandName, tagline, safeTheme, isDark) + '\n' + footerHtml;
  } else if (activePage === 'reviews') {
    const revSection = sections.find((s) => s.type === 'reviews');
    const revs = (revSection?.contentJson?.reviews as any[]) || [];
    bodyContentHtml = headerHtml + '\n' + renderReviewsPage(revs, brandName, safeTheme, isDark) + '\n' + footerHtml;
  } else {
    // Default: 'home'
    bodyContentHtml = sections
      .filter((s) => s.enabled)
      .map((section) => renderSectionHtml(section, safeTheme, brandName, tagline, isDark, currencySymbol, storeContext))
      .join('\n');
  }

  return `<!DOCTYPE html>
<html lang="en" class="${isDark ? 'dark' : ''}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(brandName)} — ${escapeHtml(tagline)}</title>
  
  <!-- Modern Typography from Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    headingFont
  )}:wght@400;500;600;700;800;900&family=${encodeURIComponent(
    bodyFont
  )}:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            heading: ['"${headingFont}"', 'serif', 'sans-serif'],
            body: ['"${bodyFont}"', 'sans-serif'],
          },
          colors: {
            brand: {
              primary: '${safeTheme.primary}',
              secondary: '${safeTheme.secondary}',
              accent: '${safeTheme.accent}',
              bg: '${safeTheme.background}',
              card: '${safeTheme.cardBg}',
              text: '${safeTheme.textColor}',
              muted: '${safeTheme.textMuted}',
              border: '${safeTheme.border}',
            }
          }
        }
      }
    };
  </script>

  <style>
    :root {
      --primary: ${safeTheme.primary};
      --secondary: ${safeTheme.secondary};
      --accent: ${safeTheme.accent};
      --accent-contrast: ${accentContrast};
      --background: ${safeTheme.background};
      --card-bg: ${safeTheme.cardBg};
      --text-color: ${safeTheme.textColor};
      --text-muted: ${safeTheme.textMuted};
      --border: ${safeTheme.border};
      --radius: ${safeTheme.borderRadius || '8px'};
      --font-heading: '${headingFont}', sans-serif;
      --font-body: '${bodyFont}', sans-serif;
    }

    * {
      box-sizing: border-box;
      border-color: var(--border);
    }

    body {
      margin: 0;
      padding: 0;
      background-color: var(--background);
      color: var(--text-color);
      font-family: var(--font-body);
      overflow-x: hidden;
      transition: background-color 200ms ease, color 200ms ease;
    }

    h1, h2, h3, h4, .font-heading {
      font-family: var(--font-heading);
    }

    .btn-accent {
      background: var(--accent);
      color: var(--accent-contrast);
      font-weight: 700;
      border-radius: var(--radius);
      transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-accent:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px color-mix(in srgb, var(--accent) 45%, transparent);
      filter: brightness(1.08);
    }
    .btn-accent:active {
      transform: translateY(0);
    }

    .custom-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-color);
      transition: all 250ms ease;
    }
    .custom-card:hover {
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
      box-shadow: 0 20px 35px -10px color-mix(in srgb, var(--text-color) 12%, transparent);
    }

    .badge-accent {
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    }

    /* Inspect Mode Styles */
    body[data-inspect="true"],
    body[data-inspect="true"] * {
      cursor: crosshair !important;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--text-color) 20%, transparent);
      border-radius: 10px;
    }
  </style>
</head>
<body data-inspect="${inspectMode ? 'true' : 'false'}" class="min-h-screen flex flex-col antialiased">

  <!-- Main Storefront Sections Container -->
  <div id="storefront-root" class="flex-1 flex flex-col">
    ${bodyContentHtml}
  </div>

  <!-- Interactive Slide-Over Shopping Cart Drawer -->
  <div id="cart-drawer-backdrop" onclick="toggleCartDrawer(false)" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs opacity-0 pointer-events-none transition-opacity duration-300"></div>
  <aside id="cart-drawer" class="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md shadow-2xl flex flex-col translate-x-full transition-transform duration-300 ease-out" style="background-color: var(--card-bg); color: var(--text-color); border-left: 1px solid var(--border);">
    <div class="p-6 border-b flex items-center justify-between" style="border-color: var(--border);">
      <div class="flex items-center gap-2">
        <h3 class="font-bold text-lg font-heading">Your Cart</h3>
        <span id="cart-badge" class="px-2 py-0.5 rounded-full text-xs font-bold badge-accent">0</span>
      </div>
      <button onclick="toggleCartDrawer(false)" class="p-2 rounded-lg opacity-70 hover:opacity-100 transition cursor-pointer">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Cart Items List -->
    <div id="cart-items-container" class="flex-1 overflow-y-auto p-6 space-y-4">
      <div id="cart-empty-state" class="py-16 text-center space-y-3">
        <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center opacity-40" style="background-color: var(--secondary);">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <p class="text-sm opacity-70">Your cart is currently empty.</p>
        <button onclick="toggleCartDrawer(false)" class="btn-accent px-4 py-2 text-xs uppercase tracking-wider">
          Explore Products
        </button>
      </div>
      <div id="cart-items-list" class="space-y-3 hidden"></div>
    </div>

    <!-- Cart Footer & Checkout -->
    <div class="p-6 border-t space-y-4" style="border-color: var(--border); background-color: color-mix(in srgb, var(--card-bg) 95%, black);">
      <div class="flex items-center justify-between text-sm">
        <span style="color: var(--text-muted);">Subtotal</span>
        <span id="cart-subtotal" class="font-bold text-lg" style="color: var(--text-color);">$0.00</span>
      </div>
      <div class="flex items-center justify-between text-xs" style="color: var(--text-muted);">
        <span>Express Delivery</span>
        <span class="text-emerald-500 font-semibold">Complimentary</span>
      </div>
      <button onclick="proceedToCheckout()" class="w-full btn-accent py-3.5 text-sm uppercase tracking-wider font-bold shadow-xl">
        Checkout →
      </button>
      <button onclick="orderViaWhatsApp()" class="w-full py-3 text-xs uppercase tracking-wider font-semibold rounded-lg border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 transition flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.064-2.12-.529-1.826-.757-3.003-2.618-3.094-2.739-.091-.121-.741-.986-.741-1.88 0-.895.469-1.336.635-1.516.166-.182.363-.228.484-.228.121 0 .242.002.348.007.112.005.263-.042.411.314.152.364.515 1.259.56 1.35.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.285.813 1.467.904.182.091.288.076.394-.045.106-.121.455-.53.576-.712.121-.182.242-.152.409-.091.167.061 1.061.5 1.243.591.182.091.303.136.348.212.045.076.045.439-.099.844z"/></svg>
        <span>Order on WhatsApp</span>
      </button>
    </div>
  </aside>

  <!-- Interactive Client-side Script -->
  <script>
    const state = {
      cart: [],
      currency: '${currency || 'USD'}',
      rates: { USD: 1.0, EUR: 0.92, GBP: 0.78, INR: 83.2 },
      symbols: { USD: '$', EUR: '€', GBP: '£', INR: '₹' },
      isInspectMode: ${inspectMode ? 'true' : 'false'},
    };

    function formatPrice(usdAmount) {
      const converted = usdAmount * state.rates[state.currency];
      const symbol = state.symbols[state.currency];
      if (state.currency === 'INR') {
        return symbol + Math.round(converted).toLocaleString('en-IN');
      }
      return symbol + Math.round(converted).toLocaleString();
    }

    function updateAllPrices() {
      document.querySelectorAll('[data-price-usd]').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-price-usd'));
        if (!isNaN(usd)) {
          el.innerText = formatPrice(usd);
        }
      });
      renderCart();
    }

    function setCurrency(curr) {
      if (state.rates[curr]) {
        state.currency = curr;
        document.querySelectorAll('.currency-select-val').forEach(el => el.innerText = curr);
        updateAllPrices();
      }
    }

    function addToCart(name, price, image, category) {
      const existing = state.cart.find(i => i.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        state.cart.push({
          id: 'item-' + Date.now(),
          name,
          price: parseFloat(price),
          image: image || '',
          category: category || 'Default',
          qty: 1,
        });
      }
      renderCart();
      toggleCartDrawer(true);
    }

    function updateCartQty(name, delta) {
      const item = state.cart.find(i => i.name === name);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        state.cart = state.cart.filter(i => i.name !== name);
      }
      renderCart();
    }

    function renderCart() {
      const container = document.getElementById('cart-items-list');
      const emptyState = document.getElementById('cart-empty-state');
      const badge = document.getElementById('cart-badge');
      const navBadge = document.getElementById('nav-cart-badge');
      const subtotalEl = document.getElementById('cart-subtotal');

      const totalItems = state.cart.reduce((sum, i) => sum + i.qty, 0);
      const totalCost = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

      if (badge) badge.innerText = totalItems;
      if (navBadge) navBadge.innerText = totalItems;
      if (subtotalEl) subtotalEl.innerText = formatPrice(totalCost);

      if (totalItems === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (container) {
          container.classList.add('hidden');
          container.innerHTML = '';
        }
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');
      if (container) {
        container.classList.remove('hidden');
        container.innerHTML = state.cart.map(item => \`
          <div class="flex items-center gap-3 p-3 rounded-xl border" style="background-color: var(--secondary); border-color: var(--border);">
            <img src="\${item.image}" alt="\${item.name}" class="w-14 h-14 rounded-lg object-cover" />
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-xs truncate" style="color: var(--text-color);">\${item.name}</h4>
              <p class="text-[11px]" style="color: var(--text-muted);">\${formatPrice(item.price)}</p>
              <div class="flex items-center gap-2 mt-1">
                <button onclick="updateCartQty('\${item.name}', -1)" class="w-5 h-5 rounded border flex items-center justify-center text-xs" style="border-color: var(--border);">-</button>
                <span class="text-xs font-semibold">\${item.qty}</span>
                <button onclick="updateCartQty('\${item.name}', 1)" class="w-5 h-5 rounded border flex items-center justify-center text-xs" style="border-color: var(--border);">+</button>
              </div>
            </div>
            <button onclick="updateCartQty('\${item.name}', -\${item.qty})" class="text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        \`).join('');
      }
    }

    function toggleCartDrawer(open) {
      const drawer = document.getElementById('cart-drawer');
      const backdrop = document.getElementById('cart-drawer-backdrop');
      if (open) {
        drawer.classList.remove('translate-x-full');
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
      } else {
        drawer.classList.add('translate-x-full');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
      }
    }

    function proceedToCheckout() {
      alert('💳 Checkout initialized for ' + document.getElementById('cart-subtotal').innerText);
    }

    function orderViaWhatsApp() {
      const itemsStr = state.cart.map(i => i.qty + 'x ' + i.name).join(', ') || 'Inquiry';
      const msg = encodeURIComponent("Hello ${escapeHtml(brandName)}, I would like to order: " + itemsStr);
      const phone = "${contactPhone ? contactPhone.replace(/[^0-9]/g, '') : ''}";
      window.open("https://wa.me/" + (phone || '') + "?text=" + msg, "_blank");
    }

    function filterProducts(category, btn) {
      document.querySelectorAll('.prod-cat-btn').forEach(b => {
        b.classList.remove('btn-accent');
        b.classList.add('custom-card');
      });
      if (btn) {
        btn.classList.add('btn-accent');
        btn.classList.remove('custom-card');
      }

      document.querySelectorAll('[data-prod-cat]').forEach(card => {
        if (category === 'All' || card.getAttribute('data-prod-cat') === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function searchProducts(query) {
      const q = query.toLowerCase();
      document.querySelectorAll('[data-prod-name]').forEach(card => {
        const name = (card.getAttribute('data-prod-name') || '').toLowerCase();
        if (!q || name.includes(q)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function scrollWidgetSlider(dir) {
      const track = document.getElementById('widget-slider-track');
      if (track) {
        track.scrollBy({ left: dir * 320, behavior: 'smooth' });
      }
    }

    function toggleFaq(btn) {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      } else {
        content.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
    }

    // Page Navigation & PDP Interactions
    function navigateToPage(page, productData) {
      window.parent.postMessage({
        type: 'NAVIGATE_PAGE',
        page: page,
        product: productData || null,
      }, '*');
    }

    function openPdp(productJson) {
      try {
        const prod = typeof productJson === 'string' ? JSON.parse(productJson) : productJson;
        navigateToPage('pdp', prod);
      } catch {
        navigateToPage('pdp', null);
      }
    }

    function switchProductImage(thumb, src) {
      const mainImg = document.getElementById('pdp-main-image');
      if (mainImg) mainImg.src = src;
      document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('ring-2', 'ring-accent', 'border-accent'));
      if (thumb) thumb.classList.add('ring-2', 'ring-accent', 'border-accent');
    }

    function selectPdpColor(btn, colorName) {
      document.querySelectorAll('.pdp-color-btn').forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-accent'));
      if (btn) btn.classList.add('ring-2', 'ring-offset-2', 'ring-accent');
      const label = document.getElementById('pdp-selected-color');
      if (label) label.innerText = colorName;
    }

    function selectPdpSize(btn, sizeName) {
      document.querySelectorAll('.pdp-size-btn').forEach(b => {
        b.classList.remove('btn-accent');
        b.classList.add('custom-card');
      });
      if (btn) {
        btn.classList.add('btn-accent');
        btn.classList.remove('custom-card');
      }
      const label = document.getElementById('pdp-selected-size');
      if (label) label.innerText = sizeName;
    }

    function changePdpQty(delta) {
      const input = document.getElementById('pdp-qty-input');
      if (input) {
        let val = parseInt(input.innerText) || 1;
        val = Math.max(1, val + delta);
        input.innerText = val;
      }
    }

    function switchPdpTab(tabId) {
      document.querySelectorAll('.pdp-tab-btn').forEach(b => {
        b.classList.remove('border-b-2', 'border-accent', 'font-bold');
        b.classList.add('border-transparent', 'opacity-60');
      });
      document.querySelectorAll('.pdp-tab-pane').forEach(p => p.classList.add('hidden'));
      const activeBtn = document.getElementById('pdp-tab-btn-' + tabId);
      const activePane = document.getElementById('pdp-tab-pane-' + tabId);
      if (activeBtn) {
        activeBtn.classList.add('border-b-2', 'border-accent', 'font-bold');
        activeBtn.classList.remove('border-transparent', 'opacity-60');
      }
      if (activePane) activePane.classList.remove('hidden');
    }

    function addCurrentPdpToCart(name, price, img, cat) {
      const qtyElem = document.getElementById('pdp-qty-input');
      const qty = qtyElem ? (parseInt(qtyElem.innerText) || 1) : 1;
      for (let i = 0; i < qty; i++) {
        addToCart(name, price, img, cat);
      }
      toggleCartDrawer(true);
    }

    // Dedicated Visual Inspect & Element Selection Overlays
    (function() {
      // Create and mount floating inspector overlays
      const hoverBox = document.createElement('div');
      hoverBox.id = '__omni_inspect_hover';
      hoverBox.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;display:none;border:2px dashed #00e5ff;background:rgba(0,229,255,0.08);transition:all 50ms ease;border-radius:4px;';
      const hoverLabel = document.createElement('span');
      hoverLabel.style.cssText = 'position:absolute;top:-24px;left:0;background:#00e5ff;color:#000;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:0.05em;font-family:system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);';
      hoverBox.appendChild(hoverLabel);
      document.body.appendChild(hoverBox);

      const selectedBox = document.createElement('div');
      selectedBox.id = '__omni_inspect_selected';
      selectedBox.style.cssText = 'position:fixed;pointer-events:none;z-index:99998;display:none;border:3px solid #00e5ff;box-shadow:0 0 20px rgba(0,229,255,0.5);background:rgba(0,229,255,0.04);border-radius:4px;';
      const selectedLabel = document.createElement('span');
      selectedLabel.style.cssText = 'position:absolute;top:-26px;left:0;background:#00e5ff;color:#000;font-size:11px;font-weight:800;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.05em;font-family:system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,229,255,0.4);display:flex;align-items:center;gap:4px;';
      selectedBox.appendChild(selectedLabel);
      document.body.appendChild(selectedBox);

      let currentSelectedEl = null;

      function updateBox(box, el) {
        if (!box || !el) return;
        const rect = el.getBoundingClientRect();
        box.style.top = Math.max(0, rect.top) + 'px';
        box.style.left = Math.max(0, rect.left) + 'px';
        box.style.width = Math.max(16, rect.width) + 'px';
        box.style.height = Math.max(16, rect.height) + 'px';
        box.style.display = 'block';
      }

      function resolveTarget(el) {
        if (!el || el === document.body || el === document.documentElement || el === hoverBox || el === selectedBox) return null;

        // 1. Image
        if (el.tagName === 'IMG') {
          return {
            element: el,
            type: 'image',
            label: 'Image',
            src: el.currentSrc || el.src || '',
            alt: el.alt || '',
            text: el.alt || 'Image element',
          };
        }
        const childImg = el.querySelector('img');
        if (childImg && el.children.length === 1 && ['DIV', 'FIGURE', 'PICTURE', 'A'].includes(el.tagName)) {
          return {
            element: childImg,
            type: 'image',
            label: 'Image',
            src: childImg.currentSrc || childImg.src || '',
            alt: childImg.alt || '',
            text: childImg.alt || 'Image element',
          };
        }

        // 2. Headings
        if (/^H[1-6]$/.test(el.tagName)) {
          return {
            element: el,
            type: 'heading',
            label: el.tagName.toUpperCase() + ' Heading',
            text: (el.innerText || '').slice(0, 150).trim(),
          };
        }

        // 3. Buttons & CTAs
        const btn = el.tagName === 'BUTTON' ? el : (el.closest('button') || ((el.tagName === 'A' && el.classList.contains('btn')) ? el : null));
        if (btn) {
          return {
            element: btn,
            type: 'button',
            label: 'Button / CTA',
            text: (btn.innerText || '').slice(0, 80).trim(),
            href: btn.getAttribute('href') || '',
          };
        }

        // 4. Badges / Pills
        if (el.classList.contains('badge') || (el.className && typeof el.className === 'string' && el.className.includes('rounded-full') && el.innerText.length < 30)) {
          return {
            element: el,
            type: 'badge',
            label: 'Badge / Pill',
            text: (el.innerText || '').slice(0, 60).trim(),
          };
        }

        // 5. Paragraphs & Text
        if (['P', 'SPAN', 'LI', 'BLOCKQUOTE', 'LABEL', 'A'].includes(el.tagName)) {
          return {
            element: el,
            type: 'text',
            label: el.tagName === 'A' ? 'Link' : 'Text',
            text: (el.innerText || '').slice(0, 150).trim(),
            href: el.getAttribute('href') || '',
          };
        }

        // 6. Closest Product Card
        const card = el.closest('[data-product-card], .product-card, .group');
        if (card && card !== el) {
          const cardImg = card.querySelector('img');
          const cardTitle = card.querySelector('h3, h4, .font-bold, .font-semibold');
          return {
            element: card,
            type: 'product',
            label: 'Product Card',
            text: cardTitle ? cardTitle.innerText.trim() : 'Product Item',
            src: cardImg ? (cardImg.currentSrc || cardImg.src) : '',
          };
        }

        // 7. Closest Section
        const sec = el.closest('[data-section-id]') || el.closest('section, header, footer, aside');
        if (sec) {
          return {
            element: sec,
            type: 'section',
            label: sec.getAttribute('data-inspect-label') || (sec.tagName.toLowerCase() + ' Section'),
            text: (sec.querySelector('h1, h2, h3')?.innerText || sec.innerText || '').slice(0, 100).trim(),
          };
        }

        return {
          element: el,
          type: 'element',
          label: el.tagName.toLowerCase(),
          text: (el.innerText || '').slice(0, 80).trim(),
        };
      }

      window.addEventListener('message', (e) => {
        if (!e.data) return;
        if (e.data.type === 'SET_INSPECT_MODE') {
          state.isInspectMode = !!e.data.enabled;
          document.body.setAttribute('data-inspect', state.isInspectMode ? 'true' : 'false');
          if (!state.isInspectMode) {
            if (hoverBox) hoverBox.style.display = 'none';
          }
        } else if (e.data.type === 'CLEAR_SELECTION') {
          currentSelectedEl = null;
          if (selectedBox) selectedBox.style.display = 'none';
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (!state.isInspectMode) return;
        const target = resolveTarget(e.target);
        if (!target) {
          if (hoverBox) hoverBox.style.display = 'none';
          return;
        }
        updateBox(hoverBox, target.element);
        const icon = target.type === 'image' ? '📷 ' : target.type === 'heading' ? '🔤 ' : target.type === 'button' ? '🔘 ' : target.type === 'product' ? '📦 ' : '📄 ';
        if (hoverLabel) hoverLabel.textContent = icon + target.label + ' • Click to customize';
      });

      document.addEventListener('mouseleave', () => {
        if (hoverBox) hoverBox.style.display = 'none';
      });

      document.addEventListener('click', (e) => {
        if (!state.isInspectMode) return;
        const target = resolveTarget(e.target);
        if (!target) return;

        e.preventDefault();
        e.stopPropagation();

        currentSelectedEl = target.element;
        updateBox(selectedBox, target.element);
        const icon = target.type === 'image' ? '📷 ' : target.type === 'heading' ? '🔤 ' : target.type === 'button' ? '🔘 ' : target.type === 'product' ? '📦 ' : '🎯 ';
        if (selectedLabel) selectedLabel.textContent = icon + target.label;

        // Find parent section
        const sec = target.element.closest('[data-section-id]') || target.element.closest('section, header, footer, aside, [id]');
        const sectionId = sec ? (sec.getAttribute('data-section-id') || sec.id) : '';

        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          sectionId,
          elementType: target.type,
          label: target.label,
          text: target.text,
          src: target.src || '',
          href: target.href || '',
          tagName: target.element.tagName.toLowerCase(),
        }, '*');
      }, true);

      window.addEventListener('scroll', () => {
        if (currentSelectedEl && selectedBox && selectedBox.style.display !== 'none') {
          updateBox(selectedBox, currentSelectedEl);
        }
        if (hoverBox) hoverBox.style.display = 'none';
      }, { passive: true });

      window.addEventListener('resize', () => {
        if (currentSelectedEl && selectedBox && selectedBox.style.display !== 'none') {
          updateBox(selectedBox, currentSelectedEl);
        }
      });
    })();
  </script>
</body>
</html>`;
}

function renderSectionHtml(
  section: StorefrontSection,
  theme: StorefrontTheme,
  brandName: string,
  tagline: string,
  isDark: boolean,
  currencySymbol: string = '$',
  storeContext?: {
    logo?: string;
    currency?: string;
    currencySymbol?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    socialLinks?: Record<string, string>;
  }
): string {
  // If custom HTML is explicitly provided on the section, render it directly!
  if (section.customHtml && section.customHtml.trim().length > 0) {
    const rawHtml = section.customHtml.trim();
    const inspectAttrs = `data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="${escapeHtml(section.name || section.title || 'Custom Section')}"`;
    if (rawHtml.startsWith('<section') || rawHtml.startsWith('<header') || rawHtml.startsWith('<footer') || rawHtml.startsWith('<div')) {
      if (!rawHtml.includes('data-inspect-target')) {
        return rawHtml.replace(/^<([a-z0-9]+)([\s>])/i, `<$1 id="${section.id}" ${inspectAttrs}$2`);
      }
      return rawHtml;
    }
    return `
    <section id="${section.id}" ${inspectAttrs} class="w-full">
      ${rawHtml}
    </section>`;
  }

  const content = (section.contentJson || {}) as Record<string, any>;
  const isMarketplace =
    section.type === 'marketplace_header' ||
    section.type === 'marketplace_grid' ||
    section.type === 'lightning_deals' ||
    content.isMarketplace ||
    content.heroLayout === 'marketplace' ||
    (section.subtitle && section.subtitle.toLowerCase().includes('mega deals')) ||
    (section.title && section.title.toLowerCase().includes('festival')) ||
    brandName.toLowerCase().includes('market') ||
    brandName.toLowerCase().includes('amazon');

  switch (section.type) {
    case 'marketplace_header':
      return `
      <!-- Amazon / Marketplace Multi-Tier Header -->
      <header id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Marketplace Header" class="w-full flex flex-col z-40 sticky top-0 shadow-md">
        <!-- Top Tier Bar -->
        <div class="px-4 py-2.5 flex items-center justify-between gap-4 text-white" style="background-color: var(--primary);">
          <!-- Logo & Deliver To -->
          <div class="flex items-center gap-4 shrink-0">
            <a href="#" onclick="navigateToPage('home'); return false;" class="text-xl sm:text-2xl font-black tracking-tight font-heading flex items-center gap-2 text-white">
              ${storeContext?.logo ? `<img src="${escapeHtml(storeContext.logo)}" alt="${escapeHtml(brandName)}" class="h-8 max-w-[120px] object-contain rounded bg-white/10 p-0.5" />` : ''}
              <span>${escapeHtml(brandName)}</span>
              <span class="text-xs px-1.5 py-0.5 rounded font-bold" style="background-color: var(--accent); color: #000000;">.shop</span>
            </a>
            <div class="hidden lg:flex items-center gap-1.5 text-xs text-zinc-300 hover:border border-white/40 p-1 rounded cursor-pointer">
              <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <div>
                <div class="text-[10px] text-zinc-400 leading-none">Deliver to</div>
                <div class="font-bold text-white text-[11px] leading-tight">All Locations</div>
              </div>
            </div>
          </div>

          <!-- Central Search Bar with Department Selector -->
          <div class="flex-1 max-w-3xl mx-2 flex items-center">
            <div class="w-full flex rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2" style="--tw-ring-color: var(--accent);">
              <select class="px-3 py-2 text-xs bg-zinc-100 text-zinc-800 border-r border-zinc-300 outline-none cursor-pointer hidden sm:block">
                <option>All Departments</option>
                <option>Mega Deals</option>
                <option>Electronics & Gadgets</option>
                <option>Computers & PCs</option>
                <option>Home & Kitchen</option>
                <option>Fashion & Streetwear</option>
                <option>Daily Essentials</option>
              </select>
              <input
                type="text"
                oninput="searchProducts(this.value)"
                placeholder="Search ${escapeHtml(brandName)} for electronics, fashion, home..."
                class="flex-1 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button class="px-5 py-2 flex items-center justify-center transition hover:brightness-105 cursor-pointer" style="background-color: var(--accent); color: #000000;" title="Search">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
            </div>
          </div>

          <!-- Right Controls -->
          <div class="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
            <div class="hidden md:flex items-center gap-1 font-bold text-white hover:border border-white/40 p-1.5 rounded cursor-pointer">
              <span>🇺🇸 EN</span>
            </div>
            <div class="hidden sm:block hover:border border-white/40 p-1.5 rounded cursor-pointer">
              <div class="text-[10px] text-zinc-300 leading-none">Hello, Sign In</div>
              <div class="font-bold text-white text-xs leading-tight">Account & Lists ▾</div>
            </div>
            <div class="hidden sm:block hover:border border-white/40 p-1.5 rounded cursor-pointer">
              <div class="text-[10px] text-zinc-300 leading-none">Returns</div>
              <div class="font-bold text-white text-xs leading-tight">& Orders</div>
            </div>
            <button onclick="toggleCartDrawer(true)" class="flex items-center gap-1.5 p-1.5 hover:border border-white/40 rounded transition cursor-pointer">
              <div class="relative">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <span id="nav-cart-badge" class="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-black" style="background-color: var(--accent);">0</span>
              </div>
              <span class="font-bold text-white hidden md:inline">Cart</span>
            </button>
          </div>
        </div>

        <!-- Sub-Nav Category Strip -->
        <div class="px-4 py-2 flex items-center gap-5 text-xs text-white overflow-x-auto whitespace-nowrap scrollbar-none" style="background-color: var(--secondary);">
          <button class="flex items-center gap-1.5 font-bold hover:text-white cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            <span>All Categories</span>
          </button>
          <a href="#deals" class="hover:underline font-bold text-amber-300">⚡ Today's Mega Deals</a>
          <a href="#products" class="hover:underline">Best Sellers</a>
          <a href="#products" class="hover:underline">Electronics & Laptops</a>
          <a href="#products" class="hover:underline">Home & Kitchen</a>
          <a href="#products" class="hover:underline">Prime 1-Day Delivery</a>
          <a href="#features" class="hover:underline">Customer Service</a>
          <a href="#newsletter" class="hover:underline">Gift Cards & Registry</a>
          <span class="ml-auto hidden md:inline text-zinc-300 font-medium">Free returns on 50,000+ items</span>
        </div>
      </header>`;

    case 'marketplace_grid':
      return `
      <!-- Amazon Signature 4-Box Category Deal Grid -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Marketplace Category Boxes" class="relative z-20 -mt-16 sm:-mt-24 px-4 sm:px-6 max-w-7xl mx-auto w-full mb-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Box 1: Electronics 4-quadrant -->
          <div class="p-5 rounded-lg border shadow-md flex flex-col justify-between" style="background-color: var(--card-bg); border-color: var(--border);">
            <div>
              <h3 class="font-bold text-base font-heading mb-3" style="color: var(--text-color);">Deals in Electronics & PCs</h3>
              <div class="grid grid-cols-2 gap-2.5">
                <div class="group cursor-pointer" onclick="filterProducts('Electronics')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Laptops & PCs</div>
                </div>
                <div class="group cursor-pointer" onclick="filterProducts('Electronics')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Smartwatches</div>
                </div>
                <div class="group cursor-pointer" onclick="filterProducts('Electronics')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Audio & ANC</div>
                </div>
                <div class="group cursor-pointer" onclick="filterProducts('Electronics')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Smartphones</div>
                </div>
              </div>
            </div>
            <a href="#products" class="text-xs font-semibold mt-4 hover:underline" style="color: var(--accent);">See all tech deals →</a>
          </div>

          <!-- Box 2: Home & Kitchen 4-quadrant -->
          <div class="p-5 rounded-lg border shadow-md flex flex-col justify-between" style="background-color: var(--card-bg); border-color: var(--border);">
            <div>
              <h3 class="font-bold text-base font-heading mb-3" style="color: var(--text-color);">Refresh Your Home & Kitchen</h3>
              <div class="grid grid-cols-2 gap-2.5">
                <div class="group cursor-pointer" onclick="filterProducts('Home')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Air Fryers</div>
                </div>
                <div class="group cursor-pointer" onclick="filterProducts('Home')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Comfort Living</div>
                </div>
                <div class="group cursor-pointer" onclick="filterProducts('Home')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Lighting</div>
                </div>
                <div class="group cursor-pointer" onclick="filterProducts('Home')">
                  <div class="aspect-square rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div class="text-[11px] font-medium mt-1 truncate" style="color: var(--text-color);">Vacuums</div>
                </div>
              </div>
            </div>
            <a href="#products" class="text-xs font-semibold mt-4 hover:underline" style="color: var(--accent);">Explore kitchen & home →</a>
          </div>

          <!-- Box 3: Today's Featured Lightning Deal -->
          <div class="p-5 rounded-lg border shadow-md flex flex-col justify-between" style="background-color: var(--card-bg); border-color: var(--border);">
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-base font-heading" style="color: var(--text-color);">Deal of the Day</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">UP TO 55% OFF</span>
              </div>
              <div class="aspect-video rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 my-2">
                <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop" class="w-full h-full object-cover" />
              </div>
              <div class="text-xs font-bold line-clamp-1 mt-2" style="color: var(--text-color);">Mechanical RGB Gaming Keyboard Pro</div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-lg font-black text-rose-600">$79.99</span>
                <span class="text-xs line-through" style="color: var(--text-muted);">$159.99</span>
              </div>
              <div class="mt-2 space-y-1">
                <div class="flex justify-between text-[10px]" style="color: var(--text-muted);">
                  <span>78% Claimed</span>
                  <span>Ends in 03:24:18</span>
                </div>
                <div class="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div class="h-full bg-rose-500 rounded-full" style="width: 78%;"></div>
                </div>
              </div>
            </div>
            <button onclick="addToCart('Mechanical RGB Gaming Keyboard Pro', 79.99, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop')" class="mt-4 w-full py-2 text-xs font-bold uppercase rounded shadow-md transition hover:brightness-105 cursor-pointer" style="background-color: var(--accent); color: #000000;">
              Claim Lightning Deal
            </button>
          </div>

          <!-- Box 4: Top Brands & Sign-In Callout -->
          <div class="p-5 rounded-lg border shadow-md flex flex-col justify-between" style="background-color: var(--card-bg); border-color: var(--border);">
            <div>
              <h3 class="font-bold text-base font-heading mb-2" style="color: var(--text-color);">Sign in for your best experience</h3>
              <p class="text-xs leading-relaxed" style="color: var(--text-muted);">Get personalized deals, tracking, and Prime 1-day delivery.</p>
              <button onclick="alert('Sign in dialog')" class="w-full mt-3 py-2 text-xs font-bold uppercase rounded shadow-xs cursor-pointer" style="background-color: var(--accent); color: #000000;">
                Sign in securely
              </button>
            </div>
            <div class="border-t pt-3 mt-3 space-y-2" style="border-color: var(--border);">
              <div class="text-[11px] font-bold uppercase tracking-wider" style="color: var(--text-color);">Certified Prime Brands</div>
              <div class="flex items-center gap-2 text-xs">
                <span class="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-bold" style="color: var(--text-color);">⚡ Prime Delivery</span>
                <span class="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-bold text-emerald-600">✓ A-to-Z Safe</span>
              </div>
            </div>
            <a href="#products" class="text-xs font-semibold mt-2 hover:underline" style="color: var(--accent);">Browse 50,000+ items →</a>
          </div>
        </div>
      </section>`;

    case 'lightning_deals':
      return `
      <!-- Amazon Today's Lightning Deals Carousel -->
      <section id="deals" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Lightning Deals" class="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full my-6 p-6 rounded-xl border shadow-sm" style="background-color: var(--card-bg); border-color: var(--border);">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div class="flex items-center gap-3">
            <h2 class="text-xl sm:text-2xl font-black font-heading flex items-center gap-2" style="color: var(--text-color);">
              <span>Today's Lightning Deals</span>
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">LIMITED TIME</span>
          </div>
          <div class="text-xs font-semibold flex items-center gap-2" style="color: var(--text-muted);">
            <span>Deals refresh in: <strong class="text-rose-500 font-mono text-sm">04h : 18m : 33s</strong></span>
            <a href="#products" class="ml-4 hover:underline" style="color: var(--accent);">See all deals →</a>
          </div>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
          ${[
            { name: "Echo Wireless Smart Speaker 5th Gen", price: 39.99, orig: 79.99, off: "50% off", rating: 4.8, reviews: "24,800", img: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&auto=format&fit=crop", claimed: 82 },
            { name: "Sony WH-1000XM5 Noise Cancelling Headphones", price: 298.00, orig: 399.99, off: "25% off", rating: 4.9, reviews: "18,200", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop", claimed: 91 },
            { name: "Ninja Air Fryer Pro XL 6-in-1", price: 89.99, orig: 149.99, off: "40% off", rating: 4.7, reviews: "9,400", img: "https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=400&auto=format&fit=crop", claimed: 64 },
            { name: "Apple Watch Series 9 GPS 45mm", price: 329.00, orig: 429.00, off: "23% off", rating: 4.9, reviews: "14,500", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&auto=format&fit=crop", claimed: 77 },
            { name: "Kindle Paperwhite 16GB Waterproof", price: 109.99, orig: 149.99, off: "27% off", rating: 4.8, reviews: "32,100", img: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&auto=format&fit=crop", claimed: 89 },
          ].map(d => `
            <div class="min-w-[240px] max-w-[240px] p-4 rounded-lg border flex flex-col justify-between shrink-0 hover:shadow-md transition" style="background-color: var(--background); border-color: var(--border);">
              <div class="aspect-square rounded overflow-hidden bg-white mb-3">
                <img src="${d.img}" alt="${d.name}" class="w-full h-full object-contain p-2" />
              </div>
              <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">${d.off}</span>
                  <span class="text-[10px] font-bold text-rose-600">Deal</span>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-lg font-black" style="color: var(--text-color);">$${d.price.toFixed(2)}</span>
                  <span class="text-xs line-through" style="color: var(--text-muted);">$${d.orig.toFixed(2)}</span>
                </div>
                <h4 class="text-xs font-medium line-clamp-2" style="color: var(--text-color);">${d.name}</h4>
                <div class="flex items-center gap-1 text-[11px] text-amber-500">
                  <span>★★★★☆</span>
                  <span class="text-[10px]" style="color: var(--text-muted);">${d.rating} (${d.reviews})</span>
                </div>
                <div class="pt-1 space-y-1">
                  <div class="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div class="h-full bg-rose-500 rounded-full" style="width: ${d.claimed}%;"></div>
                  </div>
                  <div class="text-[10px]" style="color: var(--text-muted);">${d.claimed}% claimed</div>
                </div>
              </div>
              <button onclick="addToCart('${escapeHtml(d.name)}', ${d.price}, '${d.img}')" class="mt-3 w-full py-1.5 text-xs font-bold uppercase rounded transition hover:brightness-105 cursor-pointer" style="background-color: var(--accent); color: #000000;">
                Add to Cart
              </button>
            </div>
          `).join('')}
        </div>
      </section>`;

    case 'announcement':
      return `
      <aside id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Announcement Bar" class="w-full py-2.5 px-4 text-xs font-medium text-center flex items-center justify-between border-b" style="background-color: var(--secondary); border-color: var(--border); color: var(--text-color);">
        <div class="hidden sm:flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider badge-accent">${escapeHtml(
            content.badge || 'SPECIAL OFFER'
          )}</span>
        </div>
        <div class="flex-1 text-center font-medium truncate px-2">
          ${escapeHtml(content.text || section.title)}
          <a href="${content.ctaLink || '#collections'}" class="underline ml-2 hover:opacity-80 transition">${escapeHtml(
            content.ctaText || 'Shop Now →'
          )}</a>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 text-[11px] font-mono">
            <button onclick="setCurrency('USD')" class="hover:underline cursor-pointer">USD</button>
            <span>•</span>
            <button onclick="setCurrency('EUR')" class="hover:underline cursor-pointer">EUR</button>
            <span>•</span>
            <button onclick="setCurrency('INR')" class="hover:underline cursor-pointer">INR</button>
          </div>
        </div>
      </aside>`;

    case 'header':
      if (isMarketplace) {
        // If marketplace concept, forward to full marketplace header
        return renderSectionHtml({ ...section, type: 'marketplace_header' }, theme, brandName, tagline, isDark, currencySymbol, storeContext);
      }
      const logoText = content.logoText || brandName;
      return `
      <header id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Navigation Header" class="sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between" style="background-color: color-mix(in srgb, var(--primary) 85%, transparent); border-color: var(--border);">
        <div class="flex items-center gap-8">
          <a href="#" onclick="navigateToPage('home'); return false;" class="text-xl sm:text-2xl font-black tracking-tight font-heading flex items-center gap-2" style="color: var(--text-color);">
            ${storeContext?.logo ? `<img src="${escapeHtml(storeContext.logo)}" alt="${escapeHtml(brandName)}" class="h-8 max-w-[120px] object-contain rounded bg-white/10 p-0.5" />` : ''}
            <span>${escapeHtml(logoText)}</span>
          </a>
          <nav class="hidden md:flex items-center gap-6 text-sm font-medium" style="color: var(--text-muted);">
            ${(content.links || [
              { label: 'Shop', href: '#collections' },
              { label: 'Featured', href: '#collections' },
              { label: 'Reviews', href: '#reviews' },
            ])
              .map(
                (l: { label: string; href: string }) => `
              <a href="${l.href}" class="hover:opacity-100 transition" style="color: var(--text-muted);">${escapeHtml(l.label)}</a>
            `
              )
              .join('')}
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative hidden sm:block">
            <input
              type="text"
              oninput="searchProducts(this.value)"
              placeholder="Search ${escapeHtml(brandName)}..."
              class="px-3.5 py-1.5 rounded-full text-xs custom-card placeholder:opacity-50 focus:outline-none w-44 transition"
              style="background-color: var(--card-bg); color: var(--text-color);"
            />
          </div>
          <button onclick="toggleCartDrawer(true)" class="btn-accent px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span>Cart</span>
            <span id="nav-cart-badge" class="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style="background: var(--text-color); color: var(--background);">0</span>
          </button>
        </div>
      </header>`;

    case 'hero':
      if (isMarketplace) {
        return `
        <!-- Amazon / Marketplace Panoramic Festival Banner Hero -->
        <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Marketplace Banner Hero" class="relative overflow-hidden w-full pb-24 sm:pb-32 pt-8 px-4 sm:px-6 border-b" style="background: linear-gradient(180deg, var(--secondary) 0%, var(--background) 100%); border-color: var(--border);">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="space-y-4 max-w-2xl text-left">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase" style="background-color: var(--accent); color: #000000;">
                ⚡ ${escapeHtml(content.badge || 'GREAT FESTIVAL EDITION')}
              </span>
              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight" style="color: var(--text-color);">
                ${escapeHtml(section.title)}
              </h1>
              <p class="text-sm sm:text-lg leading-relaxed font-normal" style="color: var(--text-muted);">
                ${escapeHtml(section.subtitle || tagline)}
              </p>
              <div class="pt-2 flex flex-wrap gap-3">
                <a href="#deals" class="px-6 py-3 font-bold text-xs uppercase tracking-wider rounded shadow-lg transition hover:brightness-105 cursor-pointer" style="background-color: var(--accent); color: #000000;">
                  ${escapeHtml(content.primaryCta || 'Shop All Deals')}
                </a>
                <a href="#products" class="px-6 py-3 font-semibold text-xs uppercase tracking-wider rounded border transition hover:opacity-80" style="background-color: var(--card-bg); border-color: var(--border); color: var(--text-color);">
                  ${escapeHtml(content.secondaryCta || 'Explore Best Sellers')}
                </a>
              </div>
            </div>
            <!-- Visual Hero Splash -->
            <div class="shrink-0 relative hidden lg:block w-96 aspect-4/3 rounded-xl overflow-hidden shadow-2xl border" style="border-color: var(--border);">
              <img src="${content.heroImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop'}" alt="Mega Deals" class="w-full h-full object-cover" />
              <div class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg">
                UP TO 80% OFF
              </div>
            </div>
          </div>
        </section>`;
      }

      const isSplitLayout = content.heroLayout === 'split' || !!content.heroImage;
      const stats = content.stats || [
        { label: 'Happy Customers', value: '10,000+' },
        { label: 'Satisfaction Rate', value: '99.4%' },
        { label: 'Premium Guarantee', value: '100%' },
      ];

      if (isSplitLayout) {
        return `
        <!-- Modern Two-Column Split Hero -->
        <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Hero Banner" class="relative py-16 sm:py-24 px-6 border-b" style="border-color: var(--border);">
          <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold badge-accent">
                <span>${escapeHtml(content.badge || '✨ FEATURED COLLECTION')}</span>
              </div>
              <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08]" style="color: var(--text-color);">
                ${escapeHtml(section.title)}
              </h1>
              <p class="text-base sm:text-lg font-normal leading-relaxed max-w-xl" style="color: var(--text-muted);">
                ${escapeHtml(section.subtitle || tagline)}
              </p>
              <div class="pt-2 flex flex-wrap items-center gap-4">
                <a href="${content.primaryLink || '#collections'}" class="btn-accent px-8 py-4 text-sm uppercase tracking-wider font-bold shadow-xl">
                  ${escapeHtml(content.primaryCta || 'Explore Collection')}
                </a>
                <a href="${content.secondaryLink || '#reviews'}" class="px-7 py-4 text-sm uppercase tracking-wider font-semibold rounded-lg custom-card transition hover:opacity-80">
                  ${escapeHtml(content.secondaryCta || 'Read Reviews')}
                </a>
              </div>
              <div class="pt-8 grid grid-cols-3 gap-6 max-w-lg border-t" style="border-color: var(--border);">
                ${stats
                  .map(
                    (st: { label: string; value: string }) => `
                  <div>
                    <div class="text-2xl sm:text-3xl font-extrabold font-heading" style="color: var(--text-color);">${escapeHtml(
                      st.value
                    )}</div>
                    <div class="text-xs uppercase tracking-wider mt-1" style="color: var(--text-muted);">${escapeHtml(
                      st.label
                    )}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
            <div class="lg:col-span-5 relative">
              <div class="relative rounded-2xl overflow-hidden shadow-2xl border aspect-[4/5] custom-card" style="border-color: var(--border);">
                <img src="${
                  content.heroImage ||
                  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop'
                }" alt="${escapeHtml(section.title)}" class="w-full h-full object-cover" />
                <div class="absolute bottom-4 left-4 right-4 p-4 rounded-xl backdrop-blur-md border flex items-center justify-between" style="background-color: color-mix(in srgb, var(--card-bg) 85%, transparent); border-color: var(--border);">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--accent);">${escapeHtml(
                      brandName
                    )}</span>
                    <h4 class="text-xs font-bold truncate" style="color: var(--text-color);">${escapeHtml(
                      section.title
                    )}</h4>
                  </div>
                  <a href="#collections" class="btn-accent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider">
                    View
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>`;
      }

      // Full-width cinematic hero
      return `
      <!-- Full-Width Banner Hero -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Hero Banner" class="relative min-h-[75vh] flex items-center justify-center text-center px-6 overflow-hidden border-b" style="border-color: var(--border);">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 pointer-events-none z-10"></div>
        <img src="${
          content.heroImage ||
          'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop'
        }" alt="${escapeHtml(section.title)}" class="absolute inset-0 w-full h-full object-cover opacity-50" />

        <div class="relative z-20 max-w-4xl mx-auto space-y-6 pt-12 pb-16 text-white">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold badge-accent bg-black/50 backdrop-blur-xs">
            <span>${escapeHtml(content.badge || '✨ NEW SEASON')}</span>
          </div>
          <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            ${escapeHtml(section.title)}
          </h1>
          <p class="text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed text-zinc-200">
            ${escapeHtml(section.subtitle || tagline)}
          </p>
          <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a href="${content.primaryLink || '#collections'}" class="btn-accent px-8 py-4 text-sm uppercase tracking-wider font-bold shadow-2xl">
              ${escapeHtml(content.primaryCta || 'Shop Collection')}
            </a>
            <a href="${content.secondaryLink || '#reviews'}" class="px-7 py-4 text-sm uppercase tracking-wider font-semibold rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition">
              ${escapeHtml(content.secondaryCta || 'Learn More')}
            </a>
          </div>
        </div>
      </section>`;

    case 'products':
      const prods = content.products || [];
      const categories = content.categories || ['All', 'Featured', 'New Arrivals'];
      return `
      <!-- Catalog Section -->
      <section id="collections" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Product Catalog" class="py-20 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">CURATED COLLECTION</span>
            <h2 class="text-3xl sm:text-5xl font-extrabold mt-2 font-heading" style="color: var(--text-color);">${escapeHtml(
              section.title
            )}</h2>
            <p class="text-sm mt-1 max-w-2xl" style="color: var(--text-muted);">${escapeHtml(
              section.subtitle || ''
            )}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            ${categories
              .map(
                (cat: string, idx: number) => `
              <button onclick="filterProducts('${cat}', this)" class="prod-cat-btn px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  idx === 0 ? 'btn-accent' : 'custom-card'
                }">
                ${cat}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${prods
            .map(
              (p: {
                id: string;
                name: string;
                category: string;
                price: number;
                comparePrice?: number;
                badge?: string;
                image: string;
                description: string;
              }) => `
            <div data-prod-cat="${escapeHtml(
              p.category
            )}" data-prod-name="${escapeHtml(
                p.name
              )}" class="custom-card overflow-hidden flex flex-col group">
              <div onclick="openPdp('${escapeHtml(JSON.stringify(p))}')" class="h-64 relative overflow-hidden flex items-center justify-center p-4 cursor-pointer" style="background-color: color-mix(in srgb, var(--card-bg) 85%, black);">
                <img src="${p.image}" alt="${escapeHtml(
                p.name
              )}" class="object-cover w-full h-full group-hover:scale-105 transition duration-500 rounded-lg" />
                ${
                  p.badge
                    ? `
                <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider badge-accent backdrop-blur-xs">
                  ${escapeHtml(p.badge)}
                </span>`
                    : ''
                }
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-black shadow-lg">View Details →</span>
                </div>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div onclick="openPdp('${escapeHtml(JSON.stringify(p))}')" class="cursor-pointer">
                  <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--accent);">${escapeHtml(
                    p.category
                  )}</span>
                  <h3 class="font-bold text-base mt-1 hover:underline" style="color: var(--text-color);">${escapeHtml(
                    p.name
                  )}</h3>
                  <p class="text-xs mt-1 line-clamp-2" style="color: var(--text-muted);">${escapeHtml(
                    p.description || ''
                  )}</p>
                </div>
                <div class="pt-3 border-t flex items-center justify-between gap-2" style="border-color: var(--border);">
                  <div>
                    <span class="font-bold text-lg" style="color: var(--text-color);" data-price-usd="${
                      p.price
                    }">${currencySymbol}${p.price}.00</span>
                    ${
                      p.comparePrice
                        ? `
                    <span class="text-xs line-through ml-1.5 opacity-60" data-price-usd="${p.comparePrice}">${currencySymbol}${p.comparePrice}.00</span>`
                        : ''
                    }
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button onclick="openPdp('${escapeHtml(JSON.stringify(p))}')" class="px-2.5 py-1.5 text-xs font-semibold rounded hover:bg-white/10 transition cursor-pointer" style="color: var(--text-color);">
                      Details
                    </button>
                    <button onclick="addToCart('${escapeHtml(p.name)}', ${
                  p.price
                }, '${p.image}', '${escapeHtml(
                  p.category
                )}')" class="btn-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>`;

    case 'features':
      const pillars = content.pillars || [
        { title: 'Conscious Craft', desc: 'Sustainably sourced with certified ethical standards.' },
        { title: 'Worldwide Express', desc: 'Reliable door-to-door tracking across 60+ countries.' },
        { title: 'Full Guarantee', desc: '30-day effortless returns with zero restocking fees.' },
        { title: 'Dedicated Concierge', desc: 'Real human support available 24/7 on live chat.' },
      ];
      return `
      <!-- Pillars Section -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Brand Pillars" class="py-20 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">WHY CHOOSE US</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold font-heading" style="color: var(--text-color);">${escapeHtml(
            section.title
          )}</h2>
          <p class="text-sm" style="color: var(--text-muted);">${escapeHtml(section.subtitle || '')}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${pillars
            .map(
              (pil: { title: string; desc: string }) => `
            <div class="p-6 rounded-2xl custom-card space-y-3">
              <div class="w-10 h-10 rounded-xl badge-accent flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 class="font-bold text-base font-heading" style="color: var(--text-color);">${escapeHtml(
                pil.title
              )}</h3>
              <p class="text-xs leading-relaxed" style="color: var(--text-muted);">${escapeHtml(
                pil.desc
              )}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>`;

    case 'reviews':
      const reviews = content.reviews || [];
      return `
      <!-- Customer Reviews -->
      <section id="reviews" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Customer Reviews" class="py-24 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">CLIENT EXPERIENCES</span>
            <h2 class="text-3xl sm:text-5xl font-extrabold mt-2 font-heading" style="color: var(--text-color);">${escapeHtml(
              section.title
            )}</h2>
            <p class="text-sm mt-1" style="color: var(--text-muted);">${escapeHtml(
              section.subtitle || ''
            )}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-3xl font-extrabold font-heading" style="color: var(--text-color);">${content.averageRating || 4.9}</span>
            <div>
              <div class="text-amber-500 text-sm">★★★★★</div>
              <div class="text-[11px]" style="color: var(--text-muted);">Verified Buyers</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${reviews
            .map(
              (rev: {
                author: string;
                location: string;
                rating: number;
                text: string;
                verified: boolean;
                date: string;
              }) => `
            <div class="p-6 rounded-2xl custom-card flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="text-amber-500 text-xs">★★★★★</div>
                  <span class="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Verified Purchase</span>
                </div>
                <p class="text-xs leading-relaxed italic" style="color: var(--text-color);">"${escapeHtml(
                  rev.text
                )}"</p>
              </div>
              <div class="pt-4 border-t flex items-center justify-between text-xs" style="border-color: var(--border);">
                <div>
                  <h4 class="font-bold" style="color: var(--text-color);">${escapeHtml(
                    rev.author
                  )}</h4>
                  <p class="text-[11px]" style="color: var(--text-muted);">${escapeHtml(
                    rev.location
                  )}</p>
                </div>
                <span class="text-[10px]" style="color: var(--text-muted);">${escapeHtml(
                  rev.date
                )}</span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>`;

    case 'faq':
      const faqs = content.items || [];
      return `
      <!-- FAQ Section -->
      <section id="faq" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="FAQ Section" class="py-20 px-6 max-w-4xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="text-center mb-12 space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">COMMON INQUIRIES</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold font-heading" style="color: var(--text-color);">${escapeHtml(
            section.title
          )}</h2>
          <p class="text-sm" style="color: var(--text-muted);">${escapeHtml(section.subtitle || '')}</p>
        </div>

        <div class="space-y-3">
          ${faqs
            .map(
              (faq: { q: string; a: string }) => `
            <div class="rounded-xl custom-card overflow-hidden">
              <button onclick="toggleFaq(this)" class="w-full p-5 text-left font-bold text-sm flex items-center justify-between transition cursor-pointer" style="color: var(--text-color);">
                <span>${escapeHtml(faq.q)}</span>
                <span class="faq-icon transition-transform duration-200" style="color: var(--text-muted);">▼</span>
              </button>
              <div class="hidden p-5 pt-0 text-xs leading-relaxed border-t" style="border-color: var(--border); color: var(--text-muted);">
                ${escapeHtml(faq.a)}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>`;

    case 'whatsapp_cta':
      return `
      <!-- WhatsApp Concierge -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="WhatsApp Concierge" class="py-16 px-6 max-w-7xl mx-auto w-full">
        <div class="rounded-3xl p-8 sm:p-12 relative overflow-hidden custom-card flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="space-y-3 max-w-xl">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              🟢 Live Representative
            </span>
            <h2 class="text-2xl sm:text-4xl font-extrabold font-heading" style="color: var(--text-color);">${escapeHtml(
              section.title
            )}</h2>
            <p class="text-sm leading-relaxed" style="color: var(--text-muted);">${escapeHtml(
              section.subtitle || ''
            )}</p>
          </div>
          <button onclick="orderViaWhatsApp()" class="btn-accent px-8 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap shadow-2xl flex items-center gap-3 cursor-pointer">
            <span>${escapeHtml(content.buttonText || 'Chat on WhatsApp')}</span>
            <span>→</span>
          </button>
        </div>
      </section>`;

    case 'newsletter':
      return `
      <!-- Newsletter Section -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Newsletter" class="py-20 px-6 max-w-4xl mx-auto w-full text-center space-y-6">
        <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">STAY CONNECTED</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold font-heading" style="color: var(--text-color);">${escapeHtml(
          section.title
        )}</h2>
        <p class="text-sm max-w-md mx-auto" style="color: var(--text-muted);">${escapeHtml(
          section.subtitle || ''
        )}</p>
        <form onsubmit="event.preventDefault(); alert('🎉 Thank you for subscribing to ${escapeHtml(brandName)} updates.');" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" required placeholder="${escapeHtml(
            content.placeholder || 'Enter your email'
          )}" class="flex-1 px-4 py-3 rounded-lg custom-card text-xs focus:outline-none" style="background-color: var(--card-bg); color: var(--text-color);" />
          <button type="submit" class="btn-accent px-6 py-3 text-xs uppercase tracking-wider font-bold cursor-pointer">
            ${escapeHtml(content.buttonText || 'Subscribe')}
          </button>
        </form>
      </section>`;

    case 'footer':
      const cols = content.columns || [
        {
          title: 'Shop',
          links: [
            { label: 'All Products', href: '#collections' },
            { label: 'New Arrivals', href: '#collections' },
            { label: 'Special Offers', href: '#collections' },
          ],
        },
        {
          title: 'About',
          links: [
            { label: 'Our Story', href: '#' },
            { label: 'Sustainability', href: '#' },
            { label: 'Press & Media', href: '#' },
          ],
        },
        {
          title: 'Support',
          links: [
            { label: 'Shipping & Delivery', href: '#' },
            { label: 'Returns & Exchanges', href: '#' },
            { label: 'Contact Us', href: '#' },
          ],
        },
      ];
      return `
      <!-- Footer -->
      <footer id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Storefront Footer" class="border-t py-16 px-6 max-w-7xl mx-auto w-full" style="border-color: var(--border);">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div class="md:col-span-2 space-y-4">
            <div class="flex items-center gap-2.5">
              ${storeContext?.logo ? `<img src="${escapeHtml(storeContext.logo)}" alt="${escapeHtml(brandName)}" class="h-8 max-w-[120px] object-contain rounded bg-white/10 p-0.5" />` : ''}
              <h3 class="text-xl font-bold font-heading" style="color: var(--text-color);">${escapeHtml(brandName)}</h3>
            </div>
            <p class="text-xs leading-relaxed max-w-sm" style="color: var(--text-muted);">${escapeHtml(
              tagline
            )}</p>
            ${storeContext?.address || storeContext?.contactEmail || storeContext?.contactPhone ? `
            <div class="pt-2 space-y-1.5 text-xs" style="color: var(--text-muted);">
              ${storeContext.address ? `<div class="flex items-center gap-2"><span>📍</span><span>${escapeHtml(storeContext.address)}</span></div>` : ''}
              ${storeContext.contactEmail ? `<div class="flex items-center gap-2"><span>✉️</span><a href="mailto:${escapeHtml(storeContext.contactEmail)}" class="hover:underline">${escapeHtml(storeContext.contactEmail)}</a></div>` : ''}
              ${storeContext.contactPhone ? `<div class="flex items-center gap-2"><span>📞</span><a href="tel:${escapeHtml(storeContext.contactPhone)}" class="hover:underline">${escapeHtml(storeContext.contactPhone)}</a></div>` : ''}
            </div>` : ''}
          </div>
          ${cols
            .map(
              (col: { title: string; links: Array<{ label: string; href: string }> }) => `
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-color);">${escapeHtml(
                col.title
              )}</h4>
              <ul class="space-y-2 text-xs">
                ${(col.links || [])
                  .map(
                    (l) => `
                  <li><a href="${l.href}" class="hover:underline transition" style="color: var(--text-muted);">${escapeHtml(l.label)}</a></li>
                `
                  )
                  .join('')}
              </ul>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="pt-12 mt-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style="border-color: var(--border); color: var(--text-muted);">
          <p>© ${new Date().getFullYear()} ${escapeHtml(brandName)}. All rights reserved.</p>
          <div class="flex items-center gap-4">
            <span>Powered by OmniStore Commerce Engine</span>
          </div>
        </div>
      </footer>`;

    case 'custom':
      return section.customHtml || content.html || '';

    default:
      return '';
  }
}

/**
 * Renders the Full Product Listing / Catalog Page (PLP)
 */
function renderProductsListingPage(
  products: any[],
  categories: string[],
  theme: StorefrontTheme,
  brandName: string,
  isDark: boolean,
  currencySymbol: string = '$'
): string {
  return `
  <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs mb-6" style="color: var(--text-muted);">
      <button onclick="navigateToPage('home')" class="hover:underline cursor-pointer flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span>Home</span>
      </button>
      <span>/</span>
      <span style="color: var(--text-color);" class="font-bold">Catalog & All Products</span>
    </nav>

    <!-- Page Title & Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b gap-4" style="border-color: var(--border);">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold badge-accent mb-2">
          <span>🛍️ Live Store Catalog</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black font-heading tracking-tight" style="color: var(--text-color);">
          All Products & Curated Drops
        </h1>
        <p class="text-xs sm:text-sm mt-1 max-w-2xl" style="color: var(--text-muted);">
          Synchronized directly with live OmniStore inventory, dynamic currency pricing, and worldwide fulfillment.
        </p>
      </div>
      <div class="text-xs font-semibold" style="color: var(--text-muted);">
        Showing <span class="font-bold" style="color: var(--text-color);">${products.length}</span> curated items
      </div>
    </div>

    <!-- Filter & Search Controls Bar -->
    <div class="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border custom-card">
      <!-- Search Input -->
      <div class="flex-1 max-w-md relative">
        <input
          type="text"
          oninput="searchProducts(this.value)"
          placeholder="Search products by title or keywords..."
          class="w-full py-2 px-4 pr-10 text-xs rounded-lg border outline-none bg-black/10 focus:ring-2 focus:ring-accent"
          style="border-color: var(--border); color: var(--text-color);"
        />
        <svg class="w-4 h-4 absolute right-3 top-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        ${categories
          .map(
            (cat: string, idx: number) => `
          <button onclick="filterProducts('${cat}', this)" class="prod-cat-btn px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition ${
              idx === 0 ? 'btn-accent' : 'custom-card hover:bg-white/5'
            }">
            ${cat}
          </button>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${products
        .map(
          (p) => `
        <div data-prod-cat="${escapeHtml(p.category)}" data-prod-name="${escapeHtml(p.name)}" class="custom-card overflow-hidden flex flex-col justify-between group rounded-xl">
          <div onclick="openPdp('${escapeHtml(JSON.stringify(p))}')" class="h-64 relative overflow-hidden flex items-center justify-center p-4 cursor-pointer" style="background-color: color-mix(in srgb, var(--card-bg) 85%, black);">
            <img src="${p.image}" alt="${escapeHtml(p.name)}" class="object-cover w-full h-full group-hover:scale-105 transition duration-500 rounded-lg" />
            ${
              p.badge
                ? `
            <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider badge-accent backdrop-blur-xs">
              ${escapeHtml(p.badge)}
            </span>`
                : ''
            }
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-black shadow-lg">View Details →</span>
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
            <div onclick="openPdp('${escapeHtml(JSON.stringify(p))}')" class="cursor-pointer">
              <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--accent);">${escapeHtml(p.category)}</span>
              <h3 class="font-bold text-base mt-1 hover:underline truncate" style="color: var(--text-color);">${escapeHtml(p.name)}</h3>
              <p class="text-xs mt-1 line-clamp-2" style="color: var(--text-muted);">${escapeHtml(p.description || '')}</p>
            </div>
            <div class="pt-3 border-t flex items-center justify-between gap-2" style="border-color: var(--border);">
              <div>
                <span class="font-bold text-lg" style="color: var(--text-color);">${currencySymbol}${p.price}.00</span>
                ${p.comparePrice ? `<span class="text-xs line-through ml-1.5 opacity-60">${currencySymbol}${p.comparePrice}.00</span>` : ''}
              </div>
              <div class="flex items-center gap-1.5">
                <button onclick="openPdp('${escapeHtml(JSON.stringify(p))}')" class="px-2.5 py-1.5 text-xs font-semibold rounded hover:bg-white/10 transition cursor-pointer" style="color: var(--text-color);">
                  Details
                </button>
                <button onclick="addToCart('${escapeHtml(p.name)}', ${p.price}, '${p.image}', '${escapeHtml(p.category)}')" class="btn-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  </main>
  `;
}

/**
 * Renders the High-Converting Product Description Page (PDP)
 */
function renderProductDescriptionPage(
  product: any,
  allProducts: any[],
  theme: StorefrontTheme,
  brandName: string,
  isDark: boolean,
  currencySymbol: string = '$',
  contactPhone?: string
): string {
  const savings = Math.max(25, (product.comparePrice || product.price * 1.3) - product.price);
  return `
  <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
    <!-- Breadcrumb Navigation -->
    <nav class="flex items-center gap-2 text-xs mb-8" style="color: var(--text-muted);">
      <button onclick="navigateToPage('home')" class="hover:underline cursor-pointer flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span>Home</span>
      </button>
      <span>/</span>
      <button onclick="navigateToPage('products')" class="hover:underline cursor-pointer">Catalog</button>
      <span>/</span>
      <span style="color: var(--text-color);" class="font-semibold truncate max-w-[200px]">${escapeHtml(product.name)}</span>
    </nav>

    <!-- 2-Column Product Detail Stage -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
      <!-- Left Column: Gallery (7 cols on lg) -->
      <div class="lg:col-span-7 flex flex-col gap-4">
        <!-- Main Photo Frame -->
        <div class="aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden border shadow-lg relative flex items-center justify-center p-6 custom-card" style="background-color: color-mix(in srgb, var(--card-bg) 85%, black);">
          <img id="pdp-main-image" src="${product.image}" alt="${escapeHtml(product.name)}" class="w-full h-full object-contain sm:object-cover rounded-xl transition duration-300" />
          <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider badge-accent backdrop-blur-md">
            ${escapeHtml(product.badge || 'SIGNATURE EDITION')}
          </span>
        </div>

        <!-- Thumbnail Selector Row -->
        <div class="grid grid-cols-4 gap-3">
          ${[
            product.image,
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
          ]
            .map(
              (thumb, idx) => `
            <button onclick="switchProductImage(this, '${thumb}')" class="pdp-thumb aspect-square rounded-xl overflow-hidden border custom-card p-1 cursor-pointer transition hover:scale-105 ${
                idx === 0 ? 'ring-2 ring-accent border-accent' : ''
              }">
              <img src="${thumb}" alt="Angle ${idx + 1}" class="w-full h-full object-cover rounded-lg" />
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Value Proposition Guarantees -->
        <div class="grid grid-cols-3 gap-3 pt-4 border-t" style="border-color: var(--border);">
          <div class="p-3 rounded-xl border custom-card text-center space-y-1">
            <div class="text-base">⚡</div>
            <div class="text-xs font-bold" style="color: var(--text-color);">Express Courier</div>
            <div class="text-[10px]" style="color: var(--text-muted);">Ships within 24h</div>
          </div>
          <div class="p-3 rounded-xl border custom-card text-center space-y-1">
            <div class="text-base">🛡️</div>
            <div class="text-xs font-bold" style="color: var(--text-color);">2-Year Warranty</div>
            <div class="text-[10px]" style="color: var(--text-muted);">100% Genuine Coverage</div>
          </div>
          <div class="p-3 rounded-xl border custom-card text-center space-y-1">
            <div class="text-base">🔄</div>
            <div class="text-xs font-bold" style="color: var(--text-color);">30-Day Returns</div>
            <div class="text-[10px]" style="color: var(--text-muted);">Effortless pickup</div>
          </div>
        </div>
      </div>

      <!-- Right Column: Product Actions & Variants (5 cols on lg) -->
      <div class="lg:col-span-5 flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <!-- Collection / Category -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-widest" style="color: var(--accent);">${escapeHtml(product.category || 'Featured')}</span>
            <span class="text-xs opacity-40">•</span>
            <span class="text-xs text-emerald-500 font-semibold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> In Stock
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight" style="color: var(--text-color);">
            ${escapeHtml(product.name)}
          </h1>

          <!-- Rating & Reviews snippet -->
          <div class="flex items-center gap-2.5 text-xs">
            <div class="flex text-amber-400 text-sm">★★★★★</div>
            <span class="font-bold" style="color: var(--text-color);">4.98</span>
            <span style="color: var(--text-muted);">(184 verified appraisals)</span>
          </div>

          <!-- Pricing Block -->
          <div class="p-4 rounded-xl border custom-card flex items-baseline justify-between">
            <div>
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-black font-heading" style="color: var(--text-color);">${currencySymbol}${product.price}.00</span>
                ${product.comparePrice ? `<span class="text-base line-through opacity-50">${currencySymbol}${product.comparePrice}.00</span>` : ''}
              </div>
              <div class="text-xs text-emerald-500 font-semibold mt-1">
                Save ${currencySymbol}${savings}.00 • Best Price Guaranteed
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white">
              Special Offer
            </span>
          </div>

          <!-- Description -->
          <p class="text-sm leading-relaxed" style="color: var(--text-muted);">
            ${escapeHtml(product.description || 'Engineered with meticulous craftsmanship and unyielding performance. Designed for discerning owners who demand aesthetic purity and uncompromising durability.')}
          </p>

          <!-- Variant Swatches: Finish / Color -->
          <div class="space-y-2 pt-2">
            <div class="flex justify-between text-xs">
              <span class="font-semibold" style="color: var(--text-color);">Finish:</span>
              <span id="pdp-selected-color" class="font-bold" style="color: var(--accent);">Obsidian Titanium</span>
            </div>
            <div class="flex items-center gap-3">
              <button onclick="selectPdpColor(this, 'Obsidian Titanium')" class="pdp-color-btn w-8 h-8 rounded-full border-2 border-white ring-2 ring-offset-2 ring-accent cursor-pointer transition" style="background-color: #1A1A1A;"></button>
              <button onclick="selectPdpColor(this, 'Silver Frost')" class="pdp-color-btn w-8 h-8 rounded-full border-2 border-white cursor-pointer transition" style="background-color: #E2E8F0;"></button>
              <button onclick="selectPdpColor(this, 'Midnight Aurora')" class="pdp-color-btn w-8 h-8 rounded-full border-2 border-white cursor-pointer transition" style="background-color: #1E3A8A;"></button>
              <button onclick="selectPdpColor(this, 'Amber Gold')" class="pdp-color-btn w-8 h-8 rounded-full border-2 border-white cursor-pointer transition" style="background-color: #D97706;"></button>
            </div>
          </div>

          <!-- Variant Pills: Edition / Size -->
          <div class="space-y-2 pt-2">
            <div class="flex justify-between text-xs">
              <span class="font-semibold" style="color: var(--text-color);">Edition:</span>
              <span id="pdp-selected-size" class="font-bold" style="color: var(--accent);">Pro Edition</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button onclick="selectPdpSize(this, 'Standard Edition')" class="pdp-size-btn py-2 text-xs font-semibold rounded-lg custom-card cursor-pointer transition">Standard</button>
              <button onclick="selectPdpSize(this, 'Pro Edition')" class="pdp-size-btn py-2 text-xs font-semibold rounded-lg btn-accent cursor-pointer transition">Pro Edition</button>
              <button onclick="selectPdpSize(this, 'Bespoke Atelier')" class="pdp-size-btn py-2 text-xs font-semibold rounded-lg custom-card cursor-pointer transition">Bespoke Atelier</button>
            </div>
          </div>

          <!-- Quantity & Add to Cart -->
          <div class="space-y-3 pt-3">
            <div class="flex items-center gap-3">
              <!-- Stepper -->
              <div class="flex items-center border rounded-xl overflow-hidden custom-card">
                <button onclick="changePdpQty(-1)" class="px-3.5 py-2 hover:bg-white/10 font-bold transition cursor-pointer">-</button>
                <span id="pdp-qty-input" class="px-3.5 py-2 font-bold text-sm min-w-[32px] text-center" style="color: var(--text-color);">1</span>
                <button onclick="changePdpQty(1)" class="px-3.5 py-2 hover:bg-white/10 font-bold transition cursor-pointer">+</button>
              </div>

              <!-- Primary Add to Bag CTA -->
              <button onclick="addCurrentPdpToCart('${escapeHtml(product.name)}', ${product.price}, '${product.image}', '${escapeHtml(product.category)}')" class="flex-1 btn-accent py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            <!-- Fast 1-Click Checkout -->
            <button onclick="addCurrentPdpToCart('${escapeHtml(product.name)}', ${product.price}, '${product.image}', '${escapeHtml(product.category)}'); proceedToCheckout();" class="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider custom-card hover:bg-white/10 transition border cursor-pointer" style="border-color: var(--border);">
              ⚡ Instant 1-Click Checkout
            </button>

            <!-- WhatsApp Order -->
            <button onclick="orderViaWhatsApp()" class="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer">
              <span>💬 Inquire or Order via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabbed Specifications & Customer Reviews -->
    <div class="border-t pt-10 mb-16" style="border-color: var(--border);">
      <div class="flex items-center gap-6 border-b pb-3 mb-6 overflow-x-auto no-scrollbar" style="border-color: var(--border);">
        <button id="pdp-tab-btn-overview" onclick="switchPdpTab('overview')" class="pdp-tab-btn pb-2 text-sm font-bold border-b-2 border-accent transition cursor-pointer shrink-0" style="color: var(--text-color);">
          Product Overview
        </button>
        <button id="pdp-tab-btn-specs" onclick="switchPdpTab('specs')" class="pdp-tab-btn pb-2 text-sm transition cursor-pointer shrink-0 opacity-60" style="color: var(--text-color);">
          Technical Specifications
        </button>
        <button id="pdp-tab-btn-reviews" onclick="switchPdpTab('reviews')" class="pdp-tab-btn pb-2 text-sm transition cursor-pointer shrink-0 opacity-60" style="color: var(--text-color);">
          Customer Appraisals (184)
        </button>
        <button id="pdp-tab-btn-shipping" onclick="switchPdpTab('shipping')" class="pdp-tab-btn pb-2 text-sm transition cursor-pointer shrink-0 opacity-60" style="color: var(--text-color);">
          Shipping & Returns
        </button>
      </div>

      <!-- Tab 1: Overview -->
      <div id="pdp-tab-pane-overview" class="pdp-tab-pane space-y-4">
        <h3 class="text-lg font-bold font-heading" style="color: var(--text-color);">Masterpiece Precision & Finish</h3>
        <p class="text-sm leading-relaxed" style="color: var(--text-muted);">
          Every component of ${escapeHtml(product.name)} is manufactured under uncompromising tolerance limits. From hand-burnished bezels to sapphire anti-glare crystal glass, each piece embodies the dedication of artisan workshops.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div class="p-4 rounded-xl border custom-card">
            <div class="font-bold text-sm mb-1" style="color: var(--text-color);">Grade 5 Titanium</div>
            <div class="text-xs" style="color: var(--text-muted);">Aerospace-level strength to weight ratio with hypoallergenic finish.</div>
          </div>
          <div class="p-4 rounded-xl border custom-card">
            <div class="font-bold text-sm mb-1" style="color: var(--text-color);">Water Resistance</div>
            <div class="text-xs" style="color: var(--text-muted);">Certified to 10 ATM (100m) with triple-gasket screw-down crown.</div>
          </div>
          <div class="p-4 rounded-xl border custom-card">
            <div class="font-bold text-sm mb-1" style="color: var(--text-color);">Sapphire Crystal</div>
            <div class="text-xs" style="color: var(--text-muted);">Scratch-resistant synthetic corundum with 9H Mohs hardness rating.</div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Specs -->
      <div id="pdp-tab-pane-specs" class="pdp-tab-pane hidden space-y-3">
        <table class="w-full text-xs" style="color: var(--text-color);">
          <tbody>
            <tr class="border-b" style="border-color: var(--border);">
              <td class="py-2.5 font-bold w-1/3" style="color: var(--text-muted);">Model Reference</td>
              <td class="py-2.5 font-mono">${escapeHtml(product.id || 'PROD').toUpperCase()}-OMNI</td>
            </tr>
            <tr class="border-b" style="border-color: var(--border);">
              <td class="py-2.5 font-bold" style="color: var(--text-muted);">Dimensions / Diameter</td>
              <td class="py-2.5">42mm Diameter • 11.2mm Thickness • 48mm Lug-to-Lug</td>
            </tr>
            <tr class="border-b" style="border-color: var(--border);">
              <td class="py-2.5 font-bold" style="color: var(--text-muted);">Casing Material</td>
              <td class="py-2.5">Forged Ti-6Al-4V Titanium with Brushed Satin Facets</td>
            </tr>
            <tr class="border-b" style="border-color: var(--border);">
              <td class="py-2.5 font-bold" style="color: var(--text-muted);">Compatibility</td>
              <td class="py-2.5">OmniStore Quick-Release Pins (20mm & 22mm interchangeable)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab 3: Reviews -->
      <div id="pdp-tab-pane-reviews" class="pdp-tab-pane hidden space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border custom-card space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-amber-400 text-xs">★★★★★</span>
              <span class="text-[10px] text-emerald-500 font-semibold">Verified Buyer</span>
            </div>
            <div class="font-bold text-sm" style="color: var(--text-color);">"Exceeds high expectations"</div>
            <p class="text-xs leading-relaxed" style="color: var(--text-muted);">The finishing on the case and smooth action on the clasp feels identical to luxury pieces triple the price.</p>
            <div class="text-[11px] font-medium" style="color: var(--text-color);">— Henry V., London UK</div>
          </div>
          <div class="p-4 rounded-xl border custom-card space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-amber-400 text-xs">★★★★★</span>
              <span class="text-[10px] text-emerald-500 font-semibold">Verified Buyer</span>
            </div>
            <div class="font-bold text-sm" style="color: var(--text-color);">"Magnificent packaging & delivery"</div>
            <p class="text-xs leading-relaxed" style="color: var(--text-muted);">Arrived in 2 days to NYC with insured courier. Flawless weight and comfortable daily wear.</p>
            <div class="text-[11px] font-medium" style="color: var(--text-color);">— Sarah K., New York NY</div>
          </div>
        </div>
      </div>

      <!-- Tab 4: Shipping -->
      <div id="pdp-tab-pane-shipping" class="pdp-tab-pane hidden space-y-3 text-xs leading-relaxed" style="color: var(--text-muted);">
        <p>• <strong style="color: var(--text-color);">Complimentary Courier:</strong> We provide free insured global shipping on all orders over $150. Delivery times typically range between 2 to 4 business days.</p>
        <p>• <strong style="color: var(--text-color);">30-Day Effortless Returns:</strong> If you are not completely satisfied, return the unblemished piece within 30 days for a full immediate refund.</p>
      </div>
    </div>

    <!-- Cross-Sell: Related Products -->
    <div class="border-t pt-10" style="border-color: var(--border);">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold font-heading" style="color: var(--text-color);">Frequently Paired With</h3>
        <button onclick="navigateToPage('products')" class="text-xs font-bold hover:underline" style="color: var(--accent);">View Full Catalog →</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        ${allProducts
          .slice(1, 4)
          .map(
            (rel: any) => `
          <div class="custom-card rounded-xl overflow-hidden p-4 flex flex-col justify-between group">
            <div onclick="openPdp('${escapeHtml(JSON.stringify(rel))}')" class="aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-900 cursor-pointer">
              <img src="${rel.image}" alt="${escapeHtml(rel.name)}" class="w-full h-full object-cover group-hover:scale-105 transition" />
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase" style="color: var(--accent);">${escapeHtml(rel.category)}</div>
              <h4 class="font-bold text-sm mt-1 truncate" style="color: var(--text-color);">${escapeHtml(rel.name)}</h4>
              <div class="font-bold text-base mt-2" style="color: var(--text-color);">${currencySymbol}${rel.price}.00</div>
            </div>
            <button onclick="addToCart('${escapeHtml(rel.name)}', ${rel.price}, '${rel.image}', '${escapeHtml(rel.category)}')" class="mt-3 w-full btn-accent py-2 text-xs font-bold uppercase rounded cursor-pointer">
              Add to Bag
            </button>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </main>
  `;
}

/**
 * Renders the Brand Story / Atelier Page
 */
function renderStoryPage(brandName: string, tagline: string, theme: StorefrontTheme, isDark: boolean): string {
  return `
  <main class="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
    <div class="text-center space-y-4 max-w-3xl mx-auto">
      <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">THE ATELIER PHILOSOPHY</span>
      <h1 class="text-3xl sm:text-6xl font-black font-heading" style="color: var(--text-color);">The Story of ${escapeHtml(brandName)}</h1>
      <p class="text-base sm:text-xl font-light leading-relaxed" style="color: var(--text-muted);">${escapeHtml(tagline)}</p>
    </div>

    <div class="aspect-21/9 w-full rounded-2xl overflow-hidden border shadow-xl custom-card">
      <img src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=1600&auto=format&fit=crop" alt="Atelier Workshop" class="w-full h-full object-cover" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div class="space-y-4 text-sm leading-relaxed" style="color: var(--text-muted);">
        <h2 class="text-2xl font-bold font-heading" style="color: var(--text-color);">Founded on Uncompromising Quality</h2>
        <p>
          At ${escapeHtml(brandName)}, we believe that everyday objects should stand as monuments to craftsmanship. We reject mass obsolescence in favor of enduring form, deliberate engineering, and tactile beauty.
        </p>
        <p>
          Each release is produced in limited micro-batches, allowing master artisans to inspect every seam, bevel, and facet with microscopic scrutiny.
        </p>
      </div>
      <div class="p-6 rounded-2xl border custom-card space-y-4">
        <h3 class="font-bold text-base font-heading" style="color: var(--text-color);">Our Three Pillars</h3>
        <ul class="space-y-3 text-xs" style="color: var(--text-muted);">
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span><strong>Traceable Materials:</strong> Ethically extracted metals, certified organic textiles, and circular lifecycle design.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span><strong>Direct From Atelier:</strong> Zero middleman markups. Value concentrated entirely into raw materials and craft.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span><strong>Lifetime Service:</strong> Guaranteed parts and refurbishment support for generational longevity.</span>
          </li>
        </ul>
      </div>
    </div>
  </main>
  `;
}

/**
 * Renders the Customer Reviews & Appraisals Page
 */
function renderReviewsPage(reviews: any[], brandName: string, theme: StorefrontTheme, isDark: boolean): string {
  const allRevs = reviews.length > 0 ? reviews : [
    { author: 'Julian H.', location: 'Geneva, Switzerland', rating: 5, text: 'The titanium finish and tactile precision is indistinguishable from top Swiss ateliers.', date: 'Yesterday' },
    { author: 'Camille B.', location: 'Paris, France', rating: 5, text: 'Arrived packaged like high jewelry. Exemplary attention to customer care and presentation.', date: '3 days ago' },
    { author: 'Elias T.', location: 'San Francisco, CA', rating: 5, text: 'Daily driver for 6 months now. Still looks brand new. The warranty and support team are phenomenal.', date: '1 week ago' },
    { author: 'Sophia M.', location: 'Tokyo, Japan', rating: 5, text: 'A masterclass in modern digital commerce and artisanal craftsmanship.', date: '2 weeks ago' },
  ];

  return `
  <main class="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
    <div class="text-center space-y-3 max-w-2xl mx-auto">
      <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">VERIFIED CLIENT APPRAISALS</span>
      <h1 class="text-3xl sm:text-5xl font-black font-heading" style="color: var(--text-color);">Patron Acclaim</h1>
      <p class="text-sm" style="color: var(--text-muted);">Real experiences from verified buyers across 45+ countries worldwide.</p>
    </div>

    <!-- Overall Scorecard Banner -->
    <div class="p-8 rounded-2xl border custom-card flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="text-center md:text-left space-y-1">
        <div class="text-5xl font-black font-heading" style="color: var(--text-color);">4.98</div>
        <div class="flex items-center justify-center md:justify-start text-amber-400 text-lg">★★★★★</div>
        <div class="text-xs" style="color: var(--text-muted);">Based on 1,850+ verified customer purchases</div>
      </div>

      <div class="flex-1 max-w-sm space-y-2 w-full text-xs">
        <div class="flex items-center gap-3">
          <span class="w-12 text-right">5 Stars</span>
          <div class="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full" style="width: 95%;"></div>
          </div>
          <span class="w-8">95%</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-12 text-right">4 Stars</span>
          <div class="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full" style="width: 4%;"></div>
          </div>
          <span class="w-8">4%</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-12 text-right">3 Stars</span>
          <div class="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full" style="width: 1%;"></div>
          </div>
          <span class="w-8">1%</span>
        </div>
      </div>
    </div>

    <!-- Reviews Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${allRevs
        .map(
          (rev: any) => `
        <div class="p-6 rounded-2xl border custom-card space-y-4 flex flex-col justify-between">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-amber-400 text-xs">★★★★★</span>
              <span class="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Verified Buyer</span>
            </div>
            <p class="text-sm leading-relaxed italic" style="color: var(--text-color);">"${escapeHtml(rev.text)}"</p>
          </div>
          <div class="pt-4 border-t flex items-center justify-between text-xs" style="border-color: var(--border);">
            <div>
              <div class="font-bold" style="color: var(--text-color);">${escapeHtml(rev.author)}</div>
              <div class="text-[11px]" style="color: var(--text-muted);">${escapeHtml(rev.location)}</div>
            </div>
            <div class="text-[11px]" style="color: var(--text-muted);">${escapeHtml(rev.date || 'Recent')}</div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  </main>
  `;
}
