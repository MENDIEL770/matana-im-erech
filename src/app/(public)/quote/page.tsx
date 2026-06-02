"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

function QuoteForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product") ?? "";

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chabadHouse: fd.get("chabadHouse"),
          contactName: fd.get("contactName"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          notes: [
            productId ? `מוצר: ${productId}` : "",
            fd.get("productInterest") ? `עניין במוצר: ${fd.get("productInterest")}` : "",
            fd.get("message") ? `הודעה: ${fd.get("message")}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
          source: "website",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "שגיאה בשליחה");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחה, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-6">
        <CheckCircle2 size={56} className="mx-auto text-[#B08D57]" />
        <h2 className="font-['Ploni'] text-2xl text-[#2E2A26] font-light">
          תודה! קיבלנו את פנייתך
        </h2>
        <p className="text-[#6B6763] max-w-sm mx-auto">
          צוות מתנה עם ערך יחזור אליך בהקדם עם הצעת מחיר מותאמת אישית.
        </p>
        <Link
          href="/products"
          className="inline-block mt-4 px-8 py-3 bg-[#2E2A26] text-white text-sm tracking-widest uppercase hover:bg-[#B08D57] transition-colors"
        >
          המשך לצפייה בקטלוג
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[#2E2A26] mb-1.5">
            שם בית הכנסת / חב״ד <span className="text-red-500">*</span>
          </label>
          <input
            name="chabadHouse"
            required
            className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors"
            placeholder="בית חב״ד ניו יורק"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2E2A26] mb-1.5">
            שם השליח <span className="text-red-500">*</span>
          </label>
          <input
            name="contactName"
            required
            className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors"
            placeholder="הרב ישראל ישראלי"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2E2A26] mb-1.5">
            טלפון <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            required
            className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors"
            placeholder="+1 212 555 0100"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2E2A26] mb-1.5">
            אימייל
          </label>
          <input
            name="email"
            type="email"
            className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors"
            placeholder="rabbi@chabad.org"
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2E2A26] mb-1.5">
          מוצר / קטגוריה שמעניינת
        </label>
        <input
          name="productInterest"
          defaultValue={productId ? `מוצר #${productId}` : ""}
          className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors"
          placeholder="מנורת חנוכה עם לוגו, 100 יחידות..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2E2A26] mb-1.5">
          הודעה נוספת
        </label>
        <textarea
          name="message"
          rows={4}
          className="w-full px-4 py-3 text-sm border border-[#ECE8E2] rounded-xl bg-white focus:outline-none focus:border-[#B08D57] transition-colors resize-none"
          placeholder="תאריך האירוע, כמות משוערת, דרישות מיוחדות..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {loading ? "שולח..." : "שלח בקשת הצעת מחיר"}
      </button>
    </form>
  );
}

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-[#ECE8E2] py-14 px-6 text-center">
        <p className="text-[11px] tracking-[0.3em] text-[#B08D57] uppercase mb-3">
          צור קשר
        </p>
        <h1 className="font-['Ploni'] font-light text-[#2E2A26] text-4xl">
          בקשת הצעת מחיר
        </h1>
        <div className="mt-5 mx-auto w-12 h-px bg-[#B08D57]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-[#ECE8E2] rounded-2xl p-8 lg:p-10">
          <p className="text-[#6B6763] text-sm leading-relaxed mb-8 text-center">
            מלאו את הטופס ואחד מנציגינו יחזור אליכם תוך 24 שעות עם הצעת מחיר
            מפורטת ומותאמת אישית.
          </p>

          <Suspense fallback={<div className="animate-pulse space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-[#FAF8F5] rounded-xl" />)}
          </div>}>
            <QuoteForm />
          </Suspense>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-[#6B6763]">מעדיפים לדבר ישירות?</p>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#B08D57] hover:underline"
          >
            פנו אלינו בוואטסאפ
          </a>
        </div>
      </div>
    </div>
  );
}
