import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getExpenses } from "@/features/expenses/queries";
import ExpenseForm from "@/features/expenses/components/ExpenseForm";
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
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No costs yet.</div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-white">{expense.title}</h2>
                      <p className="mt-1 text-sm text-zinc-500">{expense.category} · {new Date(expense.created_at).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-white">₦{Number(expense.amount).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
