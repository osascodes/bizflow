"use client";

import { useMemo, useState } from "react";
import { updateOrderStatusAction } from "@/features/orders/actions";
import { Button } from "@/components/ui/button";

type Order = {
  id: string;
  title: string;
  customer: string;
  phone: string;
  status: string;
  number: string;
};

export default function OrderList({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"todo" | "done">("todo");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return orders.filter((order) => {
      const done = order.status === "done" || order.status === "cancelled";
      if (tab === "todo" && done) return false;
      if (tab === "done" && !done) return false;
      if (!value) return true;
      return `${order.title} ${order.customer} ${order.number}`.toLowerCase().includes(value);
    });
  }, [orders, query, tab]);
  const todoCount = orders.filter((order) => order.status !== "done" && order.status !== "cancelled").length;

  return (
    <div className="mt-8 space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTab("todo")} className={`h-10 rounded-full px-4 text-sm font-semibold ${tab === "todo" ? "bg-white text-zinc-950" : "border border-zinc-700 text-white"}`}>
          To do{todoCount ? ` · ${todoCount}` : ""}
        </button>
        <button type="button" onClick={() => setTab("done")} className={`h-10 rounded-full px-4 text-sm font-semibold ${tab === "done" ? "bg-white text-zinc-950" : "border border-zinc-700 text-white"}`}>
          Done
        </button>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search orders"
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No matching order.</p>
      ) : (
        filtered.map((order) => (
          <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">{order.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">{order.customer} · {order.phone}</p>
                <p className="mt-1 text-xs text-zinc-500">{order.number || order.status} · {order.status}</p>
              </div>
              <a className="text-sm text-violet-300" href={`https://wa.me/${order.phone.replace(/\D/g, "")}`} target="_blank">WhatsApp</a>
            </div>
            {order.status === "pending" || order.status === "packed" || order.status === "out" ? (
              <form action={updateOrderStatusAction} className="mt-3 flex gap-2">
                <input type="hidden" name="order_id" value={order.id} />
                {order.status === "pending" ? <Button name="status" value="packed" type="submit" className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">Pack</Button> : null}
                {order.status === "packed" ? <Button name="status" value="out" type="submit" className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">Out</Button> : null}
                {order.status === "out" ? <Button name="status" value="done" type="submit" className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">Delivered</Button> : null}
                {order.status === "pending" ? <Button name="status" value="cancelled" type="submit" className="h-9 border border-zinc-600 bg-zinc-800 text-white">Cancel</Button> : null}
              </form>
            ) : (
              <p className="mt-3 text-xs capitalize text-zinc-500">{order.status === "done" ? "Delivered" : order.status}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
