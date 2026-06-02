import { Badge } from "@/components/ui/Badge";

// Order status
const ORDER_STATUS_MAP: Record<string, { label: string; variant: "navy" | "gold" | "green" | "red" | "gray" }> = {
  NEW: { label: "חדשה", variant: "navy" },
  WAITING_PAYMENT: { label: "ממתינה לתשלום", variant: "navy" },
  PAID: { label: "שולמה", variant: "gold" },
  IN_PRODUCTION: { label: "בייצור", variant: "gold" },
  READY: { label: "מוכנה", variant: "green" },
  SHIPPED: { label: "נשלחה", variant: "green" },
  DELIVERED: { label: "נמסרה", variant: "green" },
  COMPLETED: { label: "הושלמה", variant: "green" },
  CANCELLED: { label: "בוטלה", variant: "red" },
};

// Quote status
const QUOTE_STATUS_MAP: Record<string, { label: string; variant: "navy" | "gold" | "green" | "red" | "gray" }> = {
  DRAFT: { label: "טיוטה", variant: "gray" },
  SENT: { label: "נשלחה", variant: "navy" },
  APPROVED: { label: "אושרה", variant: "green" },
  REJECTED: { label: "נדחתה", variant: "red" },
  EXPIRED: { label: "פגה תוקף", variant: "red" },
  CONVERTED: { label: "הומרה", variant: "gold" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const info = ORDER_STATUS_MAP[status] ?? { label: status, variant: "gray" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function QuoteStatusBadge({ status }: { status: string }) {
  const info = QUOTE_STATUS_MAP[status] ?? { label: status, variant: "gray" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
