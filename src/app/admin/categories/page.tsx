"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", order: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", description: "", order: String(categories.length) });
    setError("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description ?? "", order: String(cat.order) });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("שם הקטגוריה חובה"); return; }
    setSaving(true);
    setError("");
    const body = { name: form.name, description: form.description, order: Number(form.order) };
    const res = editingId
      ? await fetch(`/api/categories/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "שגיאה");
    } else {
      setShowForm(false);
      load();
    }
    setSaving(false);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`למחוק את "${cat.name}"?`)) return;
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "שגיאה במחיקה");
    } else {
      load();
    }
  };

  const toggleActive = async (cat: Category) => {
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Ploni'] text-2xl text-[#0F2747] font-light">קטגוריות מוצרים</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} קטגוריות</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] transition-colors"
        >
          <Plus size={14} />
          קטגוריה חדשה
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-[#0F2747] text-sm">
            {editingId ? "עריכת קטגוריה" : "קטגוריה חדשה"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">שם קטגוריה *</label>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]"
                placeholder="לדוגמה: ספרים, נרות שבת..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">תיאור (אופציונלי)</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]"
                placeholder="תיאור קצר של הקטגוריה"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סדר תצוגה</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] disabled:opacity-50 transition-colors"
            >
              <Check size={14} />
              {saving ? "שומר..." : "שמור"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-sm hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">טוען...</div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-sm p-12 text-center">
          <Tag size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">אין קטגוריות עדיין</p>
          <p className="text-gray-400 text-xs mt-1">צור את הקטגוריה הראשונה כדי לאפשר הוספת מוצרים</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${cat.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                <div>
                  <p className="text-sm font-medium text-[#0F2747]">{cat.name}</p>
                  {cat.description && <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{cat._count?.products ?? 0} מוצרים</span>
                <button
                  onClick={() => toggleActive(cat)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    cat.isActive
                      ? "border-green-200 text-green-600 hover:bg-green-50"
                      : "border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {cat.isActive ? "פעיל" : "לא פעיל"}
                </button>
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 text-gray-400 hover:text-[#B08D57] transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
