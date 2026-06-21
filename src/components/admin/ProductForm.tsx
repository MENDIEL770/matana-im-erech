"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { Plus, Trash2, GripVertical } from "lucide-react";

const FIELD_OPTIONS = [
  { value: "donor_name", label: "שם תורם" },
  { value: "phone", label: "טלפון" },
  { value: "address", label: "כתובת" },
  { value: "city", label: "עיר" },
  { value: "email", label: "אימייל" },
  { value: "dedication_text", label: "הקדשה אישית" },
  { value: "engraving_text", label: "טקסט לחריטה" },
  { value: "embroidery_text", label: "טקסט לרקמה" },
  { value: "logo_upload", label: "העלאת לוגו" },
  { value: "image_upload", label: "העלאת תמונה" },
  { value: "custom_notes", label: "הערות מיוחדות" },
];

interface CostRow {
  label: string;
  amount: string;
  isPercent: boolean;
}

interface FieldRow {
  fieldKey: string;
  label: string;
  isRequired: boolean;
}

export function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [costs, setCosts] = useState<CostRow[]>(
    product?.costs ?? [{ label: "עלות ספק", amount: "", isPercent: false }]
  );
  const [fields, setFields] = useState<FieldRow[]>(product?.fields ?? []);
  const [tab, setTab] = useState<"basic" | "pricing" | "costs" | "customize" | "engine" | "inventory">("basic");

  const tabs = [
    { key: "basic", label: "מידע בסיסי" },
    { key: "pricing", label: "תמחור" },
    { key: "costs", label: "רכיבי עלות" },
    { key: "customize", label: "התאמות" },
    { key: "engine", label: "Smart Engine" },
    { key: "inventory", label: "מלאי וספק" },
  ] as const;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    // Numeric fields
    const numericFields = [
      "costPrice","regularPrice","price20","price50","price100","price250","price500",
      "minPrice","minQuantity","embroideryPrice","engravingPrice","logoprintPrice",
      "embossingPrice","stock","minStock","leadTimeDays",
    ];
    // Boolean fields (checkboxes)
    const boolFields = [
      "hasEmbroidery","hasEngraving","hasLogoprint","hasEmbossing","hasPersonal",
      "isFeatured","isNew","isActive","isCustomizable","isBundle","isBundlable",
    ];
    // Nullable enum fields
    const nullableEnums = ["tag","categoryId","holidays"];

    const data: Record<string, any> = { ...raw };

    numericFields.forEach((f) => {
      if (data[f] !== undefined) {
        const n = parseFloat(data[f] as string);
        data[f] = isNaN(n) ? null : n;
      }
    });

    boolFields.forEach((f) => {
      data[f] = formData.has(f);
    });

    nullableEnums.forEach((f) => {
      if (data[f] === "" || data[f] === undefined) data[f] = null;
    });

    try {
      const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, costs, fields }),
      });
      if (res.ok) {
        const saved = await res.json();
        // אחרי יצירה — עבור לדף עריכה כדי להעלות תמונות
        // אחרי עדכון — חזור לרשימה
        if (product) {
          router.push("/admin/products");
        } else {
          router.push(`/admin/products/${saved.id}`);
        }
        router.refresh();
      } else {
        const err = await res.json();
        const msg = typeof err.error === "string"
          ? err.error
          : err.error?.formErrors?.[0]
            ?? err.error?.fieldErrors
              ? "שדות חסרים: " + Object.keys(err.error.fieldErrors ?? {}).join(", ")
              : "לא ניתן לשמור — בדוק שכל השדות תקינים";
        alert("שגיאה: " + msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function addCost() {
    setCosts((c) => [...c, { label: "", amount: "", isPercent: false }]);
  }

  function removeCost(i: number) {
    setCosts((c) => c.filter((_, idx) => idx !== i));
  }

  function addField(fieldKey: string) {
    const opt = FIELD_OPTIONS.find((o) => o.value === fieldKey);
    if (!opt) return;
    if (fields.find((f) => f.fieldKey === fieldKey)) return;
    setFields((f) => [...f, { fieldKey, label: opt.label, isRequired: false }]);
  }

  function removeField(i: number) {
    setFields((f) => f.filter((_, idx) => idx !== i));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#B08D57] text-[#B08D57]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Basic */}
      {tab === "basic" && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="שם מוצר" name="name" defaultValue={product?.name} required />
            <Input label='מק"ט' name="sku" defaultValue={product?.sku} required />
            <div className="md:col-span-2">
              <CategorySelect defaultValue={product?.categoryId} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">תיאור קצר</label>
              <textarea
                name="shortDescription"
                defaultValue={product?.shortDescription}
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">תיאור מלא</label>
              <textarea
                name="description"
                defaultValue={product?.description}
                rows={5}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57]"
              />
            </div>
            <Select
              label="סוג מוצר"
              name="productType"
              defaultValue={product?.productType ?? "MANUFACTURED"}
              options={[
                { value: "MANUFACTURED", label: "מיוצר אצלנו" },
                { value: "PURCHASED", label: "נקנה מספק" },
                { value: "IMPORTED", label: "מיובא" },
                { value: "SPECIAL_ORDER", label: "הזמנה מיוחדת" },
              ]}
            />
            <Select
              label="תג"
              name="tag"
              defaultValue={product?.tag ?? ""}
              options={[
                { value: "", label: "ללא תג" },
                { value: "NEW", label: "חדש" },
                { value: "RECOMMENDED", label: "מומלץ" },
                { value: "POPULAR", label: "פופולרי" },
                { value: "PREMIUM", label: "פרימיום" },
              ]}
            />
            <div className="flex items-center gap-3">
              <input type="checkbox" name="isFeatured" id="isFeatured" defaultChecked={product?.isFeatured} className="w-4 h-4 accent-[#B08D57]" />
              <label htmlFor="isFeatured" className="text-sm text-gray-700">מוצר מומלץ בדף הבית</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" name="isActive" id="isActive" defaultChecked={product?.isActive ?? true} className="w-4 h-4 accent-[#B08D57]" />
              <label htmlFor="isActive" className="text-sm text-gray-700">מוצר פעיל (מוצג באתר)</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" name="isCustomizable" id="isCustomizable" defaultChecked={product?.isCustomizable} className="w-4 h-4 accent-[#B08D57]" />
              <label htmlFor="isCustomizable" className="text-sm text-gray-700">אפשר עיצוב אישי (לוגו / טקסט / ברקמה)</label>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">מארז</p>
              <div className="flex items-center gap-3">
                <input type="checkbox" name="isBundle" id="isBundle" defaultChecked={product?.isBundle} className="w-4 h-4 accent-[#B08D57]" />
                <label htmlFor="isBundle" className="text-sm text-gray-700">מוצר זה הוא <strong>מארז</strong> — ניתן להוסיף אליו מוצרים</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" name="isBundlable" id="isBundlable" defaultChecked={product?.isBundlable} className="w-4 h-4 accent-[#B08D57]" />
                <label htmlFor="isBundlable" className="text-sm text-gray-700">מוצר זה <strong>מתאים למארז</strong> — ניתן להוסיפו למארזים אחרים</label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pricing */}
      {tab === "pricing" && (
        <Card>
          <CardHeader><CardTitle>תמחור לפי כמות</CardTitle></CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <Input label="מחיר עלות בסיס" name="costPrice" type="number" step="0.01" defaultValue={product?.costPrice} placeholder="0" />
            <Input label="מחיר מכירה רגיל" name="regularPrice" type="number" step="0.01" defaultValue={product?.regularPrice} placeholder="0" />
            <Input label="מחיר מינימום" name="minPrice" type="number" step="0.01" defaultValue={product?.minPrice} placeholder="0" />
            <Input label="כמות מינימום" name="minQuantity" type="number" defaultValue={product?.minQuantity ?? 1} placeholder="1" />
            <Input label="מחיר 20 יחידות" name="price20" type="number" step="0.01" defaultValue={product?.price20} placeholder="0" />
            <Input label="מחיר 50 יחידות" name="price50" type="number" step="0.01" defaultValue={product?.price50} placeholder="0" />
            <Input label="מחיר 100 יחידות" name="price100" type="number" step="0.01" defaultValue={product?.price100} placeholder="0" />
            <Input label="מחיר 250 יחידות" name="price250" type="number" step="0.01" defaultValue={product?.price250} placeholder="0" />
            <Input label="מחיר 500 יחידות" name="price500" type="number" step="0.01" defaultValue={product?.price500} placeholder="0" />
          </div>
        </Card>
      )}

      {/* Costs */}
      {tab === "costs" && (
        <Card>
          <CardHeader>
            <CardTitle>רכיבי עלות</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addCost}>
              <Plus size={14} /> הוסף עלות
            </Button>
          </CardHeader>
          <div className="space-y-3">
            {costs.map((cost, i) => (
              <div key={i} className="flex items-end gap-3">
                <GripVertical size={16} className="text-gray-300 mb-2.5 shrink-0 cursor-grab" />
                <div className="flex-1">
                  <Input
                    label={i === 0 ? "תיאור" : undefined}
                    placeholder="שם העלות"
                    value={cost.label}
                    onChange={(e) => setCosts((c) => c.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                  />
                </div>
                <div className="w-32">
                  <Input
                    label={i === 0 ? "סכום" : undefined}
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={cost.amount}
                    onChange={(e) => setCosts((c) => c.map((x, idx) => idx === i ? { ...x, amount: e.target.value } : x))}
                  />
                </div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <input
                    type="checkbox"
                    checked={cost.isPercent}
                    onChange={(e) => setCosts((c) => c.map((x, idx) => idx === i ? { ...x, isPercent: e.target.checked } : x))}
                    className="w-4 h-4 accent-[#B08D57]"
                    id={`pct-${i}`}
                  />
                  <label htmlFor={`pct-${i}`} className="text-xs text-gray-600">%</label>
                </div>
                <button type="button" onClick={() => removeCost(i)} className="mb-2.5 text-gray-400 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Customizations */}
      {tab === "customize" && (
        <Card>
          <CardHeader><CardTitle>אפשרויות התאמה אישית</CardTitle></CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: "Embroidery", label: "רקמה", priceKey: "embroideryPrice" },
              { key: "Engraving", label: "חריטה", priceKey: "engravingPrice" },
              { key: "Logoprint", label: "הדפסת לוגו", priceKey: "logoprintPrice" },
              { key: "Embossing", label: "הטבעה", priceKey: "embossingPrice" },
            ].map(({ key, label, priceKey }) => (
              <div key={key} className="flex items-center gap-4 p-4 border border-gray-100 rounded-sm">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name={`has${key}`} id={`has${key}`} defaultChecked={(product as any)?.[`has${key.toLowerCase()}`]} className="w-4 h-4 accent-[#B08D57]" />
                  <label htmlFor={`has${key}`} className="text-sm font-medium text-gray-700 w-28">{label}</label>
                </div>
                <Input label="מחיר תוספת" name={priceKey} type="number" step="0.01" defaultValue={(product as any)?.[priceKey]} placeholder="0" className="flex-1" />
              </div>
            ))}
            <div className="flex items-center gap-2 p-4 border border-gray-100 rounded-sm">
              <input type="checkbox" name="hasPersonal" id="hasPersonal" defaultChecked={product?.hasPersonal} className="w-4 h-4 accent-[#B08D57]" />
              <label htmlFor="hasPersonal" className="text-sm font-medium text-gray-700">הקדשה אישית (ללא עלות נוספת)</label>
            </div>
          </div>
        </Card>
      )}

      {/* Smart Engine */}
      {tab === "engine" && (
        <Card>
          <CardHeader>
            <CardTitle>Smart Product Engine — שדות מהלקוח</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-500 mb-4">
            בחר אילו שדות המערכת תבקש מהלקוח בעת ההזמנה. המערכת תיצור טופס והורדת Excel אוטומטית.
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {FIELD_OPTIONS.filter((o) => !fields.find((f) => f.fieldKey === o.value)).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => addField(opt.value)}
                className="px-3 py-1.5 text-sm border border-dashed border-[#B08D57] text-[#B08D57] rounded-sm hover:bg-[#B08D57] hover:text-white transition-colors"
              >
                + {opt.label}
              </button>
            ))}
          </div>

          {fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">שדות נבחרים:</p>
              {fields.map((f, i) => (
                <div key={f.fieldKey} className="flex items-center gap-3 p-3 bg-gray-50 rounded-sm">
                  <GripVertical size={14} className="text-gray-300 cursor-grab" />
                  <span className="flex-1 text-sm font-medium text-gray-700">{f.label}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={f.isRequired}
                      onChange={(e) => setFields((fs) => fs.map((x, idx) => idx === i ? { ...x, isRequired: e.target.checked } : x))}
                      className="w-4 h-4 accent-[#B08D57]"
                      id={`req-${i}`}
                    />
                    <label htmlFor={`req-${i}`} className="text-xs text-gray-600">חובה</label>
                  </div>
                  <button type="button" onClick={() => removeField(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-sm">
            <p className="text-xs font-semibold text-amber-800 mb-1">סוג משלוח זמין</p>
            <div className="flex gap-4 mt-2">
              {[
                { value: "CONSOLIDATED", label: "מרוכז לשליח" },
                { value: "DIRECT", label: "ישיר לתורמים" },
                { value: "BOTH", label: "שניהם" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm text-amber-900 cursor-pointer">
                  <input type="radio" name="shippingOptions" value={opt.value} defaultChecked={opt.value === "BOTH"} className="accent-[#B08D57]" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Inventory */}
      {tab === "inventory" && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="font-semibold text-gray-700 mb-3">מלאי</p>
              <div className="space-y-4">
                <Input label="כמות במלאי" name="stock" type="number" defaultValue={product?.stock ?? 0} />
                <Input label="מלאי מינימום (התראה)" name="minStock" type="number" defaultValue={product?.minStock ?? 5} />
                <Input label="מיקום במחסן" name="warehouseLocation" defaultValue={product?.warehouseLocation} placeholder="מדף A-3" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-3">ספק</p>
              <div className="space-y-4">
                <Input label="שם ספק" name="supplierName" defaultValue={product?.supplierName} />
                <Input label="טלפון ספק" name="supplierPhone" type="tel" defaultValue={product?.supplierPhone} />
                <Input label="אימייל ספק" name="supplierEmail" type="email" defaultValue={product?.supplierEmail} />
                <Input label="זמן אספקה (ימים)" name="leadTimeDays" type="number" defaultValue={product?.leadTimeDays} />
                <Input label="ארץ מקור" name="originCountry" defaultValue={product?.originCountry} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pb-6">
        <Button type="button" variant="secondary" onClick={() => router.back()}>ביטול</Button>
        <Button type="submit" variant="gold" loading={loading}>
          {product ? "עדכן מוצר" : "צור מוצר"}
        </Button>
      </div>
    </form>
  );
}
