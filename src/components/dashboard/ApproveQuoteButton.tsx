"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ApproveQuoteButtonProps {
  quoteId: string;
}

export function ApproveQuoteButton({ quoteId }: ApproveQuoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("שגיאה באישור ההצעה");
      }
    } catch {
      alert("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="px-3 py-1.5 bg-[#B08D57] text-white text-xs font-medium rounded-lg hover:bg-[#9a7a4a] disabled:opacity-50 transition-colors"
    >
      {loading ? "מאשר..." : "אשר הצעה"}
    </button>
  );
}
