'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'shopify'>('excel');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    sourceFormat: string;
    totalRows: number;
    productsCount: number;
    validCount: number;
    invalidCount: number;
    existingSkuCount: number;
    products: any[];
  } | null>(null);

  const [duplicateStrategy, setDuplicateStrategy] = useState<'UPDATE' | 'SKIP'>('UPDATE');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) => selectedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);
    setImportResult(null);
    setIsLoadingPreview(true);

    try {
      const format = activeTab === 'shopify' ? 'shopify' : 'standard';
      const preview = await cmsService.previewProductImport(selectedFile, format);
      setPreviewData(preview);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to parse file. Please verify file format.');
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await cmsService.downloadProductImportTemplate();
    } catch (err) {
      console.error('Failed to download template:', err);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewData || previewData.products.length === 0) return;

    setIsImporting(true);
    setErrorMessage(null);

    try {
      const result = await cmsService.batchImportProducts(
        previewData.products,
        duplicateStrategy
      );
      setImportResult(result);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to complete batch import.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-accent/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                Import Products Catalog
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                  Bulk Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import products directly from standard Excel sheets or Shopify CSV exports.
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

        {/* Source Selection Tabs */}
        {!importResult && (
          <div className="flex border-b border-slate-200 dark:border-border px-6 pt-3 gap-4 bg-slate-50/30 dark:bg-card">
            <button
              type="button"
              onClick={() => {
                setActiveTab('excel');
                handleReset();
              }}
              className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'excel'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Standard Excel / CSV Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('shopify');
                handleReset();
              }}
              className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'shopify'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shopify Store Export (CSV)</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[9px]">
                Auto-Mapped
              </span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success State */}
          {importResult ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-foreground">
                  Products Imported Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {importResult.message}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {importResult.createdCount}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">Created New</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">
                    {importResult.updatedCount}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">Updated Existing</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent border border-slate-200 dark:border-border">
                  <span className="block text-2xl font-black text-slate-600 dark:text-slate-300">
                    {importResult.skippedCount}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">Skipped</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-border text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-accent transition-all"
                >
                  Import Another File
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                >
                  Done & View Catalog
                </button>
              </div>
            </div>
          ) : !previewData ? (
            /* Upload Zone State */
            <div className="space-y-5">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-card hover:border-indigo-400 hover:bg-indigo-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7" />
                </div>

                <p className="text-sm font-extrabold text-slate-800 dark:text-foreground text-center">
                  {activeTab === 'shopify'
                    ? 'Upload Shopify Product Export CSV'
                    : 'Upload Products Excel / CSV Spreadsheet'}
                </p>
                <p className="text-xs text-slate-400 mt-1 text-center">
                  Drag and drop your file here, or click to browse. Supports .xlsx, .xls, and .csv files.
                </p>

                {isLoadingPreview && (
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing spreadsheet columns and validating rows…</span>
                  </div>
                )}
              </div>

              {/* Template Download & Help Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-accent border border-slate-200 dark:border-border">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Need the formatted column template with sample data?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-accent transition-all shadow-sm shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download Sample Template (.xlsx)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Preview & Confirm State */
            <div className="space-y-5">
              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">{file?.name}</span>
                      <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-mono font-bold">
                        {previewData.sourceFormat}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {previewData.productsCount} products parsed from {previewData.totalRows} raw rows
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    ✓ {previewData.validCount} Valid
                  </span>
                  {previewData.invalidCount > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                      ⚠ {previewData.invalidCount} Invalid
                    </span>
                  )}
                  {previewData.existingSkuCount > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                      ⟳ {previewData.existingSkuCount} Existing SKU Matches
                    </span>
                  )}
                </div>
              </div>

              {/* Duplicate Strategy Option */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent border border-slate-200 dark:border-border space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-foreground">
                  Duplicate SKU Handling:
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      checked={duplicateStrategy === 'UPDATE'}
                      onChange={() => setDuplicateStrategy('UPDATE')}
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="font-bold">Update existing products</span> (Overwrites price, inventory & details)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      checked={duplicateStrategy === 'SKIP'}
                      onChange={() => setDuplicateStrategy('SKIP')}
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="font-bold">Skip duplicates</span> (Keep existing products unchanged)
                  </label>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-200 dark:border-border rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-accent sticky top-0 border-b border-slate-200 dark:border-border text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Stock</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Brand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewData.products.slice(0, 50).map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-accent/40 transition-colors">
                        <td className="py-2 px-3">
                          {p.isExisting ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold">
                              Existing
                            </span>
                          ) : p.isValid ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                              New
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold">
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-foreground">
                          {p.name}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                          {p.sku || '—'}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-foreground">
                          ${p.price?.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                          {p.inventory}
                        </td>
                        <td className="py-2 px-3 text-slate-500">
                          {p.categoryName || 'General'}
                        </td>
                        <td className="py-2 px-3 text-slate-500">
                          {p.brandName || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.products.length > 50 && (
                <p className="text-[11px] text-slate-400 text-center">
                  Showing first 50 rows of {previewData.products.length} total products.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!importResult && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card">
            <button
              type="button"
              onClick={previewData ? handleReset : onClose}
              disabled={isImporting}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-accent transition-all"
            >
              {previewData ? 'Choose Another File' : 'Cancel'}
            </button>

            {previewData && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting || previewData.validCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing Products ({previewData.products.length})…</span>
                  </>
                ) : (
                  <>
                    <span>Execute Import ({previewData.validCount} Items)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
