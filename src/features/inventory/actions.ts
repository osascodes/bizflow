"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { productSchema } from "./schema";
import { revalidatePath } from "next/cache";

async function uploadProductImage(supabase: Awaited<ReturnType<typeof createServerSupabase>>, businessId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
  const path = `${businessId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

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
  const file = formData.get("image");
  const imageUrl = file instanceof File && file.size > 0
    ? await uploadProductImage(supabase, business.id, file)
    : null;

  const { error } = await supabase.from("products").insert({
    business_id: business.id,
    name: parsed.data.name,
    price: parsed.data.price,
    stock: parsed.data.stock,
    image_url: imageUrl,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

export async function updateProductAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    stock: formData.get("stock"),
  });
  if (!id) throw new Error("Missing product");
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid product");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const file = formData.get("image");
  const updates: { name: string; price: number; stock: number; image_url?: string } = {
    name: parsed.data.name,
    price: parsed.data.price,
    stock: parsed.data.stock,
  };

  if (file instanceof File && file.size > 0) {
    updates.image_url = await uploadProductImage(supabase, business.id, file);
  }

  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("business_id", business.id);

  if (error) throw new Error(error.message);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
