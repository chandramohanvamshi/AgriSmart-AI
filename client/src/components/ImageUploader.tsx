import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Camera, X, Check, Sparkles } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (base64: string, file?: File) => void;
  isLoading?: boolean;
}

export const SAMPLE_SPECIMENS = [
  {
    title: "Tomato Early Blight",
    description: "Concentric target spots with chlorotic yellow halo",
    url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    crop: "Tomato",
    symptoms: "Circular brown necrotic lesions with concentric rings on lower leaves",
  },
  {
    title: "Corn / Maize Rust",
    description: "Cinnamon-brown pustules on upper leaf surface",
    url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    crop: "Maize / Corn",
    symptoms: "Elongated brown pustules rupturing epidermal leaf layers",
  },
  {
    title: "Citrus Canker / Leaf Mottle",
    description: "Raised corky lesions surrounded by watery margins",
    url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80",
    crop: "Citrus / Lemon",
    symptoms: "Crater-like brown raised lesions with yellow halos on leaf surface",
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading = false }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side image compression using canvas
  const processAndCompressFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      alert("Please upload a valid JPEG, PNG, or WebP image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setPreview(compressedBase64);
        setSelectedSample(null);
        onImageSelected(compressedBase64, file);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndCompressFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndCompressFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_SPECIMENS[0]) => {
    setSelectedSample(sample.title);
    setPreview(sample.url);
    onImageSelected(sample.url);
  };

  const clearImage = () => {
    setPreview(null);
    setSelectedSample(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onImageSelected("");
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
          preview ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10" : "cursor-pointer"
        } ${
          isDragging
            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 scale-[1.01]"
            : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {preview ? (
          <div className="relative inline-block max-w-full">
            <img
              src={preview}
              alt="Plant leaf specimen"
              className="max-h-72 sm:max-h-80 rounded-xl object-contain mx-auto shadow-md border border-slate-200 dark:border-slate-700"
            />
            {!isLoading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute -top-3 -right-3 p-1.5 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="mt-3 flex items-center justify-center space-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Specimen Captured & Calibrated</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                Click to browse or drop plant foliage photo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports JPEG, PNG, WebP up to 5MB (auto-compressed for Gemini Vision)
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
              <Camera className="w-3.5 h-3.5" />
              <span>Mobile Camera & Desktop Drag-and-Drop Supported</span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Clinical Samples for Instant Testing */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Or test with clinical plant specimen library:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_SPECIMENS.map((sample) => (
            <button
              key={sample.title}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`flex items-center space-x-3 p-2.5 rounded-xl border text-left transition-all ${
                selectedSample === sample.title
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              <img
                src={sample.url}
                alt={sample.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {sample.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {sample.crop}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
