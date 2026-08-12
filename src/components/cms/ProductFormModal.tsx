'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, Save, Package, Image as ImageIcon, Tag } from 'lucide-react';
import { CMSProduct, ProductFormData } from '@/src/types';
import { Input } from '@/src/components/ui/Input';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormData) => Promise<void>;
  initialProduct?: CMSProduct | null;
  categories: string[];
}

const productValidationSchema = Yup.object({
  name: Yup.string().min(3, 'Product name must be at least 3 characters').required('Product name is required'),
  sku: Yup.string().required('SKU code is required'),
  category: Yup.string().required('Category is required'),
  price: Yup.number().typeError('Price must be a number').positive('Price must be positive').required('Price is required'),
  originalPrice: Yup.number().typeError('Price must be a number').positive('Price must be positive').nullable(),
  stockQuantity: Yup.number().typeError('Quantity must be a number').integer('Quantity must be an integer').min(0, 'Cannot be negative').required('Stock quantity is required'),
  status: Yup.string().oneOf(['active', 'draft', 'archived']).required('Status is required'),
  image: Yup.string().url('Must be a valid image URL').required('Product image URL is required'),
  description: Yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
});

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct,
  categories,
}) => {
  const isEditing = !!initialProduct;

  const formik = useFormik<ProductFormData>({
    enableReinitialize: true,
    initialValues: {
      name: initialProduct?.name || '',
      sku: initialProduct?.sku || `SKU-`,
      category: initialProduct?.category || categories[0] || 'Electronics',
      price: initialProduct?.price ?? '',
      originalPrice: initialProduct?.originalPrice ?? '',
      stockQuantity: initialProduct?.stockQuantity ?? 10,
      isTaxInclusive: initialProduct?.isTaxInclusive || false,
      status: initialProduct?.status || 'active',
      image: initialProduct?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      description: initialProduct?.description || '',
      tags: initialProduct?.tags ? initialProduct.tags.join(', ') : '',
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit(values);
        helpers.resetForm();
        onClose();
      } catch (err) {
        console.error('Form submission error:', err);
      }
    },
  });

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
              <p className="text-xs font-sans text-[#5e5a5a]">Manage product details, pricing, and stock limits</p>
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
              <label className="text-xs font-sans font-medium text-[#191a1b]">Category *</label>
              <select
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-[#ffffff] border border-[#cbd5e0] text-xs rounded-lg p-2.5 text-[#191a1b] focus:outline-none focus:border-[#cbc2ea] font-medium cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
              label="Price ($) *"
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
              label="Original Price ($)"
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
            <label htmlFor="isTaxInclusive" className="text-xs font-bold text-slate-800 cursor-pointer">
              Product price is inclusive of tax (Tax is included in the listed price)
            </label>
          </div>

          {/* Row 4: Image URL & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              name="image"
              label="Image URL *"
              placeholder="https://images.unsplash.com/..."
              startContent={<ImageIcon className="w-4 h-4 text-[#5e5a5a]" />}
              value={formik.values.image}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.image && Boolean(formik.errors.image)}
              errorMessage={formik.touched.image && formik.errors.image}
            />

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

          {/* Row 5: Description Textarea */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-sans font-medium text-[#191a1b]">Product Description *</label>
            <textarea
              name="description"
              rows={3}
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
              <span className="text-[10px] text-[#ef4444] font-medium">{formik.errors.description}</span>
            )}
          </div>

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
              <span>{formik.isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
