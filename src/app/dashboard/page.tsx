import { getCurrentUser } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getLowStockCount, getLowStock } from "@/features/inventory/queries";
import { getTodaySalesTotal, getTodaySales } from "@/features/sales/queries";
import { getDebtsDue, getDebtsOwed } from "@/features/debts/queries";
import { getTodayExpenses, getTodayCosts } from "@/features/expenses/queries";
import { getOrdersToDo } from "@/features/orders/queries";
import { redirect } from "next/navigation";
import SavedHome from "@/features/dashboard/components/SavedHome";

function money(value: number) {
  const amount = Number(value) || 0;
  return `₦${amount.toLocaleString()}`;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const selected = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? new Date(`${params.date}T00:00:00`) : new Date();
  const isToday = new Date().toDateString() === selected.toDateString();
  const dateLabel = isToday ? "Today" : selected.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  const dateValue = selected.toISOString().slice(0, 10);
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
  let todayCosts: { id: string; title: string; amount: number }[] = [];
  try {
    const [stock, sales, debts, costs, orders, lows, due, todays, costItems] = await Promise.all([
      getLowStockCount(),
      getTodaySalesTotal(selected),
      getDebtsDue(),
      isOwner ? getTodayExpenses(selected) : Promise.resolve(0),
      getOrdersToDo(),
      getLowStock(),
      getDebtsOwed(),
      getTodaySales(selected),
      isOwner ? getTodayCosts(selected) : Promise.resolve([]),
    ]);
    lowStock = stock;
    salesToday = sales;
    debtsDue = debts;
    costsToday = costs;
    ordersToDo = orders;
    lowItems = lows;
    owed = due;
    todaySales = todays;
    todayCosts = costItems;
  } catch {
    lowStock = 0;
    salesToday = 0;
    debtsDue = 0;
    costsToday = 0;
    ordersToDo = [];
    lowItems = [];
    owed = [];
    todaySales = [];
    todayCosts = [];
  }

  const leftToday = salesToday - costsToday;
  const name = (user?.user_metadata?.full_name as string | undefined) || user?.email || "there";
  const salesLabel = isToday ? "Sales today" : `Sales ${dateLabel}`;
  const costsLabel = isToday ? "Costs today" : `Costs ${dateLabel}`;
  const leftLabel = isToday ? "Left today" : `Left ${dateLabel}`;
  const stats = isOwner
    ? [
        [salesLabel, money(salesToday)],
        [costsLabel, money(costsToday)],
        [leftLabel, money(leftToday)],
        ["Debts due", money(debtsDue)],
        ["Low stock", lowStock === 1 ? "1 item" : `${lowStock} items`],
        ["Orders to do", String(ordersToDo.length)],
      ]
    : [
        [salesLabel, money(salesToday)],
        ["Debts due", money(debtsDue)],
        ["Low stock", lowStock === 1 ? "1 item" : `${lowStock} items`],
        ["Orders to do", String(ordersToDo.length)],
      ];

  return (
    <SavedHome
      snapshot={{
        category: business.category,
        name: business.name,
        welcome: `Welcome, ${name}`,
        role: business.role || "unknown",
        logoUrl: business.logo_url || "",
        email: user?.email || "",
        dateValue,
        dateLabel,
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
        costs: todayCosts,


      }}
    />
  );
}
