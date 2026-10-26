import { getCurrentUser } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getLowStockCount } from "@/features/inventory/queries";
import { getTodaySalesTotal } from "@/features/sales/queries";
import { getDebtsDue } from "@/features/debts/queries";
import { getTodayExpenses } from "@/features/expenses/queries";
import { redirect } from "next/navigation";
import SavedHome from "@/features/dashboard/components/SavedHome";

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
    if (!user) return <SavedHome offline />;
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
    <SavedHome
      snapshot={{
        category: business.category,
        name: business.name,
        welcome: `Welcome, ${name}`,
        role: business.role || "unknown",
        stats: stats as [string, string][],
      }}
    />
  );
}
