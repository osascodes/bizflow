create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  role text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists staff_members_business_id_idx on public.staff_members (business_id, created_at desc);

alter table public.staff_members enable row level security;

drop policy if exists "owners manage staff" on public.staff_members;
create policy "owners manage staff"
  on public.staff_members for all
  using (exists (select 1 from public.businesses b where b.id = staff_members.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = staff_members.business_id and b.owner_id = auth.uid()));

grant select, insert, update, delete on public.staff_members to authenticated;
