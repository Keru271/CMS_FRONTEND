'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import {
  COUNTRY_DIAL_CODES,
  CountryDialCode,
  DEFAULT_COUNTRY,
  parsePhoneNumber,
} from '@/src/utils/countryCodes';

export interface PhoneInputWithCountryProps {
  value: string;
  onChange: (fullNumber: string, meta: { dialCode: string; nationalNumber: string; countryCode: string }) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  variant?: 'auth' | 'standard'; // 'auth' integrates inside MerchantAuthModal card style
  defaultCountryCode?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  onChange,
  onBlur,
  name = 'phone',
  id,
  label,
  placeholder = '98765 43210',
  error,
  disabled = false,
  required = false,
  className = '',
  variant = 'standard',
  defaultCountryCode = '+91',
}) => {
  // Parse incoming value to establish initial country & number
  const parsed = useMemo(() => {
    return parsePhoneNumber(value, defaultCountryCode);
  }, [value, defaultCountryCode]);

  const [selectedCountry, setSelectedCountry] = useState<CountryDialCode>(parsed.country);
  const [nationalNumber, setNationalNumber] = useState<string>(parsed.nationalNumber);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when prop value changes externally
  useEffect(() => {
    const updated = parsePhoneNumber(value, selectedCountry.dialCode);
    setSelectedCountry(updated.country);
    setNationalNumber(updated.nationalNumber);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: CountryDialCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');

    const full = nationalNumber.trim() ? `${country.dialCode} ${nationalNumber.trim()}` : '';
    onChange(full, {
      dialCode: country.dialCode,
      nationalNumber: nationalNumber.trim(),
      countryCode: country.code,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if user pasted a number with country code starting with '+'
    if (rawVal.trim().startsWith('+')) {
      const parsedPaste = parsePhoneNumber(rawVal.trim());
      setSelectedCountry(parsedPaste.country);
      setNationalNumber(parsedPaste.nationalNumber);

      const full = parsedPaste.nationalNumber.trim()
        ? `${parsedPaste.country.dialCode} ${parsedPaste.nationalNumber.trim()}`
        : '';
      onChange(full, {
        dialCode: parsedPaste.country.dialCode,
        nationalNumber: parsedPaste.nationalNumber.trim(),
        countryCode: parsedPaste.country.code,
      });
      return;
    }

    // Keep numbers and spaces/hyphens
    const cleanNumber = rawVal.replace(/[^\d\s-]/g, '');
    setNationalNumber(cleanNumber);

    const full = cleanNumber.trim() ? `${selectedCountry.dialCode} ${cleanNumber.trim()}` : '';
    onChange(full, {
      dialCode: selectedCountry.dialCode,
      nationalNumber: cleanNumber.trim(),
      countryCode: selectedCountry.code,
    });
  };

  // Render for Auth Modal Variant (Compact inside card)
  if (variant === 'auth') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div className="flex items-center gap-2">
          {/* Country Code Trigger */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-200/80 dark:bg-[#252528] hover:bg-slate-300/80 dark:hover:bg-[#2f2f33] transition-colors border border-slate-300 dark:border-[#333] shrink-0 text-slate-800 dark:text-slate-100 text-xs font-semibold select-none cursor-pointer"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-mono text-[11px] tracking-tight">{selectedCountry.dialCode}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* National Phone Input */}
          <input
            id={id || name}
            name={name}
            type="tel"
            disabled={disabled}
            placeholder={placeholder}
            value={nationalNumber}
            onChange={handleNumberChange}
            onBlur={onBlur}
            required={required}
            className="flex-1 bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 max-w-[90vw] z-50 bg-white dark:bg-[#1a1a1c] border border-slate-200 dark:border-[#2f2f33] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Box */}
            <div className="p-2.5 border-b border-slate-100 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#161618]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#222226] border border-slate-200 dark:border-[#333]">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-56 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800">
              {filteredCountries.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">No country found</div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={`${c.code}-${c.dialCode}`}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-[#222226] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] text-slate-400">{c.dialCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render for Standard Form Field Variant
  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-xl border bg-white dark:bg-card transition-all ${
          error
            ? 'border-red-500 ring-1 ring-red-500'
            : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent'
        }`}
      >
        {/* Country Code Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-l-xl bg-slate-50 dark:bg-accent/40 hover:bg-slate-100 dark:hover:bg-accent/60 transition-colors border-r border-slate-200 dark:border-border shrink-0 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer select-none"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* National Number Input */}
        <input
          id={id || name}
          name={name}
          type="tel"
          disabled={disabled}
          placeholder={placeholder}
          value={nationalNumber}
          onChange={handleNumberChange}
          onBlur={onBlur}
          required={required}
          className="w-full px-3.5 py-2.5 rounded-r-xl bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground outline-none placeholder:text-slate-400"
        />

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-80 max-w-[95vw] z-50 bg-white dark:bg-popover border border-slate-200 dark:border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-accent/20">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-foreground outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-border">
              {filteredCountries.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No matching countries found</div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={`${c.code}-${c.dialCode}`}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-accent/50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-lg leading-none">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs text-slate-400">{c.dialCode}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-medium text-red-500 mt-1">{error}</p>}
    </div>
  );
};
