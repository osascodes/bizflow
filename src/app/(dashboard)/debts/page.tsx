import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import SavedList from "@/components/SavedList";
import { getCustomers, getDebts } from "@/features/debts/queries";
import { CustomerForm, DebtForm } from "@/features/debts/components/DebtForms";
import DebtList from "@/features/debts/components/DebtList";
import OfflineDebts from "@/features/debts/components/OfflineDebts";

export default async function DebtsPage() {
  const { offline } = await getAuthState();
  let business = null;
  try {
    business = await getCurrentBusiness();
  } catch {
    business = null;
  }
  if (!business) {
    if (!offline) {
      const { user } = await getAuthState();
      if (user) redirect("/onboarding");
      redirect("/login");
    }
    if (offline) {
      return (
        <main className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-semibold text-zinc-950">Debts</h1>
            <p className="mt-2 text-sm text-amber-300">Offline. Payments stay on this phone until the network returns.</p>
            <OfflineDebts />
          </div>
        </main>
      );
    }
    redirect("/onboarding");
  }

  const customers = await getCustomers();
  const debts = await getDebts();
  const saved = debts.map((debt) => {
    const balance = Math.max(0, Number(debt.amount) - Number(debt.paid));
    const customer = Array.isArray(debt.customers) ? debt.customers[0] : debt.customers;
    return {
      id: debt.id,
      title: customer?.name || "Customer",
      detail: balance > 0 ? `NGN ${balance.toLocaleString()} left` : "Paid",
    };
  });

  return (
    <>
    <SavedList storageKey="bizflow-debts" title="Debts" subtitle="Saved for offline." items={saved} />
    <OfflineDebts debts={debts.map((debt) => {
      const balance = Math.max(0, Number(debt.amount) - Number(debt.paid));
      const customer = Array.isArray(debt.customers) ? debt.customers[0] : debt.customers;
      return {
        id: debt.id,
        name: customer?.name || "Customer",
        note: debt.note || "",
        balance,
        amount: Number(debt.amount),
        paid: Number(debt.paid),
        phone: customer?.phone || null,
        shop: business.name,
      };
    })} />
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-zinc-950">Debts</h1>
          <p className="text-sm text-zinc-400">Add the customer, then record what they owe.</p>
          <CustomerForm />
          <DebtForm customers={customers} />
        </div>
        <DebtList
          debts={debts.map((debt) => {
            const balance = Math.max(0, Number(debt.amount) - Number(debt.paid));
            const customer = Array.isArray(debt.customers) ? debt.customers[0] : debt.customers;
            return {
              id: debt.id,
              name: customer?.name || "Customer",
              note: debt.note || "",
              balance,
              amount: Number(debt.amount),
              paid: Number(debt.paid),
              phone: customer?.phone || null,
              shop: business.name,
            };
          })}
        />
      </div>
    </main>
    </>
  );
}
