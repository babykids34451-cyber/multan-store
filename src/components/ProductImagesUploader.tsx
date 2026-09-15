import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  FileUp,
  RefreshCw,
  Star,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { compressImage } from './ImageUploader';

interface ProductImagesUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  idPrefix?: string;
}

export const ProductImagesUploader: React.FC<ProductImagesUploaderProps> = ({
  images = [],
  onChange,
  maxImages = 6,
  idPrefix = 'product-images',
}) => {
  // Normalize array to always work with clean strings, max 6
  const cleanImages = (images || []).filter((img) => typeof img === 'string' && img.trim().length > 0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSlotForModal, setActiveSlotForModal] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [targetSlotForUrl, setTargetSlotForUrl] = useState<number>(0);

  // Hidden multi-file input ref
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  // Hidden single-file input ref (for specific slot)
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const [slotBeingReplaced, setSlotBeingReplaced] = useState<number | null>(null);

  // Handle batch file upload (selecting multiple files at once)
  const handleBatchFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setErrorMessage('Barah-e-karam tasweer files (PNG, JPG, WebP) muntakhib karein.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const processedDataUrls: string[] = [];
      for (const file of fileArray) {
        if (cleanImages.length + processedDataUrls.length >= maxImages) {
          break; // Stop once we reach maxImages (6)
        }
        const compressed = await compressImage(file, 900);
        processedDataUrls.push(compressed);
      }

      const updated = [...cleanImages, ...processedDataUrls].slice(0, maxImages);
      onChange(updated);
    } catch (err) {
      console.error('Error processing batch images:', err);
      setErrorMessage('Tasweerain process karne mein masla aya. Barah-e-karam dobara koshish karein.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle single slot replacement or upload
  const handleSingleSlotFile = async (file: File, slotIndex: number) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Barah-e-karam sirf tasweer file upload karein.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const compressed = await compressImage(file, 900);
      const newImages = [...cleanImages];
      if (slotIndex < newImages.length) {
        newImages[slotIndex] = compressed;
      } else {
        newImages.push(compressed);
      }
      onChange(newImages.slice(0, maxImages));
    } catch (err) {
      console.error('Error processing image:', err);
      setErrorMessage('Tasweer process karne mein masla aya.');
    } finally {
      setIsProcessing(false);
      setSlotBeingReplaced(null);
    }
  };

  // Set any slot as Primary / Cover Photo (Slot 0)
  const handleMakeCover = (index: number) => {
    if (index === 0 || index >= cleanImages.length) return;
    const newImages = [...cleanImages];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    onChange(newImages);
  };

  // Remove a specific image slot
  const handleRemoveImage = (index: number) => {
    const newImages = cleanImages.filter((_, idx) => idx !== index);
    onChange(newImages);
  };

  // Move image left (swap with index - 1)
  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const newImages = [...cleanImages];
    const temp = newImages[index - 1];
    newImages[index - 1] = newImages[index];
    newImages[index] = temp;
    onChange(newImages);
  };

  // Move image right (swap with index + 1)
  const handleMoveRight = (index: number) => {
    if (index >= cleanImages.length - 1) return;
    const newImages = [...cleanImages];
    const temp = newImages[index + 1];
    newImages[index + 1] = newImages[index];
    newImages[index] = temp;
    onChange(newImages);
  };

  // URL fallback modal apply
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    const newImages = [...cleanImages];
    if (targetSlotForUrl < newImages.length) {
      newImages[targetSlotForUrl] = urlInput.trim();
    } else {
      newImages.push(urlInput.trim());
    }
    onChange(newImages.slice(0, maxImages));
    setUrlInput('');
    setShowUrlDialog(false);
  };

  const slotLabels = [
    'Main Cover (Asal Tasweer)',
    'Angle 2 (Side / Angle View)',
    'Angle 3 (Back / Inner View)',
    'Detail (Fabric / Close-up)',
    'Lifestyle (In-use / Model)',
    'Packaging / Extra View',
  ];

  return (
    <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl" id={`${idPrefix}-root`}>
      {/* Hidden inputs */}
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={(e) => {
          if (e.target.files) handleBatchFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
        id={`${idPrefix}-multi-file-input`}
      />

      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && slotBeingReplaced !== null) {
            handleSingleSlotFile(file, slotBeingReplaced);
          }
          e.target.value = '';
        }}
        className="hidden"
        id={`${idPrefix}-single-file-input`}
      />

      {/* Top Header Bar with Count & Bulk Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Product Images (6 Tasweerain Upload Karein)
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                cleanImages.length >= 1
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {cleanImages.length} / {maxImages} Uploaded
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Aap ek saath ya bari bari 6 tasweerain upload kar sakte hain. Pehli tasweer website par main cover photo hogi.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => multiFileInputRef.current?.click()}
            disabled={isProcessing || cleanImages.length >= maxImages}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileUp className="w-3.5 h-3.5" />
            )}
            <span>Select Multiple Files</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetSlotForUrl(cleanImages.length < maxImages ? cleanImages.length : 0);
              setShowUrlDialog(true);
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors border border-slate-700 cursor-pointer"
            title="Paste Image Web Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">URL</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* URL Input Popup if triggered */}
      {showUrlDialog && (
        <div className="p-3 bg-slate-900 border border-rose-500/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>Tasweer ka URL Paste Karein (Slot #{targetSlotForUrl + 1})</span>
            <button
              type="button"
              onClick={() => setShowUrlDialog(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Save URL
            </button>
          </div>
        </div>
      )}

      {/* 6 Image Slots Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {Array.from({ length: maxImages }).map((_, index) => {
          const imgUrl = cleanImages[index];
          const isCover = index === 0;
          const isSlotFilled = Boolean(imgUrl);

          return (
            <div
              key={index}
              className={`relative rounded-xl border flex flex-col justify-between overflow-hidden transition-all group ${
                isCover
                  ? 'border-rose-500/60 bg-slate-900/90 ring-1 ring-rose-500/30'
                  : isSlotFilled
                  ? 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                  : 'border-dashed border-slate-700/80 bg-slate-950/50 hover:border-rose-500/60 hover:bg-slate-900/40'
              }`}
            >
              {/* Slot Header Label */}
              <div className="px-2 py-1 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-bold">
                <span className={isCover ? 'text-rose-400 flex items-center gap-1' : 'text-slate-400'}>
                  {isCover && <Star className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />}
                  #{index + 1} {isCover ? 'Cover Photo' : `Slot ${index + 1}`}
                </span>
                {isSlotFilled && (
                  <span className="text-[9px] text-emerald-400 font-medium">Ready</span>
                )}
              </div>

              {/* Slot Body: Image Preview or Add Button */}
              {isSlotFilled ? (
                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={imgUrl}
                    alt={`Product angle ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Badges on preview */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-rose-600/90 text-white text-[9px] font-extrabold shadow-sm flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Main
                    </div>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5">
                    {/* Make Cover Button (if not already cover) */}
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleMakeCover(index)}
                        className="w-full py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Set as Main Cover Photo"
                      >
                        <Star className="w-2.5 h-2.5" />
                        Make Cover
                      </button>
                    )}

                    {/* Change Image Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSlotBeingReplaced(index);
                        singleFileInputRef.current?.click();
                      }}
                      className="w-full py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Replace
                    </button>

                    {/* Remove Image Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="w-full py-1 bg-red-600/80 hover:bg-red-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      Remove
                    </button>

                    {/* Reorder Arrows */}
                    <div className="flex items-center justify-between w-full pt-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveLeft(index)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-[10px] cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-[9px] text-slate-400">Position</span>
                      <button
                        type="button"
                        disabled={index === cleanImages.length - 1}
                        onClick={() => handleMoveRight(index)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-[10px] cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Slot: Click to Upload */
                <div
                  onClick={() => {
                    setSlotBeingReplaced(index);
                    singleFileInputRef.current?.click();
                  }}
                  className="aspect-square w-full flex flex-col items-center justify-center p-2 text-center cursor-pointer group-hover:scale-102 transition-transform"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 group-hover:border-rose-500/50 group-hover:bg-rose-500/10 text-slate-400 group-hover:text-rose-400 flex items-center justify-center transition-colors mb-1.5">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-white line-clamp-1">
                    Upload
                  </span>
                  <span className="text-[9px] text-slate-500 line-clamp-1">
                    {slotLabels[index] || `Slot ${index + 1}`}
                  </span>
                </div>
              )}

              {/* Slot Subtitle Footer */}
              <div className="px-1.5 py-1 bg-slate-950 text-center border-t border-slate-900 text-[9px] text-slate-500 truncate">
                {slotLabels[index] || `Slot #${index + 1}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Guideline Info */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>💡 Har tasweer 800x800 ya square format mein behad khubsoorat nazar aati hai.</span>
        <span>Pehli tasweer store par main product photo ke taur par dikhayi jaayegi.</span>
      </div>
    </div>
  );
};
