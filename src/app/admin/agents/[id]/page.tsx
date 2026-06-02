import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Phone, Mail, TrendingUp, ShoppingCart, Banknote } from "lucide-react";
import { AgentDetailClient } from "./AgentDetailClient";

async function getAgent(id: string) {
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      agentCustomers: {
        include: {
          customer: {
            select: {
              id: true,
              shaliachName: true,
              chabadHouseName: true,
              phone: true,
              email: true,
              tier: true,
              _count: { select: { orders: true } },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
      orders: {
        include: {
          customer: {
            select: { shaliachName: true, chabadHouseName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  return agent;
}

const statusLabels: Record<string, string> = {
  NEW: "חדש",
  WAITING_PAYMENT: "ממתין לתשלום",
  PAID: "שולם",
  IN_PRODUCTION: "בייצור",
  READY: "מוכן",
  SHIPPED: "נשלח",
  DELIVERED: "נמסר",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
};

const statusVariant: Record<string, "green" | "gold" | "navy" | "gray" | "red" | "orange"> = {
  NEW: "navy",
  WAITING_PAYMENT: "orange",
  PAID: "green",
  IN_PRODUCTION: "gold",
  READY: "gold",
  SHIPPED: "navy",
  DELIVERED: "green",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) notFound();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const commissionRate = Number(agent.commissionRate);

  const allOrders = await prisma.order.findMany({
    where: { agentId: id },
    select: { total: true, profit: true, agentCommission: true, createdAt: true },
  });

  const monthOrders = allOrders.filter((o) => new Date(o.createdAt) >= startOfMonth);
  const monthRevenue = monthOrders.reduce((s, o) => s + Number(o.total), 0);
  const monthProfit = monthOrders.reduce((s, o) => s + Number(o.profit), 0);
  const monthCommission = monthProfit * (commissionRate / 100);

  // Serialize for client component
  const assignedCustomers = agent.agentCustomers.map((ac) => ({
    id: ac.customer.id,
    shaliachName: ac.customer.shaliachName,
    chabadHouseName: ac.customer.chabadHouseName,
    phone: ac.customer.phone,
    email: ac.customer.email,
    tier: ac.customer.tier,
    orderCount: ac.customer._count.orders,
    assignedAt: ac.assignedAt.toISOString(),
  }));

  const serializedOrders = agent.orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.customer,
    createdAt: o.createdAt.toISOString(),
    total: Number(o.total),
    profit: Number(o.profit),
    agentCommission: Number(o.agentCommission),
    status: o.status,
  }));

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href="/admin/agents"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F2747]"
      >
        <ArrowRight size={14} />
        חזרה לסוכנים
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-['Ploni'] font-bold text-[#0F2747]">
            {agent.name}
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Phone size={13} />
              {agent.phone}
            </span>
            <span className="flex items-center gap-1">
              <Mail size={13} />
              {agent.email}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
            {commissionRate}% עמלה
          </span>
          <Badge variant={agent.isActive ? "green" : "gray"}>
            {agent.isActive ? "פעיל" : "לא פעיל"}
          </Badge>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Performance stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0F2747]/10 flex items-center justify-center shrink-0">
                <ShoppingCart size={16} className="text-[#0F2747]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">הזמנות החודש</p>
                <p className="text-xl font-bold text-[#0F2747]">{monthOrders.length}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#B08D57]/10 flex items-center justify-center shrink-0">
                <TrendingUp size={16} className="text-[#B08D57]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">הכנסות החודש</p>
                <p className="text-xl font-bold text-[#0F2747]">
                  {formatCurrency(monthRevenue)}
                </p>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Banknote size={16} className="text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">עמלה לתשלום</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(monthCommission)}
                </p>
              </div>
            </Card>
          </div>

          {/* Orders table */}
          <Card padding="none">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-[#0F2747]">20 הזמנות אחרונות</h2>
            </div>
            {serializedOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                אין הזמנות עדיין
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">מספר הזמנה</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">תאריך</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">סה"כ</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">רווח</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">עמלה</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {serializedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-[#0F2747]">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {order.customer?.shaliachName}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatCurrency(order.profit)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#B08D57]">
                          {formatCurrency(order.agentCommission)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[order.status] ?? "gray"}>
                            {statusLabels[order.status] ?? order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Monthly commission chart placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>עמלות חודשיות</CardTitle>
            </CardHeader>
            <div className="h-40 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">גרף עמלות – בקרוב</p>
            </div>
          </Card>
        </div>

        {/* RIGHT — 1/3 */}
        <div className="space-y-5">
          {/* Commission summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">סיכום עמלה – החודש</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">הכנסות:</span>
                <span className="font-medium">{formatCurrency(monthRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">רווח גולמי:</span>
                <span className="font-medium">{formatCurrency(monthProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">אחוז עמלה:</span>
                <span className="font-medium">{commissionRate}%</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-[#0F2747]">עמלה לתשלום:</span>
                <span className="font-bold text-[#B08D57] text-base">
                  {formatCurrency(monthCommission)}
                </span>
              </div>
            </div>
          </Card>

          {/* Assigned customers — client component for interactivity */}
          <AgentDetailClient
            agentId={id}
            initialCustomers={assignedCustomers}
          />
        </div>
      </div>
    </div>
  );
}
