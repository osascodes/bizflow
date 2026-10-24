create or replace function public.complete_store_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
  v_price numeric;
  v_stock integer;
  v_name text;
  v_sale_id uuid;
  v_total numeric := 0;
begin
  select * into v_order from public.orders where id = p_order_id;
  if v_order.id is null then
    raise exception 'Order not found';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = v_order.business_id and b.owner_id = auth.uid()
  ) and not exists (
    select 1 from public.staff_members s
    where s.business_id = v_order.business_id
      and s.user_id = auth.uid()
      and s.active = true
  ) then
    raise exception 'Not allowed';
  end if;

  insert into public.sales (business_id, total)
  values (v_order.business_id, 0)
  returning id into v_sale_id;

  for v_item in
    select * from public.orders
    where business_id = v_order.business_id
      and status = 'pending'
      and (
        (v_order.order_number is not null and order_number = v_order.order_number)
        or id = v_order.id
      )
  loop
    if v_item.product_id is null then
      raise exception 'Product missing on order';
    end if;

    select name, price, stock into v_name, v_price, v_stock
    from public.products
    where id = v_item.product_id and business_id = v_item.business_id
    for update;

    if v_name is null then
      raise exception 'Product not found';
    end if;
    if v_stock < v_item.quantity then
      raise exception 'Not enough stock for %', v_name;
    end if;

    insert into public.sale_items (sale_id, product_id, name, quantity, price)
    values (v_sale_id, v_item.product_id, v_name, v_item.quantity, v_price);

    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;

    update public.orders set status = 'done' where id = v_item.id;
    v_total := v_total + (v_price * v_item.quantity);
  end loop;

  if v_total = 0 then
    delete from public.sales where id = v_sale_id;
  else
    update public.sales set total = v_total where id = v_sale_id;
  end if;
end;
$$;

grant execute on function public.complete_store_order(uuid) to authenticated;
