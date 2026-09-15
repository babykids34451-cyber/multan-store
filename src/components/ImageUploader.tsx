import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Link, Check, FileUp, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (dataUrlOrLink: string) => void;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  recommendedSize?: string;
  maxDimension?: number;
  idPrefix?: string;
  required?: boolean;
}

/**
 * Resizes and compresses an image file using an HTMLCanvasElement
 * to ensure fast rendering and prevent exceeding storage quotas.
 */
export function compressImage(file: File, maxDim: number = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's SVG, read as Data URL directly without rasterizing
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down proportionally if larger than maxDim
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG/WebP
        try {
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  recommendedSize = 'Recommended: 800x800px',
  maxDimension = 1000,
  idPrefix = 'img-uploader',
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewAspectClasses = {
    square: 'aspect-square max-h-48',
    video: 'aspect-video max-h-48',
    banner: 'aspect-[21/9] sm:aspect-[16/7] max-h-48',
    auto: 'max-h-48',
  }[aspectRatio];

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Barah-e-karam sirf tasweer (JPG, PNG, WebP, SVG) upload karein.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const compressedDataUrl = await compressImage(file, maxDimension);
      onChange(compressedDataUrl);
    } catch (err) {
      console.error('Error compressing image:', err);
      setErrorMessage('Tasweer process karne mein masla pesh aya. Dobara koshish karein.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // Reset file input so same file can be re-selected if desired
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setErrorMessage(null);
    }
  };

  const handleClearImage = () => {
    onChange('');
    setUrlInput('');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-2" id={`${idPrefix}-container`}>
      {/* Label & Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-slate-300 font-bold text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              mode === 'upload'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload File
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              mode === 'url'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {/* Mode 1: Direct File Upload (Primary) */}
      {mode === 'upload' ? (
        <div>
          {/* Hidden HTML File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/gif"
            onChange={onFileInputChange}
            className="hidden"
            id={`${idPrefix}-file-input`}
          />

          {value ? (
            /* Uploaded Image Preview Box */
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2.5 group">
              <div className={`w-full ${previewAspectClasses} rounded-xl overflow-hidden bg-slate-900 relative flex items-center justify-center`}>
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Status Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {value.startsWith('data:') ? 'Uploaded from Device' : 'Image Selected'}
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform hover:scale-105"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform hover:scale-105"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Bottom detail row */}
              <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[200px]">
                  {value.startsWith('data:') ? 'Tasweer device se uploaded hai' : 'Image URL set hai'}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                >
                  Tabdeel Karein
                </button>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-rose-500 bg-rose-950/25 scale-[0.99]'
                  : 'border-slate-700 hover:border-rose-500/80 bg-slate-950/60 hover:bg-slate-900/80'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-transform hover:scale-110">
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <FileUp className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  {isProcessing ? 'Tasweer optimize ho rahi hai...' : 'Tasweer upload karne ke liye click karein'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ya tasweer ko yahan Drag & Drop karein
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>PNG, JPG, WebP, SVG</span>
                <span>•</span>
                <span>{recommendedSize}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode 2: Paste URL fallback */
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500 font-mono"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Apply
            </button>
          </div>

          {value && (
            <div className={`w-full ${previewAspectClasses} rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative`}>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <p className="text-[11px] text-rose-400 font-medium">{errorMessage}</p>
      )}
    </div>
  );
};
