import { getCurrentUser } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getLowStockCount } from "@/features/inventory/queries";
import { getTodaySalesTotal } from "@/features/sales/queries";
import { getDebtsDue } from "@/features/debts/queries";
import { getTodayExpenses } from "@/features/expenses/queries";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  let lowStock = 0;
  let salesToday = 0;
  let debtsDue = 0;
  let costsToday = 0;
  try {
    [lowStock, salesToday, debtsDue, costsToday] = await Promise.all([
      getLowStockCount(),
      getTodaySalesTotal(),
      getDebtsDue(),
      getTodayExpenses(),
    ]);
  } catch {
    lowStock = 0;
    salesToday = 0;
    debtsDue = 0;
    costsToday = 0;
  }

  const leftToday = salesToday - costsToday;
  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "there";

  const stats = [
    ["Sales today", `₦${salesToday.toLocaleString()}`],
    ["Costs today", `₦${costsToday.toLocaleString()}`],
    ["Left today", `₦${leftToday.toLocaleString()}`],
    ["Debts due", `₦${debtsDue.toLocaleString()}`],
    ["Low stock", String(lowStock)],
  ];

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-violet-300">{business.category}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{business.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">Welcome, {name}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          Left today is sales today minus costs today. Debts are money customers still owe, so they stay separate.
        </p>
      </div>
    </main>
  );
}
