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

function getContrastColor(hexColor: string): string {
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

function isColorDark(hexColor: string): boolean {
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

export function renderStorefrontHtml({
  brandName,
  tagline,
  theme,
  sections,
  inspectMode = false,
}: {
  brandName: string;
  tagline: string;
  theme: StorefrontTheme;
  sections: StorefrontSection[];
  inspectMode?: boolean;
}): string {
  const headingFont = theme.headingFont || 'Plus Jakarta Sans';
  const bodyFont = theme.bodyFont || 'Inter';
  const isDark = isColorDark(theme.background);
  const accentContrast = getContrastColor(theme.accent);

  const sectionsHtml = sections
    .filter((s) => s.enabled)
    .map((section) => renderSectionHtml(section, theme, brandName, tagline, isDark))
    .join('\n');

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
              primary: '${theme.primary}',
              secondary: '${theme.secondary}',
              accent: '${theme.accent}',
              bg: '${theme.background}',
              card: '${theme.cardBg}',
              text: '${theme.textColor}',
              muted: '${theme.textMuted}',
              border: '${theme.border}',
            }
          }
        }
      }
    };
  </script>

  <style>
    :root {
      --primary: ${theme.primary};
      --secondary: ${theme.secondary};
      --accent: ${theme.accent};
      --accent-contrast: ${accentContrast};
      --background: ${theme.background};
      --card-bg: ${theme.cardBg};
      --text-color: ${theme.textColor};
      --text-muted: ${theme.textMuted};
      --border: ${theme.border};
      --radius: ${theme.borderRadius || '8px'};
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
    body[data-inspect="true"] [data-inspect-target] {
      cursor: crosshair !important;
      position: relative;
      transition: outline 150ms ease;
    }
    body[data-inspect="true"] [data-inspect-target]:hover {
      outline: 2px dashed #00e5ff !important;
      outline-offset: 3px;
    }
    body[data-inspect="true"] [data-inspect-target]:hover::after {
      content: attr(data-inspect-label);
      position: absolute;
      top: -24px;
      left: 0;
      z-index: 1000;
      padding: 2px 8px;
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #00e5ff;
      color: #000000;
      border-radius: 4px;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0, 229, 255, 0.4);
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
    ${sectionsHtml}
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
      currency: 'USD',
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
      window.open("https://wa.me/?text=" + msg, "_blank");
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

    // Inspect & Selection Messenger
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'SET_INSPECT_MODE') {
        state.isInspectMode = !!e.data.enabled;
        document.body.setAttribute('data-inspect', state.isInspectMode ? 'true' : 'false');
      }
    });

    document.addEventListener('click', (e) => {
      if (!state.isInspectMode) return;
      const target = e.target.closest('[data-inspect-target]');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const sectionId = target.getAttribute('data-section-id') || '';
        const label = target.getAttribute('data-inspect-label') || target.tagName;
        const text = (target.innerText || '').slice(0, 100).trim();
        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          sectionId,
          label,
          text,
          tagName: target.tagName,
        }, '*');
      }
    }, true);
  </script>
</body>
</html>`;
}

function renderSectionHtml(
  section: StorefrontSection,
  theme: StorefrontTheme,
  brandName: string,
  tagline: string,
  isDark: boolean
): string {
  const content = (section.contentJson || {}) as Record<string, any>;

  switch (section.type) {
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
      const logo = content.logoText || brandName;
      return `
      <header id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Navigation Header" class="sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between" style="background-color: color-mix(in srgb, var(--primary) 85%, transparent); border-color: var(--border);">
        <div class="flex items-center gap-8">
          <a href="#" class="text-xl sm:text-2xl font-black tracking-tight font-heading flex items-center gap-2" style="color: var(--text-color);">
            <span>${escapeHtml(logo)}</span>
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
              <div class="h-64 relative overflow-hidden flex items-center justify-center p-4" style="background-color: color-mix(in srgb, var(--card-bg) 85%, black);">
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
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--accent);">${escapeHtml(
                    p.category
                  )}</span>
                  <h3 class="font-bold text-base mt-1" style="color: var(--text-color);">${escapeHtml(
                    p.name
                  )}</h3>
                  <p class="text-xs mt-1 line-clamp-2" style="color: var(--text-muted);">${escapeHtml(
                    p.description || ''
                  )}</p>
                </div>
                <div class="pt-3 border-t flex items-center justify-between" style="border-color: var(--border);">
                  <div>
                    <span class="font-bold text-lg" style="color: var(--text-color);" data-price-usd="${
                      p.price
                    }">$${p.price}.00</span>
                    ${
                      p.comparePrice
                        ? `
                    <span class="text-xs line-through ml-1.5 opacity-60" data-price-usd="${p.comparePrice}">$${p.comparePrice}.00</span>`
                        : ''
                    }
                  </div>
                  <button onclick="addToCart('${escapeHtml(p.name)}', ${
                p.price
              }, '${p.image}', '${escapeHtml(
                p.category
              )}')" class="btn-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                    Add to Cart
                  </button>
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
            <h3 class="text-xl font-bold font-heading" style="color: var(--text-color);">${escapeHtml(brandName)}</h3>
            <p class="text-xs leading-relaxed max-w-sm" style="color: var(--text-muted);">${escapeHtml(
              tagline
            )}</p>
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

    default:
      return '';
  }
}
