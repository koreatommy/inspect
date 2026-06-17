-- 기존의 너무 넓은 insert 정책 제거 후 ADMIN 역할만 삽입 가능하도록 수정

drop policy if exists "Service role can insert notifications" on public.notifications;

-- ADMIN 역할만 알림 삽입 가능 (다른 사용자에게 발송)
create policy "Admins can insert notifications"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.inspection_user_roles
      where user_id = auth.uid()
        and role = 'ADMIN'
    )
  );
