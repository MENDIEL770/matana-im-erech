"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    commissionRate: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          commissionRate: parseFloat(form.commissionRate),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה ביצירת הסוכן");
        return;
      }

      const agent = await res.json();
      router.push(`/admin/agents/${agent.id}`);
    } catch {
      setError("שגיאת רשת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-5">
      {/* Back */}
      <Link
        href="/admin/agents"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F2747]"
      >
        <ArrowRight size={14} />
        חזרה לסוכנים
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>סוכן חדש</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">שם מלא</label>
            <Input
              value={form.name}
              onChange={set("name")}
              placeholder="ישראל ישראלי"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">טלפון</label>
            <Input
              value={form.phone}
              onChange={set("phone")}
              placeholder="05XXXXXXXX"
              pattern="05\d{8}"
              title="מספר טלפון חוקי: 05XXXXXXXX"
              required
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">אימייל</label>
            <Input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="agent@example.com"
              required
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              אחוז עמלה (0–100)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={form.commissionRate}
                onChange={set("commissionRate")}
                placeholder="10"
                min="0"
                max="100"
                step="0.1"
                required
                dir="ltr"
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                %
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="gold" loading={loading} className="flex-1">
              צור סוכן
            </Button>
            <Link href="/admin/agents">
              <Button type="button" variant="outline">
                ביטול
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
