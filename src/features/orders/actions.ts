"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

export async function placeOrderAction(formData: FormData) {
  const businessId = String(formData.get("business_id") || "");
  const productId = String(formData.get("product_id") || "");
  const productName = String(formData.get("product_name") || "");
  const quantity = Number(formData.get("quantity") || 0);
  const customerName = String(formData.get("customer_name") || "").trim();
  const customerPhone = String(formData.get("customer_phone") || "").trim();
  const slug = String(formData.get("slug") || "");

  if (!businessId || !productId || !productName) throw new Error("Pick a product");
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be at least 1");
  if (customerName.length < 2) throw new Error("Name is required");
  if (customerPhone.length < 10) throw new Error("Phone is required");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("orders").insert({
    business_id: businessId,
    product_id: productId,
    product_name: productName,
    quantity,
    customer_name: customerName,
    customer_phone: customerPhone,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/store/${slug}`);
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
