'use client';

import React, { useState, useEffect } from 'react';
import { CMSMarketingCampaign, CMSPixelConfig, AbandonedCartData, MarketingChannel } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Megaphone,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  ShoppingCart,
  Tag,
  Ticket,
  TrendingUp,
  Target,
  BarChart2,
  Copy,
  Check,
  Plus,
  Send,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Share2,
  Zap,
  DollarSign,
  Users,
  ShieldCheck,
  ExternalLink,
  Percent,
} from 'lucide-react';

export const MarketingStudio: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CMSMarketingCampaign[]>([]);
  const [pixelConfig, setPixelConfig] = useState<CMSPixelConfig>({});
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'ABANDONED_CART' | 'PIXELS' | 'UTM'>('CAMPAIGNS');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Campaign Modal
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState<{
    title: string;
    channel: MarketingChannel;
    targetSegment: string;
    subject: string;
    body: string;
  }>({
    title: '',
    channel: 'EMAIL',
    targetSegment: 'All Subscribers',
    subject: '',
    body: '',
  });

  // UTM Builder State
  const [utmUrl, setUtmUrl] = useState('https://omnistore.com/products/headphones');
  const [utmSource, setUtmSource] = useState('google');
  const [utmMedium, setUtmMedium] = useState('cpc');
  const [utmCampaign, setUtmCampaign] = useState('summer_sale_2026');
  const [utmTerm, setUtmTerm] = useState('wireless_headphones');
  const [utmContent, setUtmContent] = useState('banner_ad_top');
  const [copiedUtm, setCopiedUtm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campData, pixData, cartData] = await Promise.all([
        cmsService.getMarketingCampaigns(),
        cmsService.getPixelConfig(),
        cmsService.getAbandonedCarts(),
      ]);
      setCampaigns(campData);
      setPixelConfig(pixData);
      setAbandonedCarts(cartData);
    } catch (err) {
      console.error('Failed to load marketing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // CAMPAIGN CREATION
  const handleOpenCreateCampaign = (channel: MarketingChannel = 'EMAIL') => {
    setCampaignForm({
      title: '',
      channel,
      targetSegment: 'All Customers',
      subject: channel === 'EMAIL' ? '🔥 Special Offer Just for You!' : 'New Update',
      body: 'Explore our latest collections and enjoy exclusive discounts on your order today!',
    });
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const created = await cmsService.createMarketingCampaign({
        title: campaignForm.title,
        channel: campaignForm.channel,
        targetSegment: campaignForm.targetSegment,
        subject: campaignForm.subject,
        body: campaignForm.body,
        status: 'SENT',
      });

      showToast(`Marketing broadcast "${created.title}" sent successfully!`, 'success');
      setIsCampaignModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to send broadcast.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      setIsSaving(true);
      await cmsService.deleteMarketingCampaign(id);
      showToast('Campaign deleted.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete campaign.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // CART RECOVERY
  const handleSendRecovery = async (id: string) => {
    try {
      setIsSaving(true);
      const updated = await cmsService.sendCartRecoveryEmail(id);
      showToast(`Cart recovery email sent to ${updated.customerEmail}!`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to send recovery email.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // PIXELS UPDATE
  const handleSavePixels = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await cmsService.updatePixelConfig(pixelConfig);
      showToast('Tracking pixels configuration updated!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update pixels.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // UTM GENERATOR COMPUTED
  const generatedUtmUrl = `${utmUrl}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}${utmTerm ? `&utm_term=${encodeURIComponent(utmTerm)}` : ''}${utmContent ? `&utm_content=${encodeURIComponent(utmContent)}` : ''}`;

  const handleCopyUtm = () => {
    navigator.clipboard.writeText(generatedUtmUrl);
    setCopiedUtm(true);
    setTimeout(() => setCopiedUtm(false), 3000);
    showToast('UTM Tracking URL copied to clipboard!', 'success');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Marketing & Growth Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Multi-Channel Growth Suite
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                ${campaigns.reduce((acc, c) => acc + c.revenueTotal, 0).toFixed(2)} Campaign Revenue
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-indigo-400" />
              <span>Marketing & Growth Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Execute Email, SMS, WhatsApp Business, & Web Push broadcasts, recover lost abandoned cart revenue, build UTM tracking links, and configure Google Analytics & Meta Pixels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateCampaign('EMAIL')}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign Broadcast</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Campaign Reach</span>
            <span className="text-2xl font-black text-slate-900 dark:text-foreground block">
              {campaigns.reduce((acc, c) => acc + c.sentCount, 0).toLocaleString()}
            </span>
          </div>
          <Users className="w-8 h-8 text-indigo-600" />
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Clicks & Engagement</span>
            <span className="text-2xl font-black text-indigo-600 block">
              {campaigns.reduce((acc, c) => acc + c.clickCount, 0).toLocaleString()}
            </span>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-500" />
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Conversion Orders</span>
            <span className="text-2xl font-black text-emerald-600 block">
              {campaigns.reduce((acc, c) => acc + c.conversionCount, 0)} Orders
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Cart Recovery Revenue</span>
            <span className="text-2xl font-black text-amber-500 block">$620.00</span>
          </div>
          <ShoppingCart className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* 8 SUB-NAVIGATION TABS */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'CAMPAIGNS', label: 'All Campaigns', icon: Megaphone },
            { id: 'EMAIL', label: 'Email Marketing', icon: Mail },
            { id: 'SMS', label: 'SMS Broadcasts', icon: MessageSquare },
            { id: 'WHATSAPP', label: 'WhatsApp Business', icon: MessageCircle },
            { id: 'PUSH', label: 'Push Notifications', icon: Bell },
            { id: 'ABANDONED_CART', label: 'Abandoned Carts', icon: ShoppingCart },
            { id: 'PIXELS', label: 'Pixels & GA4', icon: Target },
            { id: 'UTM', label: 'UTM URL Builder', icon: Share2 },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconC = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <IconC className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. CAMPAIGNS / EMAIL / SMS / WHATSAPP / PUSH TABS */}
      {['CAMPAIGNS', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH'].includes(activeTab) && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 dark:text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              <span>Marketing Campaign Broadcasts</span>
            </h3>

            <button
              type="button"
              onClick={() => handleOpenCreateCampaign(activeTab === 'CAMPAIGNS' ? 'EMAIL' : (activeTab as any))}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New {activeTab === 'CAMPAIGNS' ? 'Broadcast' : activeTab}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-accent border-b border-slate-200/80 dark:border-border text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-6">Campaign Title</th>
                  <th className="py-4 px-6">Channel</th>
                  <th className="py-4 px-6">Target Audience</th>
                  <th className="py-4 px-6">Sent Reach</th>
                  <th className="py-4 px-6">Clicks & CTR</th>
                  <th className="py-4 px-6">Revenue ($)</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border font-medium text-slate-800 dark:text-slate-200">
                {campaigns
                  .filter((c) => (activeTab === 'CAMPAIGNS' ? true : c.channel === activeTab))
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-accent/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-foreground">{c.title}</div>
                        <div className="text-[11px] text-slate-400 italic">{c.subject}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-accent font-black text-[10px] uppercase text-indigo-600 dark:text-indigo-400">
                          {c.channel}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold">{c.targetSegment}</td>
                      <td className="py-4 px-6 font-bold">{c.sentCount.toLocaleString()} Sent</td>
                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900 dark:text-foreground">{c.clickCount} Clicks</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {((c.clickCount / (c.sentCount || 1)) * 100).toFixed(1)}% CTR
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-sm text-emerald-600">
                        ${c.revenueTotal.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(c.id)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-accent text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ABANDONED CART RECOVERY TAB */}
      {activeTab === 'ABANDONED_CART' && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-black text-base text-slate-900 dark:text-foreground flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <span>Abandoned Checkout Recovery Engine</span>
              </h3>
              <p className="text-xs text-slate-500">Automatically recover lost revenue by dispatching 1-click cart recovery emails with promo vouchers.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-accent border-b border-slate-200/80 dark:border-border text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items Count</th>
                  <th className="py-4 px-6">Cart Subtotal</th>
                  <th className="py-4 px-6">Abandoned Time</th>
                  <th className="py-4 px-6">Recovery Voucher</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border font-medium text-slate-800 dark:text-slate-200">
                {abandonedCarts.map((ac) => (
                  <tr key={ac.id} className="hover:bg-slate-50/80 dark:hover:bg-accent/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900 dark:text-foreground">{ac.customerName}</div>
                      <div className="text-[11px] font-mono text-indigo-600">{ac.customerEmail}</div>
                    </td>
                    <td className="py-4 px-6 font-bold">{ac.itemsCount} Items</td>
                    <td className="py-4 px-6 font-black text-sm text-slate-900 dark:text-foreground">
                      ${ac.cartSubtotal.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">{ac.abandonedAt}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 font-mono font-black text-[10px] text-amber-800">
                        {ac.recoveryDiscountCode || 'RECOVER10'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {ac.status === 'EMAIL_SENT' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-extrabold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recovery Email Sent</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendRecovery(ac.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Recovery Email</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TRACKING PIXELS & GA4 TAB */}
      {activeTab === 'PIXELS' && (
        <form onSubmit={handleSavePixels} className="p-6 rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-6">
          <div className="space-y-1 border-b pb-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span>Tracking Pixels & Analytics Integration</span>
            </h3>
            <p className="text-xs text-slate-500">Inject Google Analytics 4 Measurement ID, Meta Facebook Pixel, TikTok Pixel, and Pinterest Tags automatically into storefront headers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GA4 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-foreground">Google Analytics 4 (GA4)</span>
                <button
                  type="button"
                  onClick={() => setPixelConfig({ ...pixelConfig, isGa4Active: !pixelConfig.isGa4Active })}
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    pixelConfig.isGa4Active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {pixelConfig.isGa4Active ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <input
                type="text"
                value={pixelConfig.ga4MeasurementId || ''}
                onChange={(e) => setPixelConfig({ ...pixelConfig, ga4MeasurementId: e.target.value })}
                placeholder="e.g. G-X987654321"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-mono font-bold text-indigo-600"
              />
            </div>

            {/* Meta Pixel */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-foreground">Meta Pixel (Facebook & Instagram)</span>
                <button
                  type="button"
                  onClick={() => setPixelConfig({ ...pixelConfig, isMetaActive: !pixelConfig.isMetaActive })}
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    pixelConfig.isMetaActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {pixelConfig.isMetaActive ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <input
                type="text"
                value={pixelConfig.metaPixelId || ''}
                onChange={(e) => setPixelConfig({ ...pixelConfig, metaPixelId: e.target.value })}
                placeholder="e.g. 123456789012345"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-mono font-bold text-indigo-600"
              />
            </div>

            {/* TikTok Pixel */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-foreground">TikTok Ads Pixel</span>
                <button
                  type="button"
                  onClick={() => setPixelConfig({ ...pixelConfig, isTikTokActive: !pixelConfig.isTikTokActive })}
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    pixelConfig.isTikTokActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {pixelConfig.isTikTokActive ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <input
                type="text"
                value={pixelConfig.tikTokPixelId || ''}
                onChange={(e) => setPixelConfig({ ...pixelConfig, tikTokPixelId: e.target.value })}
                placeholder="e.g. C1234567890123456789"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-mono font-bold text-indigo-600"
              />
            </div>

            {/* Pinterest Tag */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-foreground">Pinterest Tag</span>
                <button
                  type="button"
                  onClick={() => setPixelConfig({ ...pixelConfig, isPinterestActive: !pixelConfig.isPinterestActive })}
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    pixelConfig.isPinterestActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {pixelConfig.isPinterestActive ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <input
                type="text"
                value={pixelConfig.pinterestTagId || ''}
                onChange={(e) => setPixelConfig({ ...pixelConfig, pinterestTagId: e.target.value })}
                placeholder="e.g. 2612345678901"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-mono font-bold text-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Pixel Configurations</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. UTM BUILDER TAB */}
      {activeTab === 'UTM' && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-6">
          <div className="space-y-1 border-b pb-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-foreground flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600" />
              <span>UTM Campaign Link Builder</span>
            </h3>
            <p className="text-xs text-slate-500">Generate tracking URLs for paid Google Search, Meta Ads, Newsletter blasts, & Social influencers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">Target Storefront Page URL *</label>
              <input
                type="url"
                value={utmUrl}
                onChange={(e) => setUtmUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">UTM Source (utm_source) *</label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="google, facebook, newsletter"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">UTM Medium (utm_medium) *</label>
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="cpc, banner, email"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">UTM Campaign (utm_campaign) *</label>
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="summer_sale_2026"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">UTM Term (utm_term)</label>
              <input
                type="text"
                value={utmTerm}
                onChange={(e) => setUtmTerm(e.target.value)}
                placeholder="wireless_headphones"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
              />
            </div>
          </div>

          {/* GENERATED RESULT BOX */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">Generated Campaign Tracking URL</span>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 break-all">
              {generatedUtmUrl}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCopyUtm}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5"
              >
                {copiedUtm ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUtm ? 'Copied!' : 'Copy Tracking Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN BROADCAST MODAL */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Create Campaign Broadcast</h3>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Broadcast Title *</label>
                <input
                  type="text"
                  required
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  placeholder="e.g. Summer Mega Sale Blast"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Channel</label>
                  <select
                    value={campaignForm.channel}
                    onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value as MarketingChannel })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="EMAIL">EMAIL</option>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WHATSAPP</option>
                    <option value="PUSH">WEB PUSH</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Target Audience</label>
                  <select
                    value={campaignForm.targetSegment}
                    onChange={(e) => setCampaignForm({ ...campaignForm, targetSegment: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="VIP High Spenders">VIP Customers</option>
                    <option value="Cart Abandoners">Cart Abandoners</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Subject / Header</label>
                <input
                  type="text"
                  required
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Message Body</span>
                  {campaignForm.channel === 'SMS' && (
                    <span className="text-[10px] font-mono text-indigo-600">{campaignForm.body.length}/160 chars</span>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  value={campaignForm.body}
                  onChange={(e) => setCampaignForm({ ...campaignForm, body: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
