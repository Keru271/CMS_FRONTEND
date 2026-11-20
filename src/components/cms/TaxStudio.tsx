'use client';

import { SwipeToast } from '@/src/components/ui/SwipeToast';
import React, { useState, useEffect, useMemo } from 'react';
import { CMSTaxRegion, HsnSacCode } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Receipt,
  Globe,
  Plus,
  Edit2,
  Trash2,
  Percent,
  X,
  RefreshCw,
  Calculator,
  Search,
  Check,
  Tag,
  Building2,
  Sparkles,
  Info,
  Sliders,
  FileCheck2,
} from 'lucide-react';

export const TaxStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'regions' | 'hsn' | 'calculator'>('regions');
  const [taxRegions, setTaxRegions] = useState<CMSTaxRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Merchant Store Currency
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [currencyCode, setCurrencyCode] = useState<string>('INR');

  // Search in HSN tab
  const [hsnSearchQuery, setHsnSearchQuery] = useState('');
  const [hsnTypeFilter, setHsnTypeFilter] = useState<'ALL' | 'HSN' | 'SAC'>('ALL');

  // Region Modal State
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<CMSTaxRegion | null>(null);
  const [regionForm, setRegionForm] = useState({
    name: 'India',
    country: 'India',
    taxName: 'GST',
    taxNumber: '27AABCU9603R1ZM',
    standardRate: 18.0,
    reducedRate: 5.0,
    isTaxInclusive: true,
  });

  // HSN/SAC Modal State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [activeRegionId, setActiveRegionId] = useState<string>('');
  const [codeForm, setCodeForm] = useState<{
    code: string;
    description: string;
    taxRate: number;
    type: 'HSN' | 'SAC';
  }>({
    code: '',
    description: '',
    taxRate: 18.0,
    type: 'HSN',
  });

  // Quick Calculator State
  const [calcRegionId, setCalcRegionId] = useState<string>('');
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcIsInclusive, setCalcIsInclusive] = useState<boolean>(true);

  // Common Presets for fast setup
  const PRESET_TEMPLATES = [
    {
      label: 'India (GST 18%)',
      name: 'India',
      country: 'India',
      taxName: 'GST',
      taxNumber: '27AABCU9603R1ZM',
      standardRate: 18.0,
      reducedRate: 5.0,
      isTaxInclusive: true,
    },
    {
      label: 'US (Sales Tax 8%)',
      name: 'United States',
      country: 'United States',
      taxName: 'Sales Tax',
      taxNumber: '',
      standardRate: 8.25,
      reducedRate: 0,
      isTaxInclusive: false,
    },
    {
      label: 'UK (VAT 20%)',
      name: 'United Kingdom',
      country: 'United Kingdom',
      taxName: 'VAT',
      taxNumber: 'GB123456789',
      standardRate: 20.0,
      reducedRate: 5.0,
      isTaxInclusive: true,
    },
    {
      label: 'EU (VAT 21%)',
      name: 'European Union',
      country: 'Germany',
      taxName: 'VAT',
      taxNumber: 'DE123456789',
      standardRate: 21.0,
      reducedRate: 7.0,
      isTaxInclusive: true,
    },
    {
      label: 'UAE (VAT 5%)',
      name: 'United Arab Emirates',
      country: 'United Arab Emirates',
      taxName: 'VAT',
      taxNumber: '100234567800003',
      standardRate: 5.0,
      reducedRate: 0,
      isTaxInclusive: true,
    },
  ];

  useEffect(() => {
    loadData();
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const details = await cmsService.getStoreSetup();
      const code = (details.currency || 'INR').toUpperCase();
      setCurrencyCode(code);
      if (code === 'INR' || code === '₹') setCurrencySymbol('₹');
      else if (code === 'EUR' || code === '€') setCurrencySymbol('€');
      else if (code === 'GBP' || code === '£') setCurrencySymbol('£');
      else if (code === 'JPY' || code === '¥') setCurrencySymbol('¥');
      else setCurrencySymbol('$');
    } catch {
      setCurrencySymbol('₹');
      setCurrencyCode('INR');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getTaxRegions(true);
      setTaxRegions(data);
      if (data.length > 0) {
        setCalcRegionId((prev) => prev || data[0].id);
        setCalcIsInclusive(data[0].isTaxInclusive);
        setActiveRegionId((prev) => prev || data[0].id);
      }
    } catch (err) {
      console.error('Failed to load tax regions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // REGION CRUD
  const handleOpenCreateRegion = (preset?: (typeof PRESET_TEMPLATES)[0]) => {
    setEditingRegion(null);
    if (preset) {
      setRegionForm({
        name: preset.name,
        country: preset.country,
        taxName: preset.taxName,
        taxNumber: preset.taxNumber,
        standardRate: preset.standardRate,
        reducedRate: preset.reducedRate,
        isTaxInclusive: preset.isTaxInclusive,
      });
    } else {
      setRegionForm({
        name: '',
        country: '',
        taxName: 'GST',
        taxNumber: '',
        standardRate: 18.0,
        reducedRate: 5.0,
        isTaxInclusive: true,
      });
    }
    setIsRegionModalOpen(true);
  };

  const handleOpenEditRegion = (r: CMSTaxRegion) => {
    setEditingRegion(r);
    setRegionForm({
      name: r.name,
      country: r.country,
      taxName: r.taxName,
      taxNumber: r.taxNumber || '',
      standardRate: r.standardRate,
      reducedRate: r.reducedRate || 0,
      isTaxInclusive: r.isTaxInclusive,
    });
    setIsRegionModalOpen(true);
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionForm.name.trim() || !regionForm.country.trim()) {
      showToast('Please provide a region name and country.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRegion) {
        await cmsService.updateTaxRegion(editingRegion.id, {
          name: regionForm.name,
          country: regionForm.country,
          taxName: regionForm.taxName,
          taxNumber: regionForm.taxNumber,
          standardRate: Number(regionForm.standardRate),
          reducedRate: Number(regionForm.reducedRate),
          isTaxInclusive: regionForm.isTaxInclusive,
        });
        showToast(`Tax region "${regionForm.name}" updated successfully!`, 'success');
      } else {
        await cmsService.createTaxRegion({
          name: regionForm.name,
          country: regionForm.country,
          taxName: regionForm.taxName,
          taxNumber: regionForm.taxNumber,
          standardRate: Number(regionForm.standardRate),
          reducedRate: Number(regionForm.reducedRate),
          isTaxInclusive: regionForm.isTaxInclusive,
          hsnSacCodes: [],
        });
        showToast(`Tax region "${regionForm.name}" created!`, 'success');
      }

      setIsRegionModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save tax region.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRegion = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove tax region "${name}"?`)) {
      return;
    }
    try {
      setIsSaving(true);
      await cmsService.deleteTaxRegion(id);
      showToast('Tax region removed.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete tax region.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Storewide Tax Inclusivity on Primary Region
  const handleToggleStorewideInclusive = async () => {
    if (taxRegions.length === 0) return;
    const currentStatus = taxRegions[0].isTaxInclusive;
    const newStatus = !currentStatus;

    setIsSaving(true);
    try {
      // Update all regions to keep consistency
      await Promise.all(
        taxRegions.map((r) => cmsService.updateTaxRegion(r.id, { isTaxInclusive: newStatus }))
      );
      showToast(
        newStatus
          ? 'Storewide pricing set to Tax-Inclusive (prices include tax).'
          : 'Storewide pricing set to Tax-Exclusive (tax added at checkout).',
        'success'
      );
      setCalcIsInclusive(newStatus);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update pricing preference.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // HSN/SAC CODE CRUD
  const handleOpenAddCode = (targetRegionId?: string) => {
    const regId = targetRegionId || (taxRegions.length > 0 ? taxRegions[0].id : '');
    setActiveRegionId(regId);
    setCodeForm({
      code: '',
      description: '',
      taxRate: 18.0,
      type: 'HSN',
    });
    setIsCodeModalOpen(true);
  };

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegionId) {
      showToast('Please select a target tax region.', 'error');
      return;
    }
    if (!codeForm.code.trim()) {
      showToast('Please enter an HSN/SAC code.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const region = taxRegions.find((r) => r.id === activeRegionId);
      if (!region) return;

      const newCodeItem: HsnSacCode = {
        id: `code-${Date.now()}`,
        code: codeForm.code.trim().toUpperCase(),
        description: codeForm.description.trim() || 'General Product Override',
        taxRate: Number(codeForm.taxRate),
        type: codeForm.type,
      };

      const existingCodes = region.hsnSacCodes || [];
      const updatedCodes = [...existingCodes, newCodeItem];
      await cmsService.updateTaxRegion(activeRegionId, { hsnSacCodes: updatedCodes });

      showToast(`${codeForm.type} code "${codeForm.code}" added to ${region.name}!`, 'success');
      setIsCodeModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save code.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCode = async (regionId: string, codeId: string) => {
    try {
      setIsSaving(true);
      const region = taxRegions.find((r) => r.id === regionId);
      if (!region) return;

      const filteredCodes = (region.hsnSacCodes || []).filter((c) => c.id !== codeId);
      await cmsService.updateTaxRegion(regionId, { hsnSacCodes: filteredCodes });
      showToast('Classification code removed.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove code.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Flattened HSN list across all regions for Tab 2
  const allHsnCodes = useMemo(() => {
    const list: Array<HsnSacCode & { regionId: string; regionName: string; regionCountry: string }> =
      [];
    taxRegions.forEach((r) => {
      (r.hsnSacCodes || []).forEach((c) => {
        list.push({
          ...c,
          regionId: r.id,
          regionName: r.name,
          regionCountry: r.country,
        });
      });
    });
    return list;
  }, [taxRegions]);

  const filteredHsnCodes = useMemo(() => {
    return allHsnCodes.filter((item) => {
      const matchType = hsnTypeFilter === 'ALL' || item.type === hsnTypeFilter;
      const query = hsnSearchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.code.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.regionName.toLowerCase().includes(query);
      return matchType && matchQuery;
    });
  }, [allHsnCodes, hsnSearchQuery, hsnTypeFilter]);

  // Calculator calculations
  const selectedCalcRegion =
    taxRegions.find((r) => r.id === calcRegionId) || (taxRegions.length > 0 ? taxRegions[0] : null);

  const calcResults = useMemo(() => {
    if (!selectedCalcRegion) {
      return { basePrice: 0, taxAmount: 0, finalPrice: 0, cgst: 0, sgst: 0, igst: 0, rate: 0 };
    }
    const rate = selectedCalcRegion.standardRate || 0;
    const amount = Number(calcAmount) || 0;

    let basePrice = 0;
    let taxAmount = 0;
    let finalPrice = 0;

    if (calcIsInclusive) {
      basePrice = amount / (1 + rate / 100);
      taxAmount = amount - basePrice;
      finalPrice = amount;
    } else {
      basePrice = amount;
      taxAmount = (amount * rate) / 100;
      finalPrice = amount + taxAmount;
    }

    return {
      basePrice,
      taxAmount,
      finalPrice,
      cgst: taxAmount / 2,
      sgst: taxAmount / 2,
      igst: taxAmount,
      rate,
    };
  }, [selectedCalcRegion, calcAmount, calcIsInclusive]);

  const isStoreTaxInclusive = taxRegions.length > 0 ? taxRegions[0].isTaxInclusive : true;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading tax settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <SwipeToast
          open={!!toastMessage}
          type={toastMessage.type}
          title={toastMessage.type === 'success' ? 'Success' : 'Notice'}
          description={toastMessage.text}
          onClose={() => setToastMessage(null)}
          duration={4000}
        />
      )}

      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground">
                Taxes
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your regional tax rates, GSTIN registration, and product HSN/SAC overrides.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            title="Refresh tax rates"
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-border hover:bg-slate-50 dark:hover:bg-accent text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreateRegion()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tax Region</span>
          </button>
        </div>
      </div>

      {/* ── 2. Storewide Tax Calculation Mode Card ────────────────────── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                Storefront Tax Pricing Preference
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              {isStoreTaxInclusive
                ? 'Tax-Inclusive: Product catalog prices already include tax. Base price and tax split are clearly shown on the invoice.'
                : 'Tax-Exclusive: Taxes are calculated and added at checkout on top of product prices.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-accent p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                if (!isStoreTaxInclusive) handleToggleStorewideInclusive();
              }}
              disabled={isSaving}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isStoreTaxInclusive
                  ? 'bg-white dark:bg-card text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All prices include tax
            </button>
            <button
              type="button"
              onClick={() => {
                if (isStoreTaxInclusive) handleToggleStorewideInclusive();
              }}
              disabled={isSaving}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isStoreTaxInclusive
                  ? 'bg-white dark:bg-card text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Add tax at checkout
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Tabs Navigation ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-border text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('regions')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'regions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Tax Regions ({taxRegions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hsn')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'hsn'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>HSN / SAC Overrides ({allHsnCodes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Tax Calculator & Preview</span>
        </button>
      </div>

      {/* ── TAB 1: TAX REGIONS & RATES ───────────────────────────────── */}
      {activeTab === 'regions' && (
        <div className="space-y-4">
          {taxRegions.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-card border border-dashed border-slate-200 dark:border-border text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-foreground">
                  No tax regions configured yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Add your primary tax jurisdiction or choose a quick template below to get started.
                </p>
              </div>

              {/* Quick Template Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => handleOpenCreateRegion(tmpl)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-accent hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-border transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Region / Country</th>
                      <th className="py-3 px-4">Tax System</th>
                      <th className="py-3 px-4">GSTIN / Tax ID</th>
                      <th className="py-3 px-4">Standard Rate</th>
                      <th className="py-3 px-4">Reduced Rate</th>
                      <th className="py-3 px-4">Pricing Mode</th>
                      <th className="py-3 px-4">HSN Codes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-200">
                    {taxRegions.map((region) => (
                      <tr
                        key={region.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-accent/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-foreground">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>{region.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-accent font-medium text-[11px]">
                            {region.taxName}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {region.taxNumber ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                              {region.taxNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-foreground">
                          {region.standardRate}%
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {region.reducedRate != null ? `${region.reducedRate}%` : '—'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              region.isTaxInclusive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {region.isTaxInclusive ? 'Inclusive' : 'Exclusive'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('hsn');
                              setHsnSearchQuery(region.name);
                            }}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                          >
                            <span>{region.hsnSacCodes?.length || 0} mapped</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAddCode(region.id)}
                              title="Add HSN/SAC code to this region"
                              className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-accent text-indigo-600 dark:text-indigo-400 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditRegion(region)}
                              title="Edit tax region"
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-accent text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRegion(region.id, region.name)}
                              title="Delete tax region"
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: HSN / SAC CODES ────────────────────────────────────── */}
      {activeTab === 'hsn' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code, product, or description..."
                  value={hsnSearchQuery}
                  onChange={(e) => setHsnSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-border text-xs bg-white dark:bg-card text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {hsnSearchQuery && (
                <button
                  type="button"
                  onClick={() => setHsnSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-accent p-0.5 rounded-xl text-xs font-medium">
                {(['ALL', 'HSN', 'SAC'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setHsnTypeFilter(t)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      hsnTypeFilter === t
                        ? 'bg-white dark:bg-card text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t === 'ALL' ? 'All' : t === 'HSN' ? 'Goods (HSN)' : 'Services (SAC)'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddCode()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Code</span>
              </button>
            </div>
          </div>

          {filteredHsnCodes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-card border border-dashed border-slate-200 dark:border-border text-center space-y-3">
              <Tag className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  {hsnSearchQuery ? 'No matching codes found' : 'No HSN/SAC codes registered'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Product classification codes allow specific goods or services to carry customized
                  tax rates (e.g. 5% on cotton textiles vs 18% standard).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddCode()}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                + Add First HSN / SAC Code
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Code Number</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Target Region</th>
                      <th className="py-3 px-4">Tax Rate</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-200">
                    {filteredHsnCodes.map((code) => (
                      <tr
                        key={code.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-accent/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-foreground">
                          {code.code}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              code.type === 'HSN'
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            }`}
                          >
                            {code.type === 'HSN' ? 'HSN (Goods)' : 'SAC (Services)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium max-w-xs truncate text-slate-900 dark:text-foreground">
                          {code.description}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {code.regionName}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {code.taxRate}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCode(code.regionId, code.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove code"
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
        </div>
      )}

      {/* ── TAB 3: TAX CALCULATOR & PREVIEW ──────────────────────────── */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Calculator Controls */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-border pb-3">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                Live Tax Engine Calculator
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Target Jurisdiction
                </label>
                <select
                  value={calcRegionId}
                  onChange={(e) => setCalcRegionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-card text-xs font-medium"
                >
                  {taxRegions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.standardRate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Sample Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="100"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-card font-mono text-sm font-bold"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-100 dark:border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-foreground block">
                    Tax Inclusive
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {calcIsInclusive ? 'Tax is within the amount' : 'Tax added on top of amount'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCalcIsInclusive(!calcIsInclusive)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    calcIsInclusive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {calcIsInclusive ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown Preview Card */}
          <div className="md:col-span-7 p-6 rounded-2xl bg-slate-900 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tax Breakdown Output
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                Rate: {calcResults.rate}%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 text-slate-300">
                <span>Base Taxable Value:</span>
                <span className="font-mono font-medium">
                  {currencySymbol}
                  {calcResults.basePrice.toFixed(2)}
                </span>
              </div>

              {selectedCalcRegion?.taxName === 'GST' ? (
                <>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Intra-State CGST ({calcResults.rate / 2}%):</span>
                    <span className="font-mono text-indigo-400">
                      {currencySymbol}
                      {calcResults.cgst.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Intra-State SGST ({calcResults.rate / 2}%):</span>
                    <span className="font-mono text-indigo-400">
                      {currencySymbol}
                      {calcResults.sgst.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>Or Inter-State IGST ({calcResults.rate}%):</span>
                    <span className="font-mono text-purple-400">
                      {currencySymbol}
                      {calcResults.igst.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1 text-slate-300">
                  <span>{selectedCalcRegion?.taxName || 'Tax'} ({calcResults.rate}%):</span>
                  <span className="font-mono text-indigo-400">
                    +{currencySymbol}
                    {calcResults.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-bold text-white">
                <span>Customer Payable:</span>
                <span className="text-base text-emerald-400 font-mono">
                  {currencySymbol}
                  {calcResults.finalPrice.toFixed(2)} {currencyCode}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  This matches the exact calculation applied in Storefront Checkout & Invoicing.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT TAX REGION MODAL ───────────────────────────── */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-accent/40 border-b border-slate-200 dark:border-border flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-foreground">
                {editingRegion ? 'Edit Tax Region' : 'Add Tax Region'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRegion} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Region Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India or California"
                  value={regionForm.name}
                  onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. India"
                    value={regionForm.country}
                    onChange={(e) => setRegionForm({ ...regionForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Tax Type</label>
                  <select
                    value={regionForm.taxName}
                    onChange={(e) => setRegionForm({ ...regionForm, taxName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                  >
                    <option value="GST">GST</option>
                    <option value="VAT">VAT</option>
                    <option value="Sales Tax">Sales Tax</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Standard Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={regionForm.standardRate}
                    onChange={(e) =>
                      setRegionForm({
                        ...regionForm,
                        standardRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold text-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Reduced Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={regionForm.reducedRate}
                    onChange={(e) =>
                      setRegionForm({
                        ...regionForm,
                        reducedRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  GSTIN / Registration ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27AABCU9603R1ZM"
                  value={regionForm.taxNumber}
                  onChange={(e) =>
                    setRegionForm({ ...regionForm, taxNumber: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card font-mono text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-100 dark:border-border">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                    Tax Inclusive
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Product prices include this tax
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRegionForm({ ...regionForm, isTaxInclusive: !regionForm.isTaxInclusive })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    regionForm.isTaxInclusive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {regionForm.isTaxInclusive ? 'Inclusive' : 'Exclusive'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegionModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Save Region'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD HSN/SAC CODE MODAL ───────────────────────────────────── */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-accent/40 border-b border-slate-200 dark:border-border flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-foreground">
                Add Classification Override
              </h3>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCode} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Target Tax Region *
                </label>
                <select
                  value={activeRegionId}
                  onChange={(e) => setActiveRegionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                >
                  {taxRegions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Classification Type
                  </label>
                  <select
                    value={codeForm.type}
                    onChange={(e) => setCodeForm({ ...codeForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                  >
                    <option value="HSN">HSN (Goods)</option>
                    <option value="SAC">SAC (Services)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Tax Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={codeForm.taxRate}
                    onChange={(e) =>
                      setCodeForm({ ...codeForm, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {codeForm.type} Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 61091000"
                  value={codeForm.code}
                  onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card font-mono text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Description / Category *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton T-Shirts, Footwear, Digital Service"
                  value={codeForm.description}
                  onChange={(e) => setCodeForm({ ...codeForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Add Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
