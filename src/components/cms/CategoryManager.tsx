'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Tag,
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Globe,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import {
  CMSCategory,
  CategoryFormData,
  BrandData,
  BrandFormData,
  CollectionData,
  CollectionFormData,
} from '@/src/types';
import { cmsService } from '@/src/services/cmsService';

interface CategoryManagerProps {
  initialTab?: 'CATEGORIES' | 'BRANDS' | 'COLLECTIONS';
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ initialTab = 'CATEGORIES' }) => {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'BRANDS' | 'COLLECTIONS'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data States
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CMSCategory | null>(null);
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    icon: '📦',
    description: '',
  });

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandData | null>(null);
  const [brandModalError, setBrandModalError] = useState<string | null>(null);
  const [brandFormData, setBrandFormData] = useState<BrandFormData>({
    name: '',
    slug: '',
    logo: '',
    description: '',
    website: '',
    status: 'ACTIVE',
  });

  // Collection Modal State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionData | null>(null);
  const [collectionModalError, setCollectionModalError] = useState<string | null>(null);
  const [collectionFormData, setCollectionFormData] = useState<CollectionFormData>({
    name: '',
    slug: '',
    image: '',
    description: '',
    type: 'MANUAL',
    featured: false,
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [cats, brds, cols] = await Promise.all([
        cmsService.getCategories(),
        cmsService.getBrands(),
        cmsService.getCollections(),
      ]);
      setCategories(cats);
      setBrands(brds);
      setCollections(cols);
    } catch (err) {
      console.error('Failed to load taxonomy data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- CATEGORIES HANDLERS ---
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryModalError(null);
    setCategoryFormData({ name: '', slug: '', icon: '📦', description: '' });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CMSCategory) => {
    setEditingCategory(cat);
    setCategoryModalError(null);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '📦',
      description: cat.description || '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryModalError(null);
    setIsSaving(true);
    try {
      const payload: CategoryFormData = {
        name: categoryFormData.name,
        slug: (categoryFormData.slug || categoryFormData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')).toLowerCase(),
        icon: categoryFormData.icon || '📦',
        description: categoryFormData.description,
      };

      if (editingCategory) {
        await cmsService.updateCategory(editingCategory.id, payload);
        showToast(`Category "${payload.name}" updated!`, 'success');
      } else {
        await cmsService.createCategory(payload);
        showToast(`Category "${payload.name}" created!`, 'success');
      }

      setIsCategoryModalOpen(false);
      const updatedCats = await cmsService.getCategories(true);
      setCategories(updatedCats);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save category.';
      setCategoryModalError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      setIsSaving(true);
      await cmsService.deleteCategory(id);
      showToast(`Category "${name}" deleted!`, 'success');
      const updatedCats = await cmsService.getCategories(true);
      setCategories(updatedCats);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete category.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- BRANDS HANDLERS ---
  const handleOpenCreateBrand = () => {
    setEditingBrand(null);
    setBrandModalError(null);
    setBrandFormData({ name: '', slug: '', logo: '', description: '', website: '', status: 'ACTIVE' });
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: BrandData) => {
    setEditingBrand(brand);
    setBrandModalError(null);
    setBrandFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      description: brand.description || '',
      website: brand.website || '',
      status: brand.status || 'ACTIVE',
    });
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandModalError(null);
    setIsSaving(true);
    try {
      const payload: BrandFormData = {
        name: brandFormData.name,
        slug: (brandFormData.slug || brandFormData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')).toLowerCase(),
        logo: brandFormData.logo,
        description: brandFormData.description,
        website: brandFormData.website,
        status: brandFormData.status || 'ACTIVE',
      };

      if (editingBrand) {
        await cmsService.updateBrand(editingBrand.id, payload);
        showToast(`Brand "${payload.name}" updated!`, 'success');
      } else {
        await cmsService.createBrand(payload);
        showToast(`Brand "${payload.name}" created!`, 'success');
      }

      setIsBrandModalOpen(false);
      const updatedBrands = await cmsService.getBrands(true);
      setBrands(updatedBrands);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save brand.';
      setBrandModalError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete brand "${name}"?`)) return;
    try {
      setIsSaving(true);
      await cmsService.deleteBrand(id);
      showToast(`Brand "${name}" deleted!`, 'success');
      const updatedBrands = await cmsService.getBrands(true);
      setBrands(updatedBrands);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete brand.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- COLLECTIONS HANDLERS ---
  const handleOpenCreateCollection = () => {
    setEditingCollection(null);
    setCollectionModalError(null);
    setCollectionFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      type: 'MANUAL',
      featured: false,
      metaTitle: '',
      metaDescription: '',
    });
    setIsCollectionModalOpen(true);
  };

  const handleOpenEditCollection = (coll: CollectionData) => {
    setEditingCollection(coll);
    setCollectionModalError(null);
    setCollectionFormData({
      name: coll.name,
      slug: coll.slug,
      image: coll.image || '',
      description: coll.description || '',
      type: coll.type || 'MANUAL',
      featured: !!coll.featured,
      metaTitle: coll.metaTitle || '',
      metaDescription: coll.metaDescription || '',
    });
    setIsCollectionModalOpen(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollectionModalError(null);
    setIsSaving(true);
    try {
      const payload: CollectionFormData = {
        name: collectionFormData.name,
        slug: (collectionFormData.slug || collectionFormData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')).toLowerCase(),
        image: collectionFormData.image,
        description: collectionFormData.description,
        type: collectionFormData.type || 'MANUAL',
        featured: !!collectionFormData.featured,
        metaTitle: collectionFormData.metaTitle,
        metaDescription: collectionFormData.metaDescription,
      };

      if (editingCollection) {
        await cmsService.updateCollection(editingCollection.id, payload);
        showToast(`Collection "${payload.name}" updated!`, 'success');
      } else {
        await cmsService.createCollection(payload);
        showToast(`Collection "${payload.name}" created!`, 'success');
      }

      setIsCollectionModalOpen(false);
      const updatedCols = await cmsService.getCollections(true);
      setCollections(updatedCols);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save collection.';
      setCollectionModalError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete collection "${name}"?`)) return;
    try {
      setIsSaving(true);
      await cmsService.deleteCollection(id);
      showToast(`Collection "${name}" deleted!`, 'success');
      const updatedCols = await cmsService.getCollections(true);
      setCollections(updatedCols);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete collection.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered lists by search query
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Taxonomy Studio...</span>
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
                Taxonomy & Catalog Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-indigo-400" />
              <span>Taxonomy Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Add, edit, and manage Categories, Manufacturer Brands, and Curated Product Collections linked with Fastify backend APIs & PostgreSQL storage.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab === 'CATEGORIES' && (
              <button
                type="button"
                onClick={handleOpenCreateCategory}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
            {activeTab === 'BRANDS' && (
              <button
                type="button"
                onClick={handleOpenCreateBrand}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Brand</span>
              </button>
            )}
            {activeTab === 'COLLECTIONS' && (
              <button
                type="button"
                onClick={handleOpenCreateCollection}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Collection</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & SEARCH BAR */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2.5 shrink-0 ${
              activeTab === 'CATEGORIES'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {categories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BRANDS')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2.5 shrink-0 ${
              activeTab === 'BRANDS'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Brands</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {brands.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COLLECTIONS')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2.5 shrink-0 ${
              activeTab === 'COLLECTIONS'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Collections</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {collections.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold outline-none"
          />
        </div>
      </div>

      {/* --- TAB CONTENT 1: CATEGORIES --- */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 flex items-center justify-center text-xl">
                        {cat.icon || '📦'}
                      </span>
                      <div>
                        <h3 className="font-black text-base text-slate-900 dark:text-foreground">{cat.name}</h3>
                        <span className="text-[11px] font-mono text-indigo-600 font-bold">/{cat.slug}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300">
                      {cat.productCount || 0} Items
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description || 'No category description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Added: {cat.createdAt || 'Standard System'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: BRANDS --- */}
      {activeTab === 'BRANDS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <span className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-accent flex items-center justify-center font-black text-slate-700 text-sm">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <h3 className="font-black text-base text-slate-900 dark:text-foreground">{brand.name}</h3>
                        <span className="text-[11px] font-mono text-indigo-600 font-bold">handle: {brand.slug}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        brand.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {brand.status || 'ACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {brand.description || 'No manufacturer brand overview provided.'}
                  </p>

                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{brand.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Products: {brand.productCount || 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBrand(brand)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBrand(brand.id, brand.name)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 3: COLLECTIONS --- */}
      {activeTab === 'COLLECTIONS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((coll) => (
              <div
                key={coll.id}
                className="rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Banner Image */}
                <div className="h-36 w-full relative overflow-hidden bg-slate-100">
                  {coll.image ? (
                    <img
                      src={coll.image}
                      alt={coll.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-bold text-xs">
                      No Banner Image
                    </div>
                  )}
                  {coll.featured && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Featured Collection
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-slate-900 dark:text-foreground">{coll.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300">
                        {coll.type || 'MANUAL'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-600 font-bold block">/collections/{coll.slug}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {coll.description || 'No curated collection description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Products: {coll.productCount || 0}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCollection(coll)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                        title="Edit Collection"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCollection(coll.id, coll.name)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {categoryModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-between">
                  <span>{categoryModalError}</span>
                  <button type="button" onClick={() => setCategoryModalError(null)}>×</button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => {
                    const titleVal = e.target.value;
                    setCategoryFormData({
                      ...categoryFormData,
                      name: titleVal,
                      slug: titleVal.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    });
                  }}
                  placeholder="e.g. Footwear & Sneakers"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    placeholder="footwear-sneakers"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Icon Emoji</label>
                  <input
                    type="text"
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    placeholder="👟"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Description</label>
                <textarea
                  rows={3}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Detail the product types under this category..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT BRAND MODAL --- */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">
                {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-6 space-y-4">
              {brandModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-between">
                  <span>{brandModalError}</span>
                  <button type="button" onClick={() => setBrandModalError(null)}>×</button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={brandFormData.name}
                  onChange={(e) => {
                    const titleVal = e.target.value;
                    setBrandFormData({
                      ...brandFormData,
                      name: titleVal,
                      slug: titleVal.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    });
                  }}
                  placeholder="e.g. AuraTech, Vanguard"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Brand Handle Slug *</label>
                <input
                  type="text"
                  required
                  value={brandFormData.slug}
                  onChange={(e) => setBrandFormData({ ...brandFormData, slug: e.target.value })}
                  placeholder="auratech"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Logo Image URL</label>
                <input
                  type="text"
                  value={brandFormData.logo || ''}
                  onChange={(e) => setBrandFormData({ ...brandFormData, logo: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Official Website URL</label>
                <input
                  type="text"
                  value={brandFormData.website || ''}
                  onChange={(e) => setBrandFormData({ ...brandFormData, website: e.target.value })}
                  placeholder="https://brandwebsite.com"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Description</label>
                <textarea
                  rows={2}
                  value={brandFormData.description || ''}
                  onChange={(e) => setBrandFormData({ ...brandFormData, description: e.target.value })}
                  placeholder="Brand story and products summary..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Brand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT COLLECTION MODAL --- */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">
                {editingCollection ? `Edit Collection: ${editingCollection.name}` : 'Add New Collection'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCollectionModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="p-6 space-y-4">
              {collectionModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-between">
                  <span>{collectionModalError}</span>
                  <button type="button" onClick={() => setCollectionModalError(null)}>×</button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={collectionFormData.name}
                  onChange={(e) => {
                    const titleVal = e.target.value;
                    setCollectionFormData({
                      ...collectionFormData,
                      name: titleVal,
                      slug: titleVal.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    });
                  }}
                  placeholder="e.g. Summer Capsule Essentials 2026"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Collection Slug *</label>
                <input
                  type="text"
                  required
                  value={collectionFormData.slug}
                  onChange={(e) => setCollectionFormData({ ...collectionFormData, slug: e.target.value })}
                  placeholder="summer-essentials"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Banner Image URL</label>
                <input
                  type="text"
                  value={collectionFormData.image || ''}
                  onChange={(e) => setCollectionFormData({ ...collectionFormData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium"
                />
              </div>

              <div className="flex items-center gap-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectionFormData.featured}
                    onChange={(e) => setCollectionFormData({ ...collectionFormData, featured: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>Feature on Homepage Canvas</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Description</label>
                <textarea
                  rows={3}
                  value={collectionFormData.description || ''}
                  onChange={(e) => setCollectionFormData({ ...collectionFormData, description: e.target.value })}
                  placeholder="Collection narrative and promo details..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Collection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
