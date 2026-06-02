"use client";

import { useState, useEffect } from "react";

interface CustomerData {
  id: string;
  chabadHouseName: string;
  shaliachName: string;
  phone: string;
  email: string;
  country: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
}

export default function AccountPage() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [form, setForm] = useState({
    chabadHouseName: "",
    shaliachName: "",
    phone: "",
    country: "",
    website: "",
    address: "",
    city: "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/customers/me");
      if (res.ok) {
        const data: CustomerData = await res.json();
        setCustomer(data);
        setForm({
          chabadHouseName: data.chabadHouseName ?? "",
          shaliachName: data.shaliachName ?? "",
          phone: data.phone ?? "",
          country: data.country ?? "",
          website: data.website ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!customer) return;
    setSaving(true);
    setSaveMsg("");
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaveMsg("הפרטים עודכנו בהצלחה");
    } else {
      setSaveMsg("שגיאה בשמירה");
    }
    setSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg("הסיסמאות אינן תואמות");
      return;
    }
    setPwLoading(true);
    setPwMsg("");
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPwMsg("הסיסמה עודכנה בהצלחה");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPwMsg(data.error ?? "שגיאה בעדכון הסיסמה");
    }
    setPwLoading(false);
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-[#6B6763]">טוען...</div>
    );
  }

  const inputClass =
    "w-full border border-[#ECE8E2] rounded-xl px-4 py-3 text-sm text-[#2E2A26] bg-white focus:outline-none focus:border-[#B08D57] transition-colors placeholder:text-[#6B6763]/50";
  const labelClass = "block text-xs font-medium text-[#6B6763] mb-1.5";

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-['Ploni'] text-2xl font-bold text-[#2E2A26]">פרטי חשבון</h1>
        <p className="text-[#6B6763] mt-1">{customer?.email}</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#ECE8E2] p-6 mb-6">
        <h2 className="font-['Ploni'] text-base font-semibold text-[#2E2A26] mb-5">פרטים אישיים</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>שם השליח</label>
            <input
              className={inputClass}
              value={form.shaliachName}
              onChange={(e) => setForm({ ...form, shaliachName: e.target.value })}
              placeholder="שם מלא"
            />
          </div>
          <div>
            <label className={labelClass}>שם בית הכנסת / חב&quot;ד</label>
            <input
              className={inputClass}
              value={form.chabadHouseName}
              onChange={(e) => setForm({ ...form, chabadHouseName: e.target.value })}
              placeholder="שם הבית חב&quot;ד"
            />
          </div>
          <div>
            <label className={labelClass}>טלפון</label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (000) 000-0000"
              dir="ltr"
            />
          </div>
          <div>
            <label className={labelClass}>מדינה</label>
            <input
              className={inputClass}
              value={form.country ?? ""}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="ארה&quot;ב"
            />
          </div>
          <div>
            <label className={labelClass}>עיר</label>
            <input
              className={inputClass}
              value={form.city ?? ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="עיר"
            />
          </div>
          <div>
            <label className={labelClass}>אתר אינטרנט</label>
            <input
              className={inputClass}
              value={form.website ?? ""}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              dir="ltr"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className={labelClass}>כתובת</label>
          <input
            className={inputClass}
            value={form.address ?? ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="רחוב, מספר"
          />
        </div>

        {saveMsg && (
          <p className={`text-sm mb-4 ${saveMsg.includes("שגיאה") ? "text-red-600" : "text-green-600"}`}>
            {saveMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#B08D57] text-white text-sm font-medium rounded-xl hover:bg-[#9a7a4a] disabled:opacity-50 transition-colors"
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-[#ECE8E2] p-6">
        <h2 className="font-['Ploni'] text-base font-semibold text-[#2E2A26] mb-5">שינוי סיסמה</h2>

        <div className="space-y-4 mb-5">
          <div>
            <label className={labelClass}>סיסמה נוכחית</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              dir="ltr"
            />
          </div>
          <div>
            <label className={labelClass}>סיסמה חדשה</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              dir="ltr"
            />
          </div>
          <div>
            <label className={labelClass}>אימות סיסמה חדשה</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              dir="ltr"
            />
          </div>
        </div>

        {pwMsg && (
          <p className={`text-sm mb-4 ${pwMsg.includes("שגיאה") || pwMsg.includes("אינן") ? "text-red-600" : "text-green-600"}`}>
            {pwMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={pwLoading}
          className="px-6 py-2.5 bg-[#2E2A26] text-white text-sm font-medium rounded-xl hover:bg-[#1a1815] disabled:opacity-50 transition-colors"
        >
          {pwLoading ? "מעדכן..." : "עדכן סיסמה"}
        </button>
      </form>
    </div>
  );
}
