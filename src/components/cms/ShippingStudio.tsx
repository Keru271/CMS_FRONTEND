'use client';

import { SwipeToast } from '@/src/components/ui/SwipeToast';
import React, { useState, useEffect, useMemo } from 'react';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';
import {
  CMSShippingZone,
  ShippingRate,
  ShippingRateType,
  CMSShippingProvider,
  RateShoppingPolicy,
  CarrierCredential,
  CMSShipment,
  CMSNdrRecord,
} from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Truck,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  Clock,
  ExternalLink,
  ShieldCheck,
  X,
  RefreshCw,
  Calculator,
  Check,
  Search,
  Sliders,
  AppWindow,
  Send,
  Printer,
  RotateCcw,
  Phone,
  AlertTriangle,
  Zap,
  Key,
  Navigation,
  CheckCircle,
  Copy,
  Filter,
} from 'lucide-react';

export const ShippingStudio: React.FC = () => {
  // Navigation Tabs: 4 primary merchant workflows
  const [activeTab, setActiveTab] = useState<'shipments' | 'settings' | 'carriers' | 'zones'>(
    'shipments',
  );

  // Shipments Sub-tab: All Shipments vs Delivery Issues (NDR)
  const [shipmentView, setShipmentView] = useState<'all' | 'ndr'>('all');
  const [shipmentSearchQuery, setShipmentSearchQuery] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('ALL');

  // Core Data
  const [zones, setZones] = useState<CMSShippingZone[]>([]);
  const [providers, setProviders] = useState<CMSShippingProvider[]>([]);
  const [policy, setPolicy] = useState<RateShoppingPolicy>({
    priority: 'CHEAPEST',
    preferredCarrierCode: '',
    fallbackEnabled: true,
    codEnabled: true,
    codMarkupAmount: 0.0,
    freeShippingThreshold: 999.0,
    maxTransitDays: 7,
  });
  const [credentials, setCredentials] = useState<CarrierCredential[]>([]);
  const [shipments, setShipments] = useState<CMSShipment[]>([]);
  const [ndrRecords, setNdrRecords] = useState<CMSNdrRecord[]>([]);

  // Shipments Pagination
  const [shipmentPage, setShipmentPage] = useState(1);
  const [shipmentPageSize, setShipmentPageSize] = useState(10);

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Policy Save State
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Carrier Modal State
  const [editingCred, setEditingCred] = useState<CarrierCredential | null>(null);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [isSavingCred, setIsSavingCred] = useState(false);
  const [credApiKeyInput, setCredApiKeyInput] = useState('');
  const [credApiSecretInput, setCredApiSecretInput] = useState('');
  const [credSandboxInput, setCredSandboxInput] = useState(true);
  const [credActiveInput, setCredActiveInput] = useState(true);
  const [testingCarrier, setTestingCarrier] = useState<string | null>(null);

  // Manifest Shipment Modal
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [manifestOrderId, setManifestOrderId] = useState('');
  const [manifestCarrier, setManifestCarrier] = useState('');
  const [manifestServiceType, setManifestServiceType] = useState('standard');
  const [manifestWeight, setManifestWeight] = useState(0.8);
  const [isManifesting, setIsManifesting] = useState(false);

  // NDR Action Modal
  const [selectedNdr, setSelectedNdr] = useState<CMSNdrRecord | null>(null);
  const [isNdrModalOpen, setIsNdrModalOpen] = useState(false);
  const [ndrActionType, setNdrActionType] = useState<'REATTEMPT' | 'UPDATE_ADDRESS' | 'RTO'>(
    'REATTEMPT',
  );
  const [ndrRemarks, setNdrRemarks] = useState('');
  const [ndrNewPhone, setNdrNewPhone] = useState('');
  const [ndrNewAddress, setNdrNewAddress] = useState('');
  const [isSubmittingNdr, setIsSubmittingNdr] = useState(false);

  // Printable Label Modal
  const [previewLabelAwb, setPreviewLabelAwb] = useState<string | null>(null);

  // Zone & Rate Modals
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneNameInput, setZoneNameInput] = useState('');
  const [zoneCountriesInput, setZoneCountriesInput] = useState('');
  const [isSavingZone, setIsSavingZone] = useState(false);

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [isSavingRate, setIsSavingRate] = useState(false);
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
  const [simCountry, setSimCountry] = useState('India');
  const [simPincode, setSimPincode] = useState('560038');
  const [simWeightKg, setSimWeightKg] = useState(1.0);
  const [simCartSubtotal, setSimCartSubtotal] = useState(750.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Quick Tracking Lookup State
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [zoneData, providerData, policyData, credData, shipmentData, ndrData] =
        await Promise.all([
          cmsService.getShippingZones(),
          cmsService.getShippingProviders(),
          cmsService.getRateShoppingPolicy(),
          cmsService.getCarrierCredentials(),
          cmsService.getShipments(),
          cmsService.getNdrRecords(),
        ]);
      setZones(zoneData);
      setProviders(providerData);
      if (policyData) setPolicy(policyData);
      if (credData) {
        setCredentials(credData);
        if (credData.length > 0) {
          setManifestCarrier((prev) => prev || credData[0].carrierCode);
        }
      }
      if (shipmentData) setShipments(shipmentData);
      if (ndrData) setNdrRecords(ndrData);
    } catch (err) {
      console.error('Error loading shipping studio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Delivery Rules / Policy Save
  const handleSavePolicy = async () => {
    setIsSavingPolicy(true);
    try {
      const updated = await cmsService.updateRateShoppingPolicy(policy);
      setPolicy(updated);
      showToast('Delivery rules and shipping priority saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save delivery policy', 'error');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // 2. Carrier Connection Test
  const handleTestConnection = async (carrierCode: string) => {
    setTestingCarrier(carrierCode);
    try {
      const res = await cmsService.testCarrierConnection(carrierCode);
      if (res.success) {
        showToast(`✓ ${carrierCode} Connected in ${res.latencyMs}ms. Handshake successful!`);
      } else {
        showToast(`Connection failed: ${res.message}`, 'error');
      }
    } catch {
      showToast('Connection test error', 'error');
    } finally {
      setTestingCarrier(null);
    }
  };

  // 3. Save Carrier Credentials
  const handleSaveCredential = async () => {
    if (!editingCred) return;
    setIsSavingCred(true);
    try {
      await cmsService.upsertCarrierCredential({
        carrierCode: editingCred.carrierCode,
        carrierName: editingCred.carrierName,
        apiKey: credApiKeyInput,
        apiSecret: credApiSecretInput,
        sandboxMode: credSandboxInput,
        isActive: credActiveInput,
      });
      showToast(`Credentials updated for ${editingCred.carrierName}`);
      setIsCredModalOpen(false);
      const refreshed = await cmsService.getCarrierCredentials();
      setCredentials(refreshed);
    } catch {
      showToast('Failed to save credential', 'error');
    } finally {
      setIsSavingCred(false);
    }
  };

  // 4. Manifest Shipment
  const handleManifestShipment = async () => {
    if (credentials.length === 0) {
      showToast(
        'No logistics app installed. Please install a shipping app from Apps marketplace first.',
        'error',
      );
      return;
    }
    if (!manifestOrderId) {
      showToast('Please enter or select an Order ID', 'error');
      return;
    }
    const carrierToUse = manifestCarrier || credentials[0]?.carrierCode;
    if (!carrierToUse) {
      showToast('No carrier selected or available', 'error');
      return;
    }
    setIsManifesting(true);
    try {
      const res = await cmsService.createShipment({
        orderId: manifestOrderId,
        carrierCode: carrierToUse,
        serviceType: manifestServiceType,
        packageWeightKg: manifestWeight,
      });
      showToast(`✓ Manifested AWB: ${res.shipment?.awbNumber}`);
      setIsManifestModalOpen(false);
      setManifestOrderId('');
      const refreshed = await cmsService.getShipments();
      setShipments(refreshed);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to manifest shipment', 'error');
    } finally {
      setIsManifesting(false);
    }
  };

  // 5. Cancel Shipment
  const handleCancelShipment = async (id: string, awb: string) => {
    if (!confirm(`Are you sure you want to cancel shipment AWB ${awb}?`)) return;
    try {
      await cmsService.cancelShipment(id);
      showToast(`Shipment ${awb} cancelled successfully`);
      const refreshed = await cmsService.getShipments();
      setShipments(refreshed);
    } catch {
      showToast('Failed to cancel shipment', 'error');
    }
  };

  // 6. Submit NDR Action
  const handleSubmitNdr = async () => {
    if (!selectedNdr) return;
    setIsSubmittingNdr(true);
    try {
      await cmsService.triggerNdrAction(selectedNdr.id, {
        action: ndrActionType,
        remarks: ndrRemarks,
        customerPhone: ndrNewPhone || undefined,
        updatedAddress: ndrNewAddress || undefined,
      });
      showToast(`✓ NDR action "${ndrActionType}" dispatched for AWB ${selectedNdr.awbNumber}`);
      setIsNdrModalOpen(false);
      const refreshed = await cmsService.getNdrRecords();
      setNdrRecords(refreshed);
    } catch {
      showToast('Failed to process NDR action', 'error');
    } finally {
      setIsSubmittingNdr(false);
    }
  };

  // 7. Run Simulator
  const handleRunSimulator = async () => {
    setIsSimulating(true);
    try {
      const res = await cmsService.calculateShippingRates({
        country: simCountry,
        weightKg: simWeightKg,
        cartSubtotal: simCartSubtotal,
      });
      setSimResult(res);
    } catch {
      showToast('Simulation failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // 8. Track Lookup
  const handleTrackLookup = async () => {
    if (!trackingNumberInput.trim()) return;
    setIsTrackingLoading(true);
    try {
      const res = await cmsService.trackShipment(trackingNumberInput.trim(), credentials[0]?.carrierCode);
      setTrackingResult(res);
    } catch {
      showToast('Tracking query failed', 'error');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // 9. Zone & Rate Creation Handlers
  const handleSaveZone = async () => {
    if (!zoneNameInput.trim()) {
      showToast('Please enter a zone name', 'error');
      return;
    }
    setIsSavingZone(true);
    try {
      const countries = zoneCountriesInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      await cmsService.createShippingZone({
        name: zoneNameInput.trim(),
        countries: countries.length > 0 ? countries : ['United States'],
        rates: [],
      });
      showToast('Shipping zone created successfully');
      setIsZoneModalOpen(false);
      setZoneNameInput('');
      setZoneCountriesInput('');
      const refreshed = await cmsService.getShippingZones();
      setZones(refreshed);
    } catch {
      showToast('Failed to create zone', 'error');
    } finally {
      setIsSavingZone(false);
    }
  };

  const handleSaveRate = async () => {
    if (!activeZoneId) return;
    setIsSavingRate(true);
    try {
      const targetZone = zones.find((z) => z.id === activeZoneId);
      if (targetZone) {
        const newRate: ShippingRate = {
          id: `sr-${Date.now()}`,
          name: rateForm.name,
          type: rateForm.type,
          price: rateForm.price,
          minDeliveryDays: rateForm.minDeliveryDays,
          maxDeliveryDays: rateForm.maxDeliveryDays,
          minWeightKg: rateForm.minWeightKg,
          maxWeightKg: rateForm.maxWeightKg,
          minOrderPrice: rateForm.minOrderPrice,
          maxOrderPrice: rateForm.maxOrderPrice,
        };
        await cmsService.updateShippingZone(activeZoneId, {
          rates: [...targetZone.rates, newRate],
        });
        showToast('Rate tier added successfully');
        setIsRateModalOpen(false);
        const refreshed = await cmsService.getShippingZones();
        setZones(refreshed);
      }
    } catch {
      showToast('Failed to add rate tier', 'error');
    } finally {
      setIsSavingRate(false);
    }
  };

  // Computed Metrics
  const pendingNdrRecords = useMemo(
    () => ndrRecords.filter((r) => r.ndrStatus === 'PENDING'),
    [ndrRecords],
  );
  const pendingNdrCount = pendingNdrRecords.length;

  const inTransitCount = useMemo(
    () =>
      shipments.filter(
        (s) => s.trackingStatus !== 'DELIVERED' && s.trackingStatus !== 'CANCELLED',
      ).length,
    [shipments],
  );

  const deliveredCount = useMemo(
    () => shipments.filter((s) => s.trackingStatus === 'DELIVERED').length,
    [shipments],
  );

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch =
        !shipmentSearchQuery.trim() ||
        s.awbNumber.toLowerCase().includes(shipmentSearchQuery.toLowerCase()) ||
        s.orderNumber.toLowerCase().includes(shipmentSearchQuery.toLowerCase()) ||
        (s.destinationCity || '').toLowerCase().includes(shipmentSearchQuery.toLowerCase());

      const matchesStatus =
        shipmentStatusFilter === 'ALL' ||
        (shipmentStatusFilter === 'IN_TRANSIT' &&
          s.trackingStatus !== 'DELIVERED' &&
          s.trackingStatus !== 'CANCELLED') ||
        s.trackingStatus === shipmentStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, shipmentSearchQuery, shipmentStatusFilter]);

  const pagedShipments = useMemo(() => {
    const start = (shipmentPage - 1) * shipmentPageSize;
    return filteredShipments.slice(start, start + shipmentPageSize);
  }, [filteredShipments, shipmentPage, shipmentPageSize]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <SwipeToast
          open={!!toastMessage}
          type={toastMessage.type}
          title={toastMessage.type === 'success' ? 'Success' : 'Error'}
          description={toastMessage.text}
          onClose={() => setToastMessage(null)}
          duration={4000}
        />
      )}

      {/* ─── STREAMLINED HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Shipping & Delivery
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200/60 dark:border-indigo-800/60">
                Fulfillment Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage delivery rules, live package tracking, carrier dispatches, and delivery exceptions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/apps"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <AppWindow className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Shipping Apps</span>
          </a>
          <button
            onClick={() => setIsManifestModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Manifest Shipment
          </button>
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Refresh All Logistics Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── 4 CLEAN NAVIGATION TABS ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
        {[
          {
            id: 'shipments',
            label: 'Shipments & Tracking',
            icon: Package,
            badge: shipments.length > 0 ? `${shipments.length}` : undefined,
            alertBadge: pendingNdrCount > 0 ? `${pendingNdrCount} Issues` : undefined,
          },
          {
            id: 'settings',
            label: 'Delivery Rules & COD',
            icon: Sliders,
            badge:
              policy.priority === 'CHEAPEST'
                ? 'Lowest Cost'
                : policy.priority === 'FASTEST'
                  ? 'Fastest'
                  : 'Preferred',
          },
          {
            id: 'carriers',
            label: 'Logistics Partners',
            icon: Key,
            badge:
              credentials.length > 0
                ? `${credentials.filter((c) => c.isActive).length} Active`
                : '0 Connected',
          },
          {
            id: 'zones',
            label: 'Custom Zones & Testing',
            icon: Globe,
            badge: `${zones.length} Zones`,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${isActive
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.alertBadge ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-white animate-pulse">
                  {tab.alertBadge}
                </span>
              ) : tab.badge ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: SHIPMENTS & TRACKING HUB ─────────────────────────────── */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Total Shipments</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {shipments.length}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">All-time dispatched</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">In Transit</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {inTransitCount}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Currently on route</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Delivered</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {deliveredCount}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Successfully handed over</span>
            </div>

            <div
              onClick={() => setShipmentView('ndr')}
              className={`p-5 rounded-3xl border transition cursor-pointer ${pendingNdrCount > 0
                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
                }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${pendingNdrCount > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-500'}`}
                >
                  Delivery Issues (NDR)
                </span>
                {pendingNdrCount > 0 && <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />}
              </div>
              <p
                className={`text-2xl font-black mt-1 ${pendingNdrCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}
              >
                {pendingNdrCount}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {pendingNdrCount > 0 ? 'Action required immediately' : 'Zero exceptions'}
              </span>
            </div>
          </div>

          {/* Quick Tracking Search Bar */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-600" />
                  Quick Package Tracker
                </h3>
                <p className="text-[11px] text-slate-500">
                  Instant real-time milestone query across all integrated courier networks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-72">
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="Enter AWB or Tracking #"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleTrackLookup}
                  disabled={isTrackingLoading || !trackingNumberInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isTrackingLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Track</span>
                </button>
              </div>
            </div>

            {/* Tracking Result Card */}
            {trackingResult && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                      {trackingResult.trackingNumber}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                      {trackingResult.carrier || 'Courier'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      {trackingResult.status || 'IN_TRANSIT'}
                    </span>
                    <button
                      onClick={() => setTrackingResult(null)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative pl-6 space-y-4 pt-2 before:absolute before:left-2 before:top-4 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {(trackingResult.events || []).map((ev: any, i: number) => (
                    <div key={i} className="relative">
                      <div
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${ev.completed ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                      />
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </h5>
                      <span className="text-[11px] text-slate-500 block">{ev.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Segmented View Switcher: All Shipments vs Delivery Issues (NDR) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setShipmentView('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${shipmentView === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                  All Shipments ({shipments.length})
                </button>
                <button
                  onClick={() => setShipmentView('ndr')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${shipmentView === 'ndr'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                  <span>Delivery Exceptions</span>
                  {pendingNdrCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black">
                      {pendingNdrCount}
                    </span>
                  )}
                </button>
              </div>

              {shipmentView === 'all' && (
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={shipmentSearchQuery}
                      onChange={(e) => {
                        setShipmentSearchQuery(e.target.value);
                        setShipmentPage(1);
                      }}
                      placeholder="Search AWB, order, city..."
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <select
                    value={shipmentStatusFilter}
                    onChange={(e) => {
                      setShipmentStatusFilter(e.target.value);
                      setShipmentPage(1);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  >
                    <option value="ALL">All Status</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <TableRefreshButton onRefresh={loadAllData} isLoading={isLoading} size="sm" />
                </div>
              )}
            </div>

            {/* VIEW A: All Shipments Table */}
            {shipmentView === 'all' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-6">AWB Tracking #</th>
                        <th className="py-3 px-6">Order</th>
                        <th className="py-3 px-6">Carrier Partner</th>
                        <th className="py-3 px-6">Destination</th>
                        <th className="py-3 px-6">Cost / COD</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pagedShipments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                            No shipments found matching filters.
                          </td>
                        </tr>
                      ) : (
                        pagedShipments.map((s) => {
                          const isCancelled = s.trackingStatus === 'CANCELLED';
                          const isDelivered = s.trackingStatus === 'DELIVERED';
                          return (
                            <tr
                              key={s.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition"
                            >
                              <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                                {s.awbNumber}
                              </td>
                              <td className="py-4 px-6 font-semibold text-indigo-600">
                                {s.orderNumber}
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  {s.carrierName}
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase">
                                  {s.serviceName || s.serviceType}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-slate-800 dark:text-slate-200 block font-semibold">
                                  {s.destinationCity || 'Metro Hub'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  PIN: {s.destinationPincode || '—'}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  ₹{s.shippingCost.toFixed(2)}
                                </span>
                                {s.isCod && (
                                  <span className="text-[10px] text-amber-600 font-bold">
                                    COD: ₹{s.codAmount.toFixed(2)}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${isDelivered
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                    : isCancelled
                                      ? 'bg-slate-100 text-slate-500'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 animate-pulse'
                                    }`}
                                >
                                  {s.trackingStatus}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right space-x-2">
                                <button
                                  onClick={() => setPreviewLabelAwb(s.awbNumber)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Label
                                </button>
                                {!isCancelled && !isDelivered && (
                                  <button
                                    onClick={() => handleCancelShipment(s.id, s.awbNumber)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" /> Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={shipmentPage}
                  totalItems={filteredShipments.length}
                  pageSize={shipmentPageSize}
                  onPageChange={(p) => setShipmentPage(p)}
                  onPageSizeChange={(s) => {
                    setShipmentPageSize(s);
                    setShipmentPage(1);
                  }}
                  itemName="shipments"
                />
              </div>
            )}

            {/* VIEW B: Delivery Exceptions (NDR) */}
            {shipmentView === 'ndr' && (
              <div>
                {ndrRecords.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold text-xs">
                    🎉 Excellent! No delivery exceptions or failed parcel deliveries.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ndrRecords.map((record) => (
                      <div
                        key={record.id}
                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                              {record.awbNumber}
                            </span>
                            <span className="text-xs font-semibold text-indigo-600">
                              {record.orderNumber}
                            </span>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Attempt #{record.attemptCount} Failed
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                            Reason: {record.failureReason}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />{' '}
                              {record.customerPhone || 'No phone provided'}
                            </span>
                            <span>Courier: {record.carrierName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => {
                              setSelectedNdr(record);
                              setNdrActionType('REATTEMPT');
                              setNdrRemarks('Customer requested reattempt tomorrow afternoon');
                              setIsNdrModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reattempt Delivery
                          </button>

                          <button
                            onClick={() => {
                              setSelectedNdr(record);
                              setNdrActionType('UPDATE_ADDRESS');
                              setNdrNewPhone(record.customerPhone || '');
                              setIsNdrModalOpen(true);
                            }}
                            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                          >
                            Update Contact
                          </button>

                          <button
                            onClick={() => {
                              setSelectedNdr(record);
                              setNdrActionType('RTO');
                              setNdrRemarks('Customer permanently refused package');
                              setIsNdrModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Initiate RTO
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: DELIVERY RULES & COD PRICING ──────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Strategy Selector */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Courier Selection Strategy
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              How the platform automatically chooses which courier partner handles each order
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setPolicy({ ...policy, priority: 'CHEAPEST' })}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between ${policy.priority === 'CHEAPEST'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                      Lowest Cost
                    </span>
                    {policy.priority === 'CHEAPEST' && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cheapest Courier First
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Compares quotes across all serviceable couriers and auto-selects the lowest price to maximize your margins.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setPolicy({ ...policy, priority: 'FASTEST' })}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between ${policy.priority === 'FASTEST'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                      Express Speed
                    </span>
                    {policy.priority === 'FASTEST' && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Fastest Delivery First
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Prioritizes Air Express and Same-Day delivery services (1-2 business days) for time-critical orders.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setPolicy({ ...policy, priority: 'PREFERRED' })}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between ${policy.priority === 'PREFERRED'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                      Contract Primary
                    </span>
                    {policy.priority === 'PREFERRED' && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Preferred Partner First
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Routes orders preferentially to your selected primary courier (e.g. Shiprocket) when serviceable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Configuration Fields */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Store Delivery Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Preferred Courier Partner
                </label>
                <select
                  value={policy.preferredCarrierCode || ''}
                  onChange={(e) => setPolicy({ ...policy, preferredCarrierCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                  disabled={credentials.length === 0}
                >
                  {credentials.length === 0 ? (
                    <option value="">No logistics apps installed</option>
                  ) : (
                    credentials.map((c) => (
                      <option key={c.carrierCode} value={c.carrierCode}>
                        {c.carrierName} ({c.carrierCode})
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Active primary partner when using Preferred strategy
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Free Shipping Minimum (₹)
                </label>
                <input
                  type="number"
                  value={policy.freeShippingThreshold}
                  onChange={(e) =>
                    setPolicy({ ...policy, freeShippingThreshold: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Orders equal or above this cart value get free standard shipping.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Cash on Delivery (COD) Fee (₹)
                </label>
                <input
                  type="number"
                  value={policy.codMarkupAmount}
                  onChange={(e) =>
                    setPolicy({ ...policy, codMarkupAmount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Additional handling charge added when buyer chooses COD.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="cb-fallback"
                  checked={policy.fallbackEnabled}
                  onChange={(e) => setPolicy({ ...policy, fallbackEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="cb-fallback"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Zero-Downtime Fallback Protection
                  <span className="block text-[11px] font-normal text-slate-500">
                    If live courier APIs time out, checkout automatically falls back to default zone rates.
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="cb-cod"
                  checked={policy.codEnabled}
                  onChange={(e) => setPolicy({ ...policy, codEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="cb-cod"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Pincode COD Verification
                  <span className="block text-[11px] font-normal text-slate-500">
                    Verifies whether customer postal code accepts COD prior to payment selection.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSavePolicy}
                disabled={isSavingPolicy}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingPolicy ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Delivery Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: LOGISTICS PARTNERS (CARRIERS) ─────────────────────────── */}
      {activeTab === 'carriers' && (
        <div className="space-y-6">
          {credentials.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-10 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
                <AppWindow className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Logistics Apps Connected
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                Connect your logistics partner (like Shiprocket or Delhivery) through the Apps Marketplace to enable automatic label creation, rate negotiation, and live tracking.
              </p>
              <div className="mt-6 flex justify-center">
                <a
                  href="/apps?category=SHIPPING"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-500/20"
                >
                  <AppWindow className="w-4 h-4" />
                  Install Logistics App in Apps Marketplace
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {credentials.map((cred) => {
                const isTesting = testingCarrier === cred.carrierCode;
                return (
                  <div
                    key={cred.id || cred.carrierCode}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {cred.carrierCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${cred.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500'
                              }`}
                          >
                            {cred.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {cred.carrierName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-mono truncate">
                        {cred.endpointUrl || 'https://api.carrier.com'}
                      </p>

                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>API Status:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {cred.apiKey ? 'Configured' : 'Credentials Linked'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Environment:</span>
                          <span className="font-semibold text-indigo-600">
                            {cred.sandboxMode ? 'Sandbox Simulator' : 'Production Live'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTestConnection(cred.carrierCode)}
                        disabled={isTesting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Zap
                          className={`w-3.5 h-3.5 text-amber-500 ${isTesting ? 'animate-spin' : ''}`}
                        />
                        {isTesting ? 'Pinging...' : 'Test Ping'}
                      </button>

                      <a
                        href="/apps"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition hover:opacity-90"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Manage in Apps
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: CUSTOM ZONES & TESTING ────────────────────────────────── */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Regional Zones */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  Regional Shipping Zones
                </h3>
                <p className="text-xs text-slate-500">
                  Fallback flat rates and SLA tiers for manual or offline fulfillment
                </p>
              </div>
              <button
                onClick={() => {
                  setZoneNameInput('');
                  setZoneCountriesInput('');
                  setIsZoneModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Zone
              </button>
            </div>

            <div className="space-y-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {zone.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{zone.countries.join(', ')}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveZoneId(zone.id);
                        setIsRateModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    >
                      + Add Rate Tier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {zone.rates.map((rate) => (
                      <div
                        key={rate.id}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-xs"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {rate.name}
                        </span>
                        <span className="font-black text-emerald-600">
                          {rate.type === 'FREE' ? 'FREE' : `₹${rate.price.toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Rate Simulator */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-500" />
                Live Rate Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate how the platform computes shipping rates for any customer cart and destination
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Destination Country
                </label>
                <select
                  value={simCountry}
                  onChange={(e) => setSimCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                >
                  <option value="India">India (Pan-India)</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    PIN / Postal Code
                  </label>
                  <input
                    type="text"
                    value={simPincode}
                    onChange={(e) => setSimPincode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Package Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={simWeightKg}
                    onChange={(e) => setSimWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Order Subtotal (₹)
                </label>
                <input
                  type="number"
                  value={simCartSubtotal}
                  onChange={(e) => setSimCartSubtotal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <button
                onClick={handleRunSimulator}
                disabled={isSimulating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isSimulating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                Calculate Shipping Rate
              </button>

              {simResult && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Matched: {simResult.matchedZoneName}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold text-[10px]">
                      Lowest: ₹{simResult.cheapestRate || 50}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANIFEST SHIPMENT ─────────────────────────────────────── */}
      {isManifestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                Manifest New Order Shipment
              </h3>
              <button
                onClick={() => setIsManifestModalOpen(false)}
                disabled={isManifesting}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Order Number or UUID
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-1004"
                  value={manifestOrderId}
                  onChange={(e) => setManifestOrderId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Logistics Carrier Partner
                </label>
                <select
                  value={manifestCarrier}
                  onChange={(e) => setManifestCarrier(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                >
                  {credentials.map((c) => (
                    <option key={c.carrierCode} value={c.carrierCode}>
                      {c.carrierName} ({c.carrierCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Service Type
                  </label>
                  <select
                    value={manifestServiceType}
                    onChange={(e) => setManifestServiceType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  >
                    <option value="standard">Standard Surface</option>
                    <option value="express">Air Express</option>
                    <option value="same-day">Hyperlocal Same-Day</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Package Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={manifestWeight}
                    onChange={(e) => setManifestWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsManifestModalOpen(false)}
                disabled={isManifesting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleManifestShipment}
                disabled={isManifesting || credentials.length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isManifesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Generate AWB & Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: NDR ACTION TRIGGER ────────────────────────────────────── */}
      {isNdrModalOpen && selectedNdr && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Resolve Delivery Exception
              </h3>
              <button
                onClick={() => setIsNdrModalOpen(false)}
                disabled={isSubmittingNdr}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-800 dark:text-rose-200 space-y-1">
                <span className="font-bold block">AWB: {selectedNdr.awbNumber}</span>
                <span>Failure Reason: {selectedNdr.failureReason}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Resolution Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['REATTEMPT', 'UPDATE_ADDRESS', 'RTO'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNdrActionType(type)}
                      className={`py-2 px-1 text-center rounded-xl font-bold text-[11px] border transition cursor-pointer ${ndrActionType === type
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                    >
                      {type === 'REATTEMPT' ? 'Reattempt' : type === 'UPDATE_ADDRESS' ? 'New Contact' : 'Return (RTO)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Instructions for Courier Rider
                </label>
                <input
                  type="text"
                  value={ndrRemarks}
                  onChange={(e) => setNdrRemarks(e.target.value)}
                  placeholder="e.g. Customer is available post 4 PM"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsNdrModalOpen(false)}
                disabled={isSubmittingNdr}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNdr}
                disabled={isSubmittingNdr}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmittingNdr ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  'Dispatch Action to Carrier'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PRINTABLE SHIPPING LABEL PREVIEW ──────────────────────── */}
      {previewLabelAwb && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl text-slate-900 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-xs font-black tracking-wider uppercase">
                Official Shipping Label
              </span>
              <button
                onClick={() => setPreviewLabelAwb(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-2 border-black rounded-xl space-y-3 font-mono text-center">
              <div className="text-lg font-black tracking-widest border-b pb-1">OMNISTORE SHIPPING</div>
              <div className="text-left text-xs space-y-1">
                <div>
                  <strong>SHIP TO:</strong> Customer Delivery
                </div>
                <div>Indiranagar, 100ft Road</div>
                <div>Bengaluru, Karnataka - 560038</div>
                <div>PH: +91 98402 18921</div>
              </div>

              <div className="py-3 border-y-2 border-dashed space-y-1">
                <div className="text-sm font-black tracking-widest">{previewLabelAwb}</div>
                {/* Simulated Barcode */}
                <div className="h-10 bg-slate-900 flex items-center justify-around px-2">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full ${i % 2 === 0 ? 'w-1 bg-white' : 'w-0.5 bg-black'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-[10px]">
                <span>ROUTING: HUB-MAIN</span>
                <span>STANDARD SURFACE</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD SHIPPING ZONE ─────────────────────────────────────── */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                Add Shipping Zone
              </h3>
              <button
                onClick={() => setIsZoneModalOpen(false)}
                disabled={isSavingZone}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Domestic Metro, European Union"
                  value={zoneNameInput}
                  onChange={(e) => setZoneNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Countries (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. India, United States, Canada"
                  value={zoneCountriesInput}
                  onChange={(e) => setZoneCountriesInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsZoneModalOpen(false)}
                disabled={isSavingZone}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveZone}
                disabled={isSavingZone}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingZone ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Zone'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD RATE TIER ─────────────────────────────────────────── */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                Add Shipping Rate Slab
              </h3>
              <button
                onClick={() => setIsRateModalOpen(false)}
                disabled={isSavingRate}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Rate Option Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard Surface Delivery"
                  value={rateForm.name}
                  onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Rate Type
                  </label>
                  <select
                    value={rateForm.type}
                    onChange={(e) => setRateForm({ ...rateForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  >
                    <option value="FLAT">Flat Price</option>
                    <option value="FREE">Free Shipping</option>
                    <option value="WEIGHT_BASED">Weight-based</option>
                    <option value="PRICE_BASED">Price-tiered</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Shipping Price (₹)
                  </label>
                  <input
                    type="number"
                    value={rateForm.price}
                    onChange={(e) => setRateForm({ ...rateForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Min Delivery Days
                  </label>
                  <input
                    type="number"
                    value={rateForm.minDeliveryDays}
                    onChange={(e) =>
                      setRateForm({ ...rateForm, minDeliveryDays: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Max Delivery Days
                  </label>
                  <input
                    type="number"
                    value={rateForm.maxDeliveryDays}
                    onChange={(e) =>
                      setRateForm({ ...rateForm, maxDeliveryDays: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsRateModalOpen(false)}
                disabled={isSavingRate}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRate}
                disabled={isSavingRate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingRate ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Rate Tier'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
