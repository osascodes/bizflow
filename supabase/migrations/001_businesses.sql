create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  category text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  unique (owner_id)
);

create index if not exists businesses_owner_id_idx on public.businesses (owner_id);
create index if not exists businesses_slug_idx on public.businesses (slug);

alter table public.businesses enable row level security;

drop policy if exists "owners manage own business" on public.businesses;
create policy "owners manage own business"
  on public.businesses
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
