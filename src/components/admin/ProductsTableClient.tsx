"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Trash2, Tag, FolderOpen, Eye, EyeOff, ChevronDown, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string;
  regularPrice: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  tag: string | null;
  orderMode: string;
  category: { id: string; name: string } | null;
  images: { url: string }[];
}

interface Category { id: string; name: string; }

const tagLabels: Record<string, { label: string; variant: "gold" | "green" | "navy" | "orange" }> = {
  NEW: { label: "חדש", variant: "green" },
  RECOMMENDED: { label: "מומלץ", variant: "gold" },
  POPULAR: { label: "פופולרי", variant: "navy" },
  PREMIUM: { label: "פרימיום", variant: "orange" },
};

const TAGS = [
  { value: "", label: "ללא תג" },
  { value: "NEW", label: "חדש" },
  { value: "RECOMMENDED", label: "מומלץ" },
  { value: "POPULAR", label: "פופולרי" },
  { value: "PREMIUM", label: "פרימיום" },
];

export function ProductsTableClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionMenu, setActionMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const allSelected = products.length > 0 && selected.size === products.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(products.map(p => p.id)));
  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const bulkAction = async (action: string, payload?: object) => {
    if (!selected.size) return;
    if (action === "delete" && !confirm(`למחוק ${selected.size} מוצרים? לא ניתן לבטל.`)) return;
    setActionMenu(false);
    startTransition(async () => {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action, payload }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(new Set());
        setStatus(`✓ בוצע על ${data.deleted ?? data.updated} מוצרים`);
        setTimeout(() => { setStatus(null); router.refresh(); }, 1500);
      } else {
        setStatus(`שגיאה: ${data.error}`);
        setTimeout(() => setStatus(null), 3000);
      }
    });
  };

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0F2747] text-white text-sm rounded-sm mb-2 flex-wrap">
          <span className="font-medium">{selected.size} מוצרים נבחרו</span>
          <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
          <div className="flex items-center gap-2 mr-auto flex-wrap">
            {status && <span className="text-[#B08D57] font-medium">{status}</span>}

            {/* Set Tag */}
            <div className="relative">
              <button
                onClick={() => setActionMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
                disabled={isPending}
              >
                <Tag size={13} /> תווית <ChevronDown size={12} />
              </button>
              {actionMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded-sm shadow-lg z-20 min-w-[140px] border border-gray-200">
                  {TAGS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => { setActionMenu(false); bulkAction("setTag", { tag: t.value || null }); }}
                      className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Set Category */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-colors">
                <FolderOpen size={13} /> קטגוריה <ChevronDown size={12} />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded-sm shadow-lg z-20 min-w-[160px] border border-gray-200 hidden group-hover:block">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => bulkAction("setCategory", { categoryId: cat.id })}
                    className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Activate / Deactivate */}
            <button
              onClick={() => bulkAction("setActive", { isActive: true })}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
            >
              <Eye size={13} /> הפעל
            </button>
            <button
              onClick={() => bulkAction("setActive", { isActive: false })}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
            >
              <EyeOff size={13} /> הסתר
            </button>

            {/* Delete */}
            <button
              onClick={() => bulkAction("delete")}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-sm transition-colors"
            >
              <Trash2 size={13} /> מחק
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-[#B08D57] w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">מוצר</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">מק"ט</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">קטגוריה</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">מחיר</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">מלאי</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">תג</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => {
              const tag = p.tag ? tagLabels[p.tag] : null;
              const isChecked = selected.has(p.id);
              return (
                <tr
                  key={p.id}
                  className={`transition-colors cursor-pointer ${isChecked ? "bg-[#B08D57]/5 border-r-2 border-[#B08D57]" : "hover:bg-gray-50"}`}
                  onClick={() => toggle(p.id)}
                >
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(p.id)}
                      className="accent-[#B08D57] w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center shrink-0">
                        {p.images[0] ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover rounded-sm" />
                        ) : (
                          <Package size={16} className="text-gray-400" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(Number(p.regularPrice))}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= p.minStock ? "text-red-600 font-semibold" : "text-gray-700"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tag && <Badge variant={tag.variant}>{tag.label}</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isActive ? "green" : "gray"}>
                      {p.isActive ? "פעיל" : "מוסתר"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Link href={`/admin/products/${p.id}`}>
                      <Button variant="ghost" size="sm">עריכה</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
