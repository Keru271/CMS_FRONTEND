'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  X,
  Save,
  Package,
  Image as ImageIcon,
  Tag,
  Sparkles,
  Wand2,
  Check,
  Search,
  Globe,
  Share2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { CMSProduct, ProductFormData } from '@/src/types';
import { Input } from '@/src/components/ui/Input';
import DragDropUpload from '@/src/components/ui/DragDropUpload';
import { cmsService } from '@/src/services/cmsService';
import { useCMSContext } from '@/src/context/CMSContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormData) => Promise<void>;
  initialProduct?: CMSProduct | null;
  categories: string[];
}

const productValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Product name must be at least 3 characters')
    .required('Product name is required'),
  sku: Yup.string().required('SKU code is required'),
  category: Yup.string().required('Category is required'),
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price is required'),
  originalPrice: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .nullable(),
  stockQuantity: Yup.number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be an integer')
    .min(0, 'Cannot be negative')
    .required('Stock quantity is required'),
  status: Yup.string().oneOf(['active', 'draft', 'archived']).required('Status is required'),
  image: Yup.string().url('Must be a valid image URL').required('Product image is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
});

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct,
  categories,
}) => {
  const { merchantData, currencySymbol = '₹' } = useCMSContext();
  const isEditing = !!initialProduct;

  const storeName = merchantData?.store?.storeName || 'OmniStore';
  const storeDomain =
    (merchantData?.store as any)?.customDomain ||
    `${merchantData?.store?.slug || 'my-store'}.omnistore.com`;

  // SEO Governance Accordion & Preview State
  const [isSeoExpanded, setIsSeoExpanded] = useState(true);
  const [seoPreviewDevice, setSeoPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isGeneratingSeoAi, setIsGeneratingSeoAi] = useState(false);

  // AI Copywriter Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTone, setAiTone] = useState<'LUXURY' | 'HIGH_CONVERTING' | 'CASUAL' | 'TECHNICAL'>(
    'HIGH_CONVERTING',
  );
  const [aiKeywords, setAiKeywords] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const initialUrlSlug =
    initialProduct?.urlSlug ||
    (initialProduct?.name
      ? initialProduct.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
      : '');

  const formik = useFormik<ProductFormData>({
    enableReinitialize: true,
    initialValues: {
      name: initialProduct?.name || '',
      sku: initialProduct?.sku || `SKU-`,
      category: initialProduct?.category || categories[0] || 'Electronics',
      categories:
        initialProduct?.categories ||
        (initialProduct?.category ? [initialProduct.category] : [categories[0] || 'Electronics']),
      price: initialProduct?.price ?? '',
      originalPrice: initialProduct?.originalPrice ?? '',
      stockQuantity: initialProduct?.stockQuantity ?? 10,
      isTaxInclusive: initialProduct?.isTaxInclusive || false,
      status: initialProduct?.status || 'active',
      image:
        initialProduct?.image ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      description: initialProduct?.description || '',
      tags: initialProduct?.tags ? initialProduct.tags.join(', ') : '',
      // SEO Governance Fields
      seoTitle: initialProduct?.seoTitle || initialProduct?.metaTitle || initialProduct?.name || '',
      seoDescription:
        initialProduct?.seoDescription ||
        initialProduct?.metaDescription ||
        (initialProduct?.description ? initialProduct.description.slice(0, 160) : ''),
      metaTitle:
        initialProduct?.metaTitle || initialProduct?.seoTitle || initialProduct?.name || '',
      metaDescription:
        initialProduct?.metaDescription ||
        initialProduct?.seoDescription ||
        (initialProduct?.description ? initialProduct.description.slice(0, 160) : ''),
      urlSlug: initialUrlSlug,
      ogImage: initialProduct?.ogImage || initialProduct?.image || '',
      canonicalUrl:
        initialProduct?.canonicalUrl ||
        (initialUrlSlug ? `https://${storeDomain}/products/${initialUrlSlug}` : ''),
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const resolvedSlug =
          values.urlSlug ||
          values.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-');
        const resolvedSeoTitle = values.seoTitle || values.metaTitle || values.name;
        const resolvedSeoDesc =
          values.seoDescription ||
          values.metaDescription ||
          (values.description ? values.description.slice(0, 160) : '');
        const resolvedOgImage = values.ogImage || values.image || '';
        const resolvedCanonical =
          values.canonicalUrl || `https://${storeDomain}/products/${resolvedSlug}`;

        await onSubmit({
          ...values,
          urlSlug: resolvedSlug,
          seoTitle: resolvedSeoTitle,
          metaTitle: resolvedSeoTitle,
          seoDescription: resolvedSeoDesc,
          metaDescription: resolvedSeoDesc,
          ogImage: resolvedOgImage,
          canonicalUrl: resolvedCanonical,
        });
        helpers.resetForm();
        onClose();
      } catch (err) {
        console.error('Form submission error:', err);
      }
    },
  });

  const handleGenerateAi = async () => {
    if (!formik.values.name || formik.values.name.trim().length === 0) {
      alert('Please enter a product title first so the AI knows what to write!');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await cmsService.generateAiProductContent({
        productName: formik.values.name,
        category: formik.values.category,
        tone: aiTone,
        keywords: aiKeywords,
      });

      if (res.description) {
        let fullDesc = res.description;
        if (res.keyFeatures && res.keyFeatures.length > 0) {
          fullDesc += '\n\nKey Highlights:\n' + res.keyFeatures.map((f) => `• ${f}`).join('\n');
        }
        formik.setFieldValue('description', fullDesc);
      }
      if (res.suggestedTags && res.suggestedTags.length > 0) {
        formik.setFieldValue('tags', res.suggestedTags.join(', '));
      }
      if (res.refinedTitle && res.refinedTitle !== formik.values.name) {
        formik.setFieldValue('name', res.refinedTitle);
      }
      setIsAiModalOpen(false);
    } catch (err) {
      console.error('AI generation error:', err);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Generate Product SEO Title & Description
  const handleAutoGenerateSeo = () => {
    const title = formik.values.name.trim();
    if (!title) {
      alert('Please enter a Product Title first.');
      return;
    }
    setIsGeneratingSeoAi(true);
    setTimeout(() => {
      const cleanSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const category = formik.values.category || 'Quality';
      const autoTitle = `${title} | Buy Online at ${storeName}`;
      const plainDesc = formik.values.description
        ? formik.values.description.replace(/<[^>]*>?/gm, '').slice(0, 140)
        : `Shop ${title} online with fast delivery, authentic quality warranty, and premium customer service at ${storeName}.`;
      const autoDesc = `${plainDesc} Order today with express shipping!`.slice(0, 160);

      formik.setFieldValue('seoTitle', autoTitle);
      formik.setFieldValue('metaTitle', autoTitle);
      formik.setFieldValue('seoDescription', autoDesc);
      formik.setFieldValue('metaDescription', autoDesc);
      formik.setFieldValue('urlSlug', cleanSlug);
      formik.setFieldValue('canonicalUrl', `https://${storeDomain}/products/${cleanSlug}`);
      if (!formik.values.ogImage && formik.values.image) {
        formik.setFieldValue('ogImage', formik.values.image);
      }
      setIsGeneratingSeoAi(false);
    }, 400);
  };

  const effectiveSeoTitle =
    formik.values.seoTitle || formik.values.name || 'Product Title | OmniStore';
  const effectiveSeoDesc =
    formik.values.seoDescription ||
    (formik.values.description
      ? formik.values.description.slice(0, 160)
      : 'High quality product available with fast shipping.');
  const effectiveSlug =
    formik.values.urlSlug ||
    (formik.values.name
      ? formik.values.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
      : 'product-item');
  const effectiveOgImage =
    formik.values.ogImage ||
    formik.values.image ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#191a1b]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] border border-[#cbd5e0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-statamic relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cbd5e0]/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#fdf1ef] text-[#191a1b] flex items-center justify-center font-bold border border-[#cbd5e0]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-normal text-xl text-[#191a1b] leading-tight">
                {isEditing ? 'Edit Item Specification' : 'Create New Catalog Item'}
              </h3>
              <p className="text-xs font-sans text-[#5e5a5a]">
                Manage product details, pricing, and stock limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5a5a] hover:text-[#191a1b] p-1.5 rounded-lg hover:bg-[#fdf1ef] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formik Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4 font-sans">
          {/* Row 1: Title & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Input
                name="name"
                label="Product Title *"
                placeholder="e.g. AeroPulse Wireless Headphones"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.name && Boolean(formik.errors.name)}
                errorMessage={formik.touched.name && formik.errors.name}
              />
            </div>
            <Input
              name="sku"
              label="SKU Code *"
              placeholder="e.g. AUDIO-01"
              value={formik.values.sku}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.sku && Boolean(formik.errors.sku)}
              errorMessage={formik.touched.sku && formik.errors.sku}
            />
          </div>

          {/* Row 2: Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans font-medium text-[#191a1b]">
                  Primary Category *
                </label>
                <span className="text-[10px] text-indigo-600 font-bold">
                  {(formik.values.categories || []).length} assigned
                </span>
              </div>
              <select
                name="category"
                value={formik.values.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  formik.setFieldValue('category', newCat);
                  const currCats = formik.values.categories || [];
                  if (!currCats.includes(newCat)) {
                    formik.setFieldValue('categories', [newCat, ...currCats]);
                  }
                }}
                onBlur={formik.handleBlur}
                className="bg-[#ffffff] border border-[#cbd5e0] text-xs rounded-lg p-2.5 text-[#191a1b] focus:outline-none focus:border-[#cbc2ea] font-medium cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Multi-category Quick Toggle Chips */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-1 max-h-20 overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  {categories.map((cat) => {
                    const isSelected = (formik.values.categories || []).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const curr = formik.values.categories || [];
                          const next = isSelected ? curr.filter((c) => c !== cat) : [...curr, cat];
                          formik.setFieldValue('categories', next.length > 0 ? next : [cat]);
                          if (!isSelected && !formik.values.category) {
                            formik.setFieldValue('category', cat);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-sans font-medium text-[#191a1b]">CMS Status *</label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-[#ffffff] border border-[#cbd5e0] text-xs rounded-lg p-2.5 text-[#191a1b] focus:outline-none focus:border-[#cbc2ea] font-medium cursor-pointer"
              >
                <option value="active">Active (Visible in Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Row 3: Price, Original Price, Stock Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              name="price"
              type="number"
              step="0.01"
              label={`Price (${currencySymbol}) *`}
              placeholder="199.99"
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.price && Boolean(formik.errors.price)}
              errorMessage={formik.touched.price && formik.errors.price}
            />

            <Input
              name="originalPrice"
              type="number"
              step="0.01"
              label={`Original Price (${currencySymbol})`}
              placeholder="249.99"
              value={formik.values.originalPrice}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.originalPrice && Boolean(formik.errors.originalPrice)}
              errorMessage={formik.touched.originalPrice && formik.errors.originalPrice}
            />

            <Input
              name="stockQuantity"
              type="number"
              label="Stock Quantity *"
              placeholder="45"
              value={formik.values.stockQuantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.stockQuantity && Boolean(formik.errors.stockQuantity)}
              errorMessage={formik.touched.stockQuantity && formik.errors.stockQuantity}
            />
          </div>

          {/* Tax Inclusive Setting */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="isTaxInclusive"
              name="isTaxInclusive"
              checked={Boolean(formik.values.isTaxInclusive)}
              onChange={formik.handleChange}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
            <label
              htmlFor="isTaxInclusive"
              className="text-xs font-bold text-slate-800 cursor-pointer"
            >
              Product price is inclusive of tax (Tax is included in the listed price)
            </label>
          </div>

          {/* Row 4: Product Image Upload & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Product Image — Drag & Drop */}
            <div className="space-y-1.5">
              <DragDropUpload
                folder="products"
                fileType="PRODUCT_IMAGE"
                label="Product Image *"
                currentUrl={formik.values.image || undefined}
                onUploadComplete={(url) => {
                  formik.setFieldValue('image', url);
                  formik.setFieldTouched('image', true);
                }}
                hint="Recommended: 1000×1000px JPG or PNG."
                previewShape="square"
                maxSizeMB={5}
              />
              {/* URL fallback */}
              <input
                type="url"
                name="image"
                placeholder="Or paste image URL…"
                value={formik.values.image}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formik.touched.image && formik.errors.image && (
                <p className="text-[10px] text-rose-500 font-semibold">{formik.errors.image}</p>
              )}
            </div>

            <Input
              name="tags"
              label="Tags (Comma-separated)"
              placeholder="Audio, Wireless, Premium"
              startContent={<Tag className="w-4 h-4 text-[#5e5a5a]" />}
              value={formik.values.tags}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          {/* Row 5: Description Textarea with AI Copywriter */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-sans font-medium text-[#191a1b]">
                Product Description *
              </label>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition flex items-center gap-1.5 border border-indigo-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>✨ AI Magic Copywriter</span>
              </button>
            </div>
            <textarea
              name="description"
              rows={4}
              placeholder="Provide detailed features, specifications, and selling points..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full bg-[#ffffff] border rounded-lg p-2.5 text-xs font-sans outline-none text-[#191a1b] placeholder:text-[#beb9b3] transition-all ${
                formik.touched.description && formik.errors.description
                  ? 'border-[#ef4444] focus:border-[#ef4444]'
                  : 'border-[#cbd5e0] focus:border-[#cbc2ea]'
              }`}
            />
            {formik.touched.description && formik.errors.description && (
              <span className="text-[10px] text-[#ef4444] font-medium">
                {formik.errors.description}
              </span>
            )}
          </div>

          {/* ─── SEO GOVERNANCE & SEARCH RANKING SECTION ────────────────── */}
          <div className="border border-indigo-100 rounded-2xl bg-slate-50/70 overflow-hidden transition-all shadow-xs">
            {/* Accordion Toggle Header */}
            <div
              onClick={() => setIsSeoExpanded(!isSeoExpanded)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100/70 transition select-none bg-gradient-to-r from-indigo-50/50 via-white to-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      SEO Governance & Social Meta
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Auto-Synced with SEO Studio
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Customize search engine ranking title, snippet description, URL slug, and
                    OpenGraph social share card
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAutoGenerateSeo();
                  }}
                  disabled={isGeneratingSeoAi}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isGeneratingSeoAi ? 'Generating…' : '✨ Auto-Generate SEO'}</span>
                </button>
                <div className="text-slate-400 p-1">
                  {isSeoExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            {isSeoExpanded && (
              <div className="p-4 pt-2 border-t border-slate-200/80 space-y-4 bg-white">
                {/* Live SERP & Social Previews */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Google Search Snippet Card */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Search className="w-3.5 h-3.5 text-blue-600" />
                        <span>Google Search SERP Preview</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[10px]">
                        <button
                          type="button"
                          onClick={() => setSeoPreviewDevice('desktop')}
                          className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${
                            seoPreviewDevice === 'desktop'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          <Monitor className="w-2.5 h-2.5" /> Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setSeoPreviewDevice('mobile')}
                          className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${
                            seoPreviewDevice === 'mobile'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          <Smartphone className="w-2.5 h-2.5" /> Mobile
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#202124]">
                        <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                          {storeName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{storeName}</span>
                        <span className="text-slate-400">›</span>
                        <span className="text-slate-600 truncate text-[10px]">
                          products › {effectiveSlug}
                        </span>
                      </div>
                      <h5 className="text-sm font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer line-clamp-1">
                        {effectiveSeoTitle}
                      </h5>
                      <p className="text-[11px] text-[#4d5156] leading-relaxed line-clamp-2">
                        {effectiveSeoDesc}
                      </p>
                    </div>
                  </div>

                  {/* Social Share (OpenGraph) Preview Card */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Social Share (OpenGraph) Preview</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Facebook / Twitter / iMessage
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                      <div className="h-20 bg-slate-200 relative overflow-hidden">
                        {effectiveOgImage ? (
                          <img
                            src={effectiveOgImage}
                            alt="Social Share Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                            No Social Image
                          </div>
                        )}
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 text-white rounded text-[9px] font-bold uppercase tracking-wider">
                          OpenGraph
                        </span>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                          {storeDomain}
                        </span>
                        <p className="text-[11px] font-bold text-slate-900 line-clamp-1 leading-tight">
                          {effectiveSeoTitle}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {effectiveSeoDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* SEO Page Title */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">SEO Page Title</label>
                      <span
                        className={`text-[10px] font-mono ${
                          (formik.values.seoTitle?.length || 0) > 65
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {formik.values.seoTitle?.length || 0}/65 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      name="seoTitle"
                      placeholder="e.g. AeroPulse Noise-Cancelling Headphones | OmniStore"
                      value={formik.values.seoTitle}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldValue('metaTitle', e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Product URL Slug */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">
                        URL Slug / Handle
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const slug = formik.values.name
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, '-');
                          formik.setFieldValue('urlSlug', slug);
                          formik.setFieldValue(
                            'canonicalUrl',
                            `https://${storeDomain}/products/${slug}`,
                          );
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Reset from Title
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                      <span className="px-2.5 py-2 bg-slate-50 text-[11px] text-slate-400 border-r border-slate-200 font-mono">
                        /products/
                      </span>
                      <input
                        type="text"
                        name="urlSlug"
                        placeholder="aeropulse-wireless-headphones"
                        value={formik.values.urlSlug}
                        onChange={(e) => {
                          const slugVal = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          formik.setFieldValue('urlSlug', slugVal);
                          formik.setFieldValue(
                            'canonicalUrl',
                            `https://${storeDomain}/products/${slugVal}`,
                          );
                        }}
                        className="w-full px-2.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Meta Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800">
                      SEO Meta Description
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        (formik.values.seoDescription?.length || 0) > 160
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {formik.values.seoDescription?.length || 0}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    name="seoDescription"
                    placeholder="Provide a concise 120-160 character snippet summarizing key product benefits for search engine results..."
                    value={formik.values.seoDescription}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue('metaDescription', e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* OpenGraph Image & Canonical URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">
                        Social Share Image (OpenGraph)
                      </label>
                      {formik.values.image && formik.values.ogImage !== formik.values.image && (
                        <button
                          type="button"
                          onClick={() => formik.setFieldValue('ogImage', formik.values.image)}
                          className="text-[10px] font-bold text-indigo-600 hover:underline"
                        >
                          Use Main Image
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      name="ogImage"
                      placeholder="https://..."
                      value={formik.values.ogImage}
                      onChange={formik.handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-800">
                      Canonical URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="canonicalUrl"
                      placeholder={`https://${storeDomain}/products/...`}
                      value={formik.values.canonicalUrl}
                      onChange={formik.handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Magic Copywriter Dialog Modal */}
          {isAiModalOpen && (
            <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-sm text-slate-900">AI Product Copywriter</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Target Tone of Voice:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'HIGH_CONVERTING', label: '🔥 High-Conversion' },
                        { id: 'LUXURY', label: '✨ Luxury & Premium' },
                        { id: 'CASUAL', label: '👟 Casual & Lifestyle' },
                        { id: 'TECHNICAL', label: '⚙️ Technical Specs' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAiTone(t.id as any)}
                          className={`p-2 rounded-xl text-[11px] font-bold border text-left transition ${
                            aiTone === t.id
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Key Feature Keywords (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. noise-cancelling, 40h battery, fast charge"
                      value={aiKeywords}
                      onChange={(e) => setAiKeywords(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={handleGenerateAi}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingAi ? 'Generating…' : 'Generate Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer CTA Buttons */}
          <div className="flex justify-end gap-3 border-t border-[#cbd5e0]/60 pt-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-[#191a1b] border border-[#cbc2ea] hover:bg-[#fdf1ef] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] font-sans font-medium text-xs shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#d4ff4c]" />
              <span>
                {formik.isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
