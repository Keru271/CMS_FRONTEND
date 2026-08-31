'use client';

import React, { useState, useEffect } from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { useTranslation } from '@/src/context/LanguageContext';
import { cmsService } from '@/src/services/cmsService';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/src/lib/i18n';
import { UserPreferences } from '@/src/types';
import {
  User,
  Settings,
  Globe,
  Bell,
  Lock,
  Check,
  Save,
  Volume2,
  VolumeX,
  ShieldCheck,
  Smartphone,
  Mail,
  Briefcase,
  Clock,
  Layout,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Sliders,
  Copy,
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
  const { t, language, setLanguage, languages } = useTranslation();

  const storeId = activeStore?.id || merchantData?.store?.id || (typeof window !== 'undefined' ? localStorage.getItem('selected_store_id') : '') || '';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'localization' | 'interface' | 'notifications' | 'security'>('profile');

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
  const [interfaceDensity, setInterfaceDensity] = useState<'comfortable' | 'compact'>('comfortable');
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
        // First populate from merchantData context if available
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
            if (p.emailOnCustomerReview !== undefined) setEmailOnCustomerReview(p.emailOnCustomerReview);
          }
        }

        // Fetch latest profile from backend /api/users/me
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
              if (prefs.emailOnCustomerReview !== undefined) setEmailOnCustomerReview(prefs.emailOnCustomerReview);
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

  // Play audio test
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

  // Handle Save Preferences & Profile
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

      // 1. Update Profile (Name, Phone, Role Title)
      await cmsService.updateUserProfile({
        name: fullName,
        phone: phone.trim(),
        customRoleTitle: customRoleTitle.trim(),
      });

      // 2. Update Preferences in DB
      await cmsService.updateUserPreferences(currentPreferences);

      // 3. Immediately apply LanguageContext
      setLanguage(prefLanguage);

      // 4. Update CMS Context & LocalStorage Session
      if (merchantData) {
        const updatedMerchant = {
          ...merchantData.merchant,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          mobileNumber: phone.trim(),
          customRoleTitle: customRoleTitle.trim(),
          preferences: currentPreferences,
          preferencesJson: JSON.stringify(currentPreferences),
        };

        const updatedSession = {
          ...merchantData,
          merchant: updatedMerchant,
        };

        setMerchantData(updatedSession);
        try {
          localStorage.setItem('merchant_cms_session', JSON.stringify(updatedSession));
          localStorage.setItem('user_preferences', JSON.stringify(currentPreferences));
        } catch {}
      }

      showToast(t('preferences.saved', 'User preferences and profile updated successfully!'));
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
      showToast(err?.response?.data?.message || 'Failed to save user preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
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
      setPasswordError(err?.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
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
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-[#191a1b] text-[#d4ff4c] border-[#cbd5e0]'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#d4ff4c] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white shrink-0" />
          )}
          <span className="text-xs font-sans font-bold">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#191a1b] text-[#d4ff4c] flex items-center justify-center text-2xl font-bold font-serif shadow-md shrink-0">
            {firstName.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-normal text-[#191a1b]">
                {firstName || 'Administrator'} {lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                {customRoleTitle || 'Account Owner'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-[#5e5a5a]">{email || 'merchant@omnistore.com'}</p>
              {storeId && (
                <>
                  <span className="text-[#cbd5e0] hidden sm:inline">•</span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] text-[10px] font-mono font-bold text-[#191a1b]">
                    <span className="text-[#5e5a5a] font-sans uppercase text-[9px]">Store ID:</span>
                    <span className="selection:bg-[#d4ff4c]">{storeId}</span>
                    <button
                      type="button"
                      onClick={handleCopyStoreId}
                      className="p-0.5 rounded hover:bg-white text-[#5e5a5a] hover:text-[#191a1b] transition-colors cursor-pointer"
                      title="Copy Store ID"
                    >
                      {copiedStoreId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  {copiedStoreId && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 animate-in fade-in">
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
          className="px-6 py-2.5 rounded-xl bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] font-sans font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-[#d4ff4c] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-[#d4ff4c]" />
          )}
          <span>{isSaving ? 'Saving Changes...' : 'Save All Preferences'}</span>
        </button>
      </div>

      {/* Main Studio Card with Tabs */}
      <div className="bg-[#ffffff] border border-[#cbd5e0] rounded-3xl shadow-statamic overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-[#cbd5e0] bg-[#fdf1ef]/50 overflow-x-auto">
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
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#191a1b] text-[#191a1b] bg-[#ffffff]'
                    : 'border-transparent text-[#5e5a5a] hover:text-[#191a1b] hover:bg-[#ffffff]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#191a1b]' : 'text-[#5e5a5a]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: USER PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg text-[#191a1b]">Personal Identity & Contact</h3>
                <p className="text-xs text-[#5e5a5a]">
                  These details identify your session in the administration audit log, notifications, and team records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                    placeholder="e.g. Alexander"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                    placeholder="e.g. Mercer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">
                    Email Address <span className="text-gray-400 font-normal">(Primary Login)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-gray-500 bg-gray-50 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">
                    Custom Department / Role Title
                  </label>
                  <input
                    type="text"
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
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
                <h3 className="font-serif text-lg text-[#191a1b]">Language & Regional Localization</h3>
                <p className="text-xs text-[#5e5a5a]">
                  Choose your native language and administrative timezone. Switching language translates the CMS immediately.
                </p>
              </div>

              {/* Language Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#191a1b]">Administrative Language</label>
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
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#191a1b] text-white border-[#191a1b] shadow-md ring-2 ring-[#d4ff4c]'
                            : 'bg-[#fdf1ef]/30 hover:bg-[#fdf1ef] border-[#cbd5e0] text-[#191a1b]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${
                              isSelected ? 'bg-[#d4ff4c] text-[#191a1b]' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {langItem.badge}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#d4ff4c]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{langItem.nativeName}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            {langItem.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timezone & Currency Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#cbd5e0]">
                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5e5a5a]" />
                    <span>Operational Timezone</span>
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5 flex items-center gap-1.5">
                    <span>Currency Format</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
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
                <h3 className="font-serif text-lg text-[#191a1b]">Workspace & Experience Preferences</h3>
                <p className="text-xs text-[#5e5a5a]">
                  Customize your default navigation landing view and interface feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">
                    Default Landing Workspace View
                  </label>
                  <select
                    value={defaultLandingView}
                    onChange={(e) => setDefaultLandingView(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                  >
                    {LANDING_PAGES.map((lp) => (
                      <option key={lp.value} value={lp.value}>
                        {lp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">
                    Data Grid & Table Density
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'comfortable', label: 'Comfortable', desc: 'Standard padding' },
                      { id: 'compact', label: 'Compact', desc: 'High density view' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setInterfaceDensity(d.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          interfaceDensity === d.id
                            ? 'bg-[#191a1b] text-white border-[#191a1b]'
                            : 'bg-[#fdf1ef]/20 hover:bg-[#fdf1ef] border-[#cbd5e0] text-[#191a1b]'
                        }`}
                      >
                        <div className="text-xs font-bold">{d.label}</div>
                        <div className={`text-[10px] ${interfaceDensity === d.id ? 'text-gray-300' : 'text-gray-500'}`}>
                          {d.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sound Notifications Toggle */}
              <div className="p-4 rounded-2xl bg-[#fdf1ef]/40 border border-[#cbd5e0] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-[#cbd5e0] text-[#191a1b]">
                    {soundAlerts ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#191a1b]">Audio Chime on Incoming Orders</h4>
                    <p className="text-[11px] text-[#5e5a5a]">Play a subtle audio tone whenever an order is submitted in real-time.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {soundAlerts && (
                    <button
                      type="button"
                      onClick={playSoundTest}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#cbd5e0] bg-white hover:bg-[#fdf1ef] text-[#191a1b] cursor-pointer"
                    >
                      Test Chime
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      soundAlerts ? 'bg-emerald-600' : 'bg-gray-300'
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
                <h3 className="font-serif text-lg text-[#191a1b]">Automated Email & Push Notifications</h3>
                <p className="text-xs text-[#5e5a5a]">
                  Configure triggers for merchant event dispatches sent to <strong>{email}</strong>.
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
                    className="p-4 rounded-2xl border border-[#cbd5e0] bg-[#fdf1ef]/20 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#191a1b]">{item.title}</h4>
                      <p className="text-[11px] text-[#5e5a5a]">{item.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={item.toggle}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                        item.active ? 'bg-emerald-600' : 'bg-gray-300'
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
                <h3 className="font-serif text-lg text-[#191a1b]">Account Password & Credentials</h3>
                <p className="text-xs text-[#5e5a5a]">
                  Update your merchant login password. Make sure it contains at least 6 characters.
                </p>
              </div>

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191a1b] mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e0] text-xs text-[#191a1b] focus:outline-none focus:border-[#191a1b] bg-[#fdf1ef]/20"
                    placeholder="Repeat new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] font-sans font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <div className="w-4 h-4 border-2 border-[#d4ff4c] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-[#d4ff4c]" />
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
