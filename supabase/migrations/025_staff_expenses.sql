drop policy if exists "members manage expenses" on public.expenses;
create policy "members manage expenses"
  on public.expenses for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
