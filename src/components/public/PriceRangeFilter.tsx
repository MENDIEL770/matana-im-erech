"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

export function PriceRangeFilter({ min, max }: { min: number; max: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlMin = Number(searchParams.get("minPrice") ?? min);
  const urlMax = Number(searchParams.get("maxPrice") ?? max);

  const [low, setLow] = useState(urlMin);
  const [high, setHigh] = useState(urlMax);

  useEffect(() => { setLow(urlMin); setHigh(urlMax); }, [urlMin, urlMax]);

  const apply = useCallback((l: number, h: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (l > min) params.set("minPrice", String(l));
    else params.delete("minPrice");
    if (h < max) params.set("maxPrice", String(h));
    else params.delete("maxPrice");
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, min, max]);

  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  const isActive = low > min || high < max;

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#2E2A26] uppercase tracking-wider">טווח מחיר</p>
        {isActive && (
          <button
            onClick={() => { setLow(min); setHigh(max); apply(min, max); }}
            className="text-xs text-[#B08D57] hover:underline"
          >
            נקה
          </button>
        )}
      </div>

      {/* Track */}
      <div className="relative h-1.5 bg-[#ECE8E2] rounded-full mx-1 mt-4">
        <div
          className="absolute h-full bg-[#B08D57] rounded-full"
          style={{ right: `${100 - highPct}%`, left: `${lowPct}%` }}
        />
        {/* Low thumb */}
        <input
          type="range" min={min} max={max} step={10} value={low}
          onChange={e => { const v = Math.min(Number(e.target.value), high - 10); setLow(v); }}
          onMouseUp={() => apply(low, high)}
          onTouchEnd={() => apply(low, high)}
          className="price-thumb absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: low > max - 10 ? 5 : 3 }}
        />
        {/* High thumb */}
        <input
          type="range" min={min} max={max} step={10} value={high}
          onChange={e => { const v = Math.max(Number(e.target.value), low + 10); setHigh(v); }}
          onMouseUp={() => apply(low, high)}
          onTouchEnd={() => apply(low, high)}
          className="price-thumb absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 4 }}
        />
        {/* Visible thumbs */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-[#B08D57] rounded-full -mt-[5px] pointer-events-none shadow-sm"
          style={{ right: `calc(${100 - lowPct}% - 8px)`, top: 0 }}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-[#B08D57] rounded-full -mt-[5px] pointer-events-none shadow-sm"
          style={{ right: `calc(${100 - highPct}% - 8px)`, top: 0 }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-[#6B6763] pt-1">
        <span>₪{low.toLocaleString()}</span>
        <span>₪{high.toLocaleString()}</span>
      </div>
    </div>
  );
}
