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

function clean(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

async function upload(supabase: Awaited<ReturnType<typeof createServerSupabase>>, businessId: string, file: File, prefix: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
  const path = `${businessId}/${prefix}-${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
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
  const logo = formData.get("logo");
  const hero = formData.get("hero");
  let logoUrl = business.logo_url || null;
  let heroUrl = business.hero_url || null;

  if (logo instanceof File && logo.size > 0) logoUrl = await upload(supabase, business.id, logo, "logo");
  if (hero instanceof File && hero.size > 0) heroUrl = await upload(supabase, business.id, hero, "hero");

  const { data, error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      category: parsed.data.category,
      slug: nextSlug,
      logo_url: logoUrl,
      hero_url: heroUrl,
      store_headline: clean(formData.get("store_headline")),
      store_description: clean(formData.get("store_description")),
      instagram: clean(formData.get("instagram")),
      tiktok: clean(formData.get("tiktok")),
      website: clean(formData.get("website")),
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
