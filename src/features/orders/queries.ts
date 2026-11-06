import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getOrdersToDoCount() {
  const business = await getCurrentBusiness();
  if (!business) return 0;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("business_id", business.id)
    .in("status", ["pending", "packed", "out"]);
  const numbers = new Set((data ?? []).map((order) => order.order_number || order.id));
  return numbers.size;
}
