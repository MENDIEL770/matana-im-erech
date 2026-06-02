import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Users, TrendingUp } from "lucide-react";

async function getAgentsData() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: { select: { orders: true, agentCustomers: true } },
        orders: {
          select: {
            total: true,
            agentCommission: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return agents.map((agent) => {
      const monthOrders = agent.orders.filter(
        (o) => new Date(o.createdAt) >= startOfMonth
      );
      return {
        id: agent.id,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        commissionRate: Number(agent.commissionRate),
        isActive: agent.isActive,
        totalOrders: agent._count.orders,
        totalCustomers: agent._count.agentCustomers,
        monthCommission: monthOrders.reduce(
          (s, o) => s + Number(o.agentCommission),
          0
        ),
      };
    });
  } catch {
    return [];
  }
}

export default async function AgentsPage() {
  const agents = await getAgentsData();

  const activeAgents = agents.filter((a) => a.isActive).length;
  const totalMonthCommission = agents.reduce(
    (s, a) => s + a.monthCommission,
    0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-['Ploni'] font-bold text-[#0F2747]">
            סוכנים ועמלות
          </h1>
          <p className="text-sm text-gray-500">{agents.length} סוכנים במערכת</p>
        </div>
        <Link href="/admin/agents/new">
          <Button variant="gold">+ סוכן חדש</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#0F2747]/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-[#0F2747]" />
          </div>
          <div>
            <p className="text-xs text-gray-500">סה"כ סוכנים פעילים</p>
            <p className="text-2xl font-bold text-[#0F2747]">{activeAgents}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#B08D57]/10 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-[#B08D57]" />
          </div>
          <div>
            <p className="text-xs text-gray-500">עמלות החודש הנוכחי</p>
            <p className="text-2xl font-bold text-[#B08D57]">
              {formatCurrency(totalMonthCommission)}
            </p>
          </div>
        </Card>
      </div>

      {/* Agents Table */}
      <Card padding="none">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="font-medium">אין סוכנים עדיין</p>
            <Link href="/admin/agents/new" className="mt-3">
              <Button variant="gold" size="sm">הוסף סוכן ראשון</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">שם</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">טלפון</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">אחוז עמלה</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">לקוחות</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">הזמנות</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">עמלה החודש</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#0F2747]">
                      {agent.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dir-ltr">
                      {agent.phone}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {agent.commissionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {agent.totalCustomers}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {agent.totalOrders}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#B08D57]">
                      {formatCurrency(agent.monthCommission)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={agent.isActive ? "green" : "gray"}>
                        {agent.isActive ? "פעיל" : "לא פעיל"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/agents/${agent.id}`}>
                        <Button variant="ghost" size="sm">פרטים</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
