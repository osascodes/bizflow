"use client";

import { useMemo, useState } from "react";
import { PaymentForm } from "@/features/debts/components/DebtForms";

type Debt = {
  id: string;
  name: string;
  note: string;
  balance: number;
  amount: number;
  paid: number;
  phone: string | null;
  shop: string;
};

export default function DebtList({ debts }: { debts: Debt[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return debts;
    return debts.filter((debt) => `${debt.name} ${debt.note}`.toLowerCase().includes(value));
  }, [debts, query]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search debts"
        className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none"
      />
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No matching debt.</div>
      ) : (
        filtered.map((debt) => {
          const phone = debt.phone?.replace(/\D/g, "").replace(/^0/, "234");
          return (
            <div key={debt.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{debt.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{debt.note || "No note"}</p>
                </div>
                <p className={debt.balance > 0 ? "text-sm text-amber-300" : "text-sm text-emerald-300"}>
                  {debt.balance > 0 ? `₦${debt.balance.toLocaleString()} left` : "Paid"}
                </p>
              </div>
              <p className="mt-2 text-xs text-zinc-500">Owes ₦{debt.amount.toLocaleString()} · paid ₦{debt.paid.toLocaleString()}</p>
              {debt.balance > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <PaymentForm debtId={debt.id} name={debt.name} balance={debt.balance} />
                  {phone ? (
                    <a
                      href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${debt.name}, this is a reminder from ${debt.shop}. You still owe NGN ${debt.balance.toLocaleString()}.`)}`}
                      target="_blank"
                      className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950"
                    >
                      Remind on WhatsApp
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
