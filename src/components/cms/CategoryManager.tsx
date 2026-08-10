'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FolderTree, Plus, X } from 'lucide-react';
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
    <div className="space-y-6 font-sans">
      {/* Top Action Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic">
        <div>
          <h3 className="font-serif font-normal text-xl text-[#191a1b] flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#191a1b]" /> Product Taxonomy & Categories
          </h3>
          <p className="text-xs font-sans text-[#5e5a5a]">Organize store inventory into searchable editorial collections</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] font-sans font-medium text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4 text-[#d4ff4c]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic hover:border-[#cbc2ea] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif font-normal text-lg text-[#191a1b]">{cat.name}</h4>
                <span className="px-3 py-1 rounded-full text-[10px] font-sans font-medium bg-[#f5ddee] text-[#191a1b] border border-[#cbc2ea]">
                  {cat.productCount} Items
                </span>
              </div>
              <p className="text-xs font-sans text-[#5e5a5a] line-clamp-2">
                {cat.description || 'No detailed description provided for this category.'}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#cbd5e0]/60 flex items-center justify-between text-[11px] font-sans text-[#5e5a5a]">
              <span>Slug: <strong className="text-[#191a1b] font-mono font-bold">{cat.slug}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Formik Create Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#191a1b]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#cbd5e0] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-statamic relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#5e5a5a] hover:text-[#191a1b] p-1.5 rounded-lg hover:bg-[#fdf1ef] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-normal text-xl text-[#191a1b] border-b border-[#cbd5e0]/60 pb-3 mb-5 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#191a1b]" /> Create Category
            </h3>

            <form onSubmit={formik.handleSubmit} className="space-y-4 font-sans">
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
                <label className="text-xs font-sans font-medium text-[#191a1b]">Category Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detail the product types grouped under this category..."
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  className="w-full bg-[#ffffff] border border-[#cbd5e0] rounded-lg p-2.5 text-xs font-sans outline-none text-[#191a1b] placeholder:text-[#beb9b3] focus:border-[#cbc2ea] transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#cbd5e0]/60 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-[#191a1b] border border-[#cbc2ea] hover:bg-[#fdf1ef] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] font-sans font-medium text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
