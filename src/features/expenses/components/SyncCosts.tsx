"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createExpenseAction } from "@/features/expenses/actions";
import { readCostQueue, writeCostQueue } from "@/features/expenses/offline";

export default function SyncCosts() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const send = async () => {
      if (!navigator.onLine) return;
      const queue = readCostQueue();
      if (queue.length === 0) return;
      const remaining = [];
      for (const cost of queue) {
        const formData = new FormData();
        formData.set("title", cost.title);
        formData.set("category", cost.category);
        formData.set("amount", String(cost.amount));
        try {
          await createExpenseAction(formData);
        } catch {
          remaining.push(cost);
        }
      }
      writeCostQueue(remaining);
      if (remaining.length === 0) {
        setMessage("Offline costs sent.");
        window.dispatchEvent(new Event("bizflow-costs-synced"));
        router.refresh();
        window.setTimeout(() => setMessage(""), 2500);
      } else {
        setMessage(`${remaining.length} cost(s) still waiting.`);
      }
    };
    send();
    window.addEventListener("online", send);
    return () => window.removeEventListener("online", send);
  }, []);

  if (!message) return null;
  return <p className="border-b border-zinc-200 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">{message}</p>;
}
