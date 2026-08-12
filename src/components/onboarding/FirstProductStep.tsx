'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@heroui/react';
import {
  Package,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  FileText,
  Rocket,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { ProductFormData, StoreDetails, StoreTemplate } from '@/src/types';

interface FirstProductStepProps {
  storeDetails: StoreDetails;
  selectedTemplate: StoreTemplate;
  initialValues?: Partial<ProductFormData>;
  onSubmit: (productData: ProductFormData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const PRESET_IMAGES = [
  {
    name: 'Tech / Audio',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Smart Watch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Fashion Backpack',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mechanical Hardware',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Handcrafted Ceramic',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Organic Cosmetics',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
  },
];

const productSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Product title must be at least 3 characters')
    .required('Product title is required'),
  category: Yup.string().required('Category is required'),
  price: Yup.number()
    .typeError('Price must be a valid number')
    .positive('Price must be greater than 0')
    .required('Price is required'),
  originalPrice: Yup.number()
    .typeError('Compare price must be a valid number')
    .nullable()
    .optional(),
  stockQuantity: Yup.number()
    .typeError('Stock must be a valid integer')
    .min(0, 'Stock cannot be negative')
    .required('Stock quantity is required'),
  sku: Yup.string().required('SKU is required'),
  image: Yup.string().url('Must be a valid image URL').required('Product image is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Product description is required'),
  status: Yup.mixed<'active' | 'draft' | 'archived'>().oneOf(['active', 'draft', 'archived']),
});

export const FirstProductStep: React.FC<FirstProductStepProps> = ({
  storeDetails,
  selectedTemplate,
  initialValues,
  onSubmit,
  onBack,
  isSubmitting = false,
}) => {
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(
    initialValues?.image || PRESET_IMAGES[0].url
  );

  const categoryStr = storeDetails.category || '';
  const defaultCategory = categoryStr.includes('Tech')
    ? 'Electronics'
    : categoryStr.includes('Fashion')
    ? 'Fashion'
    : categoryStr.includes('Living')
    ? 'Home & Living'
    : 'General';

  const formik = useFormik<ProductFormData>({
    initialValues: {
      name: initialValues?.name || 'Signature Merchant Product',
      category: initialValues?.category || defaultCategory,
      price: initialValues?.price || 129.99,
      originalPrice: initialValues?.originalPrice || 159.99,
      stockQuantity: initialValues?.stockQuantity || 25,
      sku: initialValues?.sku || `SKU-${Date.now().toString().slice(-5)}`,
      image: initialValues?.image || PRESET_IMAGES[0].url,
      description:
        initialValues?.description ||
        'Premium quality flagship product engineered for exceptional design and performance.',
      status: initialValues?.status || 'active',
      tags: initialValues?.tags || 'Flagship, Featured, New Arrival',
    },
    validationSchema: productSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleSelectImage = (url: string) => {
    setSelectedPresetImage(url);
    formik.setFieldValue('image', url);
  };

  return (
    <div className="space-y-5">
      {/* Step Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sage-accent text-sage-primary text-[11px] font-bold uppercase tracking-wider border border-sage-border">
            Step 3 of 3
          </span>
          <span className="text-xs text-sage-muted">Theme: {selectedTemplate.name}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-sage-text tracking-tight">
          Add Your First Product
        </h2>
        <p className="text-xs text-sage-muted">
          Create your initial product listing to launch your catalog.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Title & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div
              className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${
                formik.touched.name && formik.errors.name
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary'
              }`}
            >
              <Package className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  Product Title
                </label>
                <input
                  name="name"
                  placeholder="e.g. AeroPulse Wireless Earbuds"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.name && formik.errors.name && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.name}
              </span>
            )}
          </div>

          <div>
            <div
              className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${
                formik.touched.sku && formik.errors.sku
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary'
              }`}
            >
              <Tag className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  SKU Code
                </label>
                <input
                  name="sku"
                  placeholder="e.g. AUDIO-AERO-01"
                  value={formik.values.sku}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.sku && formik.errors.sku && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.sku}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div
              className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${
                formik.touched.price && formik.errors.price
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary'
              }`}
            >
              <DollarSign className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  Price ({storeDetails.currency})
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="99.99"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.price && formik.errors.price && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.price}
              </span>
            )}
          </div>

          <div>
            <div className="border border-sage-border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 focus-within:border-sage-primary transition-all">
              <DollarSign className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  Original Price
                </label>
                <input
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  placeholder="129.99"
                  value={formik.values.originalPrice || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <div
              className={`border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 transition-all ${
                formik.touched.stockQuantity && formik.errors.stockQuantity
                  ? 'border-sage-danger focus-within:border-sage-danger'
                  : 'border-sage-border focus-within:border-sage-primary'
              }`}
            >
              <Layers className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  Stock Units
                </label>
                <input
                  name="stockQuantity"
                  type="number"
                  placeholder="50"
                  value={formik.values.stockQuantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
            {formik.touched.stockQuantity && formik.errors.stockQuantity && (
              <span className="text-[10px] text-sage-danger font-medium mt-1 block">
                {formik.errors.stockQuantity}
              </span>
            )}
          </div>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="border border-sage-border rounded-xl px-3.5 py-2 min-h-[46px] bg-sage-input-bg flex items-center gap-3 focus-within:border-sage-primary transition-all">
              <Layers className="w-4 h-4 text-sage-primary shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-medium text-sage-muted block leading-tight">
                  Category
                </label>
                <input
                  name="category"
                  placeholder="Electronics, Fashion"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent text-xs font-semibold text-sage-text outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 justify-center">
            <label className="text-[10px] font-medium text-sage-muted block">Publishing Status</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-sage-text">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formik.values.status === 'active'}
                  onChange={formik.handleChange}
                  className="text-sage-primary"
                />
                <span className="font-semibold text-sage-primary">Active (Live)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-sage-text">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formik.values.status === 'draft'}
                  onChange={formik.handleChange}
                  className="text-sage-primary"
                />
                <span className="font-semibold text-sage-muted">Draft (Hidden)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Image Preset Picker & Custom URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-sage-text flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-sage-primary" />
            <span>Product Image Presets</span>
          </label>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_IMAGES.map((preset, idx) => {
              const isSelected = selectedPresetImage === preset.url;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectImage(preset.url)}
                  className={`relative rounded-xl overflow-hidden h-14 border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sage-primary ring-2 ring-sage-primary/40'
                      : 'border-sage-border hover:border-sage-primary/50'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-sage-primary/40 flex items-center justify-center text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-sage-muted block">Product Description</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Detail features, key specifications, materials, and benefits..."
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-3 rounded-xl text-xs font-semibold border bg-sage-input-bg text-sage-text outline-none transition-all placeholder:text-sage-muted ${
              formik.touched.description && formik.errors.description
                ? 'border-sage-danger focus:border-sage-danger'
                : 'border-sage-border focus:border-sage-primary'
            }`}
          />
          {formik.touched.description && formik.errors.description && (
            <span className="text-[10px] text-sage-danger font-medium">{formik.errors.description}</span>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-sage-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full sm:w-auto text-sage-muted hover:text-sage-text text-xs font-semibold flex items-center justify-center gap-1.5 py-2.5 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Templates</span>
          </Button>

          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-sage-primary hover:bg-sage-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Complete Setup & Launch Dashboard</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
