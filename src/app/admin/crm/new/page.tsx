"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const SOURCE_OPTIONS = [
  { value: "אתר", label: "אתר" },
  { value: "המלצה", label: "המלצה" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "פייסבוק", label: "פייסבוק" },
  { value: "אחר", label: "אחר" },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    chabadHouse: "",
    contactName: "",
    phone: "",
    email: "",
    source: "אתר",
    expectedValue: "",
    notes: "",
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Phone validation
    if (!/^05\d{8}$/.test(form.phone)) {
      setError("מספר טלפון חייב להיות בפורמט 05XXXXXXXX");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chabadHouse: form.chabadHouse,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email || undefined,
          source: form.source,
          expectedValue: form.expectedValue ? Number(form.expectedValue) : undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "שגיאה ביצירת ליד");
      }

      const lead = await res.json();
      router.push(`/admin/crm/${lead.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/crm" className="text-gray-400 hover:text-gray-600">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F2747] font-['Ploni']">ליד חדש</h1>
          <p className="text-sm text-gray-500">הוסף ליד חדש למערכת ה-CRM</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                בית חב&quot;ד <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.chabadHouse}
                onChange={(e) => handleChange("chabadHouse", e.target.value)}
                placeholder='בית חב"ד של...'
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                איש קשר <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                placeholder="שם השליח"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טלפון <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="0501234567"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מקור</label>
              <Select
                value={form.source}
                onChange={(e) => handleChange("source", e.target.value)}
                options={SOURCE_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ערך צפוי (₪)</label>
              <Input
                type="number"
                value={form.expectedValue}
                onChange={(e) => handleChange("expectedValue", e.target.value)}
                placeholder="0"
                min="0"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="הערות נוספות..."
              rows={3}
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Link href="/admin/crm">
              <Button type="button" variant="ghost">ביטול</Button>
            </Link>
            <Button type="submit" variant="gold" loading={loading}>
              צור ליד
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
