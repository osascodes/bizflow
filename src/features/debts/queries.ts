import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getCustomers() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDebts() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("debts")
    .select("id, amount, paid, note, created_at, customers(name, phone)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDebtsDue() {
  const debts = await getDebts();
  return debts.reduce((sum, debt) => sum + Math.max(0, Number(debt.amount) - Number(debt.paid)), 0);
}
