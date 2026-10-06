"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

export async function recordSaleAction(formData: FormData) {
  const productId = String(formData.get("product_id") || "");
  const quantity = Number(formData.get("quantity") || 0);

  if (!productId) throw new Error("Pick a product");
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be at least 1");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("record_sale", {
    p_business_id: business.id,
    p_product_id: productId,
    p_quantity: quantity,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
