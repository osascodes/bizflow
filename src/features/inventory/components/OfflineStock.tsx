"use client";

import { useEffect, useState } from "react";
import { STOCK_SNAPSHOT, readStockQueue, readStockSnapshot, writeStockQueue, type SavedProduct } from "@/features/inventory/offline";

export default function OfflineStock({ products }: { products?: SavedProduct[] }) {
  const [saved, setSaved] = useState<SavedProduct[]>(products || []);
  const [notice, setNotice] = useState("");
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    if (products && products.length > 0) {
      localStorage.setItem(STOCK_SNAPSHOT, JSON.stringify(products));
      setSaved(products);
      return;
    }
    setSaved(readStockSnapshot());
    setWaiting(readStockQueue().length);
  }, [products]);

  useEffect(() => {
    const refresh = () => {
      setWaiting(readStockQueue().length);
      if (readStockQueue().length === 0) setNotice("");
    };
    window.addEventListener("bizflow-stock-synced", refresh);
    return () => window.removeEventListener("bizflow-stock-synced", refresh);
  }, []);

  if (products) return null;

  return (
    <div className="mt-6 space-y-3">
      {waiting > 0 ? <p className="text-sm text-amber-300">{waiting} stock change(s) waiting to send.</p> : null}
      {notice ? <p className="text-sm text-amber-300">{notice}</p> : null}
      {saved.length === 0 ? (
        <p className="text-sm text-zinc-500">Open Stock once while online.</p>
      ) : (
        saved.map((product) => (
          <form
            key={product.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const stock = Number(new FormData(event.currentTarget).get("stock") || 0);
              if (stock < 0 || !Number.isInteger(stock)) {
                setNotice("Stock must be a whole number");
                return;
              }
              const queue = readStockQueue().filter((item) => item.productId !== product.id);
              writeStockQueue([...queue, {
                id: crypto.randomUUID(),
                productId: product.id,
                name: product.name,
                price: product.price,
                stock,
                description: product.description,
              }]);
              setWaiting(readStockQueue().length);
              setNotice(`${product.name} saved on this phone.`);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-zinc-950">{product.name}</h2>
              <p className="text-sm text-zinc-400">{product.stock} now</p>
            </div>
            <div className="mt-3 flex gap-2">
              <input name="stock" type="number" min="0" step="1" defaultValue={product.stock} className="h-9 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950" />
              <button type="submit" className="h-9 rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">Save</button>
            </div>
          </form>
        ))
      )}
    </div>
  );
}
