"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { onboardingSchema } from "./schema";
import { getCurrentBusiness } from "./queries";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `${base || "shop"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createBusinessAction(formData: FormData) {
  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid business details");
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in");

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    category: parsed.data.category,
    slug: slugify(parsed.data.name),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateBusinessAction(formData: FormData) {
  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    category: formData.get("category"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid business details");

  const business = await getCurrentBusiness();
  if (!business) throw new Error("Create your business first");

  const nameChanged = parsed.data.name.trim() !== business.name.trim();
  const nextSlug = nameChanged ? slugify(parsed.data.name) : business.slug;

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      category: parsed.data.category,
      slug: nextSlug,
    })
    .eq("id", business.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/storefront");
  revalidatePath(`/store/${business.slug}`);
  revalidatePath(`/store/${nextSlug}`);
}
