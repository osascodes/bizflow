create or replace function public.create_sale_debt(
  p_business_id uuid,
  p_customer_id uuid,
  p_amount numeric,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = p_business_id and b.owner_id = auth.uid()
  ) and not exists (
    select 1 from public.staff_members s
    where s.business_id = p_business_id
      and s.user_id = auth.uid()
      and s.active = true
  ) then
    raise exception 'Not allowed';
  end if;

  if not exists (
    select 1 from public.customers c
    where c.id = p_customer_id and c.business_id = p_business_id
  ) then
    raise exception 'Customer not found';
  end if;

  insert into public.debts (business_id, customer_id, amount, note)
  values (p_business_id, p_customer_id, p_amount, nullif(p_note, ''))
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_sale_debt(uuid, uuid, numeric, text) to authenticated;
