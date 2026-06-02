import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);
}

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer = await prisma.customer.findFirst({
    where: { userId: session.id },
    select: { id: true },
  });

  if (!customer) redirect("/dashboard");

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { name: true, quantity: true } },
    },
  });

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-['Ploni'] text-2xl font-bold text-[#2E2A26]">ההזמנות שלי</h1>
        <p className="text-[#6B6763] mt-1">{orders.length} הזמנות בסך הכל</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ECE8E2] p-12 text-center">
          <p className="text-[#6B6763] text-lg">אין הזמנות עדיין</p>
          <p className="text-[#6B6763] text-sm mt-2">הזמנותיך יופיעו כאן לאחר אישורן</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ECE8E2] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ECE8E2] bg-[#FAF8F5]">
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">מספר הזמנה</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">תאריך</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium hidden md:table-cell">מוצרים</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סכום</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סטטוס</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#ECE8E2] last:border-0 hover:bg-[#FAF8F5] transition-colors"
                >
                  <td className="px-4 py-4 font-medium text-[#2E2A26]">{order.orderNumber}</td>
                  <td className="px-4 py-4 text-[#6B6763]">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-4 text-[#6B6763] hidden md:table-cell">
                    <div className="max-w-[200px] truncate">
                      {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#2E2A26] font-medium">
                    {formatCurrency(Number(order.total))}
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 text-left">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-[#B08D57] text-xs font-medium hover:underline whitespace-nowrap"
                    >
                      לפרטים ←
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
