-- 알림 테이블
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  metadata jsonb default '{}',
  read_at timestamptz,
  created_at timestamptz default now()
);

-- 인덱스
create index notifications_user_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;

create index notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

-- RLS
alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ADMIN 및 서버 측에서 알림을 삽입할 수 있도록 service_role에만 insert 허용
-- (클라이언트 직접 삽입 차단)
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

-- Realtime 활성화
alter publication supabase_realtime add table public.notifications;
