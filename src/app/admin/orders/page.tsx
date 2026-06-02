import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart, Plus, TrendingUp, Clock, Factory, Send } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "green" | "navy" | "gold" | "gray" | "red" | "orange" }> = {
  NEW: { label: "חדש", variant: "navy" },
  WAITING_PAYMENT: { label: "ממתין לתשלום", variant: "orange" },
  PAID: { label: "שולם", variant: "gold" },
  IN_PRODUCTION: { label: "בייצור", variant: "gold" },
  READY: { label: "מוכן", variant: "green" },
  SHIPPED: { label: "נשלח", variant: "green" },
  DELIVERED: { label: "נמסר", variant: "green" },
  COMPLETED: { label: "הושלם", variant: "gray" },
  CANCELLED: { label: "בוטל", variant: "red" },
};

const paymentMap: Record<string, { label: string; variant: "green" | "navy" | "gold" | "gray" | "red" | "orange" }> = {
  PENDING: { label: "טרם שולם", variant: "orange" },
  PARTIAL: { label: "חלקי", variant: "gold" },
  PAID: { label: "שולם", variant: "green" },
  REFUNDED: { label: "הוחזר", variant: "red" },
};

const ALL_STATUSES = ["NEW", "WAITING_PAYMENT", "PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"];

async function getOrders(status?: string, search?: string) {
  try {
    return await prisma.order.findMany({
      where: {
        ...(status && status !== "ALL" ? { status: status as never } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { customer: { shaliachName: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        customer: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch { return []; }
}

async function getStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayCount, waitingPayment, inProduction, shipped] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: "WAITING_PAYMENT" } }),
      prisma.order.count({ where: { status: "IN_PRODUCTION" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
    ]);
    return { todayCount, waitingPayment, inProduction, shipped };
  } catch { return { todayCount: 0, waitingPayment: 0, inProduction: 0, shipped: 0 }; }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;
  const [orders, stats] = await Promise.all([getOrders(status, search), getStats()]);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2747]" style={{ fontFamily: "'Ploni', sans-serif" }}>
            הזמנות
          </h1>
          <p className="text-sm text-gray-500">{orders.length} הזמנות</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 bg-[#0F2747] text-white rounded-sm px-4 py-2 text-sm font-medium hover:bg-[#0F2747]/90 transition"
        >
          <Plus size={16} />
          הזמנה חדשה
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "הזמנות היום", value: stats.todayCount, icon: ShoppingCart, color: "text-[#0F2747]", bg: "bg-blue-50" },
          { label: "ממתינות לתשלום", value: stats.waitingPayment, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "בייצור", value: stats.inProduction, icon: Factory, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "נשלחו", value: stats.shipped, icon: Send, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 flex items-center gap-3">
            <div className={`${stat.bg} p-2 rounded-sm`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + Search */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <div className="flex flex-wrap gap-1 p-3 border-b border-gray-100 overflow-x-auto">
          <Link
            href="/admin/orders"
            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition ${
              !status || status === "ALL" ? "bg-[#0F2747] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            הכל
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition ${
                status === s ? "bg-[#0F2747] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {statusMap[s]?.label ?? s}
            </Link>
          ))}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <form method="GET" action="/admin/orders">
            {status && <input type="hidden" name="status" value={status} />}
            <input
              name="search"
              defaultValue={search}
              placeholder="חפש לפי מספר הזמנה או שם לקוח..."
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2747]"
              dir="rtl"
            />
          </form>
        </div>

        {/* Table */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingCart size={48} className="mb-3 opacity-30" />
            <p className="font-medium">אין הזמנות</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">מספר</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">מוצרים</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סכום</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">רווח</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תשלום</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תאריך</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const s = statusMap[o.status];
                  const p = paymentMap[o.paymentStatus];
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0F2747]">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{o.customer.shaliachName}</p>
                          <p className="text-xs text-gray-500">{o.customer.chabadHouseName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {o._count.items} פריטים
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(Number(o.total))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <TrendingUp size={12} />
                          {formatCurrency(Number(o.profit))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.variant}>{p.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="text-xs text-[#0F2747] font-medium hover:underline"
                        >
                          פרטים
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
