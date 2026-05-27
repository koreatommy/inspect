create table public.facility_datasets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  source_file text,
  uploaded_by uuid references auth.users(id) on delete set null,
  facility_count integer not null default 0,
  status text not null default 'active'
    check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists facility_datasets_status_idx
  on public.facility_datasets (status);
create index if not exists facility_datasets_created_at_idx
  on public.facility_datasets (created_at desc);

comment on table public.facility_datasets is '시설 JSON 업로드 단위. 사용자 접근 제어의 경계가 된다.';
comment on column public.facility_datasets.name is '데이터셋 표시명 (예: 서천군 학교 2026)';
comment on column public.facility_datasets.source_file is '마지막 업로드 원본 파일명';
comment on column public.facility_datasets.uploaded_by is '마지막 업로드 수행자 (auth.users.id)';
comment on column public.facility_datasets.facility_count is '활성 멤버십 기준 시설 수 (비정규화, 업로드 후 갱신)';
comment on column public.facility_datasets.status is 'active | archived. archived는 신규 업로드/점검 생성 차단';

alter table public.facility_datasets enable row level security;

-- Phase 1 임시 정책: 기존 흐름 보존을 위해 인증 사용자 전체 select 허용.
-- Phase 5에서 ADMIN 전체 + 비ADMIN은 user_dataset_assignments 매칭으로 교체한다.
create policy "Facility datasets are readable by authenticated users"
  on public.facility_datasets for select
  to authenticated
  using (true);
