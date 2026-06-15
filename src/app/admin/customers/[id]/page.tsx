import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CustomerEditForm } from "./CustomerEditForm";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
      },
      quotes: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, quoteNumber: true, status: true, total: true, createdAt: true },
      },
      _count: { select: { orders: true, quotes: true } },
    },
  });

  if (!customer) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serialized: any = JSON.parse(JSON.stringify(customer));

  const tierMap = {
    GOLD: { label: "זהב 🥇", variant: "gold" as const },
    SILVER: { label: "כסף 🥈", variant: "gray" as const },
    REGULAR: { label: "רגיל", variant: "navy" as const },
  };

  const statusMap: Record<string, string> = {
    PENDING: "ממתין",
    IN_PRODUCTION: "בייצור",
    READY: "מוכן",
    SHIPPED: "נשלח",
    DELIVERED: "נמסר",
    CANCELLED: "בוטל",
    DRAFT: "טיוטה",
    SENT: "נשלח",
    APPROVED: "אושר",
    REJECTED: "נדחה",
    CONVERTED: "הומר",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/admin/customers" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowRight size={14} /> חזור ללקוחות
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F2747]">{customer.shaliachName}</h1>
            <Badge variant={tierMap[customer.tier].variant}>{tierMap[customer.tier].label}</Badge>
            {!customer.isActive && <Badge variant="gray">לא פעיל</Badge>}
          </div>
          <p className="text-sm text-gray-500">{customer.chabadHouseName}</p>
        </div>
        <div className="text-left space-y-1">
          <p className="text-2xl font-bold text-[#B08D57]">{formatCurrency(Number(customer.totalSpent))}</p>
          <p className="text-xs text-gray-400">סה״כ רכישות • {customer._count.orders} הזמנות</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form — 2/3 */}
        <div className="lg:col-span-2">
          <CustomerEditForm customer={serialized} />
        </div>

        {/* Side info — 1/3 */}
        <div className="space-y-4">
          {/* Status cards */}
          <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">סטטוס</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">הוראת קבע (3%)</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${customer.directDebitInterest ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  {customer.directDebitInterest ? "✅ מעוניין" : "לא"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">עדכונים ומבצעים</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${customer.marketingConsent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                  {customer.marketingConsent ? "✅ כן" : "לא"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">חשבון פעיל</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {customer.isActive ? "✅ פעיל" : "❌ מושהה"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">פרטי קשר</h3>
            <p className="text-sm text-gray-700">📧 <a href={`mailto:${customer.email}`} className="hover:text-[#B08D57]">{customer.email}</a></p>
            <p className="text-sm text-gray-700">📞 <a href={`tel:${customer.phone}`} className="hover:text-[#B08D57]">{customer.phone}</a></p>
            {customer.country && <p className="text-sm text-gray-700">🌍 {customer.country}</p>}
            {customer.address && <p className="text-sm text-gray-500 text-xs">{customer.address}</p>}
            <p className="text-xs text-gray-400 pt-1">לקוח מאז {formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      {customer.orders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#0F2747] text-sm">הזמנות אחרונות</h2>
            <Link href={`/admin/orders?customer=${id}`} className="text-xs text-[#B08D57] hover:underline">כל ההזמנות</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">מספר</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">סטטוס</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">סכום</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">תאריך</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customer.orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{o.orderNumber}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{statusMap[o.status] ?? o.status}</span></td>
                  <td className="px-5 py-3 font-semibold text-[#B08D57]">{formatCurrency(Number(o.total))}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="text-xs text-[#B08D57] hover:underline">פתח</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quotes */}
      {customer.quotes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#0F2747] text-sm">הצעות מחיר אחרונות</h2>
            <Link href={`/admin/quotes?customer=${id}`} className="text-xs text-[#B08D57] hover:underline">כל ההצעות</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">מספר</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">סטטוס</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">סכום</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">תאריך</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customer.quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{q.quoteNumber}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{statusMap[q.status] ?? q.status}</span></td>
                  <td className="px-5 py-3 font-semibold text-[#B08D57]">{formatCurrency(Number(q.total))}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(q.createdAt)}</td>
                  <td className="px-5 py-3"><Link href={`/admin/quotes/${q.id}`} className="text-xs text-[#B08D57] hover:underline">פתח</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
