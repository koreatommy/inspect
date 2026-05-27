create table public.dataset_audit_log (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid references public.facility_datasets(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (
    action in (
      'upload',
      'archive',
      'activate',
      'user_assignments_sync'
    )
  ),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index dataset_audit_log_dataset_created_idx
  on public.dataset_audit_log (dataset_id, created_at desc);

create index dataset_audit_log_created_at_idx
  on public.dataset_audit_log (created_at desc);

comment on table public.dataset_audit_log is
  '데이터셋 업로드·보관/활성·사용자 할당 변경 감사 로그.';

alter table public.dataset_audit_log enable row level security;

create policy "Admins manage dataset_audit_log"
  on public.dataset_audit_log
  for all
  to authenticated
  using (app_private.has_role(array['ADMIN'::text]))
  with check (app_private.has_role(array['ADMIN'::text]));
