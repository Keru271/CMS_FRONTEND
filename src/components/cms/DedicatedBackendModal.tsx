'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Cpu,
  Database,
  TrendingUp,
  X,
  Check,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { websiteService, DedicatedBackendDetails } from '@/src/services/websiteService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTierChanged?: (tier: string) => void;
}

export function DedicatedBackendModal({ isOpen, onClose, onTierChanged }: Props) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<DedicatedBackendDetails | null>(null);

  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<any>(null);

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    migratedAt: string;
    steps: Array<{ step: string; title: string; durationMs: number; description: string }>;
  } | null>(null);

  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await websiteService.getDedicatedBackendDetails();
      setDetails(data);
    } catch (err: any) {
      console.error('Failed to load backend architecture:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDetails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Health Ping
  const handleHealthProbe = async () => {
    try {
      setIsProbing(true);
      const res = await websiteService.triggerHealthProbe();
      setProbeResult(res);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Health probe failed');
    } finally {
      setIsProbing(false);
    }
  };

  // 2. Zero-Downtime Data Migration
  const handleRunMigration = async () => {
    if (!confirm('Start zero-downtime database replication to your dedicated container? Store traffic will seamlessly stream without disconnects.')) {
      return;
    }
    try {
      setIsMigrating(true);
      setMigrationResult(null);
      const res = await websiteService.runZeroDowntimeMigration();
      if (res.success) {
        setMigrationResult(res as any);
        setActionSuccessMsg('Replication complete! Your dedicated backend instance is live with dual-zone failover.');
        await loadDetails();
        if (onTierChanged) {
          onTierChanged('dedicated');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Migration replication failed');
    } finally {
      setIsMigrating(false);
    }
  };

  // 3. Switch back to shared pool
  const handleRevertShared = async () => {
    if (!confirm('Revert storefront traffic to the multi-tenant shared pool?')) return;
    try {
      setLoading(true);
      const res = await websiteService.revertToSharedBackend();
      if (res) {
        setActionSuccessMsg('Storefront reverted to shared multi-tenant cluster.');
        await loadDetails();
        if (onTierChanged) {
          onTierChanged('shared');
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to revert tier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-xs overflow-hidden text-slate-900 font-sans">
        {/* HEADER */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Storefront Backend Architecture
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    details?.backendTier === 'dedicated'
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Server className="w-3 h-3" />
                  {details?.backendTier === 'dedicated' ? '⚡ Dedicated (99.99% SLA)' : 'Shared Cluster (99.9%)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Enterprise isolated container instances, automated failover, and zero-downtime replication
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
              <p className="font-semibold">Loading backend architecture details...</p>
            </div>
          ) : (
            <>
              {/* SUCCESS BANNER */}
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{actionSuccessMsg}</span>
                </div>
              )}

              {/* TIER 1: IF ON SHARED PLAN (STARTER / GROWTH / PRO) */}
              {!details?.isEligible && details?.backendTier === 'shared' && (
                <div className="space-y-5">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-2xs">
                    <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Unlock 99.99% Dedicated Backend Infrastructure
                      </h3>
                      <p className="text-slate-600 max-w-lg mx-auto text-xs mt-1 leading-relaxed">
                        Currently on <span className="text-slate-900 font-bold">{details?.storePlan}</span> plan (Shared multi-tenant pool). Upgrade to <span className="text-slate-900 font-bold">VIP Agency</span> or <span className="text-slate-900 font-bold">Enterprise Plus</span> for an isolated container, dedicated PostgreSQL database, and 10x throughput.
                      </p>
                    </div>

                    <a
                      href="/billing"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all text-xs"
                    >
                      <span>Upgrade to VIP Agency / Enterprise</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                  {/* COMPARISON MATRIX */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Current Shared Cluster
                      </span>
                      <ul className="space-y-2 text-slate-700 text-[11px]">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          <span>99.9% Uptime SLA</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          <span>Shared Compute & Memory Pool</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          <span>300 max requests/sec throughput</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                        ⚡ Dedicated Enterprise Cluster
                      </span>
                      <ul className="space-y-2 text-slate-800 text-[11px] font-medium">
                        <li className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-slate-900" />
                          <span>99.99% Uptime SLA Guarantee</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-slate-900" />
                          <span>2 Dedicated vCPUs • 4 GB Isolated RAM</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-900" />
                          <span>5,000+ req/sec (Autoscaling up to 8 pods)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-slate-900" />
                          <span>Dedicated isolated Neon database container</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TIER 2: IF ON VIP / ENTERPRISE OR ALREADY DEDICATED */}
              {(details?.isEligible || details?.backendTier === 'dedicated') && (
                <div className="space-y-6">
                  {/* OVERVIEW METRICS STRIP */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                        SLA Guarantee
                      </span>
                      <span className="text-base font-bold text-emerald-600 font-mono">
                        {details?.sla}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                        Live Uptime
                      </span>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {details?.healthMetrics.uptime}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                        Avg Latency
                      </span>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {details?.healthMetrics.avgLatency}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                        Max Capacity
                      </span>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {details?.resources.maxRps.toLocaleString()} rps
                      </span>
                    </div>
                  </div>

                  {/* INSTANCE SPECIFICATIONS CARD */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-slate-800" />
                        <h3 className="font-bold text-slate-900 text-xs">
                          Dedicated Container Infrastructure
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>{details?.instanceStatus}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Container Instance ID:</span>
                        <span className="font-mono text-slate-900 font-bold">{details?.instanceId || 'Pending'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Internal API Hostname:</span>
                        <span className="font-mono text-slate-900 truncate block">{details?.backendUrl}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Compute & Memory:</span>
                        <span className="text-slate-800 font-medium">{details?.resources.cpu} • {details?.resources.memory}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Autoscaling Architecture:</span>
                        <span className="text-slate-800 font-medium">{details?.resources.autoscaling}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Isolated Database Container:</span>
                        <span className="font-mono text-slate-700 text-[10px] truncate block">{details?.databaseHost}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Datacenter Region:</span>
                        <span className="text-slate-800 font-medium">{details?.region}</span>
                      </div>
                    </div>
                  </div>

                  {/* REAL-TIME HEALTH PROBE CARD */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-800" />
                        <h4 className="font-bold text-slate-900 text-xs">Active Health Probes & Monitoring</h4>
                      </div>
                      <button
                        onClick={handleHealthProbe}
                        disabled={isProbing}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className={`w-3 h-3 ${isProbing ? 'animate-spin' : ''}`} />
                        <span>Ping Probe Now</span>
                      </button>
                    </div>

                    {probeResult ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Status: {probeResult.httpStatus} OK ({probeResult.status})</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-medium">
                          <span>Latency: <strong className="text-slate-900 font-bold">{probeResult.latencyMs}ms</strong></span>
                          <span>CPU: {probeResult.cpuLoad}</span>
                          <span>Memory: {probeResult.memoryUsed}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Automated health probes run every 30 seconds across dual availability zones with PagerDuty auto-escalation.
                      </p>
                    )}
                  </div>

                  {/* ZERO-DOWNTIME MIGRATION TOOL */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Zero-Downtime Data Migration</h4>
                          <p className="text-[10px] text-slate-500">
                            Replicate catalog, order history, and customer tables with zero loss
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRunMigration}
                        disabled={isMigrating}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isMigrating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Replicating Tables...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Run Migration</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* MIGRATION STEPS BREAKDOWN */}
                    {migrationResult && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {migrationResult.steps.map((st) => (
                          <div
                            key={st.step}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs">{st.title}</span>
                                <span className="font-mono text-[10px] text-slate-500">{st.durationMs}ms</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{st.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTIONS */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <button
                      onClick={handleRevertShared}
                      className="text-slate-500 hover:text-slate-800 text-[11px] cursor-pointer"
                    >
                      Revert to Shared Pool (Testing)
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
