create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists debt_payments_business_id_idx on public.debt_payments (business_id, created_at desc);
alter table public.debt_payments enable row level security;

drop policy if exists "members manage debt payments" on public.debt_payments;
create policy "members manage debt payments"
  on public.debt_payments for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

grant select, insert, update, delete on public.debt_payments to authenticated;
