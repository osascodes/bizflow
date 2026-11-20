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
