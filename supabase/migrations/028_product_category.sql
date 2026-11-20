alter table public.products add column if not exists category text;
create index if not exists products_business_category_idx on public.products (business_id, category);
