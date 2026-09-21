'use client';

import React, { useState, useEffect } from 'react';
import { CMSMenuData, CMSMenuItem, MegaMenuCardItem } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import DragDropUpload from '@/src/components/ui/DragDropUpload';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  Monitor,
  Menu as MenuIcon,
  X,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  RefreshCw,
  FolderTree,
  Smartphone,
  Layers,
  Tag,
  ArrowRight,
  Sliders,
  Eye,
} from 'lucide-react';

interface NavigationSlot {
  key: 'header' | 'footer' | 'mobile';
  title: string;
  handle: string;
  location: 'HEADER' | 'FOOTER' | 'MOBILE';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAVIGATION_SLOTS: NavigationSlot[] = [
  {
    key: 'header',
    title: 'Header Navigation',
    handle: 'header-menu',
    location: 'HEADER',
    description: 'Main navigation bar displayed across the top of your storefront header.',
    icon: Monitor,
  },
  {
    key: 'footer',
    title: 'Footer Navigation',
    handle: 'footer-menu',
    location: 'FOOTER',
    description:
      'Quick links, customer service, and policy links displayed in your storefront footer.',
    icon: LayoutGrid,
  },
  {
    key: 'mobile',
    title: 'Mobile Drawer Navigation',
    handle: 'mobile-drawer-menu',
    location: 'MOBILE',
    description: 'Slide-out mobile navigation drawer menu for smartphone shoppers.',
    icon: Smartphone,
  },
];

const COMMON_ROUTE_SUGGESTIONS = [
  { label: 'Home', url: '/' },
  { label: 'Shop All', url: '/products' },
  { label: 'Categories', url: '/categories' },
  { label: 'Blog & News', url: '/blog' },
  { label: 'About Us', url: '/pages/about' },
  { label: 'Contact', url: '/pages/contact' },
  { label: 'Track Orders', url: '/account/orders' },
];

const DEFAULT_PRESET_CARDS: MegaMenuCardItem[] = [
  {
    id: 'card-all',
    label: 'All Products',
    url: '/products',
    description: 'Browse the full catalog',
    badge: '',
  },
  {
    id: 'card-drops',
    label: 'Featured Drops',
    url: '/collections',
    description: 'Seasonal top picks',
    badge: 'HOT',
  },
  {
    id: 'card-offers',
    label: 'Special Offers',
    url: '/products?sale=true',
    description: 'Limited deals & bundles',
    badge: 'SALE',
  },
  {
    id: 'card-arrivals',
    label: 'New Arrivals',
    url: '/products?sort=newest',
    description: 'Fresh arrivals this week',
    badge: 'NEW',
  },
];

export const NavigationManager: React.FC = () => {
  const [menus, setMenus] = useState<CMSMenuData[]>([]);
  const [activeSlotKey, setActiveSlotKey] = useState<'header' | 'footer' | 'mobile'>('header');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Item Modal State (Add / Edit)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CMSMenuItem | null>(null);
  const [activeMegaMenuTab, setActiveMegaMenuTab] = useState<
    'cards' | 'header' | 'promo' | 'footer'
  >('cards');

  const [itemFormData, setItemFormData] = useState<{
    label: string;
    url: string;
    target: '_self' | '_blank';
    description: string;
    badge: string;
    isMegaMenu: boolean;
    bannerImage: string;
    headline: string;
    buttonLabel: string;
    buttonUrl: string;
    catalogTitle: string;
    viewAllLabel: string;
    viewAllUrl: string;
    promoBadge: string;
    footerLeft: string;
    footerRight: string;
    megaMenuItems: MegaMenuCardItem[];
  }>({
    label: '',
    url: '/',
    target: '_self',
    description: '',
    badge: '',
    isMegaMenu: false,
    bannerImage:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    headline: 'Featured Collection 2026',
    buttonLabel: 'Explore Collection',
    buttonUrl: '/collections/all',
    catalogTitle: '',
    viewAllLabel: 'View All →',
    viewAllUrl: '/products',
    promoBadge: 'Featured Promotion',
    footerLeft: 'Fast Worldwide Delivery & Free Returns',
    footerRight: 'Official Store Guaranteed',
    megaMenuItems: [...DEFAULT_PRESET_CARDS],
  });

  // Hover Mega Menu in live preview
  const [activeHoverMegaMenu, setActiveHoverMegaMenu] = useState<CMSMenuItem | null>(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getMenus(true);
      setMenus(data || []);
    } catch (err) {
      console.error('Failed to load navigation menus:', err);
      setMenus([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Find active slot config
  const activeSlot = NAVIGATION_SLOTS.find((s) => s.key === activeSlotKey) || NAVIGATION_SLOTS[0];

  // Resolve menu from backend for current slot
  const resolvedBackendMenu = menus.find(
    (m) =>
      m.location === activeSlot.location ||
      m.handle === activeSlot.handle ||
      m.handle === activeSlot.key,
  );

  // Active Menu Representation (Empty items array if not created on backend yet)
  const activeMenu: CMSMenuData = resolvedBackendMenu || {
    id: '',
    title: activeSlot.title,
    handle: activeSlot.handle,
    location: activeSlot.location,
    items: [],
  };

  const handleOpenAddItemModal = (
    parentId: string | null = null,
    defaultValues?: { label: string; url: string },
  ) => {
    setEditingParentId(parentId);
    setEditingItem(null);
    setActiveMegaMenuTab('cards');
    setItemFormData({
      label: defaultValues?.label || '',
      url: defaultValues?.url || '/',
      target: '_self',
      description: '',
      badge: '',
      isMegaMenu: false,
      bannerImage:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
      headline: 'Featured Collection 2026',
      buttonLabel: 'Explore Collection',
      buttonUrl: '/collections/all',
      catalogTitle: '',
      viewAllLabel: 'View All →',
      viewAllUrl: '/products',
      promoBadge: 'Featured Promotion',
      footerLeft: 'Fast Worldwide Delivery & Free Returns',
      footerRight: 'Official Store Guaranteed',
      megaMenuItems: [...DEFAULT_PRESET_CARDS],
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item: CMSMenuItem) => {
    setEditingParentId(null);
    setEditingItem(item);
    setActiveMegaMenuTab('cards');
    const existingCards = item.megaMenuConfig?.items;
    setItemFormData({
      label: item.label,
      url: item.url,
      target: (item.target as any) || '_self',
      description: item.description || '',
      badge: item.badge || '',
      isMegaMenu: !!item.isMegaMenu,
      bannerImage:
        item.megaMenuConfig?.bannerImage ||
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
      headline: item.megaMenuConfig?.headline || 'Featured Collection 2026',
      buttonLabel: item.megaMenuConfig?.buttonLabel || 'Explore Collection',
      buttonUrl: item.megaMenuConfig?.buttonUrl || '/collections/all',
      catalogTitle: item.megaMenuConfig?.catalogTitle || '',
      viewAllLabel: item.megaMenuConfig?.viewAllLabel || 'View All →',
      viewAllUrl: item.megaMenuConfig?.viewAllUrl || item.url || '/products',
      promoBadge: item.megaMenuConfig?.promoBadge || 'Featured Promotion',
      footerLeft: item.megaMenuConfig?.footerLeft ?? 'Fast Worldwide Delivery & Free Returns',
      footerRight: item.megaMenuConfig?.footerRight ?? 'Official Store Guaranteed',
      megaMenuItems:
        existingCards && existingCards.length > 0 ? [...existingCards] : [...DEFAULT_PRESET_CARDS],
    });
    setIsItemModalOpen(true);
  };

  // Helper to persist items list to the backend (updating existing or creating new menu)
  const saveItemsToBackend = async (updatedItems: CMSMenuItem[]) => {
    setIsSaving(true);
    try {
      if (activeMenu.id) {
        // Update existing menu
        await cmsService.updateMenu(activeMenu.id, { items: updatedItems });
      } else {
        // Create menu in backend for this slot
        await cmsService.createMenu({
          title: activeSlot.title,
          handle: activeSlot.handle,
          location: activeSlot.location,
          items: updatedItems,
        });
      }
      await loadMenus();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to save menu changes.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: CMSMenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      label: itemFormData.label,
      url: itemFormData.url,
      target: itemFormData.target,
      description: itemFormData.description.trim() || undefined,
      badge: itemFormData.badge.trim() || undefined,
      isMegaMenu: itemFormData.isMegaMenu,
      megaMenuConfig: itemFormData.isMegaMenu
        ? {
            bannerImage: itemFormData.bannerImage,
            headline: itemFormData.headline,
            buttonLabel: itemFormData.buttonLabel,
            buttonUrl: itemFormData.buttonUrl,
            catalogTitle: itemFormData.catalogTitle.trim() || undefined,
            viewAllLabel: itemFormData.viewAllLabel.trim() || undefined,
            viewAllUrl: itemFormData.viewAllUrl.trim() || undefined,
            promoBadge: itemFormData.promoBadge.trim() || undefined,
            footerLeft: itemFormData.footerLeft,
            footerRight: itemFormData.footerRight,
            items: itemFormData.megaMenuItems,
          }
        : undefined,
      children: editingItem ? editingItem.children || [] : [],
    };

    let updatedItems = [...(activeMenu.items || [])];

    if (editingItem) {
      const updateInTree = (list: CMSMenuItem[]): CMSMenuItem[] => {
        return list.map((node) => {
          if (node.id === editingItem.id) {
            return { ...newItem, children: node.children };
          }
          if (node.children) {
            return { ...node, children: updateInTree(node.children) };
          }
          return node;
        });
      };
      updatedItems = updateInTree(updatedItems);
    } else if (editingParentId) {
      const addChildToTree = (list: CMSMenuItem[]): CMSMenuItem[] => {
        return list.map((node) => {
          if (node.id === editingParentId) {
            return {
              ...node,
              children: [...(node.children || []), newItem],
            };
          }
          if (node.children) {
            return { ...node, children: addChildToTree(node.children) };
          }
          return node;
        });
      };
      updatedItems = addChildToTree(updatedItems);
    } else {
      updatedItems.push(newItem);
    }

    const success = await saveItemsToBackend(updatedItems);
    if (success) {
      showToast(`Link "${itemFormData.label}" saved successfully!`, 'success');
      setIsItemModalOpen(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const deleteFromTree = (list: CMSMenuItem[]): CMSMenuItem[] => {
      return list
        .filter((node) => node.id !== itemId)
        .map((node) => {
          if (node.children) {
            return { ...node, children: deleteFromTree(node.children) };
          }
          return node;
        });
    };

    const updatedItems = deleteFromTree(activeMenu.items || []);
    const success = await saveItemsToBackend(updatedItems);
    if (success) {
      showToast('Link removed from navigation.', 'success');
    }
  };

  const handleMoveItem = async (index: number, direction: 'UP' | 'DOWN') => {
    const newItems = [...(activeMenu.items || [])];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const success = await saveItemsToBackend(newItems);
    if (success) {
      showToast('Navigation order updated!', 'success');
    }
  };

  // ─── Mega Menu Card Management Helpers ───
  const handleLoadDefaultCards = () => {
    setItemFormData((prev) => ({
      ...prev,
      megaMenuItems: [...DEFAULT_PRESET_CARDS],
    }));
    showToast('Loaded 4 default feature cards (All Products, Featured Drops, etc.)', 'success');
  };

  const handleAddCard = () => {
    const newCard: MegaMenuCardItem = {
      id: `card-${Date.now()}`,
      label: 'New Drop / Collection',
      url: '/collections',
      description: 'Explore new curation',
      badge: '',
    };
    setItemFormData((prev) => ({
      ...prev,
      megaMenuItems: [...prev.megaMenuItems, newCard],
    }));
  };

  const handleUpdateCard = (index: number, field: keyof MegaMenuCardItem, value: string) => {
    setItemFormData((prev) => {
      const cards = [...prev.megaMenuItems];
      cards[index] = { ...cards[index], [field]: value };
      return { ...prev, megaMenuItems: cards };
    });
  };

  const handleRemoveCard = (index: number) => {
    setItemFormData((prev) => ({
      ...prev,
      megaMenuItems: prev.megaMenuItems.filter((_, i) => i !== index),
    }));
  };

  const handleMoveCard = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itemFormData.megaMenuItems.length) return;

    setItemFormData((prev) => {
      const cards = [...prev.megaMenuItems];
      const temp = cards[index];
      cards[index] = cards[targetIndex];
      cards[targetIndex] = temp;
      return { ...prev, megaMenuItems: cards };
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/50'
              : 'bg-rose-950 text-rose-100 border-rose-500/50'
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
                Storefront Navigation Manager
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Compass className="w-8 h-8 text-indigo-400" />
              <span>Navigation Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Configure Header Navigation, Footer Navigation, and Mobile Drawer Navigation links.
              Customize visual mega menus with All Products, Featured Drops, promotional cards,
              badges, and subtitles.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadMenus}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              title="Refresh Menus"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddItemModal(null)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Link to {activeSlot.title}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── DIRECT NAVIGATION SLOTS: HEADER, FOOTER, MOBILE DRAWER ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {NAVIGATION_SLOTS.map((slot) => {
          const isSelected = slot.key === activeSlotKey;
          const slotMenu = menus.find(
            (m) =>
              m.location === slot.location || m.handle === slot.handle || m.handle === slot.key,
          );
          const itemCount = slotMenu?.items?.length || 0;
          const SlotIcon = slot.icon;

          return (
            <button
              key={slot.key}
              type="button"
              onClick={() => setActiveSlotKey(slot.key)}
              className={`p-5 rounded-3xl text-left transition-all border flex flex-col justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-card border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white/80 dark:bg-card/70 hover:bg-white dark:hover:bg-card border-slate-200/80 dark:border-border hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <SlotIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-foreground">
                      {slot.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">handle: {slot.handle}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    itemCount > 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-accent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {itemCount} {itemCount === 1 ? 'link' : 'links'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {slot.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-border text-xs font-bold">
                <span
                  className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}
                >
                  {isSelected ? 'Active Selection' : 'Click to Configure'}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300 font-semibold">
                  Slot: {slot.location}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── ACTIVE NAVIGATION EDITOR & LIVE PREVIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: TREE BUILDER */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-border pb-4">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-foreground flex items-center gap-2">
                  <span>{activeSlot.title} Links</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {activeMenu.items?.length || 0} items
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Organize top-level links, visual mega menus, sub-links, badges, and custom drop
                  categories.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddItemModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Navigation Item</span>
              </button>
            </div>

            {/* Menu Items Tree */}
            <div className="space-y-3">
              {!activeMenu.items || activeMenu.items.length === 0 ? (
                /* Clean Empty Fallback — No Dummy Data! */
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-border rounded-3xl space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 mx-auto flex items-center justify-center">
                    <Compass className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                      No navigation items in {activeSlot.title} yet
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      This navigation menu is currently empty. Start building your storefront menu
                      by adding links, or pick a common destination below.
                    </p>
                  </div>

                  {/* Common Quick Suggestions */}
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto pt-2">
                    {COMMON_ROUTE_SUGGESTIONS.slice(0, 5).map((sug) => (
                      <button
                        key={sug.url}
                        type="button"
                        onClick={() => handleOpenAddItemModal(null, sug)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-accent dark:hover:bg-indigo-950/40 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-border transition-colors cursor-pointer"
                      >
                        + {sug.label} ({sug.url})
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAddItemModal(null)}
                      className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Navigation Item</span>
                    </button>
                  </div>
                </div>
              ) : (
                activeMenu.items.map((item, idx) => (
                  <div key={item.id} className="space-y-2">
                    {/* Top Level Item Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/60 border border-slate-200/80 dark:border-border flex items-center justify-between gap-3 group hover:border-indigo-300 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0 || isSaving}
                            onClick={() => handleMoveItem(idx, 'UP')}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (activeMenu.items?.length || 0) - 1 || isSaving}
                            onClick={() => handleMoveItem(idx, 'DOWN')}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-foreground truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] uppercase tracking-wider border border-amber-500/30">
                                {item.badge}
                              </span>
                            )}
                            {item.isMegaMenu && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs">
                                <Sparkles className="w-2.5 h-2.5" />
                                Visual Mega Menu
                                {item.megaMenuConfig?.items &&
                                  item.megaMenuConfig.items.length > 0 && (
                                    <span className="opacity-80">
                                      ({item.megaMenuConfig.items.length} cards)
                                    </span>
                                  )}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate">
                              {item.description}
                            </p>
                          )}
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold truncate block">
                            {item.url} {item.target === '_blank' && '(Opens in new tab)'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenAddItemModal(item.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          title="Add Sub-item"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add Sub-link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditItemModal(item)}
                          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Nested Children (Sub-items) */}
                    {item.children && item.children.length > 0 && (
                      <div className="pl-6 space-y-2 border-l-2 border-indigo-200 dark:border-indigo-900 ml-4">
                        {item.children.map((child) => (
                          <div
                            key={child.id}
                            className="p-3 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border flex items-center justify-between gap-3 hover:border-slate-300"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-foreground block truncate">
                                  {child.label}
                                </span>
                                {child.badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                    {child.badge}
                                  </span>
                                )}
                              </div>
                              {child.description && (
                                <p className="text-[10px] text-slate-400 italic truncate">
                                  {child.description}
                                </p>
                              )}
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                                {child.url}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditItemModal(child)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleDeleteItem(child.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW OF CURRENT SLOT */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
              <div className="flex items-center gap-2">
                <activeSlot.icon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-foreground">
                  Live {activeSlot.title} Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Interactive Mockup
              </span>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-inner space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span className="font-extrabold text-white">STOREFRONT</span>
                <span className="text-[11px] font-mono">{activeSlot.location} SLOT</span>
              </div>

              {/* Header slot preview */}
              {activeSlot.key === 'header' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {!activeMenu.items || activeMenu.items.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">
                        (No links added to Header Navigation)
                      </span>
                    ) : (
                      activeMenu.items.map((item) => {
                        const previewCards =
                          item.megaMenuConfig?.items && item.megaMenuConfig.items.length > 0
                            ? item.megaMenuConfig.items
                            : item.children && item.children.length > 0
                              ? item.children.map((c) => ({
                                  id: c.id,
                                  label: c.label,
                                  url: c.url,
                                  description: c.description || '',
                                  badge: c.badge || '',
                                }))
                              : DEFAULT_PRESET_CARDS;

                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => item.isMegaMenu && setActiveHoverMegaMenu(item)}
                            onMouseLeave={() => setActiveHoverMegaMenu(null)}
                            className="relative group"
                          >
                            <span className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer transition-colors">
                              {item.label}
                              {item.badge && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold">
                                  {item.badge}
                                </span>
                              )}
                              {(item.isMegaMenu || (item.children && item.children.length > 0)) && (
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                              )}
                            </span>

                            {/* Hover Dropdown / Mega Menu Preview */}
                            {item.isMegaMenu && activeHoverMegaMenu?.id === item.id && (
                              <div className="absolute top-full left-0 mt-2 w-[420px] bg-white text-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 space-y-3">
                                {/* Top Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                      {item.megaMenuConfig?.catalogTitle ||
                                        `${item.label} Catalog & Collections`}
                                    </h5>
                                  </div>
                                  <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                                    {item.megaMenuConfig?.viewAllLabel || 'View All →'}
                                  </span>
                                </div>

                                {/* Cards Grid & Promo Card */}
                                <div className="grid grid-cols-12 gap-3">
                                  {/* Left visual cards */}
                                  <div className="col-span-7 grid grid-cols-1 gap-2">
                                    {previewCards.slice(0, 4).map((c, cIdx) => (
                                      <div
                                        key={c?.id || cIdx}
                                        className="p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-extrabold text-slate-900 truncate">
                                            {c.label}
                                          </span>
                                          {c.badge && (
                                            <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[8px] font-black uppercase">
                                              {c.badge}
                                            </span>
                                          )}
                                        </div>
                                        {c.description && (
                                          <span className="block text-[9px] text-slate-400 truncate mt-0.5">
                                            {c.description}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Right Promo Card */}
                                  <div className="col-span-5 relative rounded-xl overflow-hidden min-h-[140px] flex flex-col justify-end p-2.5 bg-slate-900">
                                    {item.megaMenuConfig?.bannerImage && (
                                      <img
                                        src={item.megaMenuConfig.bannerImage}
                                        alt="Banner"
                                        className="absolute inset-0 w-full h-full object-cover"
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    <div className="relative z-10 space-y-1">
                                      <span className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[8px] font-extrabold uppercase">
                                        {item.megaMenuConfig?.promoBadge || 'Featured Promotion'}
                                      </span>
                                      <h6 className="text-[10px] font-black text-white leading-tight line-clamp-2">
                                        {item.megaMenuConfig?.headline ||
                                          'Featured Collection 2026'}
                                      </h6>
                                      <span className="inline-block px-2 py-1 rounded-md bg-white text-slate-900 text-[9px] font-black">
                                        {item.megaMenuConfig?.buttonLabel || 'Explore'} →
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Footer Highlights */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                                  <span>
                                    {item.megaMenuConfig?.footerLeft || 'Fast Worldwide Delivery'}
                                  </span>
                                  <span className="font-semibold text-slate-500">
                                    {item.megaMenuConfig?.footerRight ||
                                      'Official Store Guaranteed'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Footer slot preview */}
              {activeSlot.key === 'footer' && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Footer Column
                  </span>
                  {!activeMenu.items || activeMenu.items.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      (No links added to Footer Navigation)
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {activeMenu.items.map((item) => (
                        <div
                          key={item.id}
                          className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                        >
                          <span>•</span>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile slot preview */}
              {activeSlot.key === 'mobile' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-w-[240px]">
                  <div className="text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1">
                    📱 Mobile Drawer
                  </div>
                  {!activeMenu.items || activeMenu.items.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">(No links in Mobile Drawer)</p>
                  ) : (
                    <div className="space-y-1">
                      {activeMenu.items.map((item) => (
                        <div
                          key={item.id}
                          className="px-2 py-1.5 rounded bg-slate-900 text-xs font-bold text-slate-200"
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD / EDIT LINK MODAL ─── */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-card rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-border">
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  <span>{editingItem ? 'Edit Navigation Link' : 'Add Navigation Link'}</span>
                </h3>
                <p className="text-xs text-slate-300">Target Menu: {activeSlot.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Link Label Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemFormData.label}
                    onChange={(e) => setItemFormData({ ...itemFormData, label: e.target.value })}
                    placeholder="e.g. Products, Featured, Collections"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Badge Tag{' '}
                    <span className="text-[10px] text-slate-400">
                      (Optional, e.g. HOT, NEW, SALE)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={itemFormData.badge}
                    onChange={(e) => setItemFormData({ ...itemFormData, badge: e.target.value })}
                    placeholder="e.g. HOT, NEW, 20% OFF"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Destination URL / Route <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemFormData.url}
                  onChange={(e) => setItemFormData({ ...itemFormData, url: e.target.value })}
                  placeholder="e.g. /products, /collections, /categories"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400"
                />

                {/* Quick suggestions pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_ROUTE_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.url}
                      type="button"
                      onClick={() =>
                        setItemFormData({
                          ...itemFormData,
                          label: itemFormData.label || sug.label,
                          url: sug.url,
                        })
                      }
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-accent text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                    >
                      {sug.url}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Subtitle / Description{' '}
                    <span className="text-[10px] text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={itemFormData.description}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, description: e.target.value })
                    }
                    placeholder="e.g. Browse the full catalog"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Window
                  </label>
                  <select
                    value={itemFormData.target}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        target: e.target.value as '_self' | '_blank',
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold"
                  >
                    <option value="_self">Same Browser Tab (_self)</option>
                    <option value="_blank">New Tab / Window (_blank)</option>
                  </select>
                </div>
              </div>

              {/* Mega Menu Toggle (for Header) */}
              {activeSlot.key === 'header' && (
                <div className="pt-3 border-t border-slate-100 dark:border-border space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={itemFormData.isMegaMenu}
                        onChange={(e) =>
                          setItemFormData({ ...itemFormData, isMegaMenu: e.target.checked })
                        }
                        className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Enable Visual Mega Menu Dropdown
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Enables rich 2-column visual feature cards (All Products, Featured Drops,
                          etc.) and promo banner.
                        </p>
                      </div>
                    </label>
                  </div>

                  {itemFormData.isMegaMenu && (
                    <div className="p-4 rounded-3xl bg-slate-50/80 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-4">
                      {/* Mega Menu Tabs */}
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-border pb-3">
                        <button
                          type="button"
                          onClick={() => setActiveMegaMenuTab('cards')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeMegaMenuTab === 'cards'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-card text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-border'
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>Feature Cards ({itemFormData.megaMenuItems.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMegaMenuTab('header')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeMegaMenuTab === 'header'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-card text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-border'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Header & View All</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMegaMenuTab('promo')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeMegaMenuTab === 'promo'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-card text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-border'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Promo Card</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMegaMenuTab('footer')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeMegaMenuTab === 'footer'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-card text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-border'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Footer Highlights</span>
                        </button>
                      </div>

                      {/* TAB 1: VISUAL FEATURE CARDS & DROPS */}
                      {activeMegaMenuTab === 'cards' && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-foreground">
                                Visual Feature Cards (All Products, Featured Drops, etc.)
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                These cards render in the 2-column left section of the visual mega
                                menu dropdown.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={handleLoadDefaultCards}
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Reset / Load 4 default preset cards"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                <span>Load Presets</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleAddCard}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Card</span>
                              </button>
                            </div>
                          </div>

                          {/* Card Items List */}
                          <div className="space-y-3">
                            {itemFormData.megaMenuItems.length === 0 ? (
                              <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-border rounded-2xl space-y-2">
                                <p className="text-xs text-slate-500">
                                  No feature cards added yet.
                                </p>
                                <button
                                  type="button"
                                  onClick={handleLoadDefaultCards}
                                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>
                                    ✨ Load Default Presets (All Products, Featured Drops, etc.)
                                  </span>
                                </button>
                              </div>
                            ) : (
                              itemFormData.megaMenuItems.map((card, cIdx) => (
                                <div
                                  key={card.id || cIdx}
                                  className="p-3.5 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-xs space-y-2.5"
                                >
                                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-border pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-400 text-[10px] font-black flex items-center justify-center">
                                        {cIdx + 1}
                                      </span>
                                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                                        {card.label || 'Untitled Card'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        disabled={cIdx === 0}
                                        onClick={() => handleMoveCard(cIdx, 'UP')}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={cIdx === itemFormData.megaMenuItems.length - 1}
                                        onClick={() => handleMoveCard(cIdx, 'DOWN')}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveCard(cIdx)}
                                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer ml-1"
                                        title="Remove Card"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-4 space-y-1">
                                      <label className="block text-[10px] font-bold text-slate-500">
                                        Title <span className="text-rose-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={card.label}
                                        onChange={(e) =>
                                          handleUpdateCard(cIdx, 'label', e.target.value)
                                        }
                                        placeholder="e.g. All Products, Featured Drops"
                                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-border text-xs font-bold"
                                      />
                                    </div>

                                    <div className="sm:col-span-5 space-y-1">
                                      <label className="block text-[10px] font-bold text-slate-500">
                                        Subtitle / Description
                                      </label>
                                      <input
                                        type="text"
                                        value={card.description || ''}
                                        onChange={(e) =>
                                          handleUpdateCard(cIdx, 'description', e.target.value)
                                        }
                                        placeholder="e.g. Browse the full catalog"
                                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-border text-xs"
                                      />
                                    </div>

                                    <div className="sm:col-span-3 space-y-1">
                                      <label className="block text-[10px] font-bold text-slate-500">
                                        Badge (e.g. HOT)
                                      </label>
                                      <input
                                        type="text"
                                        value={card.badge || ''}
                                        onChange={(e) =>
                                          handleUpdateCard(cIdx, 'badge', e.target.value)
                                        }
                                        placeholder="e.g. HOT"
                                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-border text-xs font-extrabold uppercase"
                                      />
                                    </div>

                                    <div className="sm:col-span-12 space-y-1 pt-1">
                                      <label className="block text-[10px] font-bold text-slate-500">
                                        Destination URL / Route
                                      </label>
                                      <input
                                        type="text"
                                        value={card.url}
                                        onChange={(e) =>
                                          handleUpdateCard(cIdx, 'url', e.target.value)
                                        }
                                        placeholder="e.g. /products, /collections, /products?sale=true"
                                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-border text-xs font-mono text-indigo-600 font-bold"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB 2: HEADER & VIEW ALL */}
                      {activeMegaMenuTab === 'header' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Catalog Section Headline Title
                            </label>
                            <input
                              type="text"
                              value={itemFormData.catalogTitle}
                              onChange={(e) =>
                                setItemFormData({ ...itemFormData, catalogTitle: e.target.value })
                              }
                              placeholder={`Defaults to "${itemFormData.label || 'Home'} Catalog & Collections"`}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                            />
                            <p className="text-[10px] text-slate-400">
                              Displayed at the top left above the catalog cards with the pulsing
                              indicator.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                "View All" Button Label
                              </label>
                              <input
                                type="text"
                                value={itemFormData.viewAllLabel}
                                onChange={(e) =>
                                  setItemFormData({ ...itemFormData, viewAllLabel: e.target.value })
                                }
                                placeholder="View All →"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                "View All" Destination URL
                              </label>
                              <input
                                type="text"
                                value={itemFormData.viewAllUrl}
                                onChange={(e) =>
                                  setItemFormData({ ...itemFormData, viewAllUrl: e.target.value })
                                }
                                placeholder="/products"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-mono font-bold text-indigo-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: PROMOTIONAL CARD */}
                      {activeMegaMenuTab === 'promo' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                Promo Card Badge Tag
                              </label>
                              <input
                                type="text"
                                value={itemFormData.promoBadge}
                                onChange={(e) =>
                                  setItemFormData({ ...itemFormData, promoBadge: e.target.value })
                                }
                                placeholder="Featured Promotion"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                Banner Promotional Headline
                              </label>
                              <input
                                type="text"
                                value={itemFormData.headline}
                                onChange={(e) =>
                                  setItemFormData({ ...itemFormData, headline: e.target.value })
                                }
                                placeholder="e.g. Featured Collection 2026"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Banner Promotional Image
                            </label>
                            <DragDropUpload
                              currentUrl={itemFormData.bannerImage}
                              onUploadComplete={(url) =>
                                setItemFormData({ ...itemFormData, bannerImage: url })
                              }
                              folder="navigation"
                              previewShape="rect"
                              hint="Drag & drop promotion card banner (JPEG, PNG, WebP)"
                            />
                            <div className="pt-1">
                              <input
                                type="text"
                                placeholder="Or paste banner image URL..."
                                value={itemFormData.bannerImage}
                                onChange={(e) =>
                                  setItemFormData({ ...itemFormData, bannerImage: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                CTA Button Label
                              </label>
                              <input
                                type="text"
                                value={itemFormData.buttonLabel}
                                onChange={(e) =>
                                  setItemFormData({ ...itemFormData, buttonLabel: e.target.value })
                                }
                                placeholder="Explore Collection"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                CTA Destination URL
                              </label>
                              <input
                                type="text"
                                value={itemFormData.buttonUrl}
                                onChange={(e) =>
                                  setItemFormData({ ...itemFormData, buttonUrl: e.target.value })
                                }
                                placeholder="/collections/all"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-mono font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: FOOTER HIGHLIGHTS */}
                      {activeMegaMenuTab === 'footer' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Left Highlight Text
                            </label>
                            <input
                              type="text"
                              value={itemFormData.footerLeft}
                              onChange={(e) =>
                                setItemFormData({ ...itemFormData, footerLeft: e.target.value })
                              }
                              placeholder="Fast Worldwide Delivery & Free Returns"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Right Highlight Text
                            </label>
                            <input
                              type="text"
                              value={itemFormData.footerRight}
                              onChange={(e) =>
                                setItemFormData({ ...itemFormData, footerRight: e.target.value })
                              }
                              placeholder="Official Store Guaranteed"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationManager;
