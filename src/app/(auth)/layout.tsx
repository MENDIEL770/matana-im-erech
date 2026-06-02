import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <p className="font-['Ploni'] text-xl font-bold tracking-widest text-[#2E2A26] uppercase">מתנה עם ערך</p>
            <p className="text-[10px] tracking-[0.3em] text-[#B08D57] uppercase mt-1">Matana Im Erech</p>
          </Link>
        </div>
        {/* Card */}
        <div className="bg-white border border-[#ECE8E2] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
