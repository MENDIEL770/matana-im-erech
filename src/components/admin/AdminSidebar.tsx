"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Users, UserCheck, BarChart3, Settings, Tag,
  Warehouse, Bell, ChevronLeft
} from "lucide-react";

const navGroups = [
  {
    label: "ראשי",
    items: [
      { href: "/admin/dashboard", label: "לוח בקרה", icon: LayoutDashboard },
    ],
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
      { href: "/admin/coupons", label: "קופונים", icon: Tag },
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
    items: [
      { href: "/admin/reports", label: "דוחות ורווחיות", icon: BarChart3 },
    ],
  },
  {
    label: "מערכת",
    items: [
      { href: "/admin/settings", label: "הגדרות", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0F2747] text-white flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex flex-col">
          <span className="font-['Ploni'] text-lg font-bold">מתנה עם ערך</span>
          <span className="text-[#B08D57] text-xs">ניהול מערכת</span>
        </Link>
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
                    "admin-sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm mb-0.5",
                    active
                      ? "bg-[#B08D57]/10 border-r-2 border-[#B08D57] text-[#B08D57]"
                      : "text-gray-300 hover:text-white"
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
  );
}
