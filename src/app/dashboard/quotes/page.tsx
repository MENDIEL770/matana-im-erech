import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { QuoteStatusBadge } from "@/components/dashboard/StatusBadge";
import { ApproveQuoteButton } from "@/components/dashboard/ApproveQuoteButton";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);
}

export default async function QuotesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer = await prisma.customer.findFirst({
    where: { userId: session.id },
    select: { id: true },
  });
  if (!customer) redirect("/dashboard");

  const quotes = await prisma.quote.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimals
  const serialized = quotes.map((q) => ({
    id: q.id,
    quoteNumber: q.quoteNumber,
    createdAt: q.createdAt.toISOString(),
    validUntil: q.validUntil?.toISOString() ?? null,
    total: Number(q.total),
    status: q.status,
  }));

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-['Ploni'] text-2xl font-bold text-[#2E2A26]">הצעות מחיר</h1>
        <p className="text-[#6B6763] mt-1">{quotes.length} הצעות בסך הכל</p>
      </div>

      {serialized.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ECE8E2] p-12 text-center">
          <p className="text-[#6B6763] text-lg">אין הצעות מחיר עדיין</p>
          <p className="text-[#6B6763] text-sm mt-2">הצעות מחיר שתקבל יופיעו כאן</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ECE8E2] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ECE8E2] bg-[#FAF8F5]">
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">מספר הצעה</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">תאריך</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium hidden md:table-cell">תוקף עד</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סכום</th>
                <th className="text-right px-4 py-3 text-[#6B6763] font-medium">סטטוס</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {serialized.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-[#ECE8E2] last:border-0 hover:bg-[#FAF8F5] transition-colors"
                >
                  <td className="px-4 py-4 font-medium text-[#2E2A26]">{quote.quoteNumber}</td>
                  <td className="px-4 py-4 text-[#6B6763]">{formatDate(new Date(quote.createdAt))}</td>
                  <td className="px-4 py-4 text-[#6B6763] hidden md:table-cell">
                    {quote.validUntil ? formatDate(new Date(quote.validUntil)) : "—"}
                  </td>
                  <td className="px-4 py-4 text-[#2E2A26] font-medium">{formatCurrency(quote.total)}</td>
                  <td className="px-4 py-4">
                    <QuoteStatusBadge status={quote.status} />
                  </td>
                  <td className="px-4 py-4">
                    {quote.status === "SENT" && (
                      <ApproveQuoteButton quoteId={quote.id} />
                    )}
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
