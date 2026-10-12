import { createServerSupabase } from "@/lib/supabase/server";

export async function getCurrentBusiness() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: owned, error: ownedError } = await supabase
    .from("businesses")
    .select("id, name, phone, category, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (ownedError) throw new Error(ownedError.message);
  if (owned) return { ...owned, role: "owner" as const };

  const { data: staff } = await supabase
    .from("staff_members")
    .select("role, businesses(id, name, phone, category, slug)")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  const shop = Array.isArray(staff?.businesses) ? staff.businesses[0] : staff?.businesses;
  if (!shop) return null;
  return { ...shop, role: staff?.role || "staff" };
}
