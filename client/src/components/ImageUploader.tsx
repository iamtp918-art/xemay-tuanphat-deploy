import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 20 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<{ base64: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Canvas not supported")); return; }
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error("Compression failed")); return; }
              const reader2 = new FileReader();
              reader2.onload = () => {
                const base64 = (reader2.result as string).split(",")[1];
                resolve({ base64, blob });
              };
              reader2.readAsDataURL(blob);
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
    });
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Đã đạt tối đa ${maxImages} ảnh`);
      return;
    }

    // Filter only image files
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setError("Vui lòng chọn file ảnh (JPG, PNG, WEBP)");
      return;
    }

    const filesToProcess = imageFiles.slice(0, remaining);
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        let uploaded = false;

        // Compress image first
        let compressedBase64: string;
        try {
          const compressed = await compressImage(file, 1200, 0.8);
          compressedBase64 = compressed.base64;
        } catch {
          // Fallback: read raw file
          const raw = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          compressedBase64 = raw;
        }

        // Try server upload
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: compressedBase64,
              filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"),
              contentType: "image/jpeg",
            }),
          });
          if (res.ok) {
            const result = await res.json();
            if (result.url) {
              newUrls.push(result.url);
              uploaded = true;
            }
          } else {
            const errText = await res.text();
            console.warn("[Upload] Server error:", errText);
          }
        } catch (uploadErr) {
          console.warn("[Upload] Server upload failed:", uploadErr);
        }

        // Fallback: use data URL (compressed)
        if (!uploaded) {
          try {
            const dataUrl = `data:image/jpeg;base64,${compressedBase64}`;
            newUrls.push(dataUrl);
          } catch {
            const raw = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            newUrls.push(raw);
          }
        }

        setProgress(Math.round(((i + 1) / filesToProcess.length) * 100));
      }
      onChange([...images, ...newUrls]);
    } catch (err) {
      console.error("[Upload] Error:", err);
      setError("Lỗi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, [images, maxImages]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-red-500" />
          Hình ảnh ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Hover để sắp xếp / xóa</span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image grid with preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div
              key={i}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                i === 0 ? "border-red-400 ring-2 ring-red-100" : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ aspectRatio: "1/1" }}
            >
              <img
                src={url}
                alt={`Ảnh ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23f3f4f6'%3E%3Crect width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='11'%3ELỗi ảnh%3C/text%3E%3C/svg%3E";
                }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="w-6 h-6 bg-white/90 text-gray-700 rounded-full flex items-center justify-center text-xs hover:bg-white"
                    title="Di chuyển trái"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                  title="Xóa ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="w-6 h-6 bg-white/90 text-gray-700 rounded-full flex items-center justify-center text-xs hover:bg-white"
                    title="Di chuyển phải"
                  >
                    →
                  </button>
                )}
              </div>
              {/* Badge */}
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-[9px] text-center py-0.5 font-semibold">
                  Ảnh chính
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area with Drag & Drop */}
      {images.length < maxImages && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-red-400 bg-red-50 scale-[1.02]"
              : uploading
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-red-400 hover:bg-red-50/50 active:bg-red-50"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
              <span className="text-sm font-medium text-gray-600">Đang tải lên... {progress}%</span>
              <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-1.5">
                <div className="bg-red-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : isDragging ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                <Upload className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-sm font-bold text-red-600">Thả ảnh vào đây!</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Kéo thả ảnh vào đây hoặc bấm để chọn</span>
              <span className="text-[11px] text-gray-400">JPG, PNG, WEBP — Tối đa {maxImages} ảnh</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL input fallback */}
      <details className="group">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          Hoặc nhập URL ảnh trực tiếp ▸
        </summary>
        <div className="mt-2">
          <input
            type="text"
            value={images.filter(u => u.startsWith("http")).join(", ")}
            onChange={(e) => {
              const urls = e.target.value.split(",").filter(Boolean).map(s => s.trim()).filter(s => s.startsWith("http"));
              const nonUrlImages = images.filter(u => !u.startsWith("http"));
              onChange([...urls, ...nonUrlImages]);
            }}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100"
          />
        </div>
      </details>
    </div>
  );
}
