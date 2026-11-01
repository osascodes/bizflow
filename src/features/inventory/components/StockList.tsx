"use client";

import { useMemo, useState } from "react";
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

export default function StockList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;
    return products.filter((product) => product.name.toLowerCase().includes(value));
  }, [products, query]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search stock"
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No matching product.</div>
      ) : (
        filtered.map((product) => (
          <div key={product.id} className="relative flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-950 text-[10px] text-zinc-600">No photo</div>
            )}
            <ProductEditor product={product} />
          </div>
        ))
      )}
    </div>
  );
}
