create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  customer_name text not null,
  customer_phone text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists orders_business_id_idx on public.orders (business_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "owners manage orders" on public.orders;
create policy "owners manage orders"
  on public.orders for all
  using (exists (select 1 from public.businesses b where b.id = orders.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = orders.business_id and b.owner_id = auth.uid()));

drop policy if exists "public can place orders" on public.orders;
create policy "public can place orders"
  on public.orders for insert
  with check (true);

grant select, insert, update, delete on public.orders to authenticated;
grant insert on public.orders to anon;
