import { createServerSupabase } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && !user) throw error;
  return user;
}

export async function getSession() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
