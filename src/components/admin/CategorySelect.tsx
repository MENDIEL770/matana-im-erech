"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface Props {
  defaultValue?: string | null;
}

export function CategorySelect({ defaultValue }: Props) {
  const [all, setAll] = useState<Category[]>([]);
  const [mainId, setMainId] = useState<string>("");
  const [subId, setSubId] = useState<string>(defaultValue ?? "");

  useEffect(() => {
    fetch("/api/categories/flat").then(r => r.json()).then((data: Category[]) => {
      setAll(data);
      if (defaultValue) {
        const cat = data.find(c => c.id === defaultValue);
        if (cat?.parentId) {
          setMainId(cat.parentId);
          setSubId(cat.id);
        } else if (cat) {
          setMainId(cat.id);
          setSubId("");
        }
      }
    });
  }, [defaultValue]);

  const mainCats = all.filter(c => !c.parentId);
  const subCats = all.filter(c => c.parentId === mainId);

  const handleMainChange = (id: string) => {
    setMainId(id);
    setSubId(""); // reset sub when main changes
  };

  // The actual value sent in form = subId if selected, else mainId
  const value = subId || mainId;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">קטגוריה</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-400 block mb-1">קטגוריה ראשית</label>
          <select
            value={mainId}
            onChange={(e) => handleMainChange(e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]"
          >
            <option value="">— בחר —</option>
            {mainCats.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">תת-קטגוריה</label>
          <select
            value={subId}
            onChange={(e) => setSubId(e.target.value)}
            disabled={!mainId || subCats.length === 0}
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57] disabled:bg-gray-50 disabled:text-gray-300"
          >
            <option value="">{subCats.length === 0 ? "אין תתי-קטגוריות" : "— כל הקטגוריה —"}</option>
            {subCats.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Hidden input carries the actual value */}
      <input type="hidden" name="categoryId" value={value} />
    </div>
  );
}
