"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Trash2, Package, Loader2 } from "lucide-react";

interface BundleProduct {
  id: string;
  name: string;
  regularPrice: number;
  images: { url: string }[];
}

interface BundleItem {
  id: string;
  productId: string;
  quantity: number;
  order: number;
  product: BundleProduct;
}

export function BundleEditor({ productId }: { productId: string }) {
  const [items, setItems] = useState<BundleItem[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<BundleProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const res = await fetch(`/api/products/${productId}/bundle-items`);
    const data = await res.json();
    setItems(data);
  }, [productId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/products/bundlable?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      // הסר מוצרים שכבר במארז
      const existingIds = new Set(items.map((i) => i.productId));
      setSearchResults(data.filter((p: BundleProduct) => !existingIds.has(p.id) && p.id !== productId));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, items, productId]);

  const addItem = async (product: BundleProduct) => {
    setAdding(product.id);
    const res = await fetch(`/api/products/${productId}/bundle-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    if (res.ok) {
      await loadItems();
      setSearch("");
      setSearchResults([]);
    }
    setAdding(null);
  };

  const removeItem = async (item: BundleItem) => {
    setRemoving(item.id);
    await fetch(`/api/products/${productId}/bundle-items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });
    await loadItems();
    setRemoving(null);
  };

  const updateQty = async (item: BundleItem, qty: number) => {
    if (qty < 1) return;
    await fetch(`/api/products/${productId}/bundle-items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, quantity: qty }),
    });
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: qty } : i));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0F2747] mb-1">תכולת המארז</h3>
        <p className="text-xs text-gray-400">הוסף מוצרים שמוגדרים כ"מתאים למארז" — הם יופיעו כהמלצה ללקוח בתוך המארז הזה</p>
      </div>

      {/* חיפוש מוצרים */}
      <div className="relative">
        <div className="flex items-center gap-2 border border-gray-200 rounded-sm px-3 py-2 focus-within:border-[#B08D57]">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש מוצר להוספה למארז..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => addItem(p)}
                disabled={adding === p.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAF8F5] transition-colors text-right border-b border-gray-50 last:border-0"
              >
                <div className="w-9 h-9 bg-gray-100 rounded shrink-0 overflow-hidden">
                  {p.images[0]
                    ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    : <Package size={16} className="m-auto mt-1.5 text-gray-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-[#B08D57]">₪{Number(p.regularPrice).toFixed(0)}</p>
                </div>
                {adding === p.id
                  ? <Loader2 size={15} className="animate-spin text-gray-400" />
                  : <Plus size={15} className="text-[#B08D57]" />
                }
              </button>
            ))}
          </div>
        )}

        {search.trim() && !loading && searchResults.length === 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg px-4 py-3 text-sm text-gray-400">
            לא נמצאו מוצרים מתאימים — ודא שהמוצר מסומן כ"מתאים למארז"
          </div>
        )}
      </div>

      {/* רשימת מוצרים במארז */}
      {items.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-sm text-gray-400">
          <Package size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">המארז ריק — חפש מוצרים להוספה</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#ECE8E2] rounded-sm">
              <div className="w-10 h-10 bg-white rounded shrink-0 overflow-hidden border border-gray-100">
                {item.product.images[0]
                  ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                  : <Package size={16} className="m-auto mt-2 text-gray-300" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                <p className="text-xs text-[#B08D57]">₪{Number(item.product.regularPrice).toFixed(0)}</p>
              </div>

              {/* כמות */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQty(item, item.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:border-[#B08D57] hover:text-[#B08D57] transition-colors text-sm"
                >−</button>
                <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:border-[#B08D57] hover:text-[#B08D57] transition-colors text-sm"
                >+</button>
              </div>

              <button
                onClick={() => removeItem(item)}
                disabled={removing === item.id}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                {removing === item.id
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Trash2 size={15} />
                }
              </button>
            </div>
          ))}

          <p className="text-xs text-gray-400 pt-1">
            סה״כ {items.reduce((s, i) => s + i.quantity, 0)} פריטים במארז
          </p>
        </div>
      )}
    </div>
  );
}
