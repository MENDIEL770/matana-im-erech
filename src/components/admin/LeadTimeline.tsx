"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/lib/utils";

type ActivityType = "NOTE" | "CALL" | "EMAIL" | "MEETING" | "WHATSAPP" | "STATUS_CHANGE";

interface Activity {
  id: string;
  type: ActivityType;
  content: string;
  createdBy: string | null;
  createdAt: string | Date;
}

interface LeadTimelineProps {
  leadId: string;
  initialActivities: Activity[];
}

const TYPE_OPTIONS = [
  { value: "NOTE", label: "📝 הערה" },
  { value: "CALL", label: "📞 שיחה" },
  { value: "EMAIL", label: "📧 אימייל" },
  { value: "MEETING", label: "🤝 פגישה" },
  { value: "WHATSAPP", label: "💬 WhatsApp" },
];

const TYPE_ICON: Record<ActivityType, string> = {
  NOTE: "📝",
  CALL: "📞",
  EMAIL: "📧",
  MEETING: "🤝",
  WHATSAPP: "💬",
  STATUS_CHANGE: "🔄",
};

const TYPE_LABEL: Record<ActivityType, string> = {
  NOTE: "הערה",
  CALL: "שיחה",
  EMAIL: "אימייל",
  MEETING: "פגישה",
  WHATSAPP: "WhatsApp",
  STATUS_CHANGE: "שינוי סטטוס",
};

export function LeadTimeline({ leadId, initialActivities }: LeadTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [type, setType] = useState<ActivityType>("NOTE");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function addActivity() {
    if (!content.trim()) return;
    setError(null);

    // Optimistic update
    const optimistic: Activity = {
      id: `optimistic-${Date.now()}`,
      type,
      content: content.trim(),
      createdBy: null,
      createdAt: new Date(),
    };
    setActivities((prev) => [optimistic, ...prev]);
    const savedContent = content.trim();
    const savedType = type;
    setContent("");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: savedType, content: savedContent }),
        });

        if (!res.ok) throw new Error("שגיאה בהוספת פעילות");

        const newActivity = await res.json();
        setActivities((prev) =>
          prev.map((a) => (a.id === optimistic.id ? newActivity : a))
        );
      } catch {
        // Rollback optimistic
        setActivities((prev) => prev.filter((a) => a.id !== optimistic.id));
        setError("שגיאה בהוספת פעילות");
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[#0F2747] font-['Ploni']">ציר זמן פעילות</h3>

      {/* Add activity form */}
      <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 space-y-3">
        <div className="flex gap-3">
          <div className="w-44 shrink-0">
            <Select
              options={TYPE_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="תוכן הפעילות..."
            rows={2}
            className="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) addActivity();
            }}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end">
          <Button
            variant="gold"
            size="sm"
            onClick={addActivity}
            loading={isPending}
            disabled={!content.trim()}
          >
            הוסף פעילות
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">אין פעילות עדיין</p>
        ) : (
          activities.map((activity, idx) => (
            <div
              key={activity.id}
              className={`flex gap-3 ${idx === 0 ? "opacity-100" : "opacity-90"}`}
            >
              {/* Icon */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-base">
                {TYPE_ICON[activity.type]}
              </div>
              {/* Content */}
              <div className="flex-1 bg-white border border-gray-100 rounded-sm p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#B08D57]">
                    {TYPE_LABEL[activity.type]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.content}</p>
                {activity.createdBy && (
                  <p className="text-xs text-gray-400 mt-1">— {activity.createdBy}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
