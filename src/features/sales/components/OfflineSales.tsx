"use client";

import { useEffect, useState } from "react";
import SaleForm from "@/features/sales/components/SaleForm";
import { SALE_CUSTOMERS, SALE_PRODUCTS, readQueue } from "@/features/sales/offline";

type Product = { id: string; name: string; price: number; stock: number };
type Customer = { id: string; name: string };

export default function OfflineSales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [queue, setQueue] = useState(readQueue());

  useEffect(() => {
    try {
      setProducts(JSON.parse(localStorage.getItem(SALE_PRODUCTS) || "[]"));
      setCustomers(JSON.parse(localStorage.getItem(SALE_CUSTOMERS) || "[]"));
    } catch {
      setProducts([]);
    }
    setQueue(readQueue());
  }, []);

  if (products.length === 0) {
    return <p className="mt-6 text-sm text-zinc-500">Open Sales once while online before recording offline.</p>;
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
      <SaleForm products={products} customers={customers} offlineMode />
      <div className="space-y-3">
        {queue.length === 0 ? (
          <p className="text-sm text-zinc-500">No offline sales waiting.</p>
        ) : (
          queue.map((sale) => (
            <div key={sale.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="font-semibold text-white">{sale.label}</h2>
              <p className="mt-1 text-sm text-amber-300">Waiting to send · ₦{sale.total.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
