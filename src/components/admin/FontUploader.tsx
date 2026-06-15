"use client";

import { useState } from "react";
import { Upload, Trash2, Loader2, Type } from "lucide-react";

interface FontEntry { name: string; url: string; }

interface Props {
  productId: string;
  initialFonts?: FontEntry[];
}

export function FontUploader({ productId, initialFonts = [] }: Props) {
  const [fonts, setFonts] = useState<FontEntry[]>(initialFonts);
  const [uploading, setUploading] = useState(false);
  const [fontName, setFontName] = useState("");

  const handleUpload = async (file: File) => {
    if (!fontName.trim()) { alert("הכנס שם לפונט לפני ההעלאה"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", fontName.trim());
    const res = await fetch(`/api/products/${productId}/fonts`, { method: "POST", body: fd });
    if (res.ok) {
      const font: FontEntry = await res.json();
      setFonts((prev) => [...prev, font]);
      setFontName("");
    } else {
      const d = await res.json();
      alert(d.error ?? "שגיאה בהעלאה");
    }
    setUploading(false);
  };

  const handleDelete = async (url: string) => {
    if (!confirm("למחוק פונט זה?")) return;
    await fetch(`/api/products/${productId}/fonts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setFonts((prev) => prev.filter((f) => f.url !== url));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
          placeholder="שם הפונט (לדוגמה: Frank Ruhl)"
          className="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]"
        />
        <label className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-sm cursor-pointer transition-colors ${uploading ? "bg-gray-100 text-gray-400" : "bg-[#B08D57] text-white hover:bg-[#9a7a48]"}`}>
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          העלה
        </label>
      </div>
      <p className="text-xs text-gray-400">פורמטים נתמכים: TTF, OTF, WOFF, WOFF2</p>

      {fonts.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
          <Type size={14} />
          אין פונטים עדיין — העלה פונט כדי שהלקוח יוכל לבחור
        </div>
      ) : (
        <div className="space-y-2">
          {fonts.map((f) => (
            <div key={f.url} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-sm border border-gray-100">
              <span className="text-sm text-[#0F2747]">{f.name}</span>
              <button onClick={() => handleDelete(f.url)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
