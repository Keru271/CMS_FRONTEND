'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';

interface DragDropUploadProps {
  /** Called with the CDN URL after a successful upload */
  onUploadComplete: (url: string) => void;
  /** Current image URL (used to show existing preview) */
  currentUrl?: string;
  /** Folder name on S3/local storage, e.g. 'logos', 'products' */
  folder?: string;
  /** Backend fileType tag, e.g. 'IMAGE', 'LOGO', 'FAVICON' */
  fileType?: string;
  /** Label shown above the drop zone */
  label?: string;
  /** Helper text shown below the zone */
  hint?: string;
  helperText?: string;
  /** Max file size in MB (default 5) */
  maxSizeMB?: number;
  /** Accepted MIME types string for the file input */
  accept?: string;
  /** Shape of the preview: 'rect' | 'rectangle' | 'square' | 'favicon' */
  previewShape?: 'rect' | 'rectangle' | 'square' | 'favicon';
  /** Optional className override for the outer container */
  className?: string;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onUploadComplete,
  currentUrl,
  folder = 'uploads',
  fileType = 'IMAGE',
  label,
  hint,
  helperText,
  maxSizeMB = 5,
  accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml',
  previewShape = 'rect',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeUrl = uploadedUrl || currentUrl || null;

  const validateAndUpload = useCallback(
    async (file: File) => {
      setError(null);

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }

      const allowed = accept.split(',').map((t) => t.trim());
      if (!allowed.includes(file.type)) {
        setError(`Unsupported file type: ${file.type}`);
        return;
      }

      // Show instant local preview
      const reader = new FileReader();
      reader.onload = (e) => setLocalPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        const result = await cmsService.uploadMedia(file, folder, fileType);
        setUploadedUrl(result.url);
        onUploadComplete(result.url);
      } catch (err: any) {
        setError(err?.message || 'Upload failed. Please try again.');
        setLocalPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [accept, folder, fileType, maxSizeMB, onUploadComplete]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndUpload(file);
    },
    [validateAndUpload]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleClear = async () => {
    const toDeleteUrl = uploadedUrl || activeUrl;
    setLocalPreview(null);
    setUploadedUrl(null);
    setError(null);
    onUploadComplete('');

    if (toDeleteUrl) {
      await cmsService.deleteMediaByUrl(toDeleteUrl).catch(() => {});
    }
  };

  const previewSrc = localPreview || activeUrl;

  const previewClass =
    previewShape === 'favicon'
      ? 'w-16 h-16 rounded-xl'
      : previewShape === 'square'
      ? 'w-24 h-24 rounded-2xl'
      : 'w-full h-36 rounded-2xl';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 p-5 group
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 scale-[1.01]'
            : error
            ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
            : previewSrc
            ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
            : 'border-slate-300 dark:border-slate-600 bg-slate-50/60 dark:bg-card hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onFileChange}
          disabled={isUploading}
        />

        {/* Preview Image */}
        {previewSrc && !isUploading ? (
          <div className="relative flex flex-col items-center gap-3 w-full">
            <div className={`relative overflow-hidden border border-slate-200 dark:border-border shadow-sm ${previewClass}`}>
              <img
                src={previewSrc}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {uploadedUrl ? 'Uploaded successfully' : 'Current image'}
              </span>
              <span className="text-[10px] text-slate-400">
                · Click to replace
              </span>
            </div>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            {localPreview && (
              <div className={`relative overflow-hidden border border-slate-200 dark:border-border opacity-60 ${previewClass}`}>
                <img src={localPreview} alt="Uploading..." className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Uploading to S3…
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all
              ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-accent group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30'}
            `}>
              {isDragging ? (
                <Upload className="w-5 h-5 text-indigo-600 animate-bounce" />
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {accept.replace(/image\//g, '').replace(/,/g, ', ').toUpperCase()} · Max {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}

        {/* Drag overlay glow */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-indigo-400/10 pointer-events-none" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hint + Clear button row */}
      <div className="flex items-center justify-between">
        {(hint || helperText) && (
          <p className="text-[10px] text-slate-400">{hint || helperText}</p>
        )}
        {previewSrc && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-[10px] font-bold transition-all ml-auto"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default DragDropUpload;
