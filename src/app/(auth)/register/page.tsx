"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass = "w-full px-4 py-3 text-sm border border-[#ECE8E2] bg-[#FAF8F5] text-[#2E2A26] placeholder:text-[#CFC5B8] focus:outline-none focus:border-[#B08D57] transition-colors";
const labelClass = "block text-xs tracking-widest text-[#6B6763] uppercase mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/customers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/login?registered=1");
    } else {
      const data = await res.json();
      setError(data.error ?? "שגיאה בהרשמה");
    }
  }

  return (
    <>
      <h2 className="font-['Ploni'] text-2xl font-light text-[#2E2A26] mb-2 text-center">הרשמה</h2>
      <p className="text-xs text-[#6B6763] text-center tracking-wide mb-8">הצטרף למשפחת מתנה עם ערך</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>שם בית חב״ד</label>
          <input name="chabadHouseName" required placeholder='בית חב"ד ניו יורק' className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>שם השליח</label>
          <input name="shaliachName" required placeholder="הרב ישראל כהן" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>טלפון</label>
            <input
            name="phone" type="tel" required
            placeholder="0500000000"
            pattern="05\d{8}"
            maxLength={10}
            title="מספר טלפון ישראלי: 10 ספרות, מתחיל ב-05"
            className={inputClass}
          />
          </div>
          <div>
            <label className={labelClass}>מדינה</label>
            <input name="country" placeholder="ארה״ב" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>אימייל</label>
          <input name="email" type="email" required placeholder="rabbi@chabad.org" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>סיסמה</label>
          <input name="password" type="password" required placeholder="••••••••" className={inputClass} />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "נרשם..." : "הרשמה"}
        </button>
      </form>

      <p className="text-center text-xs text-[#6B6763] mt-6">
        יש לך חשבון?{" "}
        <Link href="/login" className="text-[#B08D57] hover:underline">כניסה</Link>
      </p>
    </>
  );
}
