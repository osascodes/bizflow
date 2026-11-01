alter table public.sales
  add column if not exists discount numeric(12,2) not null default 0;

create or replace function public.apply_sale_discount(p_sale_id uuid, p_discount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_total numeric;
begin
  if p_discount < 0 then
    raise exception 'Discount cannot be negative';
  end if;

  select business_id, total into v_business_id, v_total
  from public.sales
  where id = p_sale_id;

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

  if p_discount > v_total then
    raise exception 'Discount is more than the total';
  end if;

  update public.sales
  set discount = p_discount,
      total = v_total - p_discount
  where id = p_sale_id;
end;
$$;

grant execute on function public.apply_sale_discount(uuid, numeric) to authenticated;
