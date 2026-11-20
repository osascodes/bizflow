import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getRecentSales() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("id, total, created_at, sale_items(name, quantity, price)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function getTodaySalesTotal(day = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return 0;

  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("total")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  return (data ?? []).reduce((sum, sale) => sum + Number(sale.total), 0);
}

export async function getTodaySales(day = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("id, total, created_at, sale_items(name, quantity)")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []).map((sale) => ({
    id: sale.id,
    total: Number(sale.total),
    items: (sale.sale_items ?? []).map((item: { name: string; quantity: number }) => `${item.quantity} x ${item.name}`).join(", ") || "Sale",
    createdAt: sale.created_at as string,
  }));
}

export async function getTodayProfit(day = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return { revenue: 0, cogs: 0, missingUnits: 0 };
  const lagos = new Date(day.getTime() + 60 * 60 * 1000);
  const start = new Date(Date.UTC(lagos.getUTCFullYear(), lagos.getUTCMonth(), lagos.getUTCDate()) - 60 * 60 * 1000);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("total, sale_items(quantity, cost_price)")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());
  let revenue = 0;
  let cogs = 0;
  let missingUnits = 0;
  for (const sale of data ?? []) {
    revenue += Number(sale.total);
    for (const item of sale.sale_items ?? []) {
      if (item.cost_price == null) missingUnits += Number(item.quantity);
      else cogs += Number(item.cost_price) * Number(item.quantity);
    }
  }
  return { revenue, cogs, missingUnits };
}

export async function getDayClose(day = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return null;
  const lagos = new Date(day.getTime() + 60 * 60 * 1000);
  const start = new Date(Date.UTC(lagos.getUTCFullYear(), lagos.getUTCMonth(), lagos.getUTCDate()) - 60 * 60 * 1000);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, { data: payments }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total, created_at, sale_items(name, quantity)")
      .eq("business_id", business.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("title, amount")
      .eq("business_id", business.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
    supabase
      .from("debt_payments")
      .select("amount")
      .eq("business_id", business.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
  ]);

  const saleIds = (sales ?? []).map((sale) => sale.id);
  const { data: debts } = saleIds.length
    ? await supabase.from("debts").select("sale_id, amount, paid").eq("business_id", business.id).in("sale_id", saleIds)
    : { data: [] };

  const outstandingBySale = new Map<string, number>();
  for (const debt of debts ?? []) {
    if (!debt.sale_id) continue;
    const left = Math.max(0, Number(debt.amount) - Number(debt.paid));
    outstandingBySale.set(debt.sale_id, (outstandingBySale.get(debt.sale_id) || 0) + left);
  }

  let salesTotal = 0;
  let outstanding = 0;
  for (const sale of sales ?? []) {
    salesTotal += Number(sale.total);
    outstanding += outstandingBySale.get(sale.id) || 0;
  }
  const collectedOnSales = Math.max(0, salesTotal - outstanding);
  const debtPayments = (payments ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const expenseTotal = (expenses ?? []).reduce((sum, row) => sum + Number(row.amount), 0);

  return {
    shop: business.name,
    salesCount: (sales ?? []).length,
    salesTotal,
    collectedOnSales,
    debtPayments,
    collected: collectedOnSales + debtPayments,
    outstanding,
    expenses: expenseTotal,
    expenseRows: (expenses ?? []).map((row) => ({ title: row.title, amount: Number(row.amount) })),
  };
}
