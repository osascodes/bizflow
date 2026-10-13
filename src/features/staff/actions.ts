"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { staffSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function inviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createStaffAction(formData: FormData) {
  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid staff");

  const business = await getCurrentBusiness();
  if (!business || business.role !== "owner") throw new Error("Only the owner can add staff");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("staff_members").insert({
    business_id: business.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email.toLowerCase(),
    role: parsed.data.role,
    invite_code: inviteCode(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/staff");
}

export async function toggleStaffAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  const business = await getCurrentBusiness();
  if (!business || business.role !== "owner" || !id) throw new Error("Missing staff");

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("staff_members")
    .update({ active: !active })
    .eq("id", id)
    .eq("business_id", business.id);
  if (error) throw new Error(error.message);
  revalidatePath("/staff");
}

export async function joinStaffAction(formData: FormData) {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (code.length < 4) throw new Error("Enter the invite code");
  if (!email.includes("@")) throw new Error("Enter the invited email");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const supabase = await createServerSupabase();
  const { data: invitedEmail, error: previewError } = await supabase.rpc("preview_staff_invite", { p_code: code });
  if (previewError) throw new Error(previewError.message);
  if (!invitedEmail) {
    throw new Error("This code was already used. Do not join again. Log in with that email and password.");
  }
  if (String(invitedEmail).toLowerCase() !== email) throw new Error("Use the email the owner invited");

  const { data: created, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw new Error(signUpError.message);
  if (!created.session) throw new Error("Turn off Confirm email in Supabase Auth, then try again.");

  const { data: joined, error } = await supabase.rpc("accept_staff_invite", { p_code: code, p_email: email });
  if (error) throw new Error(error.message);
  if (!joined) throw new Error("Could not link this login to the shop");

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
