"use client";

import { useEffect, useState } from "react";
import { PaymentForm } from "@/features/debts/components/DebtForms";
import { DEBT_SNAPSHOT, readDebtQueue, readDebtSnapshot, type SavedDebt } from "@/features/debts/offline";

export default function OfflineDebts({ debts }: { debts?: SavedDebt[] }) {
  const [saved, setSaved] = useState<SavedDebt[]>(debts || []);
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    if (debts && debts.length > 0) {
      localStorage.setItem(DEBT_SNAPSHOT, JSON.stringify(debts));
      setSaved(debts);
      return;
    }
    setSaved(readDebtSnapshot());
    setWaiting(readDebtQueue().length);
  }, [debts]);

  useEffect(() => {
    const refresh = () => setWaiting(readDebtQueue().length);
    window.addEventListener("bizflow-payments-synced", refresh);
    return () => window.removeEventListener("bizflow-payments-synced", refresh);
  }, []);

  if (debts) return null;

  return (
    <div className="mt-6 space-y-3">
      {waiting > 0 ? <p className="text-sm text-amber-300">{waiting} payment(s) waiting to send.</p> : null}
      {saved.length === 0 ? (
        <p className="text-sm text-zinc-500">Open Debts once while online.</p>
      ) : (
        saved.map((debt) => (
          <div key={debt.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-white">{debt.name}</h2>
              <p className={debt.balance > 0 ? "text-sm text-amber-300" : "text-sm text-emerald-300"}>
                {debt.balance > 0 ? `₦${debt.balance.toLocaleString()} left` : "Paid"}
              </p>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{debt.note || "No note"}</p>
            {debt.balance > 0 ? <PaymentForm debtId={debt.id} name={debt.name} balance={debt.balance} /> : null}
          </div>
        ))
      )}
    </div>
  );
}
