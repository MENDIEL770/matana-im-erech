"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });

    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      router.push(data.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
      router.refresh();
    } else {
      setError("אימייל או סיסמה שגויים");
    }
  }

  return (
    <>
      <h2 className="font-['Ploni'] text-2xl font-light text-[#2E2A26] mb-6 text-center">כניסה</h2>
      {registered && (
        <div className="bg-green-50 border border-green-200 rounded px-4 py-3 mb-6 text-center">
          <p className="text-xs text-green-700 font-medium">✅ נרשמת בהצלחה! פרטי החשבון נשלחו לאימייל שלך</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-2">אימייל</label>
          <input
            name="email" type="email" required placeholder="your@email.com"
            className="w-full px-4 py-3 text-sm border border-[#ECE8E2] bg-[#FAF8F5] text-[#2E2A26] placeholder:text-[#CFC5B8] focus:outline-none focus:border-[#B08D57] transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs tracking-widest text-[#6B6763] uppercase">סיסמה</label>
            <Link href="/forgot-password" className="text-xs text-[#B08D57] hover:underline">שכחתי סיסמה</Link>
          </div>
          <input
            name="password" type="password" required placeholder="••••••••"
            className="w-full px-4 py-3 text-sm border border-[#ECE8E2] bg-[#FAF8F5] text-[#2E2A26] placeholder:text-[#CFC5B8] focus:outline-none focus:border-[#B08D57] transition-colors"
          />
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-[#2E2A26] text-white text-sm tracking-widest uppercase hover:bg-[#B08D57] transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "מתחבר..." : "כניסה"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#ECE8E2]" />
          <span className="text-xs text-[#CFC5B8]">או</span>
          <div className="flex-1 h-px bg-[#ECE8E2]" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-[#ECE8E2] bg-white text-[#2E2A26] text-sm hover:border-[#B08D57] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? "מחבר..." : "התחבר עם Google"}
        </button>
      </div>

      <p className="text-center text-xs text-[#6B6763] mt-6">
        אין לך חשבון?{" "}
        <Link href="/register" className="text-[#B08D57] hover:underline">הרשמה</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
