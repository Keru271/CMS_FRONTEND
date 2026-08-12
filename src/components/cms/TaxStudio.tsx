'use client';

import React, { useState, useEffect } from 'react';
import { CMSTaxRegion, HsnSacCode } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Receipt,
  Globe,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Percent,
  Printer,
  ShieldCheck,
  X,
  RefreshCw,
  Calculator,
  Search,
  BookOpen,
  Building,
  Check,
  Layers,
} from 'lucide-react';

export const TaxStudio: React.FC = () => {
  const [taxRegions, setTaxRegions] = useState<CMSTaxRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dynamic Merchant Store Currency
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [currencyCode, setCurrencyCode] = useState<string>('INR');

  // Region Modal State
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<CMSTaxRegion | null>(null);
  const [regionForm, setRegionForm] = useState({
    name: 'India (GST / IGST / CGST / SGST)',
    country: 'India',
    taxName: 'GST',
    taxNumber: '27AABCU9603R1ZM',
    standardRate: 18.0,
    reducedRate: 5.0,
    isTaxInclusive: false,
  });

  // HSN/SAC Modal State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [codeForm, setCodeForm] = useState<{
    code: string;
    description: string;
    taxRate: number;
    type: 'HSN' | 'SAC';
  }>({
    code: '61091000',
    description: 'Cotton T-Shirts & Apparel',
    taxRate: 12.0,
    type: 'HSN',
  });

  // Tax Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [b2bBuyerGstin, setB2bBuyerGstin] = useState('29BBBCU8812R1Z2');
  const [isInterStateGst, setIsInterStateGst] = useState(true);

  // Simulator Calculator State
  const [simRegionId, setSimRegionId] = useState<string>('tr-1');
  const [simItemPrice, setSimItemPrice] = useState<number>(100.0);
  const [simIsInclusive, setSimIsInclusive] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

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
      const setupStr = typeof window !== 'undefined' ? localStorage.getItem('merchant_cms_store_setup') : null;
      if (setupStr) {
        try {
          const parsed = JSON.parse(setupStr);
          if (parsed.currency) {
            const code = String(parsed.currency).toUpperCase();
            setCurrencyCode(code);
            if (code === 'INR' || code === '₹') setCurrencySymbol('₹');
            else if (code === 'EUR' || code === '€') setCurrencySymbol('€');
            else if (code === 'GBP' || code === '£') setCurrencySymbol('£');
            else setCurrencySymbol('$');
          }
        } catch {}
      }
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getTaxRegions();
      setTaxRegions(data);
      if (data.length > 0) {
        setSimRegionId(data[0].id);
        setSimIsInclusive(data[0].isTaxInclusive);
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
  const handleOpenCreateRegion = () => {
    setEditingRegion(null);
    setRegionForm({
      name: 'India (GST / IGST / CGST / SGST)',
      country: 'India',
      taxName: 'GST',
      taxNumber: '27AABCU9603R1ZM',
      standardRate: 18.0,
      reducedRate: 5.0,
      isTaxInclusive: false,
    });
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
      reducedRate: r.reducedRate || 5.0,
      isTaxInclusive: r.isTaxInclusive,
    });
    setIsRegionModalOpen(true);
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
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
        showToast(`Tax Region "${regionForm.name}" updated!`, 'success');
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
        showToast(`New Tax Region "${regionForm.name}" created!`, 'success');
      }

      setIsRegionModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save tax region.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRegion = async (id: string) => {
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

  // HSN/SAC CODE CRUD
  const handleOpenAddCode = (regionId: string) => {
    setActiveRegionId(regionId);
    setCodeForm({
      code: '61091000',
      description: 'Cotton T-Shirts & Apparel',
      taxRate: 12.0,
      type: 'HSN',
    });
    setIsCodeModalOpen(true);
  };

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegionId) return;
    setIsSaving(true);
    try {
      const region = taxRegions.find((r) => r.id === activeRegionId);
      if (!region) return;

      const newCodeItem: HsnSacCode = {
        id: `code-${Date.now()}`,
        code: codeForm.code.toUpperCase(),
        description: codeForm.description,
        taxRate: Number(codeForm.taxRate),
        type: codeForm.type,
      };

      const updatedCodes = [...(region.hsnSacCodes || []), newCodeItem];
      await cmsService.updateTaxRegion(activeRegionId, { hsnSacCodes: updatedCodes });

      showToast(`${codeForm.type} code "${codeForm.code}" added!`, 'success');
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
      showToast('HSN/SAC code removed.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove code.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // SIMULATOR TAX CALCULATIONS
  const selectedSimRegion = taxRegions.find((r) => r.id === simRegionId) || taxRegions[0];

  const calculateSimulatedTax = () => {
    if (!selectedSimRegion) return { taxAmount: 0, finalPrice: 0, cgst: 0, sgst: 0, igst: 0 };

    const ratePct = selectedSimRegion.standardRate;
    let taxAmt = 0;
    let finalTotal = 0;

    if (simIsInclusive) {
      // Inclusive pricing: Tax = ItemPrice - (ItemPrice / (1 + Rate/100))
      taxAmt = simItemPrice - simItemPrice / (1 + ratePct / 100);
      finalTotal = simItemPrice;
    } else {
      // Exclusive pricing: Tax = ItemPrice * (Rate / 100)
      taxAmt = (simItemPrice * ratePct) / 100;
      finalTotal = simItemPrice + taxAmt;
    }

    const halfTax = taxAmt / 2;

    return {
      taxAmount: taxAmt,
      finalPrice: finalTotal,
      cgst: halfTax,
      sgst: halfTax,
      igst: taxAmt,
    };
  };

  const simTax = calculateSimulatedTax();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Tax Studio...</span>
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
                Taxation & Compliance
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {taxRegions.length} Tax Jurisdictions Configured
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Receipt className="w-8 h-8 text-indigo-400" />
              <span>Tax Management Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Configure regional Tax/GST rates, GSTIN registration numbers, HSN/SAC code classification, inclusive vs exclusive store pricing, and print compliant B2B tax invoices.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Generate Tax Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateRegion}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tax Region</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: FALLBACK UI OR TAX REGIONS GRID + SIMULATOR */}
      {taxRegions.length === 0 ? (
        <div className="p-10 sm:p-16 rounded-3xl bg-white dark:bg-card border border-dashed border-slate-300 dark:border-border text-center space-y-6 shadow-sm max-w-4xl mx-auto my-8">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Receipt className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="font-black text-2xl text-slate-900 dark:text-foreground">
              No Tax Regions Configured
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Set up regional tax rates, GSTIN registration numbers, and HSN/SAC classification codes to automate store tax calculations and generate compliant B2B tax invoices.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleOpenCreateRegion}
              className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Configure First Tax Region</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: TAX REGION CARDS */}
          <div className="lg:col-span-8 space-y-6">
            {taxRegions.map((region) => (
              <div
                key={region.id}
                className="p-6 rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-5"
              >
                {/* Region Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-indigo-600" />
                      <h2 className="font-black text-lg text-slate-900 dark:text-foreground">{region.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-accent text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase">
                        {region.taxName}
                      </span>
                    </div>

                    {region.taxNumber && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Registration ID:</span>
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{region.taxNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAddCode(region.id)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-accent hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add HSN/SAC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditRegion(region)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRegion(region.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-accent text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rates Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-100 dark:border-border">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Standard Tax Rate</span>
                    <span className="text-lg font-black text-slate-900 dark:text-foreground">{region.standardRate}%</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-100 dark:border-border">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Reduced Rate</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{region.reducedRate || 5.0}%</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-100 dark:border-border">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pricing Calculation</span>
                    <span className={`text-xs font-black uppercase ${region.isTaxInclusive ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {region.isTaxInclusive ? 'Tax-Inclusive' : 'Tax-Exclusive'}
                    </span>
                  </div>
                </div>

                {/* HSN & SAC Codes Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Product HSN / SAC Codes Dictionary ({region.hsnSacCodes?.length || 0})
                  </h4>

                  {region.hsnSacCodes && region.hsnSacCodes.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-border border border-slate-100 dark:border-border rounded-2xl overflow-hidden text-xs">
                      {region.hsnSacCodes.map((code) => (
                        <div key={code.id} className="p-3.5 bg-slate-50/50 dark:bg-accent/20 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded-lg bg-slate-900 text-white font-mono font-black text-[10px]">
                              {code.code}
                            </span>
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-foreground block">{code.description}</span>
                              <span className="text-[10px] text-slate-400 block">{code.type} Classification</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-black text-indigo-600 dark:text-indigo-400">{code.taxRate}% Tax</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCode(region.id, code.id)}
                              className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No HSN/SAC product classification codes mapped for this region.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: REAL-TIME TAX CALCULATOR SIMULATOR */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-5 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span>Real-Time Tax Calculator</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Live Engine
                </span>
              </div>

              {/* SIMULATED INPUTS */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Target Tax Region</label>
                  <select
                    value={simRegionId}
                    onChange={(e) => setSimRegionId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs font-bold"
                  >
                    {taxRegions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.standardRate}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Item Price ({currencySymbol})</label>
                  <input
                    type="number"
                    step="10"
                    value={simItemPrice}
                    onChange={(e) => setSimItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-white font-mono font-black text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300">Tax Inclusive Pricing Mode</span>
                    <button
                      type="button"
                      onClick={() => setSimIsInclusive(!simIsInclusive)}
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        simIsInclusive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {simIsInclusive ? 'ON (Inclusive)' : 'OFF (Exclusive)'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {simIsInclusive
                      ? '✓ Tax is already included in item price. Base Price = Price / (1 + Rate/100).'
                      : '✓ Tax is calculated & added on top at checkout. Tax = Price * (Rate/100).'}
                  </p>
                </div>
              </div>

              {/* SIMULATOR TAX OUTPUT */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Standard Rate:</span>
                  <span className="font-bold text-white">{selectedSimRegion?.standardRate || 0}%</span>
                </div>

                {selectedSimRegion?.taxName === 'GST' ? (
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Intra-State CGST ({(selectedSimRegion?.standardRate || 0) / 2}%):</span>
                      <span className="font-bold text-indigo-400">{currencySymbol}{simTax.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Intra-State SGST ({(selectedSimRegion?.standardRate || 0) / 2}%):</span>
                      <span className="font-bold text-indigo-400">{currencySymbol}{simTax.sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/60">
                      <span>Inter-State IGST ({selectedSimRegion?.standardRate || 0}%):</span>
                      <span className="font-bold text-purple-400">{currencySymbol}{simTax.igst.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between text-indigo-400 font-bold border-t border-slate-800 pt-2">
                    <span>Calculated Tax:</span>
                    <span>+{currencySymbol}{simTax.taxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TAX REGION MODAL */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">{editingRegion ? 'Edit Tax Region' : 'Create Tax Region'}</h3>
              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegion} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Region Name *</label>
                <input
                  type="text"
                  required
                  value={regionForm.name}
                  onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                  placeholder="e.g. India (GST / IGST / CGST / SGST)"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tax System Name</label>
                  <select
                    value={regionForm.taxName}
                    onChange={(e) => setRegionForm({ ...regionForm, taxName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="GST">GST (Goods & Services Tax)</option>
                    <option value="VAT">VAT (Value Added Tax)</option>
                    <option value="Sales Tax">Sales Tax</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Standard Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={regionForm.standardRate}
                    onChange={(e) => setRegionForm({ ...regionForm, standardRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">GSTIN / VAT Registration ID</label>
                <input
                  type="text"
                  value={regionForm.taxNumber}
                  onChange={(e) => setRegionForm({ ...regionForm, taxNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. 27AABCU9603R1ZM"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border">
                <span className="text-xs font-extrabold text-slate-800">Prices Include Tax (Tax Inclusive)</span>
                <button
                  type="button"
                  onClick={() => setRegionForm({ ...regionForm, isTaxInclusive: !regionForm.isTaxInclusive })}
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    regionForm.isTaxInclusive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {regionForm.isTaxInclusive ? 'Inclusive' : 'Exclusive'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegionModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md"
                >
                  Save Region
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HSN / SAC CODE MODAL */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Add HSN / SAC Code Classification</h3>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCode} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Code Type</label>
                  <select
                    value={codeForm.type}
                    onChange={(e) => setCodeForm({ ...codeForm, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="HSN">HSN (Goods)</option>
                    <option value="SAC">SAC (Services)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={codeForm.taxRate}
                    onChange={(e) => setCodeForm({ ...codeForm, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">HSN / SAC Code Number *</label>
                <input
                  type="text"
                  required
                  value={codeForm.code}
                  onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value })}
                  placeholder="e.g. 61091000"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  required
                  value={codeForm.description}
                  onChange={(e) => setCodeForm({ ...codeForm, description: e.target.value })}
                  placeholder="Cotton T-Shirts & Apparel"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE B2B TAX INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 p-8 space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Official Compliant B2B / B2C Tax Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    Invoice No: INV-2026-9921
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-extrabold text-slate-900 block">OmniStore Merchant Platform</span>
                  <span className="font-mono text-slate-500 block">GSTIN: 27AABCU9603R1ZM</span>
                  <span className="text-slate-400 block">Date: {new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Customer GST Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border text-xs">
                <div>
                  <span className="font-black text-slate-500 uppercase tracking-wider block mb-1">Billed To (Customer):</span>
                  <span className="font-extrabold text-slate-900 block">Pacific Outfitter Corp</span>
                  <span className="text-slate-600 block">742 Evergreen Terrace, Springfield, IL</span>
                  <span className="font-mono text-indigo-600 block pt-1">Buyer GSTIN: {b2bBuyerGstin}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-500 uppercase tracking-wider block mb-1">Place of Supply:</span>
                  <span className="font-extrabold text-slate-900 block">Inter-State Supply (IGST)</span>
                  <span className="text-slate-600 block">Reverse Charge: Applicable (NO)</span>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-extrabold uppercase text-[10px] text-slate-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2">HSN / SAC</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Taxable Val</th>
                    <th className="py-2 text-right">IGST (18%)</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-800">
                  <tr>
                    <td className="py-3 font-bold">Studio Wireless Headphones Pro</td>
                    <td className="py-3 font-mono">85183000</td>
                    <td className="py-3 text-center">2</td>
                    <td className="py-3 text-right">{currencySymbol}200.00</td>
                    <td className="py-3 text-right">{currencySymbol}36.00</td>
                    <td className="py-3 text-right font-bold">{currencySymbol}236.00</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">Organic Cotton Brand T-Shirt</td>
                    <td className="py-3 font-mono">61091000</td>
                    <td className="py-3 text-center">1</td>
                    <td className="py-3 text-right">{currencySymbol}40.00</td>
                    <td className="py-3 text-right">{currencySymbol}4.80</td>
                    <td className="py-3 text-right font-bold">{currencySymbol}44.80</td>
                  </tr>
                </tbody>
              </table>

              {/* Tax Summary */}
              <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Total Taxable Subtotal:</span>
                    <span className="font-bold">{currencySymbol}240.00</span>
                  </div>
                  <div className="flex justify-between text-indigo-600 font-bold">
                    <span>Integrated Tax (IGST):</span>
                    <span>{currencySymbol}40.80</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t">
                    <span>Invoice Grand Total:</span>
                    <span className="text-indigo-600">{currencySymbol}280.80 {currencyCode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
