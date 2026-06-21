"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, Tag, Copy, TicketPercent } from "lucide-react";

interface Agent { id: string; name: string; }
interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderAmount: number | null;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  agentId: string | null;
  agentCommissionType: "PERCENT" | "FIXED";
  agentCommissionValue: number;
  agent: Agent | null;
  _count: { usages: number };
}

const empty = {
  code: "", description: "", type: "PERCENT" as const, value: "",
  minOrderAmount: "", expiresAt: "", maxUses: "", isActive: true,
  agentId: "", agentCommissionType: "PERCENT" as const, agentCommissionValue: "",
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, a] = await Promise.all([fetch("/api/coupons"), fetch("/api/agents")]);
    setCoupons(await c.json());
    setAgents(await a.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditingId(null); setForm(empty); setError(""); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code, description: c.description ?? "", type: c.type,
      value: String(c.value), minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      maxUses: c.maxUses ? String(c.maxUses) : "", isActive: c.isActive,
      agentId: c.agentId ?? "", agentCommissionType: c.agentCommissionType,
      agentCommissionValue: String(c.agentCommissionValue),
    });
    setError(""); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) { setError("קוד וערך חובה"); return; }
    setSaving(true); setError("");
    const body = {
      code: form.code, description: form.description, type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      expiresAt: form.expiresAt || null, maxUses: form.maxUses ? Number(form.maxUses) : null,
      isActive: form.isActive, agentId: form.agentId || null,
      agentCommissionType: form.agentCommissionType,
      agentCommissionValue: Number(form.agentCommissionValue || 0),
    };
    const res = editingId
      ? await fetch(`/api/coupons/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "שגיאה"); }
    else { setShowForm(false); load(); }
    setSaving(false);
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`למחוק קופון "${c.code}"?`)) return;
    await fetch(`/api/coupons/${c.id}`, { method: "DELETE" });
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const f = (v: any) => form[v as keyof typeof form];
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Ploni'] text-2xl text-[#0F2747] font-light">קופוני הנחה</h1>
          <p className="text-sm text-gray-500 mt-1">{coupons.length} קופונים</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] transition-colors">
          <Plus size={14} /> קופון חדש
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-[#0F2747] text-sm">{editingId ? "עריכת קופון" : "קופון חדש"}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">קוד קופון *</label>
              <input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())}
                placeholder="SUMMER25"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#B08D57]" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">תיאור</label>
              <input value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="הנחה לקיץ"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">סוג הנחה ללקוח</label>
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]">
                <option value="PERCENT">אחוז הנחה (%)</option>
                <option value="FIXED">סכום קבוע (₪)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ערך {form.type === "PERCENT" ? "(%)" : "(₪)"} *</label>
              <input type="number" value={form.value} onChange={e => set("value", e.target.value)}
                placeholder={form.type === "PERCENT" ? "10" : "50"}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">מינימום הזמנה (₪)</label>
              <input type="number" value={form.minOrderAmount} onChange={e => set("minOrderAmount", e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">תפוגה</label>
              <input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">מקסימום שימושים</label>
              <input type="number" value={form.maxUses} onChange={e => set("maxUses", e.target.value)}
                placeholder="ללא הגבלה"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => set("isActive", e.target.checked)}
                className="accent-[#B08D57]" />
              <label htmlFor="isActive" className="text-sm text-gray-700">קופון פעיל</label>
            </div>
          </div>

          {/* Agent commission section */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-[#0F2747] uppercase tracking-wider">עמלת סוכן</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs text-gray-500 mb-1">סוכן</label>
                <select value={form.agentId} onChange={e => set("agentId", e.target.value)}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]">
                  <option value="">— ללא סוכן —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">סוג עמלה</label>
                <select value={form.agentCommissionType} onChange={e => set("agentCommissionType", e.target.value)}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]">
                  <option value="PERCENT">אחוז (%)</option>
                  <option value="FIXED">סכום קבוע (₪)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  ערך עמלה {form.agentCommissionType === "PERCENT" ? "(%)" : "(₪)"}
                </label>
                <input type="number" value={form.agentCommissionValue}
                  onChange={e => set("agentCommissionValue", e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] disabled:opacity-50 transition-colors">
              <Check size={14} /> {saving ? "שומר..." : "שמור"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-sm hover:bg-gray-50">
              <X size={14} /> ביטול
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">טוען...</div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-sm p-12 text-center">
          <TicketPercent size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">אין קופונים עדיין</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium">קוד</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium">הנחה ללקוח</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium">סוכן</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium">עמלה לסוכן</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium">שימושים</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium">תפוגה</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium">סטטוס</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} className={`border-t border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#2E2A26]">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="text-gray-300 hover:text-[#B08D57] transition-colors">
                        {copied === c.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                    {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#B08D57]">
                    {c.type === "PERCENT" ? `${c.value}%` : `₪${Number(c.value).toFixed(0)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.agent?.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.agentId
                      ? c.agentCommissionType === "PERCENT"
                        ? `${c.agentCommissionValue}%`
                        : `₪${Number(c.agentCommissionValue).toFixed(0)}`
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c._count.usages}{c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("he-IL") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${c.isActive ? "border-green-200 text-green-600" : "border-gray-200 text-gray-400"}`}>
                      {c.isActive ? "פעיל" : "כבוי"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-[#B08D57]"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
