"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, User, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/products?holiday=pesach",       label: "פסח" },
  { href: "/products?holiday=rosh-hashana", label: "ראש השנה" },
  { href: "/products?holiday=chanuka",      label: "חנוכה" },
  { href: "/products",                      label: "כל המוצרים" },
  { href: "/quote",                         label: "הצעת מחיר" },
];

export function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#ECE8E2] shadow-sm"
            : "bg-white border-b border-[#ECE8E2]"
        }`}
        style={{ height: "80px" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center justify-between gap-8">

          {/* Nav — right side */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[#6B6763] hover:text-[#2E2A26] tracking-wide transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Logo — center */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none"
          >
            <span className="font-['Ploni'] text-xl font-bold tracking-widest text-[#2E2A26] uppercase">
              מתנה עם ערך
            </span>
            <span className="text-[10px] tracking-[0.3em] text-[#B08D57] uppercase mt-0.5">
              Matana Im Erech
            </span>
          </Link>

          {/* Icons — left side */}
          <div className="hidden lg:flex items-center gap-5">
            <button className="text-[#6B6763] hover:text-[#2E2A26] transition-colors">
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link href="/login" className="text-[#6B6763] hover:text-[#2E2A26] transition-colors">
              <User size={18} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-[#2E2A26] mr-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: "80px" }} />

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed top-[80px] inset-x-0 bg-white border-b border-[#ECE8E2] z-40 px-6 py-6">
          <nav className="flex flex-col gap-5">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-base text-[#2E2A26] border-b border-[#ECE8E2] pb-4"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-base text-[#B08D57]"
            >
              כניסה לחשבון
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
