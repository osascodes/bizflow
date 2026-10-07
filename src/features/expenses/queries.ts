import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getExpenses() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("expenses")
    .select("id, title, category, amount, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function getTodayExpenses() {
  const business = await getCurrentBusiness();
  if (!business) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("expenses")
    .select("amount")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString());
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}
