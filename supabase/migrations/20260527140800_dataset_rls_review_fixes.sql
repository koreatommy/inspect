-- 검토 후속: SEC-01 임시 정책 제거, POL-01 archived 조회, SEC-02 정지 계정 SELECT 차단

-- SEC-01 — DROP 오타로 남을 수 있는 permissive 정책 명시 제거
drop policy if exists "Facility dataset memberships are readable by authenticated user"
  on public.facility_dataset_memberships;
drop policy if exists "Facility dataset memberships are readable by authenticated users"
  on public.facility_dataset_memberships;

-- 읽기: 할당된 데이터셋(active/archived 모두), 기존 점검·이력 조회
create or replace function app_private.user_has_dataset_read_access(
  target_dataset_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when app_private.has_role(array['ADMIN'::text]) then true
    when target_dataset_id is null then false
    when not app_private.user_is_active() then false
    else exists (
      select 1
      from public.user_dataset_assignments uda
      where uda.user_id = auth.uid()
        and uda.dataset_id = target_dataset_id
    )
  end
$$;

-- 쓰기: active 데이터셋 + 할당 + 활성 계정
create or replace function app_private.user_has_dataset_write_access(
  target_dataset_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when app_private.has_role(array['ADMIN'::text]) then true
    when target_dataset_id is null then false
    when not app_private.user_is_active() then false
    else exists (
      select 1
      from public.user_dataset_assignments uda
      join public.facility_datasets fd on fd.id = uda.dataset_id
      where uda.user_id = auth.uid()
        and uda.dataset_id = target_dataset_id
        and fd.status = 'active'
    )
  end
$$;

-- 시설 읽기: 할당 데이터셋의 멤버십(비활성 멤버십·archived 포함), 이력 조회
create or replace function app_private.user_has_facility_read_access(
  target_facility_no text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when app_private.has_role(array['ADMIN'::text]) then true
    when target_facility_no is null then false
    when not app_private.user_is_active() then false
    else exists (
      select 1
      from public.facility_dataset_memberships m
      join public.user_dataset_assignments uda on uda.dataset_id = m.dataset_id
      where m.facility_no = target_facility_no
        and uda.user_id = auth.uid()
    )
  end
$$;

-- 시설 쓰기 경로(업로드·신규 점검 대상): 활성 멤버십 + active 데이터셋
create or replace function app_private.user_has_facility_write_access(
  target_facility_no text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when app_private.has_role(array['ADMIN'::text]) then true
    when target_facility_no is null then false
    when not app_private.user_is_active() then false
    else exists (
      select 1
      from public.facility_dataset_memberships m
      join public.user_dataset_assignments uda on uda.dataset_id = m.dataset_id
      join public.facility_datasets fd on fd.id = m.dataset_id
      where m.facility_no = target_facility_no
        and m.is_active = true
        and uda.user_id = auth.uid()
        and fd.status = 'active'
    )
  end
$$;

comment on function app_private.user_has_dataset_read_access(uuid) is
  'ADMIN 또는 할당된 dataset(archived 포함) 조회, 정지 계정 제외';
comment on function app_private.user_has_dataset_write_access(uuid) is
  'ADMIN 또는 할당된 active dataset 쓰기, 정지 계정 제외';
comment on function app_private.user_has_facility_read_access(text) is
  'ADMIN 또는 할당 dataset 멤버십으로 시설 조회(비활성 멤버십·archived 포함)';
comment on function app_private.user_has_facility_write_access(text) is
  'ADMIN 또는 활성 멤버십·active dataset 시설 쓰기';

-- 하위 호환: 기존 이름은 쓰기 전용으로 유지(INSERT/UPDATE 정책)
create or replace function app_private.user_has_dataset_access(
  target_dataset_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.user_has_dataset_write_access(target_dataset_id)
$$;

create or replace function app_private.user_has_facility_access(
  target_facility_no text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.user_has_facility_write_access(target_facility_no)
$$;

comment on function app_private.user_has_dataset_access(uuid) is
  'user_has_dataset_write_access 별칭';
comment on function app_private.user_has_facility_access(text) is
  'user_has_facility_write_access 별칭';

-- SELECT 정책을 read 헬퍼로 교체
drop policy if exists "Users read facilities via dataset membership"
  on public.facilities;
create policy "Users read facilities via dataset membership"
  on public.facilities for select
  to authenticated
  using (app_private.user_has_facility_read_access(facility_no));

drop policy if exists "Users read equipment via dataset membership"
  on public.equipment;
create policy "Users read equipment via dataset membership"
  on public.equipment for select
  to authenticated
  using (app_private.user_has_facility_read_access(facility_no));

drop policy if exists "Users read legal inspections via dataset membership"
  on public.facility_legal_inspections;
create policy "Users read legal inspections via dataset membership"
  on public.facility_legal_inspections for select
  to authenticated
  using (app_private.user_has_facility_read_access(facility_no));

drop policy if exists "Users read safety educations via dataset membership"
  on public.safety_educations;
create policy "Users read safety educations via dataset membership"
  on public.safety_educations for select
  to authenticated
  using (app_private.user_has_facility_read_access(facility_no));

drop policy if exists "Users read liability insurances via dataset membership"
  on public.liability_insurances;
create policy "Users read liability insurances via dataset membership"
  on public.liability_insurances for select
  to authenticated
  using (app_private.user_has_facility_read_access(facility_no));

drop policy if exists "Users read facility managers via dataset membership"
  on public.facility_managers;
create policy "Users read facility managers via dataset membership"
  on public.facility_managers for select
  to authenticated
  using (app_private.user_has_facility_read_access(facility_no));

drop policy if exists "Users read monthly inspections by dataset"
  on public.monthly_inspections;
create policy "Users read monthly inspections by dataset"
  on public.monthly_inspections for select
  to authenticated
  using (app_private.user_has_dataset_read_access(dataset_id));

drop policy if exists "Users read inspection items by parent dataset"
  on public.monthly_inspection_items;
create policy "Users read inspection items by parent dataset"
  on public.monthly_inspection_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = monthly_inspection_items.inspection_id
        and app_private.user_has_dataset_read_access(mi.dataset_id)
    )
  );

drop policy if exists "Users read ledger rows by parent dataset"
  on public.inspection_ledger_rows;
create policy "Users read ledger rows by parent dataset"
  on public.inspection_ledger_rows for select
  to authenticated
  using (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = inspection_ledger_rows.inspection_id
        and app_private.user_has_dataset_read_access(mi.dataset_id)
    )
  );

-- CUD 정책: write 헬퍼로 명시적 교체
drop policy if exists "Operators can create monthly inspections"
  on public.monthly_inspections;
create policy "Operators can create monthly inspections"
  on public.monthly_inspections for insert
  to authenticated
  with check (
    app_private.has_role(array['ADMIN'::text, 'MANAGER'::text, 'INSPECTOR'::text])
    and app_private.user_has_dataset_write_access(dataset_id)
  );

drop policy if exists "Operators can update monthly inspections"
  on public.monthly_inspections;
create policy "Operators can update monthly inspections"
  on public.monthly_inspections for update
  to authenticated
  using (
    app_private.user_has_dataset_write_access(dataset_id)
    and (
      app_private.has_role(array['ADMIN'::text])
      or (
        app_private.has_role(array['MANAGER'::text, 'INSPECTOR'::text])
        and status = any (array['draft'::text, 'needs_revision'::text, 'completed'::text])
      )
    )
  )
  with check (
    app_private.user_has_dataset_write_access(dataset_id)
    and (
      app_private.has_role(array['ADMIN'::text])
      or (
        app_private.has_role(array['MANAGER'::text, 'INSPECTOR'::text])
        and status = any (array['draft'::text, 'needs_revision'::text, 'completed'::text])
      )
    )
  );

drop policy if exists "Operators can delete monthly inspections"
  on public.monthly_inspections;
create policy "Operators can delete monthly inspections"
  on public.monthly_inspections for delete
  to authenticated
  using (
    app_private.has_role(array['ADMIN'::text, 'MANAGER'::text, 'INSPECTOR'::text])
    and app_private.user_has_dataset_write_access(dataset_id)
  );

drop policy if exists "Operators can create inspection items"
  on public.monthly_inspection_items;
create policy "Operators can create inspection items"
  on public.monthly_inspection_items for insert
  to authenticated
  with check (
    app_private.has_role(array['ADMIN'::text, 'MANAGER'::text, 'INSPECTOR'::text])
    and exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = monthly_inspection_items.inspection_id
        and mi.status = any (array['draft'::text, 'needs_revision'::text])
        and app_private.user_has_dataset_write_access(mi.dataset_id)
    )
  );

drop policy if exists "Operators can update inspection items"
  on public.monthly_inspection_items;
create policy "Operators can update inspection items"
  on public.monthly_inspection_items for update
  to authenticated
  using (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = monthly_inspection_items.inspection_id
        and mi.status = any (array['draft'::text, 'needs_revision'::text])
        and app_private.user_has_dataset_write_access(mi.dataset_id)
    )
  )
  with check (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = monthly_inspection_items.inspection_id
        and mi.status = any (array['draft'::text, 'needs_revision'::text])
        and app_private.user_has_dataset_write_access(mi.dataset_id)
    )
  );

drop policy if exists "Operators can delete inspection items"
  on public.monthly_inspection_items;
create policy "Operators can delete inspection items"
  on public.monthly_inspection_items for delete
  to authenticated
  using (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = monthly_inspection_items.inspection_id
        and app_private.user_has_dataset_write_access(mi.dataset_id)
    )
  );

drop policy if exists "Operators can create ledger rows"
  on public.inspection_ledger_rows;
create policy "Operators can create ledger rows"
  on public.inspection_ledger_rows for insert
  to authenticated
  with check (
    app_private.has_role(array['ADMIN'::text, 'MANAGER'::text, 'INSPECTOR'::text])
    and exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = inspection_ledger_rows.inspection_id
        and app_private.user_has_dataset_write_access(mi.dataset_id)
    )
  );

drop policy if exists "Operators can delete ledger rows"
  on public.inspection_ledger_rows;
create policy "Operators can delete ledger rows"
  on public.inspection_ledger_rows for delete
  to authenticated
  using (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = inspection_ledger_rows.inspection_id
        and app_private.user_has_dataset_write_access(mi.dataset_id)
    )
  );
