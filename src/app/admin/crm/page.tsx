import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { UserCheck, Plus, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";

type FilterType = "all" | "active" | "won" | "lost";

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

const PIPELINE_STAGES = ["NEW", "CONTACTED", "WAITING", "QUOTE_SENT", "NEGOTIATION", "WON", "LOST"] as const;

const ACTIVE_STATUSES = ["NEW", "CONTACTED", "WAITING", "QUOTE_SENT", "NEGOTIATION"];

async function getLeads() {
  try {
    return await prisma.lead.findMany({
      include: {
        customer: true,
        activities: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function CRMPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const activeFilter = filter as FilterType;

  const allLeads = await getLeads();

  const filteredLeads = allLeads.filter((lead) => {
    if (activeFilter === "active") return ACTIVE_STATUSES.includes(lead.status);
    if (activeFilter === "won") return lead.status === "WON";
    if (activeFilter === "lost") return lead.status === "LOST";
    return true;
  });

  // Pipeline counts
  const stageCounts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s] = allLeads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const activeCount = allLeads.filter((l) => ACTIVE_STATUSES.includes(l.status)).length;
  const wonCount = stageCounts.WON;
  const lostCount = stageCounts.LOST;

  // Total expected value of active leads
  const totalExpected = allLeads
    .filter((l) => ACTIVE_STATUSES.includes(l.status) && l.expectedValue)
    .reduce((sum, l) => sum + Number(l.expectedValue), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2747] font-['Ploni']">CRM — ניהול לידים</h1>
          <p className="text-sm text-gray-500">{allLeads.length} לידים סה&quot;כ</p>
        </div>
        <Link href="/admin/crm/new">
          <Button variant="gold">
            <Plus size={16} />
            ליד חדש
          </Button>
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp size={18} className="text-[#B08D57]" />
          </div>
          <p className="text-2xl font-bold text-[#0F2747]">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">לידים פעילים</p>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock size={18} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-[#0F2747]">{stageCounts.QUOTE_SENT ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">הצעות פתוחות</p>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-[#0F2747]">{wonCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">נסגרו</p>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center mb-1">
            <XCircle size={18} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-[#0F2747]">{lostCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">אבדו</p>
        </Card>
      </div>

      {/* Pipeline bar */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">צינור מכירות</p>
          {totalExpected > 0 && (
            <p className="text-xs text-gray-500">
              ערך פוטנציאלי:{" "}
              <span className="font-semibold text-[#B08D57]">{formatCurrency(totalExpected)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {PIPELINE_STAGES.map((stage) => {
            const count = stageCounts[stage] ?? 0;
            const s = STATUS_MAP[stage];
            return (
              <div key={stage} className="flex items-center gap-1.5">
                <Badge variant={s.variant}>{s.label}</Badge>
                <span className="text-xs font-bold text-gray-700">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(
          [
            { key: "all", label: "כל הלידים", count: allLeads.length },
            { key: "active", label: "פעילים", count: activeCount },
            { key: "won", label: "נסגרו", count: wonCount },
            { key: "lost", label: "אבדו", count: lostCount },
          ] as const
        ).map(({ key, label, count }) => (
          <Link
            key={key}
            href={`/admin/crm?filter=${key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === key
                ? "border-[#B08D57] text-[#B08D57]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            <span className="mr-1.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Leads table */}
      <Card padding="none">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <UserCheck size={48} className="mb-3 opacity-30" />
            <p className="font-medium">אין לידים להצגה</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">בית חב&quot;ד</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">איש קשר</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">טלפון</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">ערך צפוי</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">פעילות אחרונה</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תאריך</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const s = STATUS_MAP[lead.status];
                  const lastActivity = lead.activities[0];
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#0F2747]">{lead.chabadHouse}</td>
                      <td className="px-4 py-3 text-gray-700">{lead.contactName}</td>
                      <td className="px-4 py-3 text-gray-600" dir="ltr">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {lead.expectedValue
                          ? formatCurrency(lead.expectedValue.toString())
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">
                        {lastActivity ? lastActivity.content.slice(0, 45) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/crm/${lead.id}`}>
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
