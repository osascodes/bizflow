alter table public.sales
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists sales_customer_id_idx on public.sales (customer_id, created_at desc);

create or replace function public.set_sale_customer(
  p_sale_id uuid,
  p_customer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select business_id into v_business_id from public.sales where id = p_sale_id;
  if v_business_id is null then
    raise exception 'Sale not found';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = v_business_id and b.owner_id = auth.uid()
  ) and not exists (
    select 1 from public.staff_members s
    where s.business_id = v_business_id
      and s.user_id = auth.uid()
      and s.active = true
  ) then
    raise exception 'Not allowed';
  end if;

  if not exists (
    select 1 from public.customers c
    where c.id = p_customer_id and c.business_id = v_business_id
  ) then
    raise exception 'Customer not found';
  end if;

  update public.sales set customer_id = p_customer_id where id = p_sale_id;
end;
$$;

grant execute on function public.set_sale_customer(uuid, uuid) to authenticated;
