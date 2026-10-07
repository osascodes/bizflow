"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (name.length < 2) throw new Error("Customer name is required");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("customers").insert({
    business_id: business.id,
    name,
    phone: phone || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/debts");
}

export async function createDebtAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") || "");
  const amount = Number(formData.get("amount") || 0);
  const note = String(formData.get("note") || "").trim();
  if (!customerId) throw new Error("Pick a customer");
  if (amount <= 0) throw new Error("Amount must be greater than 0");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("debts").insert({
    business_id: business.id,
    customer_id: customerId,
    amount,
    note: note || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/debts");
  revalidatePath("/dashboard");
}

export async function recordPaymentAction(formData: FormData) {
  const debtId = String(formData.get("debt_id") || "");
  const payment = Number(formData.get("payment") || 0);
  if (!debtId) throw new Error("Missing debt");
  if (payment <= 0) throw new Error("Payment must be greater than 0");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { data: debt, error: readError } = await supabase
    .from("debts")
    .select("id, amount, paid")
    .eq("id", debtId)
    .eq("business_id", business.id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!debt) throw new Error("Debt not found");

  const nextPaid = Math.min(Number(debt.amount), Number(debt.paid) + payment);
  const { error } = await supabase.from("debts").update({ paid: nextPaid }).eq("id", debt.id);
  if (error) throw new Error(error.message);
  revalidatePath("/debts");
  revalidatePath("/dashboard");
}
