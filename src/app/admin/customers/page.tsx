import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Users } from "lucide-react";

const tierMap = {
  GOLD: { label: "זהב 🥇", variant: "gold" as const },
  SILVER: { label: "כסף 🥈", variant: "gray" as const },
  REGULAR: { label: "רגיל", variant: "navy" as const },
};

async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { totalSpent: "desc" },
    });
  } catch { return []; }
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2747]">לקוחות</h1>
          <p className="text-sm text-gray-500">{customers.length} לקוחות רשומים</p>
        </div>
      </div>

      <Card padding="none">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="font-medium">אין לקוחות עדיין</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">בית חב"ד</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">שליח</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">טלפון</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">הזמנות</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סה"כ רכישות</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">דרגה</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">הצטרף</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => {
                  const tier = tierMap[c.tier];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{c.chabadHouseName}</td>
                      <td className="px-4 py-3 text-gray-700">{c.shaliachName}</td>
                      <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                      <td className="px-4 py-3 text-gray-700">{c._count.orders}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(Number(c.totalSpent))}</td>
                      <td className="px-4 py-3"><Badge variant={tier.variant}>{tier.label}</Badge></td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/customers/${c.id}`}>
                          <Button variant="ghost" size="sm">פרטים</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
