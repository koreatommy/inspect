alter table public.inspection_user_roles
  add column if not exists organization text;

update public.inspection_user_roles
set organization = '미지정'
where organization is null or btrim(organization) = '';

alter table public.inspection_user_roles
  alter column organization set not null;

comment on column public.inspection_user_roles.organization is '사용자 소속';

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
    organization,
    status
  )
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'inspection_role', 'VIEWER'),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    coalesce(nullif(trim(coalesce(new.raw_user_meta_data ->> 'organization', '')), ''), '미지정'),
    'active'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop policy if exists "Users can keep their own inspection role row" on public.inspection_user_roles;

create policy "Users can keep their own inspection role row" on public.inspection_user_roles
for update to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and role = (
    select r.role
    from public.inspection_user_roles r
    where r.user_id = auth.uid()
  )
);
