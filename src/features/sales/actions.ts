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
  if (onCredit && !customerId) throw new Error("Pick a customer for a credit sale");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { data: saleId, error } = await supabase.rpc("record_cart_sale", {
    p_business_id: business.id,
    p_items: items,
  });
  if (error) throw new Error(error.message);

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
