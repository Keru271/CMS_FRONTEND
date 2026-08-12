'use client';

import React, { useState, useEffect } from 'react';
import { CollectionManager } from '@/src/components/cms/CollectionManager';
import { CategoryManager } from '@/src/components/cms/CategoryManager';
import {
  CMSProduct,
  ProductFormData,
  CMSCategory,
  BrandData,
  CollectionData,
  ProductReviewData,
} from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  FolderTree,
  Sparkles,
  Layers,
  Star,
  Boxes,
  Building2,
  DollarSign,
  TrendingUp,
  Globe,
  UploadCloud,
  Check,
  X,
  RefreshCw,
  Sliders,
  Award,
  MessageSquare,
  ShieldCheck,
  ArrowUpRight,
  Code2,
} from 'lucide-react';

export const ProductStudio: React.FC = () => {
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [reviews, setReviews] = useState<ProductReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sub-Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'all-products' | 'add-product' | 'categories' | 'collections' | 'brands' | 'inventory' | 'reviews'
  >('all-products');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State for Add / Edit Product (All 23 options)
  const [editingProduct, setEditingProduct] = useState<CMSProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
    sku: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    taxRate: 10,
    taxable: true,
    inventory: 50,
    weight: 0.8,
    dimensions: '25 x 15 x 10 cm',
    sizeOptions: ['S', 'M', 'L', 'XL'],
    colorOptions: ['#3B82F6', '#18181B', '#EC4899'],
    material: '100% Organic Cotton',
    tags: 'bestseller, new-arrival, premium',
    brandName: 'AeroTech Lab',
    categoryName: 'Tech & Electronics',
    collectionName: 'Best Sellers 2026',
    metaTitle: '',
    metaDescription: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodList, catList, brandList, collList, revList] = await Promise.all([
        cmsService.getProducts(),
        cmsService.getCategories(),
        cmsService.getBrands(),
        cmsService.getCollections(),
        cmsService.getProductReviews(),
      ]);
      setProducts(prodList);
      setCategories(catList);
      setBrands(brandList);
      setCollections(collList);
      setReviews(revList);
    } catch (err) {
      console.error('Failed to load product studio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '<h2>Product Overview</h2>\n<p>Engineered for maximum performance and luxury aesthetic.</p>',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      price: 199.99,
      compareAtPrice: 249.99,
      costPrice: 85.0,
      taxRate: 10,
      taxable: true,
      inventory: 50,
      weight: 0.8,
      dimensions: '25 x 15 x 10 cm',
      sizeOptions: ['S', 'M', 'L', 'XL'],
      colorOptions: ['#3B82F6', '#18181B', '#EC4899'],
      material: 'Titanium & Memory Foam',
      tags: 'bestseller, featured',
      brandName: brands[0]?.name || 'AeroTech Lab',
      categoryName: categories[0]?.name || 'Tech & Electronics',
      collectionName: collections[0]?.name || 'Best Sellers 2026',
      metaTitle: '',
      metaDescription: '',
      status: 'ACTIVE',
    });
    setActiveSubTab('add-product');
  };

  const handleOpenEditProduct = (prod: CMSProduct) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      images: prod.images && prod.images.length > 0 ? prod.images : [prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
      sku: prod.sku,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || '',
      costPrice: prod.costPrice || '',
      taxRate: prod.taxRate || 0,
      taxable: prod.taxable !== false,
      inventory: prod.inventory || prod.stockQuantity || 0,
      weight: prod.weight || 0,
      dimensions: prod.dimensions || '',
      sizeOptions: prod.sizeOptions || ['S', 'M', 'L'],
      colorOptions: prod.colorOptions || ['#3B82F6', '#000000'],
      material: prod.material || '',
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : prod.tags || '',
      brandName: prod.brandName || '',
      categoryName: prod.categoryName || prod.category || '',
      collectionName: prod.collectionName || '',
      metaTitle: prod.metaTitle || '',
      metaDescription: prod.metaDescription || '',
      status: prod.status || 'ACTIVE',
    });
    setActiveSubTab('add-product');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingProduct) {
        await cmsService.updateProduct(editingProduct.id, formData);
        showToast(`Product "${formData.name}" updated successfully!`, 'success');
      } else {
        await cmsService.createProduct(formData);
        showToast(`New Product "${formData.name}" created!`, 'success');
      }
      await loadData();
      setActiveSubTab('all-products');
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await cmsService.deleteProduct(id);
        showToast(`Product "${name}" deleted.`, 'success');
        await loadData();
      } catch (err) {
        showToast('Failed to delete product.', 'error');
      }
    }
  };

  const handleToggleReviewStatus = async (id: string, newStatus: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    try {
      await cmsService.updateReviewStatus(id, newStatus);
      showToast(`Review status updated to ${newStatus}`, 'success');
      const updatedRevs = await cmsService.getProductReviews();
      setReviews(updatedRevs);
    } catch (err) {
      showToast('Failed to update review status.', 'error');
    }
  };

  // Calculations for Margin & Profit
  const sellingPriceNum = parseFloat(String(formData.price)) || 0;
  const costPriceNum = parseFloat(String(formData.costPrice)) || 0;
  const profitMarginNum = sellingPriceNum - costPriceNum;
  const profitMarginPercent = sellingPriceNum > 0 ? ((profitMarginNum / sellingPriceNum) * 100).toFixed(1) : 0;

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL' && p.status.toUpperCase() !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && (p.categoryName || p.category) !== categoryFilter) return false;

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Product Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner & Sub-Tabs Navigation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Catalog & Inventory Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {products.length} Products Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-400" />
              <span>Products Management Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Complete catalog suite with 7 sub-modules: All Products, Add Product (23 Options), Categories, Collections, Brands, Inventory Control, and Reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddProduct}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-700/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'all-products', label: 'All Products', icon: Package, badge: products.length },
            { id: 'add-product', label: editingProduct ? 'Edit Product' : 'Add Product (23 Options)', icon: Plus },
            { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
            { id: 'collections', label: 'Collections', icon: Layers, badge: collections.length },
            { id: 'brands', label: 'Brands', icon: Building2, badge: brands.length },
            { id: 'inventory', label: 'Inventory Control', icon: Boxes },
            { id: 'reviews', label: 'Product Reviews', icon: Star, badge: reviews.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-MODULE 1: ALL PRODUCTS TABLE */}
      {activeSubTab === 'all-products' && (
        <div className="space-y-6">
          {/* Search & Filter Options Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Tabs Filter */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
              {[
                { id: 'ALL', label: `All (${products.length})` },
                { id: 'ACTIVE', label: `Active (${products.filter((p) => (p.status || '').toUpperCase() === 'ACTIVE').length})` },
                { id: 'DRAFT', label: `Draft (${products.filter((p) => (p.status || '').toUpperCase() === 'DRAFT').length})` },
                { id: 'ARCHIVED', label: `Archived (${products.filter((p) => (p.status || '').toUpperCase() === 'ARCHIVED').length})` },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    statusFilter === st.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Category Dropdown Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 text-xs font-bold"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product name or SKU..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-4">SKU</th>
                    <th className="py-4 px-4">Category / Brand</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Inventory</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border text-xs">
                  {filteredProducts.map((prod) => {
                    const stock = prod.inventory ?? prod.stockQuantity ?? 0;
                    const imgUrl =
                      prod.images && prod.images.length > 0
                        ? prod.images[0]
                        : prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-accent/30 transition-colors">
                        {/* Product info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <img src={imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-foreground block text-sm">
                                {prod.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                                {prod.material ? `${prod.material} • ` : ''}
                                {Array.isArray(prod.tags) ? prod.tags.join(', ') : prod.tags || ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-4 px-4 font-mono font-bold text-slate-600">{prod.sku}</td>

                        {/* Category & Brand */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-800 dark:text-foreground block">
                            {prod.categoryName || prod.category || 'General'}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold block">
                            {prod.brandName || 'Store Brand'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 font-black text-slate-900 dark:text-foreground text-sm">
                          ${typeof prod.price === 'number' ? prod.price.toFixed(2) : prod.price}
                          {prod.compareAtPrice && (
                            <span className="text-[10px] text-slate-400 line-through block font-normal">
                              ${prod.compareAtPrice}
                            </span>
                          )}
                        </td>

                        {/* Inventory */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              stock > 10
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : stock > 0
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {stock > 0 ? `${stock} in stock` : 'Out of Stock'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              (prod.status || '').toUpperCase() === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : (prod.status || '').toUpperCase() === 'DRAFT'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {(prod.status || 'ACTIVE').toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              title="Edit All 23 Product Attributes"
                              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              title="Delete Product"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODULE 2: ADD / EDIT PRODUCT FORM (ALL 23 OPTIONS) */}
      {activeSubTab === 'add-product' && (
        <form onSubmit={handleSaveProduct} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-foreground">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create Product (23 Options Form)'}
              </h2>
              <p className="text-xs text-slate-500">Configure name, pricing, SKU, profit margins, taxes, inventory, dimensions, variants, size/color options, SEO, and status.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('all-products')}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Product...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Product</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: CORE OPTIONS & MEDIA (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Basic Product Info */}
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Product Title & Media</span>
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. AeroPulse Wireless Headphones"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Description (HTML / Markdown)</label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product features, craft details, and care instructions..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium"
                    />
                  </div>

                  {/* Images list */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Images & Media URLs</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={(formData.images && formData.images[0]) || ''}
                        onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Pricing & Cost Profit Margin Calculation */}
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Pricing, Costs & Profit Margins</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Selling Price ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Compare-at Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.compareAtPrice || ''}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      placeholder="e.g. 249.99"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Cost Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPrice || ''}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="e.g. 85.00"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Profit Margin Box */}
                {sellingPriceNum > 0 && costPriceNum > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900">Estimated Profit per Unit</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700 block">${profitMarginNum.toFixed(2)}</span>
                      <span className="text-[10px] font-extrabold text-emerald-600">{profitMarginPercent}% Margin</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Inventory, SKU, Weight & Dimensions */}
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Boxes className="w-4 h-4 text-amber-600" />
                  <span>Inventory, SKU & Shipping Specifications</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      SKU Handle <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Current Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.inventory}
                      onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g. 0.8"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Dimensions (L x W x H)</label>
                    <input
                      type="text"
                      value={formData.dimensions || ''}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="25 x 15 x 10 cm"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: VARIANTS, CATEGORIES, SEO & STATUS (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Product Status Box */}
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
                  Product Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Visible on Storefront)</option>
                  <option value="DRAFT">DRAFT (Hidden Draft)</option>
                  <option value="ARCHIVED">ARCHIVED (Archived Product)</option>
                </select>
              </div>

              {/* Organization: Brand, Category, Collection */}
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground border-b border-slate-100 pb-2">
                  Storefront Organization
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Product Category</label>
                    <select
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Brand</label>
                    <select
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Collection</label>
                    <select
                      value={formData.collectionName}
                      onChange={(e) => setFormData({ ...formData, collectionName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    >
                      {collections.map((col) => (
                        <option key={col.id} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Material Spec</label>
                    <input
                      type="text"
                      value={formData.material || ''}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g. 100% Organic Cotton"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Product Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags || ''}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="bestseller, summer, limited"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Box */}
              <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-200/60 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>SEO Search Engine Settings</span>
                </h3>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Meta Title"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Meta Description"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUB-MODULE 3: CATEGORIES MANAGER */}
      {activeSubTab === 'categories' && <CategoryManager initialTab="CATEGORIES" />}

      {/* SUB-MODULE 4: COLLECTIONS MANAGER STUDIO */}
      {activeSubTab === 'collections' && <CategoryManager initialTab="COLLECTIONS" />}

      {/* SUB-MODULE 5: BRANDS DIRECTORY */}
      {activeSubTab === 'brands' && <CategoryManager initialTab="BRANDS" />}

      {/* SUB-MODULE 6: INVENTORY CONTROL */}
      {activeSubTab === 'inventory' && (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <span>Warehouse Stock & Threshold Controller</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[11px] font-extrabold uppercase text-slate-500">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Stock Alert Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const stock = p.inventory ?? p.stockQuantity ?? 0;
                  return (
                    <tr key={p.id}>
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 font-mono">{p.sku}</td>
                      <td className="p-3 font-black">{stock} units</td>
                      <td className="p-3">
                        {stock <= 10 ? (
                          <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                            ⚠️ Low Stock Alert
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            ✓ Healthy Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-MODULE 7: PRODUCT REVIEWS MODERATION */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">{rev.title}</span>
                  {rev.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      Verified Buyer
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{rev.comment}</p>
                <span className="text-[10px] font-bold text-slate-400">
                  By {rev.userName} for {rev.productName} • {rev.createdAt}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    rev.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : rev.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {rev.status}
                </span>
                {rev.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleToggleReviewStatus(rev.id, 'APPROVED')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Approve
                  </button>
                )}
                {rev.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => handleToggleReviewStatus(rev.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
