"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Search, UserPlus } from "lucide-react";

interface Customer {
  id: string;
  shaliachName: string;
  chabadHouseName: string;
  phone: string;
}

interface AssignedCustomer {
  id: string;
}

interface Props {
  agentId: string;
  assignedCustomers: AssignedCustomer[];
  onAssigned: () => void;
}

export function AssignCustomerForm({ agentId, assignedCustomers, onAssigned }: Props) {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data) => {
        const assignedIds = new Set(assignedCustomers.map((c) => c.id));
        setAllCustomers(
          (data as Customer[]).filter((c) => !assignedIds.has(c.id))
        );
      })
      .catch(console.error);
  }, [assignedCustomers]);

  const filtered = allCustomers.filter(
    (c) =>
      c.shaliachName.includes(search) ||
      c.chabadHouseName.includes(search) ||
      c.phone.includes(search)
  );

  async function handleAssign() {
    if (!selectedId) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה בשיוך");
        return;
      }
      setSelectedId("");
      setSearch("");
      onAssigned();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חפש לקוח..."
          className="w-full border border-gray-200 rounded-sm text-sm py-2 pr-9 pl-3 focus:outline-none focus:ring-1 focus:ring-[#B08D57] focus:border-[#B08D57]"
        />
      </div>

      {/* Customer list */}
      {search && filtered.length > 0 && (
        <div className="border border-gray-200 rounded-sm divide-y divide-gray-100 max-h-52 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedId(c.id);
                setSearch(c.shaliachName + " – " + c.chabadHouseName);
              }}
              className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 flex flex-col ${
                selectedId === c.id ? "bg-amber-50" : ""
              }`}
            >
              <span className="font-medium">{c.shaliachName}</span>
              <span className="text-xs text-gray-500">{c.chabadHouseName}</span>
            </button>
          ))}
        </div>
      )}
      {search && filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">לא נמצאו לקוחות</p>
      )}

      <Button
        variant="gold"
        size="sm"
        className="w-full"
        disabled={!selectedId}
        loading={loading}
        onClick={handleAssign}
      >
        <UserPlus size={14} />
        שייך לקוח
      </Button>
    </div>
  );
}
