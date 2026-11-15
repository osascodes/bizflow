import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

export async function getAnalytics() {
  const business = await getCurrentBusiness();
  if (!business) {
    return {
      weekSales: 0,
      monthSales: 0,
      weekCosts: 0,
      prevWeekSales: 0,
      prevMonthSales: 0,
      prevWeekCosts: 0,
      days: [],
      topProducts: [],
      lowStock: [],
    };
  }

  const now = new Date();
  const weekStart = startOfDay(now);
  weekStart.setDate(weekStart.getDate() - 6);
  const prevStart = new Date(weekStart);
  prevStart.setDate(prevStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  // Previous month: 1st of last month
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // Fetch from whichever is earliest: prevMonthStart or prevStart
  const fetchStart = prevMonthStart < prevStart ? prevMonthStart : prevStart;

  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, { data: prevExpenses }, products] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total, created_at, sale_items(name, quantity, price)")
      .eq("business_id", business.id)
      .gte("created_at", fetchStart.toISOString()),
    supabase
      .from("expenses")
      .select("amount, created_at")
      .eq("business_id", business.id)
      .gte("created_at", weekStart.toISOString()),
    // Previous week costs
    supabase
      .from("expenses")
      .select("amount, created_at")
      .eq("business_id", business.id)
      .gte("created_at", prevStart.toISOString())
      .lt("created_at", weekStart.toISOString()),
    getProducts(),
  ]);

  const monthSales = (sales ?? [])
    .filter((sale) => new Date(sale.created_at) >= monthStart)
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  const prevMonthSales = (sales ?? [])
    .filter((sale) => {
      const created = new Date(sale.created_at);
      return created >= prevMonthStart && created < monthStart;
    })
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  const weekSales = (sales ?? [])
    .filter((sale) => new Date(sale.created_at) >= weekStart)
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  const prevWeekSales = (sales ?? [])
    .filter((sale) => {
      const created = new Date(sale.created_at);
      return created >= prevStart && created < weekStart;
    })
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  const weekCosts = (expenses ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const prevWeekCosts = (prevExpenses ?? []).reduce((sum, row) => sum + Number(row.amount), 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = dayKey(date);
    const total = (sales ?? [])
      .filter((sale) => dayKey(new Date(sale.created_at)) === key)
      .reduce((sum, sale) => sum + Number(sale.total), 0);
    return {
      label: date.toLocaleDateString("en-NG", { weekday: "short" }),
      date: date.getDate(),
      total,
    };
  });

  const productTotals = new Map<string, { name: string; quantity: number; amount: number; image: string }>();
  for (const sale of sales ?? []) {
    for (const item of sale.sale_items ?? []) {
      const product = products.find((row) => row.name === item.name);
      const current = productTotals.get(item.name) || { name: item.name, quantity: 0, amount: 0, image: product?.image_url || "" };
      current.quantity += Number(item.quantity);
      current.amount += Number(item.quantity) * Number(item.price);
      productTotals.set(item.name, current);
    }
  }

  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const lowStock = products
    .filter((product) => product.stock <= product.low_stock_at)
    .slice(0, 5)
    .map((product) => ({ name: product.name, stock: product.stock }));

  return { weekSales, monthSales, weekCosts, prevWeekSales, prevMonthSales, prevWeekCosts, days, topProducts, lowStock };
}
