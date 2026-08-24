'use client';

import React, { useState, useEffect } from 'react';
import { LoyaltyConfigData, LoyaltyTierData, LoyaltyMemberData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';
import { PlanLockOverlay } from '@/src/components/cms/PlanLockOverlay';
import {
  Crown,
  Gift,
  Coins,
  Sparkles,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Zap,
  Star,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const LoyaltyStudio: React.FC = () => {
  const { isStarter } = usePlanAccess();
  const [config, setConfig] = useState<LoyaltyConfigData>({
    isEnabled: true,
    pointsPerHundredSpent: 1,
    pointRedemptionValueInCurrency: 1.0,
    welcomeBonusPoints: 100,
    reviewBonusPoints: 50,
    minPointsToRedeem: 100,
  });

  const [tiers, setTiers] = useState<LoyaltyTierData[]>([]);
  const [members, setMembers] = useState<LoyaltyMemberData[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 4,
    totalPointsIssued: 2156,
    totalPointsRedeemed: 650,
    rewardsRedemptionRate: '30.1%',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loyaltyData, membersData] = await Promise.all([
        cmsService.getLoyaltyData(),
        cmsService.getLoyaltyMembers(),
      ]);
      setConfig(loyaltyData.config);
      setTiers(loyaltyData.tiers);
      setStats(loyaltyData.stats);
      setMembers(membersData);
    } catch (err) {
      console.error('Failed to load loyalty data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStarter) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsSaving(true);
    try {
      const res = await cmsService.updateLoyaltyConfig(config);
      setConfig(res.config);
      showToast('Loyalty points rules saved successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update loyalty settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-500" />
            <span>Customer Loyalty & VIP Rewards Studio</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reward high-value repeat shoppers with point multipliers, tier progression perks, and instant checkout discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* PLAN RESTRICTION LOCK BANNER */}
      {isStarter && (
        <PlanLockOverlay
          inline
          requiredPlan="GROWTH"
          featureTitle="Customer Loyalty Points & VIP Rewards"
          featureDescription="Rewarding repeat customers with VIP points multipliers, tier badges, and checkout reward discounts requires Growth Pro or Enterprise tier."
        />
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-1">
          <span className="text-[11px] font-black uppercase text-slate-400">Total VIP Members</span>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>{stats.totalMembers}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-1">
          <span className="text-[11px] font-black uppercase text-slate-400">Total Points Issued</span>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>{stats.totalPointsIssued.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-1">
          <span className="text-[11px] font-black uppercase text-slate-400">Points Redeemed</span>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground flex items-center gap-2">
            <Gift className="w-6 h-6 text-emerald-600" />
            <span>{stats.totalPointsRedeemed.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-1">
          <span className="text-[11px] font-black uppercase text-slate-400">Redemption Rate</span>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>{stats.rewardsRedemptionRate}</span>
          </div>
        </div>
      </div>

      {/* 4 VIP TIERS PROGRESSION CARDS */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
          VIP Tiers & Progression Perks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4 relative overflow-hidden"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${t.badgeColor} absolute top-0 left-0`} />

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-accent text-[10px] font-extrabold text-slate-600 dark:text-slate-300 inline-block">
                  Min Spend: {t.minSpend === 0 ? '₹0 (Free Entry)' : `₹${t.minSpend.toLocaleString()}+`}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-foreground">{t.name}</h3>
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {t.multiplier}x Points Earn Multiplier
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-border">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier Perks:</span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {t.perks.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOYALTY RULES & MEMBER BALANCES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Points Configuration Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSaveConfig} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <h3 className="font-black text-base text-slate-900 dark:text-foreground flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Points Earning Rules</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Points per ₹100 Spent:
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.pointsPerHundredSpent}
                  onChange={(e) => setConfig({ ...config, pointsPerHundredSpent: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Example: 1 point per ₹100 spent gives 50 points on a ₹5,000 order.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Customer Welcome Bonus:
                </label>
                <input
                  type="number"
                  value={config.welcomeBonusPoints}
                  onChange={(e) => setConfig({ ...config, welcomeBonusPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verified Review Bonus Points:
                </label>
                <input
                  type="number"
                  value={config.reviewBonusPoints}
                  onChange={(e) => setConfig({ ...config, reviewBonusPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Points to Redeem at Checkout:
                </label>
                <input
                  type="number"
                  value={config.minPointsToRedeem}
                  onChange={(e) => setConfig({ ...config, minPointsToRedeem: parseInt(e.target.value) || 50 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Rules...' : 'Save Loyalty Rules'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: VIP Customer Ledger Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>VIP Members Points Ledger</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-border text-slate-400 font-black uppercase text-[10px]">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">VIP Tier</th>
                    <th className="pb-3">Total Spend</th>
                    <th className="pb-3">Available Points</th>
                    <th className="pb-3">Redeemed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-accent/40">
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 dark:text-foreground block">{m.customerName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{m.email}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-200">
                          {m.tier}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold">₹{m.totalSpent.toLocaleString()}</td>
                      <td className="py-3.5">
                        <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span>{m.pointsBalance} pts</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">{m.pointsRedeemed} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Upgrade Modal Dialog */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-accent text-slate-500 hover:text-slate-900 transition"
            >
              ✕
            </button>
            <PlanLockOverlay
              requiredPlan="GROWTH"
              featureTitle="Customer Loyalty & VIP Rewards Studio"
              featureDescription="Rewarding repeat customers with VIP points multipliers, tier badges, and checkout reward discounts requires Growth Pro or Scale Enterprise tier."
              perks={[
                '4-Tier VIP Rewards Progression (Bronze, Silver, Gold, Platinum)',
                'Points Multipliers (1.25x, 1.5x, 2.0x)',
                'Automated Welcome & Verified Review Bonus Points',
                'Checkout Points Redemption Discounts',
                'Up to 1,000 Products Listing Capacity',
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};
