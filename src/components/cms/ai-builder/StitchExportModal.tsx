'use client';

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Package,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { StitchScreenData, ClaymorphicThemeConfig } from './ClaymorphicScreenRenderer';

interface StitchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  screens: StitchScreenData[];
  theme: ClaymorphicThemeConfig;
}

export function StitchExportModal({
  isOpen,
  onClose,
  projectTitle,
  screens,
  theme,
}: StitchExportModalProps) {
  const [activeTab, setActiveTab] = useState<'nextjs' | 'html' | 'tokens'>('nextjs');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateTokensJson = () => {
    return JSON.stringify(
      {
        project: projectTitle,
        screensCount: screens.length,
        style: 'DOUGH TIME Claymorphic',
        theme,
        screens: screens.map((s) => ({
          number: s.number,
          title: s.title,
          type: s.type,
        })),
      },
      null,
      2
    );
  };

  const generateHtmlBundle = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: ${theme.canvasBg}; color: ${theme.textColor}; font-family: '${theme.fontFamily}', sans-serif; }
    .clay-card {
      background-color: ${theme.cardBg};
      border-radius: ${theme.borderRadius}px;
      box-shadow: 6px 6px ${theme.shadowSoftness}px rgba(160, 168, 148, ${theme.shadowIntensity}), -6px -6px ${theme.shadowSoftness}px rgba(255, 255, 255, 0.95);
    }
  </style>
</head>
<body class="p-8">
  <h1 class="text-3xl font-bold mb-4">${projectTitle}</h1>
  <p class="text-sm opacity-70 mb-8">${screens.length} Screens Generated with OmniStore AI Vision</p>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    ${screens
      .map(
        (s) => `
    <div class="clay-card p-6">
      <span class="text-xs font-bold text-emerald-700">Screen ${s.number}</span>
      <h3 class="text-lg font-bold mt-1">${s.title}</h3>
      <p class="text-xs opacity-75 mt-2">${s.subtitle || ''}</p>
    </div>`
      )
      .join('\n')}
  </div>
</body>
</html>`;
  };

  const handleCopy = () => {
    const textToCopy =
      activeTab === 'tokens' ? generateTokensJson() : generateHtmlBundle();
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob(
      [activeTab === 'tokens' ? generateTokensJson() : generateHtmlBundle()],
      {
        type: activeTab === 'tokens' ? 'application/json' : 'text/html',
      }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${
      activeTab === 'tokens' ? 'json' : 'html'
    }`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Export {projectTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Production-ready code & design token manifests
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          {[
            { id: 'nextjs' as const, label: 'Next.js 16 Project', icon: Package },
            { id: 'html' as const, label: 'Standalone HTML Bundle', icon: FileCode },
            { id: 'tokens' as const, label: 'Claymorphic Tokens JSON', icon: Sparkles },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`pb-3 px-2 font-medium flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 text-emerald-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Preview */}
        <div className="p-5 flex-1 overflow-y-auto font-mono text-[11px] bg-slate-50 dark:bg-[#121318] text-slate-700 dark:text-slate-300">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">
            {activeTab === 'tokens' ? generateTokensJson() : generateHtmlBundle()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#171920] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {screens.length} Artboard screens prepared for export
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#252834] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#2F3240] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

