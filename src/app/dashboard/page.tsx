import { getCurrentUser } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getLowStockCount, getLowStock } from "@/features/inventory/queries";
import { getTodaySalesTotal, getTodaySales } from "@/features/sales/queries";
import { getDebtsDue, getDebtsOwed } from "@/features/debts/queries";
import { getTodayExpenses } from "@/features/expenses/queries";
import { getOrdersToDo } from "@/features/orders/queries";
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
  let ordersToDo: { id: string; customer: string; items: string[]; status: string }[] = [];
  let lowItems: { id: string; name: string; stock: number }[] = [];
  let owed: { id: string; name: string; left: number }[] = [];
  let todaySales: { id: string; total: number; items: string }[] = [];
  try {
    const [stock, sales, debts, costs, orders, lows, due, todays] = await Promise.all([
      getLowStockCount(),
      getTodaySalesTotal(),
      getDebtsDue(),
      isOwner ? getTodayExpenses() : Promise.resolve(0),
      getOrdersToDo(),
      getLowStock(),
      getDebtsOwed(),
      getTodaySales(),
    ]);
    lowStock = stock;
    salesToday = sales;
    debtsDue = debts;
    costsToday = costs;
    ordersToDo = orders;
    lowItems = lows;
    owed = due;
    todaySales = todays;
  } catch {
    lowStock = 0;
    salesToday = 0;
    debtsDue = 0;
    costsToday = 0;
    ordersToDo = [];
    lowItems = [];
    owed = [];
    todaySales = [];
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
        ...(ordersToDo.length > 0 ? [["Orders to do", String(ordersToDo.length)]] : []),
      ]
    : [
        ["Sales today", money(salesToday)],
        ["Debts due", money(debtsDue)],
        ["Low stock", String(lowStock)],
        ...(ordersToDo.length > 0 ? [["Orders to do", String(ordersToDo.length)]] : []),
      ];

  return (
    <SavedHome
      snapshot={{
        category: business.category,
        name: business.name,
        welcome: `Welcome, ${name}`,
        role: business.role || "unknown",
        stats: stats as [string, string][],
        needs: ordersToDo.map((order) => ({
          id: order.id,
          title: order.customer,
          detail: order.items.join(", "),
          status: order.status,
        })),
        low: lowItems,
        owed,
        today: todaySales,

      }}
    />
  );
}
