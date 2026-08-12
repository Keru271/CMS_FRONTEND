'use client';

import React, { useState, useEffect } from 'react';
import { CMSMenuData, CMSMenuItem, MegaMenuConfig } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
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
  Layers,
  LayoutGrid,
  Monitor,
  Menu as MenuIcon,
  X,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  RefreshCw,
  FolderTree,
} from 'lucide-react';

export const NavigationManager: React.FC = () => {
  const [menus, setMenus] = useState<CMSMenuData[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active Selected Menu
  const activeMenu = menus.find((m) => m.id === activeMenuId || m.handle === activeMenuId) || menus[0];

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CMSMenuItem | null>(null);

  const [itemFormData, setItemFormData] = useState<{
    label: string;
    url: string;
    target: '_self' | '_blank';
    isMegaMenu: boolean;
    bannerImage: string;
    headline: string;
    buttonLabel: string;
    buttonUrl: string;
  }>({
    label: '',
    url: '/',
    target: '_self',
    isMegaMenu: false,
    bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    headline: 'New Season Capsule 2026',
    buttonLabel: 'Explore Collection',
    buttonUrl: '/collections/summer-essentials',
  });

  // Create New Menu Modal
  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false);
  const [menuModalError, setMenuModalError] = useState<string | null>(null);
  const [newMenuFormData, setNewMenuFormData] = useState({
    title: '',
    handle: '',
    location: 'HEADER',
  });

  // Live Mega Menu Hover Preview in Navbar
  const [activeHoverMegaMenu, setActiveHoverMegaMenu] = useState<CMSMenuItem | null>(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getMenus();
      setMenus(data);
      if (data.length > 0 && !activeMenuId) {
        setActiveMenuId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load menus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAddItemModal = (parentId: string | null = null) => {
    setEditingParentId(parentId);
    setEditingItem(null);
    setItemFormData({
      label: '',
      url: '/',
      target: '_self',
      isMegaMenu: false,
      bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
      headline: 'New Season Capsule 2026',
      buttonLabel: 'Explore Collection',
      buttonUrl: '/collections/summer-essentials',
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item: CMSMenuItem) => {
    setEditingParentId(null);
    setEditingItem(item);
    setItemFormData({
      label: item.label,
      url: item.url,
      target: (item.target as any) || '_self',
      isMegaMenu: !!item.isMegaMenu,
      bannerImage: item.megaMenuConfig?.bannerImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
      headline: item.megaMenuConfig?.headline || 'New Season Capsule 2026',
      buttonLabel: item.megaMenuConfig?.buttonLabel || 'Explore Collection',
      buttonUrl: item.megaMenuConfig?.buttonUrl || '/collections/summer-essentials',
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMenu) return;

    const newItem: CMSMenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      label: itemFormData.label,
      url: itemFormData.url,
      target: itemFormData.target,
      isMegaMenu: itemFormData.isMegaMenu,
      megaMenuConfig: itemFormData.isMegaMenu
        ? {
            bannerImage: itemFormData.bannerImage,
            headline: itemFormData.headline,
            buttonLabel: itemFormData.buttonLabel,
            buttonUrl: itemFormData.buttonUrl,
          }
        : undefined,
      children: editingItem ? editingItem.children || [] : [],
    };

    let updatedItems = [...activeMenu.items];

    if (editingItem) {
      // Helper function to update item in tree
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
      // Add child under parentId
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
      // Add top level item
      updatedItems.push(newItem);
    }

    try {
      setIsSaving(true);
      await cmsService.updateMenu(activeMenu.id, { items: updatedItems });
      showToast(`Menu item "${itemFormData.label}" saved!`, 'success');
      setIsItemModalOpen(false);
      await loadMenus();
    } catch (err: any) {
      showToast(err.message || 'Failed to save menu item.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!activeMenu) return;

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

    const updatedItems = deleteFromTree(activeMenu.items);

    try {
      setIsSaving(true);
      await cmsService.updateMenu(activeMenu.id, { items: updatedItems });
      showToast('Menu item removed!', 'success');
      await loadMenus();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove menu item.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveItem = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!activeMenu) return;

    const newItems = [...activeMenu.items];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    try {
      setIsSaving(true);
      await cmsService.updateMenu(activeMenu.id, { items: newItems });
      await loadMenus();
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder items.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuModalError(null);
    try {
      setIsSaving(true);
      const created = await cmsService.createMenu({
        title: newMenuFormData.title,
        handle: (newMenuFormData.handle || `menu-${Date.now()}`).toLowerCase().trim(),
        location: newMenuFormData.location,
        items: [{ id: `item-${Date.now()}`, label: 'Home', url: '/', target: '_self' }],
      });

      showToast(`Menu "${created.title}" created!`, 'success');
      setIsCreateMenuModalOpen(false);
      await loadMenus();
      setActiveMenuId(created.id);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create menu.';
      setMenuModalError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Navigation Studio...</span>
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
                Navbar & Footer Builder
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {menus.length} Menus Configured
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Compass className="w-8 h-8 text-indigo-400" />
              <span>Navigation Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Control Header Menus, Footer Quick Links, Nested Dropdowns, Mega Menus with featured images, destination routes, and drag/reorder hierarchy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewMenuFormData({ title: '', handle: '', location: 'HEADER' });
              setIsCreateMenuModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Navigation Menu</span>
          </button>
        </div>
      </div>

      {/* MENU SELECTOR & LOCATION TABS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {menus.map((m) => {
            const isActive = m.id === activeMenu?.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMenuId(m.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>{m.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-white/20">
                  {m.location}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddItemModal(null)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Link to {activeMenu?.title}</span>
        </button>
      </div>

      {/* MAIN LAYOUT: MENU TREE EDITOR + LIVE STOREFRONT PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: MENU TREE EDITOR */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-foreground">{activeMenu?.title}</h3>
                <span className="text-[11px] font-mono font-bold text-indigo-600">
                  handle: {activeMenu?.handle} | slot: {activeMenu?.location}
                </span>
              </div>
            </div>

            {/* Menu Items List Tree */}
            <div className="space-y-3">
              {activeMenu?.items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
                  <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">No navigation items added yet.</p>
                  <button
                    type="button"
                    onClick={() => handleOpenAddItemModal(null)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    Add First Link
                  </button>
                </div>
              ) : (
                activeMenu?.items.map((item, idx) => (
                  <div key={item.id} className="space-y-2">
                    {/* Top Level Item Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent border border-slate-200/80 dark:border-border flex items-center justify-between gap-3 group hover:border-indigo-300 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItem(idx, 'UP')}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === activeMenu.items.length - 1}
                            onClick={() => handleMoveItem(idx, 'DOWN')}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-foreground">
                              {item.label}
                            </span>
                            {item.isMegaMenu && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Mega Menu
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold block">
                            {item.url} {item.target === '_blank' && '(Opens in new tab)'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenAddItemModal(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-extrabold flex items-center gap-1 hover:border-indigo-400"
                        >
                          <Plus className="w-3 h-3 text-indigo-600" />
                          <span>Add Sub-Item</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditItemModal(item)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* NESTED CHILD DROPDOWN ITEMS */}
                    {item.children && item.children.length > 0 && (
                      <div className="pl-6 space-y-2 border-l-2 border-indigo-200 ml-4">
                        {item.children.map((child) => (
                          <div
                            key={child.id}
                            className="p-3 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <CornerDownRight className="w-4 h-4 text-indigo-500 shrink-0" />
                              <div>
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{child.label}</span>
                                <span className="text-[11px] font-mono text-slate-400 block">{child.url}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditItemModal(child)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(child.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
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

        {/* RIGHT COLUMN: STOREFRONT NAVBAR LIVE PREVIEW */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span>Live Storefront Navbar Preview</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Interactive Canvas
              </span>
            </div>

            {/* SIMULATED STORE NAVBAR */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-4">
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="font-black text-base text-white tracking-tight flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  OmniStore
                </span>

                {/* Simulated Desktop Nav Items */}
                <div className="hidden sm:flex items-center gap-4">
                  {activeMenu?.items.map((nav) => (
                    <div
                      key={nav.id}
                      className="relative group"
                      onMouseEnter={() => nav.isMegaMenu && setActiveHoverMegaMenu(nav)}
                      onMouseLeave={() => nav.isMegaMenu && setActiveHoverMegaMenu(null)}
                    >
                      <button
                        type="button"
                        className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 py-1"
                      >
                        <span>{nav.label}</span>
                        {((nav.children && nav.children.length > 0) || nav.isMegaMenu) && (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        )}
                      </button>

                      {/* Dropdown Menu Preview */}
                      {nav.children && nav.children.length > 0 && !nav.isMegaMenu && (
                        <div className="absolute top-full left-0 hidden group-hover:block w-40 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xl z-20 space-y-1">
                          {nav.children.map((c) => (
                            <span key={c.id} className="block px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                              {c.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* MEGA MENU INTERACTIVE PREVIEW */}
              {activeHoverMegaMenu && activeHoverMegaMenu.isMegaMenu && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeHoverMegaMenu.label} Mega Menu Dropdown</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Columns of sub-items */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Sub-Categories</span>
                      {activeHoverMegaMenu.children?.map((c) => (
                        <span key={c.id} className="block text-xs font-bold text-slate-200 hover:text-indigo-400 cursor-pointer">
                          • {c.label}
                        </span>
                      ))}
                    </div>

                    {/* Promo Banner Box */}
                    {activeHoverMegaMenu.megaMenuConfig && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 space-y-2">
                        <img
                          src={activeHoverMegaMenu.megaMenuConfig.bannerImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'}
                          alt="Mega Promo"
                          className="h-20 w-full object-cover rounded-lg"
                        />
                        <span className="font-extrabold text-xs text-white block">
                          {activeHoverMegaMenu.megaMenuConfig.headline}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-extrabold">
                          {activeHoverMegaMenu.megaMenuConfig.buttonLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-medium">
                💡 Hover over <span className="text-indigo-400 font-bold">Shop</span> in the preview above to trigger the live Mega Menu banner preview!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    {editingItem ? `Edit Menu Item: ${editingItem.label}` : 'Add Menu Link'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure title, destination URL route, and mega menu settings.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-5">
              {/* Item Label */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Navigation Label Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemFormData.label}
                  onChange={(e) => setItemFormData({ ...itemFormData, label: e.target.value })}
                  placeholder="e.g. Shop, About Us, New Drops"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Destination URL Route <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={itemFormData.url}
                    onChange={(e) => setItemFormData({ ...itemFormData, url: e.target.value })}
                    placeholder="/products or https://..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                  />

                  {/* Route Shortcuts */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Home (/)', url: '/' },
                      { name: 'Products (/products)', url: '/products' },
                      { name: 'Collections (/collections)', url: '/collections' },
                      { name: 'About (/pages/about)', url: '/pages/about' },
                      { name: 'Contact (/pages/contact)', url: '/pages/contact' },
                    ].map((route) => (
                      <button
                        key={route.url}
                        type="button"
                        onClick={() => setItemFormData({ ...itemFormData, url: route.url })}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        {route.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MEGA MENU CONFIGURATION TOGGLE */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Enable Multi-Column Mega Menu</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={itemFormData.isMegaMenu}
                    onChange={(e) => setItemFormData({ ...itemFormData, isMegaMenu: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                {itemFormData.isMegaMenu && (
                  <div className="space-y-3 pt-2 border-t border-indigo-200/60">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Promo Banner Image URL</label>
                      <input
                        type="text"
                        value={itemFormData.bannerImage}
                        onChange={(e) => setItemFormData({ ...itemFormData, bannerImage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Headline Text</label>
                        <input
                          type="text"
                          value={itemFormData.headline}
                          onChange={(e) => setItemFormData({ ...itemFormData, headline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Button Label</label>
                        <input
                          type="text"
                          value={itemFormData.buttonLabel}
                          onChange={(e) => setItemFormData({ ...itemFormData, buttonLabel: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Item...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Item</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW MENU MODAL */}
      {isCreateMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Create New Navigation Menu</h3>
              <button
                type="button"
                onClick={() => setIsCreateMenuModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMenu} className="p-6 space-y-4">
              {menuModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{menuModalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuModalError(null)}
                    className="p-1 text-rose-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Menu Title</label>
                <input
                  type="text"
                  required
                  value={newMenuFormData.title}
                  onChange={(e) => {
                    const titleVal = e.target.value;
                    setNewMenuFormData({
                      ...newMenuFormData,
                      title: titleVal,
                      handle: titleVal.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    });
                  }}
                  placeholder="e.g. Mobile Sidebar Menu"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Menu Handle ID</label>
                <input
                  type="text"
                  required
                  value={newMenuFormData.handle}
                  onChange={(e) => setNewMenuFormData({ ...newMenuFormData, handle: e.target.value })}
                  placeholder="mobile-sidebar-menu"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Menu Location Slot</label>
                <select
                  value={newMenuFormData.location}
                  onChange={(e) => setNewMenuFormData({ ...newMenuFormData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                >
                  <option value="HEADER">Header Navigation Slot</option>
                  <option value="FOOTER">Footer Links Slot</option>
                  <option value="MOBILE">Mobile Navigation Drawer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateMenuModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md"
                >
                  Create Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
