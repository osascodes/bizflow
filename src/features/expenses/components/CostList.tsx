"use client";

import { useMemo, useState } from "react";

type Cost = { id: string; title: string; detail: string; amount: number };

export default function CostList({ costs }: { costs: Cost[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return costs;
    return costs.filter((cost) => `${cost.title} ${cost.detail}`.toLowerCase().includes(value));
  }, [costs, query]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search costs"
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
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
          </div>
        ))
      )}
    </div>
  );
}
