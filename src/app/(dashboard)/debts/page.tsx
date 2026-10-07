import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getCustomers, getDebts } from "@/features/debts/queries";
import { CustomerForm, DebtForm, PaymentForm } from "@/features/debts/components/DebtForms";

export default async function DebtsPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const customers = await getCustomers();
  const debts = await getDebts();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-white">Debts</h1>
          <p className="text-sm text-zinc-400">Add the customer, then record what they owe.</p>
          <CustomerForm />
          <DebtForm customers={customers} />
        </div>
        <div className="space-y-3">
          {debts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No debts yet.</div>
          ) : (
            debts.map((debt) => {
              const balance = Math.max(0, Number(debt.amount) - Number(debt.paid));
              const customer = Array.isArray(debt.customers) ? debt.customers[0] : debt.customers;
              return (
                <div key={debt.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-white">{customer?.name || "Customer"}</h2>
                      <p className="mt-1 text-sm text-zinc-500">{debt.note || "No note"}</p>
                    </div>
                    <p className={balance > 0 ? "text-sm text-amber-300" : "text-sm text-emerald-300"}>
                      {balance > 0 ? `₦${balance.toLocaleString()} left` : "Paid"}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Owes ₦{Number(debt.amount).toLocaleString()} · paid ₦{Number(debt.paid).toLocaleString()}
                  </p>
                  {balance > 0 ? <PaymentForm debtId={debt.id} balance={balance} /> : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
