"use client";

import { useMemo, useState } from "react";
import { updateOrderStatusAction } from "@/features/orders/actions";

type Order = {
  id: string;
  title: string;
  customer: string;
  phone: string;
  status: string;
  number: string;
  created?: string;
  amount?: number;
};

type Group = {
  key: string;
  number: string;
  customer: string;
  phone: string;
  status: string;
  created?: string;
  items: Order[];
  total: number;
};

function groupOrders(orders: Order[]): Group[] {
  const groups: Group[] = [];
  for (const order of orders) {
    const key = order.number || order.id;
    const existing = groups.find((group) => group.key === key);
    if (existing) {
      existing.items.push(order);
      existing.total += Number(order.amount || 0);
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
      total: Number(order.amount || 0),
    });
  }
  return groups;
}

function labelFor(status: string) {
  if (status === "pending") return "Pending";
  if (status === "packed") return "Packed";
  if (status === "out") return "Out for Delivery";
  if (status === "done") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return status;
}

function toneFor(status: string) {
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "packed") return "bg-sky-100 text-sky-700";
  if (status === "out") return "bg-[#635BFF]/15 text-[#635BFF]";
  if (status === "done") return "bg-emerald-100 text-emerald-700";
  return "bg-zinc-100 text-zinc-500";
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
  const doneCount = groupOrders(items.filter((order) => order.status === "done" || order.status === "cancelled")).length;

  const move = async (group: Group, status: string) => {
    setErrorMessage("");
    setPendingKey(group.key);
    const previous = group.status;
    setItems((current) => current.map((item) => ((item.number === group.number && group.number) || item.id === group.items[0].id ? { ...item, status } : item)));
    try {
      const formData = new FormData();
      formData.set("order_id", group.items[0].id);
      formData.set("status", status);
      const result = await updateOrderStatusAction(formData);
      if (result?.error) throw new Error(result.error);
    } catch (error: unknown) {
      setItems((current) => current.map((item) => ((item.number === group.number && group.number) || item.id === group.items[0].id ? { ...item, status: previous } : item)));
      setErrorMessage(error instanceof Error ? error.message : "Could not update the order");
    } finally {
      setPendingKey("");
    }
  };

  return (
    <div className="mt-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setTab("todo")} className={`rounded-2xl border p-4 text-left ${tab === "todo" ? "border-[#635BFF] bg-[#635BFF]/10" : "border-zinc-200 bg-white"}`}>
          <p className="text-sm font-medium">To Do</p>
          <p className="mt-1 text-3xl font-semibold text-[#635BFF]">{todoCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Pending orders</p>
        </button>
        <button type="button" onClick={() => setTab("done")} className={`rounded-2xl border p-4 text-left ${tab === "done" ? "border-emerald-400 bg-emerald-50" : "border-zinc-200 bg-white"}`}>
          <p className="text-sm font-medium">Done</p>
          <p className="mt-1 text-3xl font-semibold">{doneCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Delivered and cancelled</p>
        </button>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h2 className="font-semibold">{tab === "todo" ? "Pending orders" : "Finished orders"}</h2>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{tab === "todo" ? todoCount : doneCount} {tab === "todo" ? "pending" : "done"}</span>
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders..." className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none" />
      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
      {groups.length === 0 ? (
        <p className="text-sm text-zinc-500">{query ? "No matching order." : tab === "todo" ? "Nothing to do." : "No finished orders yet."}</p>
      ) : groups.map((group) => (
        <div key={group.key} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">Order #{group.number || group.key.slice(0, 6)}</p>
              <p className="mt-1 text-xs text-zinc-500">{group.created ? new Date(group.created).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${toneFor(group.status)}`}>{labelFor(group.status)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{group.customer}</p>
              <p className="text-sm text-zinc-500">{group.phone}</p>
            </div>
            <a className="inline-flex h-8 items-center rounded-full bg-emerald-500 px-3 text-xs font-semibold text-white" href={`https://wa.me/${(group.phone || "").replace(/\D/g, "")}`} target="_blank">WhatsApp</a>
          </div>
          <div className="mt-3 text-sm">
            {group.items.map((item) => <p key={item.id}>{item.title}</p>)}
          </div>
          {group.total > 0 ? (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-zinc-500">Total</span>
              <span className="font-semibold">₦{group.total.toLocaleString()}</span>
            </div>
          ) : null}
          {group.status === "pending" || group.status === "packed" ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => move(group, "cancelled")} disabled={pendingKey === group.key} className="h-10 rounded-full border border-rose-300 text-sm font-semibold text-rose-600">Cancel</button>
              {group.status === "pending" ? <button type="button" onClick={() => move(group, "packed")} disabled={pendingKey === group.key} className="h-10 rounded-full bg-zinc-950 text-sm font-semibold text-white">{pendingKey === group.key ? "Saving..." : "Pack"}</button> : null}
              {group.status === "packed" ? <button type="button" onClick={() => move(group, "out")} disabled={pendingKey === group.key} className="h-10 rounded-full bg-zinc-950 text-sm font-semibold text-white">{pendingKey === group.key ? "Saving..." : "Out"}</button> : null}
            </div>
          ) : null}
          {group.status === "out" ? (
            <button type="button" onClick={() => move(group, "done")} disabled={pendingKey === group.key} className="mt-4 h-10 w-full rounded-full bg-emerald-500 text-sm font-semibold text-white">{pendingKey === group.key ? "Saving..." : "Delivered"}</button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
