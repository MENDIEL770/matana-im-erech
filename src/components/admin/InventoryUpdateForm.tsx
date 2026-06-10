"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
}

export function InventoryUpdateForm({ productId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!quantity || Number(quantity) <= 0) {
      setError("כמות חייבת להיות חיובית");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          type,
          quantity: Number(quantity),
          reason: reason || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה בעדכון מלאי");
        return;
      }
      setOpen(false);
      setQuantity("");
      setReason("");
      router.refresh();
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#B08D57] hover:underline"
      >
        עדכן
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 min-w-[220px]" dir="rtl">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "IN" | "OUT" | "ADJUSTMENT")}
        className="border border-gray-200 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-[#0F2747]"
      >
        <option value="IN">הוספה (IN)</option>
        <option value="OUT">הורדה (OUT)</option>
        <option value="ADJUSTMENT">תיקון (ADJUSTMENT)</option>
      </select>
      <input
        type="number"
        min="1"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="כמות"
        className="border border-gray-200 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-[#0F2747]"
      />
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="סיבה (אופציונלי)"
        className="border border-gray-200 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-[#0F2747]"
      />
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <div className="flex gap-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#0F2747] text-white text-xs py-1.5 rounded-sm hover:bg-[#0F2747]/90 disabled:opacity-60"
        >
          {loading ? "..." : "עדכן"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(""); }}
          className="px-2 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:bg-gray-50"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
