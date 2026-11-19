'use client';

import { SwipeToast } from '@/src/components/ui/SwipeToast';
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
import DragDropUpload from '@/src/components/ui/DragDropUpload';
import { TaxonomyStudioSkeleton } from '@/src/components/ui/Skeleton';

interface CategoryManagerProps {
  initialTab?: 'CATEGORIES' | 'BRANDS' | 'COLLECTIONS';
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ initialTab = 'CATEGORIES' }) => {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'BRANDS' | 'COLLECTIONS'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

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
    image: '',
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
      const [cats, brds, cols, prods] = await Promise.all([
        cmsService.getCategories(true),
        cmsService.getBrands(true),
        cmsService.getCollections(true),
        cmsService.getProducts(undefined, true).catch(() => []),
      ]);

      // Augment categories with live product count
      const computedCats = cats.map((cat) => {
        const catNameLower = cat.name.toLowerCase().trim();
        const catSlugLower = cat.slug.toLowerCase().trim();
        const countFromProds = prods.filter((p) => {
          const pCategory = (p.categoryName || p.category || '').toLowerCase().trim();
          const pCategories = (p.categories || []).map((c) => String(c).toLowerCase().trim());
          const commaTokens = pCategory.split(',').map((s) => s.trim()).filter(Boolean);
          return (
            commaTokens.includes(catNameLower) ||
            commaTokens.includes(catSlugLower) ||
            pCategories.includes(catNameLower) ||
            pCategories.includes(catSlugLower) ||
            pCategory === catNameLower ||
            pCategory === catSlugLower
          );
        }).length;

        return {
          ...cat,
          productCount: Math.max(Number(cat.productCount ?? 0), countFromProds),
        };
      });

      // Augment brands with live product count
      const computedBrands = brds.map((brand) => {
        const brandNameLower = brand.name.toLowerCase().trim();
        const brandSlugLower = brand.slug.toLowerCase().trim();
        const countFromProds = prods.filter((p) => {
          if (!p.brandName) return false;
          const pBrandLower = p.brandName.toLowerCase().trim();
          return (
            pBrandLower === brandNameLower ||
            pBrandLower === brandSlugLower ||
            pBrandLower.replace(/[^a-z0-9]/g, '-') === brandSlugLower
          );
        }).length;

        return {
          ...brand,
          productCount: Math.max(Number(brand.productCount ?? 0), countFromProds),
        };
      });

      // Augment collections with live product count
      const computedCollections = cols.map((coll) => {
        const collNameLower = coll.name.toLowerCase().trim();
        const collSlugLower = coll.slug.toLowerCase().trim();
        const manualIds = Array.isArray(coll.manualProductIds)
          ? coll.manualProductIds
          : typeof coll.manualProductIds === 'string'
            ? (coll.manualProductIds as string).split(',').map((s) => s.trim())
            : [];

        const countFromProds = prods.filter((p) => {
          if (manualIds.includes(p.id)) return true;
          const pCollection = (p.collectionName || '').toLowerCase().trim();
          const pCollections = (p.collections || []).map((c) => String(c).toLowerCase().trim());
          const commaTokens = pCollection.split(',').map((s) => s.trim()).filter(Boolean);
          return (
            commaTokens.includes(collNameLower) ||
            commaTokens.includes(collSlugLower) ||
            pCollections.includes(collNameLower) ||
            pCollections.includes(collSlugLower) ||
            pCollection === collNameLower ||
            pCollection === collSlugLower
          );
        }).length;

        return {
          ...coll,
          productCount: Math.max(Number(coll.productCount ?? 0), countFromProds),
        };
      });

      setCategories(computedCats);
      setBrands(computedBrands);
      setCollections(computedCollections);
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
    setCategoryFormData({ name: '', slug: '', icon: '📦', image: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CMSCategory) => {
    setEditingCategory(cat);
    setCategoryModalError(null);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '📦',
      image: cat.image || '',
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
        slug: (
          categoryFormData.slug ||
          categoryFormData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '-')
        ).toLowerCase(),
        icon: categoryFormData.icon || '📦',
        image: categoryFormData.image || undefined,
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
      await loadAllData();
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
      setDeletingId(id);
      setIsSaving(true);
      await cmsService.deleteCategory(id);
      showToast(`Category "${name}" deleted!`, 'success');
      await loadAllData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete category.';
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
      setIsSaving(false);
    }
  };

  // --- BRANDS HANDLERS ---
  const handleOpenCreateBrand = () => {
    setEditingBrand(null);
    setBrandModalError(null);
    setBrandFormData({
      name: '',
      slug: '',
      logo: '',
      description: '',
      website: '',
      status: 'ACTIVE',
    });
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
        slug: (
          brandFormData.slug ||
          brandFormData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '-')
        ).toLowerCase(),
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
      await loadAllData();
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
      setDeletingId(id);
      setIsSaving(true);
      await cmsService.deleteBrand(id);
      showToast(`Brand "${name}" deleted!`, 'success');
      await loadAllData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete brand.';
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
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
        slug: (
          collectionFormData.slug ||
          collectionFormData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '-')
        ).toLowerCase(),
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
      await loadAllData();
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
      setDeletingId(id);
      setIsSaving(true);
      await cmsService.deleteCollection(id);
      showToast(`Collection "${name}" deleted!`, 'success');
      await loadAllData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete collection.';
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
      setIsSaving(false);
    }
  };

  // Filtered lists by search query
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return <TaxonomyStudioSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <SwipeToast
          open={!!toastMessage}
          type={toastMessage.type}
          title={toastMessage.type === 'success' ? 'Success' : 'Error'}
          description={toastMessage.text}
          onClose={() => setToastMessage(null)}
          duration={4000}
        />
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-200/80 dark:border-indigo-800/60">
                Taxonomy & Catalog Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Taxonomy Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Add, edit, and manage Categories, Manufacturer Brands, and Curated Product Collections
              linked with Fastify backend APIs & PostgreSQL storage.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab === 'CATEGORIES' && (
              <button
                type="button"
                onClick={handleOpenCreateCategory}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
            {activeTab === 'BRANDS' && (
              <button
                type="button"
                onClick={handleOpenCreateBrand}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Brand</span>
              </button>
            )}
            {activeTab === 'COLLECTIONS' && (
              <button
                type="button"
                onClick={handleOpenCreateCollection}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
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
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-accent/40 rounded-2xl border border-slate-200/80 dark:border-border/60 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'CATEGORIES'
              ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 font-extrabold shadow-xs border border-slate-200/80 dark:border-border'
              : 'text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-accent'
              }`}
          >
            <FolderTree className={`w-4 h-4 ${activeTab === 'CATEGORIES' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <span>Categories</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'CATEGORIES'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
            >
              {categories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BRANDS')}
            className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'BRANDS'
              ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 font-extrabold shadow-xs border border-slate-200/80 dark:border-border'
              : 'text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-accent'
              }`}
          >
            <Tag className={`w-4 h-4 ${activeTab === 'BRANDS' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <span>Brands</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'BRANDS'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
            >
              {brands.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COLLECTIONS')}
            className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'COLLECTIONS'
              ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 font-extrabold shadow-xs border border-slate-200/80 dark:border-border'
              : 'text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-accent'
              }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'COLLECTIONS' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <span>Collections</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'COLLECTIONS'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
            >
              {collections.length}
            </span>
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto">
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
          <button
            type="button"
            onClick={() => loadAllData()}
            disabled={isLoading}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 hover:bg-slate-100 dark:bg-accent dark:hover:bg-accent/80 text-slate-600 dark:text-slate-300 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            title="Refresh Catalog Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
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
                      {cat.image ? (
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-border shrink-0 shadow-xs bg-slate-50 dark:bg-accent">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 flex items-center justify-center text-xl shrink-0">
                          {cat.icon || '📦'}
                        </span>
                      )}
                      <div>
                        <h3 className="font-black text-base text-slate-900 dark:text-foreground">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] font-mono text-indigo-600 font-bold">
                          /{cat.slug}
                        </span>
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
                      disabled={deletingId === cat.id || isSaving}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      title="Delete Category"
                    >
                      {deletingId === cat.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
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
                        <h3 className="font-black text-base text-slate-900 dark:text-foreground">
                          {brand.name}
                        </h3>
                        <span className="text-[11px] font-mono text-indigo-600 font-bold">
                          handle: {brand.slug}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${brand.status === 'ACTIVE'
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
                      disabled={deletingId === brand.id || isSaving}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      title="Delete Brand"
                    >
                      {deletingId === brand.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
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
                      <h3 className="font-black text-base text-slate-900 dark:text-foreground">
                        {coll.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300">
                        {coll.type || 'MANUAL'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-600 font-bold block">
                      /collections/{coll.slug}
                    </span>
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
                        disabled={deletingId === coll.id || isSaving}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Delete Collection"
                      >
                        {deletingId === coll.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
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
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in w-full h-full min-h-screen h-[100dvh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCategoryModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[90vh] min-h-[520px] flex flex-col">
            <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-foreground">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure catalog taxonomy and hierarchical navigation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {categoryModalError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold flex items-center justify-between">
                    <span>{categoryModalError}</span>
                    <button type="button" onClick={() => setCategoryModalError(null)} className="cursor-pointer">
                      ×
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Category Name *
                  </label>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryFormData.slug}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, slug: e.target.value })
                      }
                      placeholder="footwear-sneakers"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Icon Emoji
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.icon}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, icon: e.target.value })
                      }
                      placeholder="👟"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-center text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Category Image — Drag & Drop */}
                <div className="space-y-2">
                  <DragDropUpload
                    folder="categories"
                    fileType="CATEGORY_IMAGE"
                    label="Category Image"
                    currentUrl={categoryFormData.image || undefined}
                    onUploadComplete={(url) =>
                      setCategoryFormData((prev) => ({ ...prev, image: url }))
                    }
                    hint="High-resolution image (JPG, PNG, or WebP max 5MB)"
                    previewShape="square"
                    maxSizeMB={5}
                  />
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">
                      Or paste image URL
                    </label>
                    <input
                      type="url"
                      value={categoryFormData.image || ''}
                      onChange={(e) =>
                        setCategoryFormData((prev) => ({ ...prev, image: e.target.value }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-medium text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, description: e.target.value })
                    }
                    placeholder="Detail the product types under this category..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-accent/20 border-t border-slate-200/80 dark:border-border flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT BRAND MODAL --- */}
      {isBrandModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in w-full h-full min-h-screen h-[100dvh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBrandModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[90vh] min-h-[520px] flex flex-col">
            <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-foreground">
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure official manufacturer and brand partner details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {brandModalError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold flex items-center justify-between">
                    <span>{brandModalError}</span>
                    <button type="button" onClick={() => setBrandModalError(null)} className="cursor-pointer">
                      ×
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Brand Name *
                  </label>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Brand Handle Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandFormData.slug}
                    onChange={(e) => setBrandFormData({ ...brandFormData, slug: e.target.value })}
                    placeholder="auratech"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <DragDropUpload
                    folder="brands"
                    fileType="LOGO"
                    label="Brand Logo"
                    currentUrl={brandFormData.logo || undefined}
                    onUploadComplete={(url) => setBrandFormData({ ...brandFormData, logo: url })}
                    hint="PNG, SVG, or JPG (max 5MB)"
                    previewShape="square"
                    maxSizeMB={5}
                  />
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">
                      Or paste image URL
                    </label>
                    <input
                      type="text"
                      value={brandFormData.logo || ''}
                      onChange={(e) => setBrandFormData({ ...brandFormData, logo: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-medium text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Official Website URL
                  </label>
                  <input
                    type="text"
                    value={brandFormData.website || ''}
                    onChange={(e) => setBrandFormData({ ...brandFormData, website: e.target.value })}
                    placeholder="https://brandwebsite.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-medium text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={brandFormData.description || ''}
                    onChange={(e) =>
                      setBrandFormData({ ...brandFormData, description: e.target.value })
                    }
                    placeholder="Brand story and products summary..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-accent/20 border-t border-slate-200/80 dark:border-border flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingBrand ? 'Update Brand' : 'Save Brand'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT COLLECTION MODAL --- */}
      {isCollectionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in w-full h-full min-h-screen h-[100dvh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCollectionModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[90vh] min-h-[520px] flex flex-col">
            <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-foreground">
                  {editingCollection
                    ? `Edit Collection: ${editingCollection.name}`
                    : 'Add New Collection'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Curate promotional and seasonal product showcases
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCollectionModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {collectionModalError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold flex items-center justify-between">
                    <span>{collectionModalError}</span>
                    <button type="button" onClick={() => setCollectionModalError(null)} className="cursor-pointer">
                      ×
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Collection Name *
                  </label>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Collection Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={collectionFormData.slug}
                    onChange={(e) =>
                      setCollectionFormData({ ...collectionFormData, slug: e.target.value })
                    }
                    placeholder="summer-essentials"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <DragDropUpload
                    folder="collections"
                    fileType="COLLECTION_IMAGE"
                    label="Banner Image"
                    currentUrl={collectionFormData.image || undefined}
                    onUploadComplete={(url) =>
                      setCollectionFormData({ ...collectionFormData, image: url })
                    }
                    hint="JPG, PNG, or WebP (max 10MB)"
                    previewShape="rect"
                    maxSizeMB={10}
                  />
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">
                      Or paste image URL
                    </label>
                    <input
                      type="text"
                      value={collectionFormData.image || ''}
                      onChange={(e) =>
                        setCollectionFormData({ ...collectionFormData, image: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-medium text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
                  <input
                    type="checkbox"
                    id="collectionFeatured"
                    checked={collectionFormData.featured}
                    onChange={(e) =>
                      setCollectionFormData({ ...collectionFormData, featured: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="collectionFeatured" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                    Feature on Homepage Canvas
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={collectionFormData.description || ''}
                    onChange={(e) =>
                      setCollectionFormData({ ...collectionFormData, description: e.target.value })
                    }
                    placeholder="Collection narrative and promo details..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-accent/20 border-t border-slate-200/80 dark:border-border flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingCollection ? 'Update Collection' : 'Save Collection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
