"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

export function SearchInput({
  placeholder = "חיפוש...",
  paramName = "q",
  className = "",
}: {
  placeholder?: string;
  paramName?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");

  const update = useCallback(
    (val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) params.set(paramName, val);
      else params.delete(paramName);
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, paramName]
  );

  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
          isPending ? "text-[#B08D57]" : "text-gray-400"
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          update(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full pr-9 pl-8 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57] bg-white"
        dir="rtl"
      />
      {value && (
        <button
          onClick={() => { setValue(""); update(""); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
