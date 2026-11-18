export interface StorefrontTemplateConfig {
  slug: string;
  name: string;
  tagline: string;
  brandName: string;
  category: string;
  primaryColor: string;
  accentColor: string;
  canvasBg: string;
  cardBg: string;
  creamBg: string;
  textColor: string;
  textMuted: string;
  fontFamily: string;
  badge: string;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: string;
    floatingBadge: string;
    trustBadges: string[];
  };
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    price: string;
    tag: string;
    rating: number;
    img: string;
    description: string;
    colorDots?: string[];
    category?: string;
  }>;
  pdp: {
    featuredProduct: string;
    price: string;
    rating: string;
    images: string[];
    variantType: string;
    variants: string[];
    description: string;
    specs: Array<{ label: string; value: string }>;
    sizes?: string[];
    colors?: Array<{ name: string; hex: string }>;
  };
  story: {
    badge: string;
    title: string;
    description: string;
    pillars: Array<{ title: string; desc: string; iconType: string }>;
    image: string;
  };
  reviews: {
    summary: string;
    trustScore: string;
    items: Array<{ name: string; rating: number; title: string; text: string; location: string }>;
  };
  newsletter?: {
    headline: string;
    subtitle: string;
  };
}

export const STOREFRONT_TEMPLATES: Record<string, StorefrontTemplateConfig> = {
  'nova-tech': {
    slug: 'nova-tech',
    name: 'Nova Tech & Minimal',
    tagline: 'High-tech, sleek contrast electronics & cyber acoustics',
    brandName: 'NOVA TECH',
    category: 'Consumer Electronics & Gadgets',
    primaryColor: '#2563EB',
    accentColor: '#38BDF8',
    canvasBg: '#F1F5F9',
    cardBg: '#FFFFFF',
    creamBg: '#E2E8F0',
    textColor: '#0F172A',
    textMuted: '#64748B',
    fontFamily: 'Inter, sans-serif',
    badge: 'Bestseller',
    hero: {
      badge: 'Next-Gen Drop • Quantum Audio 2026',
      title: 'Quantum Acoustic Fidelity. Engineered for Pure Precision.',
      subtitle:
        'Experience beryllium planar-magnetic drivers, ultra-low 12ms latency, and aerospace carbon composite architecture.',
      ctaPrimary: 'Shop Cyber Audio Drop',
      ctaSecondary: 'Pre-Order ANC-X Pro',
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      floatingBadge: 'ANC: 48dB Active Isolation',
      trustBadges: ['Ultra-Low 12ms Latency', '48-Hour Continuous Play', 'Hi-Res Lossless Certified'],
    },
    categories: ['Quantum Audio', 'Mechanical Keyboards', 'Cyber Watches', 'Creator Displays'],
    products: [
      {
        id: 'p-nova-1',
        name: 'Nova ANC-X Wireless Headphones',
        price: '$299.00',
        tag: 'Planar Magnetic',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        description: 'Beryllium drivers with active 48dB environmental noise cancelling.',
      },
      {
        id: 'p-nova-2',
        name: 'CyberWatch Ultra Titanium',
        price: '$399.00',
        tag: 'AMOLED 120Hz',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        description: 'Grade-5 titanium chassis with sapphire crystal and biometric sensors.',
      },
      {
        id: 'p-nova-3',
        name: 'Apex Mechanical RGB Board',
        price: '$189.00',
        tag: 'Hot-Swap Gasket',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
        description: 'CNC aluminum body with lubricated linear switches and south-facing LEDs.',
      },
      {
        id: 'p-nova-4',
        name: 'Spatial Earbuds Pro',
        price: '$149.00',
        tag: 'Dual Drivers',
        rating: 4.7,
        img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        description: 'Multipoint Bluetooth 5.4 with head-tracking spatial audio.',
      },
    ],
    pdp: {
      featuredProduct: 'Nova ANC-X Wireless Headphones',
      price: '$299.00',
      rating: '4.9 ★ (1,420 Audiophile Reviews)',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&auto=format&fit=crop&q=80',
      ],
      variantType: 'Finish & Colorway',
      variants: ['Matte Obsidian', 'Cyber Titanium', 'Cobalt Blue'],
      description:
        'Engineered for recording engineers, gamers, and audiophiles. Features customized 40mm beryllium diaphragm drivers.',
      specs: [
        { label: 'Driver Size', value: '40mm Planar Beryllium' },
        { label: 'Frequency Range', value: '5Hz - 45,000Hz' },
        { label: 'Battery Life', value: '48 Hours (ANC On)' },
        { label: 'Connectivity', value: 'Bluetooth 5.4 + USB-C DAC' },
      ],
    },
    story: {
      badge: 'Acoustic Engineering Lab',
      title: 'Sound Refined by Computational Precision',
      description:
        'Every Nova component is designed in our Zurich acoustics studio with zero compromises in component tolerances or harmonic clarity.',
      pillars: [
        {
          title: 'Precision Calibration',
          desc: 'Individual DSP audio tuning curves stored directly inside headphone flash memory.',
          iconType: 'cpu',
        },
        {
          title: 'Zero Latency Codec',
          desc: 'Custom 2.4GHz ultra-low latency protocol for flawless video & audio synchronization.',
          iconType: 'zap',
        },
        {
          title: 'Carbon-Neutral Hardware',
          desc: '100% recycled aerospace aluminum and ocean-bound plastic packaging.',
          iconType: 'shield',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80',
    },
    reviews: {
      summary: 'Trusted by 45,000+ creators and professional studios worldwide',
      trustScore: '4.9 / 5.0 (3,800+ Verified Buyers)',
      items: [
        {
          name: 'Marcus Vance',
          rating: 5,
          title: 'Unbelievable spatial separation',
          text: 'The soundstage on the ANC-X rivals open-back planar headphones twice the price. The sub-bass is crisp and punchy.',
          location: 'Berlin, DE',
        },
        {
          name: 'Elena Rostova',
          rating: 5,
          title: 'My daily studio driver',
          text: 'Comfortable enough to wear for 10-hour mixing sessions. Battery lasts for days on a single 20-minute fast charge.',
          location: 'Austin, TX',
        },
      ],
    },
  },

  funo: {
    slug: 'funo',
    name: 'Funo / Funie Studio',
    tagline: 'Minimalist Scandinavian furniture & interior studio',
    brandName: 'FUNIE STUDIO',
    category: 'Furniture & Interior Design',
    primaryColor: '#EA580C',
    accentColor: '#F97316',
    canvasBg: '#FAF8F5',
    cardBg: '#FFFFFF',
    creamBg: '#F3EFEA',
    textColor: '#1C1917',
    textMuted: '#78716C',
    fontFamily: 'Outfit, sans-serif',
    badge: 'Trending',
    hero: {
      badge: 'Copenhagen 2026 Collection',
      title: 'Warm Organic Living. Crafted for Mindful Sanctuaries.',
      subtitle:
        'Solid European white oak dining pieces, sculpted ceramic luminaires, and modular Belgian linen seating.',
      ctaPrimary: 'Explore Living Collection',
      ctaSecondary: 'Book Interior Consult',
      image:
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      floatingBadge: 'FSC Solid White Oak',
      trustBadges: ['FSC Solid Certified Timber', 'White-Glove Home Placement', '10-Year Frame Warranty'],
    },
    categories: ['Living Room', 'Ceramic Lighting', 'Dining Atelier', 'Linen Seating'],
    products: [
      {
        id: 'p-funo-1',
        name: 'Klint Sculpted Lounge Chair',
        price: '$580.00',
        tag: 'Solid White Oak',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80',
        description: 'Curved steam-bent oak frame with premium bouclé or saddle leather seat.',
      },
      {
        id: 'p-funo-2',
        name: 'Funie Wheel-Thrown Table Lamp',
        price: '$240.00',
        tag: 'Speckled Ceramic',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
        description: 'Warm ambient glow with tactile ribbed stoneware body and linen shade.',
      },
      {
        id: 'p-funo-3',
        name: 'Nordic Lowline Coffee Table',
        price: '$490.00',
        tag: 'Smoked Walnut',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=600&auto=format&fit=crop&q=80',
        description: 'Clean architectural silhouette with integrated magazine shelf.',
      },
      {
        id: 'p-funo-4',
        name: 'Hygge Modular Linen Sofa',
        price: '$1,850.00',
        tag: 'Belgian Linen',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=80',
        description: 'Deep modular seating filled with feather-down blend for lasting softness.',
      },
    ],
    pdp: {
      featuredProduct: 'Klint Sculpted Lounge Chair',
      price: '$580.00',
      rating: '4.9 ★ (820 Interior Designer Reviews)',
      images: [
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580481077195-c22f6d2f9547?w=700&auto=format&fit=crop&q=80',
      ],
      variantType: 'Wood Finish & Upholstery',
      variants: ['Natural Oak / Cream Bouclé', 'Smoked Walnut / Charcoal', 'Bleached Ash / Linen'],
      description:
        'Designed to anchor modern architectural spaces with gentle organic curves and generational woodworking.',
      specs: [
        { label: 'Dimensions', value: 'W: 78cm × D: 84cm × H: 72cm' },
        { label: 'Seat Height', value: '41cm' },
        { label: 'Wood Origin', value: 'Sustainably Harvested French Oak' },
        { label: 'Assembly', value: 'Delivered fully assembled' },
      ],
    },
    story: {
      badge: 'Copenhagen Craftsmanship',
      title: 'Heirloom Furniture for Generations of Gathering',
      description:
        'We believe home is a sanctuary. Every Funie piece honors natural timber grain, honest materials, and serene geometry.',
      pillars: [
        {
          title: 'Traditional Joinery',
          desc: 'Mortise and tenon wood joinery crafted to withstand decades of daily family life.',
          iconType: 'leaf',
        },
        {
          title: 'Zero Waste Timber',
          desc: '100% of timber offcuts are reclaimed into our home decor and kitchen accessories.',
          iconType: 'shield',
        },
        {
          title: 'White-Glove Placement',
          desc: 'Two-person delivery team unpacks, places, and removes all packaging at your door.',
          iconType: 'truck',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&auto=format&fit=crop&q=80',
    },
    reviews: {
      summary: 'Featured in Architectural Digest, Dwell, and Elle Decor',
      trustScore: '4.95 / 5.0 (1,240+ Customer Proofs)',
      items: [
        {
          name: 'Astrid Lindqvist',
          rating: 5,
          title: 'The centerpiece of our living room',
          text: 'The Klint chair is not just furniture; it is sculpture. The oak grain is gorgeous and the bouclé fabric is so soft.',
          location: 'Stockholm, SE',
        },
      ],
    },
  },

  'velvet-luxury': {
    slug: 'velvet-luxury',
    name: 'Velvet Haute Couture',
    tagline: 'High-fashion editorial apparel & bespoke runway silhouettes',
    brandName: 'VELVET COUTURE',
    category: 'Luxury Fashion & Couture',
    primaryColor: '#831843',
    accentColor: '#EC4899',
    canvasBg: '#FAF5F7',
    cardBg: '#FFFFFF',
    creamBg: '#F3E8EE',
    textColor: '#1E1B4B',
    textMuted: '#6B7280',
    fontFamily: 'Playfair Display, serif',
    badge: 'Luxury',
    hero: {
      badge: 'Autumn/Winter 2026 Haute Runway',
      title: 'Sculpted Silhouettes. Bespoke Parisian Tailoring.',
      subtitle:
        'Hand-draped mulberry silk gowns, double-faced cashmere overcoats, and artisanal structured blazers.',
      ctaPrimary: 'View Runway Collection',
      ctaSecondary: 'Book Private Atelier',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
      floatingBadge: '100% Mulberry Silk',
      trustBadges: ['Bespoke Fit Guarantee', 'Hand-Crafted in Paris', 'Private Client Concierge'],
    },
    categories: ['Evening Gowns', 'Tailored Overcoats', 'Silk Suits', 'Archival Accessories'],
    products: [
      {
        id: 'p-velvet-1',
        name: 'The Draped Mulberry Silk Gown',
        price: '$1,400.00',
        tag: 'Couture Drop',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
        description: 'Floor-length bias-cut silk with fluid architectural back drape.',
      },
      {
        id: 'p-velvet-2',
        name: 'Sculpted Obsidian Wool Trench',
        price: '$890.00',
        tag: 'Double-Faced Wool',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
        description: 'Razor-sharp lapels with belted waist and bespoke horn buttons.',
      },
      {
        id: 'p-velvet-3',
        name: 'Pure Cashmere Cocoon Coat',
        price: '$950.00',
        tag: '100% Cashmere',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
        description: 'Unstructured featherweight warmth in rich camel tones.',
      },
      {
        id: 'p-velvet-4',
        name: 'The Obsidian Evening Clutch',
        price: '$620.00',
        tag: 'Calfskin Leather',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
        description: 'Polished gold hardware with detachable curb chain.',
      },
    ],
    pdp: {
      featuredProduct: 'The Draped Mulberry Silk Gown',
      price: '$1,400.00',
      rating: '5.0 ★ (420 Client Ratings)',
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&auto=format&fit=crop&q=80',
      ],
      variantType: 'Couture Size',
      variants: ['FR 34 (US 2)', 'FR 36 (US 4)', 'FR 38 (US 6)', 'FR 40 (US 8)', 'Custom Biometric Fit'],
      description: 'An iconic silhouette celebrating fluid movement and refined elegance for gala occasions.',
      specs: [
        { label: 'Fabric Composition', value: '100% Grade 6A Mulberry Silk' },
        { label: 'Lining', value: 'Silk Habotai' },
        { label: 'Care', value: 'Specialist Dry Clean Only' },
        { label: 'Origin', value: 'Handmade in Paris, France' },
      ],
    },
    story: {
      badge: 'Atelier Heritage',
      title: 'The Art of Generational Parisian Couture',
      description:
        'Founded with the vision to blend archival couture techniques with modern sustainable garment architecture.',
      pillars: [
        {
          title: 'Hand-Finished Seams',
          desc: 'French seam construction with hand-rolled silk hems inspected under high magnification.',
          iconType: 'sparkles',
        },
        {
          title: 'Zero Overproduction',
          desc: 'Every piece is crafted in limited numbered runs to eradicate luxury fashion waste.',
          iconType: 'leaf',
        },
        {
          title: 'Private Client Concierge',
          desc: 'Direct access to your dedicated atelier stylist for alterations and private previews.',
          iconType: 'shield',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    },
    reviews: {
      summary: 'Dressed for the Met Gala, Cannes, and private client soirees',
      trustScore: '4.98 / 5.0 (650+ Verified Patrons)',
      items: [
        {
          name: 'Camille Dubois',
          rating: 5,
          title: 'Pure perfection in draping',
          text: 'The silk moves like liquid light. The bespoke fitting team ensured the length was tailored to my exact stiletto height.',
          location: 'Paris, FR',
        },
      ],
    },
  },

  'artisan-craft': {
    slug: 'artisan-craft',
    name: 'Artisan Craft & Studio',
    tagline: 'Warm organic pottery, single-origin coffee & apothecary',
    brandName: 'ARTISAN ATELIER',
    category: 'Handcrafted Goods & Homewares',
    primaryColor: '#92400E',
    accentColor: '#D97706',
    canvasBg: '#FDFBF7',
    cardBg: '#FFFFFF',
    creamBg: '#F5EFE6',
    textColor: '#292524',
    textMuted: '#78716C',
    fontFamily: 'Playfair Display, serif',
    badge: 'Handmade',
    hero: {
      badge: 'Studio Batch No. 42',
      title: 'Wheel-Thrown Stoneware. Grounded in Daily Ritual.',
      subtitle:
        'Tactile speckled ceramics, small-batch single-origin coffees, and handwoven natural botanical textiles.',
      ctaPrimary: 'Shop Studio Batch',
      ctaSecondary: 'Read Potter Story',
      image:
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
      floatingBadge: 'Kiln Fired at 1280°C',
      trustBadges: ['Non-Toxic Food Safe Glazes', 'Dishwasher & Oven Proof', 'Plastic-Free Eco Packaging'],
    },
    categories: ['Stoneware Mugs', 'Pour-Over Sets', 'Serving Bowls', 'Studio Apothecary'],
    products: [
      {
        id: 'p-artisan-1',
        name: 'Wheel-Thrown Stoneware Mug',
        price: '$38.00',
        tag: 'Raw Sand Glaze',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        description: 'Tactile thumb rest with speckled clay body and unglazed exposed foot.',
      },
      {
        id: 'p-artisan-2',
        name: 'Artisan Ceramic Pour-Over',
        price: '$64.00',
        tag: 'Slow Drip',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
        description: 'Spiral internal extraction ridges for nuanced clarity in every morning cup.',
      },
      {
        id: 'p-artisan-3',
        name: 'Handwoven Jute Basket Set',
        price: '$78.00',
        tag: 'Natural Fibers',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&auto=format&fit=crop&q=80',
        description: 'Handcrafted by artisan weaving collectives using unbleached river jute.',
      },
      {
        id: 'p-artisan-4',
        name: 'Rustic Stoneware Pasta Bowl',
        price: '$45.00',
        tag: 'Forest Sage Glaze',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
        description: 'Wide shallow rim made for rustic sourdough pastas and hearty salads.',
      },
    ],
    pdp: {
      featuredProduct: 'Wheel-Thrown Stoneware Mug',
      price: '$38.00',
      rating: '4.9 ★ (2,100+ Studio Reviews)',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700&auto=format&fit=crop&q=80',
      ],
      variantType: 'Artisan Glaze',
      variants: ['Raw Sand / Speckled', 'Forest Sage', 'Midnight Iron', 'Smoked Terracotta'],
      description: 'Wheel-thrown by hand in Tuscany. Holds 380ml of coffee or herbal infusion.',
      specs: [
        { label: 'Capacity', value: '380ml (12.8 oz)' },
        { label: 'Firing', value: 'Cone 10 Reduction Fired' },
        { label: 'Safety', value: '100% Lead & Cadmium Free' },
        { label: 'Care', value: 'Microwave & Dishwasher Safe' },
      ],
    },
    story: {
      badge: 'Potter Manifesto',
      title: 'Honoring the Earth through Functional Art',
      description:
        'In a world of mass plastic disposability, we craft heavy stoneware meant to be passed down through generations.',
      pillars: [
        {
          title: 'Wild Native Clay',
          desc: 'Locally mined stoneware clay enriched with mineral feldspar and quartz.',
          iconType: 'leaf',
        },
        {
          title: 'Small Batch Kiln Runs',
          desc: 'Fired over 48 hours using high-efficiency electric kilns powered by solar arrays.',
          iconType: 'zap',
        },
        {
          title: 'Direct Artisan Trade',
          desc: '100% of profits support living wages for independent ceramicists and weavers.',
          iconType: 'shield',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
    },
    reviews: {
      summary: 'Loved by home coffee baristas and ceramic collectors',
      trustScore: '4.96 / 5.0 (2,800+ Happy Kitchens)',
      items: [
        {
          name: 'Liam Gallagher',
          rating: 5,
          title: 'The best mug I have ever owned',
          text: 'The weight in the hand is perfect. The raw clay bottom feels grounding every single morning.',
          location: 'Edinburgh, UK',
        },
      ],
    },
  },

  'pulse-streetwear': {
    slug: 'pulse-streetwear',
    name: 'Pulse Urban Streetwear',
    tagline: 'High-energy streetwear drops, oversized silhouettes & sneakers',
    brandName: 'PULSE STREETWEAR',
    category: 'Streetwear & Sneakers',
    primaryColor: '#7C3AED',
    accentColor: '#A78BFA',
    canvasBg: '#0F1017',
    cardBg: '#1A1C29',
    creamBg: '#25293A',
    textColor: '#F8FAFC',
    textMuted: '#94A3B8',
    fontFamily: 'Outfit, sans-serif',
    badge: 'Drop Live',
    hero: {
      badge: 'DROP 08: "METROPOLIS" • SELLS OUT IN 03h 40m',
      title: 'Heavyweight Boxy Fits. Built for the Underground.',
      subtitle:
        '500gsm French Terry hoodies, acid-wash cargo pants, and limited-run chunky runner footwear drops.',
      ctaPrimary: 'Cop The Drop Now',
      ctaSecondary: 'View Lookbook',
      image:
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
      floatingBadge: 'Only 48 Pieces Per City',
      trustBadges: ['500gsm French Terry', 'Worldwide Express Tracked', '100% Authentic Guaranteed'],
    },
    categories: ['Oversized Hoodies', 'Cargo Pant Drops', 'Sneaker Footwear', 'Cyber Headwear'],
    products: [
      {
        id: 'p-pulse-1',
        name: 'Metropolis 500gsm Boxy Hoodie',
        price: '$120.00',
        tag: 'Acid Wash',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
        description: 'Drop-shoulder boxy cut with embroidered distressed chest typography.',
      },
      {
        id: 'p-pulse-2',
        name: 'Cyber Kinetic Cargo Pants',
        price: '$145.00',
        tag: 'Water-Resistant',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80',
        description: 'Heavy ripstop cotton with magnetic buckle pockets and ankle cinches.',
      },
      {
        id: 'p-pulse-3',
        name: 'Vortex Chunky Runner Sneakers',
        price: '$190.00',
        tag: 'Vibram Sole',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
        description: 'Sculpted EVA foam midsole with technical breathable mesh upper.',
      },
      {
        id: 'p-pulse-4',
        name: 'Reflective Tactical Crossbody',
        price: '$55.00',
        tag: 'Cordura 1000D',
        rating: 4.7,
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        description: 'Weatherproof crossbody with reflective 3M accents and Fidlock magnetic clasp.',
      },
    ],
    pdp: {
      featuredProduct: 'Metropolis 500gsm Boxy Hoodie',
      price: '$120.00',
      rating: '4.9 ★ (3,150 Hypebeast Reviews)',
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=700&auto=format&fit=crop&q=80',
      ],
      variantType: 'Size & Silhouette',
      variants: ['S (Boxy)', 'M (Oversized)', 'L (Heavy Drape)', 'XL (Ultra Loose)'],
      description: 'Custom milled 500gsm loopback cotton French Terry. Preshrunk with stone enzyme wash.',
      specs: [
        { label: 'Weight', value: '500 GSM Ultra-Heavyweight' },
        { label: 'Fit', value: 'Boxy Drop Shoulder' },
        { label: 'Origin', value: 'Milled in Portugal' },
        { label: 'Details', value: 'Custom High-Density 3D Print' },
      ],
    },
    story: {
      badge: 'Streetwear Culture',
      title: 'Disrupting Mainstream Fast Fashion with Limited Drops',
      description:
        'Pulse is built for those who live after dark. We release numbered batches with zero restocks.',
      pillars: [
        {
          title: 'No Restocks Ever',
          desc: 'When a drop sells out, it enters the vault forever to protect exclusivity.',
          iconType: 'zap',
        },
        {
          title: 'Custom Milled Textiles',
          desc: 'Zero blanks. Every garment is cut-and-sewn from custom weight textiles.',
          iconType: 'shield',
        },
        {
          title: 'Global Community Drops',
          desc: 'Secret pop-up drops in Tokyo, London, New York, and Seoul.',
          iconType: 'sparkles',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    },
    reviews: {
      summary: 'Ranked Top 5 Independent Streetwear Labels 2026',
      trustScore: '4.92 / 5.0 (4,200+ Verified Buyers)',
      items: [
        {
          name: 'Kenji Takahashi',
          rating: 5,
          title: 'Insane quality on the 500gsm cotton',
          text: 'The hood stands up stiff like it should. Heavyweight feel without being stifling. Best hoodie in my closet.',
          location: 'Tokyo, JP',
        },
      ],
    },
  },

  'botanica-wellness': {
    slug: 'botanica-wellness',
    name: 'Botanica Pure Skincare',
    tagline: 'Clean pastel cosmetics, plant ceramides & holistic wellness',
    brandName: 'BOTANICA LABS',
    category: 'Skincare & Holistic Cosmetics',
    primaryColor: '#059669',
    accentColor: '#34D399',
    canvasBg: '#F3F9F5',
    cardBg: '#FFFFFF',
    creamBg: '#E4F2E8',
    textColor: '#064E3B',
    textMuted: '#047857',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    badge: 'Organic',
    hero: {
      badge: '100% Certified Organic Actives',
      title: 'Botanical Cellular Science for Radiant Skin Barrier.',
      subtitle:
        'Cold-pressed seed oils, adaptogenic mushroom ceramides, and fermented probiotics for your healthiest skin glow.',
      ctaPrimary: 'Take Skin Routine Quiz',
      ctaSecondary: 'Shop All Elixirs',
      image:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
      floatingBadge: '98.4% Clinically Proven',
      trustBadges: ['Cruelty-Free Leaping Bunny', 'Dermatologist Tested', '100% Recyclable Glass Jars'],
    },
    categories: ['Barrier Serums', 'Hydration Creams', 'Gentle Cleansers', 'Night Elixirs'],
    products: [
      {
        id: 'p-bot-1',
        name: 'Phyto-Ceramide Barrier Elixir',
        price: '$68.00',
        tag: 'Skin Barrier',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        description: 'Triple peptide complex with cold-pressed rosehip seed and squalane.',
      },
      {
        id: 'p-bot-2',
        name: 'Tremella Mushroom Dew Cream',
        price: '$54.00',
        tag: 'Deep Hydration',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
        description: 'Holds 500x its weight in moisture for bouncy, plump dewy skin.',
      },
      {
        id: 'p-bot-3',
        name: 'Gentle Calming Centella Wash',
        price: '$36.00',
        tag: 'pH 5.5 Balanced',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
        description: 'Sulfate-free milky cleanser with cica extract to soothe redness.',
      },
      {
        id: 'p-bot-4',
        name: 'Bakuchiol Retinol-Alternative Oil',
        price: '$72.00',
        tag: 'Gentle Anti-Aging',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1608248597359-00994f387532?w=600&auto=format&fit=crop&q=80',
        description: 'Smoothes fine lines without irritation, peeling, or sun sensitivity.',
      },
    ],
    pdp: {
      featuredProduct: 'Phyto-Ceramide Barrier Elixir',
      price: '$68.00',
      rating: '4.9 ★ (1,840 Verified Reviews)',
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=700&auto=format&fit=crop&q=80',
      ],
      variantType: 'Size',
      variants: ['30ml Travel', '50ml Full Size (Best Value)', '100ml Jumbo Eco-Refill'],
      description: 'Formulated with 5 essential plant ceramides to repair stressed, dehydrated skin barriers.',
      specs: [
        { label: 'Key Actives', value: 'Ceramides NP/AP, Squalane, Rosehip' },
        { label: 'Skin Type', value: 'Dry, Sensitive, Compromised Barrier' },
        { label: 'Free Of', value: 'Fragrance, Essential Oils, Parabens' },
        { label: 'Clinical Efficacy', value: '96% saw improved hydration in 24 hours' },
      ],
    },
    story: {
      badge: 'Botanical Laboratories',
      title: 'Clean Science Formulated Without Fillers',
      description:
        'We harness nature’s most resilient botanicals to strengthen your skin barrier naturally.',
      pillars: [
        {
          title: 'Cold-Pressed Potency',
          desc: 'Unheated seed extraction preserves raw vitamins, antioxidants, and fatty acids.',
          iconType: 'leaf',
        },
        {
          title: 'Eco-Refill Program',
          desc: 'Save 20% on every order with recyclable aluminum and glass refill pods.',
          iconType: 'shield',
        },
        {
          title: 'Dermatologist Formulated',
          desc: 'Every batch undergoes rigorous clinical patch testing for hyper-sensitive skin.',
          iconType: 'sparkles',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80',
    },
    reviews: {
      summary: 'Voted Best Clean Barrier Serum 2026 by Allure & Vogue Beauty',
      trustScore: '4.94 / 5.0 (3,200+ Glowing Reviews)',
      items: [
        {
          name: 'Sarah Jenkins',
          rating: 5,
          title: 'Repaired my damaged skin barrier in 3 days',
          text: 'After over-exfoliating, my skin was stinging and red. This elixir instantly soothed the irritation. My skin feels like silk.',
          location: 'Toronto, CA',
        },
      ],
    },
  },
  'northvale': {
    slug: 'northvale',
    name: 'Northvale Technical Outdoor',
    tagline: 'Built for the quiet distance. Field-tested alpine apparel & equipment.',
    brandName: 'NORTHVALE',
    category: 'Outdoor Apparel & Equipment',
    primaryColor: '#C05621',
    accentColor: '#1B1C1F',
    canvasBg: '#F8F7F4',
    cardBg: '#FFFFFF',
    creamBg: '#EFECE6',
    textColor: '#111215',
    textMuted: '#686E77',
    fontFamily: 'Inter, sans-serif',
    badge: 'Field-Tested',
    hero: {
      badge: 'Field Notes • Edition 04 Drops',
      title: 'Built for the quiet distance.',
      subtitle:
        'Technical outdoor apparel and equipment designed for hikers, climbers, and the long trail ahead. Field-tested in the Northern Dolomites.',
      ctaPrimary: 'Explore Gear',
      ctaSecondary: 'Read Journal',
      image:
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1000&auto=format&fit=crop&q=80',
      floatingBadge: 'Tested across 200km Alta Via',
      trustBadges: ['Sub-300g Ultralight Shells', 'Zero Synthetic PFCs', 'Lifetime Repair Program'],
    },
    categories: ['Outerwear', 'Footwear', 'Tops', 'Bottoms', 'Packs', 'Accessories'],
    products: [
      {
        id: 'p-nv-1',
        name: 'Traverse Trail Shoe',
        price: '$245.00',
        category: 'Footwear',
        tag: 'Vibram Megagrip',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=700&auto=format&fit=crop&q=80',
        description: 'Low-profile alpine approach shoe built for wet granite, loose scree, and technical scrambles.',
        colorDots: ['#4E5D4E', '#1B1C1F', '#C05621'],
      },
      {
        id: 'p-nv-2',
        name: 'Trail Runner Lite',
        price: '$199.00',
        category: 'Footwear',
        tag: '260g Ultralight Fast-Hike',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80',
        description: 'Fast, breathable, honest — for long trail days when weight matters. Engineered mesh upper with rubber outsole and cushioned EVA midsole.',
        colorDots: ['#C05621', '#D5CEBF'],
      },
      {
        id: 'p-nv-3',
        name: 'Hiking Boot',
        price: '$289.00',
        category: 'Footwear',
        tag: 'Waterproof Ankle Support',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=700&auto=format&fit=crop&q=80',
        description: 'Mid-cut stormproof ankle boot for multi-day heavy pack transits and rugged mountain passes.',
        colorDots: ['#2D3238', '#D5CEBF'],
      },
      {
        id: 'p-nv-4',
        name: 'Women Traverse Trail Shoe',
        price: '$245.00',
        category: 'Footwear',
        tag: 'Women Fit Precision',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&auto=format&fit=crop&q=80',
        description: 'Alpine approach shoe tuned with narrower heel cup and high-rebound cushioning.',
        colorDots: ['#3B4E5B', '#C05621', '#D5CEBF'],
      },
      {
        id: 'p-nv-5',
        name: 'Lightweight Shell',
        price: '$389.00',
        category: 'Outerwear',
        tag: '3-Layer Stormproof',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=700&auto=format&fit=crop&q=80',
        description: 'Ultralight waterproof 28,000mm hydrostatic shell with fully taped micro-seams.',
        colorDots: ['#1B1C1F', '#555B53'],
      },
      {
        id: 'p-nv-6',
        name: 'Insulated Jacket',
        price: '$329.00',
        category: 'Outerwear',
        tag: '850 Fill-Power Down',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80',
        description: 'Hydrophobic goose down baffle jacket designed for sub-zero alpine bivouacs.',
        colorDots: ['#4B5340', '#1B1C1F'],
      },
      {
        id: 'p-nv-7',
        name: 'Basecamp Fleece 200',
        price: '$159.00',
        category: 'Tops',
        tag: 'Polartec Thermal Grid',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=700&auto=format&fit=crop&q=80',
        description: 'Breathable high-loft fleece jacket designed for chilly alpine belays and camp evenings.',
        colorDots: ['#4B5340', '#C05621'],
      },
      {
        id: 'p-nv-8',
        name: 'Technical Tee',
        price: '$69.00',
        category: 'Tops',
        tag: 'Merino Wool Blend',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80',
        description: 'Naturally odor-resistant merino blend with flatlock friction-free trail seams.',
        colorDots: ['#4B5D6E', '#1B1C1F'],
      },
      {
        id: 'p-nv-9',
        name: 'Base Layer',
        price: '$89.00',
        category: 'Tops',
        tag: 'Thermal Regulation',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=700&auto=format&fit=crop&q=80',
        description: 'Next-to-skin active base layer with ribbed thermal zones and thumb loops.',
        colorDots: ['#C05621', '#2D3238'],
      },
      {
        id: 'p-nv-10',
        name: 'Alpine Softshell Pant',
        price: '$220.00',
        category: 'Bottoms',
        tag: '4-Way Stretch Schoeller',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&auto=format&fit=crop&q=80',
        description: 'Abrasion-resistant granite climbing pant with articulated knees and boot lace hook.',
        colorDots: ['#2D3238', '#4B5340'],
      },
      {
        id: 'p-nv-11',
        name: 'Hiking Short',
        price: '$110.00',
        category: 'Bottoms',
        tag: 'Quick-Dry Ripstop',
        rating: 4.7,
        img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=700&auto=format&fit=crop&q=80',
        description: '7-inch inseam technical trail short with integrated webbing belt and zipper security pockets.',
        colorDots: ['#43525E', '#2D3238'],
      },
      {
        id: 'p-nv-12',
        name: 'Summit 32L Pack',
        price: '$289.00',
        category: 'Packs',
        tag: 'Cordura 500D Ripstop',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80',
        description: 'Streamlined mountain pack with roll-top closure, ice axe loops, and hydration routing.',
        colorDots: ['#1B1C1F', '#C05621', '#D5CEBF'],
      },
      {
        id: 'p-nv-13',
        name: 'Travel Pack',
        price: '$259.00',
        category: 'Packs',
        tag: 'Weatherproof Transit',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=700&auto=format&fit=crop&q=80',
        description: 'Dedicated laptop cradle, clamshell opening, and stowable shoulder harness for expeditions.',
        colorDots: ['#3F5060', '#1B1C1F'],
      },
      {
        id: 'p-nv-14',
        name: 'Field Cap & Beanie',
        price: '$45.00',
        category: 'Accessories',
        tag: 'Waxed Cotton & Wool',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=700&auto=format&fit=crop&q=80',
        description: 'Weatherproof waxed trail cap paired with rib-knit merino warmth beanie.',
        colorDots: ['#4E5D4E', '#C05621', '#1B1C1F'],
      },
      {
        id: 'p-nv-15',
        name: 'Vacuum Bottle',
        price: '$39.00',
        category: 'Accessories',
        tag: 'Double-Wall Insulated',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop&q=80',
        description: '18/8 stainless steel keeps cold drinks frozen for 24h and hot camp drinks warm for 12h.',
        colorDots: ['#1B1C1F', '#D5CEBF'],
      },
      {
        id: 'p-nv-16',
        name: 'Women Alpine Shell',
        price: '$389.00',
        category: 'Outerwear',
        tag: 'Alpine Cut Stormproof',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&auto=format&fit=crop&q=80',
        description: 'High-performance mountain storm shell with helmet-compatible hood and pit zips.',
        colorDots: ['#4E6478', '#C05621'],
      },
      {
        id: 'p-nv-17',
        name: 'Women Basecamp Fleece 200',
        price: '$159.00',
        category: 'Tops',
        tag: 'Thermal Loft',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&auto=format&fit=crop&q=80',
        description: 'Warm, breathable grid fleece tailored with feminine raglan sleeves for ease of layering.',
        colorDots: ['#C05621', '#1B1C1F'],
      },
      {
        id: 'p-nv-18',
        name: 'Women Alpine Softshell Pant',
        price: '$220.00',
        category: 'Bottoms',
        tag: 'Gusseted Agility',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&auto=format&fit=crop&q=80',
        description: 'Technical mountain pant built with deep harness-compatible pockets and reinforced cuffs.',
        colorDots: ['#3E4E42', '#1B1C1F'],
      },
    ],
    pdp: {
      featuredProduct: 'Trail Runner Lite',
      price: '$199.00',
      rating: '4.9 ★ (840 Field-Tested Reviews)',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
      ],
      variantType: 'Color & US Size',
      variants: ['Clay (Terracotta / Sand)', 'Alpine Obsidian (Charcoal)', 'Forest Moss (Olive)'],
      sizes: ['7', '8', '9', '10', '11', '12'],
      colors: [
        { name: 'Clay', hex: '#C05621' },
        { name: 'Sand', hex: '#D5CEBF' },
      ],
      description:
        'Fast, breathable, honest — for long trail days when weight matters. Engineered mesh upper with rubber outsole and cushioned EVA midsole.',
      specs: [
        { label: 'Weight', value: "260g / Men's size 9" },
        { label: 'Heel-to-Toe Drop', value: '4mm low-profile agility drop' },
        { label: 'Upper', value: 'Engineered breathable matrix mesh' },
        { label: 'Outsole', value: 'High-traction multidirectional rubber lugs' },
        { label: 'Midsole', value: 'Dual-density cushioned EVA with rock shield' },
        { label: 'Warranty', value: 'Lifetime Northvale repair commitment' },
      ],
    },
    story: {
      badge: 'Alpine Field Atelier',
      title: 'Designed in the Alpine, Tested on the Ground',
      description:
        'Outdoor essentials for hikers, weekend campers, and the long trail ahead. No loud neon logos — just quiet, enduring utility built for the mountain.',
      pillars: [
        {
          title: 'Zero PFC Water-Repellency',
          desc: '100% fluorocarbon-free plant-based DWR coatings that protect against downpours without toxic environmental persistence.',
          iconType: 'leaf',
        },
        {
          title: 'Sub-300g Ultralight Discipline',
          desc: 'Every seam, buckle, and fiber is weighed. Shedding ounces so you can move faster and farther in complete comfort.',
          iconType: 'shield',
        },
        {
          title: 'Lifetime Repair Guarantee',
          desc: 'Torn on granite or worn through after years on the trail? Send it back. We repair and restore your gear for free.',
          iconType: 'sparkles',
        },
      ],
      image:
        'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=900&auto=format&fit=crop&q=80',
    },
    reviews: {
      summary: 'Voted Best Fast-Hiking Footwear & Technical Shells 2026 by Outside & Alpinist',
      trustScore: '4.96 / 5.0 (2,410+ Trail-Tested Reviews)',
      items: [
        {
          name: 'Liam Henderson',
          rating: 5,
          title: 'Survived 7 days traversing the Wind River Range',
          text: 'The Trail Runner Lite carried me through 90 miles of wet granite and river crossings. Zero blisters, insane grip on steep slab.',
          location: 'Boulder, CO',
        },
        {
          name: 'Elena Rostova',
          rating: 5,
          title: 'Best alpine shell in 15 years of mountain guiding',
          text: 'Totally stormproof in high-altitude sleet yet genuinely breathable on steep ascents. Minimalist perfection without shouting logos.',
          location: 'Innsbruck, Austria',
        },
        {
          name: 'Marcus Vance',
          rating: 5,
          title: 'Quiet design, tank-like durability',
          text: 'No neon graphics. Just honest, rugged materials and laser-cut construction that weighs next to nothing.',
          location: 'Vancouver, BC',
        },
      ],
    },
    newsletter: {
      headline: 'New releases and quiet drops — no noise, once a month.',
      subtitle: 'Field Notes direct to your inbox with zero spam.',
    },
  },
};

export function getTemplateConfig(slug?: string): StorefrontTemplateConfig {
  if (!slug) return STOREFRONT_TEMPLATES['nova-tech'];
  const normalized = slug.toLowerCase().trim();
  const alias = SLUG_ALIASES[normalized] || normalized;
  return STOREFRONT_TEMPLATES[alias] || STOREFRONT_TEMPLATES['nova-tech'];
}

export const SLUG_ALIASES: Record<string, string> = {
  techno: 'nova-tech',
  pawzy: 'botanica-wellness',
  aura: 'velvet-luxury',
  aurafit: 'velvet-luxury',
  northvale: 'northvale',
  'northvale-outdoor': 'northvale',
  outdoor: 'northvale',
  alpine: 'northvale',
  trail: 'northvale',
  hiking: 'northvale',
};

export const STOREFRONT_TEMPLATES_LIST = Object.values(STOREFRONT_TEMPLATES);

export function getScreensForTemplate(
  template: StorefrontTemplateConfig,
  defaultViewport: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): Array<{
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  path: string;
  type: 'welcome' | 'catalog' | 'questionnaire' | 'checkout' | 'privacy' | 'aura' | 'tryon' | 'scanner';
  viewport: 'desktop' | 'tablet' | 'mobile';
}> {
  return [
    {
      id: `sc-1-${template.slug}`,
      number: 1,
      slug: 'welcome',
      title: 'Home Storefront',
      path: '/',
      subtitle: `${template.brandName} • ${template.tagline}`,
      type: 'welcome',
      viewport: defaultViewport,
    },
    {
      id: `sc-2-${template.slug}`,
      number: 2,
      slug: 'catalog',
      title: 'Products Catalog',
      path: '/products',
      subtitle: `Curated ${template.category} collection with instant filter & checkout.`,
      type: 'catalog',
      viewport: defaultViewport,
    },
    {
      id: `sc-3-${template.slug}`,
      number: 3,
      slug: 'pdp',
      title: 'Product Details (PDP)',
      path: '/products/featured',
      subtitle: `${template.pdp.featuredProduct} • Multi-angle showcase & variant select.`,
      type: 'questionnaire',
      viewport: defaultViewport,
    },
    {
      id: `sc-4-${template.slug}`,
      number: 4,
      slug: 'checkout',
      title: 'Cart & Express Checkout',
      path: '/checkout',
      subtitle: `One-click Apple Pay, Google Pay, and biometric checkout for ${template.name}.`,
      type: 'checkout',
      viewport: defaultViewport,
    },
    {
      id: `sc-5-${template.slug}`,
      number: 5,
      slug: 'story',
      title: 'Brand Story & Atelier',
      path: '/story',
      subtitle: `${template.story.badge} • ${template.story.title}`,
      type: 'privacy',
      viewport: defaultViewport,
    },
    {
      id: `sc-6-${template.slug}`,
      number: 6,
      slug: 'reviews',
      title: 'Customer Reviews & Social Proof',
      path: '/reviews',
      subtitle: `${template.reviews.trustScore} • ${template.reviews.summary}`,
      type: 'aura',
      viewport: defaultViewport,
    },
    {
      id: `sc-7-${template.slug}`,
      number: 7,
      slug: 'experience',
      title: 'Interactive 3D / Lookbook',
      path: '/experience',
      subtitle: 'Tactile Before/After interactive slider & material fidelity.',
      type: 'tryon',
      viewport: defaultViewport,
    },
    {
      id: `sc-8-${template.slug}`,
      number: 8,
      slug: 'order-confirmed',
      title: 'Order Confirmed & Live Tracking',
      path: '/order/confirmed',
      subtitle: 'Real-time courier dispatch status and digital receipt.',
      type: 'scanner',
      viewport: defaultViewport,
    },
  ];
}
