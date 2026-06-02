"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AssignCustomerForm } from "@/components/admin/AssignCustomerForm";
import { Users, X } from "lucide-react";

interface Customer {
  id: string;
  shaliachName: string;
  chabadHouseName: string;
  phone: string;
  email: string;
  tier: string;
  orderCount: number;
  assignedAt: string;
}

const tierMap: Record<string, { label: string; variant: "gold" | "gray" | "navy" }> = {
  GOLD: { label: "זהב", variant: "gold" },
  SILVER: { label: "כסף", variant: "gray" },
  REGULAR: { label: "רגיל", variant: "navy" },
};

interface Props {
  agentId: string;
  initialCustomers: Customer[];
}

export function AgentDetailClient({ agentId, initialCustomers }: Props) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRefresh() {
    const res = await fetch(`/api/agents/${agentId}/customers`);
    if (res.ok) {
      const data = await res.json();
      setCustomers(data);
    }
  }

  async function handleRemove(customerId: string) {
    setRemovingId(customerId);
    try {
      await fetch(`/api/agents/${agentId}/customers?customerId=${customerId}`, {
        method: "DELETE",
      });
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users size={16} />
          לקוחות משויכים ({customers.length})
        </CardTitle>
      </CardHeader>

      {/* Assign form */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-2">שייך לקוח חדש:</p>
        <AssignCustomerForm
          agentId={agentId}
          assignedCustomers={customers}
          onAssigned={handleRefresh}
        />
      </div>

      {/* Customer list */}
      {customers.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          אין לקוחות משויכים
        </p>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => {
            const tier = tierMap[c.tier] ?? tierMap.REGULAR;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded border border-gray-100 hover:border-gray-200 bg-gray-50/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0F2747] truncate">
                    {c.shaliachName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {c.chabadHouseName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={tier.variant} className="text-[10px]">
                      {tier.label}
                    </Badge>
                    <span className="text-[10px] text-gray-400">
                      {c.orderCount} הזמנות
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(c.id)}
                  disabled={removingId === c.id}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors shrink-0 mr-2"
                  title="הסר שיוך"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
