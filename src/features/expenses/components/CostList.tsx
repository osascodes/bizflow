"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteExpenseAction } from "@/features/expenses/actions";

type Cost = { id: string; title: string; detail: string; amount: number; at?: string };

export default function CostList({ costs, todayOnly = false }: { costs: Cost[]; todayOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(costs);
  const [pendingId, setPendingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return items.filter((cost) => {
      if (todayOnly && cost.at && new Date(cost.at) < start) return false;
      if (!value) return true;
      return `${cost.title} ${cost.detail}`.toLowerCase().includes(value);
    });
  }, [items, query, todayOnly]);

  useEffect(() => {
    if (!todayOnly) return;
    document.getElementById("costs-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [todayOnly]);

  return (
    <div id="costs-list" className="space-y-3">
      {todayOnly ? <h2 className="text-lg font-semibold text-white">Today's costs</h2> : null}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search costs"
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No matching cost.</div>
      ) : (
        filtered.map((cost) => (
          <div key={cost.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">{cost.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{cost.detail}</p>
              </div>
              <p className="text-sm text-white">₦{cost.amount.toLocaleString()}</p>
            </div>
            <button
              type="button"
              disabled={pendingId === cost.id}
              onClick={async () => {
                setErrorMessage("");
                setPendingId(cost.id);
                const previous = items;
                setItems((current) => current.filter((item) => item.id !== cost.id));
                try {
                  const formData = new FormData();
                  formData.set("id", cost.id);
                  const result = await deleteExpenseAction(formData);
                  if (result?.error) throw new Error(result.error);
                } catch (error: unknown) {
                  setItems(previous);
                  setErrorMessage(error instanceof Error ? error.message : "Could not remove the cost");
                } finally {
                  setPendingId("");
                }
              }}
              className="mt-3 text-sm font-semibold text-red-400"
            >
              {pendingId === cost.id ? "Removing..." : "Remove"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
