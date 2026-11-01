"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Sale = { id: string; title: string; when: string; total: number };

export default function SaleList({ sales }: { sales: Sale[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return sales;
    return sales.filter((sale) => sale.title.toLowerCase().includes(value));
  }, [sales, query]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search sales"
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No matching sale.</div>
      ) : (
        filtered.map((sale) => (
          <Link key={sale.id} href={`/sales/${sale.id}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">{sale.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{sale.when}</p>
              </div>
              <p className="text-sm text-white">₦{sale.total.toLocaleString()}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
