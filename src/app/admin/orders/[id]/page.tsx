import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { ShipmentCard } from "@/components/admin/ShipmentCard";
import {
  ArrowRight,
  User,
  Phone,
  Mail,
  Building2,
  Download,
  FileSpreadsheet,
  UserCheck,
} from "lucide-react";

const statusMap: Record<string, { label: string; variant: "green" | "navy" | "gold" | "gray" | "red" | "orange" }> = {
  NEW: { label: "חדש", variant: "navy" },
  WAITING_PAYMENT: { label: "ממתין לתשלום", variant: "orange" },
  PAID: { label: "שולם", variant: "gold" },
  IN_PRODUCTION: { label: "בייצור", variant: "gold" },
  READY: { label: "מוכן", variant: "green" },
  SHIPPED: { label: "נשלח", variant: "green" },
  DELIVERED: { label: "נמסר", variant: "green" },
  COMPLETED: { label: "הושלם", variant: "gray" },
  CANCELLED: { label: "בוטל", variant: "red" },
};

const STATUS_FLOW = [
  "NEW",
  "WAITING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "READY",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

const STATUS_LABELS: Record<string, string> = {
  NEW: "חדש",
  WAITING_PAYMENT: "ממתין",
  PAID: "שולם",
  IN_PRODUCTION: "בייצור",
  READY: "מוכן",
  SHIPPED: "נשלח",
  DELIVERED: "נמסר",
  COMPLETED: "הושלם",
};

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: { select: { name: true, sku: true } } } },
      uploads: true,
      shipments: { orderBy: { createdAt: "desc" }, take: 1 },
      agent: true,
      quote: { select: { id: true, quoteNumber: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const s = statusMap[order.status] ?? { label: order.status, variant: "gray" as const };
  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discount);
  const shipping = Number(order.shippingCost);
  const total = Number(order.total);
  const totalCost = Number(order.totalCost);
  const profit = Number(order.profit);
  const profitPct = total > 0 ? ((profit / total) * 100).toFixed(1) : "0";

  const latestShipment = order.shipments[0] ?? null;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 transition">
            <ArrowRight size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-xl font-bold text-[#0F2747]"
                style={{ fontFamily: "'Ploni', sans-serif" }}
              >
                {order.orderNumber}
              </h1>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              נוצר ב-{formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {order.quote && (
          <Link
            href={`/admin/quotes/${order.quote.id}`}
            className="text-xs text-[#B08D57] hover:underline font-medium"
          >
            הצעת מחיר: {order.quote.quoteNumber}
          </Link>
        )}
      </div>

      {/* Status stepper */}
      {!isCancelled && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4">
          <div className="flex items-center justify-between overflow-x-auto gap-1">
            {STATUS_FLOW.map((step, i) => {
              const reached = i <= currentStepIndex;
              const isActive = i === currentStepIndex;
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 min-w-[52px]">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isActive
                          ? "bg-[#0F2747] text-white ring-2 ring-[#0F2747] ring-offset-2"
                          : reached
                          ? "bg-[#B08D57] text-white"
                          : "border-2 border-gray-200 text-gray-300"
                      }`}
                    >
                      {reached ? (isActive ? i + 1 : "✓") : i + 1}
                    </div>
                    <span className={`text-[10px] text-center leading-tight ${reached ? "text-gray-700 font-medium" : "text-gray-300"}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div
                      className={`h-0.5 w-6 mx-1 mt-[-12px] ${
                        i < currentStepIndex ? "bg-[#B08D57]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left column — 60% */}
        <div className="lg:col-span-3 space-y-5">

          {/* Customer card */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0F2747] mb-3 flex items-center gap-2">
              <User size={15} className="text-[#B08D57]" />
              פרטי לקוח
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">שליח</p>
                <p className="font-semibold text-gray-900">{order.customer.shaliachName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 size={11} /> בית חב&quot;ד
                </p>
                <p className="font-medium text-gray-800">{order.customer.chabadHouseName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone size={11} /> טלפון
                </p>
                <a href={`tel:${order.customer.phone}`} className="font-medium text-[#0F2747] hover:underline">
                  {order.customer.phone}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail size={11} /> אימייל
                </p>
                <a href={`mailto:${order.customer.email}`} className="font-medium text-[#0F2747] hover:underline text-xs">
                  {order.customer.email}
                </a>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#0F2747]">פריטי הזמנה</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">מוצר</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600">כמות</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">מחיר יחידה</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">עלות</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">סה&quot;כ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.product?.sku && (
                        <p className="text-xs text-gray-400 font-mono">{item.product.sku}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-left">{formatCurrency(Number(item.unitPrice))}</td>
                    <td className="px-4 py-3 text-left text-gray-500">{formatCurrency(Number(item.unitCost))}</td>
                    <td className="px-4 py-3 text-left font-semibold">{formatCurrency(Number(item.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Excel uploads */}
          {order.uploads.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[#0F2747] mb-3 flex items-center gap-2">
                <FileSpreadsheet size={15} className="text-[#B08D57]" />
                קבצי Excel שהועלו
              </h2>
              <ul className="space-y-2">
                {order.uploads.map((upload) => (
                  <li key={upload.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{upload.filename}</span>
                    <a
                      href={upload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#0F2747] text-xs hover:underline font-medium"
                    >
                      <Download size={13} />
                      הורד
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {(order.notes || order.internalNote) && (
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5 space-y-3">
              {order.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">הערות להזמנה</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{order.notes}</p>
                </div>
              )}
              {order.internalNote && (
                <div>
                  <p className="text-xs font-medium text-[#B08D57] mb-1">הערה פנימית</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line bg-amber-50 p-3 rounded-sm">
                    {order.internalNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — 40% */}
        <div className="lg:col-span-2 space-y-5">

          {/* Financial summary */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0F2747] mb-4">סיכום כספי</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>סכום ביניים</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>הנחה</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>משלוח</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                <span>סה&quot;כ לתשלום</span>
                <span className="text-[#0F2747]">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>עלות כוללת</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-green-700 bg-green-50 rounded-sm px-2 py-1.5 mt-1">
                <span>רווח גולמי</span>
                <span>
                  {formatCurrency(profit)}{" "}
                  <span className="text-xs font-normal text-green-600">({profitPct}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status management */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0F2747] mb-4">עדכון סטטוס</h2>
            <OrderStatusUpdater
              orderId={order.id}
              currentStatus={order.status}
              currentPaymentStatus={order.paymentStatus}
            />
          </div>

          {/* Shipment card */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <ShipmentCard orderId={order.id} shipment={latestShipment} />
          </div>

          {/* Agent info */}
          {order.agent && (
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[#0F2747] mb-3 flex items-center gap-2">
                <UserCheck size={15} className="text-[#B08D57]" />
                סוכן
              </h2>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900">{order.agent.name}</p>
                <p className="text-gray-500">{order.agent.phone}</p>
                <p className="text-gray-500 text-xs">{order.agent.email}</p>
                <div className="flex justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">עמלה ({Number(order.agent.commissionRate)}%)</span>
                  <span className="font-semibold text-[#B08D57]">
                    {formatCurrency(Number(order.agentCommission))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
