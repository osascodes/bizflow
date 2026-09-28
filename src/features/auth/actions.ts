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
