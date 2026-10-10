alter table public.products add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "owners upload product images" on storage.objects;
create policy "owners upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');
