create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null default 0,
  stock integer not null default 0,
  low_stock_at integer not null default 5,
  created_at timestamptz not null default now()
);

create index if not exists products_business_id_idx on public.products (business_id);

alter table public.products enable row level security;

drop policy if exists "owners manage products" on public.products;
create policy "owners manage products"
  on public.products
  for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.owner_id = auth.uid()
    )
  );

grant select, insert, update, delete on table public.products to authenticated;
grant all on table public.products to service_role;
