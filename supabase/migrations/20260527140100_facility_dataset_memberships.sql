create table public.facility_dataset_memberships (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references public.facilities(facility_no)
    on update cascade on delete cascade,
  dataset_id uuid not null references public.facility_datasets(id)
    on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facility_no, dataset_id)
);

create index if not exists facility_dataset_memberships_dataset_idx
  on public.facility_dataset_memberships (dataset_id);
create index if not exists facility_dataset_memberships_facility_idx
  on public.facility_dataset_memberships (facility_no);
create index if not exists facility_dataset_memberships_dataset_active_idx
  on public.facility_dataset_memberships (dataset_id, is_active);

comment on table public.facility_dataset_memberships is
  '시설 ↔ 데이터셋 M:N 매핑. is_active로 데이터셋별 스냅샷 포함 여부를 표현한다.';
comment on column public.facility_dataset_memberships.is_active is
  '해당 데이터셋 최신 업로드 스냅샷에 포함되었는지 여부 (false는 이력 보존용 비활성)';

alter table public.facility_dataset_memberships enable row level security;

-- Phase 1 임시 정책 (Phase 5에서 dataset 기반으로 교체)
create policy "Facility dataset memberships are readable by authenticated users"
  on public.facility_dataset_memberships for select
  to authenticated
  using (true);
