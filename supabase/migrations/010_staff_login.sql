alter table public.staff_members add column if not exists email text;
alter table public.staff_members add column if not exists user_id uuid;
alter table public.staff_members add column if not exists invite_code text;

create unique index if not exists staff_members_invite_code_idx on public.staff_members (invite_code);
create index if not exists staff_members_user_id_idx on public.staff_members (user_id);

create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from public.businesses b
      where b.id = p_business_id and b.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.staff_members s
      where s.business_id = p_business_id
        and s.user_id = auth.uid()
        and s.active = true
    );
$$;

drop policy if exists "staff can view their shop" on public.businesses;
create policy "staff can view their shop"
  on public.businesses for select
  using (
    exists (
      select 1 from public.staff_members s
      where s.business_id = businesses.id
        and s.user_id = auth.uid()
        and s.active = true
    )
  );

drop policy if exists "members manage products" on public.products;
create policy "members manage products"
  on public.products for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "members manage sales" on public.sales;
create policy "members manage sales"
  on public.sales for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "members manage sale items" on public.sale_items;
create policy "members manage sale items"
  on public.sale_items for all
  using (exists (select 1 from public.sales s where s.id = sale_items.sale_id and public.is_business_member(s.business_id)))
  with check (exists (select 1 from public.sales s where s.id = sale_items.sale_id and public.is_business_member(s.business_id)));

drop policy if exists "members manage customers" on public.customers;
create policy "members manage customers"
  on public.customers for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "members manage debts" on public.debts;
create policy "members manage debts"
  on public.debts for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "members manage orders" on public.orders;
create policy "members manage orders"
  on public.orders for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
