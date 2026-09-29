'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Wand2,
  Layers,
  LayoutTemplate,
  Palette,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Zap,
  ShoppingBag,
  HelpCircle,
  Users,
  Clock,
  DollarSign,
  Star,
  Eye,
  Check,
  Sliders,
  ChevronRight,
  Flame,
  FileText,
  Copy,
  AlertCircle,
  Lock,
  Plus,
  BarChart3,
  AlignLeft,
  Video,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { GenerateBlockPayload, GeneratedAiBlockResult } from '@/src/types';

interface AiBlockGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBlock: (block: any, position: 'bottom' | 'top' | 'after_selected') => void;
  selectedBlockId?: string | null;
}

const BLOCK_TYPE_PRESETS = [
  { id: 'auto', label: '✨ Auto-Detect from Prompt', desc: 'AI chooses the ideal block type based on your prompt keywords', icon: Wand2 },
  { id: 'hero', label: 'Hero & Impact Banner', desc: 'High-impact title, badge, background & dual CTA buttons', icon: Rocket },
  { id: 'testimonials', label: 'Customer Reviews & Social Proof', desc: 'Verified customer quotes, star ratings & avatars', icon: Star },
  { id: 'pricing_table', label: 'Pricing Table & Tier Cards', desc: 'Feature comparison matrices & subscription packages', icon: DollarSign },
  { id: 'countdown_timer', label: 'Flash Sale & Countdown Timer', desc: 'Urgency countdown bar with instant discount CTA', icon: Zap },
  { id: 'faq', label: 'FAQ & Accordion Hub', desc: 'Frequently asked questions with collapsible answers', icon: HelpCircle },
  { id: 'trust_badges', label: 'Trust Badges & Guarantees', desc: 'Security, shipping, return and warranty badges', icon: ShieldCheck },
  { id: 'value_props', label: 'Value Propositions & Features', desc: '3-pillar product benefits with custom icon accents', icon: Sparkles },
  { id: 'announcement_bar', label: 'Announcement Bar / Top Ticker', desc: 'Sticky top notification with coupon code & CTA', icon: Flame },
  { id: 'cta_banner', label: 'VIP Community & Newsletter CTA', desc: 'High-conversion banner to capture leads or orders', icon: Users },
  { id: 'stats', label: 'Statistics & Proof Metrics', desc: '4-stat numeric showcase highlighting key achievements', icon: BarChart3 },
  { id: 'heading', label: 'Heading Tag (H1-H6)', desc: 'Semantic heading with eyebrow label & subtitle', icon: LayoutTemplate },
  { id: 'paragraph', label: 'Narrative Story & Paragraph', desc: 'Body typography with responsive column container', icon: AlignLeft },
  { id: 'video', label: 'Video Showcase & Demo', desc: 'Embedded responsive video player with custom poster', icon: Video },
];

const PROMPT_SUGGESTIONS = [
  { label: '🔥 Flash Sale Countdown', prompt: 'Midnight flash sale countdown banner offering 30% off with coupon FLASH30 for limited time' },
  { label: '⭐ Customer Testimonials', prompt: '3 customer review cards with 5-star ratings and authentic feedback about product durability' },
  { label: '💎 3-Tier Pricing', prompt: '3-tier pricing table for Essential, Pro, and Enterprise memberships with Pro featured as best value' },
  { label: '🛡️ Trust & Security Badges', prompt: '4 trust badges with SSL security, free 2-day dispatch, 30-day money-back guarantee, and 24/7 support' },
  { label: '❓ Shipping & Return FAQ', prompt: 'FAQ accordion answering questions on global shipping times, return policies, and materials' },
  { label: '🚀 Impact Hero Banner', prompt: 'Modern minimalist hero section with headline "Elevate Everyday Living", badge, and 2 buttons' },
];

const TONE_OPTIONS = [
  { id: 'high_conversion', label: 'High Conversion', desc: 'Punchy, actionable, urgency-driven' },
  { id: 'luxury', label: 'Luxury & Minimal', desc: 'Understated, sophisticated, premium' },
  { id: 'friendly', label: 'Warm & Friendly', desc: 'Approachable, enthusiastic, trustworthy' },
  { id: 'urgency', label: 'Hype & Urgency', desc: 'Limited drops, countdowns, fear of missing out' },
  { id: 'technical', label: 'Technical & Clear', desc: 'Spec-focused, precise, authoritative' },
];

export const AiBlockGeneratorModal: React.FC<AiBlockGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyBlock,
  selectedBlockId,
}) => {
  const [prompt, setPrompt] = useState('');
  const [blockType, setBlockType] = useState('auto');
  const [tone, setTone] = useState('high_conversion');
  const [targetAudience, setTargetAudience] = useState('Discerning buyers & shoppers');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedAiBlockResult | null>(null);
  const [insertPosition, setInsertPosition] = useState<'bottom' | 'top' | 'after_selected'>('bottom');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check current user role & privileges
  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || localStorage.getItem('cms_user') || '{}')
    : null;
  const isOwnerOrAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN' || !currentUser?.role;
  const userPermissions = currentUser?.permissions || currentUser?.storeMemberships?.[0];
  const hasAiPrivilege = isOwnerOrAdmin || userPermissions?.canManageAiPageBuilder !== false;

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter a description or prompt for the block.');
      return;
    }

    if (!hasAiPrivilege) {
      setErrorMessage("Your role lacks the 'canManageAiPageBuilder' privilege to generate AI blocks.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedResult(null);

    try {
      const payload: GenerateBlockPayload = {
        prompt: prompt.trim(),
        blockType,
        tone,
        targetAudience,
      };

      const result = await cmsService.generateBlockWithAi(payload);
      setGeneratedResult(result);
    } catch (err: any) {
      console.error('Failed to generate AI block:', err);
      setErrorMessage(err.message || 'Failed to synthesize AI block. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult?.block) return;
    onApplyBlock(generatedResult.block, insertPosition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg">AI Block Generator</h3>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-pink-300 text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
                  Page Builder AI
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Describe any section or element and AI will craft the layout, styling, and copy in seconds.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privilege Warning Banner if restricted */}
        {!hasAiPrivilege && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <strong>Privilege Notice:</strong> Your current staff role does not have the{' '}
              <code className="px-1 py-0.5 rounded bg-amber-500/20 font-mono text-[11px]">canManageAiPageBuilder</code>{' '}
              privilege. Contact your Store Administrator to enable AI Page & Block generation access.
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Prompt Section */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>What block do you want to build?</span>
              <span className="text-[10px] font-normal lowercase text-slate-400">Be descriptive for best results</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a high-urgency flash sale banner with countdown timer, 30% discount badge, and 'Shop Sale' button in obsidian dark styling..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed placeholder:text-slate-500"
            />

            {/* Suggestions Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Prompt Starters:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setPrompt(item.prompt);
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Block Type & Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Block Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
                <span>Target Block Type</span>
              </label>
              <select
                value={blockType}
                onChange={(e) => setBlockType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:border-indigo-500"
              >
                {BLOCK_TYPE_PRESETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                {BLOCK_TYPE_PRESETS.find((t) => t.id === blockType)?.desc}
              </p>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Copywriting Voice & Tone</span>
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:border-indigo-500"
              >
                {TONE_OPTIONS.map((tn) => (
                  <option key={tn.id} value={tn.id}>
                    {tn.label} ({tn.desc})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Tailors headlines, value propositions, and CTA button language.
              </p>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-500" />
              <span>Target Audience / Customer Profile</span>
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Modern urban professionals, Gen Z fashion shoppers, athletes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generated Result Preview Box */}
          {generatedResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-900/50 border border-indigo-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Block Synthesized Successfully
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase">
                  {generatedResult.blockType}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{generatedResult.explanation}"
              </p>

              {/* Data Summary */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-indigo-300 space-y-1">
                <div>
                  <span className="text-slate-500">Block ID:</span> {generatedResult.block.id}
                </div>
                {generatedResult.block.data?.title && (
                  <div>
                    <span className="text-slate-500">Headline:</span> "{generatedResult.block.data.title}"
                  </div>
                )}
                {generatedResult.block.data?.heading && (
                  <div>
                    <span className="text-slate-500">Heading:</span> "{generatedResult.block.data.heading}"
                  </div>
                )}
                {generatedResult.block.data?.badge && (
                  <div>
                    <span className="text-slate-500">Badge:</span> "{generatedResult.block.data.badge}"
                  </div>
                )}
                {generatedResult.block.data?.items && (
                  <div>
                    <span className="text-slate-500">Items Count:</span> {generatedResult.block.data.items.length} cards
                  </div>
                )}
                {generatedResult.block.data?.plans && (
                  <div>
                    <span className="text-slate-500">Pricing Tiers:</span> {generatedResult.block.data.plans.length} tiers
                  </div>
                )}
              </div>

              {/* Placement Options */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Canvas Insertion Placement:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInsertPosition('bottom')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      insertPosition === 'bottom'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    At Bottom
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertPosition('top')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      insertPosition === 'top'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    At Top
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertPosition('after_selected')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      insertPosition === 'after_selected'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    After Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {generatedResult ? (
              <>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Block into Canvas</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !hasAiPrivilege}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Block...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>✨ Generate Block with AI</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
