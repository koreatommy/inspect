-- Align monthly inspection DELETE RLS with app permissions
-- (ADMIN, MANAGER, INSPECTOR — settings:inspection-history-manage)

drop policy if exists "Admins can delete monthly inspections" on public.monthly_inspections;

create policy "Operators can delete monthly inspections" on public.monthly_inspections
for delete to authenticated
using (app_private.has_role(array['ADMIN', 'MANAGER', 'INSPECTOR']));

drop policy if exists "Admins can delete inspection items" on public.monthly_inspection_items;

create policy "Operators can delete inspection items" on public.monthly_inspection_items
for delete to authenticated
using (app_private.has_role(array['ADMIN', 'MANAGER', 'INSPECTOR']));

-- CASCADE from monthly_inspections also deletes ledger rows; operators need DELETE here.
create policy "Operators can delete ledger rows" on public.inspection_ledger_rows
for delete to authenticated
using (app_private.has_role(array['ADMIN', 'MANAGER', 'INSPECTOR']));
