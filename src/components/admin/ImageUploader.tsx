"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Trash2, Star, MousePointerClick, Upload, Loader2 } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  isHover: boolean;
  order: number;
}

interface ImageUploaderProps {
  productId: string;
  initialImages?: ProductImage[];
}

export function ImageUploader({ productId, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      // Determine if first image should be primary
      const isPrimary = images.length === 0 && !images.some((i) => i.isPrimary);

      const saveRes = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, isPrimary, isHover: false, order: images.length }),
      });

      if (!saveRes.ok) throw new Error("Save failed");
      const newImage: ProductImage = await saveRes.json();
      setImages((prev) => [...prev, newImage]);
    },
    [productId, images]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          await uploadFile(file);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    },
    [uploadFile]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (imageId: string) => {
    await fetch(`/api/products/${productId}/images?imageId=${imageId}`, {
      method: "DELETE",
    });
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSetPrimary = async (imageId: string) => {
    await fetch(`/api/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, isPrimary: true }),
    });
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
    );
  };

  const handleSetHover = async (imageId: string) => {
    const img = images.find((i) => i.id === imageId);
    const newHover = !img?.isHover;
    await fetch(`/api/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, isHover: newHover }),
    });
    setImages((prev) =>
      prev.map((i) => ({ ...i, isHover: i.id === imageId ? newHover : newHover ? false : i.isHover }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-[#B08D57] bg-[#B08D57]/5"
            : "border-[#ECE8E2] hover:border-[#B08D57] hover:bg-[#FAF8F5]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-[#6B6763]">
            <Loader2 size={24} className="animate-spin text-[#B08D57]" />
            <p className="text-sm">מעלה תמונות...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#6B6763]">
            <Upload size={24} className="text-[#B08D57]" />
            <p className="text-sm font-medium text-[#2E2A26]">גרור תמונות לכאן או לחץ לבחירה</p>
            <p className="text-xs text-[#6B6763]">PNG, JPG, WEBP עד 10MB</p>
          </div>
        )}
      </div>

      {/* Images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative group rounded-xl overflow-hidden border-2 transition-colors ${
                img.isPrimary
                  ? "border-[#B08D57]"
                  : "border-[#ECE8E2] hover:border-[#B08D57]/40"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-[#FAF8F5]">
                <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" />
              </div>

              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {img.isPrimary && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#B08D57] text-white rounded-full">
                    ראשי
                  </span>
                )}
                {img.isHover && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2E2A26] text-white rounded-full">
                    Hover
                  </span>
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-[#2E2A26]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  title="הגדר כראשי"
                  onClick={() => handleSetPrimary(img.id)}
                  className="p-1.5 rounded-full bg-white/90 text-[#B08D57] hover:bg-white transition-colors"
                >
                  <Star size={14} fill={img.isPrimary ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  title="הגדר כ-Hover"
                  onClick={() => handleSetHover(img.id)}
                  className="p-1.5 rounded-full bg-white/90 text-[#2E2A26] hover:bg-white transition-colors"
                >
                  <MousePointerClick size={14} />
                </button>
                <button
                  type="button"
                  title="מחק תמונה"
                  onClick={() => handleDelete(img.id)}
                  className="p-1.5 rounded-full bg-white/90 text-red-500 hover:bg-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-[#6B6763]">
          ⭐ ראשי = תמונה ראשית | Hover = תמונה בעל hover
        </p>
      )}
    </div>
  );
}
