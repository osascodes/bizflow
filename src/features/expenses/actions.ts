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
