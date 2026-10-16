drop policy if exists "staff can view own row" on public.staff_members;
create policy "staff can view own row"
  on public.staff_members for select
  using (user_id = auth.uid());

create or replace function public.current_membership()
returns table (
  id uuid,
  name text,
  phone text,
  category text,
  slug text,
  role text
)
language sql
stable
security definer
set search_path = public
as $$
  select b.id, b.name, b.phone, b.category, b.slug, 'owner'::text
  from public.businesses b
  where b.owner_id = auth.uid()
  union all
  select b.id, b.name, b.phone, b.category, b.slug, s.role
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
