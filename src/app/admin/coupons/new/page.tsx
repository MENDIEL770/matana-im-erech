"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { RefreshCw } from "lucide-react";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    value: "",
    minOrderAmount: "",
    expiresAt: "",
    maxUses: "",
    isActive: true,
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.code.trim()) { setError("קוד קופון הוא שדה חובה"); return; }
    if (!form.value || Number(form.value) <= 0) { setError("ערך חייב להיות גדול מאפס"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
          expiresAt: form.expiresAt || undefined,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "שגיאה ביצירת קופון"); return; }

      router.push("/admin/coupons");
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-['Ploni'] font-bold text-[#0F2747]">קופון חדש</h1>
        <p className="text-sm text-gray-500 mt-1">צור קוד הנחה חדש למערכת</p>
      </div>

      <Card padding="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קוד קופון</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="PESACH24"
                className="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-[#0F2747]"
              />
              <button
                type="button"
                onClick={() => set("code", generateCode())}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} />
                אקראי
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סוג הנחה</label>
            <div className="flex gap-3">
              {[
                { value: "PERCENT", label: "אחוז הנחה (%)" },
                { value: "FIXED", label: "סכום קבוע (₪)" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center justify-center gap-2 border rounded-sm px-3 py-2 text-sm cursor-pointer transition-colors ${
                    form.type === opt.value
                      ? "border-[#0F2747] bg-[#0F2747]/5 text-[#0F2747]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={opt.value}
                    checked={form.type === opt.value}
                    onChange={() => set("type", opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ערך {form.type === "PERCENT" ? "(%)" : "(₪)"}
            </label>
            <input
              type="number"
              min="0"
              max={form.type === "PERCENT" ? "100" : undefined}
              step="0.01"
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0F2747]"
              placeholder={form.type === "PERCENT" ? "10" : "50"}
            />
          </div>

          {/* Min order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              מינימום הזמנה (₪) <span className="text-gray-400">אופציונלי</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.minOrderAmount}
              onChange={(e) => set("minOrderAmount", e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0F2747]"
              placeholder="500"
            />
          </div>

          {/* Expires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תאריך פקיעה <span className="text-gray-400">אופציונלי</span>
            </label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0F2747]"
            />
          </div>

          {/* Max uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              מקסימום שימושים <span className="text-gray-400">אופציונלי</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.maxUses}
              onChange={(e) => set("maxUses", e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0F2747]"
              placeholder="100"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="w-4 h-4 accent-[#0F2747]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              קופון פעיל
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0F2747] text-white py-2.5 rounded-sm text-sm font-medium hover:bg-[#0F2747]/90 transition-colors disabled:opacity-60"
            >
              {loading ? "שומר..." : "צור קופון"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/coupons")}
              className="px-4 py-2.5 border border-gray-200 rounded-sm text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
