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
  const [items, setItems] = useState(orders);
  const [pendingId, setPendingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((order) => {
      const done = order.status === "done" || order.status === "cancelled";
      if (tab === "todo" && done) return false;
      if (tab === "done" && !done) return false;
      if (!value) return true;
      return `${order.title} ${order.customer} ${order.number}`.toLowerCase().includes(value);
    });
  }, [items, query, tab]);
  const todoCount = items.filter((order) => order.status !== "done" && order.status !== "cancelled").length;

  const move = async (order: Order, status: string) => {
    setErrorMessage("");
    setPendingId(order.id);
    const previous = order.status;
    setItems((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
    try {
      const formData = new FormData();
      formData.set("order_id", order.id);
      formData.set("status", status);
      await updateOrderStatusAction(formData);
    } catch (error: unknown) {
      setItems((current) => current.map((item) => item.id === order.id ? { ...item, status: previous } : item));
      setErrorMessage(error instanceof Error ? error.message : "Could not update the order");
    } finally {
      setPendingId("");
    }
  };

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
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {query ? "No matching order." : tab === "todo" ? "Nothing to do." : "No finished orders yet."}
        </p>
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
              <div className="mt-3 flex gap-2">
                {order.status === "pending" ? <Button type="button" onClick={() => move(order, "packed")} disabled={pendingId === order.id} className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">{pendingId === order.id ? "Saving..." : "Pack"}</Button> : null}
                {order.status === "packed" ? <Button type="button" onClick={() => move(order, "out")} disabled={pendingId === order.id} className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">{pendingId === order.id ? "Saving..." : "Out"}</Button> : null}
                {order.status === "out" ? <Button type="button" onClick={() => move(order, "done")} disabled={pendingId === order.id} className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">{pendingId === order.id ? "Saving..." : "Delivered"}</Button> : null}
                {order.status === "pending" ? <Button type="button" onClick={() => move(order, "cancelled")} disabled={pendingId === order.id} className="h-9 border border-zinc-600 bg-zinc-800 text-white">Cancel</Button> : null}
              </div>
            ) : (
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.status === "done" ? "bg-emerald-500 text-white" : "bg-zinc-700 text-zinc-200"}`}>
                {order.status === "done" ? "Delivered" : "Cancelled"}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
