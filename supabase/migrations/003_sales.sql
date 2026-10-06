create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity integer not null,
  price numeric(12,2) not null
);

create index if not exists sales_business_id_idx on public.sales (business_id, created_at desc);

alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "owners manage sales" on public.sales;
create policy "owners manage sales"
  on public.sales for all
  using (exists (select 1 from public.businesses b where b.id = sales.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = sales.business_id and b.owner_id = auth.uid()));

drop policy if exists "owners manage sale items" on public.sale_items;
create policy "owners manage sale items"
  on public.sale_items for all
  using (exists (
    select 1 from public.sales s
    join public.businesses b on b.id = s.business_id
    where s.id = sale_items.sale_id and b.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.sales s
    join public.businesses b on b.id = s.business_id
    where s.id = sale_items.sale_id and b.owner_id = auth.uid()
  ));

grant select, insert, update, delete on public.sales to authenticated;
grant select, insert, update, delete on public.sale_items to authenticated;

create or replace function public.record_sale(p_business_id uuid, p_product_id uuid, p_quantity integer)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_price numeric;
  v_stock integer;
  v_name text;
  v_sale_id uuid;
begin
  if p_quantity < 1 then
    raise exception 'Quantity must be at least 1';
  end if;

  if not exists (
    select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()
  ) then
    raise exception 'Not allowed';
  end if;

  select name, price, stock into v_name, v_price, v_stock
  from public.products
  where id = p_product_id and business_id = p_business_id
  for update;

  if v_name is null then
    raise exception 'Product not found';
  end if;

  if v_stock < p_quantity then
    raise exception 'Not enough stock';
  end if;

  insert into public.sales (business_id, total)
  values (p_business_id, v_price * p_quantity)
  returning id into v_sale_id;

  insert into public.sale_items (sale_id, product_id, name, quantity, price)
  values (v_sale_id, p_product_id, v_name, p_quantity, v_price);

  update public.products
  set stock = stock - p_quantity
  where id = p_product_id;

  return v_sale_id;
end;
$$;

grant execute on function public.record_sale(uuid, uuid, integer) to authenticated;
