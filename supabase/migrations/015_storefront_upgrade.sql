alter table public.businesses
  add column if not exists hero_url text,
  add column if not exists store_headline text,
  add column if not exists store_description text;

alter table public.products
  add column if not exists description text;

alter table public.orders
  add column if not exists order_number text;

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
  hero_url text,
  store_headline text,
  store_description text,
  role text
)
language sql
stable
security definer
set search_path = public
as $$
  select b.id, b.name, b.phone, b.category, b.slug, b.logo_url, b.instagram, b.tiktok, b.website, b.hero_url, b.store_headline, b.store_description, 'owner'::text
  from public.businesses b
  where b.owner_id = auth.uid()
  union all
  select b.id, b.name, b.phone, b.category, b.slug, b.logo_url, b.instagram, b.tiktok, b.website, b.hero_url, b.store_headline, b.store_description, s.role
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
