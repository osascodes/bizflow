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

export async function getTodayExpenses(day = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return 0;
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("expenses")
    .select("amount")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function getTodayCosts(day = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("expenses")
    .select("id, title, amount, created_at")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    createdAt: row.created_at as string,
  }));
}
