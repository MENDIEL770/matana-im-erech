"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Plus, Trash2, Search } from "lucide-react";

interface Customer {
  id: string;
  shaliachName: string;
  chabadHouseName: string;
  phone: string;
  email: string;
}

interface Agent {
  id: string;
  name: string;
  commissionRate: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  regularPrice: number;
  costPrice: number;
}

interface OrderItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [notes, setNotes] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [agentId, setAgentId] = useState("");
  const [shippingType, setShippingType] = useState<"CONSOLIDATED" | "DIRECT_TO_DONORS">("CONSOLIDATED");
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers).catch(() => {});
    fetch("/api/agents").then((r) => r.json()).then(setAgents).catch(() => {});
    fetch("/api/products?take=200").then((r) => r.json()).then((data) => {
      setProducts(Array.isArray(data) ? data : data.products ?? []);
    }).catch(() => {});
  }, []);

  const filterProducts = useCallback(
    (q: string) => {
      if (!q.trim()) { setFilteredProducts([]); return; }
      const lower = q.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.sku.toLowerCase().includes(lower)
        ).slice(0, 10)
      );
    },
    [products]
  );

  useEffect(() => { filterProducts(productSearch); }, [productSearch, filterProducts]);

  const addProductItem = (product: Product) => {
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.regularPrice,
        unitCost: product.costPrice,
      },
    ]);
    setProductSearch("");
    setShowProductSearch(false);
  };

  const addManualItem = () => {
    setItems((prev) => [...prev, { name: "", quantity: 1, unitPrice: 0, unitCost: 0 }]);
  };

  const updateItem = (i: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountAmount = discountType === "PERCENT" ? (subtotal * discount) / 100 : discount;
  const total = subtotal - discountAmount + Number(shippingCost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!customerId) { setError("יש לבחור לקוח"); return; }
    if (items.length === 0) { setError("יש להוסיף לפחות פריט אחד"); return; }
    if (items.some((i) => !i.name.trim())) { setError("כל הפריטים חייבים להיות עם שם"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          items,
          discount,
          discountType,
          notes,
          internalNote,
          agentId: agentId || undefined,
          shippingType,
          shippingCost,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "שגיאה ביצירת הזמנה");
      }
      const order = await res.json();
      router.push(`/admin/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת הזמנה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 transition">
          <ArrowRight size={18} />
        </Link>
        <h1 className="text-xl font-bold text-[#0F2747]" style={{ fontFamily: "'Ploni', sans-serif" }}>
          הזמנה חדשה
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#0F2747] mb-3">לקוח</h2>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
            dir="rtl"
          >
            <option value="">-- בחר לקוח --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shaliachName} — {c.chabadHouseName}
              </option>
            ))}
          </select>
        </div>

        {/* Items */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F2747]">פריטים</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowProductSearch((v) => !v)}
                className="inline-flex items-center gap-1 text-xs border border-gray-200 rounded-sm px-3 py-1.5 hover:bg-gray-50 transition"
              >
                <Search size={13} />
                חפש מוצר
              </button>
              <button
                type="button"
                onClick={addManualItem}
                className="inline-flex items-center gap-1 text-xs border border-[#0F2747] text-[#0F2747] rounded-sm px-3 py-1.5 hover:bg-[#0F2747]/5 transition"
              >
                <Plus size={13} />
                פריט ידני
              </button>
            </div>
          </div>

          {/* Product search */}
          {showProductSearch && (
            <div className="mb-4 relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="חפש מוצר לפי שם או מק&quot;ט..."
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
                dir="rtl"
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 top-full right-0 left-0 bg-white border border-gray-200 rounded-sm shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProductItem(p)}
                      className="w-full text-right px-3 py-2.5 hover:bg-gray-50 flex justify-between items-center text-sm border-b border-gray-50 last:border-0"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-gray-400">{p.sku}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items table */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
                <span className="col-span-4">שם מוצר</span>
                <span className="col-span-1 text-center">כמות</span>
                <span className="col-span-2">מחיר יחידה</span>
                <span className="col-span-2">עלות יחידה</span>
                <span className="col-span-2 text-left">סה&quot;כ</span>
                <span className="col-span-1" />
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    placeholder="שם מוצר"
                    className="col-span-4 border border-gray-200 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
                    dir="rtl"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                    className="col-span-1 border border-gray-200 rounded-sm px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="col-span-2 border border-gray-200 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitCost}
                    onChange={(e) => updateItem(i, "unitCost", parseFloat(e.target.value) || 0)}
                    className="col-span-2 border border-gray-200 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
                  />
                  <span className="col-span-2 text-sm font-semibold text-left text-gray-700">
                    ₪{(item.quantity * item.unitPrice).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="col-span-1 text-red-400 hover:text-red-600 flex justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">אין פריטים עדיין</p>
          )}
        </div>

        {/* Discount & Shipping */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#0F2747] mb-3">הנחה ומשלוח</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">הנחה</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סוג הנחה</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "FIXED" | "PERCENT")}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
                dir="rtl"
              >
                <option value="FIXED">סכום קבוע (₪)</option>
                <option value="PERCENT">אחוז (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">עלות משלוח</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סוג משלוח</label>
              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value as "CONSOLIDATED" | "DIRECT_TO_DONORS")}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
                dir="rtl"
              >
                <option value="CONSOLIDATED">משלוח מרוכז</option>
                <option value="DIRECT_TO_DONORS">ישיר לתורמים</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#0F2747] mb-3">הערות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">הערות להזמנה (גלוי ללקוח)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747] resize-none"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">הערה פנימית</label>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747] resize-none"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Agent */}
        {agents.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0F2747] mb-3">שיוך סוכן (אופציונלי)</h2>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full max-w-sm border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
              dir="rtl"
            >
              <option value="">-- ללא סוכן --</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.commissionRate}%)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Summary + Submit */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1 text-sm">
              <div className="flex gap-4 text-gray-600">
                <span>סכום ביניים: <strong>{formatAmount(subtotal)}</strong></span>
                {discountAmount > 0 && (
                  <span className="text-red-600">הנחה: -<strong>{formatAmount(discountAmount)}</strong></span>
                )}
                {shippingCost > 0 && (
                  <span>משלוח: <strong>{formatAmount(Number(shippingCost))}</strong></span>
                )}
              </div>
              <div className="text-lg font-bold text-[#0F2747]">
                סה&quot;כ: ₪{total.toLocaleString()}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0F2747] text-white rounded-sm px-6 py-2.5 text-sm font-medium hover:bg-[#0F2747]/90 transition disabled:opacity-50"
            >
              {loading ? "יוצר הזמנה..." : "צור הזמנה"}
            </button>
            <Link
              href="/admin/orders"
              className="border border-gray-200 rounded-sm px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              ביטול
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

function formatAmount(n: number) {
  return `₪${n.toLocaleString()}`;
}
