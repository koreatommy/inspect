alter table public.inspection_user_roles
  add column if not exists display_name text,
  add column if not exists phone text;

comment on column public.inspection_user_roles.display_name is '사용자 표시 이름';
comment on column public.inspection_user_roles.phone is '휴대전화 번호 (숫자만, 예: 01012345678)';

create or replace function public.handle_new_inspection_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inspection_user_roles (user_id, role, display_name, phone)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'inspection_role', 'VIEWER'),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
