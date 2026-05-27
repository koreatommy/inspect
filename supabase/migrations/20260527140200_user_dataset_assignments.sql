create table public.user_dataset_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dataset_id uuid not null references public.facility_datasets(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, dataset_id)
);

create index if not exists user_dataset_assignments_user_idx
  on public.user_dataset_assignments (user_id);
create index if not exists user_dataset_assignments_dataset_idx
  on public.user_dataset_assignments (dataset_id);

comment on table public.user_dataset_assignments is
  '사용자 ↔ 데이터셋 할당. ADMIN을 제외한 모든 역할의 시설/점검 접근 범위를 결정한다.';
comment on column public.user_dataset_assignments.assigned_by is
  '할당을 수행한 관리자 (auth.users.id)';

alter table public.user_dataset_assignments enable row level security;

-- Phase 1 임시 정책 (Phase 5에서 ADMIN CRUD + 본인 SELECT로 교체)
create policy "User dataset assignments are readable by authenticated users"
  on public.user_dataset_assignments for select
  to authenticated
  using (true);
