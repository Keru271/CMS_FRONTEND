'use client';

import React, { useState, useEffect } from 'react';
import { CollectionData, CollectionRule, CMSProduct } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Trash2,
  Edit2,
  Eye,
  Check,
  X,
  Sparkles,
  Globe,
  RefreshCw,
  FolderTree,
  Filter,
  Image as ImageIcon,
  CheckSquare,
  Square,
  ArrowRight,
  Code2,
} from 'lucide-react';

export const CollectionManager: React.FC = () => {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Collection Form State
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    image: string;
    description: string;
    type: 'MANUAL' | 'AUTOMATIC';
    rules: CollectionRule[];
    ruleMatch: 'ALL' | 'ANY';
    manualProductIds: string[];
    featured: boolean;
    metaTitle: string;
    metaDescription: string;
  }>({
    name: '',
    slug: '',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: '',
    type: 'AUTOMATIC',
    rules: [{ field: 'tag', operator: 'contains', value: 'bestseller' }],
    ruleMatch: 'ALL',
    manualProductIds: [],
    featured: true,
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [collList, prodList] = await Promise.all([
        cmsService.getCollections(),
        cmsService.getProducts(),
      ]);
      setCollections(collList);
      setProducts(prodList);
    } catch (err) {
      console.error('Failed to load collections data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      slug: '/collections/',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      description: 'Curated seasonal collection of premium merchandise.',
      type: 'AUTOMATIC',
      rules: [{ field: 'tag', operator: 'contains', value: 'bestseller' }],
      ruleMatch: 'ALL',
      manualProductIds: [],
      featured: true,
      metaTitle: '',
      metaDescription: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coll: CollectionData) => {
    setEditingCollection(coll);
    setFormData({
      name: coll.name,
      slug: coll.slug,
      image: coll.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      description: coll.description || '',
      type: (coll.type as any) || 'MANUAL',
      rules: coll.rules && coll.rules.length > 0 ? coll.rules : [{ field: 'tag', operator: 'contains', value: 'summer' }],
      ruleMatch: (coll.ruleMatch as any) || 'ALL',
      manualProductIds: coll.manualProductIds || [],
      featured: coll.featured || false,
      metaTitle: coll.metaTitle || '',
      metaDescription: coll.metaDescription || '',
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (newName: string) => {
    if (!editingCollection) {
      const generatedSlug = `/collections/${newName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')}`;
      setFormData({
        ...formData,
        name: newName,
        slug: generatedSlug,
        metaTitle: `${newName} Collection | OmniStore`,
      });
    } else {
      setFormData({ ...formData, name: newName });
    }
  };

  const handleAddRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, { field: 'price', operator: 'less_than', value: '100' }],
    });
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: updatedRules });
  };

  const handleRuleChange = (index: number, key: keyof CollectionRule, val: string) => {
    const updatedRules = [...formData.rules];
    updatedRules[index] = { ...updatedRules[index], [key]: val };
    setFormData({ ...formData, rules: updatedRules });
  };

  const handleToggleManualProduct = (prodId: string) => {
    const exists = formData.manualProductIds.includes(prodId);
    let updated: string[];
    if (exists) {
      updated = formData.manualProductIds.filter((id) => id !== prodId);
    } else {
      updated = [...formData.manualProductIds, prodId];
    }
    setFormData({ ...formData, manualProductIds: updated });
  };

  // Real-Time Dynamic Rules Evaluator Engine
  const evaluateMatchingProducts = (rules: CollectionRule[], matchType: 'ALL' | 'ANY', manualIds: string[], colType: 'MANUAL' | 'AUTOMATIC') => {
    if (colType === 'MANUAL') {
      return products.filter((p) => manualIds.includes(p.id));
    }

    if (!rules || rules.length === 0) return products;

    return products.filter((p) => {
      const results = rules.map((rule) => {
        const val = rule.value.toLowerCase();
        let targetValue = '';

        if (rule.field === 'title') targetValue = p.name.toLowerCase();
        else if (rule.field === 'category') targetValue = (p.categoryName || p.category || '').toLowerCase();
        else if (rule.field === 'brand') targetValue = (p.brandName || '').toLowerCase();
        else if (rule.field === 'tag') targetValue = (Array.isArray(p.tags) ? p.tags.join(' ') : p.tags || '').toLowerCase();
        else if (rule.field === 'price') {
          const numPrice = p.price;
          const numRule = parseFloat(rule.value) || 0;
          if (rule.operator === 'less_than') return numPrice < numRule;
          if (rule.operator === 'greater_than') return numPrice > numRule;
          if (rule.operator === 'equals') return numPrice === numRule;
        } else if (rule.field === 'inventory') {
          const numStock = p.inventory ?? p.stockQuantity ?? 0;
          const numRule = parseInt(rule.value, 10) || 0;
          if (rule.operator === 'less_than') return numStock < numRule;
          if (rule.operator === 'greater_than') return numStock > numRule;
          if (rule.operator === 'equals') return numStock === numRule;
        } else if (rule.field === 'compareAtPrice') {
          if (rule.operator === 'is_set') return !!p.compareAtPrice;
          if (rule.operator === 'is_not_set') return !p.compareAtPrice;
        }

        if (rule.operator === 'equals') return targetValue === val;
        if (rule.operator === 'not_equals') return targetValue !== val;
        if (rule.operator === 'contains') return targetValue.includes(val);
        if (rule.operator === 'not_contains') return !targetValue.includes(val);
        if (rule.operator === 'starts_with') return targetValue.startsWith(val);
        if (rule.operator === 'ends_with') return targetValue.endsWith(val);

        return false;
      });

      if (matchType === 'ALL') {
        return results.every(Boolean);
      } else {
        return results.some(Boolean);
      }
    });
  };

  const matchingProductsPreview = evaluateMatchingProducts(
    formData.rules,
    formData.ruleMatch,
    formData.manualProductIds,
    formData.type
  );

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<CollectionData> = {
        name: formData.name,
        slug: formData.slug,
        image: formData.image,
        description: formData.description,
        type: formData.type,
        rules: formData.rules,
        ruleMatch: formData.ruleMatch,
        manualProductIds: formData.manualProductIds,
        featured: formData.featured,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        productCount: matchingProductsPreview.length,
      };

      if (editingCollection) {
        await cmsService.updateCollection(editingCollection.id, payload);
        showToast(`Collection "${formData.name}" updated successfully!`, 'success');
      } else {
        await cmsService.createCollection(payload);
        showToast(`New Collection "${formData.name}" created!`, 'success');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save collection.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Collection Rules Engine...</span>
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

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Rule Engine & Automation
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {collections.length} Collections Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-400" />
              <span>Collection & Rules Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Build manual product groupings or construct automatic conditional rule triggers (Price, Category, Brand, Tags, Compare-at Price) that dynamically match products in real time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Collection</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collection name or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
          Showing {filteredCollections.length} of {collections.length} Collections
        </span>
      </div>

      {/* COLLECTIONS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((coll) => {
          const isAutomated = coll.type === 'AUTOMATIC';

          return (
            <div
              key={coll.id}
              className="rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Collection Image Banner */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                  <img
                    src={coll.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
                    alt={coll.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-70" />

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1.5 ${
                        isAutomated
                          ? 'bg-indigo-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isAutomated ? <Sparkles className="w-3 h-3" /> : <FolderTree className="w-3 h-3" />}
                      <span>{isAutomated ? 'Automated Rules' : 'Manual Selection'}</span>
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-foreground">{coll.name}</h3>
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold block">
                      {coll.slug}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{coll.description}</p>

                  {/* Condition Rules / Products Count */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-accent space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">Matching Products:</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400">{coll.productCount || 0} Items</span>
                    </div>

                    {isAutomated && coll.rules && coll.rules.length > 0 && (
                      <span className="text-[10px] text-slate-500 block truncate">
                        Rules: {coll.rules.map((r) => `${r.field} ${r.operator} "${r.value}"`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex items-center gap-2 border-t border-slate-100 dark:border-border mt-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(coll)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-800 dark:text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Collection & Rules</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT COLLECTION MODAL WITH AUTOMATIC RULES BUILDER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    {editingCollection ? `Edit Collection: ${editingCollection.name}` : 'Create New Collection'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure collection image, description, manual product picker, or automated rule triggers.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Collection Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Collection Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Summer Essentials 2026"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">URL Slug Handle</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="/collections/summer-essentials"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                  />
                </div>

                {/* Collection Image */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Collection Banner Image URL
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-semibold"
                    />
                    <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Collection Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description displayed on storefront collection header banner..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium"
                  />
                </div>
              </div>

              {/* COLLECTION TYPE SWITCHER (MANUAL vs AUTOMATIC) */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  Collection Assignment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'MANUAL' })}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                      formData.type === 'MANUAL'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-extrabold text-xs block">Manual Assignment</span>
                    <span className="text-[10px] text-slate-400 block">Hand-pick individual products one by one.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'AUTOMATIC' })}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                      formData.type === 'AUTOMATIC'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-extrabold text-xs block">Automated Conditions Engine</span>
                    <span className="text-[10px] text-indigo-100 block">Dynamically match products based on rules.</span>
                  </button>
                </div>

                {/* AUTOMATIC RULES BUILDER ENGINE */}
                {formData.type === 'AUTOMATIC' && (
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        <span>Automated Rule Conditions</span>
                      </span>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span>Match products that satisfy:</span>
                        <select
                          value={formData.ruleMatch}
                          onChange={(e) => setFormData({ ...formData, ruleMatch: e.target.value as any })}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-extrabold text-indigo-600"
                        >
                          <option value="ALL">ALL Conditions (AND)</option>
                          <option value="ANY">ANY Condition (OR)</option>
                        </select>
                      </div>
                    </div>

                    {/* Rules List Input Rows */}
                    <div className="space-y-3">
                      {formData.rules.map((rule, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200">
                          {/* Field */}
                          <select
                            value={rule.field}
                            onChange={(e) => handleRuleChange(idx, 'field', e.target.value)}
                            className="w-full sm:w-44 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                          >
                            <option value="tag">Product Tag</option>
                            <option value="title">Product Title</option>
                            <option value="category">Category</option>
                            <option value="brand">Brand Name</option>
                            <option value="price">Selling Price ($)</option>
                            <option value="inventory">Inventory Stock</option>
                            <option value="compareAtPrice">Compare-at Price</option>
                          </select>

                          {/* Operator */}
                          <select
                            value={rule.operator}
                            onChange={(e) => handleRuleChange(idx, 'operator', e.target.value)}
                            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                          >
                            <option value="contains">Contains</option>
                            <option value="equals">Is Equal To</option>
                            <option value="not_equals">Is Not Equal To</option>
                            <option value="starts_with">Starts With</option>
                            <option value="less_than">Is Less Than</option>
                            <option value="greater_than">Is Greater Than</option>
                            <option value="is_set">Is Set (Discounted)</option>
                          </select>

                          {/* Value */}
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                            placeholder="Condition value..."
                            className="w-full sm:flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                          />

                          {/* Remove button */}
                          {formData.rules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRule(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-extrabold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>Add Another Rule Condition</span>
                    </button>
                  </div>
                )}

                {/* MANUAL PRODUCTS PICKER */}
                {formData.type === 'MANUAL' && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <span className="text-xs font-extrabold text-slate-800 block">
                      Select Products to Include in Manual Collection ({formData.manualProductIds.length} Selected):
                    </span>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white">
                      {products.map((p) => {
                        const isSelected = formData.manualProductIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleManualProduct(p.id)}
                            className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-slate-800">{p.name}</span>
                            </div>
                            <span className="text-xs font-black text-slate-900">${p.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* REAL-TIME DYNAMIC MATCHING PRODUCTS PREVIEW CANVAS */}
                <div className="p-4 rounded-2xl bg-indigo-900 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Live Real-Time Rule Evaluator Preview</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                      ✓ {matchingProductsPreview.length} Products Matching
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchingProductsPreview.slice(0, 5).map((mp) => (
                      <span key={mp.id} className="px-2.5 py-1 rounded-xl bg-white/10 text-white text-[11px] font-bold">
                        {mp.name} (${mp.price})
                      </span>
                    ))}
                    {matchingProductsPreview.length > 5 && (
                      <span className="px-2.5 py-1 rounded-xl bg-white/20 text-white text-[11px] font-bold">
                        +{matchingProductsPreview.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
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
                      <span>Saving Collection...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Publish Collection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
