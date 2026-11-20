'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Copy,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Server,
  Lock,
  ExternalLink,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { websiteService, StoreDnsRecord as DnsRecord } from '@/src/services/websiteService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDomainUpdated?: (customDomain: string | null) => void;
}

export function DnsManagerModal({ isOpen, onClose, onDomainUpdated }: Props) {
  const [loading, setLoading] = useState(true);
  const [dnsData, setDnsData] = useState<{
    subdomain: string;
    customDomain: string | null;
    domainStatus: string;
    sslStatus: string;
    records: DnsRecord[];
    expectedNameservers: string[];
  } | null>(null);

  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isConnectingDomain, setIsConnectingDomain] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResultMsg, setVerifyResultMsg] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Add / Edit record form state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<{
    type: string;
    name: string;
    value: string;
    ttl: number;
    priority?: number;
  }>({
    type: 'CNAME',
    name: '',
    value: '',
    ttl: 3600,
    priority: 10,
  });
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  // Email presets state
  const [showEmailPresetModal, setShowEmailPresetModal] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const loadDnsState = async () => {
    try {
      setLoading(true);
      const res = await websiteService.getDnsInfo();
      setDnsData(res);
      if (res.customDomain) {
        setCustomDomainInput(res.customDomain);
      }
    } catch (err: any) {
      console.error('Failed to load DNS state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDnsState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Connect Custom Domain
  const handleConnectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomainInput.trim()) return;
    try {
      setIsConnectingDomain(true);
      const res = await websiteService.connectCustomDomain(customDomainInput.trim().toLowerCase());
      if (res) {
        await loadDnsState();
        if (onDomainUpdated) {
          onDomainUpdated(res.customDomain);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to connect custom domain');
    } finally {
      setIsConnectingDomain(false);
    }
  };

  // Remove Custom Domain
  const handleRemoveDomain = async () => {
    if (!confirm('Are you sure you want to disconnect this domain? Your storefront will revert to the default omnistore.app subdomain.')) {
      return;
    }
    try {
      setLoading(true);
      const res = await websiteService.removeCustomDomain();
      if (res) {
        setCustomDomainInput('');
        await loadDnsState();
        if (onDomainUpdated) {
          onDomainUpdated(null);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to disconnect domain');
    } finally {
      setLoading(false);
    }
  };

  // Verify DNS Propagation
  const handleVerifyDns = async (simulateSuccess = false) => {
    try {
      setIsVerifying(true);
      setVerifyResultMsg(null);
      const res = await websiteService.verifyDomainDns(simulateSuccess);
      if (res.verified) {
        setVerifyResultMsg({
          text: 'DNS nameservers and SSL certificate successfully verified! Your custom domain is now live.',
          type: 'success',
        });
        await loadDnsState();
        if (onDomainUpdated && dnsData?.customDomain) {
          onDomainUpdated(dnsData.customDomain);
        }
      } else {
        setVerifyResultMsg({
          text: `Verification pending: Expected nameservers not yet detected at registrar. Current NS: [${res.currentNameservers.join(', ') || 'None'}]. DNS propagation may take up to 24-48 hours.`,
          type: 'warning',
        });
      }
    } catch (err: any) {
      setVerifyResultMsg({
        text: err.response?.data?.message || err.message || 'Verification failed. Please check nameserver configuration.',
        type: 'error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Save Record (Create or Update)
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingRecord(true);
      if (editingRecordId) {
        await websiteService.updateDnsRecord(editingRecordId, recordForm);
      } else {
        await websiteService.addDnsRecord(recordForm);
      }
      setShowRecordModal(false);
      setEditingRecordId(null);
      setRecordForm({ type: 'CNAME', name: '', value: '', ttl: 3600, priority: 10 });
      await loadDnsState();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save record');
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this DNS record?')) return;
    try {
      await websiteService.deleteDnsRecord(recordId);
      await loadDnsState();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete record');
    }
  };

  // Apply 1-click Email Provider Preset
  const handleApplyEmailPreset = async (provider: 'google_workspace' | 'microsoft_365' | 'zoho' | 'icloud') => {
    try {
      setIsApplyingPreset(true);
      const res = await websiteService.applyEmailPreset(provider);
      if (res) {
        alert('Email preset configured successfully.');
        setShowEmailPresetModal(false);
        await loadDnsState();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to apply preset');
    } finally {
      setIsApplyingPreset(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-xs overflow-hidden text-slate-900 font-sans">
        {/* HEADER */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Domain & DNS Management</h2>
              <p className="text-[11px] text-slate-500">
                OmniStore full DNS service, custom domains, nameservers, and auto-renewing SSL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-slate-800" />
              <p className="font-semibold">Loading domain and DNS records...</p>
            </div>
          ) : (
            <>
              {/* TOP CARDS: DEFAULT SUBDOMAIN + CUSTOM DOMAIN STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Default OmniStore Subdomain */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Free Included Subdomain
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Always Active
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-mono font-bold text-slate-900 block">
                      {dnsData?.subdomain}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Zero-config platform subdomain served through global edge CDN.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`https://${dnsData?.subdomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Visit Subdomain
                    </a>
                    <button
                      onClick={() => copyToClipboard(`https://${dnsData?.subdomain}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copiedText === `https://${dnsData?.subdomain}` ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                {/* 2. Custom Domain Status */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Branded Custom Domain
                    </span>
                    {dnsData?.customDomain ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          dnsData.domainStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}
                      >
                        {dnsData.domainStatus === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active & Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> Waiting for Nameservers
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                        None Connected
                      </span>
                    )}
                  </div>

                  {dnsData?.customDomain ? (
                    <div>
                      <span className="text-sm font-bold text-slate-900 block font-mono">
                        {dnsData.customDomain}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> SSL: Let's Encrypt (Auto-renews)
                        </span>
                      </div>
                      <div className="pt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyDns(false)}
                          disabled={isVerifying}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                          <span>Verify Propagation</span>
                        </button>
                        <button
                          onClick={() => handleVerifyDns(true)}
                          disabled={isVerifying}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                          title="Simulate successful verification for demo/sandbox mode"
                        >
                          Simulate Active
                        </button>
                        <button
                          onClick={handleRemoveDomain}
                          className="px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors ml-auto cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleConnectDomain} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. yourbrand.com"
                          value={customDomainInput}
                          onChange={(e) => setCustomDomainInput(e.target.value)}
                          className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isConnectingDomain || !customDomainInput.trim()}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 whitespace-nowrap shadow-xs cursor-pointer"
                        >
                          {isConnectingDomain ? 'Connecting...' : 'Connect Domain'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Use your own domain from GoDaddy, Namecheap, Google Domains, etc.
                      </p>
                    </form>
                  )}
                </div>
              </div>

              {/* VERIFICATION FEEDBACK BANNER */}
              {verifyResultMsg && (
                <div
                  className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                    verifyResultMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : verifyResultMsg.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {verifyResultMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed font-medium">{verifyResultMsg.text}</span>
                </div>
              )}

              {/* NAMESERVERS INSTRUCTION CALLOUT */}
              {dnsData?.customDomain && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-800" />
                    <h3 className="font-bold text-slate-900 text-xs">
                      Step: Set Nameservers at Your Domain Registrar
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and replace your current nameservers with OmniStore's primary DNS cluster:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {dnsData.expectedNameservers.map((ns) => (
                      <div
                        key={ns}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs"
                      >
                        <span className="font-mono text-slate-800 font-bold text-xs">{ns}</span>
                        <button
                          onClick={() => copyToClipboard(ns)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
                          title="Copy nameserver"
                        >
                          {copiedText === ns ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DNS RECORDS MANAGEMENT TABLE */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">DNS Records</h3>
                    <p className="text-[11px] text-slate-500">
                      Manage root routing, email MX records, and domain TXT verification records.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEmailPresetModal(true)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                      <span>Email Provider Presets</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingRecordId(null);
                        setRecordForm({ type: 'CNAME', name: '', value: '', ttl: 3600, priority: 10 });
                        setShowRecordModal(true);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Record</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Value</th>
                          <th className="py-2.5 px-3">TTL</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {dnsData?.records && dnsData.records.length > 0 ? (
                          dnsData.records.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                                  {r.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-900 font-semibold">{r.name}</td>
                              <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={r.value}>
                                {r.value}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">{r.ttl}s</td>
                              <td className="py-2.5 px-3 font-sans">
                                {r.isManaged ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                                    <Lock className="w-2.5 h-2.5" /> Managed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    Custom
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-sans">
                                {r.isManaged ? (
                                  <span className="text-[10px] text-slate-400 italic">Locked</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingRecordId(r.id);
                                        setRecordForm({
                                          type: r.type,
                                          name: r.name,
                                          value: r.value,
                                          ttl: r.ttl,
                                        });
                                        setShowRecordModal(true);
                                      }}
                                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
                                      title="Edit record"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRecord(r.id)}
                                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                      title="Delete record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                              No DNS records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ADD / EDIT RECORD MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRecord}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-3.5 text-xs shadow-2xl text-slate-900 font-sans"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingRecordId ? 'Edit DNS Record' : 'Add Custom DNS Record'}
              </h3>
              <button
                type="button"
                onClick={() => setShowRecordModal(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Record Type</label>
              <select
                disabled={!!editingRecordId}
                value={recordForm.type}
                onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}
                className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:ring-1 focus:ring-slate-900"
              >
                {['A', 'CNAME', 'MX', 'TXT', 'AAAA'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Name / Host (use '@' for root)
              </label>
              <input
                type="text"
                placeholder="e.g. www, mail, @, _dmarc"
                value={recordForm.name}
                onChange={(e) => setRecordForm({ ...recordForm, name: e.target.value })}
                className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Value / Points to
              </label>
              <input
                type="text"
                placeholder={recordForm.type === 'MX' ? 'mail.protection.outlook.com' : 'e.g. 192.0.2.1 or v=spf1 ...'}
                value={recordForm.value}
                onChange={(e) => setRecordForm({ ...recordForm, value: e.target.value })}
                className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            {recordForm.type === 'MX' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">MX Priority</label>
                <input
                  type="number"
                  value={recordForm.priority || 10}
                  onChange={(e) => setRecordForm({ ...recordForm, priority: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">TTL (Time to Live)</label>
              <select
                value={recordForm.ttl}
                onChange={(e) => setRecordForm({ ...recordForm, ttl: Number(e.target.value) })}
                className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                <option value={300}>300s (5 minutes - Recommended for testing)</option>
                <option value={3600}>3600s (1 hour - Standard)</option>
                <option value={86400}>86400s (24 hours - Production)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowRecordModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingRecord}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {isSavingRecord ? 'Saving...' : editingRecordId ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 1-CLICK EMAIL PRESET MODAL */}
      {showEmailPresetModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl text-slate-900 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-800" />
                <h3 className="font-bold text-slate-900 text-sm">Select Email Provider</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPresetModal(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              Automatically configure standard MX and SPF records for your custom domain so you can receive emails without manual entry:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleApplyEmailPreset('google_workspace')}
                disabled={isApplyingPreset}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h4 className="font-bold text-slate-900">Google Workspace (Gmail)</h4>
                  <p className="text-[10px] text-slate-500">5 MX records + Google SPF TXT record</p>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
              </button>

              <button
                onClick={() => handleApplyEmailPreset('microsoft_365')}
                disabled={isApplyingPreset}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h4 className="font-bold text-slate-900">Microsoft 365 (Outlook)</h4>
                  <p className="text-[10px] text-slate-500">Outlook MX + autodiscover CNAME + SPF</p>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
              </button>

              <button
                onClick={() => handleApplyEmailPreset('zoho')}
                disabled={isApplyingPreset}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h4 className="font-bold text-slate-900">Zoho Mail</h4>
                  <p className="text-[10px] text-slate-500">3 Zoho MX records + Zoho SPF TXT</p>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
              </button>

              <button
                onClick={() => handleApplyEmailPreset('icloud')}
                disabled={isApplyingPreset}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h4 className="font-bold text-slate-900">Apple iCloud Custom Domain</h4>
                  <p className="text-[10px] text-slate-500">2 iCloud MX records + Apple SPF TXT</p>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowEmailPresetModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
