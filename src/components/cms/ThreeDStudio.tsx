'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Box,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Layers,
  ShoppingBag,
  Sliders,
  Download,
  Check,
  X,
  Lock,
  History,
  QrCode,
  Eye,
  Camera,
  Wand2,
  Maximize2,
  RotateCcw,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import {
  ThreeDStudioData,
  ThreeDModelData,
  ThreeDCreditPackage,
  CMSProduct,
  AIAngleKey,
  GeneratedAIAngleItem,
} from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { ThreeDViewer } from '@/src/components/ui/ThreeDViewer';
import { useCMSContext } from '@/src/context/CMSContext';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';
import { SwipeToast } from '@/src/components/ui/SwipeToast';

// Simplified human-friendly reconstruction progress steps
const SIMPLE_STEPS = [
  'Preparing product photos...',
  'Reconstructing 3D structure...',
  'Applying realistic surface textures...',
  'Compiling 3D (.GLB) and AR (.USDZ) assets...',
  'Ready to preview and view in room!',
];

// Quick size presets for physical AR scale
const SIZE_PRESETS = [
  { label: 'Small', desc: 'Shoes, Mugs, Watch, Accessories', width: 30, height: 25, depth: 25 },
  { label: 'Medium', desc: 'Bags, Electronics, Table Lamps', width: 50, height: 50, depth: 50 },
  { label: 'Large', desc: 'Chairs, Luggage, Home Decor', width: 85, height: 95, depth: 80 },
];

export const ThreeDStudio: React.FC = () => {
  const router = useRouter();
  const { merchantData, currencySymbol = '₹', currency = 'INR' } = useCMSContext();
  const { planName } = usePlanAccess();

  // Studio data state
  const [studioData, setStudioData] = useState<ThreeDStudioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [selectedModel, setSelectedModel] = useState<ThreeDModelData | null>(null);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'credits' | 'history'>('create');

  // Creation Mode: 'catalog' (Pick from catalog) | 'upload' (Upload custom photos)
  const [creationMode, setCreationMode] = useState<'catalog' | 'upload'>('catalog');

  // Input State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [modelName, setModelName] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedSizePreset, setSelectedSizePreset] = useState<string>('Medium');
  const [dimensions, setDimensions] = useState({ widthCm: 50, heightCm: 50, depthCm: 50 });
  const [selectedProvider, setSelectedProvider] = useState<'meshy' | 'tripo'>('meshy');

  // Generation progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepIndex, setGenStepIndex] = useState(0);
  const [genProgress, setGenProgress] = useState(0);

  // Modals
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<ThreeDCreditPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'RAZORPAY_UPI' | 'PAYPAL'>('RAZORPAY_UPI');

  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachTargetProductId, setAttachTargetProductId] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);

  const [arQrModalModel, setArQrModalModel] = useState<ThreeDModelData | null>(null);

  // AI Multi-Angle Generator Drawer / Modal
  const [isAiAngleModalOpen, setIsAiAngleModalOpen] = useState(false);
  const [aiProductPrompt, setAiProductPrompt] = useState('');
  const [aiReferenceImage, setAiReferenceImage] = useState<string>('');
  const [isAiGeneratingAngles, setIsAiGeneratingAngles] = useState(false);
  const [aiGeneratedAngles, setAiGeneratedAngles] = useState<GeneratedAIAngleItem[]>([]);

  // Drag & Drop
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search filter in library
  const [librarySearch, setLibrarySearch] = useState('');

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const userRole = (merchantData?.merchant?.role || 'OWNER').toUpperCase();
  const userPermissions = merchantData?.merchant?.permissions || null;
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MERCHANT';
  const has3DPrivilege = isOwnerOrAdmin || userPermissions?.canManage3DModels !== false;

  useEffect(() => {
    loadStudioData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadStudioData = async () => {
    setIsRefreshing(true);
    try {
      const data = await cmsService.getThreeDStudioData();
      setStudioData(data);
      if (data.models && data.models.length > 0 && !selectedModel) {
        setSelectedModel(data.models[0]);
      }
      if (data.packages && data.packages.length > 0 && !selectedPack) {
        setSelectedPack(data.packages[1] || data.packages[0]);
      }
    } catch (err) {
      console.error('Failed to load 3D studio data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // When a catalog product is chosen, auto-populate title & images
  const handleSelectCatalogProduct = (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) return;

    const prod = studioData?.products?.find((p) => p.id === productId);
    if (prod) {
      setModelName(prod.name);
      let imgs: string[] = [];
      if (Array.isArray(prod.images)) {
        imgs = prod.images.filter(Boolean);
      } else if (typeof prod.images === 'string') {
        try {
          const parsed = JSON.parse(prod.images);
          imgs = Array.isArray(parsed) ? parsed : [prod.images];
        } catch {
          imgs = [prod.images];
        }
      }
      setUploadedImages(imgs.length > 0 ? imgs : []);
      if (imgs.length > 0) {
        setAiReferenceImage(imgs[0]);
        setAiProductPrompt(prod.name);
      }
    }
  };

  // Convert File to Base64
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('Please upload standard image files (JPG, PNG, WebP).', 'error');
      return;
    }

    try {
      const newUrls = await Promise.all(validFiles.map(readFileAsDataUrl));
      setUploadedImages((prev) => [...prev, ...newUrls].slice(0, 8));
      showToast(`Added ${newUrls.length} product photo${newUrls.length > 1 ? 's' : ''}!`);
    } catch {
      showToast('Failed to read image files.', 'error');
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (preset: typeof SIZE_PRESETS[0]) => {
    setSelectedSizePreset(preset.label);
    setDimensions({ widthCm: preset.width, heightCm: preset.height, depthCm: preset.depth });
  };

  // Trigger 3D Model Generation
  const handleStartGeneration = async () => {
    if (uploadedImages.length === 0) {
      showToast('Please add at least 1 product photo or pick a catalog product.', 'error');
      return;
    }

    const title = modelName.trim() || 'Custom 3D Product';

    if ((studioData?.credits.available || 0) < 1) {
      setIsBuyModalOpen(true);
      showToast('You need 1 credit to generate a 3D model. Please top up below.', 'error');
      return;
    }

    setIsGenerating(true);
    setGenStepIndex(0);
    setGenProgress(15);

    try {
      const res = await cmsService.generateThreeDModel({
        name: title,
        productId: selectedProductId || null,
        sourceImages: uploadedImages,
        provider: selectedProvider,
        dimensions,
        settings: {
          autoRotate: true,
          lighting: 'studio',
          materialFinish: 'pbr-metallic',
          background: 'gradient-dark',
          scale: 1.0,
          dimensions,
        },
      });

      if (res.jobId) {
        let pollCount = 0;
        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const job = await cmsService.getThreeDJobStatus(res.jobId!);
            setGenProgress(Math.min(95, job.progressPercent));
            setGenStepIndex(Math.min(SIMPLE_STEPS.length - 2, job.stageIndex));

            if (job.status === 'SUCCEEDED' || pollCount >= 12) {
              clearInterval(pollInterval);
              setGenProgress(100);
              setGenStepIndex(SIMPLE_STEPS.length - 1);
              setTimeout(() => {
                setIsGenerating(false);
                showToast(`✨ 3D Model "${title}" created successfully!`);
                loadStudioData();
                setActiveTab('library');
              }, 600);
            } else if (job.status === 'FAILED') {
              clearInterval(pollInterval);
              setIsGenerating(false);
              showToast(job.error || 'Generation failed. Please try again.', 'error');
            }
          } catch {
            // Keep polling
          }
        }, 1200);
      } else {
        setGenProgress(100);
        setGenStepIndex(SIMPLE_STEPS.length - 1);
        setTimeout(() => {
          setIsGenerating(false);
          showToast(`✨ 3D Model "${title}" created!`);
          if (res.model) setSelectedModel(res.model);
          loadStudioData();
          setActiveTab('library');
        }, 600);
      }
    } catch (err: any) {
      setIsGenerating(false);
      if (err.response?.status === 402 || err.response?.data?.code === 'INSUFFICIENT_3D_CREDITS') {
        setIsBuyModalOpen(true);
        showToast('Insufficient 3D credits. Please top up.', 'error');
      } else {
        showToast(err.response?.data?.message || 'Failed to generate 3D model.', 'error');
      }
    }
  };

  // Buy Credits
  const handlePurchaseCredits = async () => {
    if (!selectedPack) return;
    setIsPurchasing(true);
    try {
      const res = await cmsService.purchaseThreeDCredits({
        packId: selectedPack.id,
        paymentMethod: selectedPaymentMethod,
        currency: currency === 'INR' ? 'INR' : 'USD',
      });
      showToast(res.message);
      setIsBuyModalOpen(false);
      loadStudioData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Credit purchase failed.', 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Attach Model to Product
  const handleAttachToProduct = async () => {
    if (!selectedModel || !attachTargetProductId) return;
    setIsAttaching(true);
    try {
      const res = await cmsService.attachThreeDModelToProduct({
        modelId: selectedModel.id,
        productId: attachTargetProductId,
      });
      showToast(res.message);
      setIsAttachModalOpen(false);
      loadStudioData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to attach 3D model.', 'error');
    } finally {
      setIsAttaching(false);
    }
  };

  // Delete 3D Model
  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this 3D model?')) return;
    try {
      await cmsService.deleteThreeDModel(modelId);
      showToast('3D model deleted.');
      if (selectedModel?.id === modelId) setSelectedModel(null);
      loadStudioData();
    } catch {
      showToast('Failed to delete model.', 'error');
    }
  };

  // AI Multi-Angle Generator
  const handleGenerateAiAngles = async () => {
    if (!aiProductPrompt.trim() && !aiReferenceImage) {
      showToast('Please provide a product title or reference photo.', 'error');
      return;
    }

    setIsAiGeneratingAngles(true);
    try {
      const res = await cmsService.generateMultiAngleImages({
        productName: aiProductPrompt.trim() || modelName || 'Product',
        category: 'Product',
        prompt: aiProductPrompt.trim(),
        referenceImage: aiReferenceImage || undefined,
        style: 'studio-white',
        angles: ['front', 'back', 'left', 'right', 'isometric'],
      });

      if (res && res.angles && res.angles.length > 0) {
        setAiGeneratedAngles(res.angles);
        showToast('Generated 5 complementary product angles!');
      } else {
        showToast('Could not generate angles. Please try again.', 'error');
      }
    } catch {
      showToast('AI angle generation failed.', 'error');
    } finally {
      setIsAiGeneratingAngles(false);
    }
  };

  const handleApplyAiAngles = () => {
    if (aiGeneratedAngles.length === 0) return;
    const urls = aiGeneratedAngles.map((a) => a.imageUrl);
    setUploadedImages(urls);
    if (!modelName.trim() && aiProductPrompt.trim()) {
      setModelName(aiProductPrompt.trim());
    }
    setIsAiAngleModalOpen(false);
    showToast('Applied AI angles to 3D pipeline!');
  };

  // Filtered models for library search
  const filteredModels = (studioData?.models || []).filter((m) =>
    m.name.toLowerCase().includes(librarySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <SwipeToast
          open={!!toast}
          type={toast.type}
          title={toast.type === 'success' ? 'Success' : 'Error'}
          description={toast.text}
          onClose={() => setToast(null)}
          duration={3500}
        />
      )}

      {/* Privilege Warning Banner */}
      {!has3DPrivilege && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">Staff View Only</h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                You can browse existing 3D models, but generating new models requires admin permissions.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full font-bold">
            Read Only
          </span>
        </div>
      )}

      {/* ─── STUDIO HEADER CARD & CREDIT PILL ───────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wide border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-1">
                <Box className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>3D & Augmented Reality</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
              3D Product Modeling & AR Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Turn your product photos into interactive 3D models and Augmented Reality (AR) experiences for your shoppers.
            </p>
          </div>

          {/* Simple Credit Counter & Top Up */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-accent/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-border/60 shrink-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Available Credits</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-foreground font-mono">
                  {studioData?.credits.available ?? 10}
                </span>
                <span className="text-[11px] text-slate-400">models left</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-border">
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-xs flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top Up</span>
              </button>
              <button
                type="button"
                onClick={loadStudioData}
                disabled={isRefreshing}
                title="Refresh Balance"
                className="p-2 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-accent text-slate-600 dark:text-slate-300 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-accent/40 rounded-2xl border border-slate-200/80 dark:border-border/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'create', label: 'Create 3D Model', icon: Sparkles },
            { id: 'library', label: `Model Library (${studioData?.models.length || 0})`, icon: Layers },
            { id: 'credits', label: 'Buy Credits', icon: Zap },
            { id: 'history', label: 'History & Receipts', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB 1: CREATE 3D MODEL ────────────────────────────────────────── */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Simple Creation Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-5">
              {/* Mode Switcher: 'From Store Product' vs 'Upload Photos' */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Step 1: Choose Source
                </span>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/80 dark:bg-accent/40 p-1 rounded-2xl border border-slate-200/80 dark:border-border">
                  <button
                    type="button"
                    onClick={() => setCreationMode('catalog')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      creationMode === 'catalog'
                        ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>From Store Product</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreationMode('upload')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      creationMode === 'upload'
                        ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Custom Photos</span>
                  </button>
                </div>
              </div>

              {/* MODE A: FROM STORE PRODUCT (1-Click Simplicity) */}
              {creationMode === 'catalog' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Select Product from Your Store Catalog
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleSelectCatalogProduct(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose a Product --</option>
                      {studioData?.products?.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} ({currencySymbol}{prod.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProductId && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {uploadedImages.length > 0 ? (
                          <img
                            src={uploadedImages[0]}
                            alt="Product"
                            className="w-12 h-12 rounded-xl object-cover border border-indigo-200 dark:border-indigo-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-foreground line-clamp-1">
                            {modelName}
                          </h4>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            {uploadedImages.length} photo{uploadedImages.length === 1 ? '' : 's'} loaded · Ready to generate
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAiAngleModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-card border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 text-[11px] font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Enhance with AI</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: UPLOAD CUSTOM PHOTOS */}
              {creationMode === 'upload' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g. Minimalist Ceramic Vase"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Optional Catalog Link */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Link to Store Product (Optional)
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Don't link right now --</option>
                      {studioData?.products?.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} ({currencySymbol}{prod.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* UNIFIED DRAG & DROP PHOTO ZONE */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Product Photos ({uploadedImages.length} added)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAiAngleModalOpen(true)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Multi-Angle Assistant</span>
                    </button>
                    {uploadedImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUploadedImages([])}
                        className="text-rose-500 hover:underline text-[11px] font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                    isDragOver
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-4 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-border hover:border-indigo-400 bg-slate-50/60 dark:bg-accent/20 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFileUpload(e.target.files);
                    }}
                  />
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Drag & drop product photos here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      1 photo is enough! For best 360° results, 2-4 photos (front, back, side) work best.
                    </p>
                  </div>
                </div>

                {/* Uploaded Thumbnail Strip */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-border"
                      >
                        <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-mono font-bold">
                            {idx === 0 ? 'Main' : `#${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white transition opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < 8 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border border-dashed border-slate-300 dark:border-border hover:border-indigo-400 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 text-[10px] font-bold gap-1 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* COLLAPSIBLE ADVANCED SETTINGS (Dimensions & Scale) */}
              <div className="pt-2 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>Real-World Size & AR Scale (Optional)</span>
                  </span>
                  {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedSettings && (
                  <div className="pt-3 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-3 gap-2">
                      {SIZE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            selectedSizePreset === preset.label
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-50 dark:bg-accent/20 border-slate-200 dark:border-border text-slate-600'
                          }`}
                        >
                          <span className="text-xs font-bold block">{preset.label}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Width (cm)</label>
                        <input
                          type="number"
                          value={dimensions.widthCm}
                          onChange={(e) => setDimensions({ ...dimensions, widthCm: parseFloat(e.target.value) || 10 })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Height (cm)</label>
                        <input
                          type="number"
                          value={dimensions.heightCm}
                          onChange={(e) => setDimensions({ ...dimensions, heightCm: parseFloat(e.target.value) || 10 })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Depth (cm)</label>
                        <input
                          type="number"
                          value={dimensions.depthCm}
                          onChange={(e) => setDimensions({ ...dimensions, depthCm: parseFloat(e.target.value) || 10 })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GENERATE BUTTON */}
              <div className="pt-4 border-t border-slate-100 dark:border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Cost: 1 Credit</span>
                  </div>
                  <span>({studioData?.credits.available ?? 10} credits left)</span>
                </div>

                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={isGenerating || uploadedImages.length === 0 || !has3DPrivilege}
                  className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating 3D Model ({genProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate 3D Model</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Progress Card */}
            {isGenerating && (
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Building 3D Asset
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">{genProgress}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${genProgress}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  {SIMPLE_STEPS.map((step, idx) => {
                    const isDone = idx < genStepIndex;
                    const isCurrent = idx === genStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs transition ${
                          isDone
                            ? 'text-emerald-400 font-bold'
                            : isCurrent
                              ? 'text-indigo-300 font-bold animate-pulse'
                              : 'text-slate-600'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                        )}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive 3D & AR Viewer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-foreground">
                    Interactive 3D & AR Preview
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300 font-bold">
                  360° Orbit
                </span>
              </div>

              {/* 3D Canvas */}
              <ThreeDViewer
                modelUrl={selectedModel?.modelUrl}
                posterUrl={selectedModel?.thumbnailUrl || uploadedImages[0]}
                productName={modelName || selectedModel?.name || 'Interactive 3D Preview'}
                polyCount={selectedModel?.polyCount || 18450}
                usdzUrl={selectedModel?.usdzUrl}
                dimensions={dimensions}
                provider={selectedProvider}
                height="340px"
              />

              {/* AR Quick Action Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-foreground">
                      Augmented Reality (AR)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Scan QR code on your phone to view in room.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedModel) setArQrModalModel(selectedModel);
                  }}
                  disabled={!selectedModel}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-40"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View AR</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedModel) {
                      setAttachTargetProductId(selectedModel.productId || '');
                      setIsAttachModalOpen(true);
                    }
                  }}
                  disabled={!selectedModel}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 dark:hover:bg-accent/80 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Attach to Product</span>
                </button>

                <a
                  href={selectedModel?.modelUrl || '#'}
                  download={`${(selectedModel?.name || 'model').toLowerCase().replace(/\s+/g, '-')}.glb`}
                  target="_blank"
                  rel="noreferrer"
                  className={`py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 dark:hover:bg-accent/80 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    !selectedModel ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download (.GLB)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MODEL LIBRARY ──────────────────────────────────────────── */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-foreground">
                Your 3D Product Catalog ({studioData?.models.length || 0})
              </h3>
              <p className="text-xs text-slate-500">
                All 3D assets ready for your storefront product pages and mobile AR viewers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create 3D Model</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative">
                    <ThreeDViewer
                      modelUrl={model.modelUrl}
                      posterUrl={model.thumbnailUrl}
                      productName={model.name}
                      polyCount={model.polyCount || 18450}
                      height="230px"
                      showControls={false}
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setArQrModalModel(model)}
                        title="View AR QR Code"
                        className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-indigo-600 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>AR View</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-foreground line-clamp-1">
                        {model.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {model.productId ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Linked to Store Product</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Not linked to a product</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                      <span>{((model.fileSizeBytes || 3800000) / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel(model);
                          setAttachTargetProductId(model.productId || '');
                          setIsAttachModalOpen(true);
                        }}
                        className="py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Link</span>
                      </button>

                      <a
                        href={model.modelUrl || '#'}
                        download={`${model.name.toLowerCase().replace(/\s+/g, '-')}.glb`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <Download className="w-3 h-3" />
                        <span>.GLB</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteModel(model.id)}
                        className="py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-border space-y-3">
                <Box className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                    No 3D Models Found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Generate your first 3D product model from your catalog or photo uploads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Create 3D Model
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: BUY CREDITS ────────────────────────────────────────────── */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-foreground">
              Add 3D Model Credits
            </h3>
            <p className="text-xs text-slate-500">
              Credits never expire. Each credit generates 1 production-ready 3D model with Apple AR and WebXR support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {studioData?.packages?.map((pack) => {
              const priceDisplay =
                currency === 'INR' ? `₹${pack.priceInr.toLocaleString()}` : `$${pack.priceUsd.toFixed(2)}`;

              return (
                <div
                  key={pack.id}
                  onClick={() => {
                    setSelectedPack(pack);
                    setIsBuyModalOpen(true);
                  }}
                  className={`relative rounded-3xl p-5 border transition cursor-pointer flex flex-col justify-between space-y-5 ${
                    pack.popular
                      ? 'bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-card border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-card border-slate-200 dark:border-border hover:border-slate-300'
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                        {pack.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-foreground">
                        {pack.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{pack.description}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 text-center space-y-0.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-foreground font-mono">
                        +{pack.credits}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-bold block">3D Credits</span>
                    </div>

                    <div className="text-center">
                      <span className="text-xl font-black text-slate-900 dark:text-foreground font-mono">
                        {priceDisplay}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{pack.perCreditUsd}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      pack.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Select Pack</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 4: CREDIT TRANSACTION HISTORY ─────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-foreground">
                Credit History & Invoices
              </h3>
              <p className="text-xs text-slate-500">
                Audit log of all 3D credit purchases and model generations.
              </p>
            </div>
            <TableRefreshButton onRefresh={loadStudioData} isRefreshing={isRefreshing} />
          </div>

          {(() => {
            const allTx = studioData?.transactions || [];
            const paginatedTx = allTx.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);
            return (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-accent/40 text-[10px] uppercase font-mono text-slate-500">
                      <tr>
                        <th className="py-2.5 px-4 rounded-l-xl">Date</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                        <th className="py-2.5 px-4 text-right rounded-r-xl">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                      {paginatedTx.length > 0 ? (
                        paginatedTx.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-accent/20">
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  tx.type === 'PURCHASE'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                                    : tx.type === 'PLAN_GRANT'
                                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700'
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                              {tx.description}
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-mono font-bold ${
                                tx.amount > 0 ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-foreground">
                              {tx.balanceAfter}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No credit transactions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={historyPage}
                  totalItems={allTx.length}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPage}
                  onPageSizeChange={(newSize) => {
                    setHistoryPageSize(newSize);
                    setHistoryPage(1);
                  }}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* ─── MODAL: TOP-UP CHECKOUT ────────────────────────────────────────── */}
      {isBuyModalOpen && selectedPack && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Top Up 3D Credits</h4>
                  <p className="text-[11px] text-slate-300">Instant credit balance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">{selectedPack.name}</span>
                  <span className="text-base font-black text-indigo-600 font-mono">
                    {currency === 'INR' ? `₹${selectedPack.priceInr.toLocaleString()}` : `$${selectedPack.priceUsd.toFixed(2)}`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Adds:</span>
                  <span className="text-emerald-600 font-bold">+{selectedPack.credits} Models</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('RAZORPAY_UPI')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                      selectedPaymentMethod === 'RAZORPAY_UPI'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-border'
                    }`}
                  >
                    UPI / Netbanking
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('PAYPAL')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                      selectedPaymentMethod === 'PAYPAL'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-border'
                    }`}
                  >
                    PayPal / Card
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePurchaseCredits}
                  disabled={isPurchasing}
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isPurchasing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Pay {currency === 'INR' ? `₹${selectedPack.priceInr.toLocaleString()}` : `$${selectedPack.priceUsd.toFixed(2)}`}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ATTACH TO STORE PRODUCT ─────────────────────────────────── */}
      {isAttachModalOpen && selectedModel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Link 3D Model</h4>
                  <p className="text-[11px] text-slate-300">Show on store product page</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Select Product for "{selectedModel.name}"
                </label>
                <select
                  value={attachTargetProductId}
                  onChange={(e) => setAttachTargetProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Product --</option>
                  {studioData?.products?.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({currencySymbol}{prod.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsAttachModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAttachToProduct}
                  disabled={isAttaching || !attachTargetProductId}
                  className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isAttaching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Linking...</span>
                    </>
                  ) : (
                    <span>Save & Link</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: AR QR CODE FOR ROOM PLACEMENT ──────────────────────────── */}
      {arQrModalModel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 text-center p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-border">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-foreground">
                  View in Augmented Reality
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setArQrModalModel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code */}
            <div className="p-4 bg-slate-50 dark:bg-accent/40 rounded-2xl border border-slate-200 dark:border-border inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  arQrModalModel.usdzUrl || arQrModalModel.modelUrl || 'https://omnistore.com'
                )}`}
                alt="AR QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Scan with your phone camera
              </h5>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Works instantly on iPhone (Apple QuickLook) and Android (Scene Viewer). See {arQrModalModel.name} in your room at true 1:1 scale!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setArQrModalModel(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: AI MULTI-ANGLE ASSISTANT ────────────────────────────────── */}
      {isAiAngleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">AI Multi-Angle Assistant</h4>
                  <p className="text-[11px] text-slate-300">
                    Only have 1 photo? AI generates front, back, side & 3/4 views automatically.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiAngleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Product Description or Title
                </label>
                <input
                  type="text"
                  value={aiProductPrompt}
                  onChange={(e) => setAiProductPrompt(e.target.value)}
                  placeholder="e.g. White Leather Sneaker with Gum Sole"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {aiReferenceImage && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border">
                  <img src={aiReferenceImage} alt="Ref" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Reference Photo Loaded</span>
                    <span className="text-slate-400 text-[11px]">AI will preserve colors, materials and details.</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateAiAngles}
                disabled={isAiGeneratingAngles || (!aiProductPrompt.trim() && !aiReferenceImage)}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isAiGeneratingAngles ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Angles...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate 5 Complementary Angles</span>
                  </>
                )}
              </button>

              {aiGeneratedAngles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Generated Angles (5 Views):
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {aiGeneratedAngles.map((angle) => (
                      <div
                        key={angle.key}
                        className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group"
                      >
                        <img src={angle.imageUrl} alt={angle.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-white text-[8px] font-mono font-bold">
                          {angle.key}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-accent/40 border-t border-slate-200 dark:border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiAngleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAiAngles}
                disabled={aiGeneratedAngles.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Use Photos in 3D Model</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
