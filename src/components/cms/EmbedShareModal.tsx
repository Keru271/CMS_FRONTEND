"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Share2,
  Globe,
  Sparkles,
} from "lucide-react";
import { CMSForm } from "@/src/types";

interface Props {
  form: CMSForm;
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedShareModal: React.FC<Props> = ({ form, isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"link" | "iframe" | "react">("link");

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://yourstore.com";
  const publicUrl = `${origin}/form/${form.slug || form.id}`;
  const iframeCode = `<iframe \n  src="${publicUrl}" \n  width="100%" \n  height="650px" \n  frameborder="0" \n  style="border-radius: 12px; border: 1px solid #e2e8f0;" \n  title="${form.title}"\n></iframe>`;
  const reactCode = `// In your React/Next.js component\nimport { PublicFormRenderer } from "@/components/PublicFormRenderer";\n\nexport default function ContactPage() {\n  return (\n    <div className="container mx-auto py-12">\n      <PublicFormRenderer formId="${form.id}" />\n    </div>\n  );\n}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Share & Embed Form
              </h3>
              <p className="text-xs text-slate-500">{form.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-800/20">
          <button
            onClick={() => setActiveTab("link")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "link"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Globe className="w-4 h-4" />
            Direct URL
          </button>
          <button
            onClick={() => setActiveTab("iframe")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "iframe"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Code2 className="w-4 h-4" />
            HTML Embed (Iframe)
          </button>
          <button
            onClick={() => setActiveTab("react")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === "react"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            React Component
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4">
          {activeTab === "link" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Share this direct URL with your customers, in newsletter campaigns, or link to it from your navigation header.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 select-all"
                />
                <button
                  onClick={() => copyToClipboard(publicUrl, "link")}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
                >
                  {copiedType === "link" ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {activeTab === "iframe" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Paste this HTML snippet into any page, blog post, or external website to embed this responsive form.
              </p>
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                  {iframeCode}
                </pre>
                <button
                  onClick={() => copyToClipboard(iframeCode, "iframe")}
                  className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                >
                  {copiedType === "iframe" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "react" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Integrate directly into your storefront or web application using React components.
              </p>
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                  {reactCode}
                </pre>
                <button
                  onClick={() => copyToClipboard(reactCode, "react")}
                  className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                >
                  {copiedType === "react" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
