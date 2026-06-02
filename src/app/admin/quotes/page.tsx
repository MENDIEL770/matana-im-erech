import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileText, Plus } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "green" | "navy" | "gold" | "gray" | "red" | "orange" }> = {
  DRAFT: { label: "טיוטה", variant: "gray" },
  SENT: { label: "נשלחה", variant: "navy" },
  APPROVED: { label: "אושרה", variant: "green" },
  REJECTED: { label: "נדחתה", variant: "red" },
  EXPIRED: { label: "פגה תוקף", variant: "red" },
  CONVERTED: { label: "הומרה להזמנה", variant: "gold" },
};

async function getQuotes() {
  try {
    return await prisma.quote.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch { return []; }
}

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2747]">הצעות מחיר</h1>
          <p className="text-sm text-gray-500">{quotes.length} הצעות</p>
        </div>
        <Link href="/admin/quotes/new">
          <Button variant="gold">
            <Plus size={16} />
            הצעת מחיר חדשה
          </Button>
        </Link>
      </div>

      <Card padding="none">
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={48} className="mb-3 opacity-30" />
            <p className="font-medium">אין הצעות מחיר עדיין</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">מספר</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תאריך</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">פריטים</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סכום</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">רווח</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q) => {
                  const s = statusMap[q.status];
                  return (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0F2747]">{q.quoteNumber}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{q.customer.shaliachName}</p>
                          <p className="text-xs text-gray-500">{q.customer.chabadHouseName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(q.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-600">{q.items.length}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(Number(q.total))}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">{formatCurrency(Number(q.profit))}</td>
                      <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/quotes/${q.id}`}>
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
