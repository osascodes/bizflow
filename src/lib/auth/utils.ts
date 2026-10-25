import { createServerSupabase } from '@/lib/supabase/server';

export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, offline: Boolean(error && !user) };
  } catch {
    return { user: null, offline: true };
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
