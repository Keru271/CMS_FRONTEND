'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import {
  CheckCircle2,
  Sparkles,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  Palette,
  Zap,
} from 'lucide-react';
import { STORE_TEMPLATES, cmsService } from '@/src/services/cmsService';
import { StoreTemplate, StoreDetails } from '@/src/types';

interface TemplateSelectionStepProps {
  storeDetails: StoreDetails;
  selectedTemplate?: StoreTemplate;
  onSelect: (template: StoreTemplate) => void;
  onBack: () => void;
}

export const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({
  storeDetails,
  selectedTemplate: initialTemplate,
  onSelect,
  onBack,
}) => {
  const [templates, setTemplates] = useState<StoreTemplate[]>(STORE_TEMPLATES);
  const [chosenTemplate, setChosenTemplate] = useState<StoreTemplate>(
    initialTemplate || STORE_TEMPLATES[0]
  );
  const [previewModalTemplate, setPreviewModalTemplate] = useState<StoreTemplate | null>(null);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      const remote = await cmsService.getStoreTemplates();
      if (remote && remote.length > 0) {
        setTemplates(remote);
        if (!initialTemplate) {
          setChosenTemplate(remote[0]);
        }
      }
    };
    fetchTemplates();
  }, [initialTemplate]);

  const handleContinue = () => {
    onSelect(chosenTemplate);
  };

  return (
    <div className="space-y-5">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sage-accent text-sage-primary text-[11px] font-bold uppercase tracking-wider border border-sage-border">
              Step 2 of 3
            </span>
            <span className="text-xs text-sage-muted">Store: {storeDetails.storeName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-sage-text tracking-tight mt-1">
            Choose Storefront Theme
          </h2>
          <p className="text-xs text-sage-muted">
            Select a high-converting layout tailored for {storeDetails.category}. You can customize colors anytime in settings.
          </p>
        </div>

        {/* Selected Theme Badge Quick View */}
        <div className="px-3 py-1.5 rounded-2xl bg-sage-input-bg border border-sage-border flex items-center gap-2.5 shrink-0">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-xs"
            style={{ backgroundColor: chosenTemplate.accentColor }}
          />
          <div className="text-left">
            <span className="text-[10px] text-sage-muted block font-medium">Selected Theme:</span>
            <span className="text-xs font-bold text-sage-text leading-none">{chosenTemplate.name}</span>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map((tmpl) => {
          const isSelected = chosenTemplate.id === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => setChosenTemplate(tmpl)}
              className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-sage-primary bg-sage-accent/40 shadow-sm ring-2 ring-sage-primary/30'
                  : 'border-sage-border bg-sage-input-bg hover:border-sage-primary/50'
              }`}
            >
              {/* Top Image Preview Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-sage-accent/30">
                <img
                  src={tmpl.previewImage}
                  alt={tmpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Badge Indicator */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: tmpl.accentColor }}
                  >
                    {tmpl.badge}
                  </span>
                </div>

                {/* Selection Check Circle */}
                <div className="absolute top-2.5 right-2.5">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-sage-primary text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/80 border border-sage-border text-sage-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Template Content Body */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-xs text-sage-text">{tmpl.name}</h3>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tmpl.accentColor }}
                    />
                  </div>
                  <p className="text-[10px] text-sage-primary font-semibold mt-0.5">
                    {tmpl.tagline}
                  </p>
                  <p className="text-[11px] text-sage-muted mt-1 line-clamp-2 leading-tight">
                    {tmpl.description}
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="space-y-2 pt-2 border-t border-sage-border">
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalTemplate(tmpl);
                      }}
                      className="text-[10px] text-sage-muted hover:text-sage-text font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-sage-primary" />
                      <span>Full Theme Specs</span>
                    </button>

                    <span
                      className={`text-[10px] font-bold ${
                        isSelected ? 'text-sage-primary' : 'text-sage-muted'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Modal Preview */}
      {previewModalTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-card border border-sage-border rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setPreviewModalTemplate(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-sage-accent text-sage-muted hover:text-sage-text"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: previewModalTemplate.accentColor }}
              >
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-sage-text">{previewModalTemplate.name}</h3>
                <span className="text-xs text-sage-primary font-semibold">
                  {previewModalTemplate.tagline}
                </span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden h-40 bg-sage-accent/30 relative border border-sage-border">
              <img
                src={previewModalTemplate.previewImage}
                alt={previewModalTemplate.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-sage-border text-[11px] font-bold text-sage-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sage-primary" />
                <span>Responsive Layout</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-sage-muted">
                Included Theme Capabilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewModalTemplate.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-sage-accent/50 border border-sage-border flex items-center gap-2 text-xs text-sage-text"
                  >
                    <Zap className="w-3.5 h-3.5 text-sage-primary shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setPreviewModalTemplate(null)}
                className="text-sage-muted hover:text-sage-text text-xs"
              >
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  setChosenTemplate(previewModalTemplate);
                  setPreviewModalTemplate(null);
                }}
                className="px-5 py-2 bg-sage-primary text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Use This Template</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-sage-border">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full sm:w-auto text-sage-muted hover:text-sage-text text-xs font-semibold flex items-center justify-center gap-1.5 py-2.5 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store Details</span>
        </Button>

        <Button
          onClick={handleContinue}
          className="w-full sm:w-auto px-6 py-2.5 bg-sage-primary hover:bg-sage-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <span>Next: Add First Product</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
