import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getExpenses } from "@/features/expenses/queries";
import ExpenseForm from "@/features/expenses/components/ExpenseForm";
import CostList from "@/features/expenses/components/CostList";
import SavedList from "@/components/SavedList";

export default async function ExpensesPage() {
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
    return <SavedList storageKey="bizflow-costs" title="Costs" subtitle="Last saved costs." offline />;
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
            <h1 className="text-2xl font-semibold text-white">Costs</h1>
            <p className="mt-2 text-sm text-zinc-400">Money that left the shop today and earlier.</p>
            <div className="mt-6">
              <ExpenseForm />
            </div>
          </div>
          <CostList
            costs={expenses.map((expense) => ({
              id: expense.id,
              title: expense.title,
              detail: `${expense.category} · ${new Date(expense.created_at).toLocaleString()}`,
              amount: Number(expense.amount),
            }))}
          />
        </div>
      </main>
    </>
  );
}
