import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import QuoteActions from "./QuoteActions";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; variant: "green" | "navy" | "gold" | "gray" | "red" | "orange" }> = {
  DRAFT: { label: "טיוטה", variant: "gray" },
  SENT: { label: "נשלחה", variant: "navy" },
  APPROVED: { label: "אושרה", variant: "green" },
  REJECTED: { label: "נדחתה", variant: "red" },
  EXPIRED: { label: "פגה תוקף", variant: "red" },
  CONVERTED: { label: "הומרה להזמנה", variant: "gold" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
        orderBy: { id: "asc" },
      },
      order: { select: { id: true, orderNumber: true, status: true } },
    },
  });

  if (!quote) notFound();

  // Serialize Decimal fields
  const q = JSON.parse(JSON.stringify(quote));

  const status = STATUS_MAP[q.status] ?? { label: q.status, variant: "gray" as const };
  const subtotal = Number(q.subtotal);
  const total = Number(q.total);
  const discount = Number(q.discount);
  const totalCost = Number(q.totalCost);
  const profit = Number(q.profit);
  const profitPct = total > 0 ? Math.round((profit / total) * 1000) / 10 : 0;
  const discountDisplay =
    q.discountType === "PERCENT"
      ? `${discount}%`
      : formatCurrency(discount);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FAF8F5] py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6B6763]">
          <Link href="/admin/quotes" className="hover:text-[#2E2A26]">הצעות מחיר</Link>
          <span>/</span>
          <span className="text-[#2E2A26] font-medium">{q.quoteNumber}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-['Ploni'] text-2xl font-bold text-[#2E2A26]">{q.quoteNumber}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-[#6B6763]">
              נוצרה ב־{formatDate(q.createdAt)}
              {q.validUntil && ` · בתוקף עד ${formatDate(q.validUntil)}`}
            </p>
          </div>

          {/* Action buttons — client component */}
          <QuoteActions
            quoteId={q.id}
            status={q.status}
            orderId={q.order?.id}
            orderNumber={q.order?.orderNumber}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Customer card */}
            <div className="bg-white border border-[#ECE8E2] p-5 space-y-2">
              <p className="text-xs uppercase tracking-widest text-[#6B6763]">לקוח</p>
              <p className="font-semibold text-[#2E2A26] text-lg">{q.customer.shaliachName}</p>
              <p className="text-sm text-[#6B6763]">{q.customer.chabadHouseName}</p>
              <div className="flex gap-4 text-xs text-[#6B6763] pt-1">
                <span>{q.customer.email}</span>
                {q.customer.phone && <span>{q.customer.phone}</span>}
                {q.customer.city && <span>{q.customer.city}</span>}
              </div>
            </div>

            {/* Items table */}
            <div className="bg-white border border-[#ECE8E2] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#ECE8E2]">
                <p className="text-xs uppercase tracking-widest text-[#6B6763]">פריטים</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#FAF8F5]">
                  <tr>
                    <th className="text-right px-5 py-3 text-xs font-medium text-[#6B6763]">מוצר</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#6B6763] w-20">כמות</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#6B6763] w-28">מחיר יחידה</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#6B6763] w-28">עלות</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#6B6763] w-28">סה&quot;כ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8E2]">
                  {q.items.map((item: {
                    id: string;
                    name: string;
                    description?: string;
                    quantity: number;
                    unitPrice: number;
                    unitCost: number;
                    total: number;
                    product?: { images?: { url: string }[] };
                  }) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#2E2A26]">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-[#6B6763] mt-0.5">{item.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-[#2E2A26]">{item.quantity}</td>
                      <td className="px-4 py-4 text-center text-[#2E2A26]">
                        {formatCurrency(Number(item.unitPrice))}
                      </td>
                      <td className="px-4 py-4 text-center text-[#6B6763] text-xs">
                        {formatCurrency(Number(item.unitCost))}
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-[#2E2A26]">
                        {formatCurrency(Number(item.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {(q.notes || q.internalNote) && (
              <div className="bg-white border border-[#ECE8E2] p-5 space-y-4">
                {q.notes && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#6B6763] mb-1">הערות ללקוח</p>
                    <p className="text-sm text-[#2E2A26] whitespace-pre-wrap">{q.notes}</p>
                  </div>
                )}
                {q.internalNote && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#6B6763] mb-1">הערה פנימית</p>
                    <p className="text-sm text-[#2E2A26] whitespace-pre-wrap bg-amber-50 border border-amber-100 px-3 py-2">
                      {q.internalNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Linked order */}
            {q.order && (
              <div className="bg-white border border-[#ECE8E2] p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#6B6763] mb-1">הזמנה מקושרת</p>
                  <p className="font-mono font-semibold text-[#2E2A26]">{q.order.orderNumber}</p>
                </div>
                <Link
                  href={`/admin/orders/${q.order.id}`}
                  className="text-sm text-[#B08D57] underline underline-offset-2"
                >
                  צפה בהזמנה
                </Link>
              </div>
            )}
          </div>

          {/* Right: financial summary */}
          <div className="space-y-5">
            <div className="bg-white border border-[#ECE8E2] p-5 space-y-3 sticky top-6">
              <p className="text-xs uppercase tracking-widest text-[#6B6763] border-b border-[#ECE8E2] pb-3">
                סיכום כספי
              </p>
              <div className="space-y-2 text-sm">
                <Row label='סה"כ מוצרים' value={formatCurrency(subtotal)} />
                {discount > 0 && (
                  <Row
                    label={`הנחה (${discountDisplay})`}
                    value={`−${formatCurrency(q.discountType === "PERCENT" ? (subtotal * discount) / 100 : discount)}`}
                    valueClass="text-red-500"
                  />
                )}
                <div className="border-t border-[#ECE8E2] pt-2 mt-2">
                  <Row
                    label='סה"כ לתשלום'
                    value={formatCurrency(total)}
                    bold
                    valueClass="text-[#B08D57]"
                  />
                </div>
                <Row label="עלות כוללת" value={formatCurrency(totalCost)} labelClass="text-[#6B6763]" />
                <div className="border-t border-[#ECE8E2] pt-2 mt-2">
                  <Row
                    label="רווח גולמי"
                    value={`${formatCurrency(profit)} (${profitPct}%)`}
                    valueClass={profit >= 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white border border-[#ECE8E2] p-5 space-y-2 text-sm">
              <p className="text-xs uppercase tracking-widest text-[#6B6763] mb-2">תאריכים</p>
              <div className="space-y-1.5">
                <Row label="נוצרה" value={formatDate(q.createdAt)} />
                {q.sentAt && <Row label="נשלחה" value={formatDate(q.sentAt)} />}
                {q.approvedAt && <Row label="אושרה" value={formatDate(q.approvedAt)} />}
                {q.validUntil && <Row label="בתוקף עד" value={formatDate(q.validUntil)} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────
function Row({
  label,
  value,
  bold,
  valueClass,
  labelClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
  labelClass?: string;
}) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className={labelClass ?? "text-[#6B6763]"}>{label}</span>
      <span className={valueClass ?? "text-[#2E2A26]"}>{value}</span>
    </div>
  );
}

// Needed so Next.js doesn't try to cache this page
export const dynamic = "force-dynamic";
