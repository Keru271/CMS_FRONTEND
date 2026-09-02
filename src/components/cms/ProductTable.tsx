'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { Search, Plus, Edit2, Trash2, Package, AlertCircle, FileSpreadsheet, Download } from 'lucide-react';
import { CMSProduct } from '@/src/types';
import { ProductImportModal } from '@/src/components/cms/ProductImportModal';
import { ProductExportModal } from '@/src/components/cms/ProductExportModal';

interface ProductTableProps {
  products: CMSProduct[];
  categories: string[];
  onAddProduct: () => void;
  onEditProduct: (product: CMSProduct) => void;
  onDeleteProduct: (id: string) => void;
  onRefreshProducts?: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onRefreshProducts,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Table Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#5e5a5a] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products by title, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans text-[#191a1b] placeholder:text-[#beb9b3] outline-none focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 transition-all"
          />
        </div>

        {/* Filter Dropdowns & Add Action */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-none min-w-[130px] bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans rounded-lg px-3 py-2 focus:outline-none focus:border-[#cbc2ea] text-[#191a1b] font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 sm:flex-none min-w-[130px] bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans rounded-lg px-3 py-2 focus:outline-none focus:border-[#cbc2ea] text-[#191a1b] font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Live)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>

          {/* Import / Export / Add Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 sm:flex-none justify-center bg-[#fdf1ef] hover:bg-[#fae1dc] border border-[#cbd5e0] text-[#191a1b] font-sans font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 sm:flex-none justify-center bg-[#fdf1ef] hover:bg-[#fae1dc] border border-[#cbd5e0] text-[#191a1b] font-sans font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#6366f1]" />
              <span>Export</span>
            </button>

            <button
              onClick={onAddProduct}
              className="flex-1 sm:flex-none justify-center bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] font-sans font-medium text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4ff4c]" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-2xl bg-[#ffffff] border border-[#cbd5e0] overflow-hidden shadow-statamic">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[680px]">
            <thead className="border-b border-[#cbd5e0] bg-[#fdf1ef] text-[#5e5a5a] uppercase font-medium text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-5">Product Details</th>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Units</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbd5e0]/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#5e5a5a]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-10 h-10 text-[#beb9b3]" />
                      <span className="font-serif text-lg text-[#191a1b]">No Products Found</span>
                      <span className="text-xs font-sans text-[#5e5a5a]">Try clearing search filters or add a new product.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fdf1ef]/60 transition-colors group">
                    {/* Product info */}
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-[#cbd5e0] bg-[#fdf1ef] shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-sans font-medium text-[#191a1b] text-xs line-clamp-1 group-hover:text-[#4c305a] transition-colors">
                            {p.name}
                          </h4>
                          <span className="text-[10px] font-mono text-[#5e5a5a]">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#191a1b]">{p.sku}</td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#f5ddee] text-[#191a1b] border border-[#cbc2ea] text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#191a1b] text-xs">${p.price.toFixed(2)}</div>
                      {p.originalPrice && (
                        <div className="text-[10px] font-mono text-[#5e5a5a] line-through">
                          ${p.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-sans font-medium text-xs ${
                            p.stockQuantity === 0
                              ? 'text-[#ef4444]'
                              : p.stockQuantity < 10
                              ? 'text-amber-700'
                              : 'text-[#191a1b]'
                          }`}
                        >
                          {p.stockQuantity} units
                        </span>
                        {p.stockQuantity < 10 && (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-medium uppercase tracking-wider ${
                          p.status === 'active'
                            ? 'bg-[#d4ff4c]/40 text-[#191a1b] border border-[#191a1b]'
                            : p.status === 'draft'
                            ? 'bg-[#d7e5fe] text-[#191a1b] border border-[#cbd5e0]'
                            : 'bg-[#fdf1ef] text-[#5e5a5a] border border-[#cbd5e0]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="p-1.5 rounded-lg text-[#5e5a5a] hover:text-[#191a1b] hover:bg-[#fdf1ef] transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-[#5e5a5a] hover:text-[#ef4444] hover:bg-rose-50 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-[#cbd5e0] text-xs font-sans text-[#5e5a5a] flex items-center justify-between">
          <span>
            Showing <strong className="text-[#191a1b] font-medium">{filteredProducts.length}</strong> of{' '}
            <strong className="text-[#191a1b] font-medium">{products.length}</strong> total catalog products
          </span>
        </div>
      </div>

      {/* Product Import Modal */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          if (onRefreshProducts) onRefreshProducts();
          window.location.reload();
        }}
      />

      {/* Product Export Modal */}
      <ProductExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        totalProductsCount={products.length}
        filteredProductsCount={filteredProducts.length}
        currentFilters={{
          status: selectedStatus,
          category: selectedCategory,
          search,
        }}
      />
    </div>
  );
};
