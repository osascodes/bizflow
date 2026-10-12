"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { staffSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createStaffAction(formData: FormData) {
  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    role: formData.get("role"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid staff");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("staff_members").insert({
    business_id: business.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    role: parsed.data.role,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/staff");
}

export async function toggleStaffAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  const business = await getCurrentBusiness();
  if (!business || !id) throw new Error("Missing staff");

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("staff_members")
    .update({ active: !active })
    .eq("id", id)
    .eq("business_id", business.id);
  if (error) throw new Error(error.message);
  revalidatePath("/staff");
}
