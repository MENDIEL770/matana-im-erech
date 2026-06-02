"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Package } from "lucide-react";

const SHIPMENT_STATUSES = [
  { value: "PENDING", label: "ממתין לאיסוף" },
  { value: "PICKED_UP", label: "נאסף" },
  { value: "IN_TRANSIT", label: "בדרך" },
  { value: "OUT_FOR_DELIVERY", label: "יצא לחלוקה" },
  { value: "DELIVERED", label: "נמסר" },
  { value: "FAILED", label: "נכשל" },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לאיסוף",
  PICKED_UP: "נאסף",
  IN_TRANSIT: "בדרך",
  OUT_FOR_DELIVERY: "יצא לחלוקה",
  DELIVERED: "נמסר",
  FAILED: "נכשל",
};

interface ShipmentData {
  id?: string;
  trackingNumber?: string | null;
  status?: string;
  estimatedDate?: Date | string | null;
  provider?: string | null;
}

interface Props {
  orderId: string;
  shipment?: ShipmentData | null;
}

export function ShipmentCard({ orderId, shipment }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber ?? "");
  const [status, setStatus] = useState(shipment?.status ?? "PENDING");
  const [estimatedDate, setEstimatedDate] = useState(
    shipment?.estimatedDate
      ? new Date(shipment.estimatedDate).toISOString().split("T")[0]
      : ""
  );
  const [provider, setProvider] = useState(shipment?.provider ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, status, estimatedDate, provider }),
      });
      if (!res.ok) throw new Error("שגיאה");
      setMessage({ type: "success", text: "פרטי המשלוח עודכנו" });
      setEditing(false);
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "שגיאה בעדכון המשלוח" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Truck size={15} className="text-[#B08D57]" />
          <span>פרטי משלוח</span>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-[#0F2747] underline hover:no-underline"
          >
            עריכה
          </button>
        )}
      </div>

      {!editing ? (
        <div className="space-y-2 text-sm">
          {shipment?.trackingNumber ? (
            <div className="flex items-center gap-2">
              <Package size={13} className="text-gray-400" />
              <span className="font-mono text-[#0F2747] font-semibold">{shipment.trackingNumber}</span>
            </div>
          ) : (
            <p className="text-gray-400 text-xs">אין מספר מעקב</p>
          )}
          {shipment?.status && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xs">סטטוס:</span>
              <span className="text-xs font-medium">{STATUS_LABELS[shipment.status] ?? shipment.status}</span>
            </div>
          )}
          {shipment?.estimatedDate && (
            <div className="text-xs text-gray-500">
              משוער:{" "}
              {new Intl.DateTimeFormat("he-IL").format(new Date(shipment.estimatedDate))}
            </div>
          )}
          {shipment?.provider && (
            <div className="text-xs text-gray-500">ספק: {shipment.provider}</div>
          )}
          {!shipment && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-[#B08D57] font-medium hover:underline"
            >
              + הוסף פרטי משלוח
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">מספר מעקב</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="IL123456789"
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">ספק משלוח</label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="ישראל פוסט, UPS..."
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">סטטוס משלוח</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
              dir="rtl"
            >
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">תאריך משוער למסירה</label>
            <input
              type="date"
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#0F2747] text-white rounded-sm py-2 text-sm font-medium hover:bg-[#0F2747]/90 transition disabled:opacity-50"
            >
              {loading ? "שומר..." : "שמור"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 border border-gray-200 rounded-sm py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>

          {message && (
            <div className={`text-xs text-center py-1 rounded-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
              {message.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
