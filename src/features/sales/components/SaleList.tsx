"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deleteSaleAction } from "@/features/sales/actions";

type Sale = { id: string; title: string; when: string; at?: string; total: number };

export default function SaleList({ sales, todayOnly = false }: { sales: Sale[]; todayOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(sales);
  const [pendingId, setPendingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return items.filter((sale) => {
      if (todayOnly && sale.at && new Date(sale.at) < start) return false;
      if (!value) return true;
      return sale.title.toLowerCase().includes(value);
    });
  }, [items, query, todayOnly]);

  useEffect(() => {
    if (!todayOnly) return;
    document.getElementById("sales-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [todayOnly]);

  return (
    <div id="sales-list" className="space-y-3">
      {todayOnly ? <h2 className="text-lg font-semibold text-white">Today's sales</h2> : null}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search sales"
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No matching sale.</div>
      ) : (
        filtered.map((sale) => (
          <div key={sale.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <Link href={`/sales/${sale.id}`} className="block">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{sale.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{sale.when}</p>
                </div>
                <p className="text-sm text-white">₦{sale.total.toLocaleString()}</p>
              </div>
            </Link>
            <button
              type="button"
              disabled={pendingId === sale.id}
              onClick={async () => {
                setErrorMessage("");
                setPendingId(sale.id);
                const previous = items;
                setItems((current) => current.filter((item) => item.id !== sale.id));
                try {
                  const formData = new FormData();
                  formData.set("id", sale.id);
                  const result = await deleteSaleAction(formData);
                  if (result?.error) throw new Error(result.error);
                } catch (error: unknown) {
                  setItems(previous);
                  setErrorMessage(error instanceof Error ? error.message : "Could not remove the sale");
                } finally {
                  setPendingId("");
                }
              }}
              className="mt-3 text-sm font-semibold text-red-400"
            >
              {pendingId === sale.id ? "Removing..." : "Remove"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
