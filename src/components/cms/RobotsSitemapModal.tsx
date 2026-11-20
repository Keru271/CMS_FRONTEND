'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Globe,
  ExternalLink,
  Copy,
  Check,
  X,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Sliders,
} from 'lucide-react';
import { websiteService } from '@/src/services/websiteService';

interface RobotsSitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainUrl: string;
}

export function RobotsSitemapModal({ isOpen, onClose, domainUrl }: RobotsSitemapModalProps) {
  const [loading, setLoading] = useState(true);
  const [robotsTxt, setRobotsTxt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const sitemapUrl = `https://${domainUrl}/sitemap.xml`;

  const loadRobots = async () => {
    try {
      setLoading(true);
      const res = await websiteService.getRobotsTxt();
      setRobotsTxt(res.robotsTxt);
    } catch (err: any) {
      console.error('Failed to load robots.txt:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRobots();
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(sitemapUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveRobots = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSuccessMsg('');
      await websiteService.updateRobotsTxt(robotsTxt);
      setSuccessMsg('Robots.txt saved and committed to GitHub! Deployed to Netlify.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update robots.txt');
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (presetType: 'standard' | 'allow_all' | 'block_ai') => {
    if (presetType === 'standard') {
      setRobotsTxt(`# OmniStore Standard E-Commerce Robots.txt
User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /account
Disallow: /api/

Sitemap: ${sitemapUrl}
`);
    } else if (presetType === 'allow_all') {
      setRobotsTxt(`# OmniStore Public Robots.txt
User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`);
    } else if (presetType === 'block_ai') {
      setRobotsTxt(`# OmniStore Search-Only (Block AI Web Crawlers)
User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout

# Block AI scrapers from indexing proprietary storefront products
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

Sitemap: ${sitemapUrl}
`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-xs overflow-hidden text-slate-900 font-sans">
        {/* HEADER */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Search Engine Crawlers & Sitemap</h3>
              <p className="text-[11px] text-slate-500">
                Manage automated sitemap.xml indexing and custom robots.txt crawler rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
          {/* SITEMAP CARD */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs">Automated XML Sitemap</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Synced on Edit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every published page, product catalog, and custom route is dynamically assembled into a standards-compliant XML sitemap for Google Search Console, Bing Webmaster, and search crawlers.
            </p>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-mono text-slate-800 font-semibold text-xs truncate max-w-sm">
                {sitemapUrl}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopySitemap}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
                <a
                  href={sitemapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open XML</span>
                </a>
              </div>
            </div>
          </div>

          {/* ROBOTS.TXT EDITOR */}
          <form onSubmit={handleSaveRobots} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-slate-800" /> Robots.txt Crawler Directives
                </h4>
                <p className="text-[10px] text-slate-500">
                  Controls which directories search bots and AI crawlers are permitted to access.
                </p>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('standard')}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-200 cursor-pointer"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('block_ai')}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-200 cursor-pointer"
                >
                  Block AI Scrapers
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('allow_all')}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-200 cursor-pointer"
                >
                  Allow All
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full p-3 bg-white font-mono text-xs rounded-xl border border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none resize-none leading-relaxed shadow-2xs"
              required
            />

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying robots.txt...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Deploy Rules</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
