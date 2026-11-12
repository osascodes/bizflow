"use client";

import { useEffect, useMemo, useState } from "react";
import ProductEditor from "@/features/inventory/components/ProductEditor";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  description?: string | null;
  low_stock_at: number;
};

export default function StockList({ products, highlightLow = false }: { products: Product[]; highlightLow?: boolean }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(products);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const list = !value ? items : items.filter((product) => product.name.toLowerCase().includes(value));
    if (!highlightLow) return list;
    return [...list].sort((a, b) => Number(a.stock <= a.low_stock_at) === Number(b.stock <= b.low_stock_at) ? 0 : a.stock <= a.low_stock_at ? -1 : 1);
  }, [items, query, highlightLow]);

  useEffect(() => {
    if (!highlightLow) return;
    document.getElementById("low-stock")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightLow, filtered]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search stock"
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none"
      />
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No matching product.</div>
      ) : (
        filtered.map((product, index) => {
          const low = product.stock <= product.low_stock_at;
          const firstLow = highlightLow && low && filtered.findIndex((item) => item.stock <= item.low_stock_at) === index;
          return (
          <div id={firstLow ? "low-stock" : undefined} key={product.id} className={`relative flex gap-3 rounded-2xl border p-4 ${highlightLow && low ? "border-amber-400 bg-amber-500/10" : "border-zinc-200 bg-white"}`}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-[10px] text-zinc-600">No photo</div>
            )}
            <ProductEditor product={product} onStock={(stock) => setItems((current) => current.map((item) => item.id === product.id ? { ...item, stock } : item))} />
          </div>
          );
        })
      )}
    </div>
  );
}
