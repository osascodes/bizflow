import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getStaff() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("staff_members")
    .select("id, name, phone, role, active, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}
