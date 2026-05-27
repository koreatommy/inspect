create table public.facility_dataset_uploads (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.facility_datasets(id) on delete cascade,
  source_file text,
  uploaded_by uuid references auth.users(id) on delete set null,
  total_count integer not null default 0,
  success_count integer not null default 0,
  failed_count integer not null default 0,
  result_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index facility_dataset_uploads_dataset_created_idx
  on public.facility_dataset_uploads (dataset_id, created_at desc);

comment on table public.facility_dataset_uploads is
  '데이터셋별 JSON 업로드 실행 이력(건수·요약).';

alter table public.facility_dataset_uploads enable row level security;

create policy "Admins manage facility_dataset_uploads"
  on public.facility_dataset_uploads
  for all
  to authenticated
  using (app_private.has_role(array['ADMIN'::text]))
  with check (app_private.has_role(array['ADMIN'::text]));
