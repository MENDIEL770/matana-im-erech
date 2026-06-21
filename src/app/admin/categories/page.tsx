"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, Tag, ChevronDown, ChevronLeft, FolderOpen, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  parentId: string | null;
  _count?: { products: number };
  children?: Category[];
}

export default function CategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", order: "0", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const [treeRes, flatRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/categories/flat"),
    ]);
    const treeData = await treeRes.json();
    const flatData = await flatRes.json();
    setTree(treeData);
    setFlat(flatData);
    setExpanded(new Set(treeData.map((c: Category) => c.id)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = (parentId = "") => {
    setEditingId(null);
    setForm({ name: "", description: "", order: "0", parentId });
    setError("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description ?? "", order: String(cat.order), parentId: cat.parentId ?? "" });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("שם הקטגוריה חובה"); return; }
    setSaving(true); setError("");
    const body = {
      name: form.name,
      description: form.description,
      order: Number(form.order),
      parentId: form.parentId || null,
    };
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
    if (!res.ok) { const d = await res.json(); alert(d.error ?? "שגיאה במחיקה"); }
    else load();
  };

  const toggleActive = async (cat: Category) => {
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    load();
  };

  const moveItem = async (items: Category[], index: number, direction: -1 | 1) => {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const a = items[index];
    const b = items[swapIndex];
    await Promise.all([
      fetch(`/api/categories/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: b.order }) }),
      fetch(`/api/categories/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: a.order }) }),
    ]);
    load();
  };

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const mainCategories = flat.filter(c => !c.parentId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Ploni'] text-2xl text-[#0F2747] font-light">קטגוריות מוצרים</h1>
          <p className="text-sm text-gray-500 mt-1">{flat.length} קטגוריות</p>
        </div>
        <button onClick={() => openNew()}
          className="flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] transition-colors">
          <Plus size={14} /> קטגוריה ראשית
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-[#0F2747] text-sm">
            {editingId ? "עריכת קטגוריה" : form.parentId ? "תת-קטגוריה חדשה" : "קטגוריה ראשית חדשה"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">שם *</label>
              <input autoFocus value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]"
                placeholder={form.parentId ? "לדוגמה: ראש השנה" : "לדוגמה: חגים"} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">קטגוריה אב (ריק = ראשית)</label>
              <select value={form.parentId} onChange={(e) => setForm(f => ({ ...f, parentId: e.target.value }))}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]">
                <option value="">— קטגוריה ראשית —</option>
                {mainCategories.filter(c => c.id !== editingId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">תיאור</label>
              <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]"
                placeholder="תיאור קצר" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סדר תצוגה</label>
              <input type="number" value={form.order} onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] disabled:opacity-50 transition-colors">
              <Check size={14} /> {saving ? "שומר..." : "שמור"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-sm hover:bg-gray-50 transition-colors">
              <X size={14} /> ביטול
            </button>
          </div>
        </div>
      )}

      {/* Tree */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">טוען...</div>
      ) : tree.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-sm p-12 text-center">
          <Tag size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">אין קטגוריות עדיין</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          {tree.map((main, i) => (
            <div key={main.id} className={i > 0 ? "border-t border-gray-100" : ""} draggable={false}>
              {/* Main category row */}
              <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button onClick={() => moveItem(tree, i, -1)} disabled={i === 0} className="text-gray-300 hover:text-[#B08D57] disabled:opacity-20 transition-colors"><ChevronUp size={13} /></button>
                    <button onClick={() => moveItem(tree, i, 1)} disabled={i === tree.length - 1} className="text-gray-300 hover:text-[#B08D57] disabled:opacity-20 transition-colors"><ChevronDown size={13} /></button>
                  </div>
                  <button onClick={() => toggle(main.id)} className="text-gray-400 hover:text-gray-600">
                    {expanded.has(main.id) ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
                  </button>
                  <FolderOpen size={16} className="text-[#B08D57]" />
                  <div>
                    <p className="text-sm font-semibold text-[#0F2747]">{main.name}</p>
                    {main.description && <p className="text-xs text-gray-400">{main.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{main.children?.length ?? 0} תתי-קטגוריות</span>
                  <button onClick={() => openNew(main.id)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-1 border border-[#B08D57] text-[#B08D57] rounded-full hover:bg-[#FAF8F5] transition-all">
                    <Plus size={10} /> תת-קטגוריה
                  </button>
                  <button onClick={() => toggleActive(main)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${main.isActive ? "border-green-200 text-green-600" : "border-gray-200 text-gray-400"}`}>
                    {main.isActive ? "פעיל" : "כבוי"}
                  </button>
                  <button onClick={() => openEdit(main)} className="p-1.5 text-gray-400 hover:text-[#B08D57]"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(main)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Sub-categories */}
              {expanded.has(main.id) && main.children && main.children.length > 0 && (
                <div className="border-t border-gray-50">
                  {main.children.map((sub, si) => (
                    <div key={sub.id}
                      className="flex items-center justify-between px-5 py-3 pl-12 bg-gray-50/50 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0">
                      <div className="flex items-center gap-3 pr-8">
                        <div className="flex flex-col">
                          <button onClick={() => moveItem(main.children!, si, -1)} disabled={si === 0} className="text-gray-300 hover:text-[#B08D57] disabled:opacity-20 transition-colors"><ChevronUp size={12} /></button>
                          <button onClick={() => moveItem(main.children!, si, 1)} disabled={si === main.children!.length - 1} className="text-gray-300 hover:text-[#B08D57] disabled:opacity-20 transition-colors"><ChevronDown size={12} /></button>
                        </div>
                        <div className="w-px h-4 bg-gray-300" />
                        <Tag size={13} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-[#2E2A26]">{sub.name}</p>
                          {sub.description && <p className="text-xs text-gray-400">{sub.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{sub._count?.products ?? 0} מוצרים</span>
                        <button onClick={() => toggleActive(sub)}
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${sub.isActive ? "border-green-200 text-green-600" : "border-gray-200 text-gray-400"}`}>
                          {sub.isActive ? "פעיל" : "כבוי"}
                        </button>
                        <button onClick={() => openEdit(sub)} className="p-1.5 text-gray-400 hover:text-[#B08D57]"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(sub)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add sub-category button when expanded and no children yet */}
              {expanded.has(main.id) && (!main.children || main.children.length === 0) && (
                <div className="px-14 py-2 bg-gray-50/50 border-t border-gray-100">
                  <button onClick={() => openNew(main.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#B08D57] transition-colors">
                    <Plus size={12} /> הוסף תת-קטגוריה
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
