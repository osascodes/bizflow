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
