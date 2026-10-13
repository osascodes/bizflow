create or replace function public.staff_can_view_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_members s
    where s.business_id = p_business_id
      and s.user_id = auth.uid()
      and s.active = true
  );
$$;

drop policy if exists "staff can view their shop" on public.businesses;
create policy "staff can view their shop"
  on public.businesses for select
  using (public.staff_can_view_business(id));
