"use client";

import { useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ImportProduct {
  name: string;
  shortDescription?: string;
  description?: string;
  mainCategoryName?: string;
  categoryName?: string;
  regularPrice?: number;
  price20?: number;
  price50?: number;
  price100?: number;
  price250?: number;
  price500?: number;
  tag?: "NEW" | "RECOMMENDED" | "POPULAR" | "PREMIUM";
  isCustomizable?: boolean;
  isFeatured?: boolean;
}

interface ImportResult {
  name: string;
  status: "created" | "error";
  error?: string;
}

export function BulkImportButton() {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ created: number; errors: number; results: ImportResult[] } | null>(null);
  const [parseError, setParseError] = useState("");

  const handleImport = async () => {
    setParseError("");
    let products: ImportProduct[];
    try {
      const parsed = JSON.parse(json);
      products = Array.isArray(parsed) ? parsed : parsed.products;
      if (!Array.isArray(products)) throw new Error("חייב להיות מערך");
    } catch {
      setParseError("JSON לא תקין — ודא שהפורמט נכון");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setParseError("שגיאה בשרת — נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setJson("");
    setResults(null);
    setParseError("");
    if (results?.created) window.location.reload();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border border-[#B08D57] text-[#B08D57] text-sm hover:bg-[#B08D57] hover:text-white transition-colors rounded-sm"
      >
        <Upload size={15} />
        ייבוא מרובה
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#0F2747]">ייבוא מוצרים מרובים</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            {!results ? (
              <div className="p-5 space-y-4">
                <div className="bg-[#FAF8F5] border border-[#ECE8E2] rounded-sm p-4 text-sm text-gray-600 space-y-2">
                  <p className="font-semibold text-[#0F2747]">פורמט JSON — הדבק את הרשימה:</p>
                  <pre className="text-xs bg-white border border-gray-200 rounded p-3 overflow-x-auto">{`[
  {
    "name": "שם המוצר",
    "mainCategoryName": "חגים",
    "categoryName": "ראש השנה",
    "shortDescription": "תיאור קצר",
    "regularPrice": 180,
    "price20": 155,
    "price100": 130,
    "price500": 110,
    "tag": "RECOMMENDED",
    "isCustomizable": false
  }
]`}</pre>
                  <p className="text-xs text-gray-400">
                    תגיות אפשריות: NEW / RECOMMENDED / POPULAR / PREMIUM
                  </p>
                </div>

                <textarea
                  value={json}
                  onChange={(e) => { setJson(e.target.value); setParseError(""); }}
                  placeholder='[{"name": "...", "categoryName": "...", ...}]'
                  rows={12}
                  className="w-full border border-gray-200 rounded-sm p-3 text-sm font-mono focus:outline-none focus:border-[#B08D57] resize-none"
                />

                {parseError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {parseError}
                  </p>
                )}

                <div className="flex gap-3 justify-end">
                  <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                    ביטול
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading || !json.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {loading ? "מייבא..." : "ייבא מוצרים"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-sm p-4 text-center">
                    <CheckCircle size={24} className="text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-700">{results.created}</p>
                    <p className="text-sm text-green-600">נוצרו בהצלחה</p>
                  </div>
                  {results.errors > 0 && (
                    <div className="flex-1 bg-red-50 border border-red-200 rounded-sm p-4 text-center">
                      <AlertCircle size={24} className="text-red-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-red-600">{results.errors}</p>
                      <p className="text-sm text-red-500">שגיאות</p>
                    </div>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-sm divide-y divide-gray-50">
                  {results.results.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      {r.status === "created"
                        ? <CheckCircle size={14} className="text-green-500 shrink-0" />
                        : <AlertCircle size={14} className="text-red-500 shrink-0" />
                      }
                      <span className={r.status === "error" ? "text-red-600" : "text-gray-700"}>{r.name}</span>
                      {r.error && <span className="text-xs text-red-400 mr-auto">{r.error}</span>}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 bg-[#0F2747] text-white text-sm rounded-sm hover:bg-[#1a3a6e] transition-colors"
                >
                  סגור וחזור לרשימת המוצרים
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
