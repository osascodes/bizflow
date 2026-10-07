drop policy if exists "public can view shops" on public.businesses;
create policy "public can view shops"
  on public.businesses for select
  using (true);

drop policy if exists "public can view in stock products" on public.products;
create policy "public can view in stock products"
  on public.products for select
  using (stock > 0);

grant select on public.businesses to anon;
grant select on public.products to anon;
