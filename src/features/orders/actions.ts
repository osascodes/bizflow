"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

function orderNumber() {
  return `BF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

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
  const number = orderNumber();
  const rows = input.items.map((item) => ({
    business_id: input.businessId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    order_number: number,
  }));

  const { error } = await supabase.from("orders").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath(`/store/${input.slug}`);
  revalidatePath("/storefront");
  return { orderNumber: number };
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("order_id") || "");
  const status = String(formData.get("status") || "");
  if (!orderId || !["pending", "packed", "out", "done", "cancelled"].includes(status)) return { error: "Invalid order" };

  const business = await getCurrentBusiness();
  if (!business) return { error: "Create your business first" };

  const supabase = await createServerSupabase();
  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, order_number, product_id, product_name, quantity")
    .eq("id", orderId)
    .eq("business_id", business.id)
    .single();
  if (readError || !order) return { error: readError?.message || "Order not found" };

  const rows = [order];

  if (status === "done") {
    const { error } = await supabase.rpc("complete_store_order", { p_order_id: orderId });
    if (error) {
      for (const row of rows) {
        if (!row.product_id) continue;
        const { data: product } = await supabase.from("products").select("name, price, stock").eq("id", row.product_id).eq("business_id", business.id).single();
        if (!product) continue;
        if (Number(product.stock) < Number(row.quantity)) return { error: `Not enough stock for ${product.name}` };
        const { data: sale, error: saleError } = await supabase.from("sales").insert({ business_id: business.id, total: Number(product.price) * Number(row.quantity) }).select("id").single();
        if (saleError || !sale) return { error: saleError?.message || "Could not record the sale" };
        const { error: itemError } = await supabase.from("sale_items").insert({ sale_id: sale.id, product_id: row.product_id, name: product.name, quantity: row.quantity, price: product.price });
        if (itemError) return { error: itemError.message };
        const { error: stockError } = await supabase.from("products").update({ stock: Number(product.stock) - Number(row.quantity) }).eq("id", row.product_id);
        if (stockError) return { error: stockError.message };
      }
      const { error: doneError } = await supabase.from("orders").update({ status: "done" }).eq("business_id", business.id).eq("id", orderId);
      if (doneError) return { error: doneError.message };
    }
  } else {
    const { error } = await supabase.from("orders").update({ status }).eq("business_id", business.id).eq("id", orderId);
    if (error) return { error: error.message };
  }

  revalidatePath("/storefront");
  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return { error: "" };
}
