-- Phase 1 단계에서는 dataset_id 컬럼만 nullable + FK로 추가한다.
-- Phase 2 백필 후 NOT NULL 전환과 (facility_no, inspection_month, dataset_id) UNIQUE 교체를
-- 별도 마이그레이션에서 수행한다 (기존 UNIQUE 제약을 깨지 않은 채 백필 가능하도록 분리).

alter table public.monthly_inspections
  add column if not exists dataset_id uuid
    references public.facility_datasets(id) on delete restrict;

comment on column public.monthly_inspections.dataset_id is
  '점검이 속한 데이터셋. Phase 2 백필 후 NOT NULL 전환 + (facility_no, inspection_month, dataset_id) UNIQUE 교체 예정.';

create index if not exists monthly_inspections_dataset_id_idx
  on public.monthly_inspections (dataset_id);
create index if not exists monthly_inspections_dataset_month_idx
  on public.monthly_inspections (dataset_id, inspection_month);
