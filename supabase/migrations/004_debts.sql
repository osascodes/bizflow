create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount numeric(12,2) not null,
  paid numeric(12,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists customers_business_id_idx on public.customers (business_id);
create index if not exists debts_business_id_idx on public.debts (business_id);

alter table public.customers enable row level security;
alter table public.debts enable row level security;

drop policy if exists "owners manage customers" on public.customers;
create policy "owners manage customers"
  on public.customers for all
  using (exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = customers.business_id and b.owner_id = auth.uid()));

drop policy if exists "owners manage debts" on public.debts;
create policy "owners manage debts"
  on public.debts for all
  using (exists (select 1 from public.businesses b where b.id = debts.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = debts.business_id and b.owner_id = auth.uid()));

grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.debts to authenticated;
