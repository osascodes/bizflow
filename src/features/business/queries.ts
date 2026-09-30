import { createServerSupabase } from "@/lib/supabase/server";

export async function getCurrentBusiness() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("id, name, phone, category, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  return data;
}
