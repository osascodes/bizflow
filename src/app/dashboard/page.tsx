import { getCurrentUser } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getLowStockCount } from "@/features/inventory/queries";
import { getTodaySalesTotal } from "@/features/sales/queries";
import { getDebtsDue } from "@/features/debts/queries";
import { getTodayExpenses } from "@/features/expenses/queries";
import { redirect } from "next/navigation";

function money(value: number) {
  const amount = Number(value) || 0;
  return `NGN ${amount.toLocaleString()}`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  let business = null;
  try {
    business = await getCurrentBusiness();
  } catch {
    business = null;
  }
  if (!business) {
    if (!user) {
      return (
        <main className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h1 className="text-xl font-semibold text-white">You are offline</h1>
            <p className="mt-2 text-sm text-zinc-400">The last saved page will show when this page has been opened online once.</p>
          </div>
        </main>
      );
    }
    redirect("/start");
  }

  const isOwner = business.role === "owner";
  let lowStock = 0;
  let salesToday = 0;
  let debtsDue = 0;
  let costsToday = 0;
  try {
    [lowStock, salesToday, debtsDue, costsToday] = await Promise.all([
      getLowStockCount(),
      getTodaySalesTotal(),
      getDebtsDue(),
      isOwner ? getTodayExpenses() : Promise.resolve(0),
    ]);
  } catch {
    lowStock = 0;
    salesToday = 0;
    debtsDue = 0;
    costsToday = 0;
  }

  const leftToday = salesToday - costsToday;
  const name = (user?.user_metadata?.full_name as string | undefined) || user?.email || "there";
  const stats = isOwner
    ? [
        ["Sales today", money(salesToday)],
        ["Costs today", money(costsToday)],
        ["Left today", money(leftToday)],
        ["Debts due", money(debtsDue)],
        ["Low stock", String(lowStock)],
      ]
    : [
        ["Sales today", money(salesToday)],
        ["Debts due", money(debtsDue)],
        ["Low stock", String(lowStock)],
      ];

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-violet-300">{business.category}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{business.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">Welcome, {name}</p>
        <p className="mt-1 text-sm text-violet-300">Role: {business.role || "unknown"}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
