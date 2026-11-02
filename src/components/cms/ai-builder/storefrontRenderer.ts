import { StorefrontTheme, StorefrontSection } from './storefrontTemplates';

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
  const headingFont = theme.headingFont || 'Playfair Display';
  const bodyFont = theme.bodyFont || 'Inter';

  const isDark =
    theme.background.toLowerCase() === '#050608' ||
    theme.background.toLowerCase() === '#020617' ||
    theme.background.toLowerCase() === '#000000' ||
    theme.background.toLowerCase().includes('dark') ||
    theme.cardBg.toLowerCase() === '#0f111a' ||
    theme.cardBg.toLowerCase() === '#0b0f19';

  const sectionsHtml = sections
    .filter((s) => s.enabled)
    .map((section) => renderSectionHtml(section, theme, brandName, tagline))
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
            heading: ['"${headingFont}"', 'serif'],
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
      --background: ${theme.background};
      --card-bg: ${theme.cardBg};
      --text-color: ${theme.textColor};
      --text-muted: ${theme.textMuted};
      --border: ${theme.border};
      --radius: ${theme.borderRadius};
      --font-heading: '${headingFont}', serif;
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
      transition: background-color 300ms ease, color 300ms ease;
    }

    h1, h2, h3, h4, .font-heading {
      font-family: var(--font-heading);
    }

    .btn-accent {
      background: var(--accent);
      color: #000000;
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
      transition: all 250ms ease;
    }
    .custom-card:hover {
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
      box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.35);
    }

    .badge-accent {
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      color: var(--accent);
      border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
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
  <aside id="cart-drawer" class="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0F111A] text-white border-l border-white/10 shadow-2xl flex flex-col translate-x-full transition-transform duration-300 ease-out">
    <div class="p-6 border-b border-white/10 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-bold text-lg font-heading">Your Acquisition Bag</h3>
        <span id="cart-badge" class="px-2 py-0.5 rounded-full text-xs font-bold badge-accent">0</span>
      </div>
      <button onclick="toggleCartDrawer(false)" class="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Cart Items List -->
    <div id="cart-items-container" class="flex-1 overflow-y-auto p-6 space-y-4">
      <div id="cart-empty-state" class="py-16 text-center space-y-3">
        <div class="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <p class="text-sm text-zinc-400">Your bag is currently empty.</p>
        <button onclick="toggleCartDrawer(false)" class="btn-accent px-4 py-2 text-xs uppercase tracking-wider">
          Explore Timepieces
        </button>
      </div>
      <div id="cart-items-list" class="space-y-3 hidden"></div>
    </div>

    <!-- Cart Footer & Checkout -->
    <div class="p-6 border-t border-white/10 bg-[#090A0F]/90 backdrop-blur-md space-y-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-zinc-400">Subtotal</span>
        <span id="cart-subtotal" class="font-bold text-lg text-white">$0.00</span>
      </div>
      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span>Insured Worldwide Express Shipping</span>
        <span class="text-emerald-400 font-semibold">Complimentary</span>
      </div>
      <button onclick="proceedToCheckout()" class="w-full btn-accent py-3.5 text-sm uppercase tracking-wider font-bold shadow-xl">
        Encrypted Checkout →
      </button>
      <button onclick="orderViaWhatsApp()" class="w-full py-3 text-xs uppercase tracking-wider font-semibold rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.064-2.12-.529-1.826-.757-3.003-2.618-3.094-2.739-.091-.121-.741-.986-.741-1.88 0-.895.469-1.336.635-1.516.166-.182.363-.228.484-.228.121 0 .242.002.348.007.112.005.263-.042.411.314.152.364.515 1.259.56 1.35.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.285.813 1.467.904.182.091.288.076.394-.045.106-.121.455-.53.576-.712.121-.182.242-.152.409-.091.167.061 1.061.5 1.243.591.182.091.303.136.348.212.045.076.045.439-.099.844z"/></svg>
        <span>Instant Concierge on WhatsApp</span>
      </button>
    </div>
  </aside>

  <!-- Video Reel Fullscreen Viewer Modal -->
  <div id="reel-modal" onclick="closeReelModal()" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md hidden items-center justify-center p-4">
    <div onclick="event.stopPropagation()" class="relative max-w-sm w-full bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
      <button onclick="closeReelModal()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer">
        ✕
      </button>
      <video id="reel-modal-video" class="w-full aspect-[9/16] object-cover" autoplay loop playsinline controls></video>
      <div class="p-4 bg-gradient-to-t from-black to-transparent absolute bottom-0 inset-x-0">
        <h4 id="reel-modal-title" class="font-bold text-white text-base"></h4>
        <p id="reel-modal-author" class="text-xs text-zinc-400"></p>
      </div>
    </div>
  </div>

  <!-- Interactive Client-side Script -->
  <script>
    // State management inside preview
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
          image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop',
          category: category || 'Horlogerie',
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
          <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <img src="\${item.image}" alt="\${item.name}" class="w-14 h-14 rounded-lg object-cover bg-black" />
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-xs text-white truncate">\${item.name}</h4>
              <p class="text-[11px] text-zinc-400 mt-0.5">\${formatPrice(item.price)} each</p>
              <div class="flex items-center gap-2 mt-2">
                <button onclick="updateCartQty('\${item.name}', -1)" class="w-5 h-5 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-xs">-</button>
                <span class="text-xs font-bold text-white">\${item.qty}</span>
                <button onclick="updateCartQty('\${item.name}', 1)" class="w-5 h-5 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-xs">+</button>
              </div>
            </div>
            <div class="text-right">
              <span class="font-bold text-sm text-white">\${formatPrice(item.price * item.qty)}</span>
              <button onclick="updateCartQty('\${item.name}', -999)" class="block text-[10px] text-red-400 hover:text-red-300 mt-2">Remove</button>
            </div>
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
      alert('💳 OmniStore Encrypted Checkout: Subtotal ' + document.getElementById('cart-subtotal').innerText + ' — Live payment gateway ready!');
    }

    function orderViaWhatsApp() {
      const itemsStr = state.cart.map(i => i.qty + 'x ' + i.name).join(', ') || 'Atelier Collection Inquiry';
      const msg = encodeURIComponent("Hello Velvet Haute Concierge, I would like to inquire about purchasing: " + itemsStr);
      window.open("https://wa.me/?text=" + msg, "_blank");
    }

    function filterProducts(category, btn) {
      document.querySelectorAll('.prod-cat-btn').forEach(b => {
        b.classList.remove('bg-white', 'text-black', 'dark:bg-white', 'dark:text-black', 'btn-accent');
        b.classList.add('custom-card', 'text-zinc-400');
      });
      if (btn) {
        btn.classList.add('btn-accent');
        btn.classList.remove('custom-card', 'text-zinc-400');
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

    function openReelModal(title, author, videoUrl) {
      const modal = document.getElementById('reel-modal');
      const video = document.getElementById('reel-modal-video');
      document.getElementById('reel-modal-title').innerText = title;
      document.getElementById('reel-modal-author').innerText = author;
      video.src = videoUrl;
      video.play();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeReelModal() {
      const modal = document.getElementById('reel-modal');
      const video = document.getElementById('reel-modal-video');
      if (video) video.pause();
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function toggleHeroVideoSound() {
      const v = document.getElementById('hero-bg-video');
      const btn = document.getElementById('hero-sound-btn');
      if (v) {
        v.muted = !v.muted;
        if (btn) {
          btn.innerText = v.muted ? '🔇 Sound Off' : '🔊 Sound On';
        }
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
  tagline: string
): string {
  const content = section.contentJson || {};

  switch (section.type) {
    case 'announcement':
      return `
      <!-- Announcement Ticker -->
      <aside id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Announcement Bar" class="w-full py-2 px-4 text-xs font-medium text-center flex items-center justify-between border-b" style="background-color: var(--secondary); border-color: var(--border); color: var(--text-color);">
        <div class="hidden sm:flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider badge-accent">${escapeHtml(
            content.badge || 'VIP ALLOCATION'
          )}</span>
        </div>
        <div class="flex-1 text-center font-medium truncate px-2">
          ${escapeHtml(content.text || section.title)}
          <a href="${content.ctaLink || '#collections'}" class="underline ml-2 hover:opacity-80 transition">${escapeHtml(
        content.ctaText || 'Acquire Drops →'
      )}</a>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 text-[11px] font-mono">
            <button onclick="setCurrency('USD')" class="hover:text-amber-400 transition cursor-pointer">USD</button>
            <span>•</span>
            <button onclick="setCurrency('EUR')" class="hover:text-amber-400 transition cursor-pointer">EUR</button>
            <span>•</span>
            <button onclick="setCurrency('INR')" class="hover:text-amber-400 transition cursor-pointer">INR</button>
          </div>
        </div>
      </aside>`;

    case 'header':
      const logo = content.logoText || brandName;
      return `
      <!-- Sticky Navigation Header -->
      <header id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Navigation Header" class="sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between" style="background-color: color-mix(in srgb, var(--primary) 85%, transparent); border-color: var(--border);">
        <div class="flex items-center gap-8">
          <a href="#" class="text-xl sm:text-2xl font-black tracking-tight font-heading flex items-center gap-2" style="color: var(--text-color);">
            <span>${escapeHtml(logo)}</span>
          </a>
          <nav class="hidden md:flex items-center gap-6 text-sm font-medium" style="color: var(--text-muted);">
            ${(content.links || [])
              .map(
                (l: { label: string; href: string }) => `
              <a href="${l.href}" class="hover:text-white transition">${escapeHtml(l.label)}</a>
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
              placeholder="Search timepieces..."
              class="px-3.5 py-1.5 rounded-full text-xs custom-card placeholder:text-zinc-500 text-white focus:outline-none focus:border-amber-400 w-44 transition"
            />
          </div>
          <button onclick="toggleCartDrawer(true)" class="btn-accent px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span>Bag</span>
            <span id="nav-cart-badge" class="w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">0</span>
          </button>
        </div>
      </header>`;

    case 'hero':
      const hasVideo = content.hasVideoBackground || !!content.videoUrl;
      const stats = content.stats || [
        { label: 'Verified Collectors', value: '25,000+' },
        { label: 'Global Service Centers', value: '42' },
        { label: 'Handcrafted Heritage', value: 'Since 1984' },
      ];
      return `
      <!-- Cinematic Hero Section -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Hero Banner" class="relative min-h-[85vh] flex items-center justify-center text-center px-6 overflow-hidden border-b" style="border-color: var(--border);">
        ${
          hasVideo
            ? `
        <!-- High-Impact Video Background -->
        <video id="hero-bg-video" autoplay loop muted playsinline class="absolute inset-0 w-full h-full object-cover opacity-35 scale-105" poster="${
          content.posterUrl ||
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop'
        }">
          <source src="${
            content.videoUrl ||
            'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4'
          }" type="video/mp4" />
        </video>
        <div class="absolute bottom-6 right-6 z-20">
          <button id="hero-sound-btn" onclick="toggleHeroVideoSound()" class="px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/90 transition shadow-lg cursor-pointer">
            🔇 Sound Off
          </button>
        </div>
        `
            : `
        <div class="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
        `
        }

        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none"></div>

        <div class="relative z-10 max-w-4xl mx-auto space-y-6 pt-12 pb-16">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold badge-accent">
            <span>${escapeHtml(content.badge || '✨ SS26 ATELIER COLLECTION')}</span>
          </div>

          <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            ${escapeHtml(section.title)}
          </h1>

          <p class="text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed" style="color: var(--text-muted);">
            ${escapeHtml(section.subtitle || tagline)}
          </p>

          <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a href="${content.primaryLink || '#collections'}" class="btn-accent px-8 py-4 text-sm uppercase tracking-wider font-bold shadow-2xl">
              ${escapeHtml(content.primaryCta || 'Explore Collections')}
            </a>
            <a href="${content.secondaryLink || '#video-showcase'}" class="px-7 py-4 text-sm uppercase tracking-wider font-semibold rounded-lg custom-card text-white hover:bg-white/10 transition">
              ${escapeHtml(content.secondaryCta || 'Watch Brand Film')}
            </a>
          </div>

          <!-- Trust & Heritage Stats Bar -->
          <div class="pt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto border-t border-white/10 text-center">
            ${stats
              .map(
                (st: { label: string; value: string }) => `
              <div>
                <div class="text-2xl sm:text-3xl font-extrabold text-white font-heading">${escapeHtml(
                  st.value
                )}</div>
                <div class="text-xs uppercase tracking-wider text-zinc-400 mt-1">${escapeHtml(
                  st.label
                )}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>`;

    case 'video_showcase':
      return `
      <!-- Video Cinema Showcase Section -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Cinematic Film Showcase" class="py-20 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-accent">
            <span>🎬 CHRONOMETRIC CINEMA</span>
          </span>
          <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading">
            ${escapeHtml(section.title)}
          </h2>
          <p class="text-sm sm:text-base leading-relaxed" style="color: var(--text-muted);">
            ${escapeHtml(section.subtitle || '')}
          </p>
        </div>

        <div class="relative rounded-2xl overflow-hidden custom-card shadow-2xl aspect-video max-h-[560px] bg-black">
          <video autoplay loop muted playsinline class="w-full h-full object-cover">
            <source src="${
              content.videoUrl ||
              'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4'
            }" type="video/mp4" />
          </video>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 pointer-events-none">
            <div class="space-y-2">
              <span class="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-purple-600 text-white">4K Masterwork</span>
              <h3 class="text-xl sm:text-2xl font-bold text-white">${escapeHtml(
                content.tagline || 'Titanium Tourbillon Movement'
              )}</h3>
            </div>
          </div>
        </div>
      </section>`;

    case 'video_reels':
      const reels = content.reels || [];
      return `
      <!-- Social Video Reels Carousel Section -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Social Video Reels" class="py-20 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider badge-accent px-3 py-1 rounded-full">📱 LIVE REELS & UNBOXINGS</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold mt-2 text-white font-heading">${escapeHtml(
              section.title
            )}</h2>
            <p class="text-sm mt-1 max-w-xl" style="color: var(--text-muted);">${escapeHtml(
              section.subtitle || ''
            )}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${reels
            .map(
              (r: {
                id: string;
                title: string;
                author: string;
                videoUrl: string;
                poster: string;
                views: string;
              }) => `
            <div onclick="openReelModal('${escapeHtml(r.title)}', '${escapeHtml(
                r.author
              )}', '${r.videoUrl}')" class="group relative rounded-2xl overflow-hidden custom-card aspect-[9/16] cursor-pointer shadow-lg hover:scale-[1.02] transition duration-300">
              <img src="${r.poster}" alt="${escapeHtml(
                r.title
              )}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-between p-4">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                    ▶ ${r.views}
                  </span>
                  <span class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-black transition">
                    ▶
                  </span>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-white line-clamp-2">${escapeHtml(
                    r.title
                  )}</h4>
                  <p class="text-[11px] text-zinc-400 mt-0.5">${escapeHtml(
                    r.author
                  )}</p>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>`;

    case 'widgets':
      const widgetItems = content.items || [];
      return `
      <!-- Modular Signature Widgets Slider -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Modular Widgets Slider" class="py-20 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold badge-accent mb-2">
              <span>⚡ MODULAR COMPONENTS</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">${escapeHtml(
              section.title
            )}</h2>
            <p class="text-sm mt-1 max-w-2xl" style="color: var(--text-muted);">${escapeHtml(
              section.subtitle || ''
            )}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="scrollWidgetSlider(-1)" class="p-3 rounded-full custom-card hover:bg-white/10 transition cursor-pointer text-white">
              ←
            </button>
            <button onclick="scrollWidgetSlider(1)" class="p-3 rounded-full custom-card hover:bg-white/10 transition cursor-pointer text-white">
              →
            </button>
          </div>
        </div>

        <div id="widget-slider-track" class="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory" style="scrollbar-width: none;">
          ${widgetItems
            .map(
              (w: {
                name: string;
                category: string;
                price: number;
                image: string;
                badge: string;
              }) => `
            <div class="min-w-[280px] sm:min-w-[310px] max-w-[310px] snap-start custom-card overflow-hidden flex flex-col group shrink-0">
              <div class="h-64 bg-zinc-950 relative overflow-hidden flex items-center justify-center p-4">
                <img src="${w.image}" alt="${escapeHtml(
                w.name
              )}" class="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs">
                  ${escapeHtml(w.badge)}
                </span>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: var(--accent);">${escapeHtml(
                    w.category
                  )}</div>
                  <h3 class="font-bold text-base text-white mt-1">${escapeHtml(
                    w.name
                  )}</h3>
                </div>
                <div class="flex items-center justify-between pt-2 border-t" style="border-color: var(--border);">
                  <span class="text-lg font-bold text-white" data-price-usd="${
                    w.price
                  }">$${w.price}.00</span>
                  <button onclick="addToCart('${escapeHtml(w.name)}', ${
                w.price
              }, '${w.image}', '${escapeHtml(
                w.category
              )}')" class="btn-accent px-3.5 py-1.5 text-xs font-bold uppercase cursor-pointer">
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>`;

    case 'products':
      const prods = content.products || [];
      const categories = content.categories || ['All', 'Timepieces', 'Straps', 'Accessories'];
      return `
      <!-- Featured Curated Catalog Section -->
      <section id="collections" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Product Catalog" class="py-24 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">SYNCHRONIZED CATALOG</span>
            <h2 class="text-3xl sm:text-5xl font-extrabold mt-2 text-white font-heading">${escapeHtml(
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
                  idx === 0 ? 'btn-accent' : 'custom-card text-zinc-400'
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
              <div class="h-64 bg-zinc-950 relative overflow-hidden flex items-center justify-center p-4">
                <img src="${p.image}" alt="${escapeHtml(
                p.name
              )}" class="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                ${
                  p.badge
                    ? `
                <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs">
                  ${escapeHtml(p.badge)}
                </span>`
                    : ''
                }
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">${escapeHtml(
                    p.category
                  )}</span>
                  <h3 class="font-bold text-base text-white mt-1">${escapeHtml(
                    p.name
                  )}</h3>
                  <p class="text-xs text-zinc-400 mt-1 line-clamp-2">${escapeHtml(
                    p.description
                  )}</p>
                </div>
                <div class="pt-3 border-t flex items-center justify-between" style="border-color: var(--border);">
                  <div>
                    <span class="font-bold text-lg text-white" data-price-usd="${
                      p.price
                    }">$${p.price}.00</span>
                    ${
                      p.comparePrice
                        ? `
                    <span class="text-xs text-zinc-500 line-through ml-1.5" data-price-usd="${p.comparePrice}">$${p.comparePrice}.00</span>`
                        : ''
                    }
                  </div>
                  <button onclick="addToCart('${escapeHtml(p.name)}', ${
                p.price
              }, '${p.image}', '${escapeHtml(
                p.category
              )}')" class="btn-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                    Add to Bag
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
      const pillars = content.pillars || [];
      return `
      <!-- Brand Guarantees & Pillars Section -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Brand Pillars & Guarantees" class="py-20 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">UNCOMPROMISING STANDARDS</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">${escapeHtml(
            section.title
          )}</h2>
          <p class="text-sm text-zinc-400">${escapeHtml(section.subtitle || '')}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${pillars
            .map(
              (pil: { title: string; desc: string }) => `
            <div class="p-6 rounded-2xl custom-card space-y-3">
              <div class="w-10 h-10 rounded-xl badge-accent flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 class="font-bold text-base text-white font-heading">${escapeHtml(
                pil.title
              )}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed">${escapeHtml(
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
      <!-- Reviews & Social Proof Section -->
      <section id="reviews" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Customer Reviews" class="py-24 px-6 max-w-7xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">VERIFIED CLIENT VOICES</span>
            <h2 class="text-3xl sm:text-5xl font-extrabold mt-2 text-white font-heading">${escapeHtml(
              section.title
            )}</h2>
            <p class="text-sm mt-1 text-zinc-400">${escapeHtml(
              section.subtitle || ''
            )}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-3xl font-extrabold text-white font-heading">${content.averageRating || 4.96}</span>
            <div>
              <div class="text-amber-400 text-sm">★★★★★</div>
              <div class="text-[11px] text-zinc-400">1,840+ Appraisals</div>
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
                  <div class="text-amber-400 text-xs">★★★★★</div>
                  <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Verified Acquisition</span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed italic">"${escapeHtml(
                  rev.text
                )}"</p>
              </div>
              <div class="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <h4 class="font-bold text-white">${escapeHtml(
                    rev.author
                  )}</h4>
                  <p class="text-[11px] text-zinc-500">${escapeHtml(
                    rev.location
                  )}</p>
                </div>
                <span class="text-[10px] text-zinc-500">${escapeHtml(
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
      <!-- Frequently Asked Questions Accordion -->
      <section id="faq" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="FAQ Section" class="py-20 px-6 max-w-4xl mx-auto w-full border-b" style="border-color: var(--border);">
        <div class="text-center mb-12 space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">INQUIRIES & ADVICE</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">${escapeHtml(
            section.title
          )}</h2>
          <p class="text-sm text-zinc-400">${escapeHtml(section.subtitle || '')}</p>
        </div>

        <div class="space-y-3">
          ${faqs
            .map(
              (faq: { q: string; a: string }) => `
            <div class="rounded-xl custom-card overflow-hidden">
              <button onclick="toggleFaq(this)" class="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between hover:bg-white/5 transition cursor-pointer">
                <span>${escapeHtml(faq.q)}</span>
                <span class="faq-icon text-zinc-400 transition-transform duration-200">▼</span>
              </button>
              <div class="hidden p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-white/5">
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
      <!-- WhatsApp VIP Direct Concierge Banner -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="WhatsApp Concierge" class="py-16 px-6 max-w-7xl mx-auto w-full">
        <div class="rounded-3xl p-8 sm:p-12 relative overflow-hidden custom-card flex flex-col md:flex-row items-center justify-between gap-8" style="background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), var(--card-bg));">
          <div class="space-y-3 max-w-xl">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              🟢 Live Representative Online
            </span>
            <h2 class="text-2xl sm:text-4xl font-extrabold text-white font-heading">${escapeHtml(
              section.title
            )}</h2>
            <p class="text-sm text-zinc-300 leading-relaxed">${escapeHtml(
              section.subtitle || ''
            )}</p>
          </div>
          <button onclick="orderViaWhatsApp()" class="btn-accent px-8 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap shadow-2xl flex items-center gap-3 cursor-pointer">
            <span>${escapeHtml(
              content.buttonText || 'Connect with Concierge'
            )}</span>
            <span>→</span>
          </button>
        </div>
      </section>`;

    case 'newsletter':
      return `
      <!-- VIP Newsletter Section -->
      <section id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="VIP Newsletter" class="py-20 px-6 max-w-4xl mx-auto w-full text-center space-y-6">
        <span class="text-xs font-bold uppercase tracking-widest badge-accent px-3 py-1 rounded-full">PRIVATE MEMBERSHIP</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">${escapeHtml(
          section.title
        )}</h2>
        <p class="text-sm text-zinc-400 max-w-md mx-auto">${escapeHtml(
          section.subtitle || ''
        )}</p>
        <form onsubmit="event.preventDefault(); alert('🎉 Thank you for joining the Velvet Haute Private Circle.');" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" required placeholder="${escapeHtml(
            content.placeholder || 'Enter your email'
          )}" class="flex-1 px-4 py-3 rounded-lg custom-card text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400" />
          <button type="submit" class="btn-accent px-6 py-3 text-xs uppercase tracking-wider font-bold cursor-pointer">
            ${escapeHtml(content.buttonText || 'Join')}
          </button>
        </form>
      </section>`;

    case 'footer':
      const cols = content.columns || [];
      return `
      <!-- Storefront Mega Footer -->
      <footer id="${section.id}" data-section-id="${section.id}" data-inspect-target="true" data-inspect-label="Storefront Footer" class="border-t py-16 px-6 max-w-7xl mx-auto w-full" style="border-color: var(--border);">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div class="space-y-4">
            <h3 class="text-xl font-bold font-heading text-white">${escapeHtml(
              section.title || brandName
            )}</h3>
            <p class="text-xs text-zinc-400 leading-relaxed">${escapeHtml(
              section.subtitle || tagline
            )}</p>
          </div>
          ${cols
            .map(
              (c: { title: string; links: string[] }) => `
            <div class="space-y-3">
              <h4 class="font-bold text-xs uppercase tracking-wider text-white">${escapeHtml(
                c.title
              )}</h4>
              <ul class="space-y-2 text-xs text-zinc-400">
                ${c.links
                  .map(
                    (lnk: string) => `
                  <li><a href="#" class="hover:text-white transition">${escapeHtml(
                    lnk
                  )}</a></li>
                `
                  )
                  .join('')}
              </ul>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>${escapeHtml(
            content.copyright ||
              '© 2026 OmniStore Engine. All rights reserved.'
          )}</p>
          <div class="flex items-center gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Apple Pay</span>
            <span>Crypto</span>
          </div>
        </div>
      </footer>`;

    default:
      return '';
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
