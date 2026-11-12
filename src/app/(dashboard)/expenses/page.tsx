import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getExpenses } from "@/features/expenses/queries";
import ExpenseForm from "@/features/expenses/components/ExpenseForm";
import OfflineCosts from "@/features/expenses/components/OfflineCosts";
import CostList from "@/features/expenses/components/CostList";
import SavedList from "@/components/SavedList";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ today?: string }> }) {
  const params = await searchParams;
  const todayOnly = params.today === "1";
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
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-zinc-950">Costs</h1>
          <p className="mt-2 text-sm text-amber-300">Offline. New costs stay on this phone until the network returns.</p>
          <OfflineCosts />
          <div className="mt-8">
            <SavedList storageKey="bizflow-costs" title="Last costs" subtitle="Saved costs." offline />
          </div>
        </div>
      </main>
    );
  }
  if (business.role !== "owner") redirect("/dashboard");
  const expenses = await getExpenses();
  const saved = expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    detail: `${expense.category} · NGN ${Number(expense.amount).toLocaleString()}`,
  }));

  return (
    <>
      <SavedList storageKey="bizflow-costs" title="Costs" subtitle="Saved for offline." items={saved} />
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950">Costs</h1>
            <p className="mt-2 text-sm text-zinc-400">Money that left the shop today and earlier.</p>
            <div className="mt-6">
              <ExpenseForm />
            </div>
          </div>
          <CostList
            todayOnly={todayOnly}
            costs={expenses.map((expense) => ({
              id: expense.id,
              title: expense.title,
              detail: `${expense.category} · ${new Date(expense.created_at).toLocaleString()}`,
              at: expense.created_at,
              amount: Number(expense.amount),
            }))}
          />
        </div>
      </main>
    </>
  );
}
