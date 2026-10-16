import { createServerSupabase } from "@/lib/supabase/server";

export async function getCurrentBusiness() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase.rpc("current_membership");
  const row = Array.isArray(membership) ? membership[0] : membership;
  if (row?.id) return row;

  const { data: owned } = await supabase
    .from("businesses")
    .select("id, name, phone, category, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (owned) return { ...owned, role: "owner" };

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
