-- Align completed inspection UPDATE RLS with app permissions
-- (inspection:edit-completed — ADMIN, MANAGER, INSPECTOR)

drop policy if exists "Operators can update draft inspections" on public.monthly_inspections;

create policy "Operators can update monthly inspections" on public.monthly_inspections
for update to authenticated
using (
  app_private.has_role(array['ADMIN'])
  or (
    app_private.has_role(array['MANAGER', 'INSPECTOR'])
    and status in ('draft', 'needs_revision', 'completed')
  )
)
with check (
  app_private.has_role(array['ADMIN'])
  or (
    app_private.has_role(array['MANAGER', 'INSPECTOR'])
    and status in ('draft', 'needs_revision', 'completed')
  )
);

drop policy if exists "Operators can update draft inspection items" on public.monthly_inspection_items;

create policy "Operators can update inspection items" on public.monthly_inspection_items
for update to authenticated
using (
  app_private.has_role(array['ADMIN'])
  or (
    app_private.has_role(array['MANAGER', 'INSPECTOR'])
    and exists (
      select 1 from public.monthly_inspections
      where monthly_inspections.id = monthly_inspection_items.inspection_id
        and monthly_inspections.status in ('draft', 'needs_revision', 'completed')
    )
  )
)
with check (
  app_private.has_role(array['ADMIN'])
  or (
    app_private.has_role(array['MANAGER', 'INSPECTOR'])
    and exists (
      select 1 from public.monthly_inspections
      where monthly_inspections.id = monthly_inspection_items.inspection_id
        and monthly_inspections.status in ('draft', 'needs_revision', 'completed')
    )
  )
);
