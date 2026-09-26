'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Box,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ShoppingBag,
  Sliders,
  Share2,
  Download,
  Info,
  Check,
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Clock,
  History,
  QrCode,
  Eye,
  Camera,
} from 'lucide-react';
import {
  ThreeDStudioData,
  ThreeDModelData,
  ThreeDCreditPackage,
  ThreeDCreditTransaction,
  CMSProduct,
} from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { ThreeDViewer } from '@/src/components/ui/ThreeDViewer';
import { useCMSContext } from '@/src/context/CMSContext';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';

// Sample multi-angle image presets for one-click testing
const SAMPLE_PRESET_IMAGES = [
  {
    name: 'Cyber Kinetic Sneaker (5 Angles)',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    name: 'Studio Wireless Headphones (5 Angles)',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    name: 'Luxury Chronograph Watch (5 Angles)',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=600&q=80',
    ],
  },
];

const RECONSTRUCTION_STAGES = [
  'Point Cloud Keypoint Matching (SIFT / ORB)',
  'Neural Depth & Spatial Volumetric Synthesis',
  'Poisson Surface Mesh Optimization',
  'PBR High-Res Texture Baking (Diffuse, Normal, Roughness)',
  'Exporting GLB + USDZ AR Asset Packages',
];

export const ThreeDStudio: React.FC = () => {
  const router = useRouter();
  const { merchantData, currencySymbol = '₹', currency = 'INR' } = useCMSContext();
  const { planName } = usePlanAccess();

  const [studioData, setStudioData] = useState<ThreeDStudioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ThreeDModelData | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'credits' | 'history'>('create');

  // Multi-angle Image Upload State (Slot 1 to 5)
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    SAMPLE_PRESET_IMAGES[0].images[0],
    SAMPLE_PRESET_IMAGES[0].images[1],
    SAMPLE_PRESET_IMAGES[0].images[2],
    SAMPLE_PRESET_IMAGES[0].images[3],
    SAMPLE_PRESET_IMAGES[0].images[4],
  ]);
  const [modelName, setModelName] = useState('Cyber Kinetic Sneaker Scan');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Generation Pipeline Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStageIndex, setGenStageIndex] = useState(0);
  const [genProgressPercent, setGenProgressPercent] = useState(0);

  // Top-Up Credit Pack Modal
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<ThreeDCreditPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'RAZORPAY_UPI' | 'PAYPAL'>('RAZORPAY_UPI');

  // Attach To Product Modal
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachTargetProductId, setAttachTargetProductId] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);

  // Toast message
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Drag & Drop State
  const [isMasterDragOver, setIsMasterDragOver] = useState(false);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const masterFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const slotInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // User Privileges
  const userRole = (merchantData?.merchant?.role || 'OWNER').toUpperCase();
  const userPermissions = merchantData?.merchant?.permissions || null;
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MERCHANT';
  const has3DPrivilege = isOwnerOrAdmin || userPermissions?.canManage3DModels !== false;

  useEffect(() => {
    loadStudioData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  const loadStudioData = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getThreeDStudioData();
      setStudioData(data);
      if (data.models && data.models.length > 0 && !selectedModel) {
        setSelectedModel(data.models[0]);
      }
      if (data.packages && data.packages.length > 0 && !selectedPack) {
        setSelectedPack(data.packages[1] || data.packages[0]); // default to Growth Pro
      }
    } catch (err) {
      console.error('Failed to load 3D studio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger 3D Reconstruction Job
  const handleStartGeneration = async () => {
    const validImages = uploadedImages.filter((img) => img && img.trim().length > 0);
    if (validImages.length < 4) {
      showToast('Please upload at least 4 multi-angle product photos (Front, Back, Left, Right).', 'error');
      return;
    }

    if (!modelName.trim()) {
      showToast('Please provide a name for this 3D model.', 'error');
      return;
    }

    if ((studioData?.credits.available || 0) < 1) {
      setIsBuyModalOpen(true);
      showToast('Insufficient 3D credits! Please purchase a top-up pack to generate models.', 'error');
      return;
    }

    setIsGenerating(true);
    setGenStageIndex(0);
    setGenProgressPercent(10);

    // Multi-stage visual progress simulation
    const interval = setInterval(() => {
      setGenProgressPercent((prev) => {
        if (prev >= 95) return 95;
        const next = prev + Math.floor(Math.random() * 14) + 6;
        if (next > 25 && next < 50) setGenStageIndex(1);
        if (next >= 50 && next < 70) setGenStageIndex(2);
        if (next >= 70 && next < 90) setGenStageIndex(3);
        if (next >= 90) setGenStageIndex(4);
        return Math.min(next, 95);
      });
    }, 600);

    try {
      const res = await cmsService.generateThreeDModel({
        name: modelName,
        productId: selectedProductId || null,
        sourceImages: validImages,
        settings: {
          autoRotate: true,
          lighting: 'studio',
          materialFinish: 'pbr-metallic',
          background: 'gradient-dark',
          scale: 1.0,
        },
      });

      clearInterval(interval);
      setGenProgressPercent(100);
      setGenStageIndex(4);

      setTimeout(() => {
        setIsGenerating(false);
        showToast(`✨ 3D Model "${res.model.name}" reconstructed successfully! 1 credit deducted.`);
        setSelectedModel(res.model);
        loadStudioData();
        setActiveTab('library');
      }, 800);
    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      if (err.response?.status === 402 || err.response?.data?.code === 'INSUFFICIENT_3D_CREDITS') {
        setIsBuyModalOpen(true);
        showToast('Insufficient 3D Credits. Please purchase a top-up pack.', 'error');
      } else {
        showToast(err.response?.data?.message || 'Failed to generate 3D model.', 'error');
      }
    }
  };

  // Buy 3D Credits
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
      showToast(err.response?.data?.message || 'Failed to attach 3D model to product.', 'error');
    } finally {
      setIsAttaching(false);
    }
  };

  const handleApplyPreset = (preset: (typeof SAMPLE_PRESET_IMAGES)[0]) => {
    setUploadedImages([...preset.images]);
    setModelName(`${preset.name.replace(/\s*\(5 Angles\)/, '')} 3D Scan`);
    showToast(`Loaded "${preset.name}" 5-angle preset photos.`);
  };

  const handleImageSlotChange = (index: number, url: string) => {
    const updated = [...uploadedImages];
    updated[index] = url;
    setUploadedImages(updated);
  };

  // Convert File to Base64 / Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Process dropped or selected files
  const handleProcessFiles = async (fileList: FileList | File[], targetSlotIndex?: number) => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) {
      showToast('Please upload or drop valid image files (JPG, PNG, WebP, AVIF).', 'error');
      return;
    }

    setIsReadingFiles(true);
    try {
      if (typeof targetSlotIndex === 'number' && targetSlotIndex >= 0 && targetSlotIndex < 5) {
        // Targeted single slot upload
        const dataUrl = await readFileAsDataUrl(files[0]);
        handleImageSlotChange(targetSlotIndex, dataUrl);
        showToast(`📸 Loaded image for ${SLOT_CONFIGS[targetSlotIndex].label}.`);
      } else {
        // Multi-slot auto-distribution across 1-5 angle slots
        const urls = await Promise.all(files.slice(0, 5).map((f) => readFileAsDataUrl(f)));
        const updated = [...uploadedImages];
        urls.forEach((url, i) => {
          if (i < 5) {
            updated[i] = url;
          }
        });
        setUploadedImages(updated);
        showToast(`✨ Automatically distributed ${urls.length} photo${urls.length > 1 ? 's' : ''} across 3D angle slots!`);
      }
    } catch (err) {
      console.error('File reading error:', err);
      showToast('Failed to process image files. Please try again.', 'error');
    } finally {
      setIsReadingFiles(false);
    }
  };

  // Drag-and-Drop Slot Swap
  const handleSwapSlots = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= 5 || toIndex >= 5) return;
    const updated = [...uploadedImages];
    const temp = updated[fromIndex];
    updated[fromIndex] = updated[toIndex];
    updated[toIndex] = temp;
    setUploadedImages(updated);
    showToast(`Swapped angle ${fromIndex + 1} with angle ${toIndex + 1}.`);
  };

  // Clear all uploaded images
  const handleClearAllImages = () => {
    setUploadedImages(['', '', '', '', '']);
    showToast('Cleared all 3D image slots.');
  };

  // Slot Labels for 4-5 photo photogrammetry
  const SLOT_CONFIGS = [
    { label: 'Front View (0°)', desc: 'Direct face on eye-level capture', tag: 'Required' },
    { label: 'Back View (180°)', desc: 'Rear angle with consistent lighting', tag: 'Required' },
    { label: 'Left Profile (90°)', desc: 'Left lateral orthographic view', tag: 'Required' },
    { label: 'Right Profile (270°)', desc: 'Right lateral orthographic view', tag: 'Required' },
    { label: 'Top / Isometric (45°)', desc: 'Elevated isometric angle for depth', tag: 'Recommended' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-indigo-950/90 text-indigo-200 border-indigo-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Privilege Warning Banner if restricted */}
      {!has3DPrivilege && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">3D Studio Read-Only Mode</h4>
              <p className="text-[11px] text-amber-200/80">
                Your current staff role does not have the <code>canManage3DModels</code> privilege. You can inspect existing 3D models but cannot generate new assets.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold">
            Staff Access Limited
          </span>
        </div>
      )}

      {/* ─── TOP HERO HEADER CARD & CREDIT DASHBOARD ──────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 shadow-2xl p-6 sm:p-8 text-white">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
                <Box className="w-4 h-4" />
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
                AI Photogrammetry Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              3D Product Modeling & AR Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Synthesize production-ready 3D WebGL assets (.GLB) and iOS Augmented Reality (.USDZ) by uploading 4-5 multi-angle product photos.
            </p>
          </div>

          {/* Real-time 3D Credits Metric Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-black/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>3D AI Credits</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-300 font-bold">
                  {studioData?.credits.plan || planName} Plan
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {studioData?.credits.available ?? 10}
                </span>
                <span className="text-xs text-slate-400 font-medium">Credits Available</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <span>{studioData?.credits.used ?? 0} Models Generated</span>
                <span>•</span>
                <span>+{studioData?.credits.monthlyAllowance ?? 5}/mo Included</span>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buy 3D Credits</span>
              </button>

              <button
                type="button"
                onClick={loadStudioData}
                disabled={isLoading}
                title="Refresh Credit Balance"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="relative mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'create', label: '✨ Create 3D Model', icon: Sparkles },
            {
              id: 'library',
              label: `📦 Model Library (${studioData?.models.length || 0})`,
              icon: Layers,
            },
            { id: 'credits', label: '⚡ Credit Top-Up Packs', icon: Zap },
            { id: 'history', label: '📜 Credit Ledger', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md font-extrabold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB 1: CREATE 3D MODEL PIPELINE ───────────────────────────────── */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Slots & Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-border pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-indigo-600" />
                    <span>Upload 4-5 Multi-Angle Photos</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    High photogrammetry fidelity requires capturing the product from all 4 cardinal angles plus 1 isometric elevation.
                  </p>
                </div>

                {/* Quick Presets & Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 hidden md:inline">Demo Presets:</span>
                  <div className="flex gap-1">
                    {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-accent text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        {idx === 0 ? '👟 Sneaker' : idx === 1 ? '🎧 Audio' : '⌚ Watch'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllImages}
                    title="Clear all photo slots"
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-border hover:bg-rose-50 hover:border-rose-300 text-rose-600 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {/* ─── MASTER DRAG & DROP DROPZONE ──────────────────────────── */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMasterDragOver(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMasterDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMasterDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMasterDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleProcessFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => masterFileInputRef.current?.click()}
                className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 group ${
                  isMasterDragOver
                    ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/50 ring-4 ring-indigo-500/20 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/70 dark:bg-accent/20 hover:bg-indigo-50/40'
                }`}
              >
                <input
                  ref={masterFileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleProcessFiles(e.target.files);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      isMasterDragOver
                        ? 'bg-indigo-600 text-white scale-110 rotate-3 shadow-indigo-500/40'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}
                  >
                    <UploadCloud className={`w-7 h-7 ${isMasterDragOver || isReadingFiles ? 'animate-bounce' : ''}`} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                      <span>{isMasterDragOver ? '✨ Drop 4-5 Product Photos Here!' : 'Drag & Drop 4-5 Product Photos Here'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Drop multiple angle photos at once to auto-assign across Front, Back, Left, Right & Top views, or <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">browse local files</span>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      JPG, PNG, WebP
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      Auto-Distributes 5 Angles
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Drag to Swap & Re-order
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Guided Image Slots Grid with Individual Drag & Drop */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Photogrammetry Angle Slots ({uploadedImages.filter((img) => img && img.trim()).length}/5 Filled)</span>
                  <span className="text-[10px] text-slate-400 font-normal">💡 Tip: Drag images between slots to swap positions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {SLOT_CONFIGS.map((slot, idx) => {
                    const currentImg = uploadedImages[idx] || '';
                    const isSlotOver = dragOverSlotIndex === idx;
                    const isBeingDragged = draggedSlotIndex === idx;

                    return (
                      <div
                        key={idx}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverSlotIndex(idx);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverSlotIndex(idx);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (dragOverSlotIndex === idx) setDragOverSlotIndex(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverSlotIndex(null);

                          // Check if another slot is being swapped onto this slot
                          const draggedFromStr = e.dataTransfer.getData('text/plain');
                          if (draggedFromStr !== '' && draggedFromStr !== null) {
                            const fromIdx = parseInt(draggedFromStr, 10);
                            if (!isNaN(fromIdx) && fromIdx !== idx) {
                              handleSwapSlots(fromIdx, idx);
                              return;
                            }
                          }

                          // If external files dropped on this slot
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            handleProcessFiles(e.dataTransfer.files, idx);
                          }
                        }}
                        className={`group relative rounded-2xl border transition-all duration-200 bg-slate-50 dark:bg-accent/30 p-3 flex flex-col justify-between space-y-2 ${
                          isSlotOver
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/60 dark:bg-indigo-950/50 scale-[1.02]'
                            : isBeingDragged
                              ? 'opacity-40 border-dashed border-indigo-400'
                              : 'border-slate-200 dark:border-border hover:border-indigo-400'
                        }`}
                      >
                        <input
                          ref={(el) => {
                            slotInputRefs.current[idx] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleProcessFiles(e.target.files, idx);
                            }
                          }}
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                            {slot.label}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              slot.tag === 'Required'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                            }`}
                          >
                            {slot.tag}
                          </span>
                        </div>

                        {/* Image Preview / Drag Area Box */}
                        <div
                          draggable={!!currentImg}
                          onDragStart={(e) => {
                            if (currentImg) {
                              e.dataTransfer.setData('text/plain', String(idx));
                              setDraggedSlotIndex(idx);
                            }
                          }}
                          onDragEnd={() => setDraggedSlotIndex(null)}
                          onClick={() => {
                            if (!currentImg) {
                              slotInputRefs.current[idx]?.click();
                            }
                          }}
                          className={`relative aspect-square w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all ${
                            currentImg
                              ? 'cursor-grab active:cursor-grabbing hover:shadow-md'
                              : 'cursor-pointer hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          {currentImg ? (
                            <>
                              <img
                                src={currentImg}
                                alt={slot.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold bg-black/70 text-white px-2 py-1 rounded-md transition shadow">
                                  Drag to Swap
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-slate-400 text-center p-2">
                              <div className="p-2 rounded-xl bg-white/60 dark:bg-card/60 shadow-sm group-hover:scale-110 transition">
                                <Camera className="w-5 h-5 text-indigo-500" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {isSlotOver ? 'Drop Image Here' : 'Drop or Browse'}
                              </span>
                              <span className="text-[9px] text-slate-400">{slot.desc}</span>
                            </div>
                          )}

                          {/* Quick Replace & Clear actions on hover */}
                          {currentImg && (
                            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  slotInputRefs.current[idx]?.click();
                                }}
                                title="Replace image from file"
                                className="p-1 rounded-md bg-black/60 text-white hover:bg-indigo-600 transition cursor-pointer"
                              >
                                <UploadCloud className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageSlotChange(idx, '');
                                }}
                                title="Clear slot"
                                className="p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* URL input fallback */}
                        <input
                          type="url"
                          placeholder="Paste image URL..."
                          value={currentImg}
                          onChange={(e) => handleImageSlotChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-[11px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Model Metadata & Catalog Linking Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    3D Model Asset Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. Apex Runner Gen-2 Scan"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Link to Store Catalog Product (Optional)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Do not link right now --</option>
                    {studioData?.products?.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({currencySymbol}
                        {prod.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Button & Cost Pill */}
              <div className="pt-4 border-t border-slate-100 dark:border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Cost: 1 3D Credit</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Remaining balance: <strong>{studioData?.credits.available ?? 10} credits</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={isGenerating || !has3DPrivilege}
                  className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reconstructing 3D Mesh ({genProgressPercent}%)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Synthesize 3D Model</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Progress Bar during Photogrammetry Pipeline */}
            {isGenerating && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-900/60 shadow-xl space-y-4 text-white animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                      Neural Photogrammetry Pipeline
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-400">{genProgressPercent}%</span>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 shadow-md"
                    style={{ width: `${genProgressPercent}%` }}
                  />
                </div>

                {/* 5 Stages visual tracker */}
                <div className="space-y-1.5 pt-2">
                  {RECONSTRUCTION_STAGES.map((stage, idx) => {
                    const isDone = idx < genStageIndex;
                    const isCurrent = idx === genStageIndex;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 text-[11px] font-mono transition ${
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
                        <span>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive 3D WebGL Viewport Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-foreground">
                    Interactive 3D Viewport
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-accent text-slate-600 font-bold">
                  360° OrbitControls
                </span>
              </div>

              {/* 3D WebGL Canvas */}
              <ThreeDViewer
                modelUrl={selectedModel?.modelUrl}
                posterUrl={selectedModel?.thumbnailUrl || uploadedImages[0]}
                productName={modelName}
                polyCount={selectedModel?.polyCount || 18450}
                height="380px"
              />

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/60 dark:border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Export Formats:</span>
                  <span className="font-mono font-bold text-indigo-600">.GLB (WebGL) + .USDZ (iOS AR)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Generated models are optimized for real-time web rendering (under 4MB) with full PBR metallic-roughness textures.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: 3D MODEL ASSET LIBRARY ─────────────────────────────────── */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-foreground">
                3D Asset Library
              </h3>
              <p className="text-xs text-slate-500">
                Browse, preview, download, and attach your digitized 3D product models.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New 3D Scan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studioData?.models && studioData.models.length > 0 ? (
              studioData.models.map((model) => (
                <div
                  key={model.id}
                  className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Viewport Box */}
                  <div className="relative">
                    <ThreeDViewer
                      modelUrl={model.modelUrl}
                      posterUrl={model.thumbnailUrl}
                      productName={model.name}
                      polyCount={model.polyCount || 18450}
                      height="260px"
                      showControls={false}
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                        {((model.fileSizeBytes || 3840000) / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>

                  {/* Details & Actions */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-foreground line-clamp-1">
                        {model.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {model.description || 'Photogrammetric 3D scan.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                      <span className="text-indigo-600 font-bold">1 Credit Cost</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel(model);
                          setAttachTargetProductId(model.productId || '');
                          setIsAttachModalOpen(true);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{model.productId ? 'Linked Product' : 'Attach Product'}</span>
                      </button>

                      <a
                        href={model.modelUrl || '#'}
                        download={`${model.name.toLowerCase().replace(/\s+/g, '-')}.glb`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .GLB</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-border space-y-4">
                <Box className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">
                    No 3D Models Synthesized Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Upload 4-5 photos of any product to generate your first interactive 3D asset.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md"
                >
                  Create First 3D Model
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: CREDIT PACKAGES & TOP-UP ───────────────────────────────── */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
              Pay-As-You-Go 3D Credits
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-foreground">
              Boost Your 3D Catalog Quota
            </h3>
            <p className="text-xs text-slate-500">
              When your monthly subscription tier allowance is depleted, top up credits instantly. Credits never expire and carry over indefinitely.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studioData?.packages?.map((pack) => {
              const isSelected = selectedPack?.id === pack.id;
              const priceDisplay =
                currency === 'INR'
                  ? `₹${pack.priceInr.toLocaleString()}`
                  : `$${pack.priceUsd.toFixed(2)}`;

              return (
                <div
                  key={pack.id}
                  onClick={() => {
                    setSelectedPack(pack);
                    setIsBuyModalOpen(true);
                  }}
                  className={`relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 ${
                    pack.popular
                      ? 'bg-gradient-to-b from-indigo-950/20 via-white to-white dark:from-indigo-950/40 dark:to-card border-indigo-500 shadow-xl ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-card border-slate-200 dark:border-border hover:border-slate-400'
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        {pack.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 dark:text-foreground">
                        {pack.name}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{pack.description}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/70 dark:border-border text-center space-y-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-foreground font-mono">
                        +{pack.credits}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-bold block">
                        3D Model Credits
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-foreground font-mono">
                        {priceDisplay}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                        {pack.perCreditUsd}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-3 rounded-2xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 ${
                      pack.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Purchase Pack</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 4: CREDIT AUDIT TRANSACTION LEDGER ────────────────────────── */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <span>3D Credit Transaction History</span>
              </h3>
              <p className="text-xs text-slate-500">
                Detailed audit log of credit allocations, synthesis deductions, and top-up receipts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-accent/40 text-[10px] uppercase font-mono text-slate-500">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Date & Time</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                {studioData?.transactions && studioData.transactions.length > 0 ? (
                  studioData.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-accent/20">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {tx.description}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-foreground">
                        {tx.balanceAfter} Credits
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
        </div>
      )}

      {/* ─── MODAL: CREDIT PURCHASE CHECKOUT ───────────────────────────────── */}
      {isBuyModalOpen && selectedPack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Buy 3D Model Credits</h3>
                  <p className="text-xs text-slate-300">Instant credit balance top-up</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Selected Pack Summary */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                    {selectedPack.name}
                  </span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {currency === 'INR'
                      ? `₹${selectedPack.priceInr.toLocaleString()}`
                      : `$${selectedPack.priceUsd.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedPack.description}</p>
                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800 flex items-center justify-between text-[11px] font-mono">
                  <span>Credits Added:</span>
                  <strong className="text-emerald-600 font-bold">+{selectedPack.credits} 3D Credits</strong>
                </div>
              </div>

              {/* Payment Gateway Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('RAZORPAY_UPI')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedPaymentMethod === 'RAZORPAY_UPI'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-border'
                    }`}
                  >
                    <span className="text-xs font-black block text-slate-900 dark:text-foreground">
                      UPI / Netbanking
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Razorpay Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('PAYPAL')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedPaymentMethod === 'PAYPAL'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-border'
                    }`}
                  >
                    <span className="text-xs font-black block text-slate-900 dark:text-foreground">
                      PayPal / Card
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">PayPal Checkout</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(false)}
                  className="w-1/3 py-3 rounded-2xl bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePurchaseCredits}
                  disabled={isPurchasing}
                  className="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isPurchasing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Pay{' '}
                        {currency === 'INR'
                          ? `₹${selectedPack.priceInr.toLocaleString()}`
                          : `$${selectedPack.priceUsd.toFixed(2)}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ATTACH TO PRODUCT ──────────────────────────────────────── */}
      {isAttachModalOpen && selectedModel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Attach 3D Model</h3>
                  <p className="text-xs text-slate-400">Link 3D asset to store product</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Select Store Product to Attach "{selectedModel.name}"
                </label>
                <select
                  value={attachTargetProductId}
                  onChange={(e) => setAttachTargetProductId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Product from Catalog --</option>
                  {studioData?.products?.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({currencySymbol}
                      {prod.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-border">
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
                  className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isAttaching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Linking...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Attach 3D Model</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
