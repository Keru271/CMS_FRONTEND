'use client';

import React, { useState } from 'react';
import { cmsService } from '@/src/services/cmsService';
import {
  ChatInteractiveForm,
  FormFieldDefinition,
} from '@/src/services/aiAssistantService';
import { CMSCategory, CMSProduct } from '@/src/types';
import {
  PackagePlus,
  FolderPlus,
  Edit3,
  Percent,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Plus,
  Sparkles,
  Tag,
  Boxes,
} from 'lucide-react';

interface ChatInteractiveFormViewProps {
  form: ChatInteractiveForm;
  messageId: string;
  currencySymbol: string;
  categories: CMSCategory[];
  products: CMSProduct[];
  fetchDashboardDetails: () => Promise<void>;
  onFormSubmitted: (
    messageId: string,
    resultMessage: string,
    submittedData: Record<string, any>,
  ) => void;
}

export const ChatInteractiveFormView: React.FC<ChatInteractiveFormViewProps> = ({
  form,
  messageId,
  currencySymbol,
  categories,
  products,
  fetchDashboardDetails,
  onFormSubmitted,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    return { ...(form.initialValues || {}) };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(form.submitted));
  const [resultMessage, setResultMessage] = useState<string>(form.resultMessage || '');
  const [submittedData, setSubmittedData] = useState<Record<string, any>>(
    form.submittedData || form.initialValues || {},
  );

  // Dynamic field update when selection changes in Edit modes
  const handleSelectChange = (name: string, value: string) => {
    setErrorMessage(null);

    // If editing a category and the selected category changes
    if (form.type === 'EDIT_CATEGORY' && name === 'categoryId') {
      const selectedCat = categories.find((c) => c.id === value);
      if (selectedCat) {
        setFormData((prev) => ({
          ...prev,
          categoryId: value,
          name: selectedCat.name,
          icon: selectedCat.icon || '📁',
          description: selectedCat.description || '',
        }));
        return;
      }
    }

    // If editing a product and the selected product changes
    if (form.type === 'EDIT_PRODUCT' && name === 'productId') {
      const selectedProd = products.find((p) => p.id === value);
      if (selectedProd) {
        setFormData((prev) => ({
          ...prev,
          productId: value,
          name: selectedProd.name,
          price: selectedProd.price,
          stock: selectedProd.inventory ?? selectedProd.stockQuantity ?? 25,
          category: selectedProd.categoryName || selectedProd.category || 'General',
          status: selectedProd.status || 'ACTIVE',
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setErrorMessage(null);
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form field validation
    for (const field of form.fields) {
      if (field.required) {
        const val = formData[field.name];
        if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
          setErrorMessage(`Please provide a valid ${field.label.toLowerCase()}.`);
          return;
        }
        if (field.type === 'number') {
          const num = Number(val);
          if (isNaN(num) || (field.min !== undefined && num < field.min)) {
            setErrorMessage(`${field.label} must be at least ${field.min ?? 0}.`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);

    try {
      let finalMessage = '';
      const payloadData = { ...formData };

      switch (form.type) {
        case 'ADD_PRODUCT': {
          const prodName = String(formData.name).trim();
          const generatedSku = `SKU-${prodName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'PROD'}-${Math.floor(100 + Math.random() * 900)}`;

          const created = await cmsService.createProduct({
            name: prodName,
            sku: generatedSku,
            price: Number(formData.price),
            inventory: Number(formData.stock ?? 25),
            stockQuantity: Number(formData.stock ?? 25),
            category: formData.category || 'General',
            categoryName: formData.category || 'General',
            categories: [formData.category || 'General'],
            description: formData.description || `High-quality ${prodName} added to the catalog.`,
            status: 'ACTIVE',
          });

          await fetchDashboardDetails();
          finalMessage = `Product "${created.name}" has been successfully created in "${created.categoryName}" at ${currencySymbol}${Number(created.price).toLocaleString()}!`;
          break;
        }

        case 'EDIT_PRODUCT': {
          const prodId = formData.productId || products[0]?.id;
          if (!prodId) throw new Error('No product selected to edit.');
          const existingProd = products.find((p) => p.id === prodId);

          const updated = await cmsService.updateProduct(prodId, {
            name: String(formData.name).trim(),
            sku: existingProd?.sku || `SKU-${prodId.slice(0, 6)}`,
            description: existingProd?.description || '',
            price: Number(formData.price),
            inventory: Number(formData.stock),
            stockQuantity: Number(formData.stock),
            category: formData.category,
            categoryName: formData.category,
            status: formData.status || 'ACTIVE',
          });

          await fetchDashboardDetails();
          finalMessage = `Product "${updated.name}" has been updated: Price ${currencySymbol}${Number(updated.price).toLocaleString()}, Stock ${updated.inventory}, Status ${updated.status}.`;
          break;
        }

        case 'ADD_CATEGORY': {
          const catName = String(formData.name).trim();
          const slug = catName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-');

          const created = await cmsService.createCategory({
            name: catName,
            slug,
            icon: formData.icon || '📁',
            description: formData.description || '',
          });

          await fetchDashboardDetails();
          finalMessage = `Category "${created.icon || '📁'} ${created.name}" created and added to store navigation!`;
          break;
        }

        case 'EDIT_CATEGORY': {
          const catId = formData.categoryId || categories[0]?.id;
          if (!catId) throw new Error('No category selected to edit.');

          const updated = await cmsService.updateCategory(catId, {
            name: String(formData.name).trim(),
            icon: formData.icon || '📁',
            description: formData.description || '',
          });

          await fetchDashboardDetails();
          finalMessage = `Category "${updated.icon || '📁'} ${updated.name}" updated successfully!`;
          break;
        }

        case 'CREATE_DISCOUNT': {
          const code = String(formData.code || 'PROMO10').toUpperCase().trim();
          const discountType = formData.discountType || 'PERCENTAGE';
          const value = Number(formData.value || 10);
          const minOrderAmount = Number(formData.minOrderAmount || 0);

          const created = await cmsService.createDiscount({
            code,
            title: formData.title || 'Special Promotion',
            discountType,
            value,
            minOrderAmount,
            status: 'ACTIVE',
          });

          await fetchDashboardDetails();
          const discountBadge =
            created.discountType === 'PERCENTAGE'
              ? `${created.value}% off`
              : `${currencySymbol}${created.value} off`;
          finalMessage = `Discount coupon "${created.code}" (${discountBadge}) activated and ready for customers at checkout!`;
          break;
        }

        default:
          throw new Error('Unsupported form action type.');
      }

      setIsSubmitted(true);
      setResultMessage(finalMessage);
      setSubmittedData(payloadData);
      onFormSubmitted(messageId, finalMessage, payloadData);
    } catch (err: any) {
      console.error('Error submitting interactive form:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to submit form. Please check your inputs.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormIcon = () => {
    switch (form.type) {
      case 'ADD_PRODUCT':
        return <PackagePlus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'EDIT_PRODUCT':
        return <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'ADD_CATEGORY':
        return <FolderPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'EDIT_CATEGORY':
        return <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'CREATE_DISCOUNT':
        return <Percent className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-600" />;
    }
  };

  const getBadgeColor = () => {
    switch (form.type) {
      case 'ADD_PRODUCT':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800';
      case 'EDIT_PRODUCT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
      case 'ADD_CATEGORY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'EDIT_CATEGORY':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'CREATE_DISCOUNT':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="mt-3.5 pt-3 border-t border-slate-200/90 dark:border-slate-800 w-full">
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-slate-50/90 via-white to-white dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 shadow-xs overflow-hidden transition-all duration-200">
        {/* Header Strip */}
        <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
              {getFormIcon()}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5 font-sans">
                {form.title}
              </h4>
              {form.subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-sans">
                  {form.subtitle}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider border shrink-0 ${getBadgeColor()}`}
          >
            {isSubmitted ? 'Completed' : 'Interactive Form'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4">
          {/* Success State */}
          {isSubmitted ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 leading-snug">
                    {resultMessage || 'Saved successfully!'}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    Your store records and storefront preview have been updated live.
                  </p>
                </div>
              </div>

              {/* Submitted Data Summary Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {submittedData.name && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {submittedData.name}
                  </span>
                )}
                {submittedData.price !== undefined && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {currencySymbol}
                    {Number(submittedData.price).toLocaleString()}
                  </span>
                )}
                {submittedData.stock !== undefined && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Boxes className="w-3 h-3 text-slate-500" />
                    {submittedData.stock} in stock
                  </span>
                )}
                {submittedData.category && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    📁 {submittedData.category}
                  </span>
                )}
                {submittedData.code && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-800 dark:text-slate-200 font-mono tracking-wider">
                    🎟️ {submittedData.code}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Active Form Inputs */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.fields.map((field: FormFieldDefinition) => {
                  const val = formData[field.name] ?? '';
                  const isFullWidth = field.type === 'textarea' || form.fields.length <= 2;

                  return (
                    <div
                      key={field.name}
                      className={isFullWidth ? 'sm:col-span-2 space-y-1' : 'space-y-1'}
                    >
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-sans">
                        {field.label}
                        {field.required && (
                          <span className="text-rose-500 ml-0.5">*</span>
                        )}
                      </label>

                      {/* Input Type: SELECT */}
                      {field.type === 'select' && (
                        <div className="relative">
                          <select
                            name={field.name}
                            value={val}
                            disabled={isSubmitting}
                            onChange={(e) => handleSelectChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-sans cursor-pointer disabled:opacity-50"
                          >
                            {field.options && field.options.length > 0 ? (
                              field.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))
                            ) : (
                              <option value="">No options available</option>
                            )}
                          </select>
                        </div>
                      )}

                      {/* Input Type: NUMBER */}
                      {field.type === 'number' && (
                        <div className="relative flex items-center">
                          {field.prefix && (
                            <span className="absolute left-3 text-xs font-bold text-slate-500 dark:text-slate-400 select-none font-mono">
                              {field.prefix}
                            </span>
                          )}
                          <input
                            type="number"
                            name={field.name}
                            value={val}
                            min={field.min}
                            max={field.max}
                            step={field.step || '1'}
                            placeholder={field.placeholder}
                            disabled={isSubmitting}
                            onChange={handleInputChange}
                            className={`w-full py-2 pr-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-mono disabled:opacity-50 ${
                              field.prefix ? 'pl-8' : 'px-3'
                            }`}
                          />
                        </div>
                      )}

                      {/* Input Type: TEXTAREA */}
                      {field.type === 'textarea' && (
                        <textarea
                          name={field.name}
                          value={val}
                          rows={2}
                          placeholder={field.placeholder}
                          disabled={isSubmitting}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-sans resize-none disabled:opacity-50"
                        />
                      )}

                      {/* Input Type: TEXT */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          name={field.name}
                          value={val}
                          placeholder={field.placeholder}
                          disabled={isSubmitting}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-sans disabled:opacity-50"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Form Action Controls */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 text-xs font-semibold font-sans shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Store...</span>
                    </>
                  ) : (
                    <>
                      {form.submitButtonIcon === 'FolderPlus' ? (
                        <FolderPlus className="w-3.5 h-3.5" />
                      ) : form.submitButtonIcon === 'Percent' ? (
                        <Percent className="w-3.5 h-3.5" />
                      ) : form.submitButtonIcon === 'Check' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>{form.submitButtonText}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
