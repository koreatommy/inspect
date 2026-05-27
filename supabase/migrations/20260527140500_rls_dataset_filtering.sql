-- Phase 5 — RLS를 데이터셋 기반으로 일괄 교체한다.
-- 핵심 원칙:
--  1. 헬퍼 함수 두 개로 정책을 단순화: user_has_dataset_access(uuid), user_has_facility_access(text)
--  2. ADMIN은 두 헬퍼 모두 true 통과 → 기존 "Admins can manage ..." ALL 정책과 함께 전체 접근.
--  3. 비-ADMIN은 active 데이터셋 + 할당 + 활성 멤버십 조합으로만 통과.
--  4. monthly_inspections는 dataset_id 직접 매칭, items/ledger는 부모 inspection을 통한 간접 매칭.

-- ============================================================
-- 1) 헬퍼 함수
-- ============================================================

create or replace function app_private.user_has_dataset_access(
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

create or replace function app_private.user_has_facility_access(
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

comment on function app_private.user_has_dataset_access(uuid) is
  'ADMIN 통과 또는 현재 사용자가 할당받은 active dataset인지 검사';
comment on function app_private.user_has_facility_access(text) is
  'ADMIN 통과 또는 현재 사용자가 활성 멤버십을 통해 접근 가능한 시설인지 검사';

-- ============================================================
-- 2) facilities + 참조 5종 SELECT 정책 (멤버십 기반)
-- ============================================================

drop policy if exists "Reference facility data is readable by authenticated users"
  on public.facilities;
create policy "Users read facilities via dataset membership"
  on public.facilities for select
  to authenticated
  using (app_private.user_has_facility_access(facility_no));

drop policy if exists "Equipment is readable by authenticated users"
  on public.equipment;
create policy "Users read equipment via dataset membership"
  on public.equipment for select
  to authenticated
  using (app_private.user_has_facility_access(facility_no));

drop policy if exists "Legal inspections are readable by authenticated users"
  on public.facility_legal_inspections;
create policy "Users read legal inspections via dataset membership"
  on public.facility_legal_inspections for select
  to authenticated
  using (app_private.user_has_facility_access(facility_no));

drop policy if exists "Safety educations are readable by authenticated users"
  on public.safety_educations;
create policy "Users read safety educations via dataset membership"
  on public.safety_educations for select
  to authenticated
  using (app_private.user_has_facility_access(facility_no));

drop policy if exists "Liability insurances are readable by authenticated users"
  on public.liability_insurances;
create policy "Users read liability insurances via dataset membership"
  on public.liability_insurances for select
  to authenticated
  using (app_private.user_has_facility_access(facility_no));

drop policy if exists "Facility managers are readable by authenticated users"
  on public.facility_managers;
create policy "Users read facility managers via dataset membership"
  on public.facility_managers for select
  to authenticated
  using (app_private.user_has_facility_access(facility_no));

-- ============================================================
-- 3) monthly_inspections — SELECT/INSERT/UPDATE/DELETE 정책 (dataset_id 직접 매칭)
-- ============================================================

drop policy if exists "Monthly inspections are readable by authenticated users"
  on public.monthly_inspections;
create policy "Users read monthly inspections by dataset"
  on public.monthly_inspections for select
  to authenticated
  using (app_private.user_has_dataset_access(dataset_id));

-- 기존 operator 정책에 dataset 검증 추가
drop policy if exists "Operators can create monthly inspections"
  on public.monthly_inspections;
create policy "Operators can create monthly inspections"
  on public.monthly_inspections for insert
  to authenticated
  with check (
    app_private.has_role(array['ADMIN'::text, 'MANAGER'::text, 'INSPECTOR'::text])
    and app_private.user_has_dataset_access(dataset_id)
  );

drop policy if exists "Operators can update monthly inspections"
  on public.monthly_inspections;
create policy "Operators can update monthly inspections"
  on public.monthly_inspections for update
  to authenticated
  using (
    app_private.user_has_dataset_access(dataset_id)
    and (
      app_private.has_role(array['ADMIN'::text])
      or (
        app_private.has_role(array['MANAGER'::text, 'INSPECTOR'::text])
        and status = any (array['draft'::text, 'needs_revision'::text, 'completed'::text])
      )
    )
  )
  with check (
    app_private.user_has_dataset_access(dataset_id)
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
    and app_private.user_has_dataset_access(dataset_id)
  );

-- ============================================================
-- 4) monthly_inspection_items + inspection_ledger_rows
--    부모 inspection의 dataset_id 정책을 상속
-- ============================================================

drop policy if exists "Inspection items are readable by authenticated users"
  on public.monthly_inspection_items;
create policy "Users read inspection items by parent dataset"
  on public.monthly_inspection_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = monthly_inspection_items.inspection_id
        and app_private.user_has_dataset_access(mi.dataset_id)
    )
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
        and app_private.user_has_dataset_access(mi.dataset_id)
    )
  );

drop policy if exists "Operators can update inspection items"
  on public.monthly_inspection_items;
create policy "Operators can update inspection items"
  on public.monthly_inspection_items for update
  to authenticated
  using (
    app_private.has_role(array['ADMIN'::text])
    or (
      app_private.has_role(array['MANAGER'::text, 'INSPECTOR'::text])
      and exists (
        select 1
        from public.monthly_inspections mi
        where mi.id = monthly_inspection_items.inspection_id
          and mi.status = any (array['draft'::text, 'needs_revision'::text, 'completed'::text])
          and app_private.user_has_dataset_access(mi.dataset_id)
      )
    )
  )
  with check (
    app_private.has_role(array['ADMIN'::text])
    or (
      app_private.has_role(array['MANAGER'::text, 'INSPECTOR'::text])
      and exists (
        select 1
        from public.monthly_inspections mi
        where mi.id = monthly_inspection_items.inspection_id
          and mi.status = any (array['draft'::text, 'needs_revision'::text, 'completed'::text])
          and app_private.user_has_dataset_access(mi.dataset_id)
      )
    )
  );

drop policy if exists "Operators can delete inspection items"
  on public.monthly_inspection_items;
create policy "Operators can delete inspection items"
  on public.monthly_inspection_items for delete
  to authenticated
  using (
    app_private.has_role(array['ADMIN'::text, 'MANAGER'::text, 'INSPECTOR'::text])
    and exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = monthly_inspection_items.inspection_id
        and app_private.user_has_dataset_access(mi.dataset_id)
    )
  );

drop policy if exists "Ledger rows are readable by authenticated users"
  on public.inspection_ledger_rows;
create policy "Users read ledger rows by parent dataset"
  on public.inspection_ledger_rows for select
  to authenticated
  using (
    exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = inspection_ledger_rows.inspection_id
        and app_private.user_has_dataset_access(mi.dataset_id)
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
        and app_private.user_has_dataset_access(mi.dataset_id)
    )
  );

drop policy if exists "Operators can delete ledger rows"
  on public.inspection_ledger_rows;
create policy "Operators can delete ledger rows"
  on public.inspection_ledger_rows for delete
  to authenticated
  using (
    app_private.has_role(array['ADMIN'::text, 'MANAGER'::text, 'INSPECTOR'::text])
    and exists (
      select 1
      from public.monthly_inspections mi
      where mi.id = inspection_ledger_rows.inspection_id
        and app_private.user_has_dataset_access(mi.dataset_id)
    )
  );

-- ============================================================
-- 5) 신규 3테이블 RLS 재정의
-- ============================================================

-- facility_datasets — ADMIN 전체, 비ADMIN은 할당된 id만 SELECT
drop policy if exists "Facility datasets are readable by authenticated users"
  on public.facility_datasets;
create policy "Users read accessible facility datasets"
  on public.facility_datasets for select
  to authenticated
  using (
    app_private.has_role(array['ADMIN'::text])
    or exists (
      select 1 from public.user_dataset_assignments uda
      where uda.user_id = auth.uid()
        and uda.dataset_id = facility_datasets.id
    )
  );

create policy "Admins manage facility datasets"
  on public.facility_datasets for all
  to authenticated
  using (app_private.has_role(array['ADMIN'::text]))
  with check (app_private.has_role(array['ADMIN'::text]));

-- facility_dataset_memberships — ADMIN 전체, 비ADMIN은 할당된 dataset 범위
drop policy if exists "Facility dataset memberships are readable by authenticated users"
  on public.facility_dataset_memberships;
create policy "Users read memberships within accessible datasets"
  on public.facility_dataset_memberships for select
  to authenticated
  using (
    app_private.has_role(array['ADMIN'::text])
    or exists (
      select 1 from public.user_dataset_assignments uda
      where uda.user_id = auth.uid()
        and uda.dataset_id = facility_dataset_memberships.dataset_id
    )
  );

create policy "Admins manage memberships"
  on public.facility_dataset_memberships for all
  to authenticated
  using (app_private.has_role(array['ADMIN'::text]))
  with check (app_private.has_role(array['ADMIN'::text]));

-- user_dataset_assignments — ADMIN CRUD, 비ADMIN은 본인 SELECT만
drop policy if exists "User dataset assignments are readable by authenticated users"
  on public.user_dataset_assignments;
create policy "Users read own assignments admins read all"
  on public.user_dataset_assignments for select
  to authenticated
  using (
    app_private.has_role(array['ADMIN'::text])
    or user_id = auth.uid()
  );

create policy "Admins manage user dataset assignments"
  on public.user_dataset_assignments for all
  to authenticated
  using (app_private.has_role(array['ADMIN'::text]))
  with check (app_private.has_role(array['ADMIN'::text]));
