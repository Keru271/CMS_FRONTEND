'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { Search, Plus, Edit2, Trash2, Filter, Package, AlertCircle } from 'lucide-react';
import { CMSProduct } from '@/src/types';
import { Input } from '@/src/components/ui/Input';

interface ProductTableProps {
  products: CMSProduct[];
  categories: string[];
  onAddProduct: () => void;
  onEditProduct: (product: CMSProduct) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md">
        {/* Search Input */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Search products by title, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<Search className="w-4 h-4 text-sage-muted" />}
            isClearable
            onClear={() => setSearch('')}
          />
        </div>

        {/* Filter Dropdowns & Add Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-sage-input-bg border border-sage-border text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-sage-primary text-sage-text font-bold cursor-pointer"
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
            className="bg-sage-input-bg border border-sage-border text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-sage-primary text-sage-text font-bold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Live)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>

          {/* Add Product CTA */}
          <Button
            onClick={onAddProduct}
            className="bg-sage-primary hover:bg-sage-hover text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-1.5 min-h-[42px] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-3xl bg-white dark:bg-card border border-sage-border overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-sage-border bg-sage-accent/50 text-sage-muted uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-5">Product Details</th>
                <th className="py-4 px-4">SKU Code</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Stock Units</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-border/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sage-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-10 h-10 text-sage-primary/40" />
                      <span className="font-extrabold text-sm text-sage-text">No Products Found</span>
                      <span className="text-xs text-sage-muted">Try clearing search filters or add a new product.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-sage-accent/30 transition-colors group">
                    {/* Product info */}
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-11 h-11 object-cover rounded-2xl border border-sage-border bg-sage-input-bg shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sage-text text-xs line-clamp-1 group-hover:text-sage-primary transition-colors">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-sage-muted font-medium">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sage-text">{p.sku}</td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-sage-accent text-sage-primary border border-sage-border text-[10px] font-extrabold">
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-sage-text text-xs">${p.price.toFixed(2)}</div>
                      {p.originalPrice && (
                        <div className="text-[10px] text-sage-muted line-through font-semibold">
                          ${p.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-black text-xs ${
                            p.stockQuantity === 0
                              ? 'text-sage-danger'
                              : p.stockQuantity < 10
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-sage-text'
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
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          p.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                            : p.status === 'draft'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200'
                            : 'bg-sage-input-bg text-sage-muted border border-sage-border'
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
                          className="p-2 rounded-xl text-sage-muted hover:text-sage-primary hover:bg-sage-accent transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-2 rounded-xl text-sage-muted hover:text-sage-danger hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
        <div className="p-4 border-t border-sage-border text-xs text-sage-muted flex items-center justify-between">
          <span>
            Showing <strong className="text-sage-text font-black">{filteredProducts.length}</strong> of{' '}
            <strong className="text-sage-text font-black">{products.length}</strong> total catalog products
          </span>
        </div>
      </div>
    </div>
  );
};
