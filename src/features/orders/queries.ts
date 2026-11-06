import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getOrdersToDoCount() {
  const business = await getCurrentBusiness();
  if (!business) return 0;
  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .in("status", ["pending", "packed", "out"]);
  return count || 0;
}
