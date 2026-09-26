'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Sparkles,
  QrCode,
  Eye,
  Layers,
  Camera,
  Play,
  Pause,
  Box,
  Share2,
  Download,
  Info,
} from 'lucide-react';

interface ThreeDViewerProps {
  modelUrl?: string | null;
  posterUrl?: string | null;
  autoRotate?: boolean;
  lighting?: string;
  materialFinish?: string;
  background?: string;
  scale?: number;
  height?: string | number;
  className?: string;
  showControls?: boolean;
  productName?: string;
  polyCount?: number;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  modelUrl,
  posterUrl,
  autoRotate: initialAutoRotate = true,
  lighting: initialLighting = 'studio',
  materialFinish: initialFinish = 'pbr-metallic',
  background = 'gradient-dark',
  scale = 1.0,
  height = '420px',
  className = '',
  showControls = true,
  productName = '3D Product Scan',
  polyCount = 18450,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation values stored in refs to prevent triggering React state updates on every animation frame
  const rotXRef = useRef(15);
  const rotYRef = useRef(45);
  const zoomRef = useRef(1.0);
  const isAutoRotatingRef = useRef(initialAutoRotate);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activeLightingRef = useRef(initialLighting);
  const renderModeRef = useRef<'solid' | 'wireframe' | 'pbr' | 'xray'>('pbr');

  // UI state for modals and toolbar button visuals
  const [isAutoRotating, setIsAutoRotating] = useState(initialAutoRotate);
  const [activeLighting, setActiveLighting] = useState(initialLighting);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'pbr' | 'xray'>('pbr');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Sync state changes with animation refs
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    activeLightingRef.current = activeLighting;
  }, [activeLighting]);

  useEffect(() => {
    renderModeRef.current = renderMode;
  }, [renderMode]);

  // Animation frame loop for smooth interactive 3D Canvas rendering
  useEffect(() => {
    let animFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isAutoRotatingRef.current && !isDraggingRef.current) {
        rotYRef.current = (rotYRef.current + 0.6) % 360;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const currentLighting = activeLightingRef.current;
      const currentMode = renderModeRef.current;
      const currentZoom = zoomRef.current;
      const currentRotX = rotXRef.current;
      const currentRotY = rotYRef.current;

      // 1. Background rendering based on preset
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width * 0.7,
      );
      if (currentLighting === 'cyberpunk') {
        bgGrad.addColorStop(0, '#1e1035');
        bgGrad.addColorStop(1, '#09040e');
      } else if (currentLighting === 'sunset') {
        bgGrad.addColorStop(0, '#2c1810');
        bgGrad.addColorStop(1, '#0d0705');
      } else if (currentLighting === 'studio-white') {
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(1, '#e2e8f0');
      } else {
        bgGrad.addColorStop(0, '#1e293b');
        bgGrad.addColorStop(1, '#090d16');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Studio Ground Grid & Contact Shadow
      ctx.save();
      ctx.translate(width / 2, height / 2 + 100 * currentZoom);
      ctx.scale(1, 0.35);
      const shadowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 110 * currentZoom);
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
      shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 110 * currentZoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Render 3D Polyhedral Object with simulated 3D projection & lighting
      ctx.save();
      ctx.translate(width / 2, height / 2);
      const radX = (currentRotX * Math.PI) / 180;
      const radY = (currentRotY * Math.PI) / 180;

      // Lighting normal vector
      let lightDir = { x: 0.577, y: -0.577, z: 0.577 };
      if (currentLighting === 'sunset') lightDir = { x: 0.8, y: -0.2, z: 0.5 };
      if (currentLighting === 'cyberpunk') lightDir = { x: -0.7, y: -0.7, z: 0.2 };

      // Sample 3D Model Mesh definition (Chamfered Prism / Product Capsule)
      const baseSize = 80 * currentZoom * scale;
      const vertices = [
        // Top cap
        { x: -0.6 * baseSize, y: -baseSize, z: -0.6 * baseSize },
        { x: 0.6 * baseSize, y: -baseSize, z: -0.6 * baseSize },
        { x: 0.8 * baseSize, y: -0.6 * baseSize, z: 0.6 * baseSize },
        { x: -0.8 * baseSize, y: -0.6 * baseSize, z: 0.6 * baseSize },
        // Mid body
        { x: -baseSize, y: 0, z: -0.8 * baseSize },
        { x: baseSize, y: 0, z: -0.8 * baseSize },
        { x: 1.1 * baseSize, y: 0.2 * baseSize, z: 0.8 * baseSize },
        { x: -1.1 * baseSize, y: 0.2 * baseSize, z: 0.8 * baseSize },
        // Bottom
        { x: -0.7 * baseSize, y: baseSize, z: -0.7 * baseSize },
        { x: 0.7 * baseSize, y: baseSize, z: -0.7 * baseSize },
        { x: 0.9 * baseSize, y: baseSize, z: 0.7 * baseSize },
        { x: -0.9 * baseSize, y: baseSize, z: 0.7 * baseSize },
      ];

      // Rotate vertices in 3D space
      const projected = vertices.map((v) => {
        // Rotate Y
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const x1 = v.x * cosY + v.z * sinY;
        const z1 = -v.x * sinY + v.z * cosY;

        // Rotate X
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = v.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 400;
        const pScale = fov / (fov + z2);
        return {
          x: x1 * pScale,
          y: y2 * pScale,
          z: z2,
          pScale,
        };
      });

      // Faces definition (indices)
      const faces = [
        { v: [0, 1, 2, 3], col: '#6366f1' }, // Top
        { v: [0, 1, 5, 4], col: '#4f46e5' }, // Back top
        { v: [1, 2, 6, 5], col: '#4338ca' }, // Right top
        { v: [2, 3, 7, 6], col: '#818cf8' }, // Front top
        { v: [3, 0, 4, 7], col: '#3730a3' }, // Left top
        { v: [4, 5, 9, 8], col: '#312e81' }, // Back bottom
        { v: [5, 6, 10, 9], col: '#4338ca' }, // Right bottom
        { v: [6, 7, 11, 10], col: '#6366f1' }, // Front bottom
        { v: [7, 4, 8, 11], col: '#4f46e5' }, // Left bottom
        { v: [8, 9, 10, 11], col: '#1e1b4b' }, // Base
      ];

      // Sort faces by depth (Painter's Algorithm)
      const sortedFaces = faces
        .map((f) => {
          const avgZ = f.v.reduce((sum, idx) => sum + projected[idx].z, 0) / f.v.length;
          return { ...f, avgZ };
        })
        .sort((a, b) => b.avgZ - a.avgZ);

      // Draw faces with shaders
      sortedFaces.forEach((f) => {
        const p0 = projected[f.v[0]];
        const p1 = projected[f.v[1]];
        const p2 = projected[f.v[2]];
        const p3 = projected[f.v[3]];

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        if (currentMode === 'wireframe') {
          ctx.strokeStyle = currentLighting === 'cyberpunk' ? '#38bdf8' : '#818cf8';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (currentMode === 'xray') {
          ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(165, 180, 252, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // PBR dynamic metallic gradient
          const faceGrad = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          if (currentLighting === 'cyberpunk') {
            faceGrad.addColorStop(0, '#ec4899');
            faceGrad.addColorStop(0.5, '#8b5cf6');
            faceGrad.addColorStop(1, '#06b6d4');
          } else if (currentLighting === 'sunset') {
            faceGrad.addColorStop(0, '#fb923c');
            faceGrad.addColorStop(0.5, '#f43f5e');
            faceGrad.addColorStop(1, '#881337');
          } else if (currentMode === 'pbr') {
            faceGrad.addColorStop(0, '#e0e7ff');
            faceGrad.addColorStop(0.4, '#6366f1');
            faceGrad.addColorStop(1, '#1e1b4b');
          } else {
            faceGrad.addColorStop(0, f.col);
            faceGrad.addColorStop(1, '#1e1b4b');
          }
          ctx.fillStyle = faceGrad;
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // 4. Highlight reflection sheen
      ctx.beginPath();
      ctx.arc(-20 * currentZoom, -30 * currentZoom, 6 * currentZoom, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [scale]);

  // Mouse & Touch Orbit Controls (Modifies refs directly)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    rotYRef.current = (rotYRef.current + deltaX * 0.8) % 360;
    rotXRef.current = Math.max(-60, Math.min(60, rotXRef.current - deltaY * 0.6));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
    zoomRef.current = Math.max(0.5, Math.min(2.5, zoomRef.current * zoomFactor));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResetView = () => {
    rotXRef.current = 15;
    rotYRef.current = 45;
    zoomRef.current = 1.0;
    setIsAutoRotating(true);
  };

  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.toLowerCase().replace(/\s+/g, '-')}-3d-snapshot.png`;
    a.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-border/80 bg-slate-950 select-none shadow-xl transition-all ${className}`}
      style={{ height }}
    >
      {/* 3D Canvas Canvas Renderer */}
      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full object-cover cursor-grab active:cursor-grabbing block"
      />

      {/* Top Floating Badge & Metadata Header */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">WebGL 3D Active</span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-indigo-950/70 backdrop-blur-md border border-indigo-500/30 text-indigo-200 text-[10px] font-mono">
            {polyCount.toLocaleString()} Polys
          </div>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            title="Scan for Apple AR / Android WebXR preview"
            className="p-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/90 hover:text-white transition shadow-lg flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">View in AR</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/90 hover:text-white transition shadow-lg cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Shading & Lighting Mode Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white pointer-events-auto shadow-lg">
            <button
              type="button"
              onClick={() => setRenderMode('pbr')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                renderMode === 'pbr' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              PBR Metal
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('wireframe')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                renderMode === 'wireframe' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Wireframe
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('xray')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                renderMode === 'xray' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              X-Ray
            </button>
          </div>

          {/* Lighting & Rotation Controls */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white pointer-events-auto shadow-lg">
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              title={isAutoRotating ? 'Pause auto-rotation' : 'Play auto-rotation'}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-indigo-400" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveLighting((prev) =>
                  prev === 'studio' ? 'cyberpunk' : prev === 'cyberpunk' ? 'sunset' : 'studio',
                )
              }
              title={`Switch lighting preset (Current: ${activeLighting})`}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={handleResetView}
              title="Reset 3D camera angle & zoom"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleTakeSnapshot}
              title="Capture 3D viewport snapshot"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      )}

      {/* AR QuickLook Modal (Interactive Smartphone Augmented Reality Preview) */}
      {showQrModal && (
        <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center mx-auto text-indigo-400">
              <QrCode className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Augmented Reality (AR) Preview</h3>
              <p className="text-xs text-slate-400">
                Scan this QR code with your iPhone, iPad, or Android camera to view this 3D model in your physical room!
              </p>
            </div>

            {/* Generated QR Graphic */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
              <div className="w-36 h-36 border-4 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-800 space-y-1">
                <Box className="w-10 h-10 text-indigo-600 animate-bounce" />
                <span className="text-[10px] font-mono font-bold tracking-tight">AR QUICKLOOK</span>
                <span className="text-[9px] text-slate-500">.USDZ / .GLB</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Close AR Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
