'use client';

import React, { useState, useEffect } from 'react';
import {
  Cookie,
  Shield,
  Check,
  X,
  Settings,
  ChevronRight,
  Info,
  Lock,
  BarChart3,
  Sliders,
  Sparkles,
} from 'lucide-react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'wendr_cms_cookie_consent';

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    functional: true,
    timestamp: '',
  });

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
        setIsOpen(false);
      } else {
        // Delay display slightly for smooth page entry
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = (updated: CookiePreferences) => {
    const finalData = { ...updated, timestamp: new Date().toISOString() };
    setPreferences(finalData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
    } catch {}
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      functional: true,
      timestamp: '',
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      functional: false,
      timestamp: '',
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!mounted) return null;

  return (
    <>
      {/* ─── Persistent Re-open Trigger (bottom-left) ─── */}
      {!isOpen && !showPreferences && (
        <button
          type="button"
          onClick={() => setShowPreferences(true)}
          title="Cookie & Privacy Preferences"
          aria-label="Cookie & Privacy Preferences"
          className="fixed bottom-4 left-4 z-40 p-2.5 rounded-full bg-[#191a1b] text-[#fdf1ef] border border-[#333] shadow-lg hover:border-[#d4ff4c] hover:scale-105 transition-all flex items-center gap-2 text-xs group cursor-pointer"
        >
          <Cookie className="w-4 h-4 text-[#d4ff4c] group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-medium text-[11px] opacity-80 group-hover:opacity-100">
            Cookies
          </span>
        </button>
      )}

      {/* ─── Main Consent Banner ─── */}
      {isOpen && !showPreferences && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#191a1b] text-[#fdf1ef] border border-[#333] shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#2a2b2c] border border-[#444] text-[#d4ff4c] flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Cookie & Privacy Consent</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2b2c] text-[#d4ff4c] font-mono">
                    CMS
                  </span>
                </h3>
                <p className="text-xs text-[#b8b8b8] leading-relaxed">
                  We use cookies and local state to keep your session securely authenticated,
                  maintain custom dashboard layouts, and optimize platform latency.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-xs font-semibold text-[#a0a0a0] hover:text-[#d4ff4c] underline flex items-center justify-center gap-1.5 py-1.5 transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold text-[#e0e0e0] bg-[#2a2b2c] hover:bg-[#353637] border border-[#444] transition active:scale-[0.98] cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-[#191a1b] bg-[#d4ff4c] hover:bg-[#c2f038] shadow-md transition active:scale-[0.98] cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Preferences Modal ─── */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#191a1b] text-[#fdf1ef] border border-[#333] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#2d2e30] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2a2b2c] border border-[#444] text-[#d4ff4c] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cookie Preferences</h3>
                  <p className="text-xs text-[#999]">Manage which cookies Wendr CMS may store</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#2a2b2c] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-[#222324] border border-[#333] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Strictly Necessary</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/60">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-[#a0a0a0] leading-relaxed">
                  Required for user authentication, API token validation, secure multi-tenant routing,
                  and core dashboard security. The application cannot function without these.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-4 rounded-2xl bg-[#222324] border border-[#333] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <BarChart3 className="w-4 h-4 text-[#d4ff4c]" />
                    <span>Analytics & Performance</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#3a3b3d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4ff4c] peer-checked:after:bg-[#191a1b]" />
                  </label>
                </div>
                <p className="text-xs text-[#a0a0a0] leading-relaxed">
                  Allows us to measure dashboard loading performance, detect broken views, and
                  continuously improve editor workflows.
                </p>
              </div>

              {/* Category 3: Functional & Preferences */}
              <div className="p-4 rounded-2xl bg-[#222324] border border-[#333] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Functional & Workspace State</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#3a3b3d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4ff4c] peer-checked:after:bg-[#191a1b]" />
                  </label>
                </div>
                <p className="text-xs text-[#a0a0a0] leading-relaxed">
                  Remembers your collapsed sidebar preferences, data table column selections,
                  pinned modules, and preview theme choices.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#2d2e30] bg-[#1d1e1f] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-[#b0b0b0] hover:text-white border border-[#444] transition cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2a2b2c] hover:bg-[#353637] border border-[#444] transition cursor-pointer"
                >
                  Save My Preferences
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-[#191a1b] bg-[#d4ff4c] hover:bg-[#c2f038] shadow-md transition cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
