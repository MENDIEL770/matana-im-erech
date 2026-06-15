"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, ArrowRight } from "lucide-react";

const inputClass = "w-full px-4 py-3 text-sm border border-[#ECE8E2] bg-[#FAF8F5] text-[#2E2A26] placeholder:text-[#CFC5B8] focus:outline-none focus:border-[#B08D57] transition-colors";

type Step = "identify" | "code" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("identify");
  const [identifier, setIdentifier] = useState("");
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!identifier.trim()) { setError("הכנס אימייל או מספר טלפון"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: identifier.trim(), method }),
    });
    setLoading(false);
    if (res.ok) { setStep("code"); }
    else { const d = await res.json(); setError(d.error ?? "שגיאה"); }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) { setError("הכנס קוד בן 6 ספרות"); return; }
    setStep("newPassword");
    setError("");
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) { setError("הסיסמה חייבת להכיל לפחות 6 תווים"); return; }
    if (newPassword !== confirmPassword) { setError("הסיסמאות אינן תואמות"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: identifier.trim(), token: code, newPassword }),
    });
    setLoading(false);
    if (res.ok) { setStep("done"); }
    else { const d = await res.json(); setError(d.error ?? "שגיאה"); }
  };

  return (
    <>
      <h2 className="font-['Ploni'] text-2xl font-light text-[#2E2A26] mb-2 text-center">שכחתי סיסמה</h2>

      {step === "identify" && (
        <div className="space-y-5">
          <p className="text-xs text-[#6B6763] text-center mb-6">נשלח לך קוד אימות לאיפוס הסיסמה</p>

          <div>
            <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-2">אימייל או מספר טלפון</label>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              placeholder="your@email.com או 0501234567" className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()} />
          </div>

          <div>
            <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-3">שלח קוד דרך</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMethod("email")}
                className={`flex items-center justify-center gap-2 py-3 border rounded-sm text-sm transition-colors ${method === "email" ? "border-[#B08D57] bg-[#FAF8F5] text-[#B08D57]" : "border-[#ECE8E2] text-[#6B6763] hover:border-[#B08D57]"}`}>
                <Mail size={15} /> אימייל
              </button>
              <button type="button" onClick={() => setMethod("sms")}
                className={`flex items-center justify-center gap-2 py-3 border rounded-sm text-sm transition-colors ${method === "sms" ? "border-[#B08D57] bg-[#FAF8F5] text-[#B08D57]" : "border-[#ECE8E2] text-[#6B6763] hover:border-[#B08D57]"}`}>
                <MessageCircle size={15} /> SMS
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button onClick={handleSendCode} disabled={loading}
            className="w-full py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors disabled:opacity-50">
            {loading ? "שולח..." : "שלח קוד"}
          </button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-5">
          <p className="text-xs text-[#6B6763] text-center mb-6">
            שלחנו קוד בן 6 ספרות ל{method === "email" ? `אימייל ${identifier}` : `טלפון ${identifier}`}
          </p>
          <div>
            <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-2">קוד אימות</label>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000" className={inputClass + " text-center text-2xl tracking-[0.5em] font-mono"}
              maxLength={6} onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleVerifyCode} disabled={code.length !== 6}
            className="w-full py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors disabled:opacity-50">
            אמת קוד
          </button>
          <button onClick={() => { setStep("identify"); setCode(""); setError(""); }}
            className="w-full text-xs text-[#6B6763] hover:text-[#B08D57] transition-colors">
            לא קיבלתי — נסה שוב
          </button>
        </div>
      )}

      {step === "newPassword" && (
        <div className="space-y-5">
          <p className="text-xs text-[#6B6763] text-center mb-6">הכנס סיסמה חדשה</p>
          <div>
            <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-2">סיסמה חדשה</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="לפחות 6 תווים" className={inputClass} minLength={6} />
          </div>
          <div>
            <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-2">אימות סיסמה</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הכנס שוב את הסיסמה" className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && handleResetPassword()} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleResetPassword} disabled={loading}
            className="w-full py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors disabled:opacity-50">
            {loading ? "מאפס..." : "אפס סיסמה"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-[#2E2A26] font-medium">הסיסמה אופסה בהצלחה!</p>
          <p className="text-xs text-[#6B6763]">תוכל להתחבר עם הסיסמה החדשה</p>
          <Link href="/login"
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors">
            <ArrowRight size={14} /> כניסה
          </Link>
        </div>
      )}

      {step !== "done" && (
        <p className="text-center text-xs text-[#6B6763] mt-6">
          <Link href="/login" className="text-[#B08D57] hover:underline">חזרה לכניסה</Link>
        </p>
      )}
    </>
  );
}
