alter table public.products
  add column if not exists created_at timestamptz default now();

create or replace function public.store_best_sellers(shop_id uuid)
returns table(product_id uuid, sold bigint)
language sql
stable
security definer
set search_path = public
as $$
  select si.product_id, sum(si.quantity)::bigint as sold
  from public.sale_items si
  join public.sales s on s.id = si.sale_id
  where s.business_id = shop_id
    and si.product_id is not null
  group by si.product_id
  order by sold desc
  limit 6;
$$;

grant execute on function public.store_best_sellers(uuid) to anon, authenticated;
