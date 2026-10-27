"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

export async function recordSaleAction(formData: FormData) {
  const raw = String(formData.get("items") || "");
  let items: { product_id: string; quantity: number }[] = [];
  try {
    items = JSON.parse(raw);
  } catch {
    items = [];
  }

  if (!Array.isArray(items) || items.length === 0) throw new Error("Add at least one item");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("record_cart_sale", {
    p_business_id: business.id,
    p_items: items,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
