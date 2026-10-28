import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getCustomerHistory } from "@/features/customers/history";

export default async function CustomerHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  const { id } = await params;
  const history = await getCustomerHistory(id);
  if (!history) notFound();

  const phone = history.customer.phone?.replace(/\D/g, "").replace(/^0/, "234");

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/customers" className="text-sm text-zinc-400">Back to customers</Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">{history.customer.name}</h1>
        <p className="mt-1 text-sm text-zinc-400">{history.customer.phone || "No phone"}</p>
        <div className="mt-4 flex items-center gap-3">
          <p className={history.owed > 0 ? "text-sm text-amber-300" : "text-sm text-emerald-300"}>
            {history.owed > 0 ? `Owes ₦${history.owed.toLocaleString()}` : "Nothing owed"}
          </p>
          {phone ? (
            <a href={`https://wa.me/${phone}`} target="_blank" className="text-sm text-violet-300">WhatsApp</a>
          ) : null}
        </div>

        <h2 className="mt-8 text-lg font-semibold text-white">Purchases</h2>
        <div className="mt-3 space-y-3">
          {history.sales.length === 0 ? (
            <p className="text-sm text-zinc-500">No linked sales yet. Pick this customer when recording a sale.</p>
          ) : (
            history.sales.map((sale) => (
              <Link key={sale.id} href={`/sales/${sale.id}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{(sale.sale_items ?? []).map((item) => `${item.quantity} x ${item.name}`).join(", ") || "Sale"}</p>
                    <p className="mt-1 text-xs text-zinc-500">{new Date(sale.created_at).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-white">₦{Number(sale.total).toLocaleString()}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <h2 className="mt-8 text-lg font-semibold text-white">Debts</h2>
        <div className="mt-3 space-y-3">
          {history.debts.length === 0 ? (
            <p className="text-sm text-zinc-500">No debts.</p>
          ) : (
            history.debts.map((debt) => {
              const left = Math.max(0, Number(debt.amount) - Number(debt.paid));
              return (
                <div key={debt.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{debt.note || "Debt"}</p>
                      <p className="mt-1 text-xs text-zinc-500">{new Date(debt.created_at).toLocaleString()}</p>
                    </div>
                    <p className={left > 0 ? "text-sm text-amber-300" : "text-sm text-emerald-300"}>
                      {left > 0 ? `₦${left.toLocaleString()} left` : "Paid"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
