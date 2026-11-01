"use client";

import { useMemo, useState } from "react";

export default function SearchableList<T extends { id: string }>({
  items,
  placeholder,
  search,
  empty,
  render,
}: {
  items: T[];
  placeholder: string;
  search: (item: T) => string;
  empty: string;
  render: (item: T) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) => search(item).toLowerCase().includes(value));
  }, [items, query, search]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">{empty}</div>
      ) : (
        filtered.map((item) => <div key={item.id}>{render(item)}</div>)
      )}
    </div>
  );
}
