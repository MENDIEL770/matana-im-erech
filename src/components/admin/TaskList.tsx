"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  dueDate: string | Date | null;
  isCompleted: boolean;
  assignedTo: string | null;
}

interface TaskListProps {
  leadId: string;
  initialTasks: Task[];
}

function isOverdue(task: Task): boolean {
  if (task.isCompleted || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date();
}

export function TaskList({ leadId, initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function toggleTask(taskId: string, isCompleted: boolean) {
    // Optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted } : t))
    );

    startTransition(async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}/tasks?taskId=${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted }),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      } catch {
        // rollback
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !isCompleted } : t))
        );
      }
    });
  }

  async function addTask() {
    if (!newTitle.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle.trim(),
            dueDate: newDueDate || undefined,
          }),
        });
        if (!res.ok) throw new Error("שגיאה ביצירת משימה");
        const task = await res.json();
        setTasks((prev) => [...prev, task]);
        setNewTitle("");
        setNewDueDate("");
        setShowForm(false);
      } catch {
        setError("שגיאה ביצירת משימה");
      }
    });
  }

  const pending = tasks.filter((t) => !t.isCompleted);
  const completed = tasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#0F2747] font-['Ploni']">
          משימות
          {pending.length > 0 && (
            <span className="mr-2 text-xs bg-[#B08D57] text-white rounded-full px-2 py-0.5">
              {pending.length}
            </span>
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          + הוסף משימה
        </Button>
      </div>

      {/* Add task inline form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 space-y-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="כותרת המשימה..."
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            autoFocus
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="flex-1"
              dir="ltr"
            />
            <Button variant="gold" size="sm" onClick={addTask} loading={isPending}>
              שמור
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setNewTitle("");
                setNewDueDate("");
              }}
            >
              ביטול
            </Button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 text-center py-4">אין משימות</p>
      ) : (
        <div className="space-y-2">
          {/* Pending tasks */}
          {pending.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-sm border transition-colors",
                isOverdue(task)
                  ? "border-red-200 bg-red-50"
                  : "border-gray-100 bg-white hover:bg-gray-50"
              )}
            >
              <input
                type="checkbox"
                checked={false}
                onChange={() => toggleTask(task.id, true)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#B08D57] focus:ring-[#B08D57] cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", isOverdue(task) ? "text-red-700" : "text-gray-800")}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className={cn("text-xs mt-0.5", isOverdue(task) ? "text-red-500 font-medium" : "text-gray-400")}>
                    {isOverdue(task) ? "⚠ " : ""}תאריך יעד: {formatDate(task.dueDate)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Completed tasks */}
          {completed.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-gray-400 mb-2">הושלמו ({completed.length})</p>
              {completed.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-sm border border-gray-100 bg-white opacity-60 mb-2"
                >
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleTask(task.id, false)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#B08D57] cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 line-through">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(task.dueDate)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
