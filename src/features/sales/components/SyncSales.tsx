"use client";

import { useEffect, useState } from "react";
import { recordSaleAction } from "@/features/sales/actions";
import { readQueue, writeQueue } from "@/features/sales/offline";

export default function SyncSales() {
  const [left, setLeft] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const send = async () => {
      if (!navigator.onLine) return;
      const queue = readQueue();
      setLeft(queue.length);
      if (queue.length === 0) return;
      const remaining = [];
      for (const sale of queue) {
        const formData = new FormData();
        formData.set("items", JSON.stringify(sale.items));
        if (sale.customer_id) formData.set("customer_id", sale.customer_id);
        if (sale.on_credit) formData.set("on_credit", "on");
        try {
          await recordSaleAction(formData);
        } catch {
          remaining.push(sale);
        }
      }
      writeQueue(remaining);
      setLeft(remaining.length);
      if (remaining.length === 0) {
        setMessage("Offline sales sent.");
        window.setTimeout(() => setMessage(""), 2500);
      } else {
        setMessage(`${remaining.length} sale(s) still waiting.`);
      }
    };
    send();
    window.addEventListener("online", send);
    return () => window.removeEventListener("online", send);
  }, []);

  if (!message && left === 0) return null;
  return <p className="border-b border-zinc-800 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">{message || `${left} offline sale(s) waiting.`}</p>;
}
