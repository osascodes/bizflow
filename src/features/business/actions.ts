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

function cleanLink(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
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

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    category: parsed.data.category,
    slug: slugify(parsed.data.name),
  });

  if (error?.code === "23505") {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
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
  if (business.role !== "owner") throw new Error("Only the owner can edit shop details");

  const nextSlug = slugify(parsed.data.name);
  const supabase = await createServerSupabase();
  const file = formData.get("logo");
  let logoUrl = business.logo_url || null;

  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const path = `${business.id}/logo-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type || "image/jpeg" });
    if (uploadError) throw new Error(uploadError.message);
    logoUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      category: parsed.data.category,
      slug: nextSlug,
      logo_url: logoUrl,
      instagram: cleanLink(formData.get("instagram")),
      tiktok: cleanLink(formData.get("tiktok")),
      website: cleanLink(formData.get("website")),
    })
    .eq("id", business.id)
    .select("slug")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/storefront");
  revalidatePath("/settings");
  revalidatePath(`/store/${business.slug}`);
  revalidatePath(`/store/${nextSlug}`);
  return { slug: data.slug };
}
