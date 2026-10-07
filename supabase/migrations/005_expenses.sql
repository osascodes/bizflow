create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  category text not null,
  amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_business_id_idx on public.expenses (business_id, created_at desc);

alter table public.expenses enable row level security;

drop policy if exists "owners manage expenses" on public.expenses;
create policy "owners manage expenses"
  on public.expenses for all
  using (exists (select 1 from public.businesses b where b.id = expenses.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = expenses.business_id and b.owner_id = auth.uid()));

grant select, insert, update, delete on public.expenses to authenticated;
