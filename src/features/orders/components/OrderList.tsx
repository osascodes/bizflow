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

type Group = {
  key: string;
  number: string;
  customer: string;
  phone: string;
  status: string;
  items: Order[];
};

function groupOrders(orders: Order[]): Group[] {
  const groups: Group[] = [];
  for (const order of orders) {
    const key = order.number || order.id;
    const existing = groups.find((group) => group.key === key);
    if (existing) {
      existing.items.push(order);
      continue;
    }
    groups.push({
      key,
      number: order.number,
      customer: order.customer,
      phone: order.phone,
      status: order.status,
      items: [order],
    });
  }
  return groups;
}

export default function OrderList({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"todo" | "done">("todo");
  const [items, setItems] = useState(orders);
  const [pendingKey, setPendingKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const groups = useMemo(() => {
    const value = query.trim().toLowerCase();
    const filtered = items.filter((order) => {
      const done = order.status === "done" || order.status === "cancelled";
      if (tab === "todo" && done) return false;
      if (tab === "done" && !done) return false;
      if (!value) return true;
      return `${order.title} ${order.customer} ${order.number}`.toLowerCase().includes(value);
    });
    return groupOrders(filtered);
  }, [items, query, tab]);
  const todoCount = groupOrders(items.filter((order) => order.status !== "done" && order.status !== "cancelled")).length;

  const move = async (group: Group, status: string) => {
    setErrorMessage("");
    setPendingKey(group.key);
    const previous = group.status;
    setItems((current) => current.map((item) => (item.number === group.number && group.number) || item.id === group.items[0].id ? { ...item, status } : item));
    try {
      const formData = new FormData();
      formData.set("order_id", group.items[0].id);
      formData.set("status", status);
      const result = await updateOrderStatusAction(formData);
      if (result?.error) throw new Error(result.error);
    } catch (error: unknown) {
      setItems((current) => current.map((item) => (item.number === group.number && group.number) || item.id === group.items[0].id ? { ...item, status: previous } : item));
      setErrorMessage(error instanceof Error ? error.message : "Could not update the order");
    } finally {
      setPendingKey("");
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
      {groups.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {query ? "No matching order." : tab === "todo" ? "Nothing to do." : "No finished orders yet."}
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                {group.items.map((item) => (
                  <h2 key={item.id} className="font-semibold text-white">{item.title}</h2>
                ))}
                <p className="mt-1 text-sm text-zinc-400">{group.customer} · {group.phone}</p>
                <p className="mt-1 text-xs text-zinc-500">{group.number || group.status} · {group.status}</p>
              </div>
              <a className="text-sm text-violet-300" href={`https://wa.me/${(group.phone || "").replace(/\D/g, "")}`} target="_blank">WhatsApp</a>
            </div>
            {group.status === "pending" || group.status === "packed" || group.status === "out" ? (
              <div className="mt-3 flex gap-2">
                {group.status === "pending" ? <Button type="button" onClick={() => move(group, "packed")} disabled={pendingKey === group.key} className="h-9 bg-[#635BFF] text-white">{pendingKey === group.key ? "Saving..." : "Pack"}</Button> : null}
                {group.status === "packed" ? <Button type="button" onClick={() => move(group, "out")} disabled={pendingKey === group.key} className="h-9 bg-[#635BFF] text-white">{pendingKey === group.key ? "Saving..." : "Out"}</Button> : null}
                {group.status === "out" ? <Button type="button" onClick={() => move(group, "done")} disabled={pendingKey === group.key} className="h-9 bg-[#635BFF] text-white">{pendingKey === group.key ? "Saving..." : "Delivered"}</Button> : null}
                <Button type="button" onClick={() => move(group, "cancelled")} disabled={pendingKey === group.key} className="h-9 border border-zinc-600 bg-zinc-800 text-white">Cancel</Button>
              </div>
            ) : (
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${group.status === "done" ? "bg-emerald-500 text-white" : "bg-zinc-700 text-zinc-200"}`}>
                {group.status === "done" ? "Delivered" : "Cancelled"}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
