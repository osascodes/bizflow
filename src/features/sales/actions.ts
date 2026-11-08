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

  const onCredit = formData.get("on_credit") === "on";
  const customerId = String(formData.get("customer_id") || "");
  const discount = Number(formData.get("discount") || 0);
  if (onCredit && !customerId) throw new Error("Pick a customer for a credit sale");
  if (discount < 0) throw new Error("Discount cannot be negative");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { data: saleId, error } = await supabase.rpc("record_cart_sale", {
    p_business_id: business.id,
    p_items: items,
  });
  if (error) throw new Error(error.message);

  if (discount > 0) {
    const { error: discountError } = await supabase.rpc("apply_sale_discount", {
      p_sale_id: saleId,
      p_discount: discount,
    });
    if (discountError) throw new Error(discountError.message);
  }

  if (customerId) {
    const { error: linkError } = await supabase.rpc("set_sale_customer", {
      p_sale_id: saleId,
      p_customer_id: customerId,
    });
    if (linkError) throw new Error(linkError.message);
  }

  if (onCredit) {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("total")
      .eq("id", saleId)
      .single();
    if (saleError) throw new Error(saleError.message);

    const { error: debtError } = await supabase.rpc("create_sale_debt", {
      p_business_id: business.id,
      p_customer_id: customerId,
      p_amount: sale.total,
      p_note: "Shop sale on credit",
      p_sale_id: saleId,
    });
    if (debtError) throw new Error(debtError.message);
  }

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/debts");
  revalidatePath("/customers");
}

export async function deleteSaleAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Sale not found" };
  const business = await getCurrentBusiness();
  if (!business) return { error: "Create your business first" };
  if (business.role !== "owner") return { error: "Only the owner can remove a sale" };

  const supabase = await createServerSupabase();
  const { data: sale, error: readError } = await supabase
    .from("sales")
    .select("id, sale_items(product_id, quantity)")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();
  if (readError || !sale) return { error: readError?.message || "Sale not found" };

  for (const item of sale.sale_items ?? []) {
    if (!item.product_id) continue;
    const { data: product } = await supabase.from("products").select("stock").eq("id", item.product_id).eq("business_id", business.id).single();
    if (!product) continue;
    const { error: stockError } = await supabase.from("products").update({ stock: Number(product.stock) + Number(item.quantity) }).eq("id", item.product_id);
    if (stockError) return { error: stockError.message };
  }

  const { error } = await supabase.from("sales").delete().eq("id", id).eq("business_id", business.id);
  if (error) return { error: error.message };

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return { error: "" };
}
