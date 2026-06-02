"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <h2 className="font-['Ploni'] text-2xl font-light text-[#2E2A26] mb-8 text-center">כניסה</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-2">אימייל</label>
          <input
            name="email" type="email" required placeholder="your@email.com"
            className="w-full px-4 py-3 text-sm border border-[#ECE8E2] bg-[#FAF8F5] text-[#2E2A26] placeholder:text-[#CFC5B8] focus:outline-none focus:border-[#B08D57] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest text-[#6B6763] uppercase mb-2">סיסמה</label>
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

      <p className="text-center text-xs text-[#6B6763] mt-6">
        אין לך חשבון?{" "}
        <Link href="/register" className="text-[#B08D57] hover:underline">הרשמה</Link>
      </p>
    </>
  );
}
