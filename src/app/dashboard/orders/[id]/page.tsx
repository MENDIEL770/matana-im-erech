import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/Badge";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);
}

const ORDER_TIMELINE = [
  { key: "NEW", label: "הזמנה התקבלה" },
  { key: "WAITING_PAYMENT", label: "ממתינה לתשלום" },
  { key: "PAID", label: "תשלום אושר" },
  { key: "IN_PRODUCTION", label: "בייצור" },
  { key: "SHIPPED", label: "נשלחה" },
  { key: "DELIVERED", label: "נמסרה" },
];

const STATUS_ORDER = ["NEW", "WAITING_PAYMENT", "PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "COMPLETED"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const customer = await prisma.customer.findFirst({
    where: { userId: session.id },
    select: { id: true },
  });
  if (!customer) redirect("/dashboard");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shipments: { orderBy: { createdAt: "desc" }, take: 1 },
      payments: { orderBy: { createdAt: "desc" } },
      uploads: true,
    },
  });

  if (!order || order.customerId !== customer.id) notFound();

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const latestShipment = order.shipments[0];

  const paymentStatusLabel: Record<string, string> = {
    PENDING: "ממתין לתשלום",
    PARTIAL: "שולם חלקית",
    PAID: "שולם במלואו",
    REFUNDED: "זוכה",
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm text-[#6B6763] hover:text-[#2E2A26] mb-6 transition-colors"
      >
        → חזרה להזמנות
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#ECE8E2] p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-['Ploni'] text-xl font-bold text-[#2E2A26]">
              הזמנה {order.orderNumber}
            </h1>
            <p className="text-[#6B6763] text-sm mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-[#ECE8E2] p-6 mb-6">
        <h2 className="font-['Ploni'] text-base font-semibold text-[#2E2A26] mb-5">מעקב הזמנה</h2>
        <div className="flex items-center gap-0 overflow-x-auto">
          {ORDER_TIMELINE.map((step, idx) => {
            const stepIndex = STATUS_ORDER.indexOf(step.key);
            const isCompleted = currentStatusIndex >= stepIndex;
            const isCurrent = STATUS_ORDER[currentStatusIndex] === step.key ||
              (order.status === "COMPLETED" && step.key === "DELIVERED");
            return (
              <div key={step.key} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCurrent
                        ? "bg-[#B08D57] border-[#B08D57] text-white"
                        : isCompleted
                        ? "bg-[#B08D57]/20 border-[#B08D57] text-[#B08D57]"
                        : "bg-gray-100 border-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className={`text-xs mt-1.5 text-center max-w-[70px] ${isCompleted ? "text-[#2E2A26]" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
                {idx < ORDER_TIMELINE.length - 1 && (
                  <div
                    className={`h-0.5 w-8 mx-1 mb-5 flex-shrink-0 ${
                      currentStatusIndex > stepIndex ? "bg-[#B08D57]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-[#ECE8E2] p-6 mb-6">
        <h2 className="font-['Ploni'] text-base font-semibold text-[#2E2A26] mb-4">פריטי הזמנה</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#ECE8E2]">
              <th className="text-right pb-3 text-[#6B6763] font-medium">מוצר</th>
              <th className="text-right pb-3 text-[#6B6763] font-medium">כמות</th>
              <th className="text-right pb-3 text-[#6B6763] font-medium">מחיר ליחידה</th>
              <th className="text-right pb-3 text-[#6B6763] font-medium">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-[#ECE8E2] last:border-0">
                <td className="py-3 text-[#2E2A26] font-medium">{item.name}</td>
                <td className="py-3 text-[#6B6763]">{item.quantity}</td>
                <td className="py-3 text-[#6B6763]">{formatCurrency(Number(item.unitPrice))}</td>
                <td className="py-3 text-[#2E2A26]">{formatCurrency(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 pt-4 border-t border-[#ECE8E2] space-y-2">
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-[#6B6763]">
              <span>הנחה</span>
              <span>- {formatCurrency(Number(order.discount))}</span>
            </div>
          )}
          {Number(order.shippingCost) > 0 && (
            <div className="flex justify-between text-sm text-[#6B6763]">
              <span>משלוח</span>
              <span>{formatCurrency(Number(order.shippingCost))}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-[#2E2A26]">
            <span>סה"כ לתשלום</span>
            <span>{formatCurrency(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-[#ECE8E2] p-6">
          <h2 className="font-['Ploni'] text-base font-semibold text-[#2E2A26] mb-3">פרטי משלוח</h2>
          {latestShipment ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6763]">ספק</span>
                <span className="text-[#2E2A26]">{latestShipment.provider ?? "—"}</span>
              </div>
              {latestShipment.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-[#6B6763]">מספר מעקב</span>
                  <span className="text-[#2E2A26] font-mono">{latestShipment.trackingNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6B6763]">סטטוס</span>
                <span className="text-[#2E2A26]">{latestShipment.status}</span>
              </div>
              {latestShipment.estimatedDate && (
                <div className="flex justify-between">
                  <span className="text-[#6B6763]">תאריך משוער</span>
                  <span className="text-[#2E2A26]">{formatDate(latestShipment.estimatedDate)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#6B6763] text-sm">פרטי משלוח יעודכנו בקרוב</p>
          )}

          {order.shippingAddress && typeof order.shippingAddress === "object" && (
            <div className="mt-4 pt-4 border-t border-[#ECE8E2]">
              <p className="text-xs text-[#6B6763] mb-1">כתובת משלוח</p>
              <p className="text-sm text-[#2E2A26]">
                {JSON.stringify(order.shippingAddress)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#ECE8E2] p-6">
          <h2 className="font-['Ploni'] text-base font-semibold text-[#2E2A26] mb-3">סטטוס תשלום</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6B6763] text-sm">סטטוס</span>
              <Badge variant={
                order.paymentStatus === "PAID" ? "green" :
                order.paymentStatus === "PARTIAL" ? "gold" :
                order.paymentStatus === "REFUNDED" ? "red" : "navy"
              }>
                {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
              </Badge>
            </div>
            {order.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between text-sm border-t border-[#ECE8E2] pt-2">
                <span className="text-[#6B6763]">{payment.method}</span>
                <span className="text-[#2E2A26] font-medium">{formatCurrency(Number(payment.amount))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Uploads */}
      {order.uploads.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#ECE8E2] p-6 mb-6">
          <h2 className="font-['Ploni'] text-base font-semibold text-[#2E2A26] mb-3">קבצים מצורפים</h2>
          <div className="space-y-2">
            {order.uploads.map((upload) => (
              <a
                key={upload.id}
                href={upload.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#ECE8E2] hover:bg-[#FAF8F5] transition-colors text-sm text-[#B08D57] hover:underline"
              >
                <span>📎</span>
                {upload.filename}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
