alter table public.inspection_user_roles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended')),
  add column if not exists suspended_at timestamptz,
  add column if not exists suspended_until timestamptz,
  add column if not exists suspend_reason text,
  add column if not exists suspended_by uuid references auth.users (id) on delete set null;

comment on column public.inspection_user_roles.status is '계정 상태: active | suspended';
comment on column public.inspection_user_roles.suspended_at is '정지 처리 시각';
comment on column public.inspection_user_roles.suspended_until is '자동 해제 예정 시각 (null이면 수동 해제)';
comment on column public.inspection_user_roles.suspend_reason is '정지 사유 (로그인 안내용)';
comment on column public.inspection_user_roles.suspended_by is '정지 처리한 관리자 user_id';

update public.inspection_user_roles
set status = 'active'
where status is distinct from 'active';

create or replace function app_private.user_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select
        r.status = 'active'
        or (
          r.status = 'suspended'
          and r.suspended_until is not null
          and r.suspended_until <= now()
        )
      from public.inspection_user_roles r
      where r.user_id = auth.uid()
    ),
    false
  )
$$;

create or replace function app_private.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.user_is_active()
    and app_private.current_user_role() = any (allowed_roles)
$$;

create or replace function public.handle_new_inspection_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inspection_user_roles (
    user_id,
    role,
    display_name,
    phone,
    status
  )
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'inspection_role', 'VIEWER'),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    'active'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
