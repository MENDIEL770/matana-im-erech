import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeadTimeline } from "@/components/admin/LeadTimeline";
import { TaskList } from "@/components/admin/TaskList";
import { StatusPipeline } from "@/components/admin/StatusPipeline";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowRight, Phone, Mail, Building2, FileText, UserPlus } from "lucide-react";

type Params = Promise<{ id: string }>;

const STATUS_MAP: Record<string, { label: string; variant: "green" | "navy" | "gold" | "gray" | "red" | "orange" }> = {
  NEW: { label: "חדש", variant: "navy" },
  CONTACTED: { label: "פנינו", variant: "gold" },
  WAITING: { label: "ממתין", variant: "orange" },
  QUOTE_SENT: { label: "הצעה נשלחה", variant: "gold" },
  NEGOTIATION: { label: "משא ומתן", variant: "orange" },
  WON: { label: "נסגר", variant: "green" },
  LOST: { label: "אבוד", variant: "red" },
  CANCELLED: { label: "בוטל", variant: "gray" },
};

const SOURCE_LABEL: Record<string, string> = {
  אתר: "אתר",
  המלצה: "המלצה",
  WhatsApp: "WhatsApp",
  פייסבוק: "פייסבוק",
  אחר: "אחר",
  website: "אתר",
};

async function getLead(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          quotes: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      },
      activities: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "asc" } },
    },
  });
  return lead;
}

export default async function LeadDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) notFound();

  // Serialize Decimals
  const expectedValueStr = lead.expectedValue ? lead.expectedValue.toString() : null;
  const status = STATUS_MAP[lead.status] ?? STATUS_MAP.NEW;

  // Serialize activities
  const serializedActivities = lead.activities.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  // Serialize tasks
  const serializedTasks = lead.tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }));

  // Serialize quotes
  const quotes = lead.customer?.quotes ?? [];
  const serializedQuotes = quotes.map((q) => ({
    id: q.id,
    quoteNumber: q.quoteNumber,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
    total: q.total ? q.total.toString() : null,
  }));

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/admin/crm" className="text-gray-400 hover:text-gray-600">
          <ArrowRight size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F2747] font-['Ploni']">
              {lead.chabadHouse}
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-sm text-gray-500">{lead.contactName}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/quotes/new?leadId=${lead.id}`}>
            <Button variant="outline" size="sm">
              <FileText size={14} />
              צור הצעת מחיר
            </Button>
          </Link>
          {!lead.customerId && (
            <ConvertToCustomerButton leadId={lead.id} />
          )}
        </div>
      </div>

      {/* Status pipeline */}
      <StatusPipeline leadId={lead.id} currentStatus={lead.status} />

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT — 60% */}
        <div className="lg:col-span-3 space-y-5">
          {/* Lead header card */}
          <Card>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={16} className="text-[#B08D57]" />
                <span className="font-medium text-gray-800">{lead.chabadHouse}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-[#B08D57]" />
                <a
                  href={`tel:${lead.phone}`}
                  className="text-gray-700 hover:text-[#0F2747] dir-ltr"
                  dir="ltr"
                >
                  {lead.phone}
                </a>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-[#B08D57]" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-gray-700 hover:text-[#0F2747]"
                  >
                    {lead.email}
                  </a>
                </div>
              )}
            </div>
            {lead.notes && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-sm px-3 py-2 border border-gray-100">
                {lead.notes}
              </p>
            )}
          </Card>

          {/* Activity timeline */}
          <Card>
            <LeadTimeline leadId={lead.id} initialActivities={serializedActivities} />
          </Card>
        </div>

        {/* RIGHT — 40% */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lead details */}
          <Card>
            <h3 className="text-base font-semibold text-[#0F2747] mb-4 font-['Ploni']">פרטי ליד</h3>
            <dl className="space-y-3 text-sm">
              {expectedValueStr && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">ערך צפוי</dt>
                  <dd className="font-medium text-[#0F2747]">{formatCurrency(expectedValueStr)}</dd>
                </div>
              )}
              {lead.source && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">מקור</dt>
                  <dd className="text-gray-700">{SOURCE_LABEL[lead.source] ?? lead.source}</dd>
                </div>
              )}
              {lead.assignedTo && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">מוקצה ל</dt>
                  <dd className="text-gray-700">{lead.assignedTo}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">תאריך יצירה</dt>
                <dd className="text-gray-700">{formatDate(lead.createdAt)}</dd>
              </div>
              {lead.customer && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">לקוח</dt>
                  <dd>
                    <Link
                      href={`/admin/customers/${lead.customer.id}`}
                      className="text-[#B08D57] hover:underline"
                    >
                      {lead.customer.chabadHouseName}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Tasks */}
          <Card>
            <TaskList leadId={lead.id} initialTasks={serializedTasks} />
          </Card>

          {/* Related quotes */}
          {serializedQuotes.length > 0 && (
            <Card>
              <h3 className="text-base font-semibold text-[#0F2747] mb-3 font-['Ploni']">הצעות מחיר</h3>
              <div className="space-y-2">
                {serializedQuotes.map((q) => (
                  <Link
                    key={q.id}
                    href={`/admin/quotes/${q.id}`}
                    className="flex items-center justify-between p-2 rounded-sm hover:bg-gray-50 border border-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-[#0F2747]">{q.quoteNumber}</span>
                    <div className="flex items-center gap-2">
                      {q.total && <span className="text-xs text-gray-500">{formatCurrency(q.total)}</span>}
                      <QuoteStatusBadge status={q.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Small server-safe components ----

function QuoteStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "green" | "navy" | "gold" | "gray" | "red" | "orange" }> = {
    DRAFT: { label: "טיוטה", variant: "gray" },
    SENT: { label: "נשלחה", variant: "gold" },
    ACCEPTED: { label: "אושרה", variant: "green" },
    REJECTED: { label: "נדחתה", variant: "red" },
    EXPIRED: { label: "פגה", variant: "gray" },
  };
  const s = map[status] ?? { label: status, variant: "gray" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// Client component for "convert to customer" — imported inline via use client boundary
function ConvertToCustomerButton({ leadId }: { leadId: string }) {
  // This renders a link-style button; actual conversion logic TBD
  return (
    <Link href={`/admin/customers/new?leadId=${leadId}`}>
      <Button variant="gold" size="sm">
        <UserPlus size={14} />
        הפוך ללקוח
      </Button>
    </Link>
  );
}
