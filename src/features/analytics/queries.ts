import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";

const LAGOS_OFFSET_MS = 60 * 60 * 1000;

function lagosDate(date: Date) {
  return new Date(date.getTime() + LAGOS_OFFSET_MS);
}

function lagosStartUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day) - LAGOS_OFFSET_MS);
}

function currentWeekStart(now: Date) {
  const lagos = lagosDate(now);
  const day = lagos.getUTCDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  return lagosStartUtc(lagos.getUTCFullYear(), lagos.getUTCMonth(), lagos.getUTCDate() - mondayOffset);
}

function currentMonthStart(now: Date) {
  const lagos = lagosDate(now);
  return lagosStartUtc(lagos.getUTCFullYear(), lagos.getUTCMonth(), 1);
}

function previousMonthStart(now: Date) {
  const lagos = lagosDate(now);
  return lagosStartUtc(lagos.getUTCFullYear(), lagos.getUTCMonth() - 1, 1);
}

function dayKey(date: Date) {
  const lagos = lagosDate(date);
  return lagos.toISOString().slice(0, 10);
}

type SaleItem = { name: string; quantity: number; price: number; cost_price: number | null };
type Sale = { id: string; total: number; created_at: string; sale_items: SaleItem[] | null };

function parseRequestedStart(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return lagosStartUtc(year, month - 1, day);
}

export async function getAnalytics(from?: string, to?: string) {
  const business = await getCurrentBusiness();
  if (!business) {
    return {
      weekSales: 0,
      monthSales: 0,
      weekCosts: 0,
      netProfit: 0,
      missingCostUnits: 0,
      prevWeekSales: 0,
      prevMonthSales: 0,
      prevWeekCosts: 0,
      prevNetProfit: 0,
      days: [],
      chartDays: [],
      chartFrom: "",
      chartTo: "",
      topProducts: [],
      lowStock: [],
    };
  }

  const now = new Date();
  const weekStart = currentWeekStart(now);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const monthStart = currentMonthStart(now);
  const prevMonthStart = previousMonthStart(now);
  const chartStart = new Date(now);
  chartStart.setDate(chartStart.getDate() - 6);
  const requestedStart = parseRequestedStart(from);
  const fetchStart = [prevMonthStart, prevWeekStart, chartStart, requestedStart].filter((date): date is Date => Boolean(date)).sort((a, b) => a.getTime() - b.getTime())[0];

  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, products] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total, created_at, sale_items(name, quantity, price, cost_price)")
      .eq("business_id", business.id)
      .gte("created_at", fetchStart.toISOString()),
    supabase
      .from("expenses")
      .select("amount, created_at")
      .eq("business_id", business.id)
      .gte("created_at", prevWeekStart.toISOString()),
    getProducts(),
  ]);

  const rows = (sales ?? []) as Sale[];
  const sumSales = (from: Date, to?: Date) =>
    rows
      .filter((sale) => {
        const created = new Date(sale.created_at);
        return created >= from && (!to || created < to);
      })
      .reduce((sum, sale) => sum + Number(sale.total), 0);

  const sumExpenses = (from: Date, to?: Date) =>
    (expenses ?? [])
      .filter((row) => {
        const created = new Date(row.created_at);
        return created >= from && (!to || created < to);
      })
      .reduce((sum, row) => sum + Number(row.amount), 0);

  const profitFor = (from: Date, to?: Date) => {
    let cogs = 0;
    let missing = 0;
    for (const sale of rows) {
      const created = new Date(sale.created_at);
      if (created < from || (to && created >= to)) continue;
      for (const item of sale.sale_items ?? []) {
        if (item.cost_price == null) {
          missing += Number(item.quantity);
          continue;
        }
        cogs += Number(item.cost_price) * Number(item.quantity);
      }
    }
    return { cogs, missing };
  };

  const weekSales = sumSales(weekStart);
  const monthSales = sumSales(monthStart);
  const prevWeekSales = sumSales(prevWeekStart, weekStart);
  const prevMonthSales = sumSales(prevMonthStart, monthStart);
  const weekCosts = sumExpenses(weekStart);
  const prevWeekCosts = sumExpenses(prevWeekStart, weekStart);
  const weekProfit = profitFor(weekStart);
  const prevProfit = profitFor(prevWeekStart, weekStart);
  const netProfit = weekSales - weekProfit.cogs - weekCosts;
  const prevNetProfit = prevWeekSales - prevProfit.cogs - prevWeekCosts;

  const lagosToday = lagosDate(now);
  const todayKey = new Date(Date.UTC(lagosToday.getUTCFullYear(), lagosToday.getUTCMonth(), lagosToday.getUTCDate()));
  const parseDay = (value?: string) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date;
  };
  let rangeStart = parseDay(from);
  let rangeEnd = parseDay(to);
  if (!rangeStart || !rangeEnd) {
    rangeEnd = todayKey;
    rangeStart = new Date(Date.UTC(todayKey.getUTCFullYear(), todayKey.getUTCMonth(), todayKey.getUTCDate() - 6));
  }
  if (rangeEnd < rangeStart) [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  if (rangeEnd > todayKey) rangeEnd = todayKey;
  const span = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000);
  if (span > 61) rangeStart = new Date(Date.UTC(rangeEnd.getUTCFullYear(), rangeEnd.getUTCMonth(), rangeEnd.getUTCDate() - 61));

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(Date.UTC(
      lagosToday.getUTCFullYear(),
      lagosToday.getUTCMonth(),
      lagosToday.getUTCDate() - 6 + index
    ));
    const key = day.toISOString().slice(0, 10);
    const total = rows
      .filter((sale) => dayKey(new Date(sale.created_at)) === key)
      .reduce((sum, sale) => sum + Number(sale.total), 0);
    return {
      label: day.toLocaleDateString("en-NG", { weekday: "short", timeZone: "UTC" }),
      date: day.getUTCDate(),
      total,
    };
  });
  const chartDays = [];
  for (let cursor = new Date(rangeStart); cursor <= rangeEnd; cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 1))) {
    const key = cursor.toISOString().slice(0, 10);
    const total = rows
      .filter((sale) => dayKey(new Date(sale.created_at)) === key)
      .reduce((sum, sale) => sum + Number(sale.total), 0);
    chartDays.push({
      key,
      label: cursor.toLocaleDateString("en-NG", { weekday: "short", timeZone: "UTC" }),
      date: cursor.getUTCDate(),
      total,
    });
  }

  const productTotals = new Map<string, { name: string; quantity: number; amount: number; image: string }>();
  for (const sale of rows) {
    if (new Date(sale.created_at) < chartStart) continue;
    for (const item of sale.sale_items ?? []) {
      const product = products.find((row) => row.name === item.name);
      const current = productTotals.get(item.name) || { name: item.name, quantity: 0, amount: 0, image: product?.image_url || "" };
      current.quantity += Number(item.quantity);
      current.amount += Number(item.quantity) * Number(item.price);
      productTotals.set(item.name, current);
    }
  }

  const topProducts = [...productTotals.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const lowStock = products
    .filter((product) => product.stock <= product.low_stock_at)
    .slice(0, 5)
    .map((product) => ({ name: product.name, stock: product.stock }));

  return {
    weekSales,
    monthSales,
    weekCosts,
    netProfit,
    missingCostUnits: weekProfit.missing,
    prevWeekSales,
    prevMonthSales,
    prevWeekCosts,
    prevNetProfit,
    days,
    chartDays,
    chartFrom: rangeStart.toISOString().slice(0, 10),
    chartTo: rangeEnd.toISOString().slice(0, 10),
    topProducts,
    lowStock,
  };
}
