"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  quoteId: string;
  status: string;
  orderId?: string;
  orderNumber?: string;
}

export default function QuoteActions({ quoteId, status, orderId, orderNumber }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const act = async (action: string) => {
    setLoading(action);
    setError("");
    try {
      if (action === "delete") {
        if (!confirm("האם למחוק את ההצעה?")) return;
        const res = await fetch(`/api/quotes/${quoteId}`, { method: "DELETE" });
        if (!res.ok) throw new Error((await res.json()).error);
        router.push("/admin/quotes");
        return;
      }

      if (action === "convert") {
        if (!confirm("להמיר את ההצעה להזמנה?")) return;
        const res = await fetch(`/api/quotes/${quoteId}/convert`, { method: "POST" });
        if (!res.ok) throw new Error((await res.json()).error);
        const data = await res.json();
        router.push(`/admin/orders/${data.order.id}`);
        return;
      }

      // status update
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(null);
    }
  };

  const isConverted = status === "CONVERTED";

  return (
    <div className="flex flex-col gap-2 items-end">
      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5">{error}</p>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        {/* Send */}
        {status === "DRAFT" && (
          <button
            onClick={() => act("SENT")}
            disabled={loading !== null}
            className="bg-[#0F2747] text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#1a3a5c] disabled:opacity-40 transition-colors"
          >
            {loading === "SENT" ? "..." : "שלח ללקוח"}
          </button>
        )}

        {/* Approve */}
        {status === "SENT" && (
          <button
            onClick={() => act("APPROVED")}
            disabled={loading !== null}
            className="bg-green-700 text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-green-800 disabled:opacity-40 transition-colors"
          >
            {loading === "APPROVED" ? "..." : "אשר הצעה"}
          </button>
        )}

        {/* Convert */}
        {(status === "APPROVED" || status === "SENT") && !orderId && (
          <button
            onClick={() => act("convert")}
            disabled={loading !== null}
            className="bg-[#B08D57] text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#9a7a48] disabled:opacity-40 transition-colors"
          >
            {loading === "convert" ? "..." : "המר להזמנה"}
          </button>
        )}

        {/* View order if converted */}
        {isConverted && orderId && (
          <Link
            href={`/admin/orders/${orderId}`}
            className="bg-[#B08D57] text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#9a7a48] transition-colors"
          >
            צפה בהזמנה {orderNumber}
          </Link>
        )}

        {/* Edit */}
        {!isConverted && (
          <Link
            href={`/admin/quotes/${quoteId}/edit`}
            className="border border-[#ECE8E2] bg-white text-[#2E2A26] px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#FAF8F5] transition-colors"
          >
            ערוך
          </Link>
        )}

        {/* Delete */}
        {!isConverted && (
          <button
            onClick={() => act("delete")}
            disabled={loading !== null}
            className="border border-red-200 text-red-500 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            {loading === "delete" ? "..." : "מחק"}
          </button>
        )}
      </div>
    </div>
  );
}
