"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  shaliachName: string;
  chabadHouseName: string;
  email: string;
  phone: string;
  city?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  regularPrice: number;
  price20?: number;
  price50?: number;
  price100?: number;
  price250?: number;
  price500?: number;
  images?: { url: string }[];
}

interface QuoteItemDraft {
  _key: string;
  productId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

type DiscountType = "FIXED" | "PERCENT";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPriceTier(p: Product, qty: number): number {
  if (qty >= 500 && p.price500) return p.price500;
  if (qty >= 250 && p.price250) return p.price250;
  if (qty >= 100 && p.price100) return p.price100;
  if (qty >= 50 && p.price50) return p.price50;
  if (qty >= 20 && p.price20) return p.price20;
  return p.regularPrice;
}

let keyCounter = 0;
function nextKey() {
  return `item-${++keyCounter}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewQuotePage() {
  const router = useRouter();

  // Step
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 – Customer
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Step 2 – Items
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState<QuoteItemDraft[]>([]);

  // Step 3 – Summary
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<DiscountType>("FIXED");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNote, setInternalNote] = useState("");

  // Submission
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load customers
  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []));
  }, []);

  // Load products (search)
  useEffect(() => {
    const q = productSearch.trim();
    fetch(`/api/products${q ? `?search=${encodeURIComponent(q)}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setProducts(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          arr.map((p: any) => ({
            ...p,
            costPrice: Number(p.costPrice),
            regularPrice: Number(p.regularPrice),
            price20: p.price20 != null ? Number(p.price20) : undefined,
            price50: p.price50 != null ? Number(p.price50) : undefined,
            price100: p.price100 != null ? Number(p.price100) : undefined,
            price250: p.price250 != null ? Number(p.price250) : undefined,
            price500: p.price500 != null ? Number(p.price500) : undefined,
          }))
        );
      });
  }, [productSearch]);

  // ── Calculations ────────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountAmount =
    discountType === "PERCENT" ? (subtotal * discount) / 100 : discount;
  const total = Math.max(0, subtotal - discountAmount);
  const totalCost = items.reduce((s, i) => s + i.unitCost * i.quantity, 0);
  const profit = total - totalCost;
  const profitPct = total > 0 ? Math.round((profit / total) * 1000) / 10 : 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const filteredCustomers = customers.filter(
    (c) =>
      c.shaliachName.includes(customerSearch) ||
      c.chabadHouseName.includes(customerSearch) ||
      c.email.includes(customerSearch)
  );

  const addProduct = useCallback(
    (p: Product) => {
      const existing = items.find((i) => i.productId === p.id);
      if (existing) {
        setItems((prev) =>
          prev.map((i) =>
            i.productId === p.id
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  unitPrice: getPriceTier(p, i.quantity + 1),
                }
              : i
          )
        );
      } else {
        setItems((prev) => [
          ...prev,
          {
            _key: nextKey(),
            productId: p.id,
            name: p.name,
            description: "",
            quantity: 1,
            unitPrice: getPriceTier(p, 1),
            unitCost: p.costPrice,
          },
        ]);
      }
    },
    [items]
  );

  const addCustomItem = () => {
    setItems((prev) => [
      ...prev,
      {
        _key: nextKey(),
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        unitCost: 0,
      },
    ]);
  };

  const updateItem = (key: string, field: keyof QuoteItemDraft, value: string | number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        const updated = { ...i, [field]: value };
        // Re-calc price tier if qty changes and has productId
        if (field === "quantity" && i.productId) {
          const product = products.find((p) => p.id === i.productId);
          if (product) {
            updated.unitPrice = getPriceTier(product, Number(value));
          }
        }
        return updated;
      })
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          validUntil: validUntil || undefined,
          notes: notes || undefined,
          internalNote: internalNote || undefined,
          discount,
          discountType,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            description: i.description || undefined,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            unitCost: i.unitCost,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "שגיאה ביצירת הצעה");
      }
      const quote = await res.json();
      router.push(`/admin/quotes/${quote.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  };

  // ── Summary panel (shared) ───────────────────────────────────────────────────
  const SummaryPanel = () => (
    <div className="bg-white border border-[#ECE8E2] p-5 space-y-3 sticky top-6">
      <h3 className="font-['Ploni'] text-sm font-semibold text-[#2E2A26] uppercase tracking-widest border-b border-[#ECE8E2] pb-3">
        סיכום
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-[#6B6763]">
          <span>סה&quot;כ מוצרים</span>
          <span className="font-medium text-[#2E2A26]">{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-[#6B6763]">
            <span>הנחה {discountType === "PERCENT" ? `(${discount}%)` : ""}</span>
            <span className="text-red-500">−{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-[#2E2A26] border-t border-[#ECE8E2] pt-2 mt-2">
          <span>סה&quot;כ לתשלום</span>
          <span className="text-[#B08D57]">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-[#6B6763]">
          <span>עלות כוללת</span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
        <div className="flex justify-between text-[#6B6763] border-t border-[#ECE8E2] pt-2">
          <span>רווח גולמי</span>
          <span className={profit >= 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
            {formatCurrency(profit)}{" "}
            <span className="text-xs font-normal">({profitPct}%)</span>
          </span>
        </div>
      </div>
    </div>
  );

  // ─── STEP 1: Customer ───────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#FAF8F5] py-10 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <StepHeader step={1} title="בחירת לקוח" />

          <div className="bg-white border border-[#ECE8E2] p-6 space-y-4">
            <input
              type="text"
              placeholder="חיפוש לפי שם, בית חב&quot;ד, מייל..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full border border-[#ECE8E2] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#2E2A26] placeholder-[#6B6763] outline-none focus:border-[#B08D57]"
            />

            <div className="divide-y divide-[#ECE8E2] max-h-96 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`w-full text-right px-4 py-3 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors ${
                    selectedCustomer?.id === c.id ? "bg-[#FAF8F5] border-r-2 border-[#B08D57]" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#2E2A26]">{c.shaliachName}</p>
                    <p className="text-xs text-[#6B6763]">
                      {c.chabadHouseName} {c.city ? `· ${c.city}` : ""}
                    </p>
                  </div>
                  {selectedCustomer?.id === c.id && (
                    <span className="text-[#B08D57] text-lg">✓</span>
                  )}
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="px-4 py-6 text-sm text-[#6B6763] text-center">לא נמצאו לקוחות</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedCustomer}
              className="bg-[#B08D57] text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#9a7a48] transition-colors"
            >
              המשך לבחירת מוצרים ←
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Products ───────────────────────────────────────────────────────
  if (step === 2) {
    const filteredProducts = products.filter(
      (p) =>
        productSearch === "" ||
        p.name.includes(productSearch) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
      <div dir="rtl" className="min-h-screen bg-[#FAF8F5] py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <StepHeader step={2} title="הוספת מוצרים" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product catalog */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[#ECE8E2] p-5 space-y-4">
                <input
                  type="text"
                  placeholder="חיפוש מוצרים..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full border border-[#ECE8E2] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#2E2A26] placeholder-[#6B6763] outline-none focus:border-[#B08D57]"
                />

                <div className="divide-y divide-[#ECE8E2] max-h-72 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      className="w-full text-right px-3 py-3 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#2E2A26]">{p.name}</p>
                        <p className="text-xs text-[#6B6763]">
                          {p.sku} · {formatCurrency(p.regularPrice)}
                        </p>
                      </div>
                      <span className="text-[#B08D57] text-lg font-light">+</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={addCustomItem}
                  className="text-xs text-[#B08D57] underline underline-offset-2"
                >
                  + הוסף פריט ידני
                </button>
              </div>

              {/* Items list */}
              {items.length > 0 && (
                <div className="bg-white border border-[#ECE8E2] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#FAF8F5] border-b border-[#ECE8E2]">
                      <tr>
                        <th className="text-right px-4 py-2.5 text-xs text-[#6B6763] font-medium">מוצר</th>
                        <th className="text-center px-3 py-2.5 text-xs text-[#6B6763] font-medium w-20">כמות</th>
                        <th className="text-center px-3 py-2.5 text-xs text-[#6B6763] font-medium w-28">מחיר יחידה</th>
                        <th className="text-center px-3 py-2.5 text-xs text-[#6B6763] font-medium w-28">סה&quot;כ</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE8E2]">
                      {items.map((item) => (
                        <tr key={item._key}>
                          <td className="px-4 py-2">
                            {item.productId ? (
                              <p className="text-sm text-[#2E2A26] font-medium">{item.name}</p>
                            ) : (
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item._key, "name", e.target.value)}
                                placeholder="שם פריט"
                                className="w-full border border-[#ECE8E2] px-2 py-1 text-sm outline-none focus:border-[#B08D57]"
                              />
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateItem(item._key, "quantity", Number(e.target.value))}
                              className="w-full border border-[#ECE8E2] px-2 py-1 text-sm text-center outline-none focus:border-[#B08D57]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item._key, "unitPrice", Number(e.target.value))}
                              className="w-full border border-[#ECE8E2] px-2 py-1 text-sm text-center outline-none focus:border-[#B08D57]"
                            />
                          </td>
                          <td className="px-3 py-2 text-center text-sm font-medium text-[#2E2A26]">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => removeItem(item._key)}
                              className="text-[#6B6763] hover:text-red-500 text-base leading-none"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary panel */}
            <div>
              <SummaryPanel />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-[#6B6763] underline underline-offset-2"
            >
              ← חזרה ללקוח
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={items.length === 0}
              className="bg-[#B08D57] text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#9a7a48] transition-colors"
            >
              המשך לסיכום ←
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3: Summary ─────────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="min-h-screen bg-[#FAF8F5] py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <StepHeader step={3} title="סיכום והגדרות" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Customer recap */}
            {selectedCustomer && (
              <div className="bg-white border border-[#ECE8E2] p-5">
                <p className="text-xs text-[#6B6763] uppercase tracking-widest mb-2">לקוח</p>
                <p className="font-semibold text-[#2E2A26]">{selectedCustomer.shaliachName}</p>
                <p className="text-sm text-[#6B6763]">{selectedCustomer.chabadHouseName}</p>
              </div>
            )}

            {/* Items recap */}
            <div className="bg-white border border-[#ECE8E2] p-5">
              <p className="text-xs text-[#6B6763] uppercase tracking-widest mb-3">פריטים</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item._key} className="flex justify-between text-sm">
                    <span className="text-[#2E2A26]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div className="bg-white border border-[#ECE8E2] p-5 space-y-4">
              <p className="text-xs text-[#6B6763] uppercase tracking-widest">הנחה</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="flex-1 border border-[#ECE8E2] bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-[#B08D57]"
                  placeholder="סכום הנחה"
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="border border-[#ECE8E2] bg-[#FAF8F5] px-3 py-2.5 text-sm outline-none focus:border-[#B08D57]"
                >
                  <option value="FIXED">₪ סכום קבוע</option>
                  <option value="PERCENT">% אחוז</option>
                </select>
              </div>
            </div>

            {/* Valid until */}
            <div className="bg-white border border-[#ECE8E2] p-5 space-y-3">
              <p className="text-xs text-[#6B6763] uppercase tracking-widest">תוקף ההצעה</p>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="border border-[#ECE8E2] bg-[#FAF8F5] px-4 py-2.5 text-sm w-full outline-none focus:border-[#B08D57]"
              />
            </div>

            {/* Notes */}
            <div className="bg-white border border-[#ECE8E2] p-5 space-y-3">
              <p className="text-xs text-[#6B6763] uppercase tracking-widest">הערות ללקוח</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-[#ECE8E2] bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-[#B08D57] resize-none"
              />
            </div>

            {/* Internal note */}
            <div className="bg-white border border-[#ECE8E2] p-5 space-y-3">
              <p className="text-xs text-[#6B6763] uppercase tracking-widest">הערה פנימית</p>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={2}
                className="w-full border border-[#ECE8E2] bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-[#B08D57] resize-none"
                placeholder="גלוי לצוות בלבד"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <SummaryPanel />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setStep(2)}
            className="text-sm text-[#6B6763] underline underline-offset-2"
          >
            ← חזרה למוצרים
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#2E2A26] text-white px-10 py-3 text-xs uppercase tracking-widest font-semibold disabled:opacity-40 hover:bg-black transition-colors"
          >
            {saving ? "שומר..." : "צור הצעת מחיר"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Header ──────────────────────────────────────────────────────────────
function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#6B6763] uppercase tracking-widest">
          שלב {step} / 3
        </span>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 w-8 ${s <= step ? "bg-[#B08D57]" : "bg-[#ECE8E2]"}`}
            />
          ))}
        </div>
      </div>
      <h1 className="font-['Ploni'] text-2xl font-bold text-[#2E2A26]">{title}</h1>
    </div>
  );
}
