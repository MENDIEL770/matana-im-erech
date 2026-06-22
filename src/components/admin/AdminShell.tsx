"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Users, UserCheck, BarChart3, Settings, Tag,
  Warehouse, Bell, ChevronLeft, Menu, X, TicketPercent
} from "lucide-react";

const navGroups = [
  {
    label: "ראשי",
    items: [{ href: "/admin/dashboard", label: "לוח בקרה", icon: LayoutDashboard }],
  },
  {
    label: "מוצרים",
    items: [
      { href: "/admin/products", label: "מוצרים", icon: Package },
      { href: "/admin/categories", label: "קטגוריות", icon: Tag },
      { href: "/admin/inventory", label: "מלאי", icon: Warehouse },
    ],
  },
  {
    label: "מכירות",
    items: [
      { href: "/admin/quotes", label: "הצעות מחיר", icon: FileText },
      { href: "/admin/orders", label: "הזמנות", icon: ShoppingCart },
      { href: "/admin/coupons", label: "קופונים", icon: TicketPercent },
    ],
  },
  {
    label: "לקוחות",
    items: [
      { href: "/admin/customers", label: "לקוחות", icon: Users },
      { href: "/admin/crm", label: "CRM", icon: UserCheck },
      { href: "/admin/agents", label: "סוכנים", icon: UserCheck },
    ],
  },
  {
    label: "דוחות",
    items: [{ href: "/admin/reports", label: "דוחות ורווחיות", icon: BarChart3 }],
  },
  {
    label: "מערכת",
    items: [{ href: "/admin/settings", label: "הגדרות", icon: Settings }],
  },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-[#0F2747] text-white flex flex-col z-50 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto lg:shrink-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        dir="rtl"
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-['Ploni'] text-lg font-bold">מתנה עם ערך</span>
            <span className="text-[#B08D57] text-xs">ניהול מערכת</span>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white p-1" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1.5">
                {group.label}
              </p>
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm mb-0.5 transition-colors",
                      active
                        ? "bg-[#B08D57]/10 border-r-2 border-[#B08D57] text-[#B08D57]"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={14} />
            <span>לאתר הציבורי</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0" dir="rtl">
      {/* Hamburger — mobile only */}
      <button
        className="lg:hidden p-2 text-gray-500 hover:text-[#0F2747] hover:bg-gray-100 rounded-sm transition-colors"
        onClick={onMenuClick}
        aria-label="פתח תפריט"
      >
        <Menu size={20} />
      </button>

      {/* Page title slot (empty — pages can set their own) */}
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:text-[#0F2747] hover:bg-gray-100 rounded-sm transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#B08D57] rounded-full" />
        </button>
        <div className="w-8 h-8 bg-[#0F2747] rounded-full flex items-center justify-center text-white text-sm font-semibold">
          מ
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
