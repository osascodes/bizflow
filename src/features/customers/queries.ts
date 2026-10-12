import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getCustomers() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createServerSupabase();
  const [{ data: customers }, { data: debts }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, phone, created_at")
      .eq("business_id", business.id)
      .order("name"),
    supabase
      .from("debts")
      .select("customer_id, amount, paid")
      .eq("business_id", business.id),
  ]);

  return (customers ?? []).map((customer) => {
    const owed = (debts ?? [])
      .filter((debt) => debt.customer_id === customer.id)
      .reduce((sum, debt) => sum + Math.max(Number(debt.amount) - Number(debt.paid), 0), 0);
    return { ...customer, owed };
  });
}
