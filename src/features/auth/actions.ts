'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        phone: formData.get('phone') as string,
      },
    },
  });

  if (error) throw new Error(error.message);

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createServerSupabase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo: `${appUrl}/reset-password` },
  );

  if (error) throw new Error(error.message);
  return { success: true, message: 'Check your email for a reset link' };
}

export async function updateAccountAction(formData: FormData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const photo = formData.get("photo");
  let avatar = (user.user_metadata?.avatar_url as string | undefined) || "";
  if (photo instanceof File && photo.size > 0) {
    const safeName = photo.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const path = `${user.id}/avatar-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, photo, { contentType: photo.type || "image/jpeg" });
    if (uploadError) throw new Error(uploadError.message);
    avatar = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName, phone, avatar_url: avatar },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/account");
  revalidatePath("/dashboard");
}
