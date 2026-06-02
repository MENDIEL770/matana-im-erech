"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = [
  { value: "NEW", label: "חדש" },
  { value: "WAITING_PAYMENT", label: "ממתין לתשלום" },
  { value: "PAID", label: "שולם" },
  { value: "IN_PRODUCTION", label: "בייצור" },
  { value: "READY", label: "מוכן לשליחה" },
  { value: "SHIPPED", label: "נשלח" },
  { value: "DELIVERED", label: "נמסר" },
  { value: "COMPLETED", label: "הושלם" },
  { value: "CANCELLED", label: "בוטל" },
];

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "טרם שולם" },
  { value: "PARTIAL", label: "שולם חלקית" },
  { value: "PAID", label: "שולם במלואו" },
  { value: "REFUNDED", label: "הוחזר" },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  WAITING_PAYMENT: "bg-orange-100 text-orange-800",
  PAID: "bg-amber-100 text-amber-800",
  IN_PRODUCTION: "bg-amber-100 text-amber-800",
  READY: "bg-green-100 text-green-800",
  SHIPPED: "bg-green-100 text-green-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface Props {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus, currentPaymentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (!res.ok) throw new Error("שגיאה בעדכון");
      setMessage({ type: "success", text: "הסטטוס עודכן בהצלחה" });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "שגיאה בעדכון הסטטוס" });
    } finally {
      setLoading(false);
    }
  };

  const currentStatusLabel = ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;

  return (
    <div className="space-y-4">
      {/* Current status badge (large) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">סטטוס נוכחי:</span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}>
          {currentStatusLabel}
        </span>
      </div>

      {/* Status selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">סטטוס הזמנה</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
          dir="rtl"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Payment status selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">סטטוס תשלום</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
          dir="rtl"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-[#0F2747] text-white rounded-sm py-2 text-sm font-medium hover:bg-[#0F2747]/90 transition disabled:opacity-50"
      >
        {loading ? "מעדכן..." : "עדכן סטטוס"}
      </button>

      {message && (
        <div
          className={`text-xs text-center py-2 rounded-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        שינוי לסטטוס מסוים ישלח SMS אוטומטי ללקוח
      </p>
    </div>
  );
}
