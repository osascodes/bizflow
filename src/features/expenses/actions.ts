"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

const categories = ["Stock", "Rent", "Transport", "Ads", "Other"];

export async function createExpenseAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "Other");
  const amount = Number(formData.get("amount") || 0);

  if (title.length < 2) throw new Error("Expense name is required");
  if (!categories.includes(category)) throw new Error("Pick a category");
  if (amount <= 0) throw new Error("Amount must be greater than 0");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("expenses").insert({
    business_id: business.id,
    title,
    category,
    amount,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteExpenseAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Cost not found" };
  const business = await getCurrentBusiness();
  if (!business) return { error: "Create your business first" };
  if (business.role !== "owner") return { error: "Only the owner can remove a cost" };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("business_id", business.id);
  if (error) return { error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { error: "" };
}
