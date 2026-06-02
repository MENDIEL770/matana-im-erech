import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge, QuoteStatusBadge } from "@/components/dashboard/StatusBadge";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer = await prisma.customer.findFirst({
    where: { userId: session.id },
  });

  if (!customer) {
    return (
      <div className="p-8 text-[#6B6763]">לא נמצא פרופיל לקוח עבור משתמש זה.</div>
    );
  }

  const [openOrders, pendingQuotes, recentOrders, recentQuotes] = await Promise.all([
    prisma.order.count({
      where: {
        customerId: customer.id,
        status: { notIn: ["COMPLETED", "CANCELLED", "DELIVERED"] },
      },
    }),
    prisma.quote.count({
      where: { customerId: customer.id, status: "SENT" },
    }),
    prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        total: true,
      },
    }),
    prisma.quote.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: {
        id: true,
        quoteNumber: true,
        createdAt: true,
        status: true,
        total: true,
      },
    }),
  ]);

  const totalSpent = Number(customer.totalSpent);

  const stats = [
    { label: "הזמנות פתוחות", value: openOrders, color: "text-[#B08D57]" },
    { label: "הצעות ממתינות", value: pendingQuotes, color: "text-blue-600" },
    { label: "סה\"כ רכישות", value: formatCurrency(totalSpent), color: "text-green-600" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Ploni'] text-2xl font-bold text-[#2E2A26]">
          שלום, {customer.shaliachName} 👋
        </h1>
        <p className="text-[#6B6763] mt-1">{customer.chabadHouseName}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#ECE8E2] p-6">
            <p className="text-sm text-[#6B6763] mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Ploni'] text-lg font-semibold text-[#2E2A26]">הזמנות אחרונות</h2>
          <Link href="/dashboard/orders" className="text-sm text-[#B08D57] hover:underline">
            לכל ההזמנות ←
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ECE8E2] p-8 text-center text-[#6B6763]">
            אין הזמנות עדיין
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#ECE8E2] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ECE8E2] bg-[#FAF8F5]">
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">מספר הזמנה</th>
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">תאריך</th>
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סטטוס</th>
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סכום</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#ECE8E2] last:border-0 hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#2E2A26]">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-[#6B6763]">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-[#2E2A26]">{formatCurrency(Number(order.total))}</td>
                    <td className="px-4 py-3 text-left">
                      <Link href={`/dashboard/orders/${order.id}`} className="text-[#B08D57] text-xs hover:underline">
                        לפרטים
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent quotes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Ploni'] text-lg font-semibold text-[#2E2A26]">הצעות מחיר אחרונות</h2>
          <Link href="/dashboard/quotes" className="text-sm text-[#B08D57] hover:underline">
            לכל ההצעות ←
          </Link>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ECE8E2] p-8 text-center text-[#6B6763]">
            אין הצעות מחיר עדיין
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#ECE8E2] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ECE8E2] bg-[#FAF8F5]">
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">מספר הצעה</th>
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">תאריך</th>
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סטטוס</th>
                  <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סכום</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-[#ECE8E2] last:border-0 hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#2E2A26]">{quote.quoteNumber}</td>
                    <td className="px-4 py-3 text-[#6B6763]">{formatDate(quote.createdAt)}</td>
                    <td className="px-4 py-3">
                      <QuoteStatusBadge status={quote.status} />
                    </td>
                    <td className="px-4 py-3 text-[#2E2A26]">{formatCurrency(Number(quote.total))}</td>
                    <td className="px-4 py-3 text-left">
                      <Link href={`/dashboard/quotes`} className="text-[#B08D57] text-xs hover:underline">
                        לפרטים
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
