"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProductAction } from "@/features/inventory/actions";
import { readStockQueue, writeStockQueue } from "@/features/inventory/offline";

export default function SyncStock() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const send = async () => {
      if (!navigator.onLine) return;
      const queue = readStockQueue();
      if (queue.length === 0) return;
      const remaining = [];
      for (const item of queue) {
        const formData = new FormData();
        formData.set("id", item.productId);
        formData.set("name", item.name);
        formData.set("price", String(item.price));
        formData.set("stock", String(item.stock));
        formData.set("description", item.description || "");
        try {
          await updateProductAction(formData);
        } catch {
          remaining.push(item);
        }
      }
      writeStockQueue(remaining);
      if (remaining.length === 0) {
        setMessage("Offline stock sent.");
        window.dispatchEvent(new Event("bizflow-stock-synced"));
        router.refresh();
        window.setTimeout(() => setMessage(""), 2500);
      } else {
        setMessage(`${remaining.length} stock change(s) still waiting.`);
      }
    };
    send();
    window.addEventListener("online", send);
    return () => window.removeEventListener("online", send);
  }, [router]);

  if (!message) return null;
  return <p className="border-b border-zinc-200 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">{message}</p>;
}
