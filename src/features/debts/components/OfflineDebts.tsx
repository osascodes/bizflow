"use client";

import { useEffect, useState } from "react";
import { DEBT_SNAPSHOT, readDebtQueue, readDebtSnapshot, writeDebtQueue, type SavedDebt } from "@/features/debts/offline";

export default function OfflineDebts({ debts }: { debts?: SavedDebt[] }) {
  const [saved, setSaved] = useState<SavedDebt[]>(debts || []);
  const [queue, setQueue] = useState(readDebtQueue());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (debts && debts.length > 0) {
      localStorage.setItem(DEBT_SNAPSHOT, JSON.stringify(debts));
      setSaved(debts);
      return;
    }
    setSaved(readDebtSnapshot());
    setQueue(readDebtQueue());
  }, [debts]);

  useEffect(() => {
    const clear = () => {
      setQueue(readDebtQueue());
      if (readDebtQueue().length === 0) setNotice("");
    };
    window.addEventListener("bizflow-payments-synced", clear);
    return () => window.removeEventListener("bizflow-payments-synced", clear);
  }, []);

  if (debts) return null;

  const pay = (debt: SavedDebt, amount: number) => {
    if (amount <= 0) {
      setNotice("Payment must be more than 0");
      return;
    }
    if (amount > debt.balance) {
      setNotice("Payment is more than what is left");
      return;
    }
    writeDebtQueue([...readDebtQueue(), { id: crypto.randomUUID(), debtId: debt.id, name: debt.name, payment: amount }]);
    setQueue(readDebtQueue());
    setNotice(`${debt.name} payment saved on this phone.`);
  };

  return (
    <div className="mt-6 space-y-3">
      {notice ? <p className="text-sm text-amber-300">{notice}</p> : null}
      {queue.map((payment) => (
        <div key={payment.id} className="rounded-2xl border border-amber-500/30 bg-zinc-900 p-4">
          <p className="font-semibold text-white">{payment.name}</p>
          <p className="mt-1 text-sm text-amber-300">Waiting to send · ₦{payment.payment.toLocaleString()}</p>
        </div>
      ))}
      {saved.length === 0 ? (
        <p className="text-sm text-zinc-500">Open Debts once while online.</p>
      ) : (
        saved.filter((debt) => debt.balance > 0).map((debt) => (
          <form
            key={debt.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              pay(debt, Number(data.get("payment") || 0));
              event.currentTarget.reset();
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-white">{debt.name}</h2>
              <p className="text-sm text-amber-300">₦{debt.balance.toLocaleString()} left</p>
            </div>
            <div className="mt-3 flex gap-2">
              <input name="payment" type="number" min="1" step="0.01" placeholder="Payment" className="h-9 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white" />
              <button type="submit" className="h-9 rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">Save offline</button>
            </div>
          </form>
        ))
      )}
    </div>
  );
}
