"use client";

import { useEffect, useState } from "react";
import ExpenseForm from "@/features/expenses/components/ExpenseForm";
import { readCostQueue } from "@/features/expenses/offline";

export default function OfflineCosts() {
  const [queue, setQueue] = useState(readCostQueue());

  useEffect(() => {
    setQueue(readCostQueue());
  }, []);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
      <ExpenseForm offlineMode onQueued={() => setQueue(readCostQueue())} />
      <div className="space-y-3">
        {queue.length === 0 ? (
          <p className="text-sm text-zinc-500">No offline costs waiting.</p>
        ) : (
          queue.map((cost) => (
            <div key={cost.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="font-semibold text-white">{cost.title}</h2>
              <p className="mt-1 text-sm text-amber-300">Waiting to send · {cost.category} · ₦{cost.amount.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
