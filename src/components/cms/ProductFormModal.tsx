'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, Save, Package, Image as ImageIcon, Tag, DollarSign, Layers } from 'lucide-react';
import { CMSProduct, ProductFormData } from '@/src/types';
import { Input } from '@/src/components/ui/Input';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormData) => Promise<void>;
  initialProduct?: CMSProduct | null;
  categories: string[];
}

// Yup Validation Schema for Product Creation & Edit
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-card border border-sage-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sage-border pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sage-accent text-sage-primary flex items-center justify-center font-bold border border-sage-border">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-sage-text leading-tight">
                {isEditing ? 'Edit Product Specification' : 'Create New Product'}
              </h3>
              <p className="text-xs text-sage-muted">Manage product parameters, pricing, and stock count</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sage-muted hover:text-sage-text p-1.5 rounded-full hover:bg-sage-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formik Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Row 1: Product Name & SKU */}
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
              <label className="text-xs font-bold text-sage-text">Category *</label>
              <select
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-sage-input-bg border border-sage-border text-xs rounded-2xl p-3 text-sage-text focus:outline-none focus:border-sage-primary font-bold cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-sage-text">CMS Status *</label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-sage-input-bg border border-sage-border text-xs rounded-2xl p-3 text-sage-text focus:outline-none focus:border-sage-primary font-bold cursor-pointer"
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

          {/* Row 4: Image URL & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              name="image"
              label="Image URL *"
              placeholder="https://images.unsplash.com/..."
              startContent={<ImageIcon className="w-4 h-4 text-sage-muted" />}
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
              startContent={<Tag className="w-4 h-4 text-sage-muted" />}
              value={formik.values.tags}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          {/* Row 5: Description Textarea */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-sage-text">Product Description *</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Provide detailed features, specifications, and selling points..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full bg-sage-input-bg border rounded-2xl p-3 text-xs font-semibold outline-none text-sage-text placeholder:text-sage-muted transition-all ${
                formik.touched.description && formik.errors.description
                  ? 'border-sage-danger focus:border-sage-danger'
                  : 'border-sage-border focus:border-sage-primary'
              }`}
            />
            {formik.touched.description && formik.errors.description && (
              <span className="text-[10px] text-sage-danger font-medium">{formik.errors.description}</span>
            )}
          </div>

          {/* Footer CTA Buttons */}
          <div className="flex justify-end gap-3 border-t border-sage-border pt-4 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-sage-muted hover:text-sage-text text-xs font-bold py-2.5 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isDisabled={formik.isSubmitting}
              className="bg-sage-primary hover:bg-sage-hover text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 min-h-[42px] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{formik.isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
