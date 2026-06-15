"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Loader2 } from "lucide-react";

interface Customer {
  id: string;
  shaliachName: string;
  chabadHouseName: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  businessNumber: string | null;
  tier: "GOLD" | "SILVER" | "REGULAR";
  notes: string | null;
  isActive: boolean;
  marketingConsent: boolean;
  directDebitInterest: boolean;
}

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [form, setForm] = useState({
    shaliachName: customer.shaliachName,
    chabadHouseName: customer.chabadHouseName,
    phone: customer.phone,
    address: customer.address ?? "",
    city: customer.city ?? "",
    country: customer.country ?? "",
    website: customer.website ?? "",
    businessNumber: customer.businessNumber ?? "",
    tier: customer.tier,
    notes: customer.notes ?? "",
    isActive: customer.isActive,
    marketingConsent: customer.marketingConsent,
    directDebitInterest: customer.directDebitInterest,
  });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 3000); }
    else { const d = await res.json(); setError(d.error ?? "שגיאה"); }
  };

  const handleSendCredentials = async () => {
    if (!confirm(`לשלוח פרטי כניסה ל-${customer.email}?`)) return;
    setSending(true);
    const res = await fetch(`/api/customers/${customer.id}/send-credentials`, { method: "POST" });
    setSending(false);
    if (res.ok) alert("פרטי הכניסה נשלחו בהצלחה!");
    else { const d = await res.json(); alert(d.error ?? "שגיאה בשליחה"); }
  };

  const inputClass = "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57] transition-colors";
  const labelClass = "block text-xs text-gray-500 mb-1";

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#0F2747] text-sm">עריכת פרטי לקוח</h2>
        <div className="flex gap-2">
          <button onClick={handleSendCredentials} disabled={sending}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-sm hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            שלח פרטי כניסה
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B08D57] text-white text-xs rounded-sm hover:bg-[#9a7a48] disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saved ? "נשמר ✓" : "שמור"}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Personal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>שם השליח</label>
            <input value={form.shaliachName} onChange={e => set("shaliachName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>שם בית חב"ד</label>
            <input value={form.chabadHouseName} onChange={e => set("chabadHouseName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>טלפון</label>
            <input value={form.phone} onChange={e => set("phone", e.target.value)} className={inputClass} dir="ltr" />
          </div>
          <div>
            <label className={labelClass}>אימייל (לא ניתן לשינוי)</label>
            <input value={customer.email} disabled className={inputClass + " bg-gray-50 text-gray-400"} dir="ltr" />
          </div>
          <div>
            <label className={labelClass}>מדינה</label>
            <input value={form.country} onChange={e => set("country", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>עיר</label>
            <input value={form.city} onChange={e => set("city", e.target.value)} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>כתובת</label>
            <input value={form.address} onChange={e => set("address", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>אתר אינטרנט</label>
            <input value={form.website} onChange={e => set("website", e.target.value)} className={inputClass} dir="ltr" placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>מספר עסק / ח.פ</label>
            <input value={form.businessNumber} onChange={e => set("businessNumber", e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Admin fields */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">הגדרות אדמין</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>דרגת לקוח</label>
              <select value={form.tier} onChange={e => set("tier", e.target.value)} className={inputClass}>
                <option value="REGULAR">רגיל</option>
                <option value="SILVER">כסף 🥈</option>
                <option value="GOLD">זהב 🥇</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>הערות פנימיות</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
              className={inputClass + " resize-none"} placeholder="הערות לשימוש פנימי בלבד..." />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">העדפות</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)}
              className="w-4 h-4 accent-[#B08D57]" />
            <span className="text-sm text-gray-700">חשבון פעיל</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.marketingConsent} onChange={e => set("marketingConsent", e.target.checked)}
              className="w-4 h-4 accent-[#B08D57]" />
            <span className="text-sm text-gray-700">מסכים לקבלת עדכונים ומבצעים</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.directDebitInterest} onChange={e => set("directDebitInterest", e.target.checked)}
              className="w-4 h-4 accent-[#B08D57]" />
            <span className="text-sm text-gray-700">
              מעוניין בהוראת קבע —{" "}
              <span className="text-[#B08D57] font-medium">3% הנחה</span>
            </span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
