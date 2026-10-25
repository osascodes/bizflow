import { createServerSupabase } from '@/lib/supabase/server';

export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error && !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getSession() {
  try {
    const supabase = await createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
