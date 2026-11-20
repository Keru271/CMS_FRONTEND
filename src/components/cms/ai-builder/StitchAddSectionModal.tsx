'use client';

import React from 'react';
import {
  X,
  Layout,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Star,
  CircleHelp,
  Mail,
  PanelBottom,
  Compass,
  ArrowRight,
  Flame,
} from 'lucide-react';

export interface SectionTemplateDef {
  type: string;
  name: string;
  category: 'Hero' | 'Commerce' | 'Interactive' | 'Content' | 'Proof' | 'Footer';
  description: string;
  icon: any;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultButtonText?: string;
}

export const SECTION_BLOCK_TEMPLATES: SectionTemplateDef[] = [
  {
    type: 'hero',
    name: 'High-Impact Hero Banner',
    category: 'Hero',
    description: 'Headline, dual CTA buttons, trust badges, and bespoke model showcase.',
    icon: Flame,
    defaultTitle: 'High-Fashion Silhouettes. Calibrated by Neural Biometrics.',
    defaultSubtitle: 'Experience touchless LiDAR scanning and bespoke virtual drape before tailoring.',
    defaultButtonText: 'Start 3D Virtual Fitting',
  },
  {
    type: 'catalog',
    name: 'Curated Products Showcase',
    category: 'Commerce',
    description: 'Dynamic product grid with claymorphic cards, prices, and Instant Try-On buttons.',
    icon: ShoppingBag,
    defaultTitle: 'Curated for Your Aura',
    defaultSubtitle: 'Ready for instant virtual fitting and same-day bespoke dispatch.',
    defaultButtonText: 'View All Fits',
  },
  {
    type: 'tryon',
    name: 'Virtual Try-On Interactive Banner',
    category: 'Interactive',
    description: 'Interactive Before/After split comparison slider with live drape mesh.',
    icon: Sparkles,
    defaultTitle: 'Virtual Fitting Room Studio',
    defaultSubtitle: 'Drag the tactile slider to compare raw silhouette vs. neural tailored drape.',
    defaultButtonText: 'Launch Fullscreen Fitting',
  },
  {
    type: 'features',
    name: 'Atelier Value Propositions',
    category: 'Content',
    description: '3-column benefits: 100% On-Device AI, Zero Landfill, Encrypted Vault.',
    icon: ShieldCheck,
    defaultTitle: 'Crafted Without Compromise',
    defaultSubtitle: 'Where biometric precision meets generational couture artistry.',
  },
  {
    type: 'testimonials',
    name: 'Verified Customer Reviews & UGC',
    category: 'Proof',
    description: 'Star ratings, verified buyer quotes, and real fit satisfaction ratings.',
    icon: Star,
    defaultTitle: 'Loved by Discerning Connoisseurs',
    defaultSubtitle: '4.9 / 5 rating across 2,400+ bespoke fittings worldwide.',
  },
  {
    type: 'faq',
    name: 'Biometric & Order FAQ',
    category: 'Content',
    description: 'Accordion answers addressing camera privacy, sizing guarantee, and returns.',
    icon: CircleHelp,
    defaultTitle: 'Frequently Asked Questions',
    defaultSubtitle: 'Everything you need to know about neural fitting and luxury delivery.',
  },
  {
    type: 'newsletter',
    name: 'VIP Private Atelier Access',
    category: 'Content',
    description: 'Email capture for exclusive seasonal drops and private runway access.',
    icon: Mail,
    defaultTitle: 'Unlock Private Atelier Invitations',
    defaultSubtitle: 'Receive early biometric drop allocations and archival previews.',
    defaultButtonText: 'Request Access',
  },
  {
    type: 'footer',
    name: 'Global Storefront Footer',
    category: 'Footer',
    description: 'Multi-column navigation, legal links, currency switcher, and payment badges.',
    icon: PanelBottom,
    defaultTitle: 'AURAFIT Worldwide',
    defaultSubtitle: 'Milan â€¢ Paris â€¢ Tokyo â€¢ New York',
  },
];

interface StitchAddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (template: SectionTemplateDef) => void;
}

export function StitchAddSectionModal({
  isOpen,
  onClose,
  onAddSection,
}: StitchAddSectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Website Section Block
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a modular eCommerce section block to insert into your website page
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 no-scrollbar">
          {SECTION_BLOCK_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;

            return (
              <div
                key={tmpl.type}
                onClick={() => {
                  onAddSection(tmpl);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition group cursor-pointer flex flex-col justify-between gap-3 text-left shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-emerald-600">
                      {tmpl.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {tmpl.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Insert Block</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

