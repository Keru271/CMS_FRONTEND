'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  X,
  Users,
} from 'lucide-react';

interface StitchShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export function StitchShareModal({
  isOpen,
  onClose,
  projectTitle,
}: StitchShareModalProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [shareAccess, setShareAccess] = useState<'public' | 'team'>('public');

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ai-builder?project=${encodeURIComponent(projectTitle)}`
    : `https://omnistore.shop/ai-builder?project=${encodeURIComponent(projectTitle)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Share Prototype
              </h3>
              <p className="text-xs text-slate-500">{projectTitle}</p>
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Permission selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Access Permissions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShareAccess('public')}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 cursor-pointer ${
                  shareAccess === 'public'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Anyone with link</span>
              </button>

              <button
                type="button"
                onClick={() => setShareAccess('team')}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 cursor-pointer ${
                  shareAccess === 'team'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Only Team Members</span>
              </button>
            </div>
          </div>

          {/* Copy link input */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Prototype Live Link
            </span>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-300 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shrink-0 hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

