'use client';

import React, { useState, useEffect } from 'react';
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
  Navigation,
  CheckCircle,
  Radio,
  ArrowRight,
  Zap,
  Key,
  FileText,
  AlertTriangle,
  RotateCcw,
  Phone,
  Send,
  Printer,
  Sliders,
} from 'lucide-react';

export const ShippingStudio: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'rateshopping' | 'carriers' | 'shipments' | 'ndr' | 'zones' | 'simulator'>('rateshopping');

  // Core Data
  const [zones, setZones] = useState<CMSShippingZone[]>([]);
  const [providers, setProviders] = useState<CMSShippingProvider[]>([]);
  const [policy, setPolicy] = useState<RateShoppingPolicy>({
    priority: 'CHEAPEST',
    preferredCarrierCode: 'SHIPROCKET',
    fallbackEnabled: true,
    codEnabled: true,
    codMarkupAmount: 0.0,
    freeShippingThreshold: 999.0,
    maxTransitDays: 7,
  });
  const [credentials, setCredentials] = useState<CarrierCredential[]>([]);
  const [shipments, setShipments] = useState<CMSShipment[]>([]);
  const [ndrRecords, setNdrRecords] = useState<CMSNdrRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Policy Save State
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Carrier Modal State
  const [editingCred, setEditingCred] = useState<CarrierCredential | null>(null);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [credApiKeyInput, setCredApiKeyInput] = useState('');
  const [credApiSecretInput, setCredApiSecretInput] = useState('');
  const [credSandboxInput, setCredSandboxInput] = useState(true);
  const [credActiveInput, setCredActiveInput] = useState(true);
  const [testingCarrier, setTestingCarrier] = useState<string | null>(null);

  // Manifest Shipment Modal
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [manifestOrderId, setManifestOrderId] = useState('');
  const [manifestCarrier, setManifestCarrier] = useState('SHIPROCKET');
  const [manifestServiceType, setManifestServiceType] = useState('standard');
  const [manifestWeight, setManifestWeight] = useState(0.8);
  const [isManifesting, setIsManifesting] = useState(false);

  // NDR Action Modal
  const [selectedNdr, setSelectedNdr] = useState<CMSNdrRecord | null>(null);
  const [isNdrModalOpen, setIsNdrModalOpen] = useState(false);
  const [ndrActionType, setNdrActionType] = useState<'REATTEMPT' | 'UPDATE_ADDRESS' | 'RTO'>('REATTEMPT');
  const [ndrRemarks, setNdrRemarks] = useState('');
  const [ndrNewPhone, setNdrNewPhone] = useState('');
  const [ndrNewAddress, setNdrNewAddress] = useState('');
  const [isSubmittingNdr, setIsSubmittingNdr] = useState(false);

  // Printable Label Modal
  const [previewLabelAwb, setPreviewLabelAwb] = useState<string | null>(null);

  // Zone & Rate Modals
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<CMSShippingZone | null>(null);
  const [zoneNameInput, setZoneNameInput] = useState('');
  const [zoneCountriesInput, setZoneCountriesInput] = useState('');

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
  const [simCountry, setSimCountry] = useState('India');
  const [simPincode, setSimPincode] = useState('560038');
  const [simWeightKg, setSimWeightKg] = useState(1.0);
  const [simCartSubtotal, setSimCartSubtotal] = useState(750.0);
  const [simIsCod, setSimIsCod] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Tracking Lookup State
  const [trackingNumberInput, setTrackingNumberInput] = useState('SR84920194IN');
  const [selectedCarrier, setSelectedCarrier] = useState('SHIPROCKET');
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
      const [zoneData, providerData, policyData, credData, shipmentData, ndrData] = await Promise.all([
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
      if (credData) setCredentials(credData);
      if (shipmentData) setShipments(shipmentData);
      if (ndrData) setNdrRecords(ndrData);
    } catch (err) {
      console.error('Error loading shipping studio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Rate Shopping Policy Save
  const handleSavePolicy = async () => {
    setIsSavingPolicy(true);
    try {
      const updated = await cmsService.updateRateShoppingPolicy(policy);
      setPolicy(updated);
      showToast('Rate shopping priority & policy rules saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save policy', 'error');
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
    } catch (err: any) {
      showToast('Connection test error', 'error');
    } finally {
      setTestingCarrier(null);
    }
  };

  // 3. Save Carrier Credentials
  const handleSaveCredential = async () => {
    if (!editingCred) return;
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
    } catch (err: any) {
      showToast('Failed to save credential', 'error');
    }
  };

  // 4. Manifest Shipment
  const handleManifestShipment = async () => {
    if (!manifestOrderId) {
      showToast('Please enter or select an Order ID', 'error');
      return;
    }
    setIsManifesting(true);
    try {
      const res = await cmsService.createShipment({
        orderId: manifestOrderId,
        carrierCode: manifestCarrier,
        serviceType: manifestServiceType,
        packageWeightKg: manifestWeight,
      });
      showToast(`✓ Manifested AWB: ${res.shipment?.awbNumber}`);
      setIsManifestModalOpen(false);
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      showToast('Simulation failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // 8. Track Lookup
  const handleTrackLookup = async () => {
    if (!trackingNumberInput) return;
    setIsTrackingLoading(true);
    try {
      const res = await cmsService.trackShipment(trackingNumberInput, selectedCarrier);
      setTrackingResult(res);
    } catch (err) {
      showToast('Tracking query failed', 'error');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : 'bg-rose-950/90 text-rose-200 border-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Nexus Shipping Integration
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  Enterprise Logistics
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Carrier-agnostic abstraction layer with live rate shopping, aggregator routing, and NDR management.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManifestModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Manifest New Shipment
          </button>
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-800"
            title="Refresh All Logistics Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
        {[
          { id: 'rateshopping', label: 'Rate-Shopping Policy', icon: Sliders, badge: policy.priority },
          { id: 'carriers', label: 'Carrier Integrations', icon: Key, badge: `${credentials.filter((c) => c.isActive).length} Active` },
          { id: 'shipments', label: 'Live Shipments', icon: Package, badge: shipments.length.toString() },
          { id: 'ndr', label: 'NDR Dashboard', icon: AlertTriangle, badge: `${ndrRecords.filter((r) => r.ndrStatus === 'PENDING').length} Action Required`, alert: ndrRecords.some((r) => r.ndrStatus === 'PENDING') },
          { id: 'zones', label: 'Shipping Zones & Rates', icon: Globe, badge: `${zones.length} Zones` },
          { id: 'simulator', label: 'Live Rate & Tracking Simulator', icon: Calculator },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                      : tab.alert
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: RATE-SHOPPING POLICY ──────────────────────────────────── */}
      {activeTab === 'rateshopping' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Priority Strategy */}
            <div
              onClick={() => setPolicy({ ...policy, priority: 'CHEAPEST' })}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between ${
                policy.priority === 'CHEAPEST'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Maximum Margin
                  </span>
                  {policy.priority === 'CHEAPEST' && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Cheapest Carrier First</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Orchestrator queries all serviceable couriers in parallel and automatically ranks the lowest cost quote first.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Recommended for standard eCommerce & bulk merchandise
              </div>
            </div>

            <div
              onClick={() => setPolicy({ ...policy, priority: 'FASTEST' })}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between ${
                policy.priority === 'FASTEST'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Highest Speed
                  </span>
                  {policy.priority === 'FASTEST' && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Fastest Delivery First</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Prioritizes Air Express / Same-Day Hyperlocal couriers with the shortest transit time (1-2 business days).
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Recommended for premium electronics, perishables & VIP clients
              </div>
            </div>

            <div
              onClick={() => setPolicy({ ...policy, priority: 'PREFERRED' })}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between ${
                policy.priority === 'PREFERRED'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Contract Loyalty
                  </span>
                  {policy.priority === 'PREFERRED' && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Merchant-Preferred Carrier</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Routes orders preferentially to your contract carrier (e.g. Delhivery Direct or Shiprocket) when serviceable.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Recommended if you have negotiated volume commitments
              </div>
            </div>
          </div>

          {/* Policy Settings Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Routing Rules & Guardrails
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Preferred Courier Partner
                </label>
                <select
                  value={policy.preferredCarrierCode}
                  onChange={(e) => setPolicy({ ...policy, preferredCarrierCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="SHIPROCKET">Shiprocket Aggregator (Multi-Courier)</option>
                  <option value="DELHIVERY">Delhivery Direct Enterprise</option>
                  <option value="BLUEDART">Blue Dart Air Express</option>
                  <option value="INDIAPOST">India Post Speed Post</option>
                  <option value="EASYPOST">EasyPost (FedEx/UPS/DHL Global)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Free Shipping Minimum Threshold (₹ / $)
                </label>
                <input
                  type="number"
                  value={policy.freeShippingThreshold}
                  onChange={(e) => setPolicy({ ...policy, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Orders above this amount get free standard shipping.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  COD (Cash on Delivery) Handling Fee (₹)
                </label>
                <input
                  type="number"
                  value={policy.codMarkupAmount}
                  onChange={(e) => setPolicy({ ...policy, codMarkupAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Added to shipping cost when customer selects COD payment.</span>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="cb-fallback"
                  checked={policy.fallbackEnabled}
                  onChange={(e) => setPolicy({ ...policy, fallbackEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="cb-fallback" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Zero-Downtime Zone Fallback
                  <span className="block text-[11px] font-normal text-slate-500">
                    If live courier APIs time out, seamlessly fall back to merchant default zone rates so checkout never crashes.
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="cb-cod"
                  checked={policy.codEnabled}
                  onChange={(e) => setPolicy({ ...policy, codEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="cb-cod" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Enable COD Verification at Checkout
                  <span className="block text-[11px] font-normal text-slate-500">
                    Pincode COD serviceability is verified upfront before showing the COD payment option.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSavePolicy}
                disabled={isSavingPolicy}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition disabled:opacity-60"
              >
                {isSavingPolicy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Policy Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CARRIER INTEGRATIONS ──────────────────────────────────── */}
      {activeTab === 'carriers' && (
        <div className="space-y-6">
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
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          cred.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cred.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{cred.carrierName}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono truncate">{cred.endpointUrl || 'https://api.carrier.com'}</p>

                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>API Key:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{cred.apiKey || 'Not configured'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Account #:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{cred.accountNumber || '—'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Environment:</span>
                        <span className="font-semibold text-indigo-600">{cred.sandboxMode ? 'Sandbox Simulator' : 'Production Live'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTestConnection(cred.carrierCode)}
                      disabled={isTesting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                    >
                      <Zap className={`w-3.5 h-3.5 text-amber-500 ${isTesting ? 'animate-spin' : ''}`} />
                      {isTesting ? 'Pinging...' : 'Test Ping'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingCred(cred);
                        setCredApiKeyInput(cred.apiKey || '');
                        setCredApiSecretInput(cred.apiSecret || '');
                        setCredSandboxInput(cred.sandboxMode);
                        setCredActiveInput(cred.isActive);
                        setIsCredModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition hover:opacity-90"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Keys
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: LIVE SHIPMENTS & MANIFESTATION ─────────────────────────── */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Carrier Shipments</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Normalized shipment records across all integrated couriers with tracking status and labels.
                </p>
              </div>
              <button
                onClick={() => setIsManifestModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" /> Manifest Shipment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-6">AWB / Tracking #</th>
                    <th className="py-3 px-6">Order</th>
                    <th className="py-3 px-6">Carrier / Partner</th>
                    <th className="py-3 px-6">Destination</th>
                    <th className="py-3 px-6">Cost / COD</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {shipments.map((s) => {
                    const isCancelled = s.trackingStatus === 'CANCELLED';
                    const isDelivered = s.trackingStatus === 'DELIVERED';
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                          {s.awbNumber}
                        </td>
                        <td className="py-4 px-6 font-semibold text-indigo-600">
                          {s.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{s.carrierName}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{s.serviceName || s.serviceType}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-slate-800 dark:text-slate-200 block font-semibold">{s.destinationCity || 'Metro Hub'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">PIN: {s.destinationPincode || '—'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 dark:text-white block">₹{s.shippingCost.toFixed(2)}</span>
                          {s.isCod && (
                            <span className="text-[10px] text-amber-600 font-bold">COD: ₹{s.codAmount.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              isDelivered
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                          >
                            <Printer className="w-3.5 h-3.5" /> Label
                          </button>
                          {!isCancelled && !isDelivered && (
                            <button
                              onClick={() => handleCancelShipment(s.id, s.awbNumber)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: NDR (NON-DELIVERY REPORTS) DASHBOARD ──────────────────── */}
      {activeTab === 'ndr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Pending Actions</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {ndrRecords.filter((r) => r.ndrStatus === 'PENDING').length}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Reattempts Scheduled</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {ndrRecords.filter((r) => r.ndrStatus === 'REATTEMPT_REQUESTED').length}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Resolved / Delivered</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {ndrRecords.filter((r) => r.ndrStatus === 'RESOLVED').length}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-500">RTO Initiated</span>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {ndrRecords.filter((r) => r.ndrStatus === 'RTO_REQUESTED').length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                First-Attempt Failure Management (NDR Action Center)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Indian courier networks experience 15-30% first-attempt delivery failures. Resolve them here before RTO occurs.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {ndrRecords.map((record) => (
                <div key={record.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{record.awbNumber}</span>
                      <span className="text-xs font-semibold text-indigo-600">{record.orderNumber}</span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        Attempt #{record.attemptCount} Failed
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Reason: {record.failureReason}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {record.customerPhone || 'No phone provided'}
                      </span>
                      <span>Courier: {record.carrierName}</span>
                      <span>Last Attempt: {new Date(record.lastAttemptAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
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
                      className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition"
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
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition"
                    >
                      Initiate RTO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: ZONES & RATES ─────────────────────────────────────────── */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Regional Shipping Zones</h3>
              <p className="text-xs text-slate-500">Define fallback price slabs and delivery SLAs per country cluster.</p>
            </div>
            <button
              onClick={() => {
                setEditingZone(null);
                setZoneNameInput('');
                setZoneCountriesInput('');
                setIsZoneModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Shipping Zone
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{zone.name}</h4>
                      <p className="text-xs text-slate-500">{zone.countries.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveZoneId(zone.id);
                        setEditingRate(null);
                        setIsRateModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Rate Tier
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {zone.rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{rate.name}</span>
                          <span className="text-xs font-black text-emerald-600">
                            {rate.type === 'FREE' ? 'FREE' : `$${rate.price.toFixed(2)}`}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Delivery: {rate.minDeliveryDays} - {rate.maxDeliveryDays} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 6: SIMULATOR & TRACKING ──────────────────────────────────── */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rate & Serviceability Simulator */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-500" />
                Live Rate & Serviceability Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Simulate checkout queries against live rate-shopping orchestrator and postal code databases.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Destination Country
                </label>
                <select
                  value={simCountry}
                  onChange={(e) => setSimCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="India">India (Domestic Pan-India)</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United Arab Emirates">United Arab Emirates (GCC)</option>
                  <option value="Germany">Germany (EU)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    PIN / Postal Code
                  </label>
                  <input
                    type="text"
                    value={simPincode}
                    onChange={(e) => setSimPincode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={simWeightKg}
                    onChange={(e) => setSimWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Order Subtotal
                  </label>
                  <input
                    type="number"
                    value={simCartSubtotal}
                    onChange={(e) => setSimCartSubtotal(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="sim-cod"
                    checked={simIsCod}
                    onChange={(e) => setSimIsCod(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <label htmlFor="sim-cod" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    COD Requested
                  </label>
                </div>
              </div>

              <button
                onClick={handleRunSimulator}
                disabled={isSimulating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Run Rate Shopping Query
              </button>
            </div>

            {simResult && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Matched Zone: {simResult.matchedZoneName}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-extrabold text-[10px]">
                    Cheapest: ${simResult.cheapestRate || 5.99}
                  </span>
                </div>
                <div className="space-y-2">
                  {(simResult.eligibleRates || []).map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-slate-200">{r.name}</span>
                        <span className="text-[10px] text-slate-500">{r.estimatedDays}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {r.price === 0 ? 'FREE' : `$${r.price}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tracking Milestone Simulator */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-500" />
                Live Tracking Milestone Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lookup any live AWB or test consignment across Shiprocket, Delhivery, or FedEx.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                placeholder="Enter AWB or Tracking #"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
              />
              <button
                onClick={handleTrackLookup}
                disabled={isTrackingLoading}
                className="px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                {isTrackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track
              </button>
            </div>

            {trackingResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {trackingResult.carrier || selectedCarrier}
                    </h4>
                    <p className="font-mono text-sm font-black text-slate-900 dark:text-white">
                      {trackingResult.trackingNumber}
                    </p>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                    {trackingResult.status || 'IN_TRANSIT'}
                  </span>
                </div>

                {/* Milestone Stepper */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {(trackingResult.events || []).map((ev: any, i: number) => (
                    <div key={i} className="relative">
                      <div
                        className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                          ev.completed ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ev.title}</h5>
                      <span className="text-[11px] text-slate-500 block">{ev.location}</span>
                      {ev.timestamp && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(ev.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT CARRIER CREDENTIALS ──────────────────────────────── */}
      {isCredModalOpen && editingCred && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" />
                Configure {editingCred.carrierName}
              </h3>
              <button onClick={() => setIsCredModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">API Key / Token</label>
                <input
                  type="password"
                  value={credApiKeyInput}
                  onChange={(e) => setCredApiKeyInput(e.target.value)}
                  placeholder="Enter carrier API token"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">API Secret / Client Secret</label>
                <input
                  type="password"
                  value={credApiSecretInput}
                  onChange={(e) => setCredApiSecretInput(e.target.value)}
                  placeholder="Enter carrier API secret"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="cred-sandbox"
                  checked={credSandboxInput}
                  onChange={(e) => setCredSandboxInput(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="cred-sandbox" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Sandbox Simulation Mode
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cred-active"
                  checked={credActiveInput}
                  onChange={(e) => setCredActiveInput(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="cred-active" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Enable in Rate-Shopping Pool
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsCredModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCredential}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Save Credentials
              </button>
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
                Manifest Order to Carrier
              </h3>
              <button onClick={() => setIsManifestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Order</label>
                <input
                  type="text"
                  value={manifestOrderId}
                  onChange={(e) => setManifestOrderId(e.target.value)}
                  placeholder="Paste Order ID or Order Number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Carrier Provider</label>
                <select
                  value={manifestCarrier}
                  onChange={(e) => setManifestCarrier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                >
                  <option value="SHIPROCKET">Shiprocket (Multi-Courier Aggregator)</option>
                  <option value="DELHIVERY">Delhivery Direct Express</option>
                  <option value="INDIAPOST">India Post Speed Post</option>
                  <option value="EASYPOST">EasyPost (FedEx/DHL/UPS)</option>
                  <option value="DHL">DHL Express Worldwide</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Service Type</label>
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
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Package Weight (kg)</label>
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleManifestShipment}
                disabled={isManifesting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                {isManifesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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
                Resolve Delivery Failure (AWB {selectedNdr.awbNumber})
              </h3>
              <button onClick={() => setIsNdrModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                <span className="font-bold block">Carrier Failure Remark:</span>
                <span>{selectedNdr.failureReason}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Action to Take</label>
                <select
                  value={ndrActionType}
                  onChange={(e) => setNdrActionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                >
                  <option value="REATTEMPT">Schedule Courier Reattempt (Tomorrow)</option>
                  <option value="UPDATE_ADDRESS">Update Customer Phone & Address</option>
                  <option value="RTO">Initiate Return to Origin (RTO)</option>
                </select>
              </div>

              {ndrActionType === 'UPDATE_ADDRESS' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer Phone</label>
                    <input
                      type="text"
                      value={ndrNewPhone}
                      onChange={(e) => setNdrNewPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Corrected Address</label>
                    <textarea
                      rows={2}
                      value={ndrNewAddress}
                      onChange={(e) => setNdrNewAddress(e.target.value)}
                      placeholder="Updated Landmark, Gate #, or Street"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Instructions for Courier Rider</label>
                <input
                  type="text"
                  value={ndrRemarks}
                  onChange={(e) => setNdrRemarks(e.target.value)}
                  placeholder="e.g. Call before delivery, customer is available post 4 PM"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsNdrModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNdr}
                disabled={isSubmittingNdr}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {isSubmittingNdr ? 'Transmitting...' : 'Dispatch Action to Carrier'}
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
              <span className="text-xs font-black tracking-wider uppercase">Official Shipping Label</span>
              <button onClick={() => setPreviewLabelAwb(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-2 border-black rounded-xl space-y-3 font-mono text-center">
              <div className="text-lg font-black tracking-widest border-b pb-1">NEXUS COMMERCE</div>
              <div className="text-left text-xs space-y-1">
                <div><strong>SHIP TO:</strong> Valued Customer</div>
                <div>Indiranagar, 100ft Road</div>
                <div>Bengaluru, Karnataka - 560038</div>
                <div>PH: +91 98402 18921</div>
              </div>

              <div className="py-3 border-y-2 border-dashed space-y-1">
                <div className="text-sm font-black tracking-widest">{previewLabelAwb}</div>
                {/* Barcode Simulator */}
                <div className="h-10 bg-slate-900 flex items-center justify-around px-2">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className={`h-full ${i % 2 === 0 ? 'w-1 bg-white' : 'w-0.5 bg-black'}`} />
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-[10px]">
                <span>ROUTING: BLR / GATEWAY-01</span>
                <span>STANDARD SURFACE</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
