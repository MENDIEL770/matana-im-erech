"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Palette } from "lucide-react";
import { CustomizationEditor } from "@/components/public/CustomizationEditor";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  isHover: boolean;
  order: number;
}

interface ProductField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  isRequired: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  shortDescription?: string | null;
  description?: string | null;
  regularPrice: number;
  price20?: number | null;
  price50?: number | null;
  price100?: number | null;
  price250?: number | null;
  price500?: number | null;
  minQuantity: number;
  hasEmbroidery: boolean;
  hasEngraving: boolean;
  hasLogoprint: boolean;
  hasEmbossing: boolean;
  hasPersonal: boolean;
  isCustomizable: boolean;
  customFonts?: { name: string; url: string }[] | null;
  tag?: string | null;
  images: ProductImage[];
  fields: ProductField[];
  shippingOptions?: string | null;
}

const QUANTITY_TIERS = [
  { qty: 20, key: "price20", label: "20 יחידות" },
  { qty: 50, key: "price50", label: "50 יחידות" },
  { qty: 100, key: "price100", label: "100 יחידות" },
  { qty: 250, key: "price250", label: "250 יחידות" },
  { qty: 500, key: "price500", label: "500 יחידות" },
] as const;

const CUSTOMIZATION_BADGES = [
  { key: "hasEmbroidery", label: "רקמה" },
  { key: "hasEngraving", label: "חריטה" },
  { key: "hasLogoprint", label: "לוגו" },
  { key: "hasEmbossing", label: "הטבעה" },
  { key: "hasPersonal", label: "הקדשה" },
] as const;

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(
    product.images.find((i) => i.isPrimary) ?? product.images[0] ?? null
  );
  const [shippingType, setShippingType] = useState<"CONSOLIDATED" | "DIRECT_TO_DONORS">(
    "CONSOLIDATED"
  );
  const [showEditor, setShowEditor] = useState(false);
  const [customizationPreview, setCustomizationPreview] = useState<string | null>(null);

  const customizations = CUSTOMIZATION_BADGES.filter(
    (b) => product[b.key as keyof Product]
  );

  const priceTiers = QUANTITY_TIERS.filter(
    (t) => product[t.key as keyof Product] != null && Number(product[t.key as keyof Product]) > 0
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ── Left: Image gallery (60%) ────────────────── */}
          <div className="lg:w-[58%] space-y-4">
            {/* Main image */}
            <div
              className="relative bg-white border border-[#ECE8E2] overflow-hidden"
              style={{ borderRadius: "16px", aspectRatio: "1" }}
            >
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.altText ?? product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#ECE8E2]">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage?.id === img.id
                        ? "border-[#B08D57]"
                        : "border-[#ECE8E2] hover:border-[#B08D57]/50"
                    }`}
                  >
                    <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product info (40%) ─────────────────── */}
          <div className="lg:w-[42%] space-y-8">
            {/* Tag */}
            {product.tag && (
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-[#B08D57] font-medium">
                {product.tag === "NEW" ? "חדש" : product.tag === "PREMIUM" ? "פרימיום" : product.tag === "POPULAR" ? "פופולרי" : "מומלץ"}
              </span>
            )}

            {/* Name */}
            <div>
              <h1 className="font-['Ploni'] font-light text-[#2E2A26] leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="mt-4 text-[#6B6763] leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Price table */}
            {priceTiers.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6763] mb-3 font-medium">
                  מחירים לפי כמות
                </p>
                <div className="border border-[#ECE8E2] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#ECE8E2]">
                        <th className="py-2.5 px-4 text-right text-xs text-[#6B6763] font-medium">כמות</th>
                        <th className="py-2.5 px-4 text-left text-xs text-[#6B6763] font-medium">מחיר ליחידה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceTiers.map((tier, i) => (
                        <tr key={tier.key} className={i % 2 === 0 ? "bg-white" : "bg-[#FAF8F5]"}>
                          <td className="py-2.5 px-4 text-right text-[#2E2A26]">{tier.label}</td>
                          <td className="py-2.5 px-4 text-left font-semibold text-[#B08D57]">
                            ₪{Number(product[tier.key as keyof Product]).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-[#6B6763] mt-2">מינימום הזמנה: {product.minQuantity} יחידות</p>
              </div>
            )}

            {/* Customization badges */}
            {customizations.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6763] mb-3 font-medium">
                  אפשרויות התאמה
                </p>
                <div className="flex flex-wrap gap-2">
                  {customizations.map((c) => (
                    <span
                      key={c.key}
                      className="px-3 py-1.5 text-xs border border-[#B08D57] text-[#B08D57] rounded-full font-medium"
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-[#ECE8E2]" />

            {/* Dynamic order form fields */}
            {product.fields.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6763] font-medium">
                  פרטי ההזמנה
                </p>
                {product.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm text-[#2E2A26] mb-1.5 font-medium">
                      {field.label}
                      {field.isRequired && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    {field.fieldType === "TEXTAREA" ? (
                      <textarea
                        className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors resize-none"
                        rows={3}
                        placeholder={field.label}
                        required={field.isRequired}
                      />
                    ) : field.fieldType === "FILE" ? (
                      <input
                        type="file"
                        className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors"
                        required={field.isRequired}
                      />
                    ) : (
                      <input
                        type={
                          field.fieldType === "EMAIL"
                            ? "email"
                            : field.fieldType === "PHONE"
                            ? "tel"
                            : "text"
                        }
                        className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors"
                        placeholder={field.label}
                        required={field.isRequired}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Shipping type */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#6B6763] mb-3 font-medium">
                סוג משלוח
              </p>
              <div className="flex gap-3">
                {[
                  { value: "CONSOLIDATED", label: "מרוכז לשליח" },
                  { value: "DIRECT_TO_DONORS", label: "ישיר לתורמים" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setShippingType(opt.value as "CONSOLIDATED" | "DIRECT_TO_DONORS")}
                    className={`flex-1 py-3 px-4 text-sm border rounded-xl transition-colors ${
                      shippingType === opt.value
                        ? "bg-[#2E2A26] text-white border-[#2E2A26]"
                        : "bg-white text-[#6B6763] border-[#ECE8E2] hover:border-[#2E2A26] hover:text-[#2E2A26]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Excel download */}
            <a
              href={`/api/products/${product.id}/excel?shipping=${shippingType}`}
              className="flex items-center gap-2 text-sm text-[#6B6763] hover:text-[#B08D57] transition-colors group"
            >
              <Download size={16} className="group-hover:text-[#B08D57] transition-colors" />
              הורד תבנית Excel להזמנה
            </a>

            {/* Customization CTA */}
            {product.isCustomizable && (
              <button
                onClick={() => setShowEditor(true)}
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#B08D57] text-[#B08D57] text-sm tracking-widest uppercase hover:bg-[#B08D57] hover:text-white transition-colors rounded-sm font-medium"
              >
                <Palette size={16} />
                עיצוב אישי — לוגו / טקסט
              </button>
            )}

            {/* Preview after customization */}
            {customizationPreview && (
              <div className="rounded-lg overflow-hidden border border-[#B08D57]/30">
                <p className="text-xs text-center text-[#B08D57] py-1.5 bg-[#FAF8F5]">תצוגה מקדימה של העיצוב</p>
                <img src={customizationPreview} alt="תצוגה מקדימה" className="w-full" />
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/quote?product=${product.id}`}
              className="block w-full text-center py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors"
              style={{ borderRadius: "4px" }}
            >
              בקשת הצעת מחיר
            </Link>

            {/* Customization Editor Modal */}
            {showEditor && (
              <CustomizationEditor
                productImage={selectedImage?.url ?? ""}
                productName={product.name}
                fonts={product.customFonts ?? []}
                onSave={({ preview }) => {
                  setCustomizationPreview(preview);
                  setShowEditor(false);
                }}
                onClose={() => setShowEditor(false)}
              />
            )}

            {/* Description */}
            {product.description && (
              <>
                <div className="h-px bg-[#ECE8E2]" />
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#6B6763] mb-3 font-medium">
                    תיאור המוצר
                  </p>
                  <p className="text-sm text-[#6B6763] leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
