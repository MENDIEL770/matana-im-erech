import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tag, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("he-IL");
}

export default async function CouponsPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [coupons, usedThisMonth] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.count({
      where: {
        couponCode: { not: null },
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  const activeCoupons = coupons.filter((c) => c.isActive);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-['Ploni'] font-bold text-[#0F2747]">קופונים</h1>
          <p className="text-sm text-gray-500 mt-1">ניהול קודי הנחה ומבצעים</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-sm text-sm hover:bg-[#0F2747]/90 transition-colors"
        >
          <Plus size={16} />
          קופון חדש
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0F2747]/10 rounded-full flex items-center justify-center">
              <Tag size={20} className="text-[#0F2747]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">קופונים פעילים</p>
              <p className="text-2xl font-bold text-[#0F2747]">{activeCoupons.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#B08D57]/10 rounded-full flex items-center justify-center">
              <Tag size={20} className="text-[#B08D57]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">שימושים החודש</p>
              <p className="text-2xl font-bold text-[#0F2747]">{usedThisMonth}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card padding="none">
        <CardHeader className="p-6 border-b border-gray-100">
          <CardTitle>כל הקופונים</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-right px-6 py-3 font-medium text-gray-600">קוד</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">סוג</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ערך</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">שימושים</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">מקסימום</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">תוקף</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    אין קופונים עדיין
                  </td>
                </tr>
              )}
              {coupons.map((c) => {
                const expired = c.expiresAt && c.expiresAt < now;
                const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
                let statusLabel = "פעיל";
                let statusClass = "bg-green-100 text-green-700";
                if (!c.isActive) { statusLabel = "כבוי"; statusClass = "bg-gray-100 text-gray-500"; }
                else if (expired) { statusLabel = "פג תוקף"; statusClass = "bg-red-100 text-red-600"; }
                else if (exhausted) { statusLabel = "מוצה"; statusClass = "bg-orange-100 text-orange-600"; }

                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-[#0F2747]">{c.code}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {c.type === "PERCENT" ? "אחוז" : "סכום קבוע"}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {c.type === "PERCENT" ? `${c.value}%` : `₪${Number(c.value).toLocaleString("he-IL")}`}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{c.usedCount}</td>
                    <td className="px-4 py-4 text-gray-600">{c.maxUses ?? "ללא הגבלה"}</td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(c.expiresAt)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="text-[#B08D57] text-xs hover:underline"
                      >
                        עריכה
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
