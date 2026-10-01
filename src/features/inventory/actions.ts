"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { productSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid product");
  }

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("products").insert({
    business_id: business.id,
    name: parsed.data.name,
    price: parsed.data.price,
    stock: parsed.data.stock,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
