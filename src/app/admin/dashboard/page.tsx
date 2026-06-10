import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import {
  ShoppingCart, FileText, Users, TrendingUp,
  AlertTriangle, Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let todayOrdersCount = 0;
  let todayRevenue = 0;
  let pendingQuotes = 0;
  let lowStockCount = 0;
  let openLeads = 0;
  let recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: unknown;
    status: string;
    createdAt: Date;
    customer: { chabadHouseName: string } | null;
  }> = [];
  let recentPendingQuotes: Array<{
    id: string;
    quoteNumber: string;
    total: unknown;
    status: string;
    createdAt: Date;
    customer: { chabadHouseName: string } | null;
  }> = [];

  try {
    const [
      todayOrdersResult,
      todayRevenueResult,
      pendingQuotesResult,
      lowStockResult,
      openLeadsResult,
      recentOrdersResult,
      recentQuotesResult,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.quote.count({ where: { status: "SENT" } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
      prisma.lead.count({
        where: { status: { in: ["NEW", "CONTACTED", "WAITING", "QUOTE_SENT", "NEGOTIATION"] } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { chabadHouseName: true } } },
      }),
      prisma.quote.findMany({
        where: { status: "SENT" },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { chabadHouseName: true } } },
      }),
    ]);

    todayOrdersCount = todayOrdersResult;
    todayRevenue = Number(todayRevenueResult._sum.total ?? 0);
    pendingQuotes = pendingQuotesResult;
    lowStockCount = lowStockResult;
    openLeads = openLeadsResult;
    recentOrders = recentOrdersResult;
    recentPendingQuotes = recentQuotesResult;
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
  }

  const stats = [
    {
      label: "הזמנות היום",
      value: String(todayOrdersCount),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "הכנסה היום",
      value: formatCurrency(todayRevenue),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "הצעות ממתינות",
      value: String(pendingQuotes),
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "לידים פתוחים",
      value: String(openLeads),
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const orderStatusLabels: Record<string, string> = {
    NEW: "חדשה",
    CONFIRMED: "מאושרת",
    IN_PRODUCTION: "בייצור",
    READY: "מוכנה",
    SHIPPED: "נשלחה",
    DELIVERED: "נמסרה",
    CANCELLED: "בוטלה",
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F2747]">לוח בקרה</h1>
        <p className="text-sm text-gray-500 mt-1">ברוך הבא! הנה סקירה של המצב הנוכחי.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-[#0F2747]">{value}</p>
              </div>
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-sm">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            {lowStockCount} מוצרים מתחת למלאי מינימום —{" "}
            <a href="/admin/inventory" className="underline font-medium">
              לניהול מלאי
            </a>
          </span>
        </div>
      )}

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-[#0F2747] mb-4">הזמנות אחרונות</h2>
          {recentOrders.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">אין הזמנות עדיין</div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0F2747]">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customer?.chabadHouseName ?? "—"}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#0F2747]">
                      {formatCurrency(Number(order.total))}
                    </p>
                    <p className="text-xs text-gray-400">
                      {orderStatusLabels[order.status] ?? order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending quotes */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-[#0F2747] mb-4">הצעות מחיר ממתינות</h2>
          {recentPendingQuotes.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8 flex flex-col items-center gap-2">
              <Package size={32} className="text-gray-300" />
              <span>אין הצעות ממתינות</span>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPendingQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0F2747]">{quote.quoteNumber}</p>
                    <p className="text-xs text-gray-500">{quote.customer?.chabadHouseName ?? "—"}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#0F2747]">
                      {formatCurrency(Number(quote.total))}
                    </p>
                    <p className="text-xs text-amber-600">ממתינה לאישור</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
