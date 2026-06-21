"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  isHover: boolean;
}

interface ProductCardProps {
  id: string;
  name: string;
  shortDescription?: string | null;
  tag?: string | null;
  orderMode?: string | null;
  regularPrice: number;
  price20?: number | null;
  price500?: number | null;
  images: ProductImage[];
}

function formatPriceRange(product: ProductCardProps): string | null {
  const prices = [product.price500, product.price20, product.regularPrice]
    .filter((p) => p != null && Number(p) > 0)
    .map(Number);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `₪${min.toFixed(0)}`;
  return `₪${min.toFixed(0)} – ₪${max.toFixed(0)}`;
}

const TAG_MAP: Record<string, string> = {
  NEW: "חדש",
  RECOMMENDED: "מומלץ",
  POPULAR: "פופולרי",
  PREMIUM: "פרימיום",
};

export function ProductCard(props: ProductCardProps) {
  const primary = props.images.find((i) => i.isPrimary) ?? props.images[0] ?? null;
  const hover = props.images.find((i) => i.isHover) ?? null;
  const priceRange = formatPriceRange(props);

  return (
    <ScrollReveal variant="up" duration={0.5} className="h-full">
    <Link href={`/product/${props.id}`} className="group block h-full">
      <article className="bg-white border border-[#ECE8E2] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(46,42,38,0.10)] flex flex-col h-full" style={{ borderRadius: "16px" }}>
        {/* Image */}
        <div className="relative overflow-hidden bg-[#FAF8F5]" style={{ aspectRatio: "1", borderRadius: "16px 16px 0 0" }}>
          {primary ? (
            <>
              <Image
                src={primary.url}
                alt={primary.altText ?? props.name}
                fill
                className={`object-cover transition-opacity duration-500 ${hover ? "group-hover:opacity-0" : ""}`}
              />
              {hover && (
                <Image
                  src={hover.url}
                  alt={hover.altText ?? props.name}
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#ECE8E2]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {props.tag && (
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                props.tag === "NEW"
                  ? "bg-[#2E2A26] text-white"
                  : props.tag === "PREMIUM"
                  ? "bg-[#B08D57] text-white"
                  : "bg-white text-[#2E2A26] border border-[#ECE8E2]"
              }`}>
                {TAG_MAP[props.tag] ?? props.tag}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3 flex flex-col flex-1">
          <h3 className="font-['Ploni'] text-[#2E2A26] font-medium text-base leading-snug line-clamp-2">
            {props.name}
          </h3>

          {props.shortDescription && (
            <p className="text-xs text-[#6B6763] line-clamp-2 leading-relaxed">
              {props.shortDescription}
            </p>
          )}

          {props.orderMode === "CONTACT_REQUIRED" && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
              <span className="text-xs">📞</span>
              <span className="text-xs text-amber-700 font-medium">בהזמנה מראש — ניצור קשר</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 mt-auto">
            {priceRange ? (
              <span className="text-sm font-semibold text-[#B08D57]">{priceRange}</span>
            ) : (
              <span className="text-xs text-[#6B6763]">לפי כמות</span>
            )}
            <span className="text-xs text-[#2E2A26] border border-[#2E2A26] px-3 py-1 uppercase tracking-widest font-medium transition-colors group-hover:bg-[#2E2A26] group-hover:text-white">
              לפרטים
            </span>
          </div>
        </div>
      </article>
    </Link>
    </ScrollReveal>
  );
}
