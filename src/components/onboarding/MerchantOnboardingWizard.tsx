'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, LogOut, FastForward } from 'lucide-react';
import { StoreDetailsStep } from './StoreDetailsStep';
import { TemplateSelectionStep } from './TemplateSelectionStep';
import { FirstProductStep } from './FirstProductStep';
import {
  MerchantUser,
  StoreDetails,
  StoreTemplate,
  ProductFormData,
  MerchantOnboardingData,
} from '@/src/types';
import { cmsService, STORE_TEMPLATES } from '@/src/services/cmsService';

interface MerchantOnboardingWizardProps {
  merchant: MerchantUser;
  onComplete: (data: MerchantOnboardingData) => void;
  onLogout: () => void;
}

export const MerchantOnboardingWizard: React.FC<MerchantOnboardingWizardProps> = ({
  merchant,
  onComplete,
  onLogout,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isFinishing, setIsFinishing] = useState(false);

  const [storeDetails, setStoreDetails] = useState<StoreDetails>({
    storeName: `${merchant.firstName}'s Official Store`,
    tagline: 'Premium handcrafted items & modern catalog',
    category: 'Tech & Electronics',
    currency: 'USD',
    supportEmail: merchant.email,
    supportPhone: merchant.mobileNumber,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplate>(STORE_TEMPLATES[0]);
  const [firstProduct, setFirstProduct] = useState<ProductFormData | undefined>(undefined);

  const handleStoreDetailsSubmit = (details: StoreDetails) => {
    setStoreDetails(details);
    setStep(2);
  };

  const handleTemplateSelect = (tmpl: StoreTemplate) => {
    setSelectedTemplate(tmpl);
    setStep(3);
  };

  const handleFirstProductSubmit = async (productData: ProductFormData) => {
    setFirstProduct(productData);
    setIsFinishing(true);

    const onboardingPayload: MerchantOnboardingData = {
      merchant,
      store: storeDetails,
      selectedTemplate,
      firstProduct: productData,
    };

    try {
      await cmsService.completeOnboarding(onboardingPayload);
      onComplete(onboardingPayload);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSkip = async () => {
    setIsFinishing(true);
    const skipData: MerchantOnboardingData = {
      merchant,
      store: storeDetails,
      selectedTemplate,
    };

    try {
      await cmsService.completeOnboarding(skipData);
      onComplete(skipData);
    } catch {
      cmsService.saveMerchantSession(skipData);
      onComplete(skipData);
    } finally {
      setIsFinishing(false);
    }
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="min-h-screen w-full bg-[#f6f8f7] dark:bg-background flex items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-sage-primary selection:text-white">
      {/* Main Split-Screen Container */}
      <div className="w-full max-w-6xl bg-white dark:bg-card border border-sage-border rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[680px]">
        {/* Left Sidebar: Hero Showcase & Real-Time Live Store Preview */}
        <div className="w-full lg:w-2/5 bg-gradient-to-br from-[#fafcfb] via-[#f1f7f4] to-[#e6f2eb] dark:from-muted/30 dark:to-muted/10 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-sage-border relative overflow-hidden">
          {/* Ambient Decorative Blur Orbs */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-sage-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header Identity */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-primary animate-pulse" />
                <span className="text-xs font-black tracking-wider uppercase text-sage-text">
                  Merchant Setup Studio
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-card border border-sage-border text-[10px] font-bold text-sage-primary">
                Step {step} of 3
              </span>
            </div>

            {/* REAL-TIME LIVE STORE CARD PREVIEW */}
            <div className="p-5 rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-md border border-sage-border shadow-lg space-y-4 transition-all duration-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-sage-muted block">
                    Real-time Storefront Preview
                  </span>
                  <h3 className="text-base font-extrabold text-sage-text leading-tight mt-0.5">
                    {storeDetails.storeName || 'Your Storefront Name'}
                  </h3>
                </div>
                <div
                  className="w-4 h-4 rounded-full shadow-xs shrink-0 mt-1"
                  style={{ backgroundColor: selectedTemplate.accentColor }}
                />
              </div>

              <p className="text-xs text-sage-muted italic line-clamp-2">
                "{storeDetails.tagline || 'Elevating everyday shopping experience'}"
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-sage-accent text-sage-primary font-extrabold text-[10px] border border-sage-border">
                  {storeDetails.category}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  {storeDetails.currency} Currency
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                  Theme: {selectedTemplate.name}
                </span>
              </div>

              {/* Product Preview Thumbnail if on Step 3 */}
              {step === 3 && firstProduct && (
                <div className="pt-3 border-t border-sage-border flex items-center gap-3">
                  <img
                    src={firstProduct.image}
                    alt={firstProduct.name}
                    className="w-12 h-12 rounded-xl object-cover border border-sage-border shrink-0"
                  />
                  <div className="flex-1 truncate">
                    <span className="text-[10px] font-bold text-sage-muted uppercase block">
                      Catalog Flagship
                    </span>
                    <span className="text-xs font-bold text-sage-text truncate block">
                      {firstProduct.name}
                    </span>
                    <span className="text-xs font-extrabold text-sage-primary">
                      ${firstProduct.price}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Timeline List */}
          <div className="relative z-10 py-6 space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sage-muted">
              Onboarding Roadmap
            </div>

            <div className="space-y-3">
              {/* Step 1 Roadmap Item */}
              <div
                onClick={() => setStep(1)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  step === 1
                    ? 'bg-white dark:bg-card border-sage-primary shadow-sm'
                    : step > 1
                    ? 'bg-white/60 dark:bg-card/50 border-sage-border/80'
                    : 'bg-transparent border-transparent opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    step === 1
                      ? 'bg-sage-primary text-white'
                      : step > 1
                      ? 'bg-sage-primary/80 text-white'
                      : 'bg-sage-border text-sage-muted'
                  }`}
                >
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-sage-text">Store Identity</div>
                  <div className="text-[10px] text-sage-muted">Name, Tagline, Industry & Currency</div>
                </div>
              </div>

              {/* Step 2 Roadmap Item */}
              <div
                onClick={() => {
                  if (step > 1) setStep(2);
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  step > 1 ? 'cursor-pointer' : 'cursor-default'
                } ${
                  step === 2
                    ? 'bg-white dark:bg-card border-sage-primary shadow-sm'
                    : step > 2
                    ? 'bg-white/60 dark:bg-card/50 border-sage-border/80'
                    : 'bg-transparent border-transparent opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    step === 2
                      ? 'bg-sage-primary text-white'
                      : step > 2
                      ? 'bg-sage-primary/80 text-white'
                      : 'bg-sage-border text-sage-muted'
                  }`}
                >
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-sage-text">Storefront Theme</div>
                  <div className="text-[10px] text-sage-muted">Layout specs, color palette & badges</div>
                </div>
              </div>

              {/* Step 3 Roadmap Item */}
              <div
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  step === 3
                    ? 'bg-white dark:bg-card border-sage-primary shadow-sm'
                    : 'bg-transparent border-transparent opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    step === 3 ? 'bg-sage-primary text-white' : 'bg-sage-border text-sage-muted'
                  }`}
                >
                  3
                </div>
                <div>
                  <div className="text-xs font-extrabold text-sage-text">First Product</div>
                  <div className="text-[10px] text-sage-muted">Initial catalog listing & price point</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Account Action */}
          <div className="relative z-10 pt-4 border-t border-sage-border/60 flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-[10px] text-sage-muted block font-medium">Logged in as</span>
              <span className="text-xs font-bold text-sage-text truncate block">
                {merchant.firstName} {merchant.lastName}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-sage-border bg-white dark:bg-card text-sage-muted font-semibold text-xs hover:border-sage-primary hover:text-sage-primary transition-all flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>

        {/* Right Main Column: Active Step Form */}
        <div className="w-full lg:w-3/5 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative bg-white dark:bg-card text-sage-text">
          {/* Progress Tracker Bar */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-sage-text">
                {step === 1
                  ? 'Step 1: Configure Store Identity'
                  : step === 2
                  ? 'Step 2: Choose Store Theme'
                  : 'Step 3: Add Initial Product'}
              </span>

              <div className="flex items-center gap-3">
                <span className="font-bold text-sage-primary">{progressPercent}% Completed</span>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isFinishing}
                  className="px-2.5 py-1 rounded-lg bg-sage-accent/80 hover:bg-sage-accent text-sage-primary font-bold text-[11px] border border-sage-border transition-all flex items-center gap-1 hover:scale-105"
                >
                  <span>Skip Setup</span>
                  <FastForward className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Glowing Gradient Progress Bar */}
            <div className="w-full h-2 bg-sage-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sage-primary to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step Form Render Container */}
          <div className="flex-1 flex flex-col justify-center">
            {step === 1 && (
              <StoreDetailsStep
                merchant={merchant}
                initialValues={storeDetails}
                onSubmit={handleStoreDetailsSubmit}
                onBack={onLogout}
                onSkip={handleSkip}
              />
            )}

            {step === 2 && (
              <TemplateSelectionStep
                storeDetails={storeDetails}
                selectedTemplate={selectedTemplate}
                onSelect={handleTemplateSelect}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <FirstProductStep
                storeDetails={storeDetails}
                selectedTemplate={selectedTemplate}
                initialValues={firstProduct}
                onSubmit={handleFirstProductSubmit}
                onBack={() => setStep(2)}
                isSubmitting={isFinishing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
