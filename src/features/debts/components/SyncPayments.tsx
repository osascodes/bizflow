"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { recordPaymentAction } from "@/features/debts/actions";
import { readDebtQueue, writeDebtQueue } from "@/features/debts/offline";

export default function SyncPayments() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const send = async () => {
      if (!navigator.onLine) return;
      const queue = readDebtQueue();
      if (queue.length === 0) return;
      const remaining = [];
      for (const payment of queue) {
        const formData = new FormData();
        formData.set("debt_id", payment.debtId);
        formData.set("payment", String(payment.payment));
        try {
          await recordPaymentAction(formData);
        } catch {
          remaining.push(payment);
        }
      }
      writeDebtQueue(remaining);
      if (remaining.length === 0) {
        setMessage("Offline payments sent.");
        window.dispatchEvent(new Event("bizflow-payments-synced"));
        router.refresh();
        window.setTimeout(() => setMessage(""), 2500);
      } else {
        setMessage(`${remaining.length} payment(s) still waiting.`);
      }
    };
    send();
    window.addEventListener("online", send);
    return () => window.removeEventListener("online", send);
  }, [router]);

  if (!message) return null;
  return <p className="border-b border-zinc-200 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">{message}</p>;
}
