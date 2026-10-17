alter table public.businesses
  add column if not exists logo_url text,
  add column if not exists instagram text,
  add column if not exists tiktok text,
  add column if not exists website text;

drop function if exists public.current_membership();
create or replace function public.current_membership()
returns table (
  id uuid,
  name text,
  phone text,
  category text,
  slug text,
  logo_url text,
  instagram text,
  tiktok text,
  website text,
  role text
)
language sql
stable
security definer
set search_path = public
as $$
  select b.id, b.name, b.phone, b.category, b.slug, b.logo_url, b.instagram, b.tiktok, b.website, 'owner'::text
  from public.businesses b
  where b.owner_id = auth.uid()
  union all
  select b.id, b.name, b.phone, b.category, b.slug, b.logo_url, b.instagram, b.tiktok, b.website, s.role
  from public.staff_members s
  join public.businesses b on b.id = s.business_id
  where s.user_id = auth.uid()
    and s.active = true
    and not exists (
      select 1 from public.businesses owned where owned.owner_id = auth.uid()
    )
  limit 1;
$$;

grant execute on function public.current_membership() to authenticated;
