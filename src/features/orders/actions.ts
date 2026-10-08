"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

export async function placeCartAction(input: {
  businessId: string;
  slug: string;
  customerName: string;
  customerPhone: string;
  items: { productId: string; productName: string; quantity: number }[];
}) {
  if (input.customerName.trim().length < 2) throw new Error("Name is required");
  if (input.customerPhone.trim().length < 10) throw new Error("Phone is required");
  if (input.items.length === 0) throw new Error("Add a product first");

  const supabase = await createServerSupabase();
  const rows = input.items.map((item) => ({
    business_id: input.businessId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
  }));

  const { error } = await supabase.from("orders").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath(`/store/${input.slug}`);
  revalidatePath("/storefront");
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("order_id") || "");
  const status = String(formData.get("status") || "");
  if (!orderId || !["pending", "done", "cancelled"].includes(status)) throw new Error("Invalid order");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("business_id", business.id);
  if (error) throw new Error(error.message);
  revalidatePath("/storefront");
}
