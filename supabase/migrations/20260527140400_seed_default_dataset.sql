-- Phase 2 백필 — 구조안 A 기본 데이터셋 생성 + 멤버십/할당/점검 dataset_id 채움 + 검증 +
-- monthly_inspections.dataset_id NOT NULL 전환 + (facility_no, inspection_month, dataset_id)
-- UNIQUE 교체.
--
-- 모든 변경은 단일 마이그레이션 트랜잭션 안에서 수행되어, 검증 실패 시 자동 롤백된다.

do $$
declare
  default_dataset_id uuid;
  null_count integer;
  unique_dup integer;
  pre_inspections_count integer;
  post_inspections_count integer;
begin
  -- 0) 점검 건수 사전 스냅샷 (백필 전후 불변 확인용)
  select count(*) into pre_inspections_count from public.monthly_inspections;

  -- 1) 기본 데이터셋 (idempotent — 이름 기준 한 건)
  select id into default_dataset_id
  from public.facility_datasets
  where name = '한국놀이시설연구원(60)';

  if default_dataset_id is null then
    insert into public.facility_datasets (name, description, status, facility_count)
    values (
      '한국놀이시설연구원(60)',
      '구조안 A 마이그레이션 기본 데이터셋 (Phase 2 백필)',
      'active',
      0
    )
    returning id into default_dataset_id;
  end if;

  -- 2) 기존 시설 -> 기본 데이터셋 멤버십 (is_active는 facilities.is_active를 따른다)
  insert into public.facility_dataset_memberships (facility_no, dataset_id, is_active)
  select f.facility_no, default_dataset_id, coalesce(f.is_active, true)
  from public.facilities f
  on conflict (facility_no, dataset_id) do nothing;

  -- 3) 비-ADMIN 사용자 -> 기본 데이터셋 할당
  insert into public.user_dataset_assignments (user_id, dataset_id)
  select ur.user_id, default_dataset_id
  from public.inspection_user_roles ur
  where ur.role <> 'ADMIN'
  on conflict (user_id, dataset_id) do nothing;

  -- 4) monthly_inspections.dataset_id 백필 (NULL만 갱신)
  update public.monthly_inspections
  set dataset_id = default_dataset_id
  where dataset_id is null;

  -- 5) 비정규화된 facility_count 갱신 (활성 멤버십 기준)
  update public.facility_datasets fd
  set facility_count = (
    select count(*)
    from public.facility_dataset_memberships m
    where m.dataset_id = fd.id and m.is_active = true
  ),
  updated_at = now()
  where fd.id = default_dataset_id;

  -- 6) 검증 — dataset_id 누락 0
  select count(*) into null_count
  from public.monthly_inspections
  where dataset_id is null;

  if null_count > 0 then
    raise exception 'monthly_inspections.dataset_id NULL count is %, must be 0', null_count;
  end if;

  -- 7) 검증 — 새 UNIQUE 키에 충돌이 없는지
  select count(*) into unique_dup
  from (
    select facility_no, inspection_month, dataset_id
    from public.monthly_inspections
    group by 1, 2, 3
    having count(*) > 1
  ) dup;

  if unique_dup > 0 then
    raise exception
      'monthly_inspections에 (facility_no, inspection_month, dataset_id) 중복 % 건. UNIQUE 교체 불가',
      unique_dup;
  end if;

  -- 8) 검증 — 점검 건수 불변
  select count(*) into post_inspections_count from public.monthly_inspections;
  if post_inspections_count <> pre_inspections_count then
    raise exception
      'monthly_inspections row count changed: pre=%, post=%',
      pre_inspections_count, post_inspections_count;
  end if;
end$$;

-- 9) NOT NULL 전환
alter table public.monthly_inspections
  alter column dataset_id set not null;

-- 10) 기존 UNIQUE(facility_no, inspection_month) 제거 (자동 생성 이름)
alter table public.monthly_inspections
  drop constraint if exists monthly_inspections_facility_no_inspection_month_key;

-- 11) 새 UNIQUE(facility_no, inspection_month, dataset_id)
alter table public.monthly_inspections
  add constraint monthly_inspections_facility_month_dataset_uniq
    unique (facility_no, inspection_month, dataset_id);
