'use client';

import React, { useState, useEffect } from 'react';
import { CMSShippingZone, ShippingRate, ShippingRateType, CMSShippingProvider } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Truck,
  Globe,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  DollarSign,
  Scale,
  Clock,
  ExternalLink,
  ShieldCheck,
  X,
  RefreshCw,
  Calculator,
  Layers,
  MapPin,
  Check,
  Search,
  Settings,
} from 'lucide-react';

export const ShippingStudio: React.FC = () => {
  const [zones, setZones] = useState<CMSShippingZone[]>([]);
  const [providers, setProviders] = useState<CMSShippingProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Zone Modal
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<CMSShippingZone | null>(null);
  const [zoneNameInput, setZoneNameInput] = useState('');
  const [zoneCountriesInput, setZoneCountriesInput] = useState('');

  // Rate Modal
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);

  const [rateForm, setRateForm] = useState<{
    name: string;
    type: ShippingRateType;
    price: number;
    minDeliveryDays: number;
    maxDeliveryDays: number;
    minWeightKg: number;
    maxWeightKg: number;
    minOrderPrice: number;
    maxOrderPrice: number;
  }>({
    name: 'Standard Ground Shipping',
    type: 'FLAT',
    price: 5.99,
    minDeliveryDays: 3,
    maxDeliveryDays: 5,
    minWeightKg: 0,
    maxWeightKg: 5,
    minOrderPrice: 0,
    maxOrderPrice: 100,
  });

  // Simulator State
  const [simCountry, setSimCountry] = useState('United States');
  const [simWeightKg, setSimWeightKg] = useState(1.5);
  const [simCartSubtotal, setSimCartSubtotal] = useState(65.0);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [zoneData, providerData] = await Promise.all([
        cmsService.getShippingZones(),
        cmsService.getShippingProviders(),
      ]);
      setZones(zoneData);
      setProviders(providerData);
    } catch (err) {
      console.error('Failed to load shipping data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ZONE CRUD
  const handleOpenCreateZone = () => {
    setEditingZone(null);
    setZoneNameInput('');
    setZoneCountriesInput('United States, Puerto Rico');
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZone = (z: CMSShippingZone) => {
    setEditingZone(z);
    setZoneNameInput(z.name);
    setZoneCountriesInput(z.countries.join(', '));
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const countriesList = zoneCountriesInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      if (editingZone) {
        await cmsService.updateShippingZone(editingZone.id, {
          name: zoneNameInput,
          countries: countriesList,
        });
        showToast(`Shipping Zone "${zoneNameInput}" updated!`, 'success');
      } else {
        await cmsService.createShippingZone({
          name: zoneNameInput,
          countries: countriesList,
        });
        showToast(`New Shipping Zone "${zoneNameInput}" created!`, 'success');
      }

      setIsZoneModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save zone.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteZone = async (id: string) => {
    try {
      setIsSaving(true);
      await cmsService.deleteShippingZone(id);
      showToast('Shipping zone deleted.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete zone.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // RATE CRUD
  const handleOpenAddRate = (zoneId: string) => {
    setActiveZoneId(zoneId);
    setEditingRate(null);
    setRateForm({
      name: 'Standard Ground Shipping',
      type: 'FLAT',
      price: 5.99,
      minDeliveryDays: 3,
      maxDeliveryDays: 5,
      minWeightKg: 0,
      maxWeightKg: 5,
      minOrderPrice: 0,
      maxOrderPrice: 100,
    });
    setIsRateModalOpen(true);
  };

  const handleOpenEditRate = (zoneId: string, rate: ShippingRate) => {
    setActiveZoneId(zoneId);
    setEditingRate(rate);
    setRateForm({
      name: rate.name,
      type: rate.type as ShippingRateType,
      price: rate.price,
      minDeliveryDays: rate.minDeliveryDays,
      maxDeliveryDays: rate.maxDeliveryDays,
      minWeightKg: rate.minWeightKg || 0,
      maxWeightKg: rate.maxWeightKg || 5,
      minOrderPrice: rate.minOrderPrice || 0,
      maxOrderPrice: rate.maxOrderPrice || 100,
    });
    setIsRateModalOpen(true);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeZoneId) return;
    setIsSaving(true);
    try {
      const zone = zones.find((z) => z.id === activeZoneId);
      if (!zone) return;

      const newRateItem: ShippingRate = {
        id: editingRate ? editingRate.id : `sr-${Date.now()}`,
        name: rateForm.name,
        type: rateForm.type,
        price: rateForm.type === 'FREE' ? 0 : Number(rateForm.price),
        minDeliveryDays: Number(rateForm.minDeliveryDays),
        maxDeliveryDays: Number(rateForm.maxDeliveryDays),
        minWeightKg: rateForm.type === 'WEIGHT_BASED' ? Number(rateForm.minWeightKg) : undefined,
        maxWeightKg: rateForm.type === 'WEIGHT_BASED' ? Number(rateForm.maxWeightKg) : undefined,
        minOrderPrice: rateForm.type === 'FREE' || rateForm.type === 'PRICE_BASED' ? Number(rateForm.minOrderPrice) : undefined,
        maxOrderPrice: rateForm.type === 'PRICE_BASED' ? Number(rateForm.maxOrderPrice) : undefined,
      };

      let updatedRates: ShippingRate[];
      if (editingRate) {
        updatedRates = zone.rates.map((r) => (r.id === editingRate.id ? newRateItem : r));
      } else {
        updatedRates = [...zone.rates, newRateItem];
      }

      await cmsService.updateShippingZone(activeZoneId, { rates: updatedRates });
      showToast(`Rate "${rateForm.name}" saved!`, 'success');
      setIsRateModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save rate.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRate = async (zoneId: string, rateId: string) => {
    try {
      setIsSaving(true);
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;

      const filteredRates = zone.rates.filter((r) => r.id !== rateId);
      await cmsService.updateShippingZone(zoneId, { rates: filteredRates });
      showToast('Shipping rate removed.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove rate.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // PROVIDER TOGGLE
  const handleToggleProvider = async (p: CMSShippingProvider) => {
    try {
      setIsSaving(true);
      const updated = await cmsService.updateShippingProvider(p.id, { isActive: !p.isActive });
      showToast(`Courier carrier "${updated.name}" ${updated.isActive ? 'activated' : 'deactivated'}.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update provider.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // CALCULATE SIMULATOR RATES
  const calculateSimulatedRates = () => {
    const matchingZone = zones.find((z) =>
      z.countries.some((c) => c.toLowerCase().includes(simCountry.toLowerCase()))
    ) || zones[0];

    if (!matchingZone) return [];

    return matchingZone.rates.filter((r) => {
      if (r.type === 'FREE') {
        return r.minOrderPrice ? simCartSubtotal >= r.minOrderPrice : true;
      }
      if (r.type === 'WEIGHT_BASED') {
        const minW = r.minWeightKg || 0;
        const maxW = r.maxWeightKg || 999;
        return simWeightKg >= minW && simWeightKg <= maxW;
      }
      if (r.type === 'PRICE_BASED') {
        const minP = r.minOrderPrice || 0;
        const maxP = r.maxOrderPrice || 99999;
        return simCartSubtotal >= minP && simCartSubtotal <= maxP;
      }
      return true; // FLAT
    });
  };

  const simRates = calculateSimulatedRates();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Shipping & Logistics Studio...</span>
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
                Fulfillment & Logistics
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {zones.length} Shipping Zones Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Truck className="w-8 h-8 text-indigo-400" />
              <span>Shipping & Logistics Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Configure regional shipping zones, flat-rate fees, free shipping thresholds, weight-based tiers, price-based rules, delivery timeframe estimates, and carrier tracking links.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateZone}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shipping Zone</span>
          </button>
        </div>
      </div>

      {/* COURIER PROVIDER CARRIERS BAR */}
      <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-black text-base text-slate-900 dark:text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Courier Providers & Carrier Tracking</span>
            </h3>
            <p className="text-xs text-slate-500">Enable shipping carrier integrations and automatic tracking link generation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                p.isActive
                  ? 'bg-slate-50 dark:bg-accent/50 border-indigo-200 dark:border-indigo-900/50'
                  : 'bg-slate-100 dark:bg-accent/20 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <span className="font-extrabold text-xs text-slate-900 dark:text-foreground block">{p.name}</span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block">{p.carrierCode}</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleProvider(p)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  p.isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {p.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN GRID: SHIPPING ZONES + REAL-TIME CALCULATOR SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SHIPPING ZONES CARDS */}
        <div className="lg:col-span-8 space-y-6">
          {zones.map((z) => (
            <div
              key={z.id}
              className="p-6 rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-5"
            >
              {/* Zone Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-black text-lg text-slate-900 dark:text-foreground">{z.name}</h2>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {z.countries.map((c, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-accent text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAddRate(z.id)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-accent hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditZone(z)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteZone(z.id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-accent text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rates List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Configured Shipping Rates ({z.rates.length})</h4>
                <div className="divide-y divide-slate-100 dark:divide-border border border-slate-100 dark:border-border rounded-2xl overflow-hidden">
                  {z.rates.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-50/50 dark:bg-accent/20 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-foreground">{r.name}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              r.type === 'FREE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.type === 'WEIGHT_BASED'
                                ? 'bg-purple-100 text-purple-800'
                                : r.type === 'PRICE_BASED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            {r.minDeliveryDays} - {r.maxDeliveryDays} business days
                          </span>

                          {r.type === 'WEIGHT_BASED' && (
                            <span className="flex items-center gap-1 font-mono text-purple-600">
                              <Scale className="w-3 h-3" />
                              {r.minWeightKg}kg - {r.maxWeightKg}kg
                            </span>
                          )}

                          {r.type === 'FREE' && r.minOrderPrice ? (
                            <span className="font-bold text-emerald-600">Min Cart: ${r.minOrderPrice.toFixed(2)}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-black text-base text-slate-900 dark:text-foreground">
                          {r.price === 0 ? 'FREE' : `$${r.price.toFixed(2)}`}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRate(z.id, r)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRate(z.id, r.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: REAL-TIME CHECKOUT SHIPPING RATE CALCULATOR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Checkout Shipping Calculator</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Live Simulator
              </span>
            </div>

            {/* SIMULATED INPUTS */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Destination Country</label>
                <select
                  value={simCountry}
                  onChange={(e) => setSimCountry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-white text-xs font-bold"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Mexico">Mexico</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Cart Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simWeightKg}
                    onChange={(e) => setSimWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono font-bold text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Order Subtotal ($)</label>
                  <input
                    type="number"
                    step="10"
                    value={simCartSubtotal}
                    onChange={(e) => setSimCartSubtotal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* CALCULATOR RESULTS */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Available Shipping Options ({simRates.length})
              </h4>

              <div className="space-y-2">
                {simRates.length === 0 ? (
                  <p className="text-xs text-amber-400 font-semibold italic">No matching rates found for specified weight/price.</p>
                ) : (
                  simRates.map((sr) => (
                    <div key={sr.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-white block">{sr.name}</span>
                        <span className="text-[10px] text-slate-400 block">{sr.minDeliveryDays}-{sr.maxDeliveryDays} Days</span>
                      </div>
                      <span className="font-black text-xs text-emerald-400">
                        {sr.price === 0 ? 'FREE' : `$${sr.price.toFixed(2)}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT ZONE MODAL */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">{editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}</h3>
              <button
                type="button"
                onClick={() => setIsZoneModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={zoneNameInput}
                  onChange={(e) => setZoneNameInput(e.target.value)}
                  placeholder="e.g. Domestic - United States"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Assigned Countries (comma-separated)</label>
                <textarea
                  rows={3}
                  required
                  value={zoneCountriesInput}
                  onChange={(e) => setZoneCountriesInput(e.target.value)}
                  placeholder="United States, Puerto Rico, Canada, Mexico"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT RATE MODAL */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">{editingRate ? 'Edit Shipping Rate' : 'Add Shipping Rate'}</h3>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Rate Name *</label>
                <input
                  type="text"
                  required
                  value={rateForm.name}
                  onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                  placeholder="Standard Ground Shipping"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Calculation Type</label>
                  <select
                    value={rateForm.type}
                    onChange={(e) => setRateForm({ ...rateForm, type: e.target.value as ShippingRateType })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="FLAT">FLAT RATE</option>
                    <option value="FREE">FREE SHIPPING</option>
                    <option value="WEIGHT_BASED">WEIGHT BASED</option>
                    <option value="PRICE_BASED">PRICE BASED</option>
                  </select>
                </div>

                {rateForm.type !== 'FREE' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Shipping Price ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={rateForm.price}
                      onChange={(e) => setRateForm({ ...rateForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-indigo-600"
                    />
                  </div>
                )}
              </div>

              {/* DELIVERY ESTIMATES */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Min Business Days</label>
                  <input
                    type="number"
                    min={1}
                    value={rateForm.minDeliveryDays}
                    onChange={(e) => setRateForm({ ...rateForm, minDeliveryDays: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Max Business Days</label>
                  <input
                    type="number"
                    min={1}
                    value={rateForm.maxDeliveryDays}
                    onChange={(e) => setRateForm({ ...rateForm, maxDeliveryDays: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>
              </div>

              {/* DYNAMIC WEIGHT / PRICE TIERS */}
              {rateForm.type === 'WEIGHT_BASED' && (
                <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-purple-900">Min Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rateForm.minWeightKg}
                      onChange={(e) => setRateForm({ ...rateForm, minWeightKg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-purple-900">Max Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rateForm.maxWeightKg}
                      onChange={(e) => setRateForm({ ...rateForm, maxWeightKg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {(rateForm.type === 'FREE' || rateForm.type === 'PRICE_BASED') && (
                <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <label className="block text-[11px] font-bold text-emerald-900">Min Cart Order Price Trigger ($)</label>
                  <input
                    type="number"
                    step="5"
                    value={rateForm.minOrderPrice}
                    onChange={(e) => setRateForm({ ...rateForm, minOrderPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-emerald-200 bg-white text-xs font-bold text-emerald-700"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md"
                >
                  Save Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
