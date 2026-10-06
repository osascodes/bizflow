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

export async function getTodaySalesTotal() {
  const business = await getCurrentBusiness();
  if (!business) return 0;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("total")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString());

  return (data ?? []).reduce((sum, sale) => sum + Number(sale.total), 0);
}
