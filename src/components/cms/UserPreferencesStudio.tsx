'use client';

import React, { useState, useEffect } from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { useTranslation } from '@/src/context/LanguageContext';
import { cmsService } from '@/src/services/cmsService';
import { SupportedLanguage } from '@/src/lib/i18n';
import { UserPreferences } from '@/src/types';
import {
  User,
  Globe,
  Bell,
  Lock,
  Check,
  Save,
  Volume2,
  VolumeX,
  ShieldCheck,
  Clock,
  Layout,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Copy,
  Hash,
} from 'lucide-react';

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST - UTC+05:30)' },
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
  { value: 'America/New_York', label: 'America/New_York (EST - UTC-05:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST - UTC-08:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT - UTC+00:00)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET - UTC+01:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST - UTC+04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT - UTC+08:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST - UTC+10:00)' },
];

const LANDING_PAGES = [
  { value: 'dashboard', label: 'Dashboard Overview (/dashboard)' },
  { value: 'products', label: 'Products Studio (/products)' },
  { value: 'orders', label: 'Order Processing (/orders)' },
  { value: 'customers', label: 'Customer Management (/customers)' },
  { value: 'themes', label: 'Theme Studio (/themes)' },
  { value: 'billing', label: 'Pricing & Billing (/billing)' },
];

export const UserPreferencesStudio: React.FC = () => {
  const { merchantData, setMerchantData, activeStore } = useCMSContext();
  const { language, setLanguage, languages } = useTranslation();

  const storeId = activeStore?.id || merchantData?.store?.id || cmsService.getActiveStoreId() || '';
  const [copiedStoreId, setCopiedStoreId] = useState(false);

  const handleCopyStoreId = async () => {
    if (!storeId) return;
    try {
      await navigator.clipboard.writeText(storeId);
      setCopiedStoreId(true);
      setTimeout(() => setCopiedStoreId(false), 2000);
    } catch (err) {
      console.error('Failed to copy storeId:', err);
    }
  };

  // Active section tab
  const [activeTab, setActiveTab] = useState<
    'profile' | 'localization' | 'interface' | 'notifications' | 'security'
  >('profile');

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customRoleTitle, setCustomRoleTitle] = useState('');

  // Preference fields
  const [prefLanguage, setPrefLanguage] = useState<SupportedLanguage>(language);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [defaultLandingView, setDefaultLandingView] = useState('dashboard');
  const [interfaceDensity, setInterfaceDensity] = useState<'comfortable' | 'compact'>(
    'comfortable',
  );
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Notification toggles
  const [emailOnNewOrder, setEmailOnNewOrder] = useState(true);
  const [emailOnLowStock, setEmailOnLowStock] = useState(true);
  const [emailDailyDigest, setEmailDailyDigest] = useState(true);
  const [emailOnCustomerReview, setEmailOnCustomerReview] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        if (merchantData?.merchant) {
          setFirstName(merchantData.merchant.firstName || '');
          setLastName(merchantData.merchant.lastName || '');
          setEmail(merchantData.merchant.email || '');
          setPhone(merchantData.merchant.mobileNumber || merchantData.merchant.phone || '');
          setCustomRoleTitle(merchantData.merchant.customRoleTitle || 'Owner');

          if (merchantData.merchant.preferences) {
            const p = merchantData.merchant.preferences;
            if (p.language) setPrefLanguage(p.language as SupportedLanguage);
            if (p.timezone) setTimezone(p.timezone);
            if (p.currency) setCurrency(p.currency);
            if (p.defaultLandingView) setDefaultLandingView(p.defaultLandingView);
            if (p.interfaceDensity) setInterfaceDensity(p.interfaceDensity);
            if (p.soundAlerts !== undefined) setSoundAlerts(p.soundAlerts);
            if (p.emailOnNewOrder !== undefined) setEmailOnNewOrder(p.emailOnNewOrder);
            if (p.emailOnLowStock !== undefined) setEmailOnLowStock(p.emailOnLowStock);
            if (p.emailDailyDigest !== undefined) setEmailDailyDigest(p.emailDailyDigest);
            if (p.emailOnCustomerReview !== undefined)
              setEmailOnCustomerReview(p.emailOnCustomerReview);
          }
        }

        const profile = await cmsService.getUserProfile();
        if (profile) {
          const names = (profile.name || '').trim().split(' ');
          const first = names[0] || '';
          const last = names.slice(1).join(' ') || '';

          setFirstName(first);
          setLastName(last);
          setEmail(profile.email || '');
          if (profile.phone) setPhone(profile.phone);
          if (profile.customRoleTitle) setCustomRoleTitle(profile.customRoleTitle);

          if (profile.preferencesJson) {
            try {
              const prefs: UserPreferences = JSON.parse(profile.preferencesJson);
              if (prefs.language) {
                setPrefLanguage(prefs.language as SupportedLanguage);
                setLanguage(prefs.language as SupportedLanguage);
              }
              if (prefs.timezone) setTimezone(prefs.timezone);
              if (prefs.currency) setCurrency(prefs.currency);
              if (prefs.defaultLandingView) setDefaultLandingView(prefs.defaultLandingView);
              if (prefs.interfaceDensity) setInterfaceDensity(prefs.interfaceDensity);
              if (prefs.soundAlerts !== undefined) setSoundAlerts(prefs.soundAlerts);
              if (prefs.emailOnNewOrder !== undefined) setEmailOnNewOrder(prefs.emailOnNewOrder);
              if (prefs.emailOnLowStock !== undefined) setEmailOnLowStock(prefs.emailOnLowStock);
              if (prefs.emailDailyDigest !== undefined) setEmailDailyDigest(prefs.emailDailyDigest);
              if (prefs.emailOnCustomerReview !== undefined)
                setEmailOnCustomerReview(prefs.emailOnCustomerReview);
            } catch (err) {
              console.error('Failed to parse preferencesJson:', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const playSoundTest = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleSavePreferences = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const currentPreferences: UserPreferences = {
        language: prefLanguage,
        timezone,
        currency,
        defaultLandingView,
        interfaceDensity,
        soundAlerts,
        emailOnNewOrder,
        emailOnLowStock,
        emailDailyDigest,
        emailOnCustomerReview,
      };

      await cmsService.updateUserProfile({
        name: fullName,
        phone: phone.trim(),
        customRoleTitle: customRoleTitle.trim(),
      });

      await cmsService.updateUserPreferences(currentPreferences);

      setLanguage(prefLanguage);

      if (merchantData) {
        const updatedMerchant = {
          ...merchantData.merchant,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          customRoleTitle: customRoleTitle.trim(),
          preferences: currentPreferences,
        };
        const updatedData = { ...merchantData, merchant: updatedMerchant };
        setMerchantData(updatedData);
        localStorage.setItem('merchant_onboarding', JSON.stringify(updatedData));
      }

      showToast('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      showToast('Failed to save preferences. Please check your connection.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await cmsService.changeUserPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully! Keep your credentials secure.');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setPasswordError(
        err?.response?.data?.message || 'Failed to change password. Verify your current password.',
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">
            Loading User Preferences...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-[#00E5FF] border-slate-800'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#00E5FF] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white shrink-0" />
          )}
          <span className="text-xs font-sans font-bold">{toast.text}</span>
        </div>
      )}

      {/* Header Banner Card (Light Mode) */}
      <div className="p-6 sm:p-7 rounded-2xl md:rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-[#00E5FF] flex items-center justify-center text-xl font-bold font-sans shadow-sm shrink-0 border border-slate-800">
            {firstName.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-slate-900">
                {firstName || 'Administrator'} {lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                {customRoleTitle || 'Account Owner'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <p className="text-xs text-slate-500 font-sans">{email || 'merchant@omnistore.com'}</p>
              {storeId && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono font-medium text-slate-700">
                    <span className="text-slate-400 font-sans uppercase text-[9px] font-bold">Store ID:</span>
                    <span className="font-bold text-slate-900">{storeId}</span>
                    <button
                      type="button"
                      onClick={handleCopyStoreId}
                      className="p-0.5 rounded hover:bg-white text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Copy Store ID"
                    >
                      {copiedStoreId ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  {copiedStoreId && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-in fade-in">
                      Copied!
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSavePreferences()}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-[#00E5FF] font-sans font-bold text-xs shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-[#00E5FF]" />
          )}
          <span>{isSaving ? 'Saving Changes...' : 'Save All Preferences'}</span>
        </button>
      </div>

      {/* Main Studio Card with Clean Subtabs (Light Mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-3 overflow-x-auto gap-1.5 pt-2">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'localization', label: 'Language & Regional', icon: Globe },
            { id: 'interface', label: 'Workspace & UI', icon: Layout },
            { id: 'notifications', label: 'Alert Preferences', icon: Bell },
            { id: 'security', label: 'Security & Password', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4.5 py-3 text-xs font-sans transition-all whitespace-nowrap cursor-pointer rounded-t-xl ${
                  isActive
                    ? 'bg-white text-slate-900 border-t border-x border-slate-200 font-bold shadow-xs -mb-px'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 bg-white">
          {/* TAB 1: USER PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900">Personal Identity & Contact</h3>
                <p className="text-xs sm:text-sm font-sans text-slate-500 mt-0.5">
                  These details identify your session in the administration audit log, notifications, and team records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                    placeholder="e.g. Alexander"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                    placeholder="e.g. Mercer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    Email Address <span className="text-slate-400 font-normal">(Primary Login)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-sans text-slate-500 cursor-not-allowed shadow-xs"
                    />
                    <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    Custom Department / Role Title
                  </label>
                  <input
                    type="text"
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                    placeholder="e.g. Chief Merchant & Operations Lead"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCALIZATION & REGIONAL */}
          {activeTab === 'localization' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900">
                  Language & Regional Localization
                </h3>
                <p className="text-xs sm:text-sm font-sans text-slate-500 mt-0.5">
                  Choose your native language and administrative timezone. Switching language translates the CMS immediately.
                </p>
              </div>

              {/* Language Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 font-sans">
                  Administrative Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {languages.map((langItem) => {
                    const isSelected = prefLanguage === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => {
                          setPrefLanguage(langItem.code);
                          setLanguage(langItem.code);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-cyan-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold ${
                              isSelected
                                ? 'bg-[#00E5FF] text-slate-900'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {langItem.badge}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#00E5FF]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold font-sans">{langItem.nativeName}</div>
                          <div
                            className={`text-[11px] font-sans ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}
                          >
                            {langItem.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timezone & Currency Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 font-sans">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Operational Timezone</span>
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 font-sans">
                    <span>Currency Format</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="AUD">AUD ($) - Australian Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSPACE & INTERFACE */}
          {activeTab === 'interface' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900">
                  Workspace & Experience Preferences
                </h3>
                <p className="text-xs sm:text-sm font-sans text-slate-500 mt-0.5">
                  Customize your default navigation landing view and interface feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    Default Landing Workspace View
                  </label>
                  <select
                    value={defaultLandingView}
                    onChange={(e) => setDefaultLandingView(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                  >
                    {LANDING_PAGES.map((lp) => (
                      <option key={lp.value} value={lp.value}>
                        {lp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    Data Grid & Table Density
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'comfortable', label: 'Comfortable', desc: 'Standard spacious padding' },
                      { id: 'compact', label: 'Compact', desc: 'High data density view' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setInterfaceDensity(d.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          interfaceDensity === d.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-cyan-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-xs'
                        }`}
                      >
                        <div className="text-xs font-bold font-sans">{d.label}</div>
                        <div
                          className={`text-[11px] font-sans ${interfaceDensity === d.id ? 'text-slate-300' : 'text-slate-500'}`}
                        >
                          {d.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sound Notifications Toggle */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-xs">
                    {soundAlerts ? (
                      <Volume2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-sans">
                      Audio Chime on Incoming Orders
                    </h4>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Play a subtle audio tone whenever an order is submitted in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {soundAlerts && (
                    <button
                      type="button"
                      onClick={playSoundTest}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 cursor-pointer shadow-xs transition-colors"
                    >
                      Test Chime
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      soundAlerts ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        soundAlerts ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALERT PREFERENCES */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900">
                  Automated Email & Push Notifications
                </h3>
                <p className="text-xs sm:text-sm font-sans text-slate-500 mt-0.5">
                  Configure triggers for merchant event dispatches sent to <strong className="text-slate-800">{email}</strong>.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'New Customer Order Placed',
                    desc: 'Receive immediate email notice with customer details and line-item totals when an order is paid.',
                    active: emailOnNewOrder,
                    toggle: () => setEmailOnNewOrder(!emailOnNewOrder),
                  },
                  {
                    title: 'Low Inventory & Stock Warnings',
                    desc: 'Notify when warehouse stock quantity dips below the 10-unit minimum reorder threshold.',
                    active: emailOnLowStock,
                    toggle: () => setEmailOnLowStock(!emailOnLowStock),
                  },
                  {
                    title: 'Morning Executive Revenue Digest',
                    desc: 'Daily 08:00 AM summary of 24-hour gross revenue, top products sold, and pending fulfillments.',
                    active: emailDailyDigest,
                    toggle: () => setEmailDailyDigest(!emailDailyDigest),
                  },
                  {
                    title: 'New Product Customer Reviews',
                    desc: 'Alert when a customer posts a new product review or rating awaiting moderation.',
                    active: emailOnCustomerReview,
                    toggle: () => setEmailOnCustomerReview(!emailOnCustomerReview),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-sans">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">{item.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={item.toggle}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                        item.active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          item.active ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900">
                  Account Password & Credentials
                </h3>
                <p className="text-xs sm:text-sm font-sans text-slate-500 mt-0.5">
                  Update your merchant login password. Make sure it contains at least 6 characters.
                </p>
              </div>

              {passwordError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-sans">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-xs"
                    placeholder="Repeat new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-[#00E5FF] font-sans font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <div className="w-4 h-4 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-[#00E5FF]" />
                  )}
                  <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
