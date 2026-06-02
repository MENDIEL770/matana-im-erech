"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  name: string;
  chabadHouseName?: string;
}

const navItems = [
  { href: "/dashboard", label: "סקירה כללית", icon: "◈" },
  { href: "/dashboard/orders", label: "ההזמנות שלי", icon: "◇" },
  { href: "/dashboard/quotes", label: "הצעות מחיר", icon: "◻" },
  { href: "/dashboard/account", label: "פרטי חשבון", icon: "◯" },
];

export function DashboardSidebar({ name, chabadHouseName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#ECE8E2]">
        <div className="text-xs text-[#B08D57] font-medium tracking-widest mb-1">מתנה עם ערך</div>
        <h2 className="font-['Ploni'] text-lg font-bold text-[#2E2A26] leading-tight">{name}</h2>
        {chabadHouseName && (
          <p className="text-sm text-[#6B6763] mt-0.5">{chabadHouseName}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                isActive
                  ? "bg-[#B08D57]/10 text-[#B08D57] font-semibold"
                  : "text-[#6B6763] hover:bg-[#ECE8E2] hover:text-[#2E2A26]"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-[#ECE8E2] pt-4">
        <a
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#6B6763] hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span>↩</span>
          התנתקות
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 bg-white border border-[#ECE8E2] rounded-xl p-2.5 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span className="block w-5 h-0.5 bg-[#2E2A26] mb-1"></span>
        <span className="block w-5 h-0.5 bg-[#2E2A26] mb-1"></span>
        <span className="block w-5 h-0.5 bg-[#2E2A26]"></span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile conditional */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 right-0 z-40 w-64 bg-white border-l border-[#ECE8E2] transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
