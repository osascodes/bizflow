"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Customer = { id: string; name: string; phone: string | null; owed: number };

export default function CustomerList({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return customers;
    return customers.filter((customer) => `${customer.name} ${customer.phone || ""}`.toLowerCase().includes(value));
  }, [customers, query]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search customers"
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none"
      />
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No matching customer.</div>
      ) : (
        filtered.map((customer) => (
          <Link key={customer.id} href={`/customers/${customer.id}`} className="block rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-600">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-950">{customer.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{customer.phone}</p>
              </div>
              <p className="text-sm text-zinc-600">₦{customer.owed.toLocaleString()}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
