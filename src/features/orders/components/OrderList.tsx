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
  created?: string;
};

type Group = {
  key: string;
  number: string;
  customer: string;
  phone: string;
  status: string;
  created?: string;
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
      created: order.created,
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
        <button type="button" onClick={() => setTab("todo")} className={`rounded-2xl border p-4 text-left ${tab === "todo" ? "border-[#635BFF] bg-[#635BFF]/10" : "border-zinc-200 bg-white"}`}>
          <p className="text-sm text-zinc-500">To Do</p>
          <p className="mt-1 text-2xl font-semibold text-[#635BFF]">{todoCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Pending orders</p>
        </button>
        <button type="button" onClick={() => setTab("done")} className={`rounded-2xl border p-4 text-left ${tab === "done" ? "border-emerald-400 bg-emerald-50" : "border-zinc-200 bg-white"}`}>
          <p className="text-sm text-zinc-500">Done</p>
          <p className="mt-1 text-2xl font-semibold">{items.filter((order) => order.status === "done" || order.status === "cancelled").length}</p>
          <p className="mt-1 text-xs text-zinc-500">Completed and cancelled</p>
        </button>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search orders"
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none"
      />
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      {groups.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {query ? "No matching order." : tab === "todo" ? "Nothing to do." : "No finished orders yet."}
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Order #{group.number || group.key.slice(0, 6)}</p>
                <p className="mt-1 text-xs text-zinc-500">{group.created ? new Date(group.created).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${group.status === "done" ? "bg-emerald-100 text-emerald-700" : group.status === "cancelled" ? "bg-zinc-100 text-zinc-500" : "bg-amber-100 text-amber-700"}`}>{group.status}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{group.customer}</p>
                <p className="text-sm text-zinc-500">{group.phone}</p>
              </div>
              <a className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white" href={`https://wa.me/${(group.phone || "").replace(/\D/g, "")}`} target="_blank">WhatsApp</a>
            </div>
            <div className="mt-3 text-sm text-zinc-700">
              {group.items.map((item) => <p key={item.id}>{item.title}</p>)}
            </div>
            {group.status === "pending" || group.status === "packed" || group.status === "out" ? (
              <div className="mt-3 flex gap-2">
                {group.status === "pending" ? <Button type="button" onClick={() => move(group, "packed")} disabled={pendingKey === group.key} className="h-9 bg-[#635BFF] text-white">{pendingKey === group.key ? "Saving..." : "Pack"}</Button> : null}
                {group.status === "packed" ? <Button type="button" onClick={() => move(group, "out")} disabled={pendingKey === group.key} className="h-9 bg-[#635BFF] text-white">{pendingKey === group.key ? "Saving..." : "Out"}</Button> : null}
                {group.status === "out" ? <Button type="button" onClick={() => move(group, "done")} disabled={pendingKey === group.key} className="h-9 bg-[#635BFF] text-white">{pendingKey === group.key ? "Saving..." : "Delivered"}</Button> : null}
                <Button type="button" onClick={() => move(group, "cancelled")} disabled={pendingKey === group.key} className="h-9 border border-zinc-600 bg-[#635BFF] text-white">Cancel</Button>
              </div>
            ) : (
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${group.status === "done" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-700 text-zinc-200"}`}>
                {group.status === "done" ? "Delivered" : "Cancelled"}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
