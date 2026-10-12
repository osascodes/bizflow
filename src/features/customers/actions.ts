"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { customerSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid customer");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("customers").insert({
    business_id: business.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/customers");
}
