import { createServerSupabase } from '@/lib/supabase/server';

export async function getAuthState() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user && !error) return { user, offline: false };

    const { data: { session } } = await supabase.auth.getSession();
    return { user: user ?? null, offline: Boolean(error || session) };
  } catch {
    return { user: null, offline: true };
  }
}

export async function getCurrentUser() {
  const { user } = await getAuthState();
  return user;
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
