'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Filter,
  Package,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';

interface ProductExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalProductsCount: number;
  filteredProductsCount: number;
  currentFilters?: {
    status?: string;
    category?: string;
    search?: string;
  };
}

export const ProductExportModal: React.FC<ProductExportModalProps> = ({
  isOpen,
  onClose,
  totalProductsCount,
  filteredProductsCount,
  currentFilters,
}) => {
  const [exportFormat, setExportFormat] = useState<'standard' | 'shopify'>('standard');
  const [scope, setScope] = useState<'all' | 'filtered'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const params: any = { format: exportFormat };

      if (scope === 'filtered' && currentFilters) {
        if (currentFilters.status && currentFilters.status !== 'ALL') {
          params.status = currentFilters.status;
        }
        if (currentFilters.category && currentFilters.category !== 'ALL') {
          params.category = currentFilters.category;
        }
        if (currentFilters.search) {
          params.search = currentFilters.search;
        }
      }

      await cmsService.exportProductsExcel(params);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to export products:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-accent/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-foreground">
                Export Products Catalog
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and download formatted Excel spreadsheets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Choose Export Format:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setExportFormat('standard')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  exportFormat === 'standard'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-border hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet className={`w-4 h-4 ${exportFormat === 'standard' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-foreground">
                    Standard Excel (.xlsx)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Complete catalog with all metadata, pricing, inventory & tags.
                </p>
              </div>

              <div
                onClick={() => setExportFormat('shopify')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  exportFormat === 'shopify'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-border hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className={`w-4 h-4 ${exportFormat === 'shopify' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-foreground">
                    Shopify CSV Format
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Shopify-compliant column layout ready for direct Shopify imports.
                </p>
              </div>
            </div>
          </div>

          {/* Scope Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Export Scope:
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/60 dark:bg-card cursor-pointer hover:bg-slate-100/60 transition-all">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-foreground block">
                      All Catalog Products
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Export all {totalProductsCount} products currently in the database
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                  {totalProductsCount} items
                </span>
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/60 dark:bg-card cursor-pointer hover:bg-slate-100/60 transition-all">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'filtered'}
                    onChange={() => setScope('filtered')}
                    className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-foreground block">
                      Current Filtered View
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Export active search and category filters only
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                  {filteredProductsCount} items
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-accent transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Workbook…</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Spreadsheet (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
