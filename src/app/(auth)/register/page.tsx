"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const inputClass = "w-full px-4 py-3 text-sm border border-[#ECE8E2] bg-[#FAF8F5] text-[#2E2A26] placeholder:text-[#CFC5B8] focus:outline-none focus:border-[#B08D57] transition-colors";
const labelClass = "block text-xs tracking-widest text-[#6B6763] uppercase mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    const res = await fetch("/api/customers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/login?registered=1");
    } else {
      const d = await res.json();
      setError(d.error ?? "שגיאה בהרשמה");
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
            <input name="phone" type="tel" required placeholder="0500000000"
              pattern="05\d{8}" maxLength={10} title="פורמט: 05XXXXXXXX" className={inputClass} />
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

        {/* Password */}
        <div>
          <label className={labelClass}>סיסמה</label>
          <div className="relative">
            <input name="password" type={showPassword ? "text" : "password"} required
              minLength={6} placeholder="לפחות 6 תווים" className={inputClass + " pl-10"} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6763] hover:text-[#B08D57]">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>אימות סיסמה</label>
          <div className="relative">
            <input name="confirmPassword" type={showConfirm ? "text" : "password"} required
              placeholder="הכנס שוב את הסיסמה" className={inputClass + " pl-10"} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6763] hover:text-[#B08D57]">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          {/* Privacy Policy */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input name="privacyConsent" type="checkbox" required
              className="mt-0.5 w-4 h-4 accent-[#B08D57] flex-shrink-0" />
            <span className="text-xs text-[#6B6763] leading-relaxed">
              קראתי ואני מסכים/ה{" "}
              <Link href="/privacy" target="_blank" className="text-[#B08D57] hover:underline">
                למדיניות הפרטיות
              </Link>{" "}
              ולתנאי השימוש באתר <span className="text-red-500">*</span>
            </span>
          </label>

          {/* Marketing */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input name="marketingConsent" type="checkbox"
              className="mt-0.5 w-4 h-4 accent-[#B08D57] flex-shrink-0" />
            <span className="text-xs text-[#6B6763] leading-relaxed">
              אני מעוניין/ת לקבל עדכונים, מבצעים והצעות מיוחדות ממתנה עם ערך
            </span>
          </label>

          {/* Direct Debit */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input name="directDebitInterest" type="checkbox"
              className="mt-0.5 w-4 h-4 accent-[#B08D57] flex-shrink-0" />
            <span className="text-xs text-[#6B6763] leading-relaxed">
              אני מעוניין/ת לקבל{" "}
              <strong className="text-[#B08D57]">3% הנחה קבועה</strong>{" "}
              בכל רכישה באמצעות הוראת קבע —{" "}
              <span className="text-[#2E2A26]">צרו איתי קשר לפרטים</span>
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors duration-300 disabled:opacity-50">
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
