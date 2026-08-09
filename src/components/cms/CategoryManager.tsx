'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FolderTree, Plus, X, Layers, Tag } from 'lucide-react';
import { CMSCategory, CategoryFormData } from '@/src/types';
import { Input } from '@/src/components/ui/Input';

interface CategoryManagerProps {
  categories: CMSCategory[];
  onCreateCategory: (data: CategoryFormData) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onCreateCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formik = useFormik<CategoryFormData>({
    initialValues: { name: '', slug: '', description: '' },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Name is required').required('Name is required'),
      slug: Yup.string(),
      description: Yup.string(),
    }),
    onSubmit: async (values, helpers) => {
      await onCreateCategory(values);
      helpers.resetForm();
      setIsModalOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md">
        <div>
          <h3 className="font-extrabold text-base text-sage-text flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-sage-primary" /> Product Categories Catalog
          </h3>
          <p className="text-xs text-sage-muted">Organize your store inventory into searchable product categories</p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-sage-primary hover:bg-sage-hover text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-1.5 min-h-[42px] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-base text-sage-text">{cat.name}</h4>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-sage-accent text-sage-primary border border-sage-border">
                  {cat.productCount} Products
                </span>
              </div>
              <p className="text-xs text-sage-muted line-clamp-2">
                {cat.description || 'No detailed description provided for this category.'}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-sage-border flex items-center justify-between text-[11px] text-sage-muted">
              <span>Slug: <strong className="text-sage-text font-bold font-mono">{cat.slug}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Formik Create Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card border border-sage-border rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-sage-muted hover:text-sage-text p-1.5 rounded-full hover:bg-sage-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-lg text-sage-text border-b border-sage-border pb-3.5 mb-5 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-sage-primary" /> Add New Category
            </h3>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <Input
                name="name"
                label="Category Title *"
                placeholder="e.g. Wearables & Smart Tech"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.name && Boolean(formik.errors.name)}
                errorMessage={formik.touched.name && formik.errors.name}
              />

              <Input
                name="slug"
                label="Category Slug (Optional)"
                placeholder="wearables-smart-tech"
                value={formik.values.slug}
                onChange={formik.handleChange}
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-sage-text">Category Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detail the product types grouped under this category..."
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  className="w-full bg-sage-input-bg border border-sage-border rounded-2xl p-3 text-xs font-semibold outline-none text-sage-text placeholder:text-sage-muted focus:border-sage-primary transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-sage-border pt-4 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sage-muted hover:text-sage-text text-xs font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-sage-primary hover:bg-sage-hover text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl shadow-sm min-h-[42px]"
                >
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
