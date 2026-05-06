create schema if not exists app_private;

create extension if not exists pgcrypto with schema extensions;

create table public.inspection_user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'VIEWER' check (role in ('ADMIN', 'MANAGER', 'INSPECTOR', 'VIEWER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null unique,
  facility_name text not null,
  zip_code text,
  lot_address text,
  road_address text,
  installed_date date,
  accepted_date date,
  closed_date date,
  facility_area numeric,
  install_place_code text,
  install_place_name text,
  duty_code text,
  duty_type_name text,
  public_private_code text,
  public_private_name text,
  operation_status_code text,
  operation_status_name text,
  indoor_outdoor_code text,
  indoor_outdoor_name text,
  region_code text,
  region_name text,
  latitude numeric,
  longitude numeric,
  raw_json jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references public.facilities(facility_no) on update cascade,
  equipment_no text not null,
  facility_name text,
  equipment_name text not null,
  equipment_manage_no text,
  equipment_location text,
  equipment_installed_date date,
  installer_name text,
  manufacturer_name text,
  certification_no text,
  equipment_type_code text,
  equipment_type_name text,
  equipment_subtype_code text,
  equipment_subtype_name text,
  raw_json jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facility_no, equipment_no)
);

create table public.facility_legal_inspections (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references public.facilities(facility_no) on update cascade,
  inspection_type_code text,
  inspection_type_name text,
  installed_date date,
  valid_until date,
  pass_yn text,
  inspection_date date,
  judgment_date date,
  inspection_no text,
  inspection_pic text,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.safety_educations (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references public.facilities(facility_no) on update cascade,
  safety_education_no text,
  certificate_no text,
  education_date date,
  valid_until date,
  institution_name text,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.liability_insurances (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references public.facilities(facility_no) on update cascade,
  insurance_manage_no text,
  insurance_product_name text,
  join_date date,
  maturity_date date,
  insurance_policy_no text,
  insurer text,
  insurance_content text,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facility_managers (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references public.facilities(facility_no) on update cascade,
  manager_no text,
  business_no text,
  company_name text,
  representative_name text,
  tel_no text,
  fax_no text,
  email text,
  road_address text,
  facility_representative_code text,
  facility_representative_name text,
  manager_type_code text,
  manager_type_name text,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.monthly_inspections (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references public.facilities(facility_no) on update cascade,
  inspection_month text not null check (inspection_month ~ '^[0-9]{4}-[0-9]{2}$'),
  inspection_date date not null,
  status text not null default 'draft' check (status in ('draft', 'completed', 'needs_revision', 'locked')),
  safety_manager_name text,
  consigned_inspector_name text,
  safety_manager_signature_url text,
  consigned_inspector_signature_url text,
  special_note_summary text,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facility_no, inspection_month)
);

create table public.monthly_inspection_items (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.monthly_inspections(id) on delete cascade,
  facility_no text not null,
  equipment_no text not null,
  equipment_name text not null,
  equipment_type_name text,
  equipment_subtype_name text,
  equipment_location text,
  certification_no text,
  result_status text not null default 'GOOD' check (result_status in ('GOOD', 'CAUTION', 'REPAIR', 'STOP_USE')),
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inspection_id, equipment_no)
);

create table public.inspection_ledger_rows (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.monthly_inspections(id) on delete cascade,
  facility_no text not null,
  facility_name_snapshot text,
  road_address_snapshot text,
  inspection_date date not null,
  good_items text,
  caution_items text,
  repair_items text,
  stop_use_items text,
  special_notes text,
  safety_manager_name_snapshot text,
  consigned_inspector_name_snapshot text,
  safety_manager_signature_url text,
  consigned_inspector_signature_url text,
  rendered_at timestamptz not null default now()
);

create index facilities_search_idx on public.facilities using gin (
  to_tsvector('simple', coalesce(facility_no, '') || ' ' || coalesce(facility_name, '') || ' ' || coalesce(road_address, '') || ' ' || coalesce(lot_address, ''))
);
create index equipment_facility_active_idx on public.equipment (facility_no, is_active);
create index equipment_equipment_no_idx on public.equipment (equipment_no);
create index facility_legal_inspections_facility_no_idx on public.facility_legal_inspections (facility_no);
create index safety_educations_facility_no_idx on public.safety_educations (facility_no);
create index liability_insurances_facility_no_idx on public.liability_insurances (facility_no);
create index facility_managers_facility_no_idx on public.facility_managers (facility_no);
create index monthly_inspections_facility_month_idx on public.monthly_inspections (facility_no, inspection_month);
create index monthly_inspections_created_by_idx on public.monthly_inspections (created_by);
create index monthly_inspections_status_idx on public.monthly_inspections (status);
create index monthly_inspection_items_inspection_idx on public.monthly_inspection_items (inspection_id, result_status);
create index inspection_ledger_rows_inspection_idx on public.inspection_ledger_rows (inspection_id);

create or replace function app_private.current_user_role()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  app_role text;
begin
  select role
  into app_role
  from public.inspection_user_roles
  where user_id = auth.uid();

  if app_role is not null then
    return app_role;
  end if;

  if to_regclass('public.profiles') is not null then
    execute $query$
      select case role::text
        when 'super_admin' then 'ADMIN'
        when 'coach' then 'MANAGER'
        else 'VIEWER'
      end
      from public.profiles
      where id = $1
    $query$
    into app_role
    using auth.uid();
  end if;

  return coalesce(app_role, 'VIEWER');
end;
$$;

create or replace function app_private.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.current_user_role() = any(allowed_roles)
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_inspection_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inspection_user_roles (user_id, role)
  values (new.id, coalesce(new.raw_app_meta_data ->> 'inspection_role', 'VIEWER'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_for_inspection
after insert on auth.users
for each row execute function public.handle_new_inspection_user();

revoke execute on function public.handle_new_inspection_user() from public;
revoke execute on function public.handle_new_inspection_user() from anon;
revoke execute on function public.handle_new_inspection_user() from authenticated;

create trigger inspection_user_roles_set_updated_at before update on public.inspection_user_roles
for each row execute function public.set_updated_at();
create trigger facilities_set_updated_at before update on public.facilities
for each row execute function public.set_updated_at();
create trigger equipment_set_updated_at before update on public.equipment
for each row execute function public.set_updated_at();
create trigger facility_legal_inspections_set_updated_at before update on public.facility_legal_inspections
for each row execute function public.set_updated_at();
create trigger safety_educations_set_updated_at before update on public.safety_educations
for each row execute function public.set_updated_at();
create trigger liability_insurances_set_updated_at before update on public.liability_insurances
for each row execute function public.set_updated_at();
create trigger facility_managers_set_updated_at before update on public.facility_managers
for each row execute function public.set_updated_at();
create trigger monthly_inspections_set_updated_at before update on public.monthly_inspections
for each row execute function public.set_updated_at();
create trigger monthly_inspection_items_set_updated_at before update on public.monthly_inspection_items
for each row execute function public.set_updated_at();

alter table public.inspection_user_roles enable row level security;
alter table public.facilities enable row level security;
alter table public.equipment enable row level security;
alter table public.facility_legal_inspections enable row level security;
alter table public.safety_educations enable row level security;
alter table public.liability_insurances enable row level security;
alter table public.facility_managers enable row level security;
alter table public.monthly_inspections enable row level security;
alter table public.monthly_inspection_items enable row level security;
alter table public.inspection_ledger_rows enable row level security;

create policy "Inspection roles are readable by self and admins" on public.inspection_user_roles
for select to authenticated
using (user_id = auth.uid() or app_private.has_role(array['ADMIN']));

create policy "Inspection roles can be managed by admins" on public.inspection_user_roles
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

create policy "Users can keep their own inspection role row" on public.inspection_user_roles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and role = 'VIEWER');

create policy "Reference facility data is readable by authenticated users" on public.facilities
for select to authenticated
using (true);

create policy "Admins can manage facility data" on public.facilities
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

create policy "Equipment is readable by authenticated users" on public.equipment
for select to authenticated
using (true);

create policy "Admins can manage equipment" on public.equipment
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

create policy "Legal inspections are readable by authenticated users" on public.facility_legal_inspections
for select to authenticated
using (true);

create policy "Admins can manage legal inspections" on public.facility_legal_inspections
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

create policy "Safety educations are readable by authenticated users" on public.safety_educations
for select to authenticated
using (true);

create policy "Admins can manage safety educations" on public.safety_educations
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

create policy "Liability insurances are readable by authenticated users" on public.liability_insurances
for select to authenticated
using (true);

create policy "Admins can manage liability insurances" on public.liability_insurances
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

create policy "Facility managers are readable by authenticated users" on public.facility_managers
for select to authenticated
using (true);

create policy "Admins can manage facility managers" on public.facility_managers
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

create policy "Monthly inspections are readable by authenticated users" on public.monthly_inspections
for select to authenticated
using (true);

create policy "Operators can create monthly inspections" on public.monthly_inspections
for insert to authenticated
with check (app_private.has_role(array['ADMIN', 'MANAGER', 'INSPECTOR']));

create policy "Operators can update draft inspections" on public.monthly_inspections
for update to authenticated
using (
  app_private.has_role(array['ADMIN'])
  or (
    app_private.has_role(array['MANAGER', 'INSPECTOR'])
    and status in ('draft', 'needs_revision')
  )
)
with check (
  app_private.has_role(array['ADMIN'])
  or (
    app_private.has_role(array['MANAGER', 'INSPECTOR'])
    and status in ('draft', 'needs_revision', 'completed')
  )
);

create policy "Admins can delete monthly inspections" on public.monthly_inspections
for delete to authenticated
using (app_private.has_role(array['ADMIN']));

create policy "Inspection items are readable by authenticated users" on public.monthly_inspection_items
for select to authenticated
using (true);

create policy "Operators can create inspection items" on public.monthly_inspection_items
for insert to authenticated
with check (
  app_private.has_role(array['ADMIN', 'MANAGER', 'INSPECTOR'])
  and exists (
    select 1 from public.monthly_inspections
    where monthly_inspections.id = monthly_inspection_items.inspection_id
      and monthly_inspections.status in ('draft', 'needs_revision')
  )
);

create policy "Operators can update draft inspection items" on public.monthly_inspection_items
for update to authenticated
using (
  app_private.has_role(array['ADMIN'])
  or (
    app_private.has_role(array['MANAGER', 'INSPECTOR'])
    and exists (
      select 1 from public.monthly_inspections
      where monthly_inspections.id = monthly_inspection_items.inspection_id
        and monthly_inspections.status in ('draft', 'needs_revision')
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
        and monthly_inspections.status in ('draft', 'needs_revision')
    )
  )
);

create policy "Admins can delete inspection items" on public.monthly_inspection_items
for delete to authenticated
using (app_private.has_role(array['ADMIN']));

create policy "Ledger rows are readable by authenticated users" on public.inspection_ledger_rows
for select to authenticated
using (true);

create policy "Operators can create ledger rows" on public.inspection_ledger_rows
for insert to authenticated
with check (app_private.has_role(array['ADMIN', 'MANAGER', 'INSPECTOR']));

create policy "Admins can manage ledger rows" on public.inspection_ledger_rows
for all to authenticated
using (app_private.has_role(array['ADMIN']))
with check (app_private.has_role(array['ADMIN']));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('signatures', 'signatures', false, 1048576, array['image/png'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can read signatures" on storage.objects
for select to authenticated
using (bucket_id = 'signatures');

create policy "Authenticated users can upload own signatures" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'signatures'
  and owner = auth.uid()
);

create policy "Authenticated users can update own signatures" on storage.objects
for update to authenticated
using (
  bucket_id = 'signatures'
  and owner = auth.uid()
)
with check (
  bucket_id = 'signatures'
  and owner = auth.uid()
);

create policy "Admins can delete signatures" on storage.objects
for delete to authenticated
using (
  bucket_id = 'signatures'
  and app_private.has_role(array['ADMIN'])
);
