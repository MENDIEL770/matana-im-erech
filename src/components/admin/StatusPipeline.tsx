"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "WAITING"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

interface StatusPipelineProps {
  leadId: string;
  currentStatus: string;
}

const STATUSES: { value: LeadStatus; label: string; color: string; activeColor: string }[] = [
  { value: "NEW", label: "חדש", color: "text-gray-500 border-gray-200 hover:border-blue-300", activeColor: "bg-blue-100 border-blue-400 text-blue-800 font-semibold" },
  { value: "CONTACTED", label: "פנינו", color: "text-gray-500 border-gray-200 hover:border-amber-300", activeColor: "bg-amber-100 border-amber-400 text-amber-800 font-semibold" },
  { value: "WAITING", label: "ממתין", color: "text-gray-500 border-gray-200 hover:border-orange-300", activeColor: "bg-orange-100 border-orange-400 text-orange-700 font-semibold" },
  { value: "QUOTE_SENT", label: "הצעה נשלחה", color: "text-gray-500 border-gray-200 hover:border-amber-300", activeColor: "bg-amber-100 border-amber-400 text-amber-800 font-semibold" },
  { value: "NEGOTIATION", label: "משא ומתן", color: "text-gray-500 border-gray-200 hover:border-orange-300", activeColor: "bg-orange-100 border-orange-400 text-orange-700 font-semibold" },
  { value: "WON", label: "נסגר ✓", color: "text-gray-500 border-gray-200 hover:border-green-300", activeColor: "bg-green-100 border-green-500 text-green-800 font-semibold" },
  { value: "LOST", label: "אבוד", color: "text-gray-500 border-gray-200 hover:border-red-300", activeColor: "bg-red-100 border-red-400 text-red-700 font-semibold" },
];

export function StatusPipeline({ leadId, currentStatus }: StatusPipelineProps) {
  const [status, setStatus] = useState<string>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(newStatus: LeadStatus) {
    if (newStatus === status) return;
    const prevStatus = status;
    setStatus(newStatus);
    setError(null);

    startTransition(async () => {
      try {
        // Update lead status
        const res = await fetch(`/api/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("שגיאה בעדכון סטטוס");

        // Add STATUS_CHANGE activity
        const prevLabel = STATUSES.find((s) => s.value === prevStatus)?.label ?? prevStatus;
        const newLabel = STATUSES.find((s) => s.value === newStatus)?.label ?? newStatus;
        await fetch(`/api/leads/${leadId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "STATUS_CHANGE",
            content: `סטטוס שונה מ"${prevLabel}" ל"${newLabel}"`,
          }),
        });
      } catch {
        setStatus(prevStatus);
        setError("שגיאה בעדכון סטטוס");
      }
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-3">צינור מכירות</p>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => changeStatus(s.value)}
            disabled={isPending}
            className={cn(
              "px-3 py-1.5 text-xs border rounded-sm transition-all duration-150 cursor-pointer",
              status === s.value ? s.activeColor : s.color,
              "disabled:opacity-60"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
