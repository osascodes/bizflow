import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getCustomerHistory(customerId: string) {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const supabase = await createServerSupabase();
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .single();
  if (!customer) return null;

  const [{ data: sales }, { data: debts }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total, created_at, sale_items(name, quantity, price)")
      .eq("business_id", business.id)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("debts")
      .select("id, amount, paid, note, created_at")
      .eq("business_id", business.id)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  const owed = (debts ?? []).reduce((sum, debt) => sum + Math.max(Number(debt.amount) - Number(debt.paid), 0), 0);
  return { customer, sales: sales ?? [], debts: debts ?? [], owed };
}
